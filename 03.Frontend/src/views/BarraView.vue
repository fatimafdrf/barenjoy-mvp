<template>
  <div class="bg-[#F8F9FA] min-h-[calc(100vh-4rem)] text-[#08071A] font-inter antialiased select-none">

    <!-- MAIN BDS CONTAINER -->
    <div class="w-full max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 flex flex-col">

      <!-- 1. HEADER SUPERIOR ENTERPRISE -->
      <div class="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 shadow-sm">
        <div class="flex items-center gap-4">
          <!-- Volver atrás -->
          <button
            @click="goBack"
            class="p-2.5 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Volver al Dashboard"
          >
            <i class="pi pi-arrow-left text-xs"></i>
          </button>
          <div>
            <span class="text-[10px] font-bold text-[#9235DF] uppercase tracking-widest">Aveniq BDS Board</span>
            <h2 class="text-2xl font-black tracking-tight font-outfit text-[#08071A] mt-0.5">
              Panel de Barra & Copas
            </h2>
            <p class="text-xs text-slate-400 font-medium">Control unificado de tiempos de preparación y entregas.</p>
          </div>
        </div>

        <!-- FILTROS DE DESTINO (Notion style pills) -->
        <div class="flex p-1 bg-slate-50 border border-slate-100 rounded-2xl shrink-0 self-start xl:self-center">
          <button
            v-for="f in filterOptions"
            :key="f.value"
            @click="activeFilter = f.value"
            :class="['px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap',
              activeFilter === f.value ? 'bg-white text-[#9235DF] shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800']"
          >
            {{ f.label }}
          </button>
        </div>

        <!-- METRICAS / KPIS DE SERVICIO -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 xl:gap-6 shrink-0">
          <div class="bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-2.5 text-center shadow-inner">
            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Hora Actual</span>
            <span class="text-xs font-black text-slate-800 font-mono block mt-1">{{ currentTimeString }}</span>
          </div>

          <div class="bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-2.5 text-center shadow-inner">
            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Copas Activas</span>
            <span class="text-xs font-black text-[#9235DF] block mt-1">{{ activeTicketsCount }} uds.</span>
          </div>

          <div class="bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-2.5 text-center shadow-inner">
            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Tiempo Medio</span>
            <span class="text-xs font-black text-slate-800 block mt-1">{{ avgPrepTime }} min</span>
          </div>

          <div class="bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-2.5 text-center shadow-inner">
            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Retrasados</span>
            <span class="text-xs font-black text-rose-600 block mt-1">{{ lateTicketsCount }} uds.</span>
          </div>
        </div>
      </div>

      <!-- 2. KANBAN columns wrapper -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[550px]">

        <!-- COLUMN 1: RECIBIDOS (PENDING) -->
        <div class="bg-white rounded-3xl border border-slate-100 flex flex-col h-full overflow-hidden shadow-sm">
          <div class="p-4 border-b border-slate-50 bg-slate-50/40 flex justify-between items-center shrink-0">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-md shadow-blue-500/20"></span>
              <h3 class="font-black text-slate-800 text-xs uppercase tracking-wider">Recibidos</h3>
            </div>
            <span class="text-[10px] font-mono font-black bg-slate-100 px-2 py-0.5 rounded text-slate-400">{{ pendingItems.length }}</span>
          </div>

          <div
            @dragover.prevent
            @drop="onCardDrop($event, 'pending')"
            class="flex-1 overflow-y-auto p-4 space-y-4 min-h-[350px] bg-[#FCFCFD]/40"
          >
            <div
              v-for="ticket in pendingItems"
              :key="ticket.item.id"
              draggable="true"
              @dragstart="onCardDragStart($event, ticket)"
              :class="[
                'p-4 rounded-2xl bg-white border shadow-sm transition-all duration-300 relative group overflow-hidden cursor-grab active:cursor-grabbing border-slate-200/70 hover:border-slate-350',
                ticket.elapsedSeconds < 120 ? 'border-l-4 border-l-emerald-500' : '',
                ticket.elapsedSeconds >= 120 && ticket.elapsedSeconds < 300 ? 'border-l-4 border-l-amber-500' : '',
                ticket.elapsedSeconds >= 300 ? 'border-l-4 border-l-rose-500 animate-pulse' : ''
              ]"
            >
              <div class="space-y-3">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[9px] font-black uppercase text-slate-400 font-mono tracking-wider">
                      M-{{ ticket.tableNumber }} • {{ getDestinationBadgeLabel(ticket.item.category) }}
                    </span>
                    <h4 class="font-black text-slate-900 text-base leading-tight mt-0.5">Mesa {{ ticket.tableNumber }}</h4>
                  </div>
                  <span class="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {{ ticket.elapsedTime }}
                  </span>
                </div>

                <div class="text-sm font-black text-slate-800">
                  {{ ticket.item.quantity }}x {{ ticket.item.name }}
                </div>

                <!-- Modifiers & Custom notes -->
                <div v-if="ticket.item.notes" class="flex flex-wrap gap-1.5 pt-1">
                  <span
                    v-for="mod in parseModifiers(ticket.item.notes)"
                    :key="mod"
                    class="px-2 py-0.5 bg-rose-50/50 text-rose-700 rounded text-[9px] font-semibold border border-rose-100/50"
                  >
                    {{ mod }}
                  </span>
                </div>

                <div class="pt-3 border-t border-slate-50 flex justify-between items-center">
                  <span v-if="ticket.isLate" class="text-[9px] text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded animate-pulse">
                    ¡Retrasado!
                  </span>
                  <span v-else class="text-[9px] text-slate-400 font-bold">En cola</span>

                  <button
                    @click="updateStatus(ticket.tableId, ticket.item.id, 'preparing')"
                    class="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <span>Aceptar</span>
                    <i class="pi pi-chevron-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="pendingItems.length === 0" class="text-center py-16 text-slate-300 text-xs">
              No hay comandas recibidas.
            </div>
          </div>
        </div>

        <!-- COLUMN 2: EN PREPARACIÓN (PREPARING) -->
        <div class="bg-white rounded-3xl border border-slate-100 flex flex-col h-full overflow-hidden shadow-sm">
          <div class="p-4 border-b border-slate-50 bg-slate-50/40 flex justify-between items-center shrink-0">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-md shadow-amber-500/20"></span>
              <h3 class="font-black text-slate-800 text-xs uppercase tracking-wider">En Preparación</h3>
            </div>
            <span class="text-[10px] font-mono font-black bg-slate-100 px-2 py-0.5 rounded text-slate-400">{{ preparingItems.length }}</span>
          </div>

          <div
            @dragover.prevent
            @drop="onCardDrop($event, 'preparing')"
            class="flex-1 overflow-y-auto p-4 space-y-4 min-h-[350px] bg-[#FCFCFD]/40"
          >
            <div
              v-for="ticket in preparingItems"
              :key="ticket.item.id"
              draggable="true"
              @dragstart="onCardDragStart($event, ticket)"
              :class="[
                'p-4 rounded-2xl bg-white border shadow-sm transition-all duration-300 relative group overflow-hidden cursor-grab active:cursor-grabbing border-slate-200/70 hover:border-slate-350',
                ticket.elapsedSeconds < 120 ? 'border-l-4 border-l-emerald-500' : '',
                ticket.elapsedSeconds >= 120 && ticket.elapsedSeconds < 300 ? 'border-l-4 border-l-amber-500' : '',
                ticket.elapsedSeconds >= 300 ? 'border-l-4 border-l-rose-500 animate-pulse' : ''
              ]"
            >
              <div class="space-y-3">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[9px] font-black uppercase text-slate-400 font-mono tracking-wider">
                      M-{{ ticket.tableNumber }} • {{ getDestinationBadgeLabel(ticket.item.category) }}
                    </span>
                    <h4 class="font-black text-slate-900 text-base leading-tight mt-0.5">Mesa {{ ticket.tableNumber }}</h4>
                  </div>
                  <span class="text-[10px] font-mono font-bold text-[#9235DF] bg-[#9235DF]/5 px-2 py-0.5 rounded border border-slate-100">
                    {{ ticket.elapsedTime }}
                  </span>
                </div>

                <div class="text-sm font-black text-slate-800">
                  {{ ticket.item.quantity }}x {{ ticket.item.name }}
                </div>

                <!-- Modifiers & Custom notes -->
                <div v-if="ticket.item.notes" class="flex flex-wrap gap-1.5 pt-1">
                  <span
                    v-for="mod in parseModifiers(ticket.item.notes)"
                    :key="mod"
                    class="px-2 py-0.5 bg-rose-50/50 text-rose-700 rounded text-[9px] font-semibold border border-rose-100/50"
                  >
                    {{ mod }}
                  </span>
                </div>

                <div class="pt-3 border-t border-slate-50 flex justify-between items-center">
                  <span v-if="ticket.isLate" class="text-[9px] text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                    ¡Retrasado!
                  </span>
                  <span v-else class="text-[9px] text-[#9235DF] font-bold animate-pulse">Preparando...</span>

                  <button
                    @click="updateStatus(ticket.tableId, ticket.item.id, 'ready')"
                    class="px-3.5 py-1.5 bg-[#9235DF] hover:bg-[#562AAC] text-white font-black text-xs rounded-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <span>Listo</span>
                    <i class="pi pi-check-circle text-[10px]"></i>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="preparingItems.length === 0" class="text-center py-16 text-slate-300 text-xs">
              Sin copas en preparación.
            </div>
          </div>
        </div>

        <!-- COLUMN 3: LISTOS (READY) -->
        <div class="bg-white rounded-3xl border border-slate-100 flex flex-col h-full overflow-hidden shadow-sm">
          <div class="p-4 border-b border-slate-50 bg-slate-50/40 flex justify-between items-center shrink-0">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/20"></span>
              <h3 class="font-black text-slate-800 text-xs uppercase tracking-wider">Listos</h3>
            </div>
            <span class="text-[10px] font-mono font-black bg-slate-100 px-2 py-0.5 rounded text-slate-400">{{ readyItems.length }}</span>
          </div>

          <div
            @dragover.prevent
            @drop="onCardDrop($event, 'ready')"
            class="flex-1 overflow-y-auto p-4 space-y-4 min-h-[350px] bg-[#FCFCFD]/40"
          >
            <div
              v-for="ticket in readyItems"
              :key="ticket.item.id"
              draggable="true"
              @dragstart="onCardDragStart($event, ticket)"
              :class="[
                'p-4 rounded-2xl bg-white border shadow-sm transition-all duration-300 relative group overflow-hidden cursor-grab active:cursor-grabbing border-slate-200/70 hover:border-slate-350',
                ticket.elapsedSeconds < 120 ? 'border-l-4 border-l-emerald-500' : '',
                ticket.elapsedSeconds >= 120 && ticket.elapsedSeconds < 300 ? 'border-l-4 border-l-amber-500' : '',
                ticket.elapsedSeconds >= 300 ? 'border-l-4 border-l-rose-500' : ''
              ]"
            >
              <div class="space-y-3">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[9px] font-black uppercase text-slate-400 font-mono tracking-wider">
                      M-{{ ticket.tableNumber }} • {{ getDestinationBadgeLabel(ticket.item.category) }}
                    </span>
                    <h4 class="font-black text-slate-900 text-base leading-tight mt-0.5">Mesa {{ ticket.tableNumber }}</h4>
                  </div>
                  <span class="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Listo
                  </span>
                </div>

                <div class="text-sm font-black text-slate-800">
                  {{ ticket.item.quantity }}x {{ ticket.item.name }}
                </div>

                <!-- Modifiers & Custom notes -->
                <div v-if="ticket.item.notes" class="flex flex-wrap gap-1.5 pt-1">
                  <span
                    v-for="mod in parseModifiers(ticket.item.notes)"
                    :key="mod"
                    class="px-2 py-0.5 bg-rose-50/50 text-rose-700 rounded text-[9px] font-semibold border border-rose-100/50"
                  >
                    {{ mod }}
                  </span>
                </div>

                <div class="pt-3 border-t border-slate-50 flex justify-between items-center">
                  <span class="text-[9px] text-emerald-600 font-bold">Esperando retirar</span>

                  <button
                    @click="updateStatus(ticket.tableId, ticket.item.id, 'served')"
                    class="px-3.5 py-1.5 bg-emerald-550 hover:bg-emerald-600 text-white font-black text-xs rounded-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <span>Entregar</span>
                    <i class="pi pi-check text-[10px]"></i>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="readyItems.length === 0" class="text-center py-16 text-slate-300 text-xs">
              Sin copas listas.
            </div>
          </div>
        </div>

        <!-- COLUMN 4: SERVIDOS (SERVED HISTORY) -->
        <div class="bg-white rounded-3xl border border-slate-100 flex flex-col h-full overflow-hidden shadow-sm">
          <div class="p-4 border-b border-slate-50 bg-slate-50/40 flex justify-between items-center shrink-0">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-md"></span>
              <h3 class="font-black text-slate-800 text-xs uppercase tracking-wider">Servidos</h3>
            </div>
            <span class="text-[10px] font-mono font-black bg-slate-100 px-2 py-0.5 rounded text-slate-400">{{ servedItems.length }}</span>
          </div>

          <div
            @dragover.prevent
            @drop="onCardDrop($event, 'served')"
            class="flex-1 overflow-y-auto p-4 space-y-4 min-h-[350px] bg-[#FCFCFD]/40"
          >
            <div
              v-for="ticket in servedItems"
              :key="ticket.item.id"
              class="p-4 rounded-2xl bg-white border border-slate-200/50 shadow-none relative overflow-hidden opacity-65 hover:opacity-90 transition-opacity"
            >
              <div class="space-y-3">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[9px] font-black uppercase text-slate-400 font-mono tracking-wider">
                      M-{{ ticket.tableNumber }} • {{ getDestinationBadgeLabel(ticket.item.category) }}
                    </span>
                    <h4 class="font-black text-slate-700 text-base leading-tight mt-0.5">Mesa {{ ticket.tableNumber }}</h4>
                  </div>
                  <span class="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                    Entregado
                  </span>
                </div>

                <div class="text-sm font-bold text-slate-500 line-through">
                  {{ ticket.item.quantity }}x {{ ticket.item.name }}
                </div>
              </div>
            </div>

            <div v-if="servedItems.length === 0" class="text-center py-16 text-slate-300 text-xs">
              Historial vacío.
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMesasStore, type OrderItemStatus } from '../stores/mesas'

