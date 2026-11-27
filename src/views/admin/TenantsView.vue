<script setup>
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { useTenantsStore } from '../../stores/tenants'
import { adminApi } from '../../services/api'
import { useI18n } from 'vue-i18n'
import CreateTenantModal from '../../components/admin/CreateTenantModal.vue'
import TenantCredentialsModal from '../../components/admin/TenantCredentialsModal.vue'

const tenantsStore = useTenantsStore()
const { t } = useI18n()

const showCreateModal = ref(false)
const showCredentialsModal = ref(false)
const newTenantCredentials = ref(null)

const PAGE_SIZE = 20
const search = ref('')
const planFilter = ref('all')
const sortBy = ref('recent')
const page = ref(1)
const expanded = ref(new Set())
const openMenu = ref(null)
const busyKey = ref(null)
const copiedId = ref(null)

const closeMenu = () => { openMenu.value = null }
onMounted(async () => {
  document.addEventListener('click', closeMenu)
  await tenantsStore.fetchTenants()
})
onBeforeUnmount(() => document.removeEventListener('click', closeMenu))

// --- Modelo: una "cuenta" = quien paga. Dueño (adminclient) con N empresas, o empresa clásica sin dueño ---
const accounts = computed(() => {
  const owners = new Map()
  const list = []

  for (const tenant of tenantsStore.tenants) {
    const owner = tenant.ownerId?._id ? tenant.ownerId : null
    if (owner) {
      if (!owners.has(owner._id)) {
        const acc = {
          key: `o-${owner._id}`,
          type: 'owner',
          id: owner._id,
          name: owner.name,
          email: owner.email,
          status: owner.subscriptionStatus,
          trialEndsAt: owner.trialEndsAt,
          expiresAt: owner.subscriptionExpiresAt,
          tenants: []
        }
        owners.set(owner._id, acc)
        list.push(acc)
      }
      owners.get(owner._id).tenants.push(tenant)
    } else {
      list.push({
        key: `t-${tenant._id}`,
        type: 'tenant',
        id: tenant._id,
        name: tenant.name,
        email: `/${tenant.slug}`,
        status: tenant.subscriptionStatus,
        trialEndsAt: tenant.trialEndsAt,
        expiresAt: tenant.subscriptionExpiresAt,
        tenants: [tenant]
      })
    }
  }

  return list.map((acc) => {
    const created = acc.tenants.map((x) => new Date(x.createdAt).getTime()).filter(Boolean)
    return {
      ...acc,
      users: acc.tenants.reduce((sum, x) => sum + (x.userCount || 0), 0),
      activeCount: acc.tenants.filter((x) => x.active).length,
      createdAt: created.length ? Math.min(...created) : 0,
      plan: planOf(acc)
    }
  })
})

// Plan efectivo para filtrar y mostrar (un trial vencido cuenta como vencido)
function planOf (acc) {
  const now = Date.now()
  if (acc.status === 'lifetime') return 'lifetime'
  if (acc.status === 'trial') return acc.trialEndsAt && new Date(acc.trialEndsAt).getTime() > now ? 'trial' : 'expired'
  if (acc.status === 'active') return !acc.expiresAt || new Date(acc.expiresAt).getTime() > now ? 'active' : 'expired'
  return 'expired'
}

