import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export type TableStatus = 'free' | 'occupied' | 'reserved' | 'bill'
export type OrderItemStatus = 'pending' | 'preparing' | 'ready' | 'served'

export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  price: number
  status: OrderItemStatus
  category: 'tapas' | 'platos' | 'bebidas' | 'postres'
  notes?: string
}

export interface Table {
  id: string
  number: number
  capacity: number
  status: TableStatus
  x: number // percentage-based X coord for floor layout
  y: number // percentage-based Y coord for floor layout
  orders: OrderItem[]
  waiterId?: string
}

export interface CompletedOrder {
  id: string
  tableNumber: number
  itemsCount: number
  total: number
  paymentMethod: 'card' | 'cash'
  timestamp: string // HH:MM
}

export const useMesasStore = defineStore('mesas', () => {
  const DEFAULT_TABLES: Table[] = [
    { id: 't1', number: 1, capacity: 4, status: 'free', x: 15, y: 15, orders: [] },
    {
      id: 't2',
      number: 2,
      capacity: 2,
      status: 'occupied',
      x: 15,
      y: 45,
      orders: [
        { id: 'o1', menuItemId: 'm1', name: 'Croquetas de Jamón Ibérico', quantity: 1, price: 8.5, status: 'preparing', category: 'tapas' },
        { id: 'o2', menuItemId: 'm7', name: 'Caña de Cerveza', quantity: 2, price: 2.5, status: 'served', category: 'bebidas' },
        { id: 'o3', menuItemId: 'm2', name: 'Bravas Aveniq', quantity: 1, price: 6.9, status: 'pending', category: 'tapas' }
      ]
    },
    { id: 't3', number: 3, capacity: 2, status: 'reserved', x: 15, y: 75, orders: [] },
    {
      id: 't4',
      number: 4,
      capacity: 6,
      status: 'bill',
      x: 45,
      y: 15,
      orders: [
        { id: 'o4', menuItemId: 'm4', name: 'Hamburguesa Dry Aged', quantity: 2, price: 14.5, status: 'served', category: 'platos' },
        { id: 'o5', menuItemId: 'm8', name: 'Tinto de Verano', quantity: 2, price: 3.2, status: 'served', category: 'bebidas' },
        { id: 'o6', menuItemId: 'm10', name: 'Coulant de Chocolate', quantity: 1, price: 5.5, status: 'served', category: 'postres' }
      ]
    },
    { id: 't5', number: 5, capacity: 4, status: 'free', x: 45, y: 48, orders: [] },
    { id: 't6', number: 6, capacity: 2, status: 'free', x: 45, y: 78, orders: [] },
    {
      id: 't7',
      number: 7,
      capacity: 1,
      status: 'occupied',
      x: 75,
      y: 15,
      orders: [
        { id: 'o7', menuItemId: 'm9', name: 'Mojito de Fresa', quantity: 1, price: 7.5, status: 'pending', category: 'bebidas' }
      ]
    },
    { id: 't8', number: 8, capacity: 1, status: 'free', x: 75, y: 35, orders: [] },
    { id: 't9', number: 9, capacity: 1, status: 'free', x: 75, y: 55, orders: [] },
    { id: 't10', number: 10, capacity: 4, status: 'free', x: 92, y: 15, orders: [] },
    { id: 't11', number: 11, capacity: 4, status: 'free', x: 92, y: 45, orders: [] },
    { id: 't12', number: 12, capacity: 4, status: 'free', x: 92, y: 75, orders: [] }
  ]

  const DEFAULT_COMPLETED: CompletedOrder[] = [
    { id: 'c1', tableNumber: 3, itemsCount: 4, total: 34.5, paymentMethod: 'card', timestamp: '12:30' },
    { id: 'c2', tableNumber: 5, itemsCount: 6, total: 58.2, paymentMethod: 'card', timestamp: '13:15' },
    { id: 'c3', tableNumber: 1, itemsCount: 2, total: 19.8, paymentMethod: 'cash', timestamp: '14:02' },
    { id: 'c4', tableNumber: 8, itemsCount: 3, total: 24.5, paymentMethod: 'card', timestamp: '14:30' },
    { id: 'c5', tableNumber: 11, itemsCount: 8, total: 98.4, paymentMethod: 'card', timestamp: '15:10' }
  ]

  const loadTables = (): Table[] => {
    try {
      const data = localStorage.getItem('aveniq_tables')
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Error loading tables from localStorage:', e)
    }
    return DEFAULT_TABLES
  }

  const loadCompletedOrders = (): CompletedOrder[] => {
    try {
      const data = localStorage.getItem('aveniq_completed_orders')
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Error loading completed orders from localStorage:', e)
    }
    return DEFAULT_COMPLETED
  }

  const tables = ref<Table[]>(loadTables())
  const completedOrders = ref<CompletedOrder[]>(loadCompletedOrders())

  const saveTables = () => {
    try {
      localStorage.setItem('aveniq_tables', JSON.stringify(tables.value))
    } catch (e) {
      console.error('Error saving tables to localStorage:', e)
    }
  }

  const saveCompletedOrders = () => {
    try {
      localStorage.setItem('aveniq_completed_orders', JSON.stringify(completedOrders.value))
    } catch (e) {
      console.error('Error saving completed orders to localStorage:', e)
    }
  }

  // Watchers for reactive persistence
  watch(tables, () => {
    saveTables()
  }, { deep: true })

  watch(completedOrders, () => {
    saveCompletedOrders()
  }, { deep: true })

  // Get active items needing preparation in kitchen (tapas, platos, postres)
  const kitchenItems = computed(() => {
    const items: Array<{ tableNumber: number; tableId: string; item: OrderItem }> = []
    tables.value.forEach(table => {
      table.orders.forEach(item => {
        if (item.category !== 'bebidas' && (item.status === 'pending' || item.status === 'preparing' || item.status === 'ready')) {
          items.push({
            tableNumber: table.number,
            tableId: table.id,
            item
          })
        }
      })
    })
    return items
  })

  // Get active items needing preparation in bar (bebidas)
  const barItems = computed(() => {
    const items: Array<{ tableNumber: number; tableId: string; item: OrderItem }> = []
    tables.value.forEach(table => {
      table.orders.forEach(item => {
        if (item.category === 'bebidas' && (item.status === 'pending' || item.status === 'preparing' || item.status === 'ready')) {
          items.push({
            tableNumber: table.number,
            tableId: table.id,
            item
          })
        }
      })
    })
    return items
  })

  const setTableStatus = (id: string, status: TableStatus): boolean => {
    const table = tables.value.find(t => t.id === id)
    if (table) {
      if (status === 'free' && table.orders.length > 0) {
        return false
      }
      table.status = status
      if (status === 'free') {
        table.orders = []
      }
      saveTables()
      return true
    }
    return false
  }

  const addItemsToTableOrder = (id: string, itemsToAdd: Array<{ id: string; name: string; price: number; category: any; quantity: number; notes?: string }>) => {
    const table = tables.value.find(t => t.id === id)
    if (table) {
      if (table.status === 'free') {
        table.status = 'occupied'
      }
      itemsToAdd.forEach(item => {
        const normalizedNote = item.notes?.trim() || ''
        const existing = table.orders.find(o => 
          o.menuItemId === item.id && 
          o.status === 'pending' && 
          (o.notes?.trim() || '') === normalizedNote
        )
        if (existing) {
          existing.quantity += item.quantity
        } else {
          table.orders.push({
            id: 'o-' + Math.random().toString(36).substr(2, 9),
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            status: 'pending',
            category: item.category,
            notes: normalizedNote || undefined
          })
        }
      })
      saveTables()
    }
  }

  const updateOrderItemStatus = (tableId: string, orderItemId: string, status: OrderItemStatus) => {
    const table = tables.value.find(t => t.id === tableId)
    if (table) {
      const item = table.orders.find(o => o.id === orderItemId)
      if (item) {
        item.status = status
        saveTables()
      }
    }
  }

  const canCheckoutTable = (id: string): { canCheckout: boolean; hasUnfinished: boolean; hasReadyUnserved: boolean } => {
    const table = tables.value.find(t => t.id === id)
    if (!table || table.orders.length === 0) {
      return { canCheckout: false, hasUnfinished: false, hasReadyUnserved: false }
    }
    
    const hasUnfinished = table.orders.some(o => o.status === 'pending' || o.status === 'preparing')
    const hasReadyUnserved = table.orders.some(o => o.status === 'ready')
    
    return {
      canCheckout: !hasUnfinished,
      hasUnfinished,
      hasReadyUnserved
    }
  }

  const checkoutTable = (id: string, paymentMethod: 'card' | 'cash'): boolean => {
    const table = tables.value.find(t => t.id === id)
    if (table) {
      const { canCheckout } = canCheckoutTable(id)
      if (!canCheckout) {
        return false
      }

      const total = table.orders.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemsCount = table.orders.reduce((sum, item) => sum + item.quantity, 0)
      
      if (total > 0) {
        const now = new Date()
        const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        
        completedOrders.value.push({
          id: 'c-' + Math.random().toString(36).substr(2, 9),
          tableNumber: table.number,
          itemsCount,
          total,
          paymentMethod,
          timestamp
        })
        saveCompletedOrders()
      }
      
      table.status = 'free'
      table.orders = []
      saveTables()
      return true
    }
    return false
  }

  return {
    tables,
    completedOrders,
    kitchenItems,
    barItems,
    setTableStatus,
    addItemsToTableOrder,
    updateOrderItemStatus,
    canCheckoutTable,
    checkoutTable
  }
})
