import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type EmployeeRole = 'camarero' | 'cocinero' | 'encargado'
export type EmployeeStatus = 'activo' | 'inactivo' | 'descanso'
export type ShiftType = 'mañana' | 'comida' | 'tarde' | 'cena' | 'noche'

export type WeekDay = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo'

export interface EmployeeAvailability {
  day: WeekDay
  slots: { start: string; end: string }[]
}

export interface Employee {
  id: string
  name: string
  role: EmployeeRole
  contract: 'indefinido' | 'temporal' | 'tiempo parcial'
  status: EmployeeStatus
  weeklyHours: number
  hourlyCost: number
  availability: EmployeeAvailability[] | string
  rating: number
  avgResponseTime: number
  activeLocationId: string
  allowedLocations: string[]
}

export interface Shift {
  id: string
  employeeId: string
  locationId: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  status: 'draft' | 'review' | 'published'
  // Backward compatibility fields
  day?: WeekDay
  shiftType?: ShiftType
}

export type ShiftConflictMap = Record<string, readonly string[]>

export type UpdateShiftInput =
  | {
      mode: 'legacy'
      employeeId: string
      day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo'
      shiftType: ShiftType
    }
  | {
      mode: 'dated'
      employeeId: string
      date: string
      startTime: string
      endTime: string
    }

export interface ClockBreak {
  start: string // HH:MM
  end?: string // HH:MM
}

export interface ClockLog {
  id: string
  employeeId: string
  locationId: string
  date: string // YYYY-MM-DD
  checkIn: string // HH:MM
  checkOut?: string // HH:MM
  checkInCoords?: { lat: number; lng: number }
  checkOutCoords?: { lat: number; lng: number }
  breaks: ClockBreak[]
  breakMinutes: number
}

export interface PersonalIncident {
  id: string
  employeeName: string
  employeeId?: string
  type: 'vacaciones' | 'ausencia' | 'cambio'
  status: 'pendiente' | 'aprobado' | 'denegado'
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  details: string
  // Backward compatibility fields
  date?: string // YYYY-MM-DD
}

