<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useConfigStore } from '../../stores/config'
import { useSellersStore } from '../../stores/sellers'
import { useAppointmentsStore } from '../../stores/appointments'
import { leadsApi } from '../../services/api'
import { safeTimeZone, toInputs, fromInputs, formatZoned } from '../../utils/zonedTime'

const props = defineProps({
  // Cita existente (editar) o null (nueva)
  appointment: { type: Object, default: null },
  // Valores iniciales para una cita nueva: { startsAt: Date, lead: { _id, name, phone }, sellerId }
  defaults: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['close', 'saved', 'deleted'])

const { t, locale } = useI18n()
const authStore = useAuthStore()
const configStore = useConfigStore()
const sellersStore = useSellersStore()
const store = useAppointmentsStore()

const tz = computed(() => safeTimeZone(configStore.config?.timezone))
const isEdit = computed(() => !!props.appointment)
const canWork = computed(() => ['superadmin', 'adminclient', 'manager', 'seller'].includes(authStore.userRole))
const TYPES = ['call', 'meeting', 'visit', 'other']
const REMINDERS = [0, 15, 60, 1440]
const DURATIONS = [15, 30, 45, 60, 90, 120]
const MAX_MINUTES = 8 * 60

// ---- Formulario ----
const start = props.appointment ? new Date(props.appointment.startsAt) : (props.defaults.startsAt || nextSlot())
const end = props.appointment ? new Date(props.appointment.endsAt) : null
const initial = toInputs(start, tz.value)

const form = ref({
  type: props.appointment?.type || 'call',
  title: props.appointment?.title || '',
  date: initial.date,
  time: initial.time,
  duration: end ? Math.round((end - start) / 60000) : 30, // minutos, o 'custom' (hora de fin a mano)
  endTime: '',
  reminderMinutes: props.appointment?.reminderMinutes ?? 60,
  notes: props.appointment?.notes || '',
  sellerId: String(props.appointment?.sellerId || props.defaults.sellerId || ''),
  leadId: String(props.appointment?.leadId || props.defaults.lead?._id || '')
})
// Duraciones fijas; si la cita ya tiene otra, se agrega para no cambiarla al guardar
const initialDuration = form.value.duration
const durationOptions = DURATIONS.includes(initialDuration) ? DURATIONS : [...DURATIONS, initialDuration].sort((a, b) => a - b)
// Al elegir "hora de fin a mano", se parte de la duración que había
watch(() => form.value.duration, (value, previous) => {
  if (value !== 'custom') return
  const from = fromInputs(form.value.date, form.value.time, tz.value)
  if (from) form.value.endTime = toInputs(new Date(from.getTime() + previous * 60000), tz.value).time
})

// Fin de la cita según lo elegido, o null si no es válido
const endFor = (startsAt) => form.value.duration === 'custom'
  ? fromInputs(form.value.date, form.value.endTime, tz.value)
  : new Date(startsAt.getTime() + form.value.duration * 60000)

// Próximo horario redondo (media hora) a partir de ahora
function nextSlot () {
  const d = new Date(Date.now() + 30 * 60000)
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0)
  return d
}

// ---- Lead ----
const fixedLead = props.appointment?.lead || props.defaults.lead || null
const leadOptions = ref(fixedLead ? [fixedLead] : [])
const leadSearch = ref('')
const leadsLoading = ref(false)
const lockLead = !!props.defaults.lead && !props.appointment

const selectedLead = ref(fixedLead)
watch(() => form.value.leadId, (id) => {
  selectedLead.value = leadOptions.value.find(l => String(l._id) === id) || (id ? selectedLead.value : null)
})
// El elegido se muestra aunque la búsqueda actual no lo incluya
const shownLeads = computed(() => {
  const keep = selectedLead.value
  return keep && !leadOptions.value.some(l => String(l._id) === String(keep._id)) ? [keep, ...leadOptions.value] : leadOptions.value
})

// Busca en el servidor entre todos los leads a los que el usuario tiene acceso
// (el seller, solo los suyos). Sin texto, trae los más recientes
let searchRequest = 0
const loadLeads = async () => {
  if (lockLead || !canWork.value) return
  const request = ++searchRequest
  leadsLoading.value = true
  try {
    const search = leadSearch.value.trim()
    const { data } = await leadsApi.getLeads(authStore.tenantSlug, { page: 1, limit: 50, ...(search && { search }) })
    if (request === searchRequest) leadOptions.value = data.data?.leads || []
  } catch {
    // Sin la lista se puede agendar igual, sin lead
  } finally {
    if (request === searchRequest) leadsLoading.value = false
  }
}
let searchTimer
watch(leadSearch, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(loadLeads, 300)
})
onUnmounted(() => clearTimeout(searchTimer))