const mesasStore = useMesasStore()
const router = useRouter()

const activeFilter = ref<'cocina' | 'barra' | 'todos'>('barra')

const filterOptions = [
  { label: 'Solo Cocina', value: 'cocina' as const },
  { label: 'Solo Barra', value: 'barra' as const },
  { label: 'Todos', value: 'todos' as const }
]

// Dynamic timers and clocks
const currentTimeString = ref('')
const ticketSecondsMap = ref<Record<string, number>>({})
let timeInterval: any = null

const updateClockString = () => {
  const d = new Date()
  const hrs = String(d.getHours()).padStart(2, '0')
  const mins = String(d.getMinutes()).padStart(2, '0')
  const secs = String(d.getSeconds()).padStart(2, '0')
  currentTimeString.value = `${hrs}:${mins}:${secs}`
}

const updateTimersAndClocks = () => {
  updateClockString()

  // Update seconds map for items
  mesasStore.tables.forEach(table => {
    table.orders.forEach(order => {
      if (ticketSecondsMap.value[order.id] === undefined) {
        if (order.status === 'pending') {
          ticketSecondsMap.value[order.id] = Math.floor(Math.random() * 40) + 15
        } else if (order.status === 'preparing') {
          ticketSecondsMap.value[order.id] = Math.floor(Math.random() * 80) + 120
        } else if (order.status === 'ready') {
          ticketSecondsMap.value[order.id] = Math.floor(Math.random() * 60) + 240
        } else {
          ticketSecondsMap.value[order.id] = Math.floor(Math.random() * 120) + 380
        }
      } else {
        if (order.status === 'pending' || order.status === 'preparing') {
          ticketSecondsMap.value[order.id]++
        }
      }
    })
  })
}

