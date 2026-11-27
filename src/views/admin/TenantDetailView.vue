<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTenantsStore } from '../../stores/tenants'
import { adminApi } from '../../services/api'

const route = useRoute()
const router = useRouter()
const tenantsStore = useTenantsStore()

const tenant = computed(() => tenantsStore.currentTenant)
const billing = computed(() => tenant.value?.billing || {})
const stats = computed(() => tenant.value?.stats || {})

const editingName = ref(false)
const nameDraft = ref('')
const busy = ref(false)
const showKey = ref(false)
const copied = ref(null)
const notice = ref(null)

const showEditUserModal = ref(false)
const editingUser = ref(null)
const editUserForm = ref({ name: '', email: '', password: '' })

const load = async () => {
  const result = await tenantsStore.fetchTenant(route.params.id)
  if (result.success) nameDraft.value = result.tenant.name
}

onMounted(async () => {
  await load()
  await tenantsStore.fetchTenantUsers(route.params.id)
})

// --- Formato ---
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—')
const fmtMoney = (amount, currency = 'USD') => {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount) } catch { return `${currency} ${amount}` }
}
const daysUntil = (d) => (d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : null)
const timeAgo = (d) => {
  if (!d) return 'Nunca'
  const mins = Math.round((Date.now() - new Date(d).getTime()) / 60000)
  if (mins < 60) return `hace ${Math.max(1, mins)} min`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.round(hours / 24)
  return days < 30 ? `hace ${days} ${days === 1 ? 'día' : 'días'}` : fmtDate(d)
}

// Plan efectivo (un trial o pago vencido se muestra como vencido)
const plan = computed(() => {
  const b = billing.value
  if (b.status === 'lifetime') return 'lifetime'
  if (b.status === 'trial') return daysUntil(b.trialEndsAt) > 0 ? 'trial' : 'expired'
  if (b.status === 'active') return !b.expiresAt || daysUntil(b.expiresAt) > 0 ? 'active' : 'expired'
  return 'expired'
})