// Título automático: "Llamada con Sofía" mientras el usuario no lo escriba a mano
const autoTitle = (type, lead) => lead ? t('calendar.titleWith', { type: t(`calendar.types.${type}`), name: lead.name }) : ''
const titleTouched = ref(isEdit.value && !!form.value.title)
if (!form.value.title) form.value.title = autoTitle(form.value.type, selectedLead.value || fixedLead)
watch(() => [form.value.type, form.value.leadId], () => {
  if (!titleTouched.value) form.value.title = autoTitle(form.value.type, selectedLead.value)
})

// ---- Guardar ----
const saving = ref(false)
const error = ref('')

const save = async () => {
  error.value = ''
  const startsAt = fromInputs(form.value.date, form.value.time, tz.value)
  if (!startsAt) { error.value = t('calendar.errors.date'); return }
  if (!form.value.title.trim()) { error.value = t('calendar.errors.title'); return }
  if (authStore.isManager && !form.value.sellerId) { error.value = t('calendar.errors.seller'); return }
  const endsAt = endFor(startsAt)
  if (!endsAt || endsAt <= startsAt) { error.value = t('calendar.errors.end'); return }
  if (endsAt - startsAt > MAX_MINUTES * 60000) { error.value = t('calendar.errors.tooLong'); return }

  const payload = {
    type: form.value.type,
    title: form.value.title.trim(),
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    reminderMinutes: Number(form.value.reminderMinutes),
    notes: form.value.notes,
    leadId: form.value.leadId || null
  }
  if (authStore.isManager) payload.sellerId = form.value.sellerId

  saving.value = true
  const result = isEdit.value
    ? await store.update(props.appointment._id, payload)
    : await store.create(payload)
  saving.value = false
  if (!result.success) { error.value = t('calendar.errors.save'); return }
  emit('saved', { appointment: result.appointment, overlaps: result.overlaps, created: !isEdit.value })
}

const setStatus = async (status) => {
  saving.value = true
  const result = await store.update(props.appointment._id, { status })
  saving.value = false
  if (!result.success) { error.value = t('calendar.errors.save'); return }
  emit('saved', { appointment: result.appointment, overlaps: [], created: false })
}

const removeAppt = async () => {
  if (!window.confirm(t('calendar.actions.confirmDelete'))) return
  saving.value = true
  const result = await store.remove(props.appointment._id)
  saving.value = false
  if (!result.success) { error.value = t('calendar.errors.delete'); return }
  emit('deleted', props.appointment)
}

// ---- WhatsApp al lead (mensaje armado, sin envío automático) ----
const leadForWa = computed(() => selectedLead.value || props.appointment?.lead || null)
const waLink = computed(() => {
  const phone = (leadForWa.value?.phone || '').replace(/\D/g, '')
  const startsAt = fromInputs(form.value.date, form.value.time, tz.value)
  if (!phone || !startsAt) return null
  const text = t('calendar.waMessage', {
    name: (leadForWa.value.name || '').split(' ')[0],
    day: formatZoned(startsAt, tz.value, locale.value, { weekday: 'long', day: 'numeric', month: 'long' }),
    time: formatZoned(startsAt, tz.value, locale.value, { hour: '2-digit', minute: '2-digit' })
  })
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
})

const onKey = (e) => { if (e.key === 'Escape') emit('close') }

