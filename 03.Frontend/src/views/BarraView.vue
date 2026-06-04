<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-extrabold tracking-tight">Pantalla de Barra (BDS)</h2>
        <p class="text-sm text-slate-400 mt-1">Gestión rápida de bebidas, copas y cafés</p>
      </div>
      
      <!-- Quick Info -->
      <div class="flex gap-4">
        <div class="glass px-4 py-2 rounded-2xl border border-white/5 text-center text-xs">
          <p class="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Copas en Cola</p>
          <p class="text-lg font-black text-amber-500 mt-0.5">{{ pendingCount }}</p>
        </div>
        <div class="glass px-4 py-2 rounded-2xl border border-white/5 text-center text-xs">
          <p class="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Preparándose</p>
          <p class="text-lg font-black text-violet-500 mt-0.5">{{ preparingCount }}</p>
        </div>
      </div>
    </div>

    <!-- BDS Board Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-190px)] min-h-[500px]">
      
      <!-- COLUMN 1: PENDING -->
      <div class="glass rounded-3xl border border-white/5 bg-slate-900/20 flex flex-col h-full overflow-hidden">
        <div class="p-4 border-b border-slate-800/80 bg-slate-950/40 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-md shadow-amber-500/20"></span>
            <h3 class="font-bold text-slate-200 text-sm uppercase tracking-wider">Pendientes</h3>
          </div>
          <span class="text-xs font-mono font-bold bg-slate-850 px-2 py-0.5 rounded text-slate-400">{{ pendingItems.length }}</span>
        </div>
        
        <!-- Tickets list -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div 
            v-for="ticket in pendingItems" 
            :key="ticket.item.id"
            class="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/20 transition-all duration-350 space-y-3 shadow-md relative group overflow-hidden"
          >
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>

            <div class="flex justify-between items-start">
              <div>
                <span class="text-[10px] font-black uppercase text-slate-500 font-mono">BEBIDA</span>
                <h4 class="font-black text-slate-100 text-lg leading-tight mt-0.5">Mesa {{ ticket.tableNumber }}</h4>
              </div>
              <span class="text-xs font-mono text-slate-500">{{ ticket.elapsedTime }}</span>
            </div>

            <div class="text-base font-bold text-slate-200 flex items-center gap-2">
              <i class="pi pi-glass text-amber-500 text-sm animate-pulse"></i>
              <span>{{ ticket.item.quantity }}x {{ ticket.item.name }}</span>
            </div>

            <div class="pt-3 border-t border-slate-800/80 flex justify-between items-center">
              <span class="text-[10px] text-slate-550">Comanda directa</span>

              <button 
                @click="updateStatus(ticket.tableId, ticket.item.id, 'preparing')"
                class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Servir Copa</span>
                <i class="pi pi-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>

          <div v-if="pendingItems.length === 0" class="text-center py-16 text-slate-500 text-sm">
            Sin comandas de barra pendientes.
          </div>
        </div>
      </div>

      <!-- COLUMN 2: PREPARING -->
      <div class="glass rounded-3xl border border-white/5 bg-slate-900/20 flex flex-col h-full overflow-hidden">
        <div class="p-4 border-b border-slate-800/80 bg-slate-950/40 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-md shadow-violet-500/20"></span>
            <h3 class="font-bold text-slate-200 text-sm uppercase tracking-wider">Preparando</h3>
          </div>
          <span class="text-xs font-mono font-bold bg-slate-850 px-2 py-0.5 rounded text-slate-400">{{ preparingItems.length }}</span>
        </div>
        
        <!-- Tickets list -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div 
            v-for="ticket in preparingItems" 
            :key="ticket.item.id"
            class="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-violet-500/20 transition-all duration-350 space-y-3 shadow-md relative group overflow-hidden"
          >
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>

            <div class="flex justify-between items-start">
              <div>
                <span class="text-[10px] font-black uppercase text-slate-500 font-mono">BEBIDA</span>
                <h4 class="font-black text-slate-100 text-lg leading-tight mt-0.5">Mesa {{ ticket.tableNumber }}</h4>
              </div>
              <span class="text-xs font-mono text-violet-400 font-semibold">{{ ticket.elapsedTime }}</span>
            </div>

            <div class="text-base font-bold text-slate-200 flex items-center gap-2">
              <i class="pi pi-glass text-violet-400 text-sm"></i>
              <span>{{ ticket.item.quantity }}x {{ ticket.item.name }}</span>
            </div>

            <div class="pt-3 border-t border-slate-800/80 flex justify-between items-center">
              <span class="text-[10px] text-violet-400 font-semibold bg-violet-500/10 px-2 py-0.5 rounded animate-pulse">
                Mezclando...
              </span>

              <button 
                @click="updateStatus(ticket.tableId, ticket.item.id, 'ready')"
                class="px-3.5 py-1.5 bg-violet-500 hover:bg-violet-600 text-slate-950 font-bold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Listo</span>
                <i class="pi pi-check-circle text-[10px]"></i>
              </button>
            </div>
          </div>

          <div v-if="preparingItems.length === 0" class="text-center py-16 text-slate-500 text-sm">
            Sin bebidas en preparación.
          </div>
        </div>
      </div>

      <!-- COLUMN 3: READY / SERVED -->
      <div class="glass rounded-3xl border border-white/5 bg-slate-900/20 flex flex-col h-full overflow-hidden">
        <div class="p-4 border-b border-slate-800/80 bg-slate-950/40 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/20"></span>
            <h3 class="font-bold text-slate-200 text-sm uppercase tracking-wider">Para Servir</h3>
          </div>
          <span class="text-xs font-mono font-bold bg-slate-850 px-2 py-0.5 rounded text-slate-400">{{ readyItems.length }}</span>
        </div>
        
        <!-- Tickets list -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div 
            v-for="ticket in readyItems" 
            :key="ticket.item.id"
            class="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/20 transition-all duration-350 space-y-3 shadow-md relative group overflow-hidden"
          >
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>

            <div class="flex justify-between items-start">
              <div>
                <span class="text-[10px] font-black uppercase text-slate-500 font-mono">BEBIDA</span>
                <h4 class="font-black text-slate-100 text-lg leading-tight mt-0.5">Mesa {{ ticket.tableNumber }}</h4>
              </div>
              <span class="text-xs font-mono text-emerald-500 font-bold">Listas</span>
            </div>

            <div class="text-base font-bold text-slate-200 flex items-center gap-2">
              <i class="pi pi-glass text-emerald-400 text-sm"></i>
              <span>{{ ticket.item.quantity }}x {{ ticket.item.name }}</span>
            </div>

            <div class="pt-3 border-t border-slate-800/80 flex justify-between items-center">
              <span class="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                Listas en barra
              </span>

              <button 
                @click="updateStatus(ticket.tableId, ticket.item.id, 'served')"
                class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Servido</span>
              </button>
            </div>
          </div>

          <div v-if="readyItems.length === 0" class="text-center py-16 text-slate-500 text-sm">
            Sin copas pendientes de servir.
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useMesasStore, type OrderItemStatus } from '../stores/mesas'

