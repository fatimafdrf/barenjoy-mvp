<template>
  <div class="bg-[#F8F9FA] min-h-[calc(100vh-4rem)] text-[#08071A] font-inter antialiased select-none">
    
    <!-- MAIN INVENTARIO ERP CONTAINER -->
    <div class="w-full max-w-[1600px] mx-auto p-4 md:p-6 h-[calc(100vh-6rem)] flex flex-col gap-6">
      
      <!-- ERP HEADER -->
      <div class="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shrink-0">
        <div>
          <span class="text-[10px] font-bold text-[#9235DF] uppercase tracking-widest">Aveniq ERP</span>
          <h2 class="text-2xl font-black tracking-tight font-outfit text-[#08071A] mt-0.5">
            Gestión de Inventario & Almacén
          </h2>
          <p class="text-xs text-slate-400 font-medium">Control de existencias en tiempo real, histórico de mermas e integración directa KDS/BDS.</p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer',
              activeTab === tab.id 
                ? 'bg-white text-[#08071A] shadow-sm' 
                : 'text-slate-500 hover:text-slate-800']"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- MAIN TAB CONTENT CONTAINER -->
      <div class="flex-1 overflow-hidden min-h-0">
        
        <!-- TAB 1: PRODUCTOS -->
        <div v-if="activeTab === 'productos'" class="h-full flex flex-col md:flex-row gap-6">
          <!-- Left filters side panel -->
          <div class="w-full md:w-80 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col gap-5 shrink-0 shadow-sm">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">Filtros & Catálogo</h3>
            
            <!-- Search bar -->
            <div class="relative w-full">
              <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar insumo/bebida..."
                class="w-full bg-slate-50 border border-slate-200 focus:border-[#9235DF]/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#08071A] font-semibold transition-colors focus:outline-none"
              />
            </div>

            <!-- Categories filter -->
            <div class="space-y-2">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Categoría</span>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="cat in categories"
                  :key="cat.value"
                  @click="activeCategory = cat.value"
                  :class="['px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border',
                    activeCategory === cat.value 
                      ? 'bg-slate-900 border-slate-900 text-white' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50']"
                >
                  {{ cat.label }}
                </button>
              </div>
            </div>

            <!-- Stock alert filter -->
            <div class="space-y-2">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Estado de Stock</span>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="st in stockStatuses"
                  :key="st.value"
                  @click="activeStockStatus = st.value"
                  :class="['px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border',
                    activeStockStatus === st.value 
                      ? 'bg-[#9235DF]/5 border-[#9235DF]/20 text-[#9235DF]' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50']"
                >
                  {{ st.label }}
                </button>
              </div>
            </div>

            <!-- Sort dropdown -->
            <div class="space-y-2">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ordenar Por</span>
              <div class="flex flex-col gap-1.5">
                <button
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  @click="activeSort = opt.value"
                  :class="['w-full py-2 px-3 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-left border flex items-center justify-between',
                    activeSort === opt.value 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600']"
                >
                  <span>{{ opt.label }}</span>
                  <i v-if="activeSort === opt.value" class="pi pi-check text-[8px]"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Products Premium Cards Catalog -->
          <div class="flex-1 overflow-y-auto pr-1">
            <div v-if="filteredProducts.length === 0" class="text-center py-20 text-slate-350 text-xs">
              No se encontraron productos en el almacén con el criterio seleccionado.
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <div
                v-for="product in sortedProducts"
                :key="product.id"
                class="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-[#9235DF]/20 transition-all duration-300 relative group"
              >
                <!-- Title & Category Badge -->
                <div class="flex justify-between items-start gap-4">
                  <div>
                    <h4 class="text-sm font-black text-slate-900 leading-snug">{{ product.name }}</h4>
                    <span class="text-[8px] text-slate-400 font-bold uppercase block mt-1">Proveedor: {{ product.provider }}</span>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-650 border border-slate-200">
                    {{ product.category }}
                  </span>
                </div>

                <!-- Stock Levels Meter -->
                <div class="space-y-2">
                  <div class="flex justify-between items-end text-xs font-bold text-slate-500">
                    <span>Existencia Actual</span>
                    <span :class="getStockColorClass(product)">
                      {{ product.stock }} / {{ product.minStock }} {{ product.unit }}
                    </span>
                  </div>
                  
                  <!-- Dynamic progress bar -->
                  <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      :class="['h-full rounded-full transition-all duration-500', getStockBarClass(product)]"
                      :style="{ width: `${Math.min(100, (product.stock / Math.max(1, product.minStock * 2)) * 100)}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Cost Details & Actions -->
                <div class="border-t border-slate-50 pt-3 flex items-center justify-between gap-4">
                  <div>
                    <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Costo / U</span>
                    <span class="text-xs font-black text-[#9235DF]">{{ product.cost.toFixed(2) }} €</span>
                  </div>
                  
                  <div class="flex items-center gap-1.5">
                    <button 
                      @click="openAdjustmentModal(product)"
                      class="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 text-slate-500 text-[10px] font-bold rounded-lg cursor-pointer border border-slate-100 transition-colors"
                    >
                      Ajustar
                    </button>
                    <button 
                      @click="openRestockModal(product)"
                      class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg cursor-pointer border border-indigo-100 transition-colors"
                    >
                      Entrada
                    </button>
                  </div>
                </div>

                <!-- Corner status colored dot -->
                <span :class="['absolute top-3.5 right-3.5 w-2 h-2 rounded-full', getStockDotClass(product)]"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: MOVIMIENTOS -->
        <div v-if="activeTab === 'movimientos'" class="h-full bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm overflow-hidden">
          <div class="flex justify-between items-center shrink-0 border-b border-slate-50 pb-4">
            <div>
              <h3 class="text-sm font-black text-[#08071A] uppercase tracking-wider">Historial de Almacén</h3>
              <p class="text-xs text-slate-450 mt-0.5">Auditoría detallada de entradas, salidas manuales y mermas registradas.</p>
            </div>
            
            <button
              @click="clearMovementHistory"
              class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
            >
              Borrar Historial
            </button>
          </div>

          <!-- Movement history timeline list -->
          <div class="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
            <div v-if="inventarioStore.movements.length === 0" class="text-center py-20 text-slate-350 text-xs">
              No hay movimientos de inventario en el historial.
            </div>

            <div v-else class="relative pl-6 border-l border-slate-100 space-y-4">
              <div 
                v-for="move in inventarioStore.movements" 
                :key="move.id"
                class="relative text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50"
              >
                <!-- Node indicator -->
                <span :class="['absolute -left-[30.5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border-2',
                  move.type === 'entrada' ? 'border-emerald-500' : move.type === 'salida' ? 'border-rose-500' : 'border-amber-500']"
                ></span>

                <div class="space-y-0.5">
                  <div class="flex items-center gap-2">
                    <span class="font-black text-slate-900 text-xs">{{ move.productName }}</span>
                    <span :class="['px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider', getMovementBadgeClass(move.type)]">
                      {{ move.type }}
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-400 font-semibold">{{ move.reason }} • Resp: {{ move.user }}</p>
                </div>

                <div class="flex items-center gap-3 self-start sm:self-center font-mono">
                  <span :class="['font-black text-sm', move.quantity > 0 ? 'text-emerald-600' : 'text-rose-600']">
                    {{ move.quantity > 0 ? '+' : '' }}{{ move.quantity }}
                  </span>
                  <span class="text-[10px] text-slate-400 font-bold uppercase">{{ move.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: PROVEEDORES -->
        <div v-if="activeTab === 'proveedores'" class="h-full overflow-y-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="prov in inventarioStore.providers"
              :key="prov.id"
              class="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between gap-5 shadow-sm hover:border-indigo-500/20 transition-all duration-300"
            >
              <div class="space-y-4">
                <!-- Header Card -->
                <div class="border-b border-slate-50 pb-3 flex justify-between items-start">
                  <div>
                    <h4 class="text-base font-black text-slate-900 font-outfit">{{ prov.company }}</h4>
                    <p class="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Contacto: {{ prov.contact }}</p>
                  </div>
                  <span class="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <i class="pi pi-truck text-xs"></i>
                  </span>
                </div>

                <!-- Contact Detail -->
                <div class="space-y-2 text-xs text-slate-500">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-envelope text-[10px]"></i>
                    <span class="font-semibold">{{ prov.email }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="pi pi-phone text-[10px]"></i>
                    <span class="font-semibold">{{ prov.phone }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="pi pi-map-marker text-[10px]"></i>
                    <span class="font-semibold truncate">{{ prov.address }}</span>
                  </div>
                </div>

                <!-- Supplies List -->
                <div class="space-y-1.5 pt-2 border-t border-slate-50">
                  <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Productos Suministrados</span>
                  <div class="flex flex-wrap gap-1">
                    <span 
                      v-for="prod in prov.productsSupplied" 
                      :key="prod"
                      class="px-2 py-0.5 rounded bg-slate-50 border border-slate-150 text-slate-600 text-[9px] font-bold"
                    >
                      {{ prod }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Last restock action -->
              <div class="flex items-center justify-between text-[10px] font-bold border-t border-slate-50 pt-3">
                <span class="text-slate-400">Último pedido: {{ prov.lastOrderDate }}</span>
                <button
                  @click="triggerSimulatedSupplierOrder(prov)"
                  class="px-3 py-1.5 bg-[#9235DF]/5 hover:bg-[#9235DF]/10 text-[#9235DF] border border-[#9235DF]/15 rounded-lg cursor-pointer transition-colors"
                >
                  Pedido Rápido
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 4: ALERTAS -->
        <div v-if="activeTab === 'alertas'" class="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
          <!-- Left panel: stock alerts -->
          <div class="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4 shadow-sm h-fit">
            <h3 class="text-sm font-black text-rose-700 uppercase tracking-wider flex items-center gap-2">
              <i class="pi pi-exclamation-triangle"></i>
              <span>Rotura de Stock & Mínimos</span>
            </h3>
            
            <div class="space-y-3 mt-2">
              <div 
                v-for="prod in alertProducts" 
                :key="prod.id"
                class="p-4 bg-rose-50/40 border border-rose-100 rounded-2xl flex items-center justify-between gap-4 text-xs font-bold text-rose-950"
              >
                <div>
                  <h4 class="font-black text-slate-900">{{ prod.name }}</h4>
                  <p class="text-[9px] text-slate-400 uppercase font-bold mt-0.5">
                    Stock: {{ prod.stock }} {{ prod.unit }} • Mínimo: {{ prod.minStock }} {{ prod.unit }}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <span :class="['px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider', prod.stock === 0 ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white']">
                    {{ prod.stock === 0 ? 'Agotado' : 'Crítico' }}
                  </span>
                  <button
                    @click="openRestockModal(prod)"
                    class="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg cursor-pointer transition-colors text-[10px]"
                  >
                    Reponer
                  </button>
                </div>
              </div>

              <div v-if="alertProducts.length === 0" class="text-center py-10 text-emerald-600 text-xs font-bold">
                ✓ Almacén al 100%. No hay productos por debajo del stock mínimo.
              </div>
            </div>
          </div>

          <!-- Right panel: caducidades & mermas -->
          <div class="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4 shadow-sm h-fit">
            <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <i class="pi pi-calendar-times"></i>
              <span>Caducidades Próximas (Previsión)</span>
            </h3>

            <div class="space-y-3 mt-2">
              <div 
                v-for="cad in mockExpiryAlerts" 
                :key="cad.name"
                class="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between gap-4 text-xs text-slate-500 font-bold"
              >
                <div>
                  <h4 class="font-black text-slate-900">{{ cad.name }}</h4>
                  <p class="text-[9px] text-slate-400 uppercase font-bold mt-0.5">Lote: L-{{ cad.lote }} • Caducidad: {{ cad.date }}</p>
                </div>

                <span class="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[9px] font-black uppercase tracking-wider">
                  Expira en {{ cad.days }} días
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- DIALOG MODAL: ADJUST STOCK -->
    <div
      v-if="showAdjustModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-sm w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          @click="showAdjustModal = false"
          class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <div>
          <h3 class="text-xl font-bold text-[#08071A] font-outfit">Ajustar Almacén</h3>
          <p class="text-xs text-slate-400 mt-1">Modifique de forma física el stock del producto.</p>
        </div>

        <form @submit.prevent="submitAdjustment" class="space-y-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Producto</label>
            <input :value="activeProduct?.name" disabled class="w-full bg-slate-100 border border-slate-250 rounded-xl p-3 text-slate-500 font-bold cursor-not-allowed" />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Nuevo Stock ({{ activeProduct?.unit }})</label>
            <input v-model.number="adjustForm.newStock" required type="number" step="any" min="0" class="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 font-black text-slate-900 focus:outline-none" />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Motivo del Ajuste</label>
            <input v-model="adjustForm.reason" required type="text" placeholder="Ej. Rotura, regularización mensual" class="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 font-semibold focus:outline-none" />
          </div>

          <div class="pt-4 flex gap-3">
            <button
              type="button"
              @click="showAdjustModal = false"
              class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DIALOG MODAL: SUPPLIER RECEIPT / ENTRY -->
    <div
      v-if="showRestockModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-sm w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          @click="showRestockModal = false"
          class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <div>
          <h3 class="text-xl font-bold text-[#08071A] font-outfit">Registrar Entrada</h3>
          <p class="text-xs text-slate-400 mt-1">Aumente el stock del insumo mediante albarán del proveedor.</p>
        </div>

        <form @submit.prevent="submitRestock" class="space-y-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Producto</label>
            <input :value="activeProduct?.name" disabled class="w-full bg-slate-100 border border-slate-250 rounded-xl p-3 text-slate-500 font-bold cursor-not-allowed" />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Cantidad a añadir ({{ activeProduct?.unit }})</label>
            <input v-model.number="restockForm.qty" required type="number" step="any" min="0.1" class="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 font-black text-slate-900 focus:outline-none" />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Albarán / Referencia</label>
            <input v-model="restockForm.reason" required type="text" placeholder="Ej. Albarán A-233, Compra Makro" class="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 font-semibold focus:outline-none" />
          </div>

          <div class="pt-4 flex gap-3">
            <button
              type="button"
              @click="showRestockModal = false"
              class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Añadir Stock
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInventarioStore, type InventoryProduct, type InventoryProvider } from '../stores/inventario'

const inventarioStore = useInventarioStore()

// State
const activeTab = ref<'productos' | 'movimientos' | 'proveedores' | 'alertas'>('productos')
const searchQuery = ref('')
const activeCategory = ref<'all' | 'comida' | 'bebida' | 'ingrediente'>('all')
const activeStockStatus = ref<'all' | 'low' | 'empty'>('all')
const activeSort = ref<'name' | 'stockAsc' | 'stockDesc' | 'cost'>('name')

const activeProduct = ref<InventoryProduct | null>(null)
const showAdjustModal = ref(false)
const showRestockModal = ref(false)

const adjustForm = ref({
  newStock: 0,
  reason: ''
})

const restockForm = ref({
  qty: 0,
  reason: ''
})

const tabs = [
  { id: 'productos' as const, label: 'Productos (ERP)' },
  { id: 'movimientos' as const, label: 'Movimientos' },
  { id: 'proveedores' as const, label: 'Proveedores' },
  { id: 'alertas' as const, label: 'Alertas Almacén' }
]

const categories = [
  { label: 'Todos', value: 'all' as const },
  { label: 'Comidas', value: 'comida' as const },
  { label: 'Bebidas', value: 'bebida' as const },
  { label: 'Ingredientes', value: 'ingrediente' as const }
]

const stockStatuses = [
  { label: 'Todos', value: 'all' as const },
  { label: 'Stock Bajo ⚠️', value: 'low' as const },
  { label: 'Agotados ❌', value: 'empty' as const }
]

const sortOptions = [
  { label: 'Alfabético (Nombre)', value: 'name' as const },
  { label: 'Stock: Menor a Mayor', value: 'stockAsc' as const },
  { label: 'Stock: Mayor a Menor', value: 'stockDesc' as const },
  { label: 'Coste: Mayor a Menor', value: 'cost' as const }
]

// Mock expiration alerts for demonstration purposes
const mockExpiryAlerts = [
  { name: 'Ternera Picada Dry Aged', lote: '8872', date: '2026-07-31', days: 2 },
  { name: 'Pan Brioche Artesanal', lote: '9012', date: '2026-08-01', days: 3 }
]

// Filtered list of products
const filteredProducts = computed(() => {
  return inventarioStore.products.filter(p => {
    // 1. Search Query filter
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         p.provider.toLowerCase().includes(searchQuery.value.toLowerCase())
    if (!matchesQuery) return false

    // 2. Category filter
    if (activeCategory.value !== 'all' && p.category !== activeCategory.value) return false

    // 3. Stock Status alert filter
    if (activeStockStatus.value === 'low' && p.stock >= p.minStock) return false
    if (activeStockStatus.value === 'empty' && p.stock > 0) return false

    return true
  })
})

// Sorted list of products
const sortedProducts = computed(() => {
  const prods = [...filteredProducts.value]
  if (activeSort.value === 'name') {
    return prods.sort((a, b) => a.name.localeCompare(b.name))
  }
  if (activeSort.value === 'stockAsc') {
    return prods.sort((a, b) => a.stock - b.stock)
  }
  if (activeSort.value === 'stockDesc') {
    return prods.sort((a, b) => b.stock - a.stock)
  }
  if (activeSort.value === 'cost') {
    return prods.sort((a, b) => b.cost - a.cost)
  }
  return prods
})

// Alert products list
const alertProducts = computed(() => {
  return inventarioStore.products.filter(p => p.stock < p.minStock)
})

// Styling classes mapping
const getStockColorClass = (p: InventoryProduct): string => {
  if (p.stock === 0) return 'text-rose-600'
  if (p.stock < p.minStock) return 'text-amber-500'
  return 'text-emerald-600'
}

const getStockBarClass = (p: InventoryProduct): string => {
  if (p.stock === 0) return 'bg-rose-500'
  if (p.stock < p.minStock) return 'bg-amber-400'
  return 'bg-gradient-to-r from-emerald-400 to-teal-500'
}

const getStockDotClass = (p: InventoryProduct): string => {
  if (p.stock === 0) return 'bg-rose-500 animate-pulse'
  if (p.stock < p.minStock) return 'bg-amber-400'
  return 'bg-emerald-500'
}

const getMovementBadgeClass = (type: string): string => {
  if (type === 'entrada') return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  if (type === 'salida') return 'bg-rose-50 text-rose-700 border border-rose-200'
  if (type === 'consumo') return 'bg-slate-50 text-slate-700 border border-slate-200'
  return 'bg-amber-50 text-amber-700 border border-amber-200'
}

// Modal forms submittal
const openAdjustmentModal = (p: InventoryProduct) => {
  activeProduct.value = p
  adjustForm.value = {
    newStock: p.stock,
    reason: ''
  }
  showAdjustModal.value = true
}

const submitAdjustment = () => {
  if (activeProduct.value) {
    inventarioStore.adjustStock(activeProduct.value.id, adjustForm.value.newStock, adjustForm.value.reason)
    showAdjustModal.value = false
  }
}

const openRestockModal = (p: InventoryProduct) => {
  activeProduct.value = p
  restockForm.value = {
    qty: 0,
    reason: ''
  }
  showRestockModal.value = true
}

const submitRestock = () => {
  if (activeProduct.value) {
    inventarioStore.restockProduct(activeProduct.value.id, restockForm.value.qty, restockForm.value.reason)
    showRestockModal.value = false
  }
}

const clearMovementHistory = () => {
  inventarioStore.movements = []
}

// Provider simulated order
const triggerSimulatedSupplierOrder = (prov: InventoryProvider) => {
  // Add direct entries to products supplied by this provider
  prov.productsSupplied.forEach(prodName => {
    const p = inventarioStore.products.find(item => item.name === prodName)
    if (p) {
      inventarioStore.restockProduct(p.id, 50, `Suministro de pedido automático a ${prov.company}`)
    }
  })
  
  const now = new Date()
  prov.lastOrderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
</script>
