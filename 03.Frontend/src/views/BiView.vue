<template>
  <div class="bg-[#F8F9FA] min-h-[calc(100vh-4rem)] text-[#08071A] font-inter antialiased select-none">
    
    <!-- MAIN BI CONTAINER -->
    <div class="w-full max-w-[1600px] mx-auto p-4 md:p-6 h-[calc(100vh-6rem)] flex flex-col gap-6">
      
      <!-- EXECUTIVE CONTROL HEADER -->
      <div class="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm shrink-0">
        <div>
          <span class="text-[10px] font-bold text-[#9235DF] uppercase tracking-widest block">Aveniq Business Intelligence</span>
          <h2 class="text-2xl font-black tracking-tight font-outfit text-[#08071A] mt-0.5">
            Centro de Control Ejecutivo
          </h2>
          <p class="text-xs text-slate-400 font-medium">Indicadores analíticos de ventas, rentabilidad real de carta, operaciones y forecasting.</p>
        </div>

        <!-- Filters & Export -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Global Filters Bar -->
          <div class="flex items-center bg-slate-100 p-1 rounded-xl">
            <button 
              v-for="f in filterOptions" 
              :key="f.value"
              @click="biStore.activeFilter = f.value"
              :class="['px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer uppercase tracking-wider',
                biStore.activeFilter === f.value 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800']"
            >
              {{ f.label }}
            </button>
          </div>

          <!-- Export dropdown button -->
          <div class="relative">
            <button 
              @click="showExportMenu = !showExportMenu"
              class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <i class="pi pi-download"></i>
              <span>Exportar Reporte</span>
            </button>
            
            <div 
              v-if="showExportMenu" 
              class="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 text-xs font-bold text-slate-650"
            >
              <button @click="triggerSimulatedExport('PDF')" class="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl cursor-pointer">Exportar PDF</button>
              <button @click="triggerSimulatedExport('Excel')" class="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl cursor-pointer">Exportar Excel (XLSX)</button>
              <button @click="triggerSimulatedExport('CSV')" class="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl cursor-pointer">Exportar CSV</button>
            </div>
          </div>
        </div>
      </div>

      <!-- NAVIGATION TABS -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto shrink-0">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0',
            activeTab === tab.id 
              ? 'bg-[#9235DF]/5 border border-[#9235DF]/20 text-[#9235DF]' 
              : 'bg-white border border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-800']"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- MAIN TAB VIEWPORT -->
      <div class="flex-1 overflow-hidden min-h-0">
        
        <!-- TAB 1: PORTADA RESUMEN EJECUTIVO -->
        <div v-if="activeTab === 'portada'" class="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto pr-1">
          <!-- Left side widgets -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Large KPI Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <!-- Ventas Totales -->
              <div class="bg-slate-900 p-5 rounded-3xl text-white space-y-2 relative overflow-hidden group shadow-lg">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ventas Rango</span>
                <span class="text-2xl font-black block font-mono">{{ biStore.totalSalesRevenue.toFixed(2) }} €</span>
                <span class="text-[9px] text-emerald-400 font-bold block">✓ Facturación Neta</span>
              </div>

              <!-- Ticket Medio -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group">
                <span class="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Ticket Medio</span>
                <span class="text-2xl font-black block font-mono">{{ biStore.averageTicket.toFixed(2) }} €</span>
                <span class="text-[9px] text-slate-400 font-bold block">Promedio de consumo</span>
              </div>

              <!-- Margen Operativo Medio -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group">
                <span class="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Margen de Carta</span>
                <span class="text-2xl font-black block font-mono text-[#9235DF]">{{ marginMedio.toFixed(0) }} %</span>
                <span class="text-[9px] text-indigo-500 font-bold block">Rendimiento gastronómico</span>
              </div>

              <!-- Existencias en Mínimo -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group">
                <span class="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Productos Críticos</span>
                <span class="text-2xl font-black block font-mono text-rose-600">{{ criticalProductsCount }}</span>
                <span class="text-[9px] text-rose-500 font-bold block">Alerta reposición</span>
              </div>
            </div>

            <!-- Opportunities Panel -->
            <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 class="text-xs font-black text-slate-450 uppercase tracking-widest">Top Oportunidades de Negocio</h3>
              
              <div class="space-y-3">
                <div class="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex items-center justify-between gap-4 text-xs font-bold text-slate-800">
                  <div class="space-y-0.5">
                    <span class="text-slate-900 block font-black">Ajustar Coste Brioche para Hamburguesa</span>
                    <p class="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Incrementa el margen bruto en un 8.5%</p>
                  </div>
                  <span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[9px] uppercase tracking-wider font-black">Viabilidad Alta</span>
                </div>

                <div class="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex items-center justify-between gap-4 text-xs font-bold text-slate-800">
                  <div class="space-y-0.5">
                    <span class="text-slate-900 block font-black">Incrementar Cerveza Heineken a 3.80 €</span>
                    <p class="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Captura hasta un 12% extra de retorno mensual</p>
                  </div>
                  <span class="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-[9px] uppercase tracking-wider font-black">Margen Carta</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right side Risks Panel -->
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 h-fit">
            <h3 class="text-xs font-black text-slate-450 uppercase tracking-widest">Top Riesgos & Alertas</h3>
            
            <div class="space-y-3.5">
              <div class="p-4 bg-rose-50/40 border border-rose-100 rounded-2xl flex items-center justify-between gap-4 text-xs font-bold text-rose-950">
                <div class="space-y-0.5">
                  <span class="text-slate-900 block font-black">Existencias críticas en Almacén</span>
                  <p class="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Hay {{ criticalProductsCount }} insumos bajo stock mínimo.</p>
                </div>
                <i class="pi pi-exclamation-triangle text-rose-500 text-sm"></i>
              </div>

              <div class="p-4 bg-rose-50/40 border border-rose-100 rounded-2xl flex items-center justify-between gap-4 text-xs font-bold text-rose-950">
                <div class="space-y-0.5">
                  <span class="text-slate-900 block font-black">Tasa de No Show Reservas</span>
                  <p class="text-[10px] text-slate-400 font-bold uppercase mt-0.5">La tasa media acumulada supera el 10%.</p>
                </div>
                <i class="pi pi-users text-rose-500 text-sm"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: VENTAS (Looker-style Charts) -->
        <div v-if="activeTab === 'ventas'" class="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-1">
          <!-- Sales distribution chart by hour (custom SVG line area chart) -->
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 class="text-xs font-black text-slate-450 uppercase tracking-widest">Ventas por Rango Horario</h3>
            
            <!-- SVG chart -->
            <div class="w-full h-56 flex items-end justify-between gap-4 pt-8 pb-4 relative">
              <!-- Y Axis lines -->
              <div class="absolute inset-0 flex flex-col justify-between pointer-events-none text-[8px] text-slate-400 font-mono">
                <div class="border-b border-slate-100 pb-1 w-full text-right">300€</div>
                <div class="border-b border-slate-100 pb-1 w-full text-right">150€</div>
                <div class="border-b border-slate-100 pb-1 w-full text-right">0€</div>
              </div>

              <!-- Chart Bars -->
              <div 
                v-for="bar in biStore.salesByHourChart" 
                :key="bar.label"
                class="flex-1 flex flex-col items-center gap-2 relative z-10"
              >
                <div 
                  class="w-16 bg-gradient-to-t from-[#9235DF] to-[#562AAC] rounded-t-xl transition-all duration-700"
                  :style="{ height: `${Math.min(100, (bar.value / 350) * 100)}px` }"
                ></div>
                <span class="text-[9px] font-bold text-slate-500 text-center block mt-1">{{ bar.label }}</span>
                <span class="text-[10px] font-mono text-[#9235DF] font-black block mt-0.5">{{ bar.value.toFixed(0) }}€</span>
              </div>
            </div>
          </div>

          <!-- Sales distribution chart by waiter (custom SVG bar layout) -->
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 class="text-xs font-black text-slate-450 uppercase tracking-widest">Facturación por Camarero</h3>
            
            <div class="space-y-4 pt-2">
              <div 
                v-for="waiter in biStore.salesByWaiterChart" 
                :key="waiter.label"
                class="space-y-1.5"
              >
                <div class="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span class="text-slate-800">{{ waiter.label }}</span>
                  <span class="font-mono text-slate-900">{{ waiter.value.toFixed(2) }} €</span>
                </div>
                <!-- Custom horizontal progress bar -->
                <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-700"
                    :style="{ width: `${Math.min(100, (waiter.value / Math.max(1, biStore.totalSalesRevenue)) * 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: RENTABILIDAD -->
        <div v-if="activeTab === 'rentabilidad'" class="h-full bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm overflow-hidden">
          <div class="border-b border-slate-50 pb-4 shrink-0">
            <h3 class="text-sm font-black text-[#08071A] uppercase tracking-wider">Margen & Rentabilidad de Carta</h3>
            <p class="text-xs text-slate-450 mt-0.5 font-medium">Auditoría detallada de coste de materias primas e ingresos brutos por receta.</p>
          </div>

          <!-- List of recipes sorted by margins -->
          <div class="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
            <div 
              v-for="recipe in sortedRecipes" 
              :key="recipe.id"
              class="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-bold text-slate-650"
            >
              <div>
                <h4 class="font-black text-slate-900 text-sm">{{ recipe.name }}</h4>
                <p class="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Precio: {{ recipe.salePrice.toFixed(2) }}€ • Coste Total: {{ recipe.totalCost.toFixed(2) }}€</p>
              </div>

              <!-- Color coded margin block -->
              <div class="flex items-center gap-5">
                <div class="text-right">
                  <span class="text-[8px] text-slate-400 block uppercase">Margen Neto</span>
                  <span class="font-mono text-slate-900 text-sm font-black">{{ recipe.profit.toFixed(2) }} €</span>
                </div>
                
                <span :class="['px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider', 
                  recipe.marginPercent > 70 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : recipe.marginPercent < 40 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200']"
                >
                  {{ recipe.marginPercent.toFixed(0) }}% Margen
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 4: CLIENTES -->
        <div v-if="activeTab === 'clientes'" class="h-full bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm overflow-hidden">
          <div class="border-b border-slate-50 pb-4 shrink-0">
            <h3 class="text-sm font-black text-[#08071A] uppercase tracking-wider">Tráfico & Fidelidad de Clientes</h3>
            <p class="text-xs text-slate-450 mt-0.5 font-medium">Estadísticas de reservas, no shows e índice de retorno del comensal.</p>
          </div>

          <!-- CRM Statistics layout -->
          <div class="flex-1 overflow-y-auto py-6 grid grid-cols-1 md:grid-cols-2 gap-6 pr-2">
            <!-- Customer acquisition metrics -->
            <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-200 pb-2">Base de Datos</span>
              
              <div class="flex justify-between items-center text-xs font-bold text-slate-650">
                <span>Clientes Nuevos (1 visita o 0):</span>
                <span class="font-mono text-slate-900 font-black">{{ crmNewClientsCount }}</span>
              </div>
              <div class="flex justify-between items-center text-xs font-bold text-slate-650">
                <span>Clientes Frecuentes (> 4 visitas):</span>
                <span class="font-mono text-slate-900 font-black">{{ crmFrequentClientsCount }}</span>
              </div>
              <div class="flex justify-between items-center text-xs font-bold text-slate-650">
                <span>Clientes VIP (> 150€ gastados):</span>
                <span class="font-mono text-slate-900 font-black">{{ crmVipClientsCount }}</span>
              </div>
            </div>

            <!-- Booking and No Show metrics -->
            <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-200 pb-2">Comportamiento en Reservas</span>
              
              <div class="flex justify-between items-center text-xs font-bold text-slate-650">
                <span>Reservas hoy (CRM):</span>
                <span class="font-mono text-slate-900 font-black">{{ crmTodayBookingsCount }}</span>
              </div>
              <div class="flex justify-between items-center text-xs font-bold text-slate-650">
                <span>No Shows registrados hoy:</span>
                <span class="font-mono text-rose-600 font-black">{{ noShowsTodayCount }}</span>
              </div>
              <div class="flex justify-between items-center text-xs font-bold text-slate-650">
                <span>Mesas Ocupadas en Sala:</span>
                <span class="font-mono text-[#9235DF] font-black">{{ activeTablesCount }} / {{ totalTablesCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 5: PREDICCIONES -->
        <div v-if="activeTab === 'predicciones'" class="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-1">
          <!-- Predictive sales card -->
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 h-fit">
            <h3 class="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
              <i class="pi pi-eye text-[#9235DF]"></i>
              <span>Forecasting de Ventas (Próximas 24 horas)</span>
            </h3>

            <div class="p-5 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl space-y-4 shadow-md">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Predicción de Ventas</span>
                  <span class="text-2xl font-black font-mono block mt-1">{{ forecastSalesTomorrow.toFixed(2) }} €</span>
                </div>
                <span class="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider">Tendencia +8%</span>
              </div>
              <p class="text-[10px] text-slate-350 leading-relaxed font-medium">
                Cálculo proyectado mediante regresión lineal simulada, incorporando el volumen medio semanal y el incremento de reservas confirmadas para mañana.
              </p>
            </div>

            <!-- Previsión de abastecimiento -->
            <div class="space-y-2">
              <span class="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Productos críticos a reponer</span>
              
              <div v-if="criticalProducts.length === 0" class="text-xs text-slate-450 font-bold py-2">
                No hay productos en nivel crítico para reposición inmediata.
              </div>
              <div v-else class="flex flex-wrap gap-1.5">
                <span 
                  v-for="p in criticalProducts" 
                  :key="p.id"
                  class="px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold"
                >
                  ⚠️ {{ p.name }} (Stock: {{ p.stock }})
                </span>
              </div>
            </div>
          </div>

          <!-- Recommendations card -->
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 h-fit">
            <h3 class="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
              <i class="pi pi-cog text-[#9235DF]"></i>
              <span>Recomendaciones Ejecutivas</span>
            </h3>

            <div class="space-y-3.5">
              <div class="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-xs text-slate-600 font-bold space-y-1">
                <span class="text-slate-900 block font-black">Planificación de Turnos:</span>
                <p class="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Se estima hora punta de comensales mañana a las **14:00 - 15:30**. Se sugiere reforzar personal de sala y cocina.
                </p>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-xs text-slate-600 font-bold space-y-1">
                <span class="text-slate-900 block font-black">Compras & Abastecimiento:</span>
                <p class="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Generar albarán de compra rápido para **Agua Mineral** con el proveedor Makro para suplir la escasez crítica del fin de semana.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- DIALOG MODAL: EXPORT SUCCESS -->
    <div
      v-if="showExportModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-sm w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative text-center">
        <div class="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <i class="pi pi-check text-lg"></i>
        </div>

        <div class="space-y-1">
          <h3 class="text-lg font-black text-slate-900 font-outfit">Reporte Generado</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            La arquitectura de exportación en formato **{{ exportType }}** está lista. El archivo se ha estructurado con éxito y se encuentra listo para descargar.
          </p>
        </div>

        <button
          @click="showExportModal = false"
          class="w-full py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
        >
          Aceptar
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBiStore } from '../stores/bi'
import { useEscandallosStore } from '../stores/escandallos'
import { useInventarioStore } from '../stores/inventario'
import { useCrmStore } from '../stores/crm'
import { useMesasStore } from '../stores/mesas'
import { useReservasStore } from '../stores/reservas'

const biStore = useBiStore()
const escandallosStore = useEscandallosStore()
const inventarioStore = useInventarioStore()
const crmStore = useCrmStore()
const mesasStore = useMesasStore()
const reservasStore = useReservasStore()

// State
const activeTab = ref<'portada' | 'ventas' | 'rentabilidad' | 'clientes' | 'predicciones'>('portada')

const showExportMenu = ref(false)
const showExportModal = ref(false)
const exportType = ref('')

const tabs = [
  { id: 'portada' as const, label: 'Resumen Ejecutivo' },
  { id: 'ventas' as const, label: 'Análisis de Ventas' },
  { id: 'rentabilidad' as const, label: 'Costes & Márgenes' },
  { id: 'clientes' as const, label: 'Auditoría Clientes' },
  { id: 'predicciones' as const, label: 'Forecasting IA' }
]

const filterOptions = [
  { label: 'Hoy', value: 'hoy' as const },
  { label: 'Ayer', value: 'ayer' as const },
  { label: 'Semana', value: 'semana' as const },
  { label: 'Mes', value: 'mes' as const }
]


// Computed macro metrics from other modules
const marginMedio = computed(() => {
  const len = escandallosStore.recipesWithCosts.length
  if (len === 0) return 0
  return escandallosStore.recipesWithCosts.reduce((sum, r) => sum + r.marginPercent, 0) / len
})

const criticalProductsCount = computed(() => {
  return inventarioStore.products.filter(p => p.stock < p.minStock && p.stock > 0).length
})

const criticalProducts = computed(() => {
  return inventarioStore.products.filter(p => p.stock < p.minStock)
})

const sortedRecipes = computed(() => {
  return [...escandallosStore.recipesWithCosts].sort((a, b) => b.marginPercent - a.marginPercent)
})

// CRM statistics calculations
const crmNewClientsCount = computed(() => {
  return crmStore.clients.filter(c => c.visitsCount <= 1).length
})

const crmFrequentClientsCount = computed(() => {
  return crmStore.clients.filter(c => c.visitsCount >= 4).length
})

const crmVipClientsCount = computed(() => {
  return crmStore.clients.filter(c => c.tags.includes('VIP')).length
})

const crmTodayBookingsCount = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  return reservasStore.reservations.filter(r => r.date === todayStr).length
})

const noShowsTodayCount = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  return reservasStore.reservations.filter(r => r.date === todayStr && r.status === 'noshow').length
})

const activeTablesCount = computed(() => {
  return mesasStore.tables.filter(t => t.status === 'occupied' || t.status === 'bill').length
})

const totalTablesCount = computed(() => {
  return mesasStore.tables.length
})

// Forecasting linear extrapolation
const forecastSalesTomorrow = computed(() => {
  // average weekly sales + 8% trend increment
  const avg = biStore.totalSalesRevenue / 7
  return Math.max(120.00, avg * 1.08)
})

// Styling classes helper

// Interactive mockup export triggers
const triggerSimulatedExport = (format: string) => {
  exportType.value = format
  showExportMenu.value = false
  showExportModal.value = true
}


</script>
