import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface InventoryProduct {
  id: string
  name: string
  category: 'comida' | 'bebida' | 'ingrediente'
  provider: string
  stock: number
  minStock: number
  unit: 'kg' | 'uds' | 'litros' | 'botellas'
  cost: number
}

export interface InventoryMovement {
  id: string
  date: string // YYYY-MM-DD
  user: string
  type: 'entrada' | 'salida' | 'ajuste' | 'consumo' | 'transferencia'
  productName: string
  quantity: number
  reason: string
}

export interface InventoryProvider {
  id: string
  company: string
  contact: string
  email: string
  phone: string
  address: string
  productsSupplied: string[]
  lastOrderDate: string
}

export const useInventarioStore = defineStore('inventario', () => {
  const todayStr = new Date().toISOString().split('T')[0]

  const DEFAULT_PRODUCTS: InventoryProduct[] = [
    { id: 'ip1', name: 'Ternera Picada Dry Aged', category: 'comida', provider: 'Carnes Goya', stock: 40, minStock: 15, unit: 'uds', cost: 3.50 },
    { id: 'ip2', name: 'Pan Brioche Artesanal', category: 'comida', provider: 'Horno Local', stock: 45, minStock: 15, unit: 'uds', cost: 0.60 },
    { id: 'ip3', name: 'Patatas Lavadas', category: 'comida', provider: 'Makro', stock: 80, minStock: 20, unit: 'kg', cost: 0.80 },
    { id: 'ip4', name: 'Cerveza Heineken', category: 'bebida', provider: 'Refrescos Corp', stock: 120, minStock: 40, unit: 'botellas', cost: 1.20 },
    { id: 'ip5', name: 'Refresco Coca-Cola', category: 'bebida', provider: 'Refrescos Corp', stock: 90, minStock: 30, unit: 'botellas', cost: 0.90 },
    { id: 'ip6', name: 'Agua Mineral', category: 'bebida', provider: 'Makro', stock: 6, minStock: 12, unit: 'botellas', cost: 0.50 },
    { id: 'ip7', name: 'Salmón Ahumado Noruego', category: 'comida', provider: 'Pescados Marín', stock: 0, minStock: 5, unit: 'kg', cost: 12.00 },
    { id: 'ip8', name: 'Aceite de Oliva Virgen Extra', category: 'ingrediente', provider: 'Makro', stock: 18, minStock: 5, unit: 'litros', cost: 4.50 }
  ]

  const DEFAULT_MOVEMENTS: InventoryMovement[] = [
    { id: 'im1', date: '2026-07-28', user: 'Laura', type: 'entrada', productName: 'Cerveza Heineken', quantity: 60, reason: 'Recepción pedido de distribuidor' },
    { id: 'im2', date: '2026-07-28', user: 'Laura', type: 'entrada', productName: 'Ternera Picada Dry Aged', quantity: 20, reason: 'Recepción Carnes Goya' },
    { id: 'im3', date: '2026-07-28', user: 'Carlos', type: 'ajuste', productName: 'Agua Mineral', quantity: -2, reason: 'Rotura botella en almacén' },
    { id: 'im4', date: '2026-07-28', user: 'Sistema', type: 'consumo', productName: 'Pan Brioche Artesanal', quantity: -12, reason: 'Servicio Cenas KDS' }
  ]

  const DEFAULT_PROVIDERS: InventoryProvider[] = [
    {
      id: 'pv1',
      company: 'Carnes Goya',
      contact: 'Francisco Goya',
      email: 'pedidos@carnesgoya.com',
      phone: '+34 912 345 678',
      address: 'Polígono Cobo Calleja, Madrid',
      productsSupplied: ['Ternera Picada Dry Aged', 'Entrecot Madurado'],
      lastOrderDate: '2026-07-28'
    },
    {
      id: 'pv2',
      company: 'Makro',
      contact: 'Atención al Cliente',
      email: 'pedidos@makro.es',
      phone: '+34 900 123 456',
      address: 'Av. de la Democracia, Madrid',
      productsSupplied: ['Patatas Lavadas', 'Agua Mineral', 'Aceite de Oliva Virgen Extra'],
      lastOrderDate: '2026-07-27'
    },
    {
      id: 'pv3',
      company: 'Refrescos Corp',
      contact: 'Javier Sanz',
      email: 'sanz@refrescos.com',
      phone: '+34 677 889 900',
      address: 'Calle del Refresco 12, Coslada',
      productsSupplied: ['Cerveza Heineken', 'Refresco Coca-Cola'],
      lastOrderDate: '2026-07-28'
    }
  ]

  // Persisted state loading helpers
  const loadState = <T>(key: string, defaultValue: T): T => {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        return JSON.parse(data)
      }
    } catch (e) {
      console.error(`Error loading key ${key} from localStorage:`, e)
    }
    return defaultValue
  }

  const products = ref<InventoryProduct[]>(loadState('aveniq_inventory_products', DEFAULT_PRODUCTS))
  const movements = ref<InventoryMovement[]>(loadState('aveniq_inventory_movements', DEFAULT_MOVEMENTS))
  const providers = ref<InventoryProvider[]>(loadState('aveniq_inventory_providers', DEFAULT_PROVIDERS))

  // Watchers to trigger persistence
  watch(products, () => {
    localStorage.setItem('aveniq_inventory_products', JSON.stringify(products.value))
  }, { deep: true })

  watch(movements, () => {
    localStorage.setItem('aveniq_inventory_movements', JSON.stringify(movements.value))
  }, { deep: true })

  watch(providers, () => {
    localStorage.setItem('aveniq_inventory_providers', JSON.stringify(providers.value))
  }, { deep: true })

  // Core Actions
  const addMovement = (move: Omit<InventoryMovement, 'id' | 'date'>) => {
    movements.value.unshift({
      ...move,
      id: 'im-' + Math.random().toString(36).substr(2, 9),
      date: todayStr
    })
  }

  const discountStock = (productName: string, quantity: number, type: InventoryMovement['type'], reason: string) => {
    const item = products.value.find(p => p.name.toLowerCase() === productName.toLowerCase())
    if (item) {
      item.stock = Math.max(0, item.stock - quantity)
      addMovement({
        user: 'Sistema',
        type,
        productName: item.name,
        quantity: -quantity,
        reason
      })
    }
  }

  // Recipe breakdown mapping
  const discountRawStock = (finishedProductName: string, finishedProductQty: number, source: 'Cocina (KDS)' | 'Barra (BDS)') => {
    const name = finishedProductName.toLowerCase()
    
    // 1. Kitchen Recipes mapping
    if (name.includes('hamburguesa')) {
      // Consumes 1x beef burger + 1x brioche bun
      discountStock('Ternera Picada Dry Aged', 1 * finishedProductQty, 'consumo', `Receta: ${finishedProductName} - ${source}`)
      discountStock('Pan Brioche Artesanal', 1 * finishedProductQty, 'consumo', `Receta: ${finishedProductName} - ${source}`)
    } 
    else if (name.includes('brava') || name.includes('patata')) {
      // Consumes 0.3kg potatoes + 0.05l oil
      discountStock('Patatas Lavadas', 0.3 * finishedProductQty, 'consumo', `Receta: ${finishedProductName} - ${source}`)
      discountStock('Aceite de Oliva Virgen Extra', 0.05 * finishedProductQty, 'consumo', `Receta: ${finishedProductName} - ${source}`)
    }
    // 2. Bar direct item matching
    else if (name.includes('heineken') || name.includes('cerveza') || name.includes('caña')) {
      discountStock('Cerveza Heineken', 1 * finishedProductQty, 'consumo', `${finishedProductName} servido - ${source}`)
    } 
    else if (name.includes('coca') || name.includes('cola') || name.includes('refresco')) {
      discountStock('Refresco Coca-Cola', 1 * finishedProductQty, 'consumo', `${finishedProductName} servido - ${source}`)
    } 
    else if (name.includes('agua') || name.includes('mineral')) {
      discountStock('Agua Mineral', 1 * finishedProductQty, 'consumo', `${finishedProductName} servido - ${source}`)
    }
  }

  // Regularize stock manually
  const adjustStock = (productId: string, newStock: number, reason: string) => {
    const item = products.value.find(p => p.id === productId)
    if (item) {
      const diff = newStock - item.stock
      if (diff === 0) return

      item.stock = newStock
      addMovement({
        user: 'Administrador',
        type: 'ajuste',
        productName: item.name,
        quantity: diff,
        reason: reason || 'Ajuste manual de almacén'
      })
    }
  }

  // Restock from supplier
  const restockProduct = (productId: string, quantity: number, reason: string) => {
    const item = products.value.find(p => p.id === productId)
    if (item && quantity > 0) {
      item.stock += quantity
      addMovement({
        user: 'Administrador',
        type: 'entrada',
        productName: item.name,
        quantity,
        reason: reason || 'Entrada por compra a proveedor'
      })
    }
  }

  return {
    products,
    movements,
    providers,
    addMovement,
    discountStock,
    discountRawStock,
    adjustStock,
    restockProduct
  }
})
