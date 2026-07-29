import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useMesasStore } from './mesas'

export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'finished' | 'cancelled' | 'noshow'

export interface Reservation {
  id: string
  clientName: string
  phone: string
  email: string
  pax: number
  date: string // YYYY-MM-DD
  time: string // HH:MM
  duration: number // minutes
  status: ReservationStatus
  tableId?: string
  notes?: string
  allergies?: string
  preferences?: string
  celebration?: string
}

export const useReservasStore = defineStore('reservas', () => {
  const mesasStore = useMesasStore()
  const todayStr = new Date().toISOString().split('T')[0]

  const DEFAULT_RESERVATIONS: Reservation[] = [
    {
      id: 'r1',
      clientName: 'Familia Gómez',
      phone: '+34 611 223 344',
      email: 'gomez@example.com',
      pax: 4,
      date: todayStr,
      time: '13:30',
      duration: 90,
      status: 'confirmed',
      tableId: 't1',
      notes: 'Mesa cerca de la ventana si es posible.',
      allergies: 'Marisco',
      preferences: 'Mesa tranquila',
      celebration: 'Cumpleaños abuela'
    },
    {
      id: 'r2',
      clientName: 'Alejandro Martínez',
      phone: '+34 688 990 011',
      email: 'alex.mtz@example.com',
      pax: 2,
      date: todayStr,
      time: '21:00',
      duration: 120,
      status: 'seated',
      tableId: 't2',
      notes: 'Traer una botella de cava frío a la llegada.',
      preferences: 'Intimidad',
      celebration: 'Aniversario'
    },
    {
      id: 'r3',
      clientName: 'Sofía López',
      phone: '+34 655 443 322',
      email: 'sofia.lopez@example.com',
      pax: 6,
      date: todayStr,
      time: '14:00',
      duration: 90,
      status: 'finished',
      tableId: 't4'
    },
    {
      id: 'r4',
      clientName: 'Carlos Sánchez',
      phone: '+34 600 112 233',
      email: 'carlos.sanchez@example.com',
      pax: 4,
      date: todayStr,
      time: '21:30',
      duration: 90,
      status: 'pending',
      tableId: 't5',
      allergies: 'Gluten'
    },
    {
      id: 'r5',
      clientName: 'Elena Díaz',
      phone: '+34 622 778 899',
      email: 'elena.diaz@example.com',
      pax: 2,
      date: todayStr,
      time: '20:30',
      duration: 90,
      status: 'noshow',
      tableId: 't8'
    }
  ]

  const loadReservations = (): Reservation[] => {
    try {
      const data = localStorage.getItem('aveniq_reservations')
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Error loading reservations from localStorage:', e)
    }
    return DEFAULT_RESERVATIONS
  }

  const reservations = ref<Reservation[]>(loadReservations())

  const saveReservations = () => {
    try {
      localStorage.setItem('aveniq_reservations', JSON.stringify(reservations.value))
    } catch (e) {
      console.error('Error saving reservations to localStorage:', e)
    }
  }

  watch(reservations, () => {
    saveReservations()
  }, { deep: true })

  // Actions
  const addReservation = (res: Omit<Reservation, 'id'>) => {
    const newRes: Reservation = {
      ...res,
      id: 'r-' + Math.random().toString(36).substr(2, 9)
    }
    reservations.value.push(newRes)
    
    // Sync status 'reserved' on tables if assigned
    if (newRes.tableId && newRes.status === 'confirmed' && newRes.date === todayStr) {
      mesasStore.setTableStatus(newRes.tableId, 'reserved')
    }
    
    saveReservations()
    return newRes
  }

  const updateReservation = (id: string, updates: Partial<Omit<Reservation, 'id'>>) => {
    const res = reservations.value.find(r => r.id === id)
    if (res) {
      Object.assign(res, updates)
      
      // Sync reserved table state
      if (res.tableId && res.date === todayStr) {
        if (res.status === 'confirmed') {
          mesasStore.setTableStatus(res.tableId, 'reserved')
        } else if (res.status === 'cancelled' || res.status === 'noshow') {
          // If free, reset table
          const table = mesasStore.tables.find(t => t.id === res.tableId)
          if (table && table.status === 'reserved') {
            mesasStore.setTableStatus(res.tableId, 'free')
          }
        }
      }
      
      saveReservations()
      return true
    }
    return false
  }

  const deleteReservation = (id: string) => {
    const index = reservations.value.findIndex(r => r.id === id)
    if (index > -1) {
      const res = reservations.value[index]
      if (res.tableId && res.date === todayStr) {
        const table = mesasStore.tables.find(t => t.id === res.tableId)
        if (table && table.status === 'reserved') {
          mesasStore.setTableStatus(res.tableId, 'free')
        }
      }
      reservations.value.splice(index, 1)
      saveReservations()
      return true
    }
    return false
  }

  const seatReservation = (resId: string, tableId: string) => {
    const res = reservations.value.find(r => r.id === resId)
    if (res) {
      res.status = 'seated'
      res.tableId = tableId
      
      // Coordinate with mesas store to occupy the table
      const table = mesasStore.tables.find(t => t.id === tableId)
      if (table) {
        table.status = 'occupied'
        // If it was empty, give it a default water bottle to initialize the service
        if (table.orders.length === 0) {
          table.orders.push({
            id: 'o-water-' + Math.random().toString(36).substr(2, 9),
            menuItemId: 'm7',
            name: 'Agua Mineral Solán de Cabras',
            quantity: 1,
            price: 3.0,
            status: 'served',
            category: 'bebidas',
            notes: 'Servicio de bienvenida'
          })
        }
      }
      
      saveReservations()
      return true
    }
    return false
  }

  return {
    reservations,
    addReservation,
    updateReservation,
    deleteReservation,
    seatReservation
  }
})
