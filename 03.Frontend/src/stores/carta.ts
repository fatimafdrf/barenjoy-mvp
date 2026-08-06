import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: 'tapas' | 'platos' | 'bebidas' | 'postres'
  allergens: string[]
  available: boolean
  rating?: number
  controlStock?: boolean
  stock?: number
  minStock?: number
  productionStation: 'BAR' | 'KITCHEN'
}

// Helper to load persisted state from localStorage
const loadState = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key)
    if (data) {
      return JSON.parse(data) as T
    }
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e)
  }
  return defaultValue
}

export const useCartaStore = defineStore('carta', () => {
  const categories = ref([
    { id: 'tapas', name: 'Tapas & Entrantes', icon: 'Utensils' },
    { id: 'platos', name: 'Platos Principales', icon: 'Soup' },
    { id: 'bebidas', name: 'Bebidas & Coctelería', icon: 'Wine' },
    { id: 'postres', name: 'Postres Artesanales', icon: 'CakeSlice' }
  ])

  // Default menu items (including stock fields)
  const DEFAULT_ITEMS: MenuItem[] = [
    { id: 'm1', name: 'Croquetas de Jamón Ibérico', description: 'Croquetas cremosas de jamón ibérico de bellota (6 unidades).', price: 8.5, category: 'tapas', allergens: ['Gluten', 'Lácteos', 'Huevo'], available: true, controlStock: false, productionStation: 'KITCHEN' },
    { id: 'm2', name: 'Bravas Aveniq', description: 'Patatas crujientes con salsa brava casera ahumada y alioli de ajo asado.', price: 6.9, category: 'tapas', allergens: ['Huevo'], available: true, controlStock: false, productionStation: 'KITCHEN' },
    { id: 'm3', name: 'Tacos de Cochinita Pibil', description: 'Tacos con carne de cerdo marinada en achiote, cebolla encurtida y cilantro (3 unidades).', price: 11.2, category: 'tapas', allergens: ['Gluten'], available: true, controlStock: false, productionStation: 'KITCHEN' },
    { id: 'm4', name: 'Hamburguesa Dry Aged', description: '200g de carne madurada, queso cheddar fundido, bacon crujiente y salsa especial Aveniq.', price: 14.5, category: 'platos', allergens: ['Gluten', 'Lácteos'], available: true, controlStock: false, productionStation: 'KITCHEN' },
    { id: 'm5', name: 'Arroz Abanda Individual', description: 'Arroz meloso cocinado en caldo de morralla, servido con sepia y alioli.', price: 16.8, category: 'platos', allergens: ['Pescado', 'Moluscos', 'Huevo'], available: true, controlStock: false, productionStation: 'KITCHEN' },
    { id: 'm6', name: 'Entrecot de Ternera Gallega', description: '350g a la brasa con patatas fritas rústicas y pimientos de Padrón.', price: 22.0, category: 'platos', allergens: [], available: true, controlStock: false, productionStation: 'KITCHEN' },
    { id: 'm7', name: 'Caña de Cerveza', description: 'Cerveza lager rubia de barril, bien fría.', price: 2.5, category: 'bebidas', allergens: ['Gluten'], available: true, controlStock: false, productionStation: 'BAR' },
    { id: 'm8', name: 'Tinto de Verano', description: 'Vino tinto con gaseosa o limón y rodaja de naranja.', price: 3.2, category: 'bebidas', allergens: [], available: true, controlStock: false, productionStation: 'BAR' },
    { id: 'm9', name: 'Mojito de Fresa', description: 'Ron blanco, menta fresca, puré de fresa natural, lima y soda.', price: 7.5, category: 'bebidas', allergens: [], available: true, controlStock: false, productionStation: 'BAR' },
    { id: 'm10', name: 'Coulant de Chocolate', description: 'Coulant de chocolate negro templado con bola de helado de vainilla.', price: 5.5, category: 'postres', allergens: ['Gluten', 'Lácteos', 'Huevo'], available: true, controlStock: false, productionStation: 'KITCHEN' },
    { id: 'm11', name: 'Tarta de Queso Fluida', description: 'Nuestra famosa tarta horneada al estilo San Sebastián, cremosa por dentro.', price: 6.5, category: 'postres', allergens: ['Lácteos', 'Huevo'], available: true, controlStock: false, productionStation: 'KITCHEN' }
  ]

  const menuItems = ref<MenuItem[]>(loadState('aveniq_carta_items', DEFAULT_ITEMS))

  const addItem = (item: Omit<MenuItem, 'id'>) => {
    const id = 'm' + (menuItems.value.length + 1)
    menuItems.value.push({ ...item, id })
  }

  const updateItem = (id: string, updatedFields: Partial<MenuItem>) => {
    const idx = menuItems.value.findIndex(item => item.id === id)
    if (idx !== -1) {
      const existing = menuItems.value[idx]
      const merged = { ...existing, ...updatedFields }
      if (merged.controlStock && merged.stock !== undefined && merged.stock <= 0) {
        merged.available = false
        merged.stock = 0
      }
      menuItems.value[idx] = merged
    }
  }

  const deleteItem = (id: string) => {
    menuItems.value = menuItems.value.filter(item => item.id !== id)
  }

  // Persist menu items to localStorage
  watch(menuItems, () => {
    try {
      localStorage.setItem('aveniq_carta_items', JSON.stringify(menuItems.value))
    } catch (e) {
      console.error('Error persisting carta items:', e)
    }
  }, { deep: true })

  return {
    categories,
    menuItems,
    addItem,
    updateItem,
    deleteItem
  }
})