const PLAN_META = {
  trial: { label: 'Prueba', cls: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' },
  active: { label: 'Pagando', cls: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
  lifetime: { label: 'Lifetime', cls: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
  expired: { label: 'Vencido', cls: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' }
}

const FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'trial', label: 'En prueba' },
  { value: 'active', label: 'Pagando' },
  { value: 'lifetime', label: 'Lifetime' },
  { value: 'expired', label: 'Vencidas' },
  { value: 'disabled', label: 'Desactivadas' }
]

const stats = computed(() => {
  const s = { all: accounts.value.length, trial: 0, active: 0, lifetime: 0, expired: 0, disabled: 0 }
  for (const acc of accounts.value) {
    s[acc.plan]++
    if (acc.activeCount === 0) s.disabled++
  }
  return s
})

const daysUntil = (date) => {
  if (!date) return null
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
}

// Próxima fecha relevante: fin de prueba o vencimiento del pago
const nextDate = (acc) => (acc.plan === 'trial' ? acc.trialEndsAt : acc.plan === 'active' ? acc.expiresAt : null)

const planDetail = (acc) => {
  const d = daysUntil(nextDate(acc))
  if (acc.plan === 'trial') return d === null ? '' : `${d} ${d === 1 ? 'día' : 'días'} de prueba`
  if (acc.plan === 'active' && acc.expiresAt) return `Renueva ${fmtDate(acc.expiresAt)}`
  if (acc.plan === 'expired' && acc.status === 'trial') return 'Prueba terminada'
  return ''
}

const fmtDate = (date) => (date ? new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')

const normalized = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const filtered = computed(() => {
  const q = normalized(search.value.trim())
  let list = accounts.value.filter((acc) => {
    if (planFilter.value === 'disabled' && acc.activeCount !== 0) return false
    if (!['all', 'disabled'].includes(planFilter.value) && acc.plan !== planFilter.value) return false
    if (!q) return true
    const haystack = [acc.name, acc.email, ...acc.tenants.flatMap((x) => [x.name, x.slug])].map(normalized).join(' ')
    return haystack.includes(q)
  })

  list = [...list]
  if (sortBy.value === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
  else if (sortBy.value === 'expiring') {
    const ts = (acc) => { const d = nextDate(acc); return d ? new Date(d).getTime() : Infinity }
    list.sort((a, b) => ts(a) - ts(b))
  } else if (sortBy.value === 'users') list.sort((a, b) => b.users - a.users)
  else list.sort((a, b) => b.createdAt - a.createdAt)
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const paged = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
watch([search, planFilter, sortBy], () => { page.value = 1 })
watch(totalPages, (n) => { if (page.value > n) page.value = n })

const toggleExpand = (key) => {
  const next = new Set(expanded.value)
  next.has(key) ? next.delete(key) : next.add(key)
  expanded.value = next
}

// --- Acciones ---
const run = async (key, fn, fallback) => {
  busyKey.value = key
  openMenu.value = null
  try {
    await fn()
    await tenantsStore.fetchTenants()
  } catch (e) {
    tenantsStore.error = e.response?.data?.message || fallback
  } finally {
    busyKey.value = null
  }
}

const toggleLifetime = (acc) => {
  const next = acc.status === 'lifetime' ? 'active' : 'lifetime'
  return run(acc.key, () => (acc.type === 'owner'
    ? adminApi.updateOwnerSubscription(acc.id, next)
    : adminApi.updateSubscription(acc.id, next)), 'Error al actualizar la suscripción')
}

const toggleAccountActive = (acc) => {
  const enable = acc.activeCount === 0
  return run(acc.key, () => (acc.type === 'owner'
    ? adminApi.updateOwner(acc.id, { active: enable })
    : adminApi.updateTenant(acc.id, { active: enable })), 'Error al actualizar la cuenta')
}

const deleteAccount = (acc) => {
  const msg = acc.type === 'owner'
    ? `¿Eliminar al dueño "${acc.name}" y sus ${acc.tenants.length} empresa(s)? Se borran TODOS los datos (usuarios, leads, vendedores, configuración) y no se puede deshacer.`
    : t('admin.tenants.deleteConfirm', { name: acc.name })
  if (!confirm(msg)) return
  return run(acc.key, () => (acc.type === 'owner' ? adminApi.deleteOwner(acc.id) : adminApi.deleteTenant(acc.id)), 'Error al eliminar')
}

const toggleTenantActive = (tenant) =>
  run(`t-${tenant._id}`, () => adminApi.updateTenant(tenant._id, { active: !tenant.active }), 'Error al actualizar la empresa')

const deleteTenant = (tenant) => {
  if (!confirm(t('admin.tenants.deleteConfirm', { name: tenant.name }))) return
  return run(`t-${tenant._id}`, () => adminApi.deleteTenant(tenant._id), 'Error al eliminar la empresa')
}

const copyWebhook = async (tenant) => {
  try {
    await navigator.clipboard.writeText(tenant.webhookUrl)
    copiedId.value = tenant._id
    setTimeout(() => { if (copiedId.value === tenant._id) copiedId.value = null }, 1500)
  } catch {
    tenantsStore.error = 'No se pudo copiar la URL'
  }
}

const initials = (name) => String(name || '?').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

const handleCreateTenant = async (data) => {
  const result = await tenantsStore.createTenant(data)
  if (result.success) {
    showCreateModal.value = false
    newTenantCredentials.value = result.data
    showCredentialsModal.value = true
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Encabezado -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('admin.tenants.title') }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ stats.all }} cuentas · {{ tenantsStore.tenants.length }} empresas
        </p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary">{{ t('admin.tenants.add') }}</button>
    </div>

    <!-- Resumen: cada tarjeta filtra -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <button
        v-for="f in FILTERS"
        :key="f.value"
        @click="planFilter = f.value"
        :class="[
          'text-left rounded-xl border px-4 py-3 transition-colors',
          planFilter === f.value
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-300/10 dark:border-primary-300/60'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600'
        ]"
      >
        <div class="text-xs text-gray-500 dark:text-gray-400">{{ f.label }}</div>
        <div class="text-xl font-bold text-gray-900 dark:text-white">{{ stats[f.value] }}</div>
      </button>
    </div>

    <!-- Buscador y orden -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input v-model="search" type="search" class="input pl-9" placeholder="Buscar por nombre, email, empresa o slug…" />
      </div>
      <select v-model="sortBy" class="input sm:w-56">
        <option value="recent">Más recientes</option>
        <option value="expiring">Vencen primero</option>
        <option value="name">Nombre (A–Z)</option>
        <option value="users">Más usuarios</option>
      </select>
    </div>

    <div v-if="tenantsStore.error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex justify-between gap-3">
      <span>{{ tenantsStore.error }}</span>
      <button @click="tenantsStore.error = null" class="font-semibold">✕</button>
    </div>

    <div v-if="tenantsStore.loading && !tenantsStore.tenants.length" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="filtered.length === 0" class="card text-center py-12 text-gray-500 dark:text-gray-400">
      {{ search ? `Sin resultados para "${search}"` : t('admin.tenants.noTenants') }}
    </div>

    <!-- Tabla de cuentas -->
    <div v-else class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60">
      <!-- Cabecera (desktop) -->
      <div class="hidden md:grid grid-cols-[minmax(0,2.4fr)_minmax(0,1.4fr)_90px_90px_110px_44px] gap-4 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
        <span>Cuenta</span>
        <span>Plan</span>
        <span class="text-right">Empresas</span>
        <span class="text-right">Usuarios</span>
        <span>Alta</span>
        <span></span>
      </div>

      <div v-for="acc in paged" :key="acc.key" class="border-b last:border-b-0 border-gray-100 dark:border-gray-700/70">
        <!-- Fila de la cuenta -->
        <div
          class="grid grid-cols-[minmax(0,1fr)_44px] md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.4fr)_90px_90px_110px_44px] gap-x-4 gap-y-2 items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer"
          :class="{ 'opacity-60': acc.activeCount === 0 }"
          @click="toggleExpand(acc.key)"
        >
          <!-- Cuenta -->
          <div class="flex items-center gap-3 min-w-0">
            <svg class="w-4 h-4 shrink-0 text-gray-400 transition-transform" :class="{ 'rotate-90': expanded.has(acc.key) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <div class="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold"
                 :class="acc.type === 'owner' ? 'bg-primary-100 text-primary-800 dark:bg-primary-300/15 dark:text-primary-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'">
              {{ initials(acc.name) }}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 min-w-0">
                <span class="font-semibold text-gray-900 dark:text-white truncate">{{ acc.name }}</span>
                <span v-if="acc.type === 'tenant'" class="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">clásica</span>
                <span v-if="acc.activeCount === 0" class="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">desactivada</span>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ acc.email }}</div>
            </div>
          </div>

          <!-- Menú (mobile: arriba a la derecha) -->
          <div class="md:hidden row-span-2 self-start relative" @click.stop>
            <button @click="openMenu = openMenu === acc.key ? null : acc.key" class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">⋯</button>
          </div>

          <!-- Plan -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="PLAN_META[acc.plan].cls">{{ PLAN_META[acc.plan].label }}</span>
            <span class="text-xs" :class="acc.plan === 'trial' && daysUntil(acc.trialEndsAt) <= 2 ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'">{{ planDetail(acc) }}</span>
            <span class="md:hidden text-xs text-gray-500 dark:text-gray-400">· {{ acc.tenants.length }} emp. · {{ acc.users }} usu.</span>
          </div>

          <div class="hidden md:block text-right text-sm text-gray-700 dark:text-gray-300">{{ acc.tenants.length }}</div>
          <div class="hidden md:block text-right text-sm text-gray-700 dark:text-gray-300">{{ acc.users }}</div>
          <div class="hidden md:block text-sm text-gray-500 dark:text-gray-400">{{ fmtDate(acc.createdAt) }}</div>

          <!-- Menú de acciones -->
          <div class="hidden md:block relative" @click.stop>
            <button
              @click="openMenu = openMenu === acc.key ? null : acc.key"
              :disabled="busyKey === acc.key"
              class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              title="Acciones"
            >
              <div v-if="busyKey === acc.key" class="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              <span v-else class="text-lg leading-none">⋯</span>
            </button>
          </div>

          <!-- Dropdown (compartido mobile/desktop) -->
          <div v-if="openMenu === acc.key" class="col-span-full relative" @click.stop>
            <div class="absolute right-0 -top-1 z-20 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1 text-sm">
              <router-link v-if="acc.type === 'tenant'" :to="`/admin/tenants/${acc.id}`" class="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Ver detalles</router-link>
              <button @click="toggleLifetime(acc)" class="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                {{ acc.status === 'lifetime' ? 'Quitar lifetime' : 'Dar lifetime (sin pago)' }}
              </button>
              <button @click="toggleAccountActive(acc)" class="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                {{ acc.activeCount === 0 ? 'Activar' : (acc.type === 'owner' ? 'Desactivar todas las empresas' : 'Desactivar') }}
              </button>
              <div class="my-1 border-t border-gray-100 dark:border-gray-700"></div>
              <button @click="deleteAccount(acc)" class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                {{ acc.type === 'owner' ? 'Eliminar dueño y empresas' : 'Eliminar empresa' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empresas de la cuenta -->
        <div v-if="expanded.has(acc.key)" class="bg-gray-50/70 dark:bg-gray-900/40 px-4 py-2">
          <div
            v-for="tenant in acc.tenants"
            :key="tenant._id"
            class="flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 md:pl-14 border-b last:border-b-0 border-gray-200/70 dark:border-gray-700/60"
          >
            <div class="min-w-0 flex-1 basis-56">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full shrink-0" :class="tenant.active ? 'bg-green-500' : 'bg-gray-400'"></span>
                <span class="font-medium text-sm text-gray-900 dark:text-white truncate">{{ tenant.name }}</span>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate pl-4">/{{ tenant.slug }} · {{ tenant.userCount }} usuarios · alta {{ fmtDate(tenant.createdAt) }}</div>
            </div>
            <div class="flex items-center gap-2">
              <button @click="copyWebhook(tenant)" class="btn btn-sm btn-secondary" title="Copiar URL del webhook">
                {{ copiedId === tenant._id ? '¡Copiado!' : 'Webhook' }}
              </button>
              <router-link :to="`/admin/tenants/${tenant._id}`" class="btn btn-sm btn-secondary">Detalles</router-link>
              <button
                v-if="acc.type === 'owner'"
                @click="toggleTenantActive(tenant)"
                :disabled="busyKey === `t-${tenant._id}`"
                :class="['btn btn-sm', tenant.active ? 'btn-secondary' : 'btn-primary']"
              >
                {{ tenant.active ? 'Desactivar' : 'Activar' }}
              </button>
              <button
                v-if="acc.type === 'owner'"
                @click="deleteTenant(tenant)"
                :disabled="busyKey === `t-${tenant._id}`"
                class="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                title="Eliminar empresa"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
      <span>{{ (page - 1) * PAGE_SIZE + 1 }}–{{ Math.min(page * PAGE_SIZE, filtered.length) }} de {{ filtered.length }}</span>
      <div class="flex items-center gap-2">
        <button class="btn btn-sm btn-secondary" :disabled="page === 1" @click="page--">Anterior</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button class="btn btn-sm btn-secondary" :disabled="page === totalPages" @click="page++">Siguiente</button>
      </div>
    </div>

    <CreateTenantModal v-if="showCreateModal" @close="showCreateModal = false" @submit="handleCreateTenant" />
    <TenantCredentialsModal v-if="showCredentialsModal" :credentials="newTenantCredentials" @close="showCredentialsModal = false" />
  </div>
</template>
