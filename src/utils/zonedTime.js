// Fechas en la zona horaria de la empresa (Config.timezone), sin librerías.
// En la base todo está en UTC; acá se convierte a "hora de pared" de la empresa y viceversa.

const partsCache = new Map()
const formatterFor = (timeZone) => {
  if (!partsCache.has(timeZone)) {
    partsCache.set(timeZone, new Intl.DateTimeFormat('en-US', {
      timeZone, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short'
    }))
  }
  return partsCache.get(timeZone)
}

const WEEKDAYS = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }

export const browserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

export const safeTimeZone = (tz) => {
  if (!tz) return browserTimeZone()
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return tz
  } catch {
    return browserTimeZone()
  }
}

/** Partes de una fecha en la zona: { year, month (1-12), day, hour, minute, weekday (1=lunes) } */
export const zonedParts = (date, timeZone) => {
  const out = {}
  for (const p of formatterFor(timeZone).formatToParts(new Date(date))) {
    if (p.type === 'weekday') out.weekday = WEEKDAYS[p.value]
    else if (p.type !== 'literal') out[p.type] = Number(p.value)
  }
  return out
}

// Diferencia (ms) entre la hora de pared de la zona y UTC en ese instante
const offsetMs = (date, timeZone) => {
  const ts = new Date(date).getTime()
  const p = zonedParts(ts, timeZone)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second || 0)
  return asUtc - Math.floor(ts / 1000) * 1000
}

/** Hora de pared en la zona -> Date (UTC). month es 1-12. */
export const zonedToDate = ({ year, month, day, hour = 0, minute = 0 }, timeZone) => {
  const guess = Date.UTC(year, month - 1, day, hour, minute)
  let ts = guess - offsetMs(guess, timeZone)
  // Segunda pasada por si el cambio de horario cae entre la estimación y el resultado
  ts = guess - offsetMs(ts, timeZone)
  return new Date(ts)
}

/** 'YYYY-MM-DD' del día en la zona */
export const dayKey = (date, timeZone) => {
  const p = zonedParts(date, timeZone)
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`
}

/** Suma días a una fecha civil { year, month, day } (sin horas) */
export const addDays = ({ year, month, day }, n) => {
  const d = new Date(Date.UTC(year, month - 1, day + n))
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
}

/** Lunes de la semana de una fecha civil */
export const startOfWeek = (civil) => {
  const wd = new Date(Date.UTC(civil.year, civil.month - 1, civil.day)).getUTCDay() || 7
  return addDays(civil, 1 - wd)
}

export const civilKey = ({ year, month, day }) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

/** Minutos desde la medianoche (en la zona) */
export const minutesOfDay = (date, timeZone) => {
  const p = zonedParts(date, timeZone)
  return p.hour * 60 + p.minute
}

/** Formatea en la zona con Intl (locale de la app) */
export const formatZoned = (date, timeZone, locale, options) =>
  new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(new Date(date))

/** Valor para <input type="date"> y <input type="time"> en la zona */
export const toInputs = (date, timeZone) => {
  const p = zonedParts(date, timeZone)
  return {
    date: civilKey(p),
    time: `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`
  }
}

/** De <input type="date"> + <input type="time"> (hora de la zona) a Date UTC */
export const fromInputs = (dateStr, timeStr, timeZone) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour, minute] = timeStr.split(':').map(Number)
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null
  return zonedToDate({ year, month, day, hour, minute }, timeZone)
}
