<template>
  <div class="bg-[#F8F9FA] min-h-[calc(100vh-4rem)] text-[#08071A] font-inter antialiased select-none">
    
    <!-- MAIN CRM CONTAINER -->
    <div class="w-full max-w-[1600px] mx-auto p-4 md:p-6 h-[calc(100vh-6rem)] flex flex-col gap-6">
      
      <!-- HEADER -->
      <div class="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shrink-0">
        <div>
          <span class="text-[10px] font-bold text-[#9235DF] uppercase tracking-widest">Aveniq CRM</span>
          <h2 class="text-2xl font-black tracking-tight font-outfit text-[#08071A] mt-0.5">
            Directorio de Clientes
          </h2>
          <p class="text-xs text-slate-400 font-medium">Ficha 360º de comensales, segmentación automática e historial de consumo.</p>
        </div>

        <div class="flex items-center gap-3">
          <button 
            @click="openNewClientModal"
            class="px-4 py-2.5 bg-gradient-to-tr from-[#9235DF] to-[#562AAC] hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 active:scale-95 transition-all"
          >
            <i class="pi pi-plus"></i>
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      <!-- MAIN THREE COLUMN GRID -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-10 gap-6 overflow-hidden min-h-0">
        
        <!-- LEFT COLUMN: SEARCH & FILTERS (2.5/10 equivalent to 25%) -->
        <div class="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col gap-5 overflow-hidden shadow-sm">
          <div class="space-y-4 shrink-0">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">Búsqueda & Filtros</h3>
            
            <!-- Global Search input -->
            <div class="relative w-full">
              <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por nombre, tlf..."
                class="w-full bg-slate-50 border border-slate-200 focus:border-[#9235DF]/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#08071A] font-semibold transition-colors focus:outline-none"
              />
            </div>

            <!-- Segment Filters -->
            <div class="space-y-2">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Segmentación CRM</span>
              <div class="flex flex-col gap-1.5">
                <button
                  v-for="opt in filterOptions"
                  :key="opt.value"
                  @click="activeFilter = opt.value"
                  :class="['w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between border',
                    activeFilter === opt.value 
                      ? 'bg-[#9235DF]/5 border-[#9235DF]/20 text-[#9235DF]' 
                      : 'bg-white border-slate-100 hover:border-slate-250 text-slate-600 hover:bg-slate-50']"
                >
                  <span>{{ opt.label }}</span>
                  <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-mono text-[9px] font-bold">
                    {{ getClientFilterCount(opt.value) }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- CENTER COLUMN: CLIENTS LIST (4.5/10 equivalent to 45%) -->
        <div class="lg:col-span-4 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between overflow-hidden shadow-sm">
          <div class="flex flex-col gap-3 shrink-0">
            <h3 class="text-sm font-black text-[#08071A] uppercase tracking-wider">Perfiles Segmentados</h3>
          </div>

          <!-- Clients List -->
          <div class="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            <div v-if="filteredClients.length === 0" class="text-center py-12 text-slate-350 text-xs">
              No se encontraron clientes para esta búsqueda/filtro.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="client in filteredClients"
                :key="client.id"
                @click="selectedClient = client"
                :class="[
                  'p-4 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col gap-3.5 shadow-sm select-none',
                  selectedClient?.id === client.id 
                    ? 'ring-2 ring-[#9235DF] bg-[#9235DF]/5 border-[#9235DF]' 
                    : 'bg-white border-slate-100 hover:border-slate-200'
                ]"
              >
                <!-- Title & Tags -->
                <div class="flex justify-between items-start gap-4">
                  <div>
                    <h4 class="text-sm font-black text-slate-900 leading-snug">{{ client.name }}</h4>
                    <p class="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                      Última visita: {{ client.lastVisitDate ? formatTimeSince(client.lastVisitDate) : 'Nunca' }}
                    </p>
                  </div>
                  <!-- Tags Row -->
                  <div class="flex flex-wrap gap-1">
                    <span 
                      v-for="tag in client.tags" 
                      :key="tag"
                      :class="['px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider', getTagClass(tag)]"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>

                <!-- Financial Mini Stats Grid -->
                <div class="grid grid-cols-3 gap-2 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/50 text-[10px] text-slate-500 font-bold text-center">
                  <div>
                    <span class="text-[8px] text-slate-400 block uppercase tracking-wider">Visitas</span>
                    <span class="text-slate-800 font-black text-xs block mt-0.5">{{ client.visitsCount }}</span>
                  </div>
                  <div>
                    <span class="text-[8px] text-slate-400 block uppercase tracking-wider">Ticket Medio</span>
                    <span class="text-slate-800 font-black text-xs block mt-0.5">{{ client.avgTicket.toFixed(2) }}€</span>
                  </div>
                  <div>
                    <span class="text-[8px] text-slate-400 block uppercase tracking-wider">Total Gastado</span>
                    <span class="text-[#9235DF] font-black text-xs block mt-0.5">{{ client.totalSpend.toFixed(0) }}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: FICHA 360º & TIMELINE (3/10 equivalent to 30%) -->
        <div class="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between overflow-y-auto shadow-sm">
          <div v-if="!selectedClient" class="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-350">
            <div class="w-12 h-12 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-500">
              <i class="pi pi-user text-lg"></i>
            </div>
            <h4 class="text-xs font-black uppercase tracking-wider mt-3">Perfil Customer 360º</h4>
            <p class="text-xs text-slate-400 mt-1 max-w-[200px] leading-relaxed">
              Seleccione un cliente del listado para ver su historial completo, preferencias gastronómicas y estadísticas acumuladas.
            </p>
          </div>

          <div v-else class="flex-1 flex flex-col justify-between h-full space-y-6">
            <div class="space-y-6">
              <!-- Header Profile -->
              <div class="border-b border-slate-50 pb-4 flex justify-between items-start">
                <div>
                  <h3 class="text-base font-black text-slate-900 font-outfit">{{ selectedClient.name }}</h3>
                  <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Ficha de Cliente • ID: {{ selectedClient.id }}</p>
                </div>
              </div>

              <!-- Personal data -->
              <div class="space-y-3.5 text-xs text-slate-600">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Teléfono</span>
                    <p class="font-bold text-slate-800 mt-0.5">{{ selectedClient.phone }}</p>
                  </div>
                  <div>
                    <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Email</span>
                    <p class="font-bold text-slate-800 mt-0.5 truncate" :title="selectedClient.email">{{ selectedClient.email }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3 border-t border-slate-50 pt-3">
                  <div>
                    <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Cumpleaños</span>
                    <p class="font-bold text-slate-800 mt-0.5">{{ selectedClient.birthday || 'Sin registrar' }}</p>
                  </div>
                  <div>
                    <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Mesa Favorita</span>
                    <p class="font-bold text-indigo-700 mt-0.5">{{ selectedClient.preferences?.favTable || 'Sin mesa fija' }}</p>
                  </div>
                </div>

                <div v-if="selectedClient.allergies" class="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700">
                  <span class="text-[8px] font-black uppercase tracking-wider block">⚠️ Alergias Registradas</span>
                  <span class="font-bold mt-0.5 block">{{ selectedClient.allergies }}</span>
                </div>

                <!-- Food Preferences Section -->
                <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Preferencias de Consumo</span>
                  <div class="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span class="text-slate-400 block">Plato Favorito:</span>
                      <span class="font-bold text-slate-700">{{ selectedClient.preferences?.favDish || 'Pendiente' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block">Bebida Favorita:</span>
                      <span class="font-bold text-slate-700">{{ selectedClient.preferences?.favDrink || 'Pendiente' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- History Timeline (Notion-style) -->
              <div class="space-y-3.5 pt-4 border-t border-slate-100">
                <span class="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Historial Cronológico</span>
                
                <div class="relative pl-4 border-l border-slate-100 space-y-4 max-h-56 overflow-y-auto pr-1">
                  <!-- Timeline items loop -->
                  <div 
                    v-for="event in selectedClient.history" 
                    :key="event.id"
                    class="relative group text-xs text-slate-500"
                  >
                    <!-- Icon node -->
                    <span :class="['absolute -left-[20.5px] top-0.5 w-2 h-2 rounded-full bg-white border-2',
                      event.type === 'visita' ? 'border-emerald-500' : event.type === 'noshow' ? 'border-rose-500' : 'border-indigo-500']"
                    ></span>
                    
                    <div class="space-y-0.5">
                      <div class="flex items-center justify-between text-[10px]">
                        <span class="font-bold text-slate-800">{{ event.desc }}</span>
                        <span class="font-mono text-slate-400 font-bold">{{ event.date }}</span>
                      </div>
                      <p v-if="event.amount" class="text-[#9235DF] font-black text-[10px]">Gasto: {{ event.amount.toFixed(2) }} €</p>
                    </div>
                  </div>

                  <div v-if="selectedClient.history.length === 0" class="text-center py-6 text-slate-350 text-[10px]">
                    No se registran eventos históricos.
                  </div>
                </div>
              </div>
            </div>

            <!-- Remove Client Action -->
            <button
              @click="deleteClientProfile(selectedClient.id)"
              class="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 hover:border-rose-200 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
            >
              Eliminar Perfil
            </button>
          </div>
        </div>

      </div>

    </div>

    <!-- DIALOG MODAL: NEW CLIENT -->
    <div
      v-if="showNewModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          @click="showNewModal = false"
          class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <div>
          <h3 class="text-xl font-bold text-[#08071A] flex items-center gap-2 font-outfit">
            <i class="pi pi-user text-[#9235DF]"></i>
            <span>Nuevo Cliente CRM</span>
          </h3>
          <p class="text-xs text-slate-400 mt-1">Configure los detalles iniciales del perfil para el libro de Aveniq.</p>
        </div>

        <!-- Form fields -->
        <form @submit.prevent="saveNewClient" class="space-y-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Nombre Completo</label>
            <input 
              v-model="newForm.name" 
              required 
              type="text" 
              placeholder="Ej. Carmen Ortiz" 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#9235DF]"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Teléfono</label>
              <input 
                v-model="newForm.phone" 
                required 
                type="text" 
                placeholder="+34 600 000 000" 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
              />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Email</label>
              <input 
                v-model="newForm.email" 
                required 
                type="email" 
                placeholder="carmen@example.com" 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Cumpleaños</label>
              <input 
                v-model="newForm.birthday" 
                type="text" 
                placeholder="Ej. 14-05" 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
              />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Alergias</label>
              <input 
                v-model="newForm.allergies" 
                type="text" 
                placeholder="Ej. Mariscos, Gluten" 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Observaciones</label>
            <textarea 
              v-model="newForm.notes" 
              rows="2" 
              placeholder="Detalles sobre el cliente..." 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none resize-none"
            ></textarea>
          </div>

          <div class="pt-4 flex gap-3">
            <button
              type="button"
              @click="showNewModal = false"
              class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCrmStore, type Client } from '../stores/crm'
import { useReservasStore } from '../stores/reservas'

const crmStore = useCrmStore()
const reservasStore = useReservasStore()

// Local state
const searchQuery = ref('')
const activeFilter = ref<'all' | 'vip' | 'new' | 'frequent' | 'risk' | 'today'>('all')
const selectedClient = ref<Client | null>(null)
const showNewModal = ref(false)

const filterOptions = [
  { label: 'Todos los clientes', value: 'all' as const },
  { label: 'Clientes VIP 🌟', value: 'vip' as const },
  { label: 'Nuevos', value: 'new' as const },
  { label: 'Frecuentes', value: 'frequent' as const },
  { label: 'Inactivos (En riesgo) ⚠️', value: 'risk' as const },
  { label: 'Reservas Hoy 🗓', value: 'today' as const }
]

const newForm = ref({
  name: '',
  phone: '',
  email: '',
  birthday: '',
  allergies: '',
  notes: '',
  favTable: '',
  favDrink: '',
  favDish: ''
})

// Search & segment filter mappings
const filteredClients = computed(() => {
  return crmStore.clients.filter(client => {
    // 1. Search Query filter
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          client.phone.includes(searchQuery.value) ||
                          client.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    if (!matchesSearch) return false

    // 2. Segment filter
    if (activeFilter.value === 'all') return true
    if (activeFilter.value === 'vip') return client.tags.includes('VIP')
    if (activeFilter.value === 'new') return client.tags.includes('Nuevo')
    if (activeFilter.value === 'frequent') return client.tags.includes('Frecuente')
    if (activeFilter.value === 'risk') return client.tags.includes('En riesgo')
    if (activeFilter.value === 'today') {
      const todayStr = new Date().toISOString().split('T')[0]
      return reservasStore.reservations.some(r => r.clientName.toLowerCase() === client.name.toLowerCase() && r.date === todayStr)
    }
    return false
  })
})

const getClientFilterCount = (filter: string): number => {
  return crmStore.clients.filter(client => {
    if (filter === 'all') return true
    if (filter === 'vip') return client.tags.includes('VIP')
    if (filter === 'new') return client.tags.includes('Nuevo')
    if (filter === 'frequent') return client.tags.includes('Frecuente')
    if (filter === 'risk') return client.tags.includes('En riesgo')
    if (filter === 'today') {
      const todayStr = new Date().toISOString().split('T')[0]
      return reservasStore.reservations.some(r => r.clientName.toLowerCase() === client.name.toLowerCase() && r.date === todayStr)
    }
    return false
  }).length
}

// Styling classes mapping
const getTagClass = (tag: string): string => {
  if (tag === 'VIP') return 'text-amber-700 bg-amber-50 border border-amber-200'
  if (tag === 'Frecuente') return 'text-indigo-700 bg-indigo-50 border border-indigo-200'
  if (tag === 'Nuevo') return 'text-sky-700 bg-sky-50 border border-sky-200'
  if (tag === 'En riesgo') return 'text-rose-700 bg-rose-50 border border-rose-200'
  return 'text-slate-700 bg-slate-50 border border-slate-200'
}

const formatTimeSince = (dateStr: string): string => {
  const diffTime = Math.abs(new Date().getTime() - new Date(dateStr).getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays <= 1) return 'Hoy'
  if (diffDays === 2) return 'Ayer'
  return `Hace ${diffDays - 1} días`
}

// Actions CRUD
const deleteClientProfile = (id: string) => {
  crmStore.clients = crmStore.clients.filter(c => c.id !== id)
  selectedClient.value = null
}

const openNewClientModal = () => {
  newForm.value = {
    name: '',
    phone: '',
    email: '',
    birthday: '',
    allergies: '',
    notes: '',
    favTable: '',
    favDrink: '',
    favDish: ''
  }
  showNewModal.value = true
}

const saveNewClient = () => {
  const added = crmStore.addClient({
    name: newForm.value.name,
    phone: newForm.value.phone,
    email: newForm.value.email,
    birthday: newForm.value.birthday || undefined,
    allergies: newForm.value.allergies || undefined,
    notes: newForm.value.notes || undefined,
    preferences: {
      favTable: newForm.value.favTable || undefined,
      favDrink: newForm.value.favDrink || undefined,
      favDish: newForm.value.favDish || undefined
    }
  })

  selectedClient.value = added
  showNewModal.value = false
}
</script>
