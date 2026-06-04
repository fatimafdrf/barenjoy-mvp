import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Locale {
  id: string
  name: string
  address: string
  phone: string
  tablesCount: number
  status: 'open' | 'closed'
  manager: string
}

export const useLocalesStore = defineStore('locales', () => {
  const locales = ref<Locale[]>([
    {
      id: 'l1',
      name: 'Barenjoy Centro',
      address: 'Calle Mayor 12, Madrid',
      phone: '+34 912 345 678',
      tablesCount: 12,
      status: 'open',
      manager: 'Felipe Gómez'
    },
    {
      id: 'l2',
      name: 'Barenjoy Puerto',
      address: 'Paseo Marítimo 45, Barcelona',
      phone: '+34 934 567 890',
      tablesCount: 16,
      status: 'open',
      manager: 'Sofía L'
    },
    {
      id: 'l3',
      name: 'Barenjoy Terraza',
      address: 'Avenida de la Constitución 88, Sevilla',
      phone: '+34 954 123 456',
      tablesCount: 8,
      status: 'closed',
      manager: 'Mateo Ruiz'
    }
  ])

  const activeLocaleId = ref<string>('l1')

  const activeLocale = ref<Locale | undefined>(
    locales.value.find(l => l.id === activeLocaleId.value)
  )

  const switchLocale = (id: string) => {
    const found = locales.value.find(l => l.id === id)
    if (found) {
      activeLocaleId.value = id
      activeLocale.value = found
    }
  }

  const addLocale = (locale: Omit<Locale, 'id'>) => {
    const id = 'l' + (locales.value.length + 1)
    locales.value.push({ ...locale, id })
  }

  const updateLocale = (id: string, updatedFields: Partial<Locale>) => {
    const idx = locales.value.findIndex(l => l.id === id)
    if (idx !== -1) {
      locales.value[idx] = { ...locales.value[idx], ...updatedFields }
      if (activeLocaleId.value === id) {
        activeLocale.value = locales.value[idx]
      }
    }
  }

  return {
    locales,
    activeLocaleId,
    activeLocale,
    switchLocale,
    addLocale,
    updateLocale
  }
})
