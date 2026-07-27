<template>
  <div class="bg-app-background min-h-[calc(100vh-4rem)]">
    <div class="max-w-7xl w-full mx-auto p-6 text-app-text space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-3xl font-extrabold tracking-tight text-app-text">Pantalla de Barra (BDS)</h2>
          <p class="text-sm text-app-text-muted mt-1">Gestión rápida de bebidas, copas y cafés</p>
        </div>

        <!-- Quick Info -->
        <div class="flex gap-4">
          <div class="bg-white px-4 py-2 rounded-2xl border border-app-border text-center text-xs shadow-sm">
            <p class="text-app-text-muted font-semibold uppercase tracking-wider text-[10px]">Copas en Cola</p>
            <p class="text-lg font-black text-amber-600 mt-0.5">{{ pendingCount }}</p>
          </div>
          <div class="bg-white px-4 py-2 rounded-2xl border border-app-border text-center text-xs shadow-sm">
            <p class="text-app-text-muted font-semibold uppercase tracking-wider text-[10px]">Preparándose</p>
            <p class="text-lg font-black text-app-primary mt-0.5">{{ preparingCount }}</p>
          </div>
        </div>
      </div>

      <!-- BDS Board Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-190px)] min-h-[500px]">

        <!-- COLUMN 1: PENDING -->
        <div class="bg-slate-50 rounded-3xl border border-app-border flex flex-col h-full overflow-hidden shadow-sm">
          <div class="p-4 border-b border-app-border bg-slate-100/50 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-md shadow-amber-500/20"></span>
              <h3 class="font-bold text-app-text text-sm uppercase tracking-wider">Pendientes</h3>
            </div>
            <span class="text-xs font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-app-text-muted">{{ pendingItems.length }}</span>
          </div>

          <!-- Tickets list -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div
              v-for="ticket in pendingItems"
              :key="ticket.item.id"
              class="p-4 rounded-2xl bg-white border border-app-border hover:border-app-primary/20 transition-all duration-350 space-y-3 shadow-sm relative group overflow-hidden"
            >
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>

              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-black uppercase text-app-text-muted font-mono">BEBIDA</span>
                  <h4 class="font-black text-app-text text-lg leading-tight mt-0.5">Mesa {{ ticket.tableNumber }}</h4>
                </div>
                <span class="text-xs font-mono text-app-text-muted">{{ ticket.elapsedTime }}</span>
              </div>

              <div class="text-base font-bold text-app-text flex items-center gap-2">
                <i class="pi pi-glass text-amber-500 text-sm animate-pulse"></i>
                <span class="text-app-text font-extrabold">{{ ticket.item.quantity }}x {{ ticket.item.name }}</span>
              </div>

              <div class="pt-3 border-t border-app-border flex justify-between items-center">
                <span class="text-[10px] text-app-text-muted">Comanda directa</span>

                <button
                  @click="updateStatus(ticket.tableId, ticket.item.id, 'preparing')"
                  class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>Servir Copa</span>
                  <i class="pi pi-chevron-right text-[10px]"></i>
                </button>
              </div>
            </div>

            <div v-if="pendingItems.length === 0" class="text-center py-16 text-app-text-muted text-sm">
              Sin comandas de barra pendientes.
            </div>
          </div>
        </div>

        <!-- COLUMN 2: PREPARING -->
        <div class="bg-slate-50 rounded-3xl border border-app-border flex flex-col h-full overflow-hidden shadow-sm">
          <div class="p-4 border-b border-app-border bg-slate-100/50 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-app-primary shadow-md shadow-app-primary/20"></span>
              <h3 class="font-bold text-app-text text-sm uppercase tracking-wider">Preparando</h3>
            </div>
            <span class="text-xs font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-app-text-muted">{{ preparingItems.length }}</span>
          </div>

          <!-- Tickets list -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div
              v-for="ticket in preparingItems"
              :key="ticket.item.id"
              class="p-4 rounded-2xl bg-white border border-app-border hover:border-app-primary/20 transition-all duration-350 space-y-3 shadow-sm relative group overflow-hidden"
            >
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-app-primary"></div>

              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-black uppercase text-app-text-muted font-mono">BEBIDA</span>
                  <h4 class="font-black text-app-text text-lg leading-tight mt-0.5">Mesa {{ ticket.tableNumber }}</h4>
                </div>
                <span class="text-xs font-mono text-app-primary font-semibold">{{ ticket.elapsedTime }}</span>
              </div>

              <div class="text-base font-bold text-app-text flex items-center gap-2">
                <i class="pi pi-glass text-app-primary text-sm"></i>
                <span class="text-app-text font-extrabold">{{ ticket.item.quantity }}x {{ ticket.item.name }}</span>
              </div>

              <div class="pt-3 border-t border-app-border flex justify-between items-center">
                <span class="text-[10px] text-app-primary font-semibold bg-app-primary-soft/45 px-2 py-0.5 rounded animate-pulse">
                  Mezclando...
                </span>

                <button
                  @click="updateStatus(ticket.tableId, ticket.item.id, 'ready')"
                  class="px-3.5 py-1.5 bg-app-primary hover:bg-app-primary-hover text-white font-bold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>Listo</span>
                  <i class="pi pi-check-circle text-[10px]"></i>
                </button>
              </div>
            </div>

            <div v-if="preparingItems.length === 0" class="text-center py-16 text-app-text-muted text-sm">
              Sin bebidas en preparación.
            </div>
          </div>
        </div>

        <!-- COLUMN 3: READY / SERVED -->
        <div class="bg-slate-50 rounded-3xl border border-app-border flex flex-col h-full overflow-hidden shadow-sm">
          <div class="p-4 border-b border-app-border bg-slate-100/50 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/20"></span>
              <h3 class="font-bold text-app-text text-sm uppercase tracking-wider">Para Servir</h3>
            </div>
            <span class="text-xs font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-app-text-muted">{{ readyItems.length }}</span>
          </div>

          <!-- Tickets list -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div
              v-for="ticket in readyItems"
              :key="ticket.item.id"
              class="p-4 rounded-2xl bg-white border border-app-border hover:border-app-primary/20 transition-all duration-350 space-y-3 shadow-sm relative group overflow-hidden"
            >
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>

              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-black uppercase text-app-text-muted font-mono">BEBIDA</span>
                  <h4 class="font-black text-app-text text-lg leading-tight mt-0.5">Mesa {{ ticket.tableNumber }}</h4>
                </div>
                <span class="text-xs font-mono text-emerald-600 font-bold">Listas</span>
              </div>

              <div class="text-base font-bold text-app-text flex items-center gap-2">
                <i class="pi pi-glass text-emerald-500 text-sm"></i>
                <span class="text-app-text font-extrabold">{{ ticket.item.quantity }}x {{ ticket.item.name }}</span>
              </div>

              <div class="pt-3 border-t border-app-border flex justify-between items-center">
                <span class="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Listas en barra
                </span>

                <button
                  @click="updateStatus(ticket.tableId, ticket.item.id, 'served')"
                  class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-app-text border border-app-border font-bold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>Servido</span>
                </button>
              </div>
            </div>

            <div v-if="readyItems.length === 0" class="text-center py-16 text-app-text-muted text-sm">
              Sin copas pendientes de servir.
            </div>
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
