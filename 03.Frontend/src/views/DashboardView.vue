<template>
  <div class="bg-app-background min-h-[calc(100vh-4rem)] p-6 text-app-text space-y-6">
    <!-- Header with greeting -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-extrabold tracking-tight text-app-text">Panel de Control</h2>
        <p class="text-sm text-app-text-muted mt-1">
          Resumen operativo de <span class="text-app-primary font-semibold">{{ localesStore.activeLocale?.name }}</span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="generateMockSale" 
          class="flex items-center gap-2 px-4 py-2 bg-app-primary hover:bg-app-primary-hover text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-md shadow-app-primary/10 active:scale-95 cursor-pointer"
        >
          <i class="pi pi-plus"></i>
          <span>Simular Venta Rápida</span>
        </button>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Sales -->
      <div class="bg-white p-5 rounded-2xl border border-app-border relative overflow-hidden group hover:border-app-primary/20 transition-all duration-300 shadow-sm">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs font-semibold text-app-text-muted uppercase tracking-wider">Ventas de Hoy</p>
            <h3 class="text-2xl font-black mt-2 text-app-text">{{ totalSales.toFixed(2) }} €</h3>
          </div>
          <div class="p-3 bg-app-primary-soft text-app-primary rounded-xl">
            <i class="pi pi-euro text-lg"></i>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-2 text-xs">
          <span class="text-emerald-600 font-bold flex items-center gap-0.5">
            <i class="pi pi-arrow-up-right"></i> +12.4%
          </span>
          <span class="text-app-text-muted">vs ayer</span>
        </div>
        <div class="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-app-primary to-app-primary-hover opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      <!-- Occupancy -->
      <div class="bg-white p-5 rounded-2xl border border-app-border relative overflow-hidden group hover:border-teal-500/20 transition-all duration-300 shadow-sm">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs font-semibold text-app-text-muted uppercase tracking-wider">Ocupación</p>
            <h3 class="text-2xl font-black mt-2 text-app-text">{{ occupiedTablesCount }} / {{ totalTablesCount }}</h3>
          </div>
          <div class="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <i class="pi pi-users text-lg"></i>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-2 text-xs">
          <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div class="bg-teal-500 h-1.5 rounded-full" :style="{ width: `${occupancyRate}%` }"></div>
          </div>
          <span class="text-app-text font-semibold">{{ occupancyRate.toFixed(0) }}%</span>
        </div>
        <div class="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      <!-- Pending Orders -->
      <div class="bg-white p-5 rounded-2xl border border-app-border relative overflow-hidden group hover:border-rose-500/20 transition-all duration-300 shadow-sm">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs font-semibold text-app-text-muted uppercase tracking-wider">Comandas Activas</p>
            <h3 class="text-2xl font-black mt-2 text-app-text">{{ activePreparationsCount }} items</h3>
          </div>
          <div class="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <i class="pi pi-bell text-lg"></i>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-2 text-xs">
          <span class="text-rose-600 font-bold flex items-center gap-0.5">
            {{ pendingPrepsCount }} en cola
          </span>
          <span class="text-app-text-muted">esperando servicio</span>
        </div>
        <div class="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      <!-- Average Ticket -->
      <div class="bg-white p-5 rounded-2xl border border-app-border relative overflow-hidden group hover:border-violet-500/20 transition-all duration-300 shadow-sm">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs font-semibold text-app-text-muted uppercase tracking-wider">Ticket Medio</p>
            <h3 class="text-2xl font-black mt-2 text-app-text">{{ averageTicket.toFixed(2) }} €</h3>
          </div>
          <div class="p-3 bg-violet-50 text-violet-600 rounded-xl">
            <i class="pi pi-receipt text-lg"></i>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-2 text-xs">
          <span class="text-emerald-600 font-bold flex items-center gap-0.5">
            <i class="pi pi-arrow-up-right"></i> +4.2%
          </span>
          <span class="text-app-text-muted">este mes</span>
        </div>
        <div class="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
    </div>

    <!-- Charts Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sales Chart -->
      <div class="bg-white p-6 rounded-3xl border border-app-border lg:col-span-2 space-y-4 shadow-sm">
        <div class="flex justify-between items-center">
          <div>
            <h4 class="font-bold text-lg text-app-text">Facturación Horaria</h4>
            <p class="text-xs text-app-text-muted">Curva de ventas del día actual</p>
          </div>
          <span class="text-xs font-bold text-app-primary px-3 py-1 rounded-full bg-app-primary-soft border border-app-primary/20">Hoy</span>
        </div>
        
        <!-- Elegant SVG Curve Chart -->
        <div class="w-full h-64 relative bg-slate-50 rounded-2xl p-4 flex items-end">
          <svg viewBox="0 0 100 40" class="w-full h-full overflow-visible" preserveAspectRatio="none">
            <!-- Gradients -->
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--color-app-primary)" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="var(--color-app-primary)" stop-opacity="0"/>
              </linearGradient>
            </defs>

            <!-- Grid Lines -->
            <line x1="0" y1="10" x2="100" y2="10" stroke="var(--color-app-border)" stroke-width="0.3" stroke-dasharray="1,1" />
            <line x1="0" y1="20" x2="100" y2="20" stroke="var(--color-app-border)" stroke-width="0.3" stroke-dasharray="1,1" />
            <line x1="0" y1="30" x2="100" y2="30" stroke="var(--color-app-border)" stroke-width="0.3" stroke-dasharray="1,1" />

            <!-- Area under path -->
            <path 
              d="M 5,40 C 20,25 35,15 50,22 C 65,30 80,10 95,8 L 95,40 Z" 
              fill="url(#chartGrad)" 
            />
            
            <!-- Curve Path -->
            <path 
              d="M 5,40 C 20,25 35,15 50,22 C 65,30 80,10 95,8" 
              fill="none" 
              stroke="var(--color-app-primary)"
              stroke-width="1.2" 
              stroke-linecap="round" 
            />

            <!-- Data Nodes -->
            <circle cx="50" cy="22" r="1.5" fill="var(--color-app-primary)" stroke="var(--color-app-surface)" stroke-width="0.5" />
            <circle cx="95" cy="8" r="1.5" fill="var(--color-app-primary)" stroke="var(--color-app-surface)" stroke-width="0.5" />
          </svg>

          <!-- Label Overlay -->
          <div class="absolute bottom-4 left-6 text-[10px] text-app-text-muted">12:00</div>
          <div class="absolute bottom-4 left-[50%] -translate-x-1/2 text-[10px] text-app-text-muted font-semibold bg-white border border-app-border px-1.5 py-0.5 rounded shadow-sm">14:00 (Pico: 340 €)</div>
          <div class="absolute bottom-4 right-6 text-[10px] text-app-text-muted">16:00</div>
        </div>
      </div>

      <!-- Categories Chart / Sales Distribution -->
      <div class="bg-white p-6 rounded-3xl border border-app-border space-y-4 shadow-sm">
        <div>
          <h4 class="font-bold text-lg text-app-text">Por Categoría</h4>
          <p class="text-xs text-app-text-muted">Distribución de las comandas</p>
        </div>

        <div class="space-y-4 pt-4">
          <div v-for="cat in categoryDistribution" :key="cat.name" class="space-y-2">
            <div class="flex justify-between text-xs font-semibold">
              <span class="text-app-text">{{ cat.name }}</span>
              <span class="text-app-text-muted">{{ cat.percentage }}%</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div :class="['h-2 rounded-full', cat.color === 'bg-amber-500' ? 'bg-app-primary' : cat.color]" :style="{ width: `${cat.percentage}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Recent Sales Feed -->
    <div class="bg-white p-6 rounded-3xl border border-app-border space-y-4 shadow-sm">
      <div class="flex justify-between items-center">
        <div>
          <h4 class="font-bold text-lg text-app-text">Últimas Transacciones</h4>
          <p class="text-xs text-app-text-muted">Ventas finalizadas recientemente en sala</p>
        </div>
        <router-link to="/mesas" class="text-xs font-semibold text-app-primary hover:underline">Ir a Mesas &rarr;</router-link>
      </div>

      <!-- Table of transactions -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-app-text">
          <thead>
            <tr class="border-b border-app-border text-xs text-app-text-muted font-bold uppercase tracking-wider">
              <th class="pb-3">ID Venta</th>
              <th class="pb-3">Mesa</th>
              <th class="pb-3">Artículos</th>
              <th class="pb-3 text-right">Método Pago</th>
              <th class="pb-3 text-right">Hora</th>
              <th class="pb-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-app-border">
            <tr v-for="order in mesasStore.completedOrders.slice().reverse()" :key="order.id" class="hover:bg-slate-50 transition-colors">
              <td class="py-3 font-mono text-xs text-app-text-muted">#{{ order.id }}</td>
              <td class="py-3 font-bold text-app-text">Mesa {{ order.tableNumber }}</td>
              <td class="py-3 text-app-text">{{ order.itemsCount }} productos</td>
              <td class="py-3 text-right">
                <span :class="['inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider', 
                  order.paymentMethod === 'card' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200/60' : 'bg-app-primary-soft text-app-primary border border-app-primary/20']">
                  {{ order.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo' }}
                </span>
              </td>
              <td class="py-3 text-right text-app-text-muted text-xs">{{ order.timestamp }}</td>
              <td class="py-3 text-right font-black text-app-text text-base">{{ order.total.toFixed(2) }} €</td>
            </tr>
            <tr v-if="mesasStore.completedOrders.length === 0">
              <td colspan="6" class="py-8 text-center text-app-text-muted">No hay ventas registradas hoy.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLocalesStore } from '../stores/locales'
import { useMesasStore } from '../stores/mesas'

const localesStore = useLocalesStore()
const mesasStore = useMesasStore()

// KPI calculations
const totalSales = computed(() => {
  return mesasStore.completedOrders.reduce((sum, o) => sum + o.total, 0)
})

const totalTablesCount = computed(() => {
  return mesasStore.tables.length
})

const occupiedTablesCount = computed(() => {
  return mesasStore.tables.filter(t => t.status === 'occupied' || t.status === 'bill').length
})

const occupancyRate = computed(() => {
  if (totalTablesCount.value === 0) return 0
  return (occupiedTablesCount.value / totalTablesCount.value) * 100
})

const activePreparationsCount = computed(() => {
  return mesasStore.kitchenItems.length + mesasStore.barItems.length
})

const pendingPrepsCount = computed(() => {
  const kPending = mesasStore.kitchenItems.filter(i => i.item.status === 'pending').length
  const bPending = mesasStore.barItems.filter(i => i.item.status === 'pending').length
  return kPending + bPending
})

const averageTicket = computed(() => {
  const count = mesasStore.completedOrders.length
  if (count === 0) return 0
  return totalSales.value / count
})

// Categorized commands for dashboard bar chart
const categoryDistribution = computed(() => {
  // Compute total completed order totals or mock distribution for details
  return [
    { name: 'Tapas & Raciones', percentage: 45, color: 'bg-amber-500' },
    { name: 'Platos de Cocina', percentage: 28, color: 'bg-emerald-500' },
    { name: 'Bebidas & Copas', percentage: 18, color: 'bg-blue-500' },
    { name: 'Postres', percentage: 9, color: 'bg-violet-500' }
  ]
})

// Simulate random sale
const generateMockSale = () => {
  const tableNum = Math.floor(Math.random() * 12) + 1
  const itemsCount = Math.floor(Math.random() * 6) + 1
  const total = Math.random() * 80 + 10 // between 10€ and 90€
  const paymentMethod = Math.random() > 0.3 ? 'card' : 'cash'
  
  const now = new Date()
  const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  
  mesasStore.completedOrders.push({
    id: 'c-' + Math.random().toString(36).substr(2, 9),
    tableNumber: tableNum,
    itemsCount,
    total,
    paymentMethod,
    timestamp
  })
}
</script>
