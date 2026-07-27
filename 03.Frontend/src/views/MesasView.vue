<template>
  <div class="bg-slate-950 min-h-[calc(100vh-4rem)] p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-extrabold tracking-tight">Mapa de Mesas</h2>
        <p class="text-sm text-slate-400 mt-1">Gestione las comandas y ocupación en tiempo real</p>
      </div>

      <!-- Color Legend -->
      <div class="flex flex-wrap gap-3 p-2 bg-slate-900/60 rounded-2xl border border-white/5 text-xs">
        <div class="flex items-center gap-1.5 px-2 py-1">
          <span class="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></span>
          <span class="text-slate-400">Libre</span>
        </div>
        <div class="flex items-center gap-1.5 px-2 py-1">
          <span class="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-lg shadow-teal-500/20"></span>
          <span class="text-slate-400">Ocupada</span>
        </div>
        <div class="flex items-center gap-1.5 px-2 py-1">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/20"></span>
          <span class="text-slate-400">Reservada</span>
        </div>
        <div class="flex items-center gap-1.5 px-2 py-1">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/20"></span>
          <span class="text-slate-400">Pide Cuenta</span>
        </div>
      </div>
    </div>

    <!-- Main Section: Split Layout -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Left side: Visual Floor Map -->
      <div class="glass p-6 rounded-3xl border border-white/5 xl:col-span-2 min-h-[550px] relative overflow-hidden flex flex-col justify-between">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-slate-200">Sala Principal & Barra</h3>
          <span class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Haga clic en una mesa para gestionarla</span>
        </div>

        <!-- The Floor Grid Map -->
        <div class="flex-1 w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl relative p-6">
          <!-- Room Zones outlines -->
          <div class="absolute inset-y-0 right-1/4 w-[1px] border-r border-dashed border-slate-800/40"></div>
          <div class="absolute top-1/2 left-0 right-1/4 h-[1px] border-b border-dashed border-slate-800/40"></div>
          
          <div class="absolute top-2 left-4 text-[10px] text-slate-600 font-bold uppercase tracking-wider">Zona A (Ventana)</div>
          <div class="absolute bottom-2 left-4 text-[10px] text-slate-600 font-bold uppercase tracking-wider">Zona B (Interior)</div>
          <div class="absolute top-2 right-1/4 mr-4 text-[10px] text-slate-600 font-bold uppercase tracking-wider text-right">Barra</div>
          <div class="absolute top-2 right-4 text-[10px] text-slate-600 font-bold uppercase tracking-wider text-right">Terraza</div>

          <!-- Render tables on coordinates -->
          <button 
            v-for="table in mesasStore.tables" 
            :key="table.id"
            @click="selectTable(table)"
            :style="{ 
              left: `${table.x}%`, 
              top: `${table.y}%`
            }"
            :class="[
              'absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 font-bold border cursor-pointer active:scale-95 shadow-md',
              selectedTable?.id === table.id ? 'ring-2 ring-white scale-110 z-20' : '',
              table.status === 'free' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50' : '',
              table.status === 'occupied' ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 glow-teal hover:bg-teal-500/20' : '',
              table.status === 'reserved' ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 glow-amber hover:bg-amber-500/20' : '',
              table.status === 'bill' ? 'bg-rose-500/10 border-rose-500/40 text-rose-500 shadow-lg shadow-rose-500/10 hover:bg-rose-500/20 animate-pulse' : ''
            ]"
          >
            <span class="text-xs uppercase text-slate-500 font-semibold mb-0.5">Mesa</span>
            <span class="text-base text-slate-100 font-black leading-none">{{ table.number }}</span>
            <span class="text-[9px] text-slate-400 mt-1 font-mono">Pax {{ table.capacity }}</span>
            
            <!-- Quick order count indicator -->
            <span 
              v-if="table.orders.length > 0" 
              class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-100 text-slate-950 text-[10px] font-black flex items-center justify-center border-2 border-slate-950"
            >
              {{ table.orders.reduce((sum, item) => sum + item.quantity, 0) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Right side: Table Operations details -->
      <div class="glass p-6 rounded-3xl border border-white/5 flex flex-col h-full min-h-[550px] justify-between">
        <!-- If no table selected -->
        <div v-if="!selectedTable" class="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
          <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
            <i class="pi pi-grid text-slate-500 text-2xl"></i>
          </div>
          <div>
            <h4 class="font-bold text-slate-200">Ninguna Mesa Seleccionada</h4>
            <p class="text-xs text-slate-500 max-w-[220px] mx-auto mt-1">Seleccione una mesa del mapa para ver sus detalles, añadir comandas y cobrar.</p>
          </div>
        </div>

        <!-- Table detailing operations -->
        <div v-else class="flex-1 flex flex-col justify-between space-y-6">
          <!-- Active Table Header -->
          <div class="flex justify-between items-start pb-4 border-b border-slate-800/80">
            <div>
              <h3 class="font-black text-xl text-white">Mesa {{ selectedTable.number }}</h3>
              <p class="text-xs text-slate-400 mt-0.5">Capacidad: {{ selectedTable.capacity }} comensales</p>
            </div>
            
            <!-- Status Dropdown/Selector -->
            <div class="flex flex-col gap-1 items-end">
              <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estado:</span>
              <select 
                v-model="selectedTable.status" 
                @change="updateStatus"
                class="bg-slate-900 border border-slate-800 text-xs rounded-lg p-1.5 pr-6 cursor-pointer text-slate-200 focus:outline-none"
              >
                <option value="free">Libre</option>
                <option value="occupied">Ocupada</option>
                <option value="reserved">Reservada</option>
                <option value="bill">Pide Cuenta</option>
              </select>
            </div>
          </div>

          <!-- Order Content List -->
          <div class="flex-1 overflow-y-auto max-h-72 space-y-3 pr-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Comanda Actual</span>
              <span class="text-xs font-semibold text-amber-500">
                {{ selectedTable.orders.length }} productos
              </span>
            </div>

            <!-- Items Loop -->
            <div v-if="selectedTable.orders.length > 0" class="space-y-2">
              <div 
                v-for="item in selectedTable.orders" 
                :key="item.id"
                class="flex items-center justify-between p-2.5 rounded-xl bg-white/2 border border-white/5 text-xs"
              >
                <div>
                  <p class="font-bold text-slate-200">{{ item.name }}</p>
                  <p class="text-slate-400 text-[10px] mt-0.5">
                    {{ item.quantity }} x {{ item.price.toFixed(2) }} €
                  </p>
                </div>
                
                <div class="flex items-center gap-3">
                  <!-- Prep Badge -->
                  <span :class="[
                    'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider',
                    item.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' : '',
                    item.status === 'preparing' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/10' : '',
                    item.status === 'ready' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 animate-pulse' : '',
                    item.status === 'served' ? 'bg-slate-800 text-slate-400 border border-slate-700' : ''
                  ]">
                    {{ 
                      item.status === 'pending' ? 'Pendiente' : 
                      item.status === 'preparing' ? 'Preparando' : 
                      item.status === 'ready' ? 'Listo' : 'Servido' 
                    }}
                  </span>
                  
                  <!-- Action to mark served -->
                  <button 
                    v-if="item.status === 'ready'"
                    @click="markServed(item.id)"
                    class="p-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg hover:scale-105 transition-all cursor-pointer font-bold"
                    title="Entregar al Cliente"
                  >
                    <i class="pi pi-check text-[10px]"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty order state -->
            <div v-else class="text-center py-8 text-slate-500 text-xs">
              Mesa sin comandas activas. Haz clic en "Añadir Comanda" para agregar platos.
            </div>
          </div>

          <!-- Add order menu drawer trigger -->
          <div class="space-y-4 pt-4 border-t border-slate-800/80">
            <!-- Order pricing footer -->
            <div class="flex justify-between items-center text-sm">
              <span class="font-bold text-slate-400">Total Comanda:</span>
              <span class="font-black text-xl text-white">{{ orderTotal.toFixed(2) }} €</span>
            </div>

            <!-- Operations buttons -->
            <div class="flex gap-3">
              <button 
                @click="showCatalog = true"
                class="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <i class="pi pi-plus"></i>
                <span>Añadir Comanda</span>
              </button>
              
              <button 
                v-if="selectedTable.orders.length > 0"
                @click="showCheckoutDialog = true"
                class="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <i class="pi pi-credit-card"></i>
                <span>Cobrar Cuenta</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Dialog: Catalog to add items to order -->
    <div 
      v-if="showCatalog" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4"
    >
      <div class="glass max-w-lg w-full p-6 rounded-3xl border border-white/10 space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button 
          @click="showCatalog = false" 
          class="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
        >
          <i class="pi pi-times"></i>
        </button>

        <div>
          <h3 class="text-xl font-bold text-white">Carta de Barenjoy</h3>
          <p class="text-xs text-slate-400">Añada productos a la Mesa {{ selectedTable?.number }}</p>
        </div>

        <!-- Catalog Category tabs -->
        <div class="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          <button 
            @click="activeCategory = 'all'"
            :class="['px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap', 
              activeCategory === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:bg-slate-800']"
          >
            Todos
          </button>
          <button 
            v-for="cat in cartaStore.categories" 
            :key="cat.id"
            @click="activeCategory = cat.id"
            :class="['px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap', 
              activeCategory === cat.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:bg-slate-800']"
          >
            {{ cat.name }}
          </button>
        </div>

        <!-- Products List -->
        <div class="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="flex items-center justify-between p-3 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-colors"
          >
            <div>
              <p class="font-bold text-sm text-slate-200">{{ product.name }}</p>
              <p class="text-slate-400 text-xs mt-0.5">{{ product.description }}</p>
              <p class="text-amber-500 font-bold text-sm mt-1">{{ product.price.toFixed(2) }} €</p>
            </div>
            
            <div class="flex items-center gap-2">
              <button 
                @click="addToBasket(product)" 
                class="px-3 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Basket summary -->
        <div class="pt-4 border-t border-slate-800 flex justify-between items-center">
          <div>
            <p class="text-xs text-slate-400">Total a añadir:</p>
            <p class="text-base font-bold text-white">{{ basketTotal.toFixed(2) }} € ({{ basketCount }} items)</p>
          </div>
          <button 
            @click="submitBasket"
            :disabled="basket.length === 0"
            class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Comanda
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Dialog: Checkout / Payment Selection -->
    <div 
      v-if="showCheckoutDialog" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4"
    >
      <div class="glass max-w-md w-full p-6 rounded-3xl border border-white/10 space-y-4 shadow-2xl relative animate-in fade-in duration-200">
        <button 
          @click="showCheckoutDialog = false" 
          class="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
        >
          <i class="pi pi-times"></i>
        </button>

        <h3 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="pi pi-credit-card text-amber-500"></i>
          <span>Cobro de Cuenta</span>
        </h3>
        <p class="text-xs text-slate-400">Seleccione el método de pago para finalizar el servicio de la Mesa {{ selectedTable?.number }}.</p>

        <!-- Ticket Summary -->
        <div class="p-4 bg-slate-900 rounded-2xl border border-white/5 text-xs space-y-2">
          <div class="flex justify-between font-bold border-b border-slate-800 pb-2">
            <span>Descripción</span>
            <span>Total</span>
          </div>
          <div v-for="item in selectedTable?.orders" :key="item.id" class="flex justify-between">
            <span class="text-slate-400">{{ item.name }} x{{ item.quantity }}</span>
            <span>{{ (item.price * item.quantity).toFixed(2) }} €</span>
          </div>
          <div class="flex justify-between font-black text-sm text-white pt-2 border-t border-slate-800">
            <span>Total Facturado</span>
            <span class="text-amber-500">{{ orderTotal.toFixed(2) }} €</span>
          </div>
        </div>

        <!-- Payment options buttons -->
        <div class="grid grid-cols-2 gap-4 pt-2">
          <button 
            @click="handlePayment('card')"
            class="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer transition-all active:scale-95 group"
          >
            <div class="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <i class="pi pi-credit-card text-lg"></i>
            </div>
            <span class="text-xs font-bold text-slate-200">Tarjeta de Crédito</span>
          </button>

          <button 
            @click="handlePayment('cash')"
            class="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer transition-all active:scale-95 group"
          >
            <div class="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <i class="pi pi-wallet text-lg"></i>
            </div>
            <span class="text-xs font-bold text-slate-200">Efectivo</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMesasStore, type Table } from '../stores/mesas'
