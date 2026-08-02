import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useReservasStore } from './reservas'
import { useCrmStore } from './crm'
import { useInventarioStore } from './inventario'
import { useCartaStore } from './carta'

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
  productionStation?: 'BAR' | 'KITCHEN'
  createdAt?: number
}

export interface ServiceZone {
  id: string
  locationId: string
  name: string
  type: 'interior' | 'terrace' | 'other'
  active: boolean
  order: number
}

export type PaymentMethod = 'cash' | 'card' | 'bizum'

export interface PartialPayment {
  id: string
  amountCents: number
  method: PaymentMethod
  createdAt: string
  verifiedManually?: boolean
}

export interface CompletedPayment {
  id: string
  amountCents: number
  method: PaymentMethod
  createdAt: string
  verifiedManually?: boolean
}

export interface SplitShare {
  id: string
  label: string
  amountCents: number
  status: 'pending' | 'paid'
  paymentId?: string
}

export interface EqualSplitPaymentInfo {
  mode: 'equal'
  peopleCount: number
  createdAt: string
  shares: SplitShare[]
}

export interface ProductSplitAllocation {
  id: string
  orderItemId: string
  quantity: number
  unitPriceCents: number
  amountCents: number
}

export interface ProductSplitPerson {
  id: string
  label: string
  allocations: ProductSplitAllocation[]
  amountCents: number
  status: 'pending' | 'paid'
  paymentId?: string
}

export interface ProductSplitPaymentInfo {
  mode: 'products'
  status: 'draft' | 'confirmed'
  peopleCount: number
  createdAt: string
  people: ProductSplitPerson[]
}

export type SplitPaymentInfo =
  | EqualSplitPaymentInfo
  | ProductSplitPaymentInfo

export interface Table {
  id: string
  number: number
  capacity: number
  status: TableStatus
  x: number // percentage-based X coord for floor layout
  y: number // percentage-based Y coord for floor layout
  orders: OrderItem[]
  waiterId?: string
  // Nuevos campos opcionales Evolución 2.8A
  locationId?: string
  zoneId?: string
  type?: 'table' | 'bar'
  active?: boolean
  // Campo opcional Evolución 2.9A
  partialPayments?: PartialPayment[]
  // Campo opcional Evolución 2.9B & 2.9C
  splitPayment?: SplitPaymentInfo
}

export interface NormalizedTable extends Table {
  resolvedLocationId?: string
  resolvedZoneId: string
  resolvedType: 'table' | 'bar'
  resolvedActive: boolean
  isLegacy: boolean
}

export interface MoveTableAccountResult {
  success: boolean
  sourceTableId: string
  targetTableId: string
  movedOrderItemCount: number
  reason?:
    | 'source_not_found'
    | 'target_not_found'
    | 'same_table'
    | 'unknown_location'
    | 'different_location'
    | 'source_free'
    | 'source_not_transferable'
    | 'target_not_free'
    | 'target_has_orders'
    | 'target_reserved'
    | 'target_inactive'
    | 'source_has_partial_payments'
    | 'source_has_active_split'
}

export interface CompletedOrder {
  id: string
  tableNumber: number
  itemsCount: number
  total: number
  paymentMethod: 'card' | 'cash' | 'bizum'
  timestamp: string // HH:MM
  payments?: CompletedPayment[]
  isMixedPayment?: boolean
  splitSummary?: {
    mode: 'equal'
    peopleCount: number
    shares: Array<{
      label: string
      amountCents: number
      paymentId: string
    }>
  }
  productSplitSummary?: {
    mode: 'products'
    peopleCount: number
    people: Array<{
      label: string
      amountCents: number
      paymentId: string
      allocations: Array<{
        orderItemId: string
        productName: string
        quantity: number
        unitPriceCents: number
        amountCents: number
      }>
    }>
  }
}

export interface CheckoutPaymentResult {
  success: boolean
  tableId: string
  paymentId?: string
  paidAmountCents: number
  remainingAmountCents: number
  isFullyPaid: boolean
  reason?:
    | 'table_not_found'
    | 'table_has_no_orders'
    | 'invalid_amount'
    | 'amount_exceeds_remaining'
    | 'invalid_payment_method'
    | 'already_paid'
    | 'manual_verification_required'
}

export interface CreateEqualSplitResult {
  success: boolean
  tableId: string
  peopleCount?: number
  reason?:
    | 'table_not_found'
    | 'table_has_no_orders'
    | 'already_paid'
    | 'existing_partial_payments'
    | 'split_already_exists'
    | 'invalid_people_count'
    | 'too_many_people'
    | 'people_exceeds_cents'
}

export interface PaySplitShareResult {
  success: boolean
  tableId: string
  shareId: string
  paymentId?: string
  paidAmountCents: number
  remainingAmountCents: number
  isFullyPaid: boolean
  reason?:
    | 'table_not_found'
    | 'split_not_found'
    | 'share_not_found'
    | 'share_already_paid'
    | 'invalid_payment_method'
    | 'already_paid'
    | 'amount_mismatch'
    | 'invalid_split_mode'
    | 'manual_verification_required'
}

export interface CancelEqualSplitResult {
  success: boolean
  tableId: string
  reason?:
    | 'table_not_found'
    | 'split_not_found'
    | 'split_has_payments'
}

export interface CreateProductSplitResult {
  success: boolean
  tableId: string
  peopleCount?: number
  reason?:
    | 'table_not_found'
    | 'table_has_no_orders'
    | 'already_paid'
    | 'existing_partial_payments'
    | 'split_already_exists'
    | 'invalid_people_count'
    | 'too_many_people'
}