const mesasStore = useMesasStore()

// State for local timers
const currentSeconds = ref(0)
let timerInterval: any = null

onMounted(() => {
  timerInterval = setInterval(() => {
    currentSeconds.value++
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const getFormattedElapsedTime = (baseSecs: number) => {
  const total = baseSecs + currentSeconds.value
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// Map store items with dynamic mock timestamps to simulate BDS timers
const mappedBarItems = computed(() => {
  return mesasStore.barItems.map((bi, idx) => {
    const baseOffset = (idx * 20) + 15 
    return {
      ...bi,
      elapsedTime: getFormattedElapsedTime(baseOffset)
    }
  })
})

// Filtered lists for columns
const pendingItems = computed(() => {
  return mappedBarItems.value.filter(ticket => ticket.item.status === 'pending')
})

const preparingItems = computed(() => {
  return mappedBarItems.value.filter(ticket => ticket.item.status === 'preparing')
})

const readyItems = computed(() => {
  return mappedBarItems.value.filter(ticket => ticket.item.status === 'ready')
})

// Counts
const pendingCount = computed(() => pendingItems.value.length)
const preparingCount = computed(() => preparingItems.value.length)

// State modification trigger
const updateStatus = (tableId: string, orderItemId: string, newStatus: OrderItemStatus) => {
  mesasStore.updateOrderItemStatus(tableId, orderItemId, newStatus)
}
</script>
