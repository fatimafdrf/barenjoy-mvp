import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type EmployeeRole = 'camarero' | 'cocinero' | 'encargado'
export type EmployeeStatus = 'activo' | 'inactivo' | 'descanso'
export type ShiftType = 'mañana' | 'comida' | 'tarde' | 'cena' | 'noche'

export interface Employee {
  id: string
  name: string
  role: EmployeeRole
  contract: 'indefinido' | 'temporal' | 'tiempo parcial'
  status: EmployeeStatus
  weeklyHours: number
  hourlyCost: number
  availability: string
  rating: number
  avgResponseTime: number // minutes
}

export interface Shift {
  id: string
  employeeId: string
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo'
  shiftType: ShiftType
}

export interface ClockLog {
  id: string
  employeeId: string
  date: string // YYYY-MM-DD
  checkIn: string // HH:MM
  checkOut?: string // HH:MM
  breakMinutes: number
}

export interface PersonalIncident {
  id: string
  employeeName: string
  type: 'vacaciones' | 'baja' | 'ausencia' | 'cambio'
  status: 'pendiente' | 'aprobado' | 'denegado'
  date: string // YYYY-MM-DD
  details: string
}

export const usePersonalStore = defineStore('personal', () => {
  const todayStr = new Date().toISOString().split('T')[0]

  const DEFAULT_EMPLOYEES: Employee[] = [
    { id: 'emp1', name: 'Laura Gómez', role: 'camarero', contract: 'indefinido', status: 'activo', weeklyHours: 40, hourlyCost: 14.00, availability: 'Completa', rating: 4.8, avgResponseTime: 8.5 },
    { id: 'emp2', name: 'Carlos Sánchez', role: 'camarero', contract: 'tiempo parcial', status: 'descanso', weeklyHours: 20, hourlyCost: 12.00, availability: 'Tardes y Fines de semana', rating: 4.5, avgResponseTime: 9.8 },
    { id: 'emp3', name: 'Sofía Díaz', role: 'encargado', contract: 'indefinido', status: 'activo', weeklyHours: 40, hourlyCost: 18.00, availability: 'Completa', rating: 4.9, avgResponseTime: 7.2 },
    { id: 'emp4', name: 'Alejandro Martínez', role: 'cocinero', contract: 'indefinido', status: 'activo', weeklyHours: 40, hourlyCost: 16.00, availability: 'Mañanas y Comidas', rating: 4.7, avgResponseTime: 12.0 }
  ]

  const DEFAULT_SHIFTS: Shift[] = [
    { id: 'sh1', employeeId: 'emp1', day: 'Lunes', shiftType: 'comida' },
    { id: 'sh2', employeeId: 'emp1', day: 'Martes', shiftType: 'cena' },
    { id: 'sh3', employeeId: 'emp2', day: 'Miércoles', shiftType: 'cena' },
    { id: 'sh4', employeeId: 'emp3', day: 'Jueves', shiftType: 'comida' },
    { id: 'sh5', employeeId: 'emp4', day: 'Viernes', shiftType: 'comida' },
    { id: 'sh6', employeeId: 'emp1', day: 'Sábado', shiftType: 'cena' },
    { id: 'sh7', employeeId: 'emp3', day: 'Domingo', shiftType: 'cena' }
  ]

  const DEFAULT_CLOCKS: ClockLog[] = [
    { id: 'clk1', employeeId: 'emp1', date: todayStr, checkIn: '09:00', breakMinutes: 15 },
    { id: 'clk2', employeeId: 'emp3', date: todayStr, checkIn: '08:30', breakMinutes: 30 },
    { id: 'clk3', employeeId: 'emp4', date: todayStr, checkIn: '09:30', breakMinutes: 0 }
  ]

  const DEFAULT_INCIDENTS: PersonalIncident[] = [
    { id: 'inc1', employeeName: 'Carlos Sánchez', type: 'vacaciones', status: 'pendiente', date: '2026-08-10', details: 'Solicitud 5 días vacaciones estivales' },
    { id: 'inc2', employeeName: 'Laura Gómez', type: 'cambio', status: 'aprobado', date: '2026-07-31', details: 'Cambio de turno de cena por comida con Carlos' }
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
  const clockIn = (employeeId: string) => {
    const emp = employees.value.find(e => e.id === employeeId)
    if (emp) {
      emp.status = 'activo'
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      
      // Check if already checked in today
      const existing = clocks.value.find(c => c.employeeId === employeeId && c.date === todayStr)
      if (!existing) {
        clocks.value.unshift({
          id: 'clk-' + Math.random().toString(36).substr(2, 9),
          employeeId,
          date: todayStr,
          checkIn: timeStr,
          breakMinutes: 0
        })
      }
    }
  }

  const clockOut = (employeeId: string) => {
    const emp = employees.value.find(e => e.id === employeeId)
    if (emp) {
      emp.status = 'inactivo'
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      
      const log = clocks.value.find(c => c.employeeId === employeeId && c.date === todayStr && !c.checkOut)
      if (log) {
        log.checkOut = timeStr
      }
    }
  }

  const toggleBreak = (employeeId: string) => {
    const emp = employees.value.find(e => e.id === employeeId)
    if (emp) {
      if (emp.status === 'descanso') {
        emp.status = 'activo'
      } else if (emp.status === 'activo') {
        emp.status = 'descanso'
        const log = clocks.value.find(c => c.employeeId === employeeId && c.date === todayStr)
        if (log) {
          log.breakMinutes += 15 // simulate 15 minute break increments
        }
      }
    }
  }

  const assignShift = (employeeId: string, day: Shift['day'], type: ShiftType) => {
    // Delete existing shift for that employee on that day
    shifts.value = shifts.value.filter(s => !(s.employeeId === employeeId && s.day === day))
    shifts.value.push({
      id: 'sh-' + Math.random().toString(36).substr(2, 9),
      employeeId,
      day,
      shiftType: type
    })
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
    resolveIncident,
    addIncident
  }
})