export interface AssignProductQuantityResult {
  success: boolean
  tableId: string
  personId: string
  orderItemId: string
  reason?:
    | 'table_not_found'
    | 'split_not_found'
    | 'invalid_split_mode'
    | 'invalid_split_status'
    | 'person_not_found'
    | 'person_already_paid'
    | 'order_item_not_found'
    | 'invalid_quantity'
    | 'quantity_exceeds_available'
}

export interface UnassignProductQuantityResult {
  success: boolean
  tableId: string
  personId: string
  orderItemId: string
  reason?:
    | 'table_not_found'
    | 'split_not_found'
    | 'invalid_split_mode'
    | 'invalid_split_status'
    | 'person_not_found'
    | 'person_already_paid'
    | 'allocation_not_found'
    | 'invalid_quantity'
    | 'quantity_exceeds_assigned'
}

export interface ConfirmProductSplitResult {
  success: boolean
  tableId: string
  reason?:
    | 'table_not_found'
    | 'split_not_found'
    | 'invalid_split_mode'
    | 'invalid_split_status'
    | 'unassigned_products'
    | 'overassigned_products'
    | 'person_has_no_allocations'
    | 'amount_mismatch'
    | 'existing_partial_payments'
}

export interface PayProductSplitPersonResult {
  success: boolean
  tableId: string
  personId: string
  paymentId?: string
  paidAmountCents: number
  remainingAmountCents: number
  isFullyPaid: boolean
  reason?:
    | 'table_not_found'
    | 'split_not_found'
    | 'invalid_split_mode'
    | 'invalid_split_status'
    | 'person_not_found'
    | 'person_already_paid'
    | 'invalid_payment_method'
    | 'amount_mismatch'
    | 'already_paid'
    | 'manual_verification_required'
}

export interface CancelProductSplitResult {
  success: boolean
  tableId: string
  reason?:
    | 'table_not_found'
    | 'split_not_found'
    | 'invalid_split_mode'
    | 'split_has_payments'
}