onMounted(() => {
  if (authStore.isManager && !sellersStore.sellers.length) sellersStore.fetchSellers()
  loadLeads()
})
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" @click.self="emit('close')" @keydown="onKey">
      <div class="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl" role="dialog" aria-modal="true" :aria-label="isEdit ? t('calendar.editTitle') : t('calendar.newTitle')">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ isEdit ? t('calendar.editTitle') : t('calendar.newTitle') }}</h2>
          <button type="button" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" :aria-label="t('help.close')" @click="emit('close')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form class="px-5 py-4 space-y-4" @submit.prevent="save">
          <fieldset :disabled="!canWork || saving" class="space-y-4">
            <!-- Tipo -->
            <div class="grid grid-cols-4 gap-2" role="radiogroup" :aria-label="t('calendar.fields.type')">
              <button
                v-for="type in TYPES" :key="type" type="button" role="radio" :aria-checked="form.type === type"
                @click="form.type = type"
                class="rounded-lg border px-2 py-2 text-xs font-semibold transition-colors"
                :class="form.type === type
                  ? 'border-primary-500 bg-primary-50 text-primary-800 dark:border-primary-300 dark:bg-primary-400/10 dark:text-primary-200'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300'"
              >{{ t(`calendar.types.${type}`) }}</button>
            </div>

            <!-- Lead -->
            <div>
              <label class="label" for="appt-lead">{{ t('calendar.fields.lead') }}</label>
              <p v-if="lockLead" class="input bg-gray-50 dark:bg-gray-800">{{ fixedLead.name }}</p>
              <template v-else>
                <input v-model="leadSearch" type="search" class="input mb-2" :placeholder="t('calendar.fields.searchLead')" :aria-label="t('calendar.fields.searchLead')" />
                <select id="appt-lead" v-model="form.leadId" class="input">
                  <option value="">{{ leadsLoading ? t('common.loading') : t('calendar.fields.noLead') }}</option>
                  <option v-for="lead in shownLeads" :key="lead._id" :value="String(lead._id)">
                    {{ lead.name }}{{ lead.phone ? ` · ${lead.phone}` : '' }}
                  </option>
                </select>
              </template>
            </div>

            <!-- Vendedor (managers) -->
            <div v-if="authStore.isManager">
              <label class="label" for="appt-seller">{{ t('calendar.fields.seller') }}</label>
              <select id="appt-seller" v-model="form.sellerId" class="input" required>
                <option value="" disabled>{{ t('calendar.fields.chooseSeller') }}</option>
                <option v-for="s in sellersStore.sellers" :key="s._id" :value="String(s._id)">{{ s.seller_name }}</option>
              </select>
            </div>

            <!-- Título -->
            <div>
              <label class="label" for="appt-title">{{ t('calendar.fields.title') }}</label>
              <input id="appt-title" v-model="form.title" maxlength="120" class="input" required @input="titleTouched = true" />
            </div>

            <!-- Fecha, hora y duración -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div class="col-span-2 sm:col-span-1">
                <label class="label" for="appt-date">{{ t('calendar.fields.date') }}</label>
                <input id="appt-date" v-model="form.date" type="date" class="input" required />
              </div>
              <div>
                <label class="label" for="appt-time">{{ t('calendar.fields.time') }}</label>
                <input id="appt-time" v-model="form.time" type="time" step="300" class="input" required />
              </div>
              <div>
                <label class="label" for="appt-duration">{{ t('calendar.fields.duration') }}</label>
                <select id="appt-duration" v-model.number="form.duration" class="input">
                  <option v-for="m in durationOptions" :key="m" :value="m">{{ t('calendar.minutes', { n: m }) }}</option>
                  <option value="custom">{{ t('calendar.customEnd') }}</option>
                </select>
              </div>
              <div v-if="form.duration === 'custom'" class="col-span-2 sm:col-span-1 sm:col-start-3">
                <label class="label" for="appt-end">{{ t('calendar.fields.end') }}</label>
                <input id="appt-end" v-model="form.endTime" type="time" step="300" class="input" required />
              </div>
            </div>

            <!-- Recordatorio -->
            <div>
              <label class="label" for="appt-reminder">{{ t('calendar.fields.reminder') }}</label>
              <select id="appt-reminder" v-model.number="form.reminderMinutes" class="input">
                <option v-for="m in REMINDERS" :key="m" :value="m">{{ t(`calendar.reminders.r${m}`) }}</option>
              </select>
            </div>

            <!-- Notas -->
            <div>
              <label class="label" for="appt-notes">{{ t('calendar.fields.notes') }}</label>
              <textarea id="appt-notes" v-model="form.notes" rows="3" maxlength="2000" class="input"></textarea>
            </div>
          </fieldset>

          <p v-if="error" role="alert" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

          <!-- Estado (al editar) -->
          <div v-if="isEdit && canWork" class="flex flex-wrap gap-2 pt-1">
            <template v-if="appointment.status === 'scheduled'">
              <button type="button" class="btn btn-secondary btn-sm" :disabled="saving" @click="setStatus('done')">{{ t('calendar.actions.markDone') }}</button>
              <button type="button" class="btn btn-secondary btn-sm" :disabled="saving" @click="setStatus('no_show')">{{ t('calendar.actions.markNoShow') }}</button>
              <button type="button" class="btn btn-secondary btn-sm" :disabled="saving" @click="setStatus('canceled')">{{ t('calendar.actions.cancel') }}</button>
            </template>
            <template v-else>
              <span class="self-center text-sm text-gray-500 dark:text-gray-400">{{ t(`calendar.statuses.${appointment.status}`) }}</span>
              <button type="button" class="btn btn-secondary btn-sm" :disabled="saving" @click="setStatus('scheduled')">{{ t('calendar.actions.reopen') }}</button>
            </template>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div class="flex items-center gap-3">
              <a v-if="waLink" :href="waLink" target="_blank" rel="noopener noreferrer" class="text-sm font-semibold text-green-700 hover:underline dark:text-green-400">
                {{ t('calendar.actions.whatsapp') }}
              </a>
              <button v-if="isEdit && canWork" type="button" class="text-sm text-red-600 hover:underline dark:text-red-400" :disabled="saving" @click="removeAppt">
                {{ t('calendar.actions.delete') }}
              </button>
            </div>
            <div class="flex gap-2">
              <button type="button" class="btn btn-secondary" @click="emit('close')">{{ canWork ? t('common.cancel') : t('help.close') }}</button>
              <button v-if="canWork" type="submit" class="btn btn-primary" :disabled="saving">{{ t('calendar.actions.save') }}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
