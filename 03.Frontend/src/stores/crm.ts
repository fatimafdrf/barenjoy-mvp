import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ClientTag = 'Nuevo' | 'Frecuente' | 'VIP' | 'En riesgo' | 'No Show'

export interface ClientHistoryEvent {
  id: string
  type: 'reserva' | 'visita' | 'noshow'
  date: string // YYYY-MM-DD
  desc: string
  amount?: number
}

export interface Client {
  id: string
  name: string
  phone: string
  email: string
  birthday?: string // DD-MM
  notes?: string
  allergies?: string
  preferences?: {
    favTable?: string
    favDrink?: string
    favDish?: string
  }
  visitsCount: number
  totalSpend: number
  avgTicket: number
  lastVisitDate?: string
  tags: ClientTag[]
  history: ClientHistoryEvent[]
}

export const useCrmStore = defineStore('crm', () => {
  const todayStr = new Date().toISOString().split('T')[0]

  const DEFAULT_CLIENTS: Client[] = [
    {
      id: 'c1',
      name: 'Familia Gómez',
      phone: '+34 611 223 344',
      email: 'gomez@example.com',
      birthday: '14-05',
      notes: 'Prefiere mesas esquineras y tranquilas. Excelente cliente.',
      allergies: 'Marisco',
      preferences: {
        favTable: 'Mesa 1',
        favDrink: 'Tinto de Verano',
        favDish: 'Hamburguesa Dry Aged'
      },
      visitsCount: 12,
      totalSpend: 345.50,
      avgTicket: 28.79,
      lastVisitDate: '2026-07-25',
      tags: ['VIP', 'Frecuente'],
      history: [
        { id: 'h1', type: 'visita', date: '2026-07-25', desc: 'Comanda en Mesa 1', amount: 48.50 },
        { id: 'h2', type: 'reserva', date: '2026-07-25', desc: 'Reserva 13:30 (Mesa 1)' },
        { id: 'h3', type: 'visita', date: '2026-07-18', desc: 'Comanda en Mesa 1', amount: 62.00 }
      ]
    },
    {
      id: 'c2',
      name: 'Alejandro Martínez',
      phone: '+34 688 990 011',
      email: 'alex.mtz@example.com',
      birthday: '22-09',
      notes: 'Cliente de comidas de empresa. Rápido y formal.',
      preferences: {
        favTable: 'Mesa 2',
        favDrink: 'Caña de Cerveza',
        favDish: 'Croquetas de Jamón Ibérico'
      },
      visitsCount: 5,
      totalSpend: 110.00,
      avgTicket: 22.00,
      lastVisitDate: '2026-07-28',
      tags: ['Frecuente'],
      history: [
        { id: 'h4', type: 'visita', date: '2026-07-28', desc: 'Comanda en Mesa 2', amount: 22.50 },
        { id: 'h5', type: 'reserva', date: '2026-07-28', desc: 'Reserva 21:00 (Mesa 2)' }
      ]
    },
    {
      id: 'c3',
      name: 'Sofía López',
      phone: '+34 655 443 322',
      email: 'sofia.lopez@example.com',
      notes: 'Solicitó mesa adaptada para carrito de bebé.',
      preferences: {
        favTable: 'Mesa 4',
        favDrink: 'Mojito de Fresa',
        favDish: 'Bravas Aveniq'
      },
      visitsCount: 1,
      totalSpend: 54.00,
      avgTicket: 54.00,
      lastVisitDate: todayStr,
      tags: ['Nuevo'],
      history: [
        { id: 'h6', type: 'visita', date: todayStr, desc: 'Comanda en Mesa 4', amount: 54.00 }
      ]
    },
    {
      id: 'c4',
      name: 'Carlos Sánchez',
      phone: '+34 600 112 233',
      email: 'carlos.sanchez@example.com',
      allergies: 'Gluten',
      visitsCount: 0,
      totalSpend: 0,
      avgTicket: 0,
      tags: ['Nuevo'],
      history: []
    },
    {
      id: 'c5',
      name: 'Elena Díaz',
      phone: '+34 622 778 899',
      email: 'elena.diaz@example.com',
      notes: 'Ha faltado en varias ocasiones sin avisar.',
      visitsCount: 2,
      totalSpend: 40.00,
      avgTicket: 20.00,
      lastVisitDate: '2026-07-10',
      tags: ['No Show', 'En riesgo'],
      history: [
        { id: 'h7', type: 'noshow', date: '2026-07-20', desc: 'No presentado en reserva 20:30' },
        { id: 'h8', type: 'visita', date: '2026-07-10', desc: 'Comanda en Mesa 8', amount: 40.00 }
      ]
    }
  ]

  const loadClients = (): Client[] => {
    try {
      const data = localStorage.getItem('aveniq_clients')
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Error loading CRM clients from localStorage:', e)
    }
    return DEFAULT_CLIENTS
  }

  const clients = ref<Client[]>(loadClients())

  const saveClients = () => {
    try {
      localStorage.setItem('aveniq_clients', JSON.stringify(clients.value))
    } catch (e) {
      console.error('Error saving CRM clients to localStorage:', e)
    }
  }

  watch(clients, () => {
    saveClients()
  }, { deep: true })

  // Auto-calculate client tags segments
  const recalculateTags = (client: Client) => {
    const newTags: ClientTag[] = []
    
    // 1. VIP tag
    if (client.totalSpend > 150) {
      newTags.push('VIP')
    }
    
    // 2. Frecuente / Nuevo
    if (client.visitsCount >= 4) {
      newTags.push('Frecuente')
    } else if (client.visitsCount <= 1) {
      newTags.push('Nuevo')
    }

    // 3. En riesgo (Last visit > 15 days ago)
    if (client.lastVisitDate) {
      const last = new Date(client.lastVisitDate).getTime()
      const diffDays = (new Date().getTime() - last) / (1000 * 3600 * 24)
      if (diffDays > 15) {
        newTags.push('En riesgo')
      }
    }

    // 4. No Show tag
    if (client.history.some(e => e.type === 'noshow')) {
      newTags.push('No Show')
    }

    client.tags = [...new Set(newTags)]
  }

  // Actions
  const addClient = (profile: Omit<Client, 'id' | 'tags' | 'history' | 'visitsCount' | 'totalSpend' | 'avgTicket'>) => {
    const existing = clients.value.find(c => c.name.toLowerCase() === profile.name.toLowerCase() || c.phone === profile.phone)
    if (existing) return existing

    const newClient: Client = {
      ...profile,
      id: 'c-' + Math.random().toString(36).substr(2, 9),
      visitsCount: 0,
      totalSpend: 0,
      avgTicket: 0,
      tags: ['Nuevo'],
      history: []
    }
    clients.value.push(newClient)
    saveClients()
    return newClient
  }

  const addVisit = (clientName: string, amount: number, tableNumber: number) => {
    let client = clients.value.find(c => c.name.toLowerCase() === clientName.toLowerCase())
    if (!client) {
      // Create walks-in client profile automatically
      client = addClient({
        name: clientName,
        phone: '+34 600 ' + Math.floor(Math.random() * 899999 + 100000),
        email: clientName.toLowerCase().replace(/\s+/g, '') + '@example.com'
      })
    }

    client.visitsCount++
    client.totalSpend += amount
    client.avgTicket = client.totalSpend / client.visitsCount
    client.lastVisitDate = todayStr
    
    // Record history event
    client.history.unshift({
      id: 'h-' + Math.random().toString(36).substr(2, 9),
      type: 'visita',
      date: todayStr,
      desc: `Visita registrada - Mesa ${tableNumber}`,
      amount
    })

    // Auto assign table preferences
    if (!client.preferences) client.preferences = {}
    client.preferences.favTable = `Mesa ${tableNumber}`

    recalculateTags(client)
    saveClients()
  }

  const addBookingEvent = (clientName: string, time: string, status: 'confirmed' | 'noshow' | 'cancelled') => {
    let client = clients.value.find(c => c.name.toLowerCase() === clientName.toLowerCase())
    if (!client) {
      client = addClient({
        name: clientName,
        phone: '+34 600 ' + Math.floor(Math.random() * 899999 + 100000),
        email: clientName.toLowerCase().replace(/\s+/g, '') + '@example.com'
      })
    }

    const type = status === 'noshow' ? 'noshow' : 'reserva'
    const desc = status === 'noshow' 
      ? `No Show registrado a las ${time}`
      : `Reserva confirmada a las ${time}`

    client.history.unshift({
      id: 'h-' + Math.random().toString(36).substr(2, 9),
      type,
      date: todayStr,
      desc
    })

    recalculateTags(client)
    saveClients()
  }

  return {
    clients,
    addClient,
    addVisit,
    addBookingEvent
  }
})