const PLAN_META = {
  trial: { label: 'En prueba', cls: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' },
  active: { label: 'Pagando', cls: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
  lifetime: { label: 'Lifetime', cls: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
  expired: { label: 'Vencido', cls: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' }
}

const planDetail = computed(() => {
  const b = billing.value
  if (plan.value === 'trial') { const d = daysUntil(b.trialEndsAt); return `Termina el ${fmtDate(b.trialEndsAt)} (${d} ${d === 1 ? 'día' : 'días'})` }
  if (plan.value === 'active') return b.expiresAt ? `Renueva el ${fmtDate(b.expiresAt)}` : 'Sin fecha de vencimiento'
  if (plan.value === 'lifetime') return 'Acceso sin pago, asignado por admin'
  if (b.status === 'trial') return `La prueba terminó el ${fmtDate(b.trialEndsAt)}`
  return b.expiresAt ? `Venció el ${fmtDate(b.expiresAt)}` : 'Sin suscripción'
})

const ROLE_META = {
  manager: { label: 'Manager', cls: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
  seller: { label: 'Vendedor', cls: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' },
  viewer: { label: 'Viewer', cls: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' }
}

// La API key nunca se muestra entera salvo que se pida
const maskedKey = computed(() => {
  const k = tenant.value?.apiKey || ''
  return showKey.value || k.length < 10 ? k : `${k.slice(0, 6)}••••••••••••${k.slice(-4)}`
})
const maskedWebhook = computed(() => {
  const url = tenant.value?.webhookUrl || ''
  return showKey.value ? url : url.replace(tenant.value?.apiKey || '\u0000', maskedKey.value)
})

const copy = async (text, key) => {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = key
    setTimeout(() => { if (copied.value === key) copied.value = null }, 1500)
  } catch {
    flash('No se pudo copiar', true)
  }
}

const flash = (text, error = false) => {
  notice.value = { text, error }
  setTimeout(() => { notice.value = null }, 3000)
}

// --- Acciones ---
const saveName = async () => {
  if (!nameDraft.value.trim()) return
  const result = await tenantsStore.updateTenant(route.params.id, { name: nameDraft.value.trim() })
  if (result.success) { editingName.value = false; flash('Nombre actualizado') }
}

const toggleActive = async () => {
  const enable = !tenant.value.active
  if (!enable && !confirm(`¿Desactivar "${tenant.value.name}"? Sus usuarios no van a poder entrar y no se van a repartir leads.`)) return
  busy.value = true
  const result = await tenantsStore.updateTenant(route.params.id, { active: enable })
  busy.value = false
  if (result.success) flash(enable ? 'Empresa activada' : 'Empresa desactivada')
}

const changePlan = async (status) => {
  if (!status || status === billing.value.status) return
  busy.value = true
  try {
    if (tenant.value.owner) await adminApi.updateOwnerSubscription(tenant.value.owner.id, status)
    else await adminApi.updateSubscription(route.params.id, status)
    await load()
    flash('Plan actualizado')
  } catch (e) {
    flash(e.response?.data?.message || 'Error al actualizar el plan', true)
  } finally {
    busy.value = false
  }
}

const regenerateKey = async () => {
  if (!confirm('¿Regenerar la API key? La URL del webhook actual deja de funcionar y hay que actualizarla en el CRM del cliente.')) return
  const result = await tenantsStore.regenerateApiKey(route.params.id)
  if (result.success) { await load(); flash('API key regenerada. Pasale la nueva URL al cliente.') }
}

const openEditUser = (user) => {
  editingUser.value = user
  editUserForm.value = { name: user.name, email: user.email, password: '' }
  showEditUserModal.value = true
}

const saveUser = async () => {
  if (!editingUser.value) return
  const data = { name: editUserForm.value.name, email: editUserForm.value.email }
  if (editUserForm.value.password) data.password = editUserForm.value.password
  const result = await tenantsStore.updateTenantUser(route.params.id, editingUser.value._id, data)
  if (result.success) {
    showEditUserModal.value = false
    editingUser.value = null
    flash('Usuario actualizado')
  } else {
    flash(result.error, true)
  }
}

const sortedUsers = computed(() => {
  const order = { manager: 0, viewer: 1, seller: 2 }
  return [...tenantsStore.tenantUsers].sort((a, b) => (order[a.role] ?? 9) - (order[b.role] ?? 9) || a.name.localeCompare(b.name))
})

const initials = (name) => String(name || '?').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
</script>

<template>
  <div class="space-y-6">
    <button @click="router.push('/admin/tenants')" class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      Volver a cuentas
    </button>

    <div v-if="tenantsStore.loading && !tenant" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="!tenant" class="card text-center py-12 text-gray-500 dark:text-gray-400">
      No encontramos esta empresa.
    </div>

    <template v-else>
      <!-- Encabezado -->
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          <div v-if="!editingName" class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white truncate">{{ tenant.name }}</h1>
            <button @click="editingName = true" class="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" title="Editar nombre">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6.232-6.232a2.5 2.5 0 113.536 3.536L12.536 16.536 9 17l.464-3.536z" /></svg>
            </button>
          </div>
          <form v-else @submit.prevent="saveName" class="flex items-center gap-2">
            <input v-model="nameDraft" class="input py-1.5 text-lg font-semibold" autofocus />
            <button type="submit" class="btn btn-sm btn-primary">Guardar</button>
            <button type="button" @click="editingName = false; nameDraft = tenant.name" class="btn btn-sm btn-secondary">Cancelar</button>
          </form>
          <div class="flex flex-wrap items-center gap-2 mt-2 text-sm">
            <span class="font-mono text-gray-500 dark:text-gray-400">/{{ tenant.slug }}</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="tenant.active ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'">
              {{ tenant.active ? 'Activa' : 'Desactivada' }}
            </span>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="PLAN_META[plan].cls">{{ PLAN_META[plan].label }}</span>
            <span class="text-gray-400">· alta {{ fmtDate(tenant.createdAt) }}</span>
          </div>
        </div>
        <button @click="toggleActive" :disabled="busy" :class="['btn', tenant.active ? 'btn-secondary' : 'btn-primary']">
          {{ tenant.active ? 'Desactivar empresa' : 'Activar empresa' }}
        </button>
      </div>

      <div v-if="notice" class="p-3 rounded-lg text-sm" :class="notice.error ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'">
        {{ notice.text }}
      </div>

      <!-- Métricas -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 px-4 py-3">
          <div class="text-xs text-gray-500 dark:text-gray-400">Leads últimos 30 días</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.leads30d ?? 0 }}</div>
          <div class="text-xs text-gray-400">{{ stats.leadsTotal ?? 0 }} en total</div>
        </div>
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 px-4 py-3">
          <div class="text-xs text-gray-500 dark:text-gray-400">Último lead</div>
          <div class="text-lg font-bold text-gray-900 dark:text-white mt-1">{{ timeAgo(stats.lastLeadAt) }}</div>
          <div class="text-xs text-gray-400">{{ stats.lastLeadAt ? fmtDateTime(stats.lastLeadAt) : 'Todavía no recibió leads' }}</div>
        </div>
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 px-4 py-3">
          <div class="text-xs text-gray-500 dark:text-gray-400">Vendedores</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.sellersActive ?? 0 }}</div>
          <div class="text-xs text-gray-400">activos de {{ stats.sellersTotal ?? 0 }}</div>
        </div>
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 px-4 py-3">
          <div class="text-xs text-gray-500 dark:text-gray-400">Usuarios con acceso</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ tenant.userCount }}</div>
          <div class="text-xs text-gray-400">{{ tenant.hasConfig ? 'Reparto configurado' : 'Sin configurar el reparto' }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Columna principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Usuarios -->
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900 dark:text-white">Usuarios</h3>
              <span class="text-xs text-gray-400">{{ tenantsStore.tenantUsers.length }}</span>
            </div>
            <div v-if="sortedUsers.length" class="divide-y divide-gray-100 dark:divide-gray-700/70">
              <div v-for="user in sortedUsers" :key="user._id" class="flex items-center gap-3 py-3">
                <div class="w-9 h-9 shrink-0 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xs font-bold">
                  {{ initials(user.name) }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-sm text-gray-900 dark:text-white truncate">{{ user.name }}</span>
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-medium" :class="(ROLE_META[user.role] || ROLE_META.viewer).cls">
                      {{ (ROLE_META[user.role] || { label: user.role }).label }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {{ user.email }}<span v-if="user.sellerId?.team"> · equipo {{ user.sellerId.team }}</span> · alta {{ fmtDate(user.createdAt) }}
                  </div>
                </div>
                <button @click="copy(user.email, `u-${user._id}`)" class="hidden sm:inline-flex btn btn-sm btn-secondary">
                  {{ copied === `u-${user._id}` ? '¡Copiado!' : 'Copiar email' }}
                </button>
                <button @click="openEditUser(user)" class="btn btn-sm btn-secondary">Editar</button>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">Esta empresa no tiene usuarios.</p>
          </div>

          <!-- Integración -->
          <div class="card space-y-5">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-900 dark:text-white">Integración</h3>
              <button @click="showKey = !showKey" class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                {{ showKey ? 'Ocultar clave' : 'Mostrar clave' }}
              </button>
            </div>

            <div>
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Webhook para recibir leads (Make, GHL, Zapier)</div>
              <div class="flex items-stretch gap-2">
                <code class="flex-1 min-w-0 text-xs font-mono break-all rounded-lg bg-gray-100 dark:bg-gray-900/60 text-gray-800 dark:text-gray-200 px-3 py-2.5">{{ maskedWebhook }}</code>
                <button @click="copy(tenant.webhookUrl, 'webhook')" class="btn btn-sm btn-secondary shrink-0">{{ copied === 'webhook' ? '¡Copiado!' : 'Copiar' }}</button>
              </div>
            </div>

            <div>
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">API key (header <span class="font-mono">X-API-Key</span>)</div>
              <div class="flex items-stretch gap-2">
                <code class="flex-1 min-w-0 text-xs font-mono break-all rounded-lg bg-gray-100 dark:bg-gray-900/60 text-gray-800 dark:text-gray-200 px-3 py-2.5">{{ maskedKey }}</code>
                <button @click="copy(tenant.apiKey, 'key')" class="btn btn-sm btn-secondary shrink-0">{{ copied === 'key' ? '¡Copiado!' : 'Copiar' }}</button>
              </div>
              <button @click="regenerateKey" class="mt-2 text-xs text-amber-600 dark:text-amber-400 hover:underline">Regenerar API key</button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div class="flex items-center gap-2.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5">
                <span class="w-2 h-2 rounded-full" :class="tenant.integrations?.ghlConnected ? 'bg-green-500' : 'bg-gray-400'"></span>
                <div class="min-w-0">
                  <div class="text-sm text-gray-900 dark:text-white">CRM (GoHighLevel)</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ tenant.integrations?.ghlConnected ? `Conectado · ${tenant.integrations.ghlLocationId}` : 'No conectado' }}</div>
                </div>
              </div>
              <div class="flex items-center gap-2.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5">
                <span class="w-2 h-2 rounded-full" :class="tenant.integrations?.webForm ? 'bg-green-500' : 'bg-gray-400'"></span>
                <div>
                  <div class="text-sm text-gray-900 dark:text-white">Formulario web</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ tenant.integrations?.webForm ? 'Configurado' : 'No configurado' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna lateral -->
        <div class="space-y-6">
          <!-- Cliente / quién paga -->
          <div class="card">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Cliente</h3>
            <div v-if="tenant.owner" class="space-y-1">
              <div class="font-medium text-gray-900 dark:text-white">{{ tenant.owner.name }}</div>
              <button @click="copy(tenant.owner.email, 'owner')" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white break-all text-left">
                {{ copied === 'owner' ? '¡Copiado!' : tenant.owner.email }}
              </button>
              <div class="text-xs text-gray-400">Dueño de {{ tenant.owner.companies }} {{ tenant.owner.companies === 1 ? 'empresa' : 'empresas' }} · cliente desde {{ fmtDate(tenant.owner.createdAt) }}</div>
            </div>
            <div v-else-if="tenant.manager" class="space-y-1">
              <div class="font-medium text-gray-900 dark:text-white">{{ tenant.manager.name }}</div>
              <button @click="copy(tenant.manager.email, 'owner')" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white break-all text-left">
                {{ copied === 'owner' ? '¡Copiado!' : tenant.manager.email }}
              </button>
              <div class="text-xs text-gray-400">Cuenta clásica (sin dueño) · paga la empresa</div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">Sin manager asignado.</p>
          </div>

          <!-- Suscripción -->
          <div class="card space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-900 dark:text-white">Suscripción</h3>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="PLAN_META[plan].cls">{{ PLAN_META[plan].label }}</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ planDetail }}</p>
            <p v-if="tenant.owner" class="text-xs text-gray-500 dark:text-gray-400">La paga el dueño y cubre todas sus empresas.</p>

            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Cambiar plan manualmente</label>
              <select :value="billing.status" @change="(e) => changePlan(e.target.value)" :disabled="busy" class="input mt-1">
                <option value="trial">Prueba</option>
                <option value="active">Pagando</option>
                <option value="inactive">Inactivo</option>
                <option value="lifetime">Lifetime (sin pago)</option>
              </select>
            </div>

            <div class="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2 text-xs">
              <div class="flex justify-between gap-2">
                <span class="text-gray-500 dark:text-gray-400">Total cobrado</span>
                <span class="font-medium text-gray-900 dark:text-white text-right">
                  <template v-if="billing.totals?.length">
                    <span v-for="tot in billing.totals" :key="tot.currency" class="block">{{ fmtMoney(tot.total, tot.currency) }} · {{ tot.count }} {{ tot.count === 1 ? 'pago' : 'pagos' }}</span>
                  </template>
                  <template v-else>Sin pagos</template>
                </span>
              </div>
              <div v-if="billing.paddleSubscriptionId" class="flex justify-between gap-2">
                <span class="text-gray-500 dark:text-gray-400">Suscripción Paddle</span>
                <button @click="copy(billing.paddleSubscriptionId, 'sub')" class="font-mono text-gray-700 dark:text-gray-300 hover:underline truncate">
                  {{ copied === 'sub' ? '¡Copiado!' : billing.paddleSubscriptionId }}
                </button>
              </div>
              <div v-if="billing.paddleCustomerId" class="flex justify-between gap-2">
                <span class="text-gray-500 dark:text-gray-400">Cliente Paddle</span>
                <button @click="copy(billing.paddleCustomerId, 'cus')" class="font-mono text-gray-700 dark:text-gray-300 hover:underline truncate">
                  {{ copied === 'cus' ? '¡Copiado!' : billing.paddleCustomerId }}
                </button>
              </div>
            </div>

            <div v-if="billing.recentPayments?.length">
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Últimos pagos</div>
              <div class="space-y-1.5">
                <div v-for="p in billing.recentPayments" :key="p._id" class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-300">{{ fmtDate(p.date) }} <span class="text-xs text-gray-400">· {{ p.provider }}</span></span>
                  <a v-if="p.downloadUrl" :href="p.downloadUrl" target="_blank" rel="noopener" class="font-medium text-gray-900 dark:text-white hover:underline">{{ fmtMoney(p.amount, p.currency) }}</a>
                  <span v-else class="font-medium text-gray-900 dark:text-white">{{ fmtMoney(p.amount, p.currency) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Datos técnicos -->
          <div class="card text-xs space-y-2">
            <h3 class="font-semibold text-sm text-gray-900 dark:text-white mb-2">Datos</h3>
            <div class="flex justify-between gap-2"><span class="text-gray-500 dark:text-gray-400">ID</span>
              <button @click="copy(tenant._id, 'id')" class="font-mono text-gray-700 dark:text-gray-300 hover:underline truncate">{{ copied === 'id' ? '¡Copiado!' : tenant._id }}</button>
            </div>
            <div class="flex justify-between gap-2"><span class="text-gray-500 dark:text-gray-400">Alta</span><span class="text-gray-700 dark:text-gray-300">{{ fmtDate(tenant.createdAt) }}</span></div>
            <div class="flex justify-between gap-2"><span class="text-gray-500 dark:text-gray-400">Última modificación</span><span class="text-gray-700 dark:text-gray-300">{{ fmtDate(tenant.updatedAt) }}</span></div>
            <div class="flex justify-between gap-2"><span class="text-gray-500 dark:text-gray-400">App</span>
              <a :href="tenant.appUrl" target="_blank" rel="noopener" class="text-gray-700 dark:text-gray-300 hover:underline truncate">{{ tenant.appUrl }}</a>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal editar usuario -->
    <div v-if="showEditUserModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showEditUserModal = false">
      <form @submit.prevent="saveUser" class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Editar usuario</h2>
        <div class="space-y-4">
          <div>
            <label class="label text-sm">Nombre</label>
            <input v-model="editUserForm.name" type="text" class="input" required />
          </div>
          <div>
            <label class="label text-sm">Email</label>
            <input v-model="editUserForm.email" type="email" class="input" required />
          </div>
          <div>
            <label class="label text-sm">Nueva contraseña</label>
            <input v-model="editUserForm.password" type="password" class="input" placeholder="Dejar vacío para no cambiarla" autocomplete="new-password" />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button type="button" @click="showEditUserModal = false" class="btn btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn btn-primary flex-1" :disabled="!editUserForm.name || !editUserForm.email">Guardar</button>
        </div>
      </form>
    </div>
  </div>
</template>