export const usePersonalStore = defineStore('personal', () => {
  const todayStr = new Date().toISOString().split('T')[0]

  const getWeekdayDate = (dayName: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo'): string => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const targetIndex = days.indexOf(dayName)
    const today = new Date()
    const todayIndex = today.getDay()
    const diff = targetIndex - todayIndex
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + diff)
    return targetDate.toISOString().split('T')[0]
  }

  const DEFAULT_EMPLOYEES: Employee[] = [
    {
      id: 'emp1',
      name: 'Laura Gómez',
      role: 'camarero',
      contract: 'indefinido',
      status: 'activo',
      weeklyHours: 40,
      hourlyCost: 14.00,
      availability: 'Completa',
      rating: 4.8,
      avgResponseTime: 8.5,
      activeLocationId: 'loc1',
      allowedLocations: ['loc1']
    },
    {
      id: 'emp2',
      name: 'Carlos Sánchez',
      role: 'camarero',
      contract: 'tiempo parcial',
      status: 'descanso',
      weeklyHours: 20,
      hourlyCost: 12.00,
      availability: 'Tardes y Fines de semana',
      rating: 4.5,
      avgResponseTime: 9.8,
      activeLocationId: 'loc1',
      allowedLocations: ['loc1']
    },
    {
      id: 'emp3',
      name: 'Sofía Díaz',
      role: 'encargado',
      contract: 'indefinido',
      status: 'activo',
      weeklyHours: 40,
      hourlyCost: 18.00,
      availability: 'Completa',
      rating: 4.9,
      avgResponseTime: 7.2,
      activeLocationId: 'loc1',
      allowedLocations: ['loc1']
    },
    {
      id: 'emp4',
      name: 'Alejandro Martínez',
      role: 'cocinero',
      contract: 'indefinido',
      status: 'activo',
      weeklyHours: 40,
      hourlyCost: 16.00,
      availability: 'Mañanas y Comidas',
      rating: 4.7,
      avgResponseTime: 12.0,
      activeLocationId: 'loc1',
      allowedLocations: ['loc1']
    }
  ]

  const DEFAULT_SHIFTS: Shift[] = [
    { id: 'sh1', employeeId: 'emp1', locationId: 'loc1', date: getWeekdayDate('Lunes'), startTime: '09:00', endTime: '17:00', status: 'published', day: 'Lunes', shiftType: 'comida' },
    { id: 'sh2', employeeId: 'emp1', locationId: 'loc1', date: getWeekdayDate('Martes'), startTime: '17:00', endTime: '01:00', status: 'published', day: 'Martes', shiftType: 'cena' },
    { id: 'sh3', employeeId: 'emp2', locationId: 'loc1', date: getWeekdayDate('Miércoles'), startTime: '17:00', endTime: '01:00', status: 'published', day: 'Miércoles', shiftType: 'cena' },
    { id: 'sh4', employeeId: 'emp3', locationId: 'loc1', date: getWeekdayDate('Jueves'), startTime: '09:00', endTime: '17:00', status: 'published', day: 'Jueves', shiftType: 'comida' },
    { id: 'sh5', employeeId: 'emp4', locationId: 'loc1', date: getWeekdayDate('Viernes'), startTime: '09:00', endTime: '17:00', status: 'published', day: 'Viernes', shiftType: 'comida' },
    { id: 'sh6', employeeId: 'emp1', locationId: 'loc1', date: getWeekdayDate('Sábado'), startTime: '17:00', endTime: '01:00', status: 'published', day: 'Sábado', shiftType: 'cena' },
    { id: 'sh7', employeeId: 'emp3', locationId: 'loc1', date: getWeekdayDate('Domingo'), startTime: '17:00', endTime: '01:00', status: 'published', day: 'Domingo', shiftType: 'cena' }
  ]

  const DEFAULT_CLOCKS: ClockLog[] = [
    { id: 'clk1', employeeId: 'emp1', locationId: 'loc1', date: todayStr, checkIn: '09:00', breaks: [], breakMinutes: 15 },
    { id: 'clk2', employeeId: 'emp3', locationId: 'loc1', date: todayStr, checkIn: '08:30', breaks: [], breakMinutes: 30 },
    { id: 'clk3', employeeId: 'emp4', locationId: 'loc1', date: todayStr, checkIn: '09:30', breaks: [], breakMinutes: 0 }
  ]

  const DEFAULT_INCIDENTS: PersonalIncident[] = [
    { id: 'inc1', employeeId: 'emp2', employeeName: 'Carlos Sánchez', type: 'vacaciones', status: 'pendiente', startDate: '2026-08-10', endDate: '2026-08-15', date: '2026-08-10', details: 'Solicitud 5 días vacaciones estivales' },
    { id: 'inc2', employeeId: 'emp1', employeeName: 'Laura Gómez', type: 'cambio', status: 'aprobado', startDate: '2026-07-31', endDate: '2026-07-31', date: '2026-07-31', details: 'Cambio de turno de cena por comida con Carlos' }
  ]

  // Persisted state loading helpers
  const loadState = <T>(key: string, defaultValue: T): T => {
    try {
      const data = localStorage.getItem(key)
      if (data) return JSON.parse(data)
    } catch (e) {
      console.error(`Error loading key ${key} from localStorage:`, e)
    }
    return defaultValue
  }

  const employees = ref<Employee[]>(loadState('aveniq_personal_employees', DEFAULT_EMPLOYEES))
  const shifts = ref<Shift[]>(loadState('aveniq_personal_shifts', DEFAULT_SHIFTS))
  const clocks = ref<ClockLog[]>(loadState('aveniq_personal_clocks', DEFAULT_CLOCKS))
  const incidents = ref<PersonalIncident[]>(loadState('aveniq_personal_incidents', DEFAULT_INCIDENTS))

  // Watchers to trigger persistence
  watch(employees, () => {
    localStorage.setItem('aveniq_personal_employees', JSON.stringify(employees.value))
  }, { deep: true })

  watch(shifts, () => {
    localStorage.setItem('aveniq_personal_shifts', JSON.stringify(shifts.value))
  }, { deep: true })

  watch(clocks, () => {
    localStorage.setItem('aveniq_personal_clocks', JSON.stringify(clocks.value))
  }, { deep: true })

  watch(incidents, () => {
    localStorage.setItem('aveniq_personal_incidents', JSON.stringify(incidents.value))
  }, { deep: true })

  // Core Actions
  const clockIn = (employeeId: string, locationId = 'loc1', coords?: { lat: number; lng: number }) => {
    const emp = employees.value.find(e => e.id === employeeId)
    if (emp) {
      emp.status = 'activo'
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      const existing = clocks.value.find(c => c.employeeId === employeeId && c.date === todayStr)
      if (!existing) {
        clocks.value.unshift({
          id: 'clk-' + Math.random().toString(36).substr(2, 9),
          employeeId,
          locationId,
          date: todayStr,
          checkIn: timeStr,
          checkInCoords: coords,
          breaks: [],
          breakMinutes: 0
        })
      }
    }
  }

  const clockOut = (employeeId: string, locationId = 'loc1', coords?: { lat: number; lng: number }) => {
    const emp = employees.value.find(e => e.id === employeeId)
    if (emp) {
      emp.status = 'inactivo'
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      const log = clocks.value.find(c => c.employeeId === employeeId && c.locationId === locationId && c.date === todayStr && !c.checkOut)
      if (log) {
        log.checkOut = timeStr
        log.checkOutCoords = coords
      }
    }
  }

  const toggleBreak = (employeeId: string) => {
    const emp = employees.value.find(e => e.id === employeeId)
    if (emp) {
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const log = clocks.value.find(c => c.employeeId === employeeId && c.date === todayStr)

      if (emp.status === 'descanso') {
        emp.status = 'activo'
        if (log && log.breaks.length > 0) {
          const lastBreak = log.breaks[log.breaks.length - 1]
          if (!lastBreak.end) {
            lastBreak.end = timeStr
            // Recalculate total break minutes
            let totalMin = 0
            log.breaks.forEach(b => {
              if (b.start && b.end) {
                const [sH, sM] = b.start.split(':').map(Number)
                const [eH, eM] = b.end.split(':').map(Number)
                const diff = (eH * 60 + eM) - (sH * 60 + sM)
                const finalDiff = diff < 0 ? diff + 1440 : diff
                if (finalDiff > 0) totalMin += finalDiff
              }
            })
            log.breakMinutes = totalMin
          }
        }
      } else if (emp.status === 'activo') {
        emp.status = 'descanso'
        if (log) {
          log.breaks.push({ start: timeStr })
        }
      }
    }
  }

  // Strictly typed signatures
  function assignShift(
    employeeId: string,
    day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo',
    type: ShiftType
  ): boolean;
  function assignShift(
    employeeId: string,
    date: string,
    startTime: string,
    endTime: string,
    locationId?: string
  ): boolean;
  function assignShift(
    employeeId: string,
    dateOrDay: string,
    startTimeOrType: string,
    endTime?: string,
    locationId = 'loc1'
  ): boolean {
    if (endTime === undefined) {
      // Legacy signature
      const day = dateOrDay as 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo'
      const type = startTimeOrType as ShiftType

      const validDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
      const validTypes = ['mañana', 'comida', 'tarde', 'cena', 'noche']
      if (!validDays.includes(day) || !validTypes.includes(type)) {
        console.warn(`Intento de asignación de turno inválido: día ${day}, tipo ${type}`)
        return false
      }

      let startTime = '09:00'
      let endTimeVal = '17:00'
      if (type === 'cena') {
        startTime = '17:00'
        endTimeVal = '01:00'
      } else if (type === 'tarde') {
        startTime = '14:00'
        endTimeVal = '22:00'
      } else if (type === 'mañana') {
        startTime = '06:00'
        endTimeVal = '14:00'
      } else if (type === 'noche') {
        startTime = '22:00'
        endTimeVal = '06:00'
      }

      const hasDuplicate = shifts.value.some(s =>
        s.employeeId === employeeId &&
        s.day === day &&
        s.startTime === startTime &&
        s.endTime === endTimeVal
      )
      if (hasDuplicate) {
        console.warn(`Intento de asignación de turno duplicado (legacy): ${employeeId} el ${day} de ${startTime} a ${endTimeVal}`)
        return false
      }

      shifts.value.push({
        id: 'sh-' + Math.random().toString(36).substr(2, 9),
        employeeId,
        locationId,
        date: getWeekdayDate(day),
        startTime,
        endTime: endTimeVal,
        status: 'published',
        day,
        shiftType: type
      })
      return true
    } else {
      // Fechado signature
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      const timeRegex = /^\d{2}:\d{2}$/
      if (!dateRegex.test(dateOrDay) || !timeRegex.test(startTimeOrType) || !timeRegex.test(endTime)) {
        console.warn(`Intento de asignación de turno fechado inválido: fecha ${dateOrDay}, horas ${startTimeOrType}-${endTime}`)
        return false
      }

      const hasDuplicate = shifts.value.some(s =>
        s.employeeId === employeeId &&
        s.date === dateOrDay &&
        s.startTime === startTimeOrType &&
        s.endTime === endTime
      )
      if (hasDuplicate) {
        console.warn(`Intento de asignación de turno duplicado (fechado): ${employeeId} el ${dateOrDay} de ${startTimeOrType} a ${endTime}`)
        return false
      }

      shifts.value.push({
        id: 'sh-' + Math.random().toString(36).substr(2, 9),
        employeeId,
        locationId,
        date: dateOrDay,
        startTime: startTimeOrType,
        endTime,
        status: 'draft'
      })
      return true
    }
  }

  function updateShift(id: string, input: UpdateShiftInput): boolean {
    const shift = shifts.value.find(s => s.id === id)
    if (!shift) return false

    // Ensure compatible mode (no legacy <-> dated silent transformations)
    const isExistingLegacy = shift.day !== undefined
    if (isExistingLegacy && input.mode !== 'legacy') return false
    if (!isExistingLegacy && input.mode !== 'dated') return false

    if (input.mode === 'legacy') {
      let startTime = '09:00'
      let endTimeVal = '17:00'
      if (input.shiftType === 'cena') {
        startTime = '17:00'
        endTimeVal = '01:00'
      } else if (input.shiftType === 'tarde') {
        startTime = '14:00'
        endTimeVal = '22:00'
      } else if (input.shiftType === 'mañana') {
        startTime = '06:00'
        endTimeVal = '14:00'
      } else if (input.shiftType === 'noche') {
        startTime = '22:00'
        endTimeVal = '06:00'
      }

      const hasDuplicate = shifts.value.some(s =>
        s.id !== id &&
        s.employeeId === input.employeeId &&
        s.day === input.day &&
        s.startTime === startTime &&
        s.endTime === endTimeVal
      )
      if (hasDuplicate) return false

      shift.employeeId = input.employeeId
      shift.day = input.day
      shift.shiftType = input.shiftType
      shift.startTime = startTime
      shift.endTime = endTimeVal
    } else {
      const hasDuplicate = shifts.value.some(s =>
        s.id !== id &&
        s.employeeId === input.employeeId &&
        s.date === input.date &&
        s.startTime === input.startTime &&
        s.endTime === input.endTime
      )
      if (hasDuplicate) return false

      shift.employeeId = input.employeeId
      shift.date = input.date
      shift.startTime = input.startTime
      shift.endTime = input.endTime
    }

    shifts.value = [...shifts.value]
    return true
  }

  function deleteShift(id: string): boolean {
    const originalLength = shifts.value.length
    shifts.value = shifts.value.filter(s => s.id !== id)
    return shifts.value.length < originalLength
  }

  function isValidDate(dateStr: string): boolean {
    if (!dateStr) return false
    const parts = dateStr.split('-')
    if (parts.length !== 3) return false
    const y = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10)
    const d = parseInt(parts[2], 10)
    if (isNaN(y) || isNaN(m) || isNaN(d)) return false
    if (y < 2000 || y > 2100) return false
    if (m < 1 || m > 12) return false

    const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0)
    if (isLeap) {
      daysInMonth[2] = 29
    }

    return d >= 1 && d <= daysInMonth[m]
  }

  function getEpochDay(dateStr: string): number {
    if (!isValidDate(dateStr)) return NaN
    const parts = dateStr.split('-')
    const y = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10)
    const d = parseInt(parts[2], 10)

    const adjMonth = m <= 2 ? m + 12 : m
    const adjYear = m <= 2 ? y - 1 : y

    const era = Math.floor((adjYear >= 0 ? adjYear : adjYear - 399) / 400)
    const yoe = adjYear - era * 400
    const doy = Math.floor((153 * (adjMonth - 3) + 2) / 5) + d - 1
    const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy
    return era * 146097 + doe - 719468
  }

  function timeToMinutes(timeStr: string): number {
    if (!timeStr) return NaN
    const parts = timeStr.split(':')
    if (parts.length !== 2) return NaN
    const h = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10)
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return NaN
    return h * 60 + m
  }

  interface AbsoluteInterval {
    startAbs: number
    endAbs: number
    isValid: boolean
  }

  function getAbsoluteInterval(dateStr: string, startTime: string, endTime: string): AbsoluteInterval {
    const epochDay = getEpochDay(dateStr)
    const startMin = timeToMinutes(startTime)
    const endMin = timeToMinutes(endTime)

    if (isNaN(epochDay) || isNaN(startMin) || isNaN(endMin) || startMin === endMin) {
      return { startAbs: NaN, endAbs: NaN, isValid: false }
    }

    const startAbs = epochDay * 1440 + startMin
    let endAbs = epochDay * 1440 + endMin
    if (endMin < startMin) {
      endAbs = (epochDay + 1) * 1440 + endMin
    }

    return { startAbs, endAbs, isValid: true }
  }

  function getPlannedMinutes(employeeId: string, weekStart: string): number {
    const lEpoch = getEpochDay(weekStart)
    if (isNaN(lEpoch)) return 0
    const rEpoch = lEpoch + 6

    let totalMinutes = 0
    const seenKeys = new Set<string>()

    shifts.value.forEach(s => {
      if (s.employeeId !== employeeId) return

      const epochDay = getEpochDay(s.date)
      if (isNaN(epochDay) || epochDay < lEpoch || epochDay > rEpoch) return

      const interval = getAbsoluteInterval(s.date, s.startTime, s.endTime)
      if (!interval.isValid) return

      const duplicateKey = `${s.employeeId}|${s.locationId}|${s.date}|${s.startTime}|${s.endTime}`
      if (seenKeys.has(duplicateKey)) return
      seenKeys.add(duplicateKey)

      totalMinutes += (interval.endAbs - interval.startAbs)
    })

    return totalMinutes
  }

  function getShiftConflicts(employeeId: string, weekStart: string): ShiftConflictMap {
    const lEpoch = getEpochDay(weekStart)
    if (isNaN(lEpoch)) return {}
    const rEpoch = lEpoch + 6

    const candidateShifts = shifts.value.filter(s => {
      if (s.employeeId !== employeeId) return false
      const epoch = getEpochDay(s.date)
      return isNaN(epoch) || (epoch >= lEpoch - 1 && epoch <= rEpoch + 1)
    })

    const conflictsMap: Record<string, string[]> = {}

    candidateShifts.forEach(s => {
      const epoch = getEpochDay(s.date)
      if (!isNaN(epoch) && (epoch < lEpoch || epoch > rEpoch)) return

      const errors: string[] = []

      const interval = getAbsoluteInterval(s.date, s.startTime, s.endTime)
      if (!interval.isValid) {
        errors.push('Horario o fecha inválida')
        conflictsMap[s.id] = errors
        return
      }

      const hasDuplicate = shifts.value.some(other =>
        other.id !== s.id &&
        other.employeeId === s.employeeId &&
        other.locationId === s.locationId &&
        other.date === s.date &&
        other.startTime === s.startTime &&
        other.endTime === s.endTime
      )
      if (hasDuplicate) {
        errors.push('Turno duplicado')
      }

      candidateShifts.forEach(other => {
        if (other.id === s.id) return

        if (other.employeeId === s.employeeId &&
            other.locationId === s.locationId &&
            other.date === s.date &&
            other.startTime === s.startTime &&
            other.endTime === s.endTime) {
          return
        }

        const otherInterval = getAbsoluteInterval(other.date, other.startTime, other.endTime)
        if (!otherInterval.isValid) return

        const maxStart = Math.max(interval.startAbs, otherInterval.startAbs)
        const minEnd = Math.min(interval.endAbs, otherInterval.endAbs)

        if (maxStart < minEnd) {
          const labelTime = `${other.startTime}-${other.endTime}`
          const labelDay = other.day || other.date
          if (other.locationId === s.locationId) {
            errors.push(`Solapamiento con turno de ${labelDay} (${labelTime})`)
          } else {
            errors.push(`Conflicto de local (${other.locationId}) con turno de ${labelDay} (${labelTime})`)
          }
        }
      })

      if (errors.length > 0) {
        conflictsMap[s.id] = errors
      }
    })

    return conflictsMap
  }

  const resolveIncident = (incidentId: string, status: PersonalIncident['status']) => {
    const inc = incidents.value.find(i => i.id === incidentId)
    if (inc) {
      inc.status = status
    }
  }

  const addIncident = (inc: Omit<PersonalIncident, 'id' | 'status'>) => {
    incidents.value.unshift({
      ...inc,
      id: 'inc-' + Math.random().toString(36).substr(2, 9),
      status: 'pendiente'
    })
  }

  return {
    employees,
    shifts,
    clocks,
    incidents,
    clockIn,
    clockOut,
    toggleBreak,
    assignShift,
    updateShift,
    deleteShift,
    resolveIncident,
    addIncident,
    getWeekdayDate,
    getPlannedMinutes,
    getShiftConflicts
  }
})