export const useMesasStore = defineStore('mesas', () => {
  const DEFAULT_TABLES: Table[] = [
    { id: 't1', number: 1, capacity: 4, status: 'free', x: 15, y: 15, orders: [], locationId: 'l1', zoneId: 'z1', type: 'table', active: true },
    {
      id: 't2',
      number: 2,
      capacity: 2,
      status: 'occupied',
      x: 15,
      y: 45,
      orders: [
        { id: 'o1', menuItemId: 'm1', name: 'Croquetas de Jamón Ibérico', quantity: 1, price: 8.5, status: 'preparing', category: 'tapas', productionStation: 'KITCHEN' },
        { id: 'o2', menuItemId: 'm7', name: 'Caña de Cerveza', quantity: 2, price: 2.5, status: 'served', category: 'bebidas', productionStation: 'BAR' },
        { id: 'o3', menuItemId: 'm2', name: 'Bravas Aveniq', quantity: 1, price: 6.9, status: 'pending', category: 'tapas', productionStation: 'KITCHEN' }
      ],
      locationId: 'l1',
      zoneId: 'z1',
      type: 'table',
      active: true
    },
    { id: 't3', number: 3, capacity: 2, status: 'reserved', x: 15, y: 75, orders: [], locationId: 'l1', zoneId: 'z1', type: 'table', active: true },
    {
      id: 't4',
      number: 4,
      capacity: 6,
      status: 'bill',
      x: 45,
      y: 15,
      orders: [
        { id: 'o4', menuItemId: 'm4', name: 'Hamburguesa Dry Aged', quantity: 2, price: 14.5, status: 'served', category: 'platos', productionStation: 'KITCHEN' },
        { id: 'o5', menuItemId: 'm8', name: 'Tinto de Verano', quantity: 2, price: 3.2, status: 'served', category: 'bebidas', productionStation: 'BAR' },
        { id: 'o6', menuItemId: 'm10', name: 'Coulant de Chocolate', quantity: 1, price: 5.5, status: 'served', category: 'postres', productionStation: 'KITCHEN' }
      ],
      locationId: 'l1',
      zoneId: 'z1',
      type: 'table',
      active: true
    },
    { id: 't5', number: 5, capacity: 4, status: 'free', x: 45, y: 48, orders: [], locationId: 'l1', zoneId: 'z1', type: 'table', active: true },
    { id: 't6', number: 6, capacity: 2, status: 'free', x: 45, y: 78, orders: [], locationId: 'l1', zoneId: 'z1', type: 'table', active: true },
    {
      id: 't7',
      number: 7,
      capacity: 1,
      status: 'occupied',
      x: 75,
      y: 15,
      orders: [
        { id: 'o7', menuItemId: 'm9', name: 'Mojito de Fresa', quantity: 1, price: 7.5, status: 'pending', category: 'bebidas', productionStation: 'BAR' }
      ],
      locationId: 'l1',
      zoneId: 'z2',
      type: 'bar',
      active: true
    },
    { id: 't8', number: 8, capacity: 1, status: 'free', x: 75, y: 35, orders: [], locationId: 'l1', zoneId: 'z2', type: 'bar', active: true },
    { id: 't9', number: 9, capacity: 1, status: 'free', x: 75, y: 55, orders: [], locationId: 'l1', zoneId: 'z2', type: 'bar', active: true },
    { id: 't10', number: 10, capacity: 4, status: 'free', x: 92, y: 15, orders: [], locationId: 'l1', zoneId: 'z3', type: 'table', active: true },
    { id: 't11', number: 11, capacity: 4, status: 'free', x: 92, y: 45, orders: [], locationId: 'l1', zoneId: 'z3', type: 'table', active: true },
    { id: 't12', number: 12, capacity: 4, status: 'free', x: 92, y: 75, orders: [], locationId: 'l1', zoneId: 'z3', type: 'table', active: true }
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

  const DEFAULT_SERVICE_ZONES: ServiceZone[] = [
    {
      id: 'z1',
      locationId: 'l1',
      name: 'Sala interior',
      type: 'interior',
      active: true,
      order: 1
    },
    {
      id: 'z2',
      locationId: 'l1',
      name: 'Barra interior',
      type: 'interior',
      active: true,
      order: 2
    },
    {
      id: 'z3',
      locationId: 'l1',
      name: 'Terraza exterior',
      type: 'terrace',
      active: true,
      order: 3
    }
  ]

  const serviceZones = ref<ServiceZone[]>(DEFAULT_SERVICE_ZONES)

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
        const station = item.productionStation || (item.category === 'bebidas' ? 'BAR' : 'KITCHEN')
        if (station === 'KITCHEN' && (item.status === 'pending' || item.status === 'preparing' || item.status === 'ready')) {
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
        const station = item.productionStation || (item.category === 'bebidas' ? 'BAR' : 'KITCHEN')
        if (station === 'BAR' && (item.status === 'pending' || item.status === 'preparing' || item.status === 'ready')) {
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

  const addItemsToTableOrder = (id: string, itemsToAdd: Array<{ id: string; name: string; price: number; category: any; quantity: number; notes?: string; productionStation?: 'BAR' | 'KITCHEN' }>) => {
    const table = tables.value.find(t => t.id === id)
    if (table) {
      if (table.status === 'free') {
        table.status = 'occupied'
      }
      const cartaStore = useCartaStore()
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
          const menuItem = cartaStore.menuItems.find(m => m.id === item.id)
          const station = item.productionStation ?? menuItem?.productionStation ?? (item.category === 'bebidas' ? 'BAR' : 'KITCHEN')
          table.orders.push({
            id: 'o-' + Math.random().toString(36).substr(2, 9),
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            status: 'pending',
            category: item.category,
            notes: normalizedNote || undefined,
            productionStation: station,
            createdAt: Date.now()
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
        const oldStatus = item.status
        item.status = status

        // Descontar automáticamente stock de ingredientes si pasa a 'ready'
        if (status === 'ready' && oldStatus !== 'ready') {
          const inventarioStore = useInventarioStore()
          const station = item.productionStation || (item.category === 'bebidas' ? 'BAR' : 'KITCHEN')
          const source = station === 'BAR' ? 'Barra (BDS)' : 'Cocina (KDS)'
          inventarioStore.discountRawStock(item.name, item.quantity, source)
        }

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

  function getTableTotalCents(tableId: string): number {
    const table = tables.value.find(t => t.id === tableId)
    if (!table) return 0
    return table.orders.reduce((sum, item) => {
      const priceCents = Math.round(item.price * 100)
      return sum + (priceCents * item.quantity)
    }, 0)
  }

  function getTablePaidCents(tableId: string): number {
    const table = tables.value.find(t => t.id === tableId)
    if (!table || !table.partialPayments) return 0
    return table.partialPayments.reduce((sum, payment) => sum + payment.amountCents, 0)
  }

  function getTableRemainingCents(tableId: string): number {
    const total = getTableTotalCents(tableId)
    const paid = getTablePaidCents(tableId)
    const remaining = total - paid
    return remaining < 0 ? 0 : remaining
  }

  function executeTableCheckout(table: Table, allPayments: CompletedPayment[], totalCents: number) {
    const uniqueMethods = new Set(allPayments.map(payment => payment.method))
    const isMixedPayment = uniqueMethods.size > 1
    let paymentMethodLegacy: 'card' | 'cash' | 'bizum' = 'card'
    if (uniqueMethods.size === 1) {
      paymentMethodLegacy = Array.from(uniqueMethods)[0]
    } else {
      paymentMethodLegacy = 'card'
    }

    const now = new Date()
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const itemsCount = table.orders.reduce((sum, item) => sum + item.quantity, 0)
    const totalInEuros = totalCents / 100

    let splitSummary: CompletedOrder['splitSummary'] = undefined
    let productSplitSummary: CompletedOrder['productSplitSummary'] = undefined
    if (table.splitPayment) {
      if (table.splitPayment.mode === 'equal') {
        splitSummary = {
          mode: 'equal',
          peopleCount: table.splitPayment.peopleCount,
          shares: table.splitPayment.shares.map(s => ({
            label: s.label,
            amountCents: s.amountCents,
            paymentId: s.paymentId || ''
          }))
        }
      } else if (table.splitPayment.mode === 'products') {
        productSplitSummary = {
          mode: 'products',
          peopleCount: table.splitPayment.peopleCount,
          people: table.splitPayment.people.map(p => ({
            label: p.label,
            amountCents: p.amountCents,
            paymentId: p.paymentId || '',
            allocations: p.allocations.map(a => {
              const item = table.orders.find(o => o.id === a.orderItemId)
              const productName = item ? item.name : 'Producto desconocido'
              return {
                orderItemId: a.orderItemId,
                productName,
                quantity: a.quantity,
                unitPriceCents: a.unitPriceCents,
                amountCents: a.amountCents
              }
            })
          }))
        }
      }
    }

    completedOrders.value.push({
      id: 'c-' + Math.random().toString(36).substr(2, 9),
      tableNumber: table.number,
      itemsCount,
      total: totalInEuros,
      paymentMethod: paymentMethodLegacy,
      timestamp,
      payments: allPayments,
      isMixedPayment,
      splitSummary,
      productSplitSummary
    })
    saveCompletedOrders()

    const inventarioStore = useInventarioStore()
    table.orders.forEach(item => {
      inventarioStore.addMovement({
        user: 'Caja POS',
        type: 'salida',
        productName: item.name,
        quantity: -item.quantity,
        reason: `Venta Caja POS - Mesa ${table.number}`
      })
    })

    const reservasStore = useReservasStore()
    const crmStore = useCrmStore()
    const activeRes = reservasStore.reservations.find(r => r.tableId === table.id && r.status === 'seated')
    if (activeRes) {
      crmStore.addVisit(activeRes.clientName, totalInEuros, table.number)
      activeRes.status = 'finished'
    }

    const nextTables: Table[] = tables.value.map(t => {
      if (t.id === table.id) {
        return {
          ...t,
          status: 'free',
          orders: [],
          waiterId: undefined,
          partialPayments: [],
          splitPayment: undefined
        } as Table
      }
      return t
    })

    tables.value = nextTables
    saveTables()
  }

  function registerTablePayment(input: {
    tableId: string
    amountCents: number
    method: PaymentMethod
    verifiedManually?: boolean
  }): CheckoutPaymentResult {
    const { tableId, amountCents, method, verifiedManually } = input

    const table = tables.value.find(t => t.id === tableId)
    if (!table) {
      return { success: false, tableId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'table_not_found' }
    }

    if (!table.orders || table.orders.length === 0) {
      return { success: false, tableId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'table_has_no_orders' }
    }

    if (table.splitPayment) {
      return { success: false, tableId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'already_paid' }
    }

    if (method !== 'cash' && method !== 'card' && method !== 'bizum') {
      return { success: false, tableId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'invalid_payment_method' }
    }

    if (method === 'bizum' && verifiedManually !== true) {
      return { success: false, tableId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'manual_verification_required' }
    }

    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return { success: false, tableId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'invalid_amount' }
    }

    const totalCents = getTableTotalCents(tableId)
    const paidCentsBefore = getTablePaidCents(tableId)
    const remainingCentsBefore = getTableRemainingCents(tableId)

    if (remainingCentsBefore === 0) {
      return { success: false, tableId, paidAmountCents: paidCentsBefore, remainingAmountCents: 0, isFullyPaid: true, reason: 'already_paid' }
    }

    if (amountCents > remainingCentsBefore) {
      return { success: false, tableId, paidAmountCents: paidCentsBefore, remainingAmountCents: remainingCentsBefore, isFullyPaid: false, reason: 'amount_exceeds_remaining' }
    }

    const isFullyPaid = (amountCents === remainingCentsBefore)
    const newPaidCents = paidCentsBefore + amountCents
    const newRemainingCents = remainingCentsBefore - amountCents
    const paymentId = 'pay-' + Math.random().toString(36).substr(2, 9)

    if (!isFullyPaid) {
      const newPayment: PartialPayment = {
        id: paymentId,
        amountCents,
        method,
        createdAt: new Date().toISOString(),
        ...(method === 'bizum' ? { verifiedManually: true } : {})
      }

      const nextTables: Table[] = tables.value.map(t => {
        if (t.id === tableId) {
          const currentPayments = t.partialPayments ? [...t.partialPayments] : []
          return {
            ...t,
            status: 'bill',
            partialPayments: [...currentPayments, newPayment]
          } as Table
        }
        return t
      })

      tables.value = nextTables
      saveTables()

      return {
        success: true,
        tableId,
        paymentId,
        paidAmountCents: newPaidCents,
        remainingAmountCents: newRemainingCents,
        isFullyPaid: false
      }
    } else {
      const currentPayments = table.partialPayments ? [...table.partialPayments] : []
      const finalPayment: CompletedPayment = {
        id: paymentId,
        amountCents,
        method,
        createdAt: new Date().toISOString(),
        ...(method === 'bizum' ? { verifiedManually: true } : {})
      }
      const allPayments: CompletedPayment[] = [...currentPayments, finalPayment]

      executeTableCheckout(table, allPayments, totalCents)

      return {
        success: true,
        tableId,
        paymentId,
        paidAmountCents: newPaidCents,
        remainingAmountCents: newRemainingCents,
        isFullyPaid: true
      }
    }
  }

  const checkoutTable = (id: string, paymentMethod: 'card' | 'cash' | 'bizum', verifiedManually?: boolean): boolean => {
    const table = tables.value.find(t => t.id === id)
    if (table) {
      const { canCheckout } = canCheckoutTable(id)
      if (!canCheckout) {
        return false
      }

      if (paymentMethod === 'bizum' && verifiedManually !== true) {
        return false
      }

      const method: PaymentMethod = paymentMethod
      const res = registerTablePayment({
        tableId: id,
        amountCents: getTableRemainingCents(id),
        method,
        verifiedManually
      })
      return res.success
    }
    return false
  }

  function createEqualSplit(
    tableId: string,
    peopleCount: number
  ): CreateEqualSplitResult {
    const table = tables.value.find(t => t.id === tableId)
    if (!table) {
      return { success: false, tableId, reason: 'table_not_found' }
    }

    if (!table.orders || table.orders.length === 0) {
      return { success: false, tableId, reason: 'table_has_no_orders' }
    }

    const totalCents = getTableTotalCents(tableId)
    if (totalCents <= 0) {
      return { success: false, tableId, reason: 'table_has_no_orders' }
    }

    const remainingCents = getTableRemainingCents(tableId)
    if (remainingCents === 0) {
      return { success: false, tableId, reason: 'already_paid' }
    }

    if (table.partialPayments && table.partialPayments.length > 0) {
      return { success: false, tableId, reason: 'existing_partial_payments' }
    }

    if (table.splitPayment) {
      return { success: false, tableId, reason: 'split_already_exists' }
    }

    if (!Number.isInteger(peopleCount) || peopleCount < 2) {
      return { success: false, tableId, reason: 'invalid_people_count' }
    }

    if (peopleCount > 20) {
      return { success: false, tableId, reason: 'too_many_people' }
    }

    if (peopleCount > remainingCents) {
      return { success: false, tableId, reason: 'people_exceeds_cents' }
    }

    const base = Math.floor(totalCents / peopleCount)
    const remainder = totalCents % peopleCount

    const shares: SplitShare[] = []
    for (let i = 0; i < peopleCount; i++) {
      const amountCents = i < remainder ? base + 1 : base
      shares.push({
        id: `share-${i + 1}-${Math.random().toString(36).substr(2, 5)}`,
        label: `Persona ${i + 1}`,
        amountCents,
        status: 'pending'
      })
    }

    const nextTables: Table[] = tables.value.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status: 'bill',
          splitPayment: {
            mode: 'equal',
            peopleCount,
            createdAt: new Date().toISOString(),
            shares
          }
        } as Table
      }
      return t
    })

    tables.value = nextTables
    saveTables()

    return { success: true, tableId, peopleCount }
  }

  function paySplitShare(input: {
    tableId: string
    shareId: string
    method: PaymentMethod
    verifiedManually?: boolean
  }): PaySplitShareResult {
    const { tableId, shareId, method, verifiedManually } = input

    const table = tables.value.find(t => t.id === tableId)
    if (!table) {
      return { success: false, tableId, shareId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'table_not_found' }
    }

    if (!table.splitPayment) {
      return { success: false, tableId, shareId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'split_not_found' }
    }

    if (table.splitPayment.mode !== 'equal') {
      return { success: false, tableId, shareId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'invalid_split_mode' }
    }

    const share = table.splitPayment.shares.find(s => s.id === shareId)
    if (!share) {
      return { success: false, tableId, shareId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'share_not_found' }
    }

    if (share.status === 'paid') {
      return { success: false, tableId, shareId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'share_already_paid' }
    }

    if (method !== 'cash' && method !== 'card' && method !== 'bizum') {
      return { success: false, tableId, shareId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'invalid_payment_method' }
    }

    if (method === 'bizum' && verifiedManually !== true) {
      return { success: false, tableId, shareId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'manual_verification_required' }
    }

    const amountCents = share.amountCents
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return { success: false, tableId, shareId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'amount_mismatch' }
    }

    const totalCents = getTableTotalCents(tableId)
    const paidCentsBefore = getTablePaidCents(tableId)
    const remainingCentsBefore = getTableRemainingCents(tableId)

    if (remainingCentsBefore === 0) {
      return { success: false, tableId, shareId, paidAmountCents: paidCentsBefore, remainingAmountCents: 0, isFullyPaid: true, reason: 'already_paid' }
    }

    const paymentId = 'pay-' + Math.random().toString(36).substr(2, 9)
    const isLastShare = table.splitPayment.shares.filter(s => s.status === 'pending').length === 1

    const updatedShares: SplitShare[] = table.splitPayment.shares.map(s => {
      if (s.id === shareId) {
        return {
          ...s,
          status: 'paid',
          paymentId
        }
      }
      return s
    })

    const newPayment: PartialPayment = {
      id: paymentId,
      amountCents,
      method,
      createdAt: new Date().toISOString(),
      ...(method === 'bizum' ? { verifiedManually: true } : {})
    }

    const currentPayments = table.partialPayments ? [...table.partialPayments] : []
    const allPayments = [...currentPayments, newPayment]

    if (!isLastShare) {
      const nextTables: Table[] = tables.value.map(t => {
        if (t.id === tableId) {
          return {
            ...t,
            status: 'bill',
            partialPayments: allPayments,
            splitPayment: {
              ...t.splitPayment!,
              shares: updatedShares
            }
          } as Table
        }
        return t
      })

      tables.value = nextTables
      saveTables()

      return {
        success: true,
        tableId,
        shareId,
        paymentId,
        paidAmountCents: paidCentsBefore + amountCents,
        remainingAmountCents: remainingCentsBefore - amountCents,
        isFullyPaid: false
      }
    } else {
      table.splitPayment.shares = updatedShares
      executeTableCheckout(table, allPayments, totalCents)

      return {
        success: true,
        tableId,
        shareId,
        paymentId,
        paidAmountCents: totalCents,
        remainingAmountCents: 0,
        isFullyPaid: true
      }
    }
  }

  function cancelEqualSplit(tableId: string): CancelEqualSplitResult {
    const table = tables.value.find(t => t.id === tableId)
    if (!table) {
      return { success: false, tableId, reason: 'table_not_found' }
    }

    if (!table.splitPayment) {
      return { success: false, tableId, reason: 'split_not_found' }
    }

    if (table.splitPayment.mode !== 'equal') {
      return { success: false, tableId, reason: 'split_not_found' }
    }

    const hasPayments = table.splitPayment.shares.some(s => s.status === 'paid')
    if (hasPayments) {
      return { success: false, tableId, reason: 'split_has_payments' }
    }

    const nextTables: Table[] = tables.value.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status: 'bill',
          splitPayment: undefined
        } as Table
      }
      return t
    })

    tables.value = nextTables
    saveTables()

    return { success: true, tableId }
  }

  function getServiceZones(locationId?: string): ServiceZone[] {
    if (!locationId) {
      return [...serviceZones.value]
    }
    return serviceZones.value.filter(z => z.locationId === locationId)
  }

  function getNormalizedTables(locationId?: string): NormalizedTable[] {
    return tables.value
      .map(table => {
        const isLegacy = !table.locationId || !table.zoneId || !table.type || table.active === undefined
        return {
          ...table,
          resolvedLocationId: table.locationId,
          resolvedZoneId: table.zoneId || 'legacy',
          resolvedType: table.type || 'table',
          resolvedActive: table.active !== undefined ? table.active : true,
          isLegacy
        }
      })
      .filter(table => {
        if (!locationId) return true
        return table.resolvedLocationId === locationId
      })
  }

  function moveTableAccount(
    sourceTableId: string,
    targetTableId: string
  ): MoveTableAccountResult {
    const source = tables.value.find(t => t.id === sourceTableId)
    if (!source) {
      return { success: false, sourceTableId, targetTableId, movedOrderItemCount: 0, reason: 'source_not_found' }
    }

    const target = tables.value.find(t => t.id === targetTableId)
    if (!target) {
      return { success: false, sourceTableId, targetTableId, movedOrderItemCount: 0, reason: 'target_not_found' }
    }

    if (sourceTableId === targetTableId) {
      return { success: false, sourceTableId, targetTableId, movedOrderItemCount: 0, reason: 'same_table' }
    }

    if (!source.locationId || !target.locationId) {
      return { success: false, sourceTableId, targetTableId, movedOrderItemCount: 0, reason: 'unknown_location' }
    }

    if (source.locationId !== target.locationId) {
      return { success: false, sourceTableId, targetTableId, movedOrderItemCount: 0, reason: 'different_location' }
    }

    if (source.partialPayments && source.partialPayments.length > 0) {
      return { success: false, sourceTableId, targetTableId, movedOrderItemCount: 0, reason: 'source_has_partial_payments' }
    }

    if (source.splitPayment) {
      return { success: false, sourceTableId, targetTableId, movedOrderItemCount: 0, reason: 'source_has_active_split' }
    }

    if (source.status === 'free') {
      return { success: false, sourceTableId, targetTableId, movedOrderItemCount: 0, reason: 'source_free' }
    }

    if (source.status !== 'occupied' || source.orders.length === 0) {
      return { success: false, sourceTableId, targetTableId, movedOrderItemCount: 0, reason: 'source_not_transferable' }
    }

    if (target.active === false) {
      return { success: false, sourceTableId, targetTableId, movedOrderItemCount: 0, reason: 'target_inactive' }
    }

    if (target.status === 'reserved') {
      return { success: false, sourceTableId, targetTableId, movedOrderItemCount: 0, reason: 'target_reserved' }
    }

    if (target.status !== 'free') {
      return { success: false, sourceTableId, targetTableId, movedOrderItemCount: 0, reason: 'target_not_free' }
    }

    if (target.orders && target.orders.length > 0) {
      return { success: false, sourceTableId, targetTableId, movedOrderItemCount: 0, reason: 'target_has_orders' }
    }

    const movedOrderItemCount = source.orders.length

    // Atomic update
    const nextTables: Table[] = tables.value.map(table => {
      if (table.id === sourceTableId) {
        return {
          ...table,
          status: 'free',
          orders: [],
          waiterId: undefined
        } as Table
      }
      if (table.id === targetTableId) {
        return {
          ...table,
          status: 'occupied',
          orders: [...source.orders],
          waiterId: source.waiterId
        } as Table
      }
      return table
    })

    tables.value = nextTables
    saveTables()

    return {
      success: true,
      sourceTableId,
      targetTableId,
      movedOrderItemCount
    }
  }

  function getUnassignedQuantity(tableId: string, orderItemId: string): number {
    const table = tables.value.find(t => t.id === tableId)
    if (!table) return 0
    const orderItem = table.orders.find(o => o.id === orderItemId)
    if (!orderItem) return 0
    const originalQuantity = orderItem.quantity
    let assigned = 0
    if (table.splitPayment && table.splitPayment.mode === 'products') {
      table.splitPayment.people.forEach(p => {
        const alloc = p.allocations.find(a => a.orderItemId === orderItemId)
        if (alloc) {
          assigned += alloc.quantity
        }
      })
    }
    const rem = originalQuantity - assigned
    return rem < 0 ? 0 : rem
  }

  function createProductSplit(tableId: string, peopleCount: number): CreateProductSplitResult {
    const table = tables.value.find(t => t.id === tableId)
    if (!table) return { success: false, tableId, reason: 'table_not_found' }
    if (!table.orders || table.orders.length === 0) return { success: false, tableId, reason: 'table_has_no_orders' }
    const totalCents = getTableTotalCents(tableId)
    if (totalCents <= 0) return { success: false, tableId, reason: 'table_has_no_orders' }
    const remainingCents = getTableRemainingCents(tableId)
    if (remainingCents === 0) return { success: false, tableId, reason: 'already_paid' }
    if (table.partialPayments && table.partialPayments.length > 0) {
      return { success: false, tableId, reason: 'existing_partial_payments' }
    }
    if (table.splitPayment) return { success: false, tableId, reason: 'split_already_exists' }
    if (!Number.isInteger(peopleCount) || peopleCount < 2) return { success: false, tableId, reason: 'invalid_people_count' }
    if (peopleCount > 20) return { success: false, tableId, reason: 'too_many_people' }

    const people: ProductSplitPerson[] = []
    for (let i = 0; i < peopleCount; i++) {
      people.push({
        id: `person-${i + 1}-${Math.random().toString(36).substr(2, 5)}`,
        label: `Persona ${i + 1}`,
        allocations: [],
        amountCents: 0,
        status: 'pending'
      })
    }

    const nextTables: Table[] = tables.value.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status: 'bill',
          splitPayment: {
            mode: 'products',
            status: 'draft',
            peopleCount,
            createdAt: new Date().toISOString(),
            people
          }
        } as Table
      }
      return t
    })

    tables.value = nextTables
    saveTables()
    return { success: true, tableId, peopleCount }
  }

  function assignProductQuantity(input: {
    tableId: string
    personId: string
    orderItemId: string
    quantity: number
  }): AssignProductQuantityResult {
    const { tableId, personId, orderItemId, quantity } = input
    const table = tables.value.find(t => t.id === tableId)
    if (!table) return { success: false, tableId, personId, orderItemId, reason: 'table_not_found' }
    if (!table.splitPayment) return { success: false, tableId, personId, orderItemId, reason: 'split_not_found' }
    if (table.splitPayment.mode !== 'products') return { success: false, tableId, personId, orderItemId, reason: 'invalid_split_mode' }
    if (table.splitPayment.status !== 'draft') return { success: false, tableId, personId, orderItemId, reason: 'invalid_split_status' }

    const person = table.splitPayment.people.find(p => p.id === personId)
    if (!person) return { success: false, tableId, personId, orderItemId, reason: 'person_not_found' }
    if (person.status === 'paid') return { success: false, tableId, personId, orderItemId, reason: 'person_already_paid' }

    const orderItem = table.orders.find(o => o.id === orderItemId)
    if (!orderItem) return { success: false, tableId, personId, orderItemId, reason: 'order_item_not_found' }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { success: false, tableId, personId, orderItemId, reason: 'invalid_quantity' }
    }

    const available = getUnassignedQuantity(tableId, orderItemId)
    if (quantity > available) {
      return { success: false, tableId, personId, orderItemId, reason: 'quantity_exceeds_available' }
    }

    const unitPriceCents = Math.round(orderItem.price * 100)
    const amountCents = unitPriceCents * quantity

    const updatedPeople = table.splitPayment.people.map(p => {
      if (p.id === personId) {
        const existingAlloc = p.allocations.find(a => a.orderItemId === orderItemId)
        let newAllocations = [...p.allocations]
        if (existingAlloc) {
          newAllocations = p.allocations.map(a => {
            if (a.orderItemId === orderItemId) {
              const nextQty = a.quantity + quantity
              return {
                ...a,
                quantity: nextQty,
                amountCents: a.unitPriceCents * nextQty
              }
            }
            return a
          })
        } else {
          newAllocations.push({
            id: `alloc-${Math.random().toString(36).substr(2, 5)}`,
            orderItemId,
            quantity,
            unitPriceCents,
            amountCents
          })
        }

        const sumCents = newAllocations.reduce((sum, a) => sum + a.amountCents, 0)
        return {
          ...p,
          allocations: newAllocations,
          amountCents: sumCents
        }
      }
      return p
    })

    table.splitPayment.people = updatedPeople
    saveTables()
    return { success: true, tableId, personId, orderItemId }
  }

  function unassignProductQuantity(input: {
    tableId: string
    personId: string
    orderItemId: string
    quantity: number
  }): UnassignProductQuantityResult {
    const { tableId, personId, orderItemId, quantity } = input
    const table = tables.value.find(t => t.id === tableId)
    if (!table) return { success: false, tableId, personId, orderItemId, reason: 'table_not_found' }
    if (!table.splitPayment) return { success: false, tableId, personId, orderItemId, reason: 'split_not_found' }
    if (table.splitPayment.mode !== 'products') return { success: false, tableId, personId, orderItemId, reason: 'invalid_split_mode' }
    if (table.splitPayment.status !== 'draft') return { success: false, tableId, personId, orderItemId, reason: 'invalid_split_status' }

    const person = table.splitPayment.people.find(p => p.id === personId)
    if (!person) return { success: false, tableId, personId, orderItemId, reason: 'person_not_found' }
    if (person.status === 'paid') return { success: false, tableId, personId, orderItemId, reason: 'person_already_paid' }

    const alloc = person.allocations.find(a => a.orderItemId === orderItemId)
    if (!alloc) return { success: false, tableId, personId, orderItemId, reason: 'allocation_not_found' }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { success: false, tableId, personId, orderItemId, reason: 'invalid_quantity' }
    }
    if (quantity > alloc.quantity) {
      return { success: false, tableId, personId, orderItemId, reason: 'quantity_exceeds_assigned' }
    }

    const updatedPeople = table.splitPayment.people.map(p => {
      if (p.id === personId) {
        const newAllocations = p.allocations.map(a => {
          if (a.orderItemId === orderItemId) {
            const nextQty = a.quantity - quantity
            return {
              ...a,
              quantity: nextQty,
              amountCents: a.unitPriceCents * nextQty
            }
          }
          return a
        }).filter(a => a.quantity > 0)

        const sumCents = newAllocations.reduce((sum, a) => sum + a.amountCents, 0)
        return {
          ...p,
          allocations: newAllocations,
          amountCents: sumCents
        }
      }
      return p
    })

    table.splitPayment.people = updatedPeople
    saveTables()
    return { success: true, tableId, personId, orderItemId }
  }

  function confirmProductSplit(tableId: string): ConfirmProductSplitResult {
    const table = tables.value.find(t => t.id === tableId)
    if (!table) return { success: false, tableId, reason: 'table_not_found' }
    if (!table.splitPayment) return { success: false, tableId, reason: 'split_not_found' }
    if (table.splitPayment.mode !== 'products') return { success: false, tableId, reason: 'invalid_split_mode' }
    if (table.splitPayment.status !== 'draft') return { success: false, tableId, reason: 'invalid_split_status' }

    if (table.partialPayments && table.partialPayments.length > 0) {
      return { success: false, tableId, reason: 'existing_partial_payments' }
    }

    // Verify all units are assigned
    for (const item of table.orders) {
      const unassigned = getUnassignedQuantity(tableId, item.id)
      if (unassigned > 0) {
        return { success: false, tableId, reason: 'unassigned_products' }
      }
      // Check overassignment
      let totalAssigned = 0
      table.splitPayment.people.forEach(p => {
        const alloc = p.allocations.find(a => a.orderItemId === item.id)
        if (alloc) totalAssigned += alloc.quantity
      })
      if (totalAssigned > item.quantity) {
        return { success: false, tableId, reason: 'overassigned_products' }
      }
    }

    // Check that every person has allocations and amountCents > 0
    let totalCentsCalculated = 0
    for (const p of table.splitPayment.people) {
      if (!p.allocations || p.allocations.length === 0) {
        return { success: false, tableId, reason: 'person_has_no_allocations' }
      }
      const sumAllocCents = p.allocations.reduce((sum, a) => sum + a.amountCents, 0)
      if (sumAllocCents <= 0) {
        return { success: false, tableId, reason: 'person_has_no_allocations' }
      }
      totalCentsCalculated += sumAllocCents
    }

    const totalCents = getTableTotalCents(tableId)
    if (totalCentsCalculated !== totalCents) {
      return { success: false, tableId, reason: 'amount_mismatch' }
    }

    table.splitPayment.status = 'confirmed'
    table.splitPayment.people.forEach(p => {
      p.amountCents = p.allocations.reduce((sum, a) => sum + a.amountCents, 0)
    })

    saveTables()
    return { success: true, tableId }
  }

  function cancelProductSplit(tableId: string): CancelProductSplitResult {
    const table = tables.value.find(t => t.id === tableId)
    if (!table) return { success: false, tableId, reason: 'table_not_found' }
    if (!table.splitPayment) return { success: false, tableId, reason: 'split_not_found' }
    if (table.splitPayment.mode !== 'products') return { success: false, tableId, reason: 'invalid_split_mode' }

    const hasPayments = table.splitPayment.people.some(p => p.status === 'paid' || p.paymentId)
    if (hasPayments) {
      return { success: false, tableId, reason: 'split_has_payments' }
    }

    table.splitPayment = undefined
    saveTables()
    return { success: true, tableId }
  }

  function payProductSplitPerson(input: {
    tableId: string
    personId: string
    method: PaymentMethod
    verifiedManually?: boolean
  }): PayProductSplitPersonResult {
    const { tableId, personId, method, verifiedManually } = input
    const table = tables.value.find(t => t.id === tableId)
    if (!table) return { success: false, tableId, personId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'table_not_found' }
    if (!table.splitPayment) return { success: false, tableId, personId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'split_not_found' }
    if (table.splitPayment.mode !== 'products') return { success: false, tableId, personId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'invalid_split_mode' }
    if (table.splitPayment.status !== 'confirmed') return { success: false, tableId, personId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'invalid_split_status' }

    const person = table.splitPayment.people.find(p => p.id === personId)
    if (!person) return { success: false, tableId, personId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'person_not_found' }
    if (person.status === 'paid') return { success: false, tableId, personId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'person_already_paid' }

    if (method !== 'cash' && method !== 'card' && method !== 'bizum') {
      return { success: false, tableId, personId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'invalid_payment_method' }
    }

    if (method === 'bizum' && verifiedManually !== true) {
      return { success: false, tableId, personId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'manual_verification_required' }
    }

    // Verify amountCents matches allocations sum
    const allocationsSum = person.allocations.reduce((sum, a) => sum + a.amountCents, 0)
    if (allocationsSum !== person.amountCents) {
      return { success: false, tableId, personId, paidAmountCents: 0, remainingAmountCents: 0, isFullyPaid: false, reason: 'amount_mismatch' }
    }

    const amountCents = person.amountCents
    const totalCents = getTableTotalCents(tableId)
    const paidCentsBefore = getTablePaidCents(tableId)
    const remainingCentsBefore = getTableRemainingCents(tableId)

    if (remainingCentsBefore === 0) {
      return { success: false, tableId, personId, paidAmountCents: paidCentsBefore, remainingAmountCents: 0, isFullyPaid: true, reason: 'already_paid' }
    }

    const paymentId = 'pay-' + Math.random().toString(36).substr(2, 9)
    const isLastPerson = table.splitPayment.people.filter(p => p.status === 'pending').length === 1

    const updatedPeople = table.splitPayment.people.map(p => {
      if (p.id === personId) {
        return {
          ...p,
          status: 'paid',
          paymentId
        } as ProductSplitPerson
      }
      return p
    })

    const newPayment: PartialPayment = {
      id: paymentId,
      amountCents,
      method,
      createdAt: new Date().toISOString(),
      ...(method === 'bizum' ? { verifiedManually: true } : {})
    }

    const currentPayments = table.partialPayments ? [...table.partialPayments] : []
    const allPayments = [...currentPayments, newPayment]

    if (!isLastPerson) {
      const nextTables: Table[] = tables.value.map(t => {
        if (t.id === tableId) {
          return {
            ...t,
            status: 'bill',
            partialPayments: allPayments,
            splitPayment: {
              ...t.splitPayment!,
              people: updatedPeople
            }
          } as Table
        }
        return t
      })

      tables.value = nextTables
      saveTables()

      return {
        success: true,
        tableId,
        personId,
        paymentId,
        paidAmountCents: paidCentsBefore + amountCents,
        remainingAmountCents: remainingCentsBefore - amountCents,
        isFullyPaid: false
      }
    } else {
      // Snapshot people count and detail before clearing
      table.splitPayment.people = updatedPeople
      executeTableCheckout(table, allPayments, totalCents)

      return {
        success: true,
        tableId,
        personId,
        paymentId,
        paidAmountCents: totalCents,
        remainingAmountCents: 0,
        isFullyPaid: true
      }
    }
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
    checkoutTable,
    serviceZones,
    getServiceZones,
    getNormalizedTables,
    moveTableAccount,
    registerTablePayment,
    getTableTotalCents,
    getTablePaidCents,
    getTableRemainingCents,
    createEqualSplit,
    paySplitShare,
    cancelEqualSplit,
    getUnassignedQuantity,
    createProductSplit,
    assignProductQuantity,
    unassignProductQuantity,
    confirmProductSplit,
    cancelProductSplit,
    payProductSplitPerson
  }
})
