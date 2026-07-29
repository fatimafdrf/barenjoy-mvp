import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type BiFilter = 'hoy' | 'ayer' | 'semana' | 'mes' | 'año'

export interface HistoricalSale {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  waiter: string
  itemsCount: number
  total: number
  paymentMethod: 'card' | 'cash'
}

export const useBiStore = defineStore('bi', () => {
  const activeFilter = ref<BiFilter>('semana')

  // Simulated list of historical transactions across different dates
  const HISTORICAL_SALES: HistoricalSale[] = [
    // Hoy
    { id: 'hs1', date: '2026-07-29', time: '13:30', waiter: 'Laura', itemsCount: 4, total: 64.50, paymentMethod: 'card' },
    { id: 'hs2', date: '2026-07-29', time: '14:15', waiter: 'Carlos', itemsCount: 2, total: 28.00, paymentMethod: 'cash' },
    { id: 'hs3', date: '2026-07-29', time: '21:00', waiter: 'Sofía', itemsCount: 6, total: 112.50, paymentMethod: 'card' },
    // Ayer
    { id: 'hs4', date: '2026-07-28', time: '13:00', waiter: 'Laura', itemsCount: 3, total: 42.00, paymentMethod: 'card' },
    { id: 'hs5', date: '2026-07-28', time: '14:30', waiter: 'Carlos', itemsCount: 5, total: 78.50, paymentMethod: 'card' },
    { id: 'hs6', date: '2026-07-28', time: '20:30', waiter: 'Sofía', itemsCount: 8, total: 154.00, paymentMethod: 'card' },
    { id: 'hs7', date: '2026-07-28', time: '22:00', waiter: 'Laura', itemsCount: 2, total: 31.00, paymentMethod: 'cash' },
    // Esta semana (últimos 7 días)
    { id: 'hs8', date: '2026-07-27', time: '14:00', waiter: 'Carlos', itemsCount: 4, total: 60.00, paymentMethod: 'card' },
    { id: 'hs9', date: '2026-07-26', time: '21:30', waiter: 'Sofía', itemsCount: 5, total: 95.00, paymentMethod: 'card' },
    { id: 'hs10', date: '2026-07-25', time: '13:45', waiter: 'Laura', itemsCount: 3, total: 48.50, paymentMethod: 'cash' },
    { id: 'hs11', date: '2026-07-24', time: '22:15', waiter: 'Carlos', itemsCount: 6, total: 104.00, paymentMethod: 'card' },
    // Este mes (últimos 30 días)
    { id: 'hs12', date: '2026-07-15', time: '14:00', waiter: 'Sofía', itemsCount: 4, total: 75.00, paymentMethod: 'card' },
    { id: 'hs13', date: '2026-07-10', time: '21:00', waiter: 'Laura', itemsCount: 5, total: 88.00, paymentMethod: 'card' },
    { id: 'hs14', date: '2026-07-05', time: '13:30', waiter: 'Carlos', itemsCount: 3, total: 45.00, paymentMethod: 'cash' },
    { id: 'hs15', date: '2026-07-01', time: '20:30', waiter: 'Sofía', itemsCount: 7, total: 130.00, paymentMethod: 'card' }
  ]

  const salesByFilter = computed(() => {
    const todayStr = '2026-07-29'
    const yesterdayStr = '2026-07-28'

    if (activeFilter.value === 'hoy') {
      return HISTORICAL_SALES.filter(s => s.date === todayStr)
    }
    if (activeFilter.value === 'ayer') {
      return HISTORICAL_SALES.filter(s => s.date === yesterdayStr)
    }
    if (activeFilter.value === 'semana') {
      // Return last 7 days from today
      return HISTORICAL_SALES.filter(s => s.date >= '2026-07-23')
    }
    if (activeFilter.value === 'mes') {
      // Return last 30 days
      return HISTORICAL_SALES.filter(s => s.date >= '2026-07-01')
    }
    // Default to all
    return HISTORICAL_SALES
  })

  // Executive Core Sales KPIs
  const totalSalesRevenue = computed(() => {
    return salesByFilter.value.reduce((sum, s) => sum + s.total, 0)
  })

  const averageTicket = computed(() => {
    const count = salesByFilter.value.length
    if (count === 0) return 0
    return totalSalesRevenue.value / count
  })

  const totalTicketsCount = computed(() => {
    return salesByFilter.value.length
  })

  // Grouped datasets for SVG Charts
  const salesByHourChart = computed(() => {
    // Group into 3 main slots: 12-16 (Comida), 16-20 (Tarde/Café), 20-00 (Cena)
    const hours = { comida: 0, tarde: 0, cena: 0 }
    salesByFilter.value.forEach(s => {
      const hh = parseInt(s.time.split(':')[0])
      if (hh >= 12 && hh < 16) hours.comida += s.total
      else if (hh >= 16 && hh < 20) hours.tarde += s.total
      else hours.cena += s.total
    })
    return [
      { label: 'Comida (12-16h)', value: hours.comida },
      { label: 'Tarde (16-20h)', value: hours.tarde },
      { label: 'Cena (20-00h)', value: hours.cena }
    ]
  })

  const salesByWaiterChart = computed(() => {
    const waiters: Record<string, number> = {}
    salesByFilter.value.forEach(s => {
      waiters[s.waiter] = (waiters[s.waiter] || 0) + s.total
    })
    return Object.entries(waiters).map(([name, total]) => ({ label: name, value: total }))
  })

  const salesByFamilyChart = computed(() => {
    // Simulated division: 60% food, 40% drinks
    const total = totalSalesRevenue.value
    return [
      { label: 'Comida (Platos)', value: total * 0.62 },
      { label: 'Bebidas', value: total * 0.38 }
    ]
  })

  return {
    activeFilter,
    salesByFilter,
    totalSalesRevenue,
    averageTicket,
    totalTicketsCount,
    salesByHourChart,
    salesByWaiterChart,
    salesByFamilyChart
  }
})