onMounted(() => {
  updateClockString()
  timeInterval = setInterval(updateTimersAndClocks, 1000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})

const goBack = () => {
  router.push('/')
}

const getDestinationBadgeLabel = (category: string) => {
  return category === 'bebidas' ? 'BARRA' : 'COCINA'
}

const parseModifiers = (notes: string): string[] => {
  if (!notes) return []
  return notes.split(', ').filter(Boolean)
}

// Complete items map (active + served items)
const mappedKdsItems = computed(() => {
  const items: Array<{
    tableNumber: number
    tableId: string
    item: {
      id: string
      name: string
      price: number
      quantity: number
      status: OrderItemStatus
      category: string
      notes?: string
    }
    elapsedTime: string
    elapsedSeconds: number
    isLate: boolean
  }> = []

  mesasStore.tables.forEach(table => {
    table.orders.forEach(orderItem => {
      const isCocina = orderItem.category !== 'bebidas'
      const matchesFilter =
        (activeFilter.value === 'todos') ||
        (activeFilter.value === 'cocina' && isCocina) ||
        (activeFilter.value === 'barra' && !isCocina)

      if (matchesFilter) {
        const totalSecs = ticketSecondsMap.value[orderItem.id] || 30
        const elapsedMin = Math.floor(totalSecs / 60)
        const elapsedSec = totalSecs % 60
        const timeStr = `${String(elapsedMin).padStart(2, '0')}:${String(elapsedSec).padStart(2, '0')}`
        const isLate = totalSecs >= 300 // 5 minutes

        items.push({
          tableNumber: table.number,
          tableId: table.id,
          item: orderItem,
          elapsedTime: timeStr,
          elapsedSeconds: totalSecs,
          isLate
        })
      }
    })
  })

  return items.sort((a, b) => b.elapsedSeconds - a.elapsedSeconds)
})

// Kanban columns filtering
const pendingItems = computed(() => {
  return mappedKdsItems.value.filter(ticket => ticket.item.status === 'pending')
})

const preparingItems = computed(() => {
  return mappedKdsItems.value.filter(ticket => ticket.item.status === 'preparing')
})

const readyItems = computed(() => {
  return mappedKdsItems.value.filter(ticket => ticket.item.status === 'ready')
})

const servedItems = computed(() => {
  return mappedKdsItems.value.filter(ticket => ticket.item.status === 'served').slice(0, 10)
})

// Header metrics
const activeTicketsCount = computed(() => {
  return pendingItems.value.length + preparingItems.value.length
})

const lateTicketsCount = computed(() => {
  return mappedKdsItems.value.filter(ticket =>
    ticket.isLate && (ticket.item.status === 'pending' || ticket.item.status === 'preparing')
  ).length
})

const avgPrepTime = computed(() => {
  const activeList = preparingItems.value
  if (activeList.length === 0) return '4.1'
  const sum = activeList.reduce((acc, t) => acc + t.elapsedSeconds, 0)
  const avgMin = (sum / activeList.length) / 60
  return avgMin.toFixed(1)
})

// Status modification trigger
const updateStatus = (tableId: string, orderItemId: string, newStatus: OrderItemStatus) => {
  mesasStore.updateOrderItemStatus(tableId, orderItemId, newStatus)
}

// HTML5 Drag and drop event handlers
const onCardDragStart = (event: DragEvent, ticket: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', JSON.stringify({
      tableId: ticket.tableId,
      itemId: ticket.item.id
    }))
    event.dataTransfer.effectAllowed = 'move'
  }
}

const onCardDrop = (event: DragEvent, targetStatus: OrderItemStatus) => {
  if (event.dataTransfer) {
    const rawData = event.dataTransfer.getData('text/plain')
    if (rawData) {
      try {
        const { tableId, itemId } = JSON.parse(rawData)
        if (tableId && itemId) {
          updateStatus(tableId, itemId, targetStatus)
        }
      } catch (err) {
        console.error('Drag and drop parsing error:', err)
      }
    }
  }
}
</script>