import { useCartaStore, type MenuItem } from '../stores/carta'

const mesasStore = useMesasStore()
const cartaStore = useCartaStore()

const selectedTable = ref<Table | null>(null)
const showCatalog = ref(false)
const showCheckoutDialog = ref(false)
const activeCategory = ref<string>('all')

// Shopping basket structure for adding menu items
interface BasketItem {
  id: string
  name: string
  price: number
  category: string
  quantity: number
}
const basket = ref<BasketItem[]>([])

const selectTable = (table: Table) => {
  selectedTable.value = table
  basket.value = []
}

const updateStatus = () => {
  if (selectedTable.value) {
    mesasStore.setTableStatus(selectedTable.value.id, selectedTable.value.status)
  }
}

// Calculate selected table order total
const orderTotal = computed(() => {
  if (!selectedTable.value) return 0
  return selectedTable.value.orders.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

// Filter products based on selected category tab
const filteredProducts = computed(() => {
  const items = cartaStore.menuItems.filter(item => item.available)
  if (activeCategory.value === 'all') return items
  return items.filter(item => item.category === activeCategory.value)
})

// Basket helpers
const addToBasket = (product: MenuItem) => {
  const existing = basket.value.find(item => item.id === product.id)
  if (existing) {
    existing.quantity++
  } else {
    basket.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      quantity: 1
    })
  }
}

const basketTotal = computed(() => {
  return basket.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const basketCount = computed(() => {
  return basket.value.reduce((sum, item) => sum + item.quantity, 0)
})

const submitBasket = () => {
  if (selectedTable.value && basket.value.length > 0) {
    mesasStore.addItemsToTableOrder(selectedTable.value.id, basket.value)
    basket.value = []
    showCatalog.value = false
    
    // Refresh selected table reference to force DOM updates
    const updated = mesasStore.tables.find(t => t.id === selectedTable.value?.id)
    if (updated) selectedTable.value = updated
  }
}

// Mark order item as served
const markServed = (itemId: string) => {
  if (selectedTable.value) {
    mesasStore.updateOrderItemStatus(selectedTable.value.id, itemId, 'served')
  }
}

const handlePayment = (method: 'card' | 'cash') => {
  if (selectedTable.value) {
    mesasStore.checkoutTable(selectedTable.value.id, method)
    showCheckoutDialog.value = false
    selectedTable.value = null
  }
}
</script>
