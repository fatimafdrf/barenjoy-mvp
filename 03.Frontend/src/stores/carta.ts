import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: 'tapas' | 'platos' | 'bebidas' | 'postres'
  allergens: string[]
  available: boolean
  rating?: number
}

export const useCartaStore = defineStore('carta', () => {
  const categories = ref([
    { id: 'tapas', name: 'Tapas & Entrantes', icon: 'Utensils' },
    { id: 'platos', name: 'Platos Principales', icon: 'Soup' },
    { id: 'bebidas', name: 'Bebidas & Coctelería', icon: 'Wine' },
    { id: 'postres', name: 'Postres Artesanales', icon: 'CakeSlice' }
  ])

  const menuItems = ref<MenuItem[]>([
    {
      id: 'm1',
      name: 'Croquetas de Jamón Ibérico',
      description: 'Croquetas cremosas de jamón ibérico de bellota (6 unidades).',
      price: 8.5,
      category: 'tapas',
      allergens: ['Gluten', 'Lácteos', 'Huevo'],
      available: true
    },
    {
      id: 'm2',
      name: 'Bravas Barenjoy',
      description: 'Patatas crujientes con salsa brava casera ahumada y alioli de ajo asado.',
      price: 6.9,
      category: 'tapas',
      allergens: ['Huevo'],
      available: true
    },
    {
      id: 'm3',
      name: 'Tacos de Cochinita Pibil',
      description: 'Tacos con carne de cerdo marinada en achiote, cebolla encurtida y cilantro (3 unidades).',
      price: 11.2,
      category: 'tapas',
      allergens: ['Gluten'],
      available: true
    },
    {
      id: 'm4',
      name: 'Hamburguesa Dry Aged',
      description: '200g de carne madurada, queso cheddar fundido, bacon crujiente y salsa especial Barenjoy.',
      price: 14.5,
      category: 'platos',
      allergens: ['Gluten', 'Lácteos'],
      available: true
    },
    {
      id: 'm5',
      name: 'Arroz Abanda Individual',
      description: 'Arroz meloso cocinado en caldo de morralla, servido con sepia y alioli.',
      price: 16.8,
      category: 'platos',
      allergens: ['Pescado', 'Moluscos', 'Huevo'],
      available: true
    },
    {
      id: 'm6',
      name: 'Entrecot de Ternera Gallega',
      description: '350g a la brasa con patatas fritas rústicas y pimientos de Padrón.',
      price: 22.0,
      category: 'platos',
      allergens: [],
      available: true
    },
    {
      id: 'm7',
      name: 'Caña de Cerveza',
      description: 'Cerveza lager rubia de barril, bien fría.',
      price: 2.5,
      category: 'bebidas',
      allergens: ['Gluten'],
      available: true
    },
    {
      id: 'm8',
      name: 'Tinto de Verano',
      description: 'Vino tinto con gaseosa o limón y rodaja de naranja.',
      price: 3.2,
      category: 'bebidas',
      allergens: [],
      available: true
    },
    {
      id: 'm9',
      name: 'Mojito de Fresa',
      description: 'Ron blanco, menta fresca, puré de fresa natural, lima y soda.',
      price: 7.5,
      category: 'bebidas',
      allergens: [],
      available: true
    },
    {
      id: 'm10',
      name: 'Coulant de Chocolate',
      description: 'Coulant de chocolate negro templado con bola de helado de vainilla.',
      price: 5.5,
      category: 'postres',
      allergens: ['Gluten', 'Lácteos', 'Huevo'],
      available: true
    },
    {
      id: 'm11',
      name: 'Tarta de Queso Fluida',
      description: 'Nuestra famosa tarta horneada al estilo San Sebastián, cremosa por dentro.',
      price: 6.5,
      category: 'postres',
      allergens: ['Lácteos', 'Huevo'],
      available: true
    }
  ])

  const addItem = (item: Omit<MenuItem, 'id'>) => {
    const id = 'm' + (menuItems.value.length + 1)
    menuItems.value.push({ ...item, id })
  }

  const updateItem = (id: string, updatedFields: Partial<MenuItem>) => {
    const idx = menuItems.value.findIndex(item => item.id === id)
    if (idx !== -1) {
      menuItems.value[idx] = { ...menuItems.value[idx], ...updatedFields }
    }
  }

  const deleteItem = (id: string) => {
    menuItems.value = menuItems.value.filter(item => item.id !== id)
  }

  return {
    categories,
    menuItems,
    addItem,
    updateItem,
    deleteItem
  }
})
