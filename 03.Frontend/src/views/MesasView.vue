<template>
  <div class="bg-app-background min-h-[calc(100vh-4rem)]">
    <div class="max-w-7xl w-full mx-auto p-6 text-app-text space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-extrabold tracking-tight text-app-text">Mapa de Mesas</h2>
          <p class="text-sm text-app-text-muted mt-1">Gestione las comandas y ocupación en tiempo real</p>
        </div>

        <!-- Color Legend -->
        <div class="flex flex-wrap gap-3 p-2 bg-white rounded-2xl border border-app-border text-xs text-app-text-muted shadow-sm">
          <div class="flex items-center gap-1.5 px-2 py-1">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300"></span>
            <span>Libre</span>
          </div>
          <div class="flex items-center gap-1.5 px-2 py-1">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-md shadow-teal-500/20"></span>
            <span>Ocupada</span>
          </div>
          <div class="flex items-center gap-1.5 px-2 py-1">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-md shadow-amber-500/20"></span>
            <span>Reservada</span>
          </div>
          <div class="flex items-center gap-1.5 px-2 py-1">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/20"></span>
            <span>Pide Cuenta</span>
          </div>
        </div>
      </div>

      <!-- Main Section: Split Layout -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Left side: Visual Floor Map -->
        <div class="bg-white p-6 rounded-3xl border border-app-border xl:col-span-2 min-h-[550px] relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-app-text">Sala Principal & Barra</h3>
            <span class="text-[11px] text-app-text-muted font-semibold uppercase tracking-wider">Haga clic en una mesa para gestionarla</span>
          </div>

          <!-- The Floor Grid Map -->
          <div class="flex-1 w-full bg-slate-50 border border-app-border rounded-2xl relative p-6">
            <!-- Room Zones outlines -->
            <div class="absolute inset-y-0 right-1/4 w-[1px] border-r border-dashed border-slate-200"></div>
            <div class="absolute top-1/2 left-0 right-1/4 h-[1px] border-b border-dashed border-slate-200"></div>

            <div class="absolute top-2 left-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">Zona A (Ventana)</div>
            <div class="absolute bottom-2 left-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">Zona B (Interior)</div>
            <div class="absolute top-2 right-1/4 mr-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider text-right">Barra</div>
            <div class="absolute top-2 right-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider text-right">Terraza</div>

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
                'absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 font-bold border cursor-pointer active:scale-95 shadow-sm',
                selectedTable?.id === table.id ? 'ring-2 ring-app-primary scale-110 z-20 shadow-md' : '',
                table.status === 'free' ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50' : '',
                table.status === 'occupied' ? 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100/85 hover:border-teal-300 shadow-sm shadow-teal-500/5' : '',
                table.status === 'reserved' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/85 hover:border-amber-300 shadow-sm shadow-amber-500/5' : '',
                table.status === 'bill' ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/85 hover:border-rose-300 shadow-sm shadow-rose-500/5 animate-pulse' : ''
              ]"
            >
              <span class="text-xs uppercase text-slate-500 font-semibold mb-0.5">Mesa</span>
              <span class="text-base font-black leading-none text-slate-900">{{ table.number }}</span>
              <span class="text-[9px] text-slate-500 mt-1 font-mono">Pax {{ table.capacity }}</span>

              <!-- Quick order count indicator -->
              <span
                v-if="table.orders.length > 0"
                class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-app-primary text-white text-[10px] font-black flex items-center justify-center border border-white"
              >
                {{ table.orders.reduce((sum, item) => sum + item.quantity, 0) }}
              </span>
            </button>
          </div>
        </div>

        <!-- Right side: Table Operations details -->
        <div class="bg-white p-6 rounded-3xl border border-app-border flex flex-col h-full min-h-[550px] justify-between shadow-sm">
          <!-- If no table selected -->
          <div v-if="!selectedTable" class="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-app-border">
              <i class="pi pi-grid text-app-primary/60 text-2xl"></i>
            </div>
            <div>
              <h4 class="font-bold text-app-text">Ninguna Mesa Seleccionada</h4>
              <p class="text-xs text-app-text-muted max-w-[220px] mx-auto mt-1">Seleccione una mesa del mapa para ver sus detalles, añadir comandas y cobrar.</p>
            </div>
          </div>

          <!-- Table detailing operations -->
          <div v-else class="flex-1 flex flex-col justify-between space-y-6">
            <!-- Active Table Header -->
            <div class="flex justify-between items-start pb-4 border-b border-app-border">
              <div>
                <h3 class="font-black text-xl text-app-text">Mesa {{ selectedTable.number }}</h3>
                <p class="text-xs text-app-text-muted mt-0.5">Capacidad: {{ selectedTable.capacity }} comensales</p>
              </div>

              <!-- Status Dropdown/Selector -->
              <div class="flex flex-col gap-1 items-end">
                <span class="text-[10px] text-app-text-muted font-bold uppercase tracking-wider">Estado:</span>
                <select
                  v-model="selectedTable.status"
                  @change="updateStatus"
                  class="bg-slate-50 border border-app-border text-xs rounded-lg p-1.5 pr-6 cursor-pointer text-app-text focus:outline-none focus:border-app-primary"
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
                <span class="text-xs font-bold text-app-text-muted uppercase tracking-widest">Comanda Actual</span>
                <span class="text-xs font-semibold text-app-primary">
                  {{ selectedTable.orders.length }} productos
                </span>
              </div>

              <!-- Items Loop -->
              <div v-if="selectedTable.orders.length > 0" class="space-y-2">
                <div
                  v-for="item in selectedTable.orders"
                  :key="item.id"
                  class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-app-border text-xs"
                >
                  <div>
                    <p class="font-bold text-app-text">{{ item.name }}</p>
                    <p class="text-app-text-muted text-[10px] mt-0.5">
                      {{ item.quantity }} x {{ item.price.toFixed(2) }} €
                    </p>
                  </div>

                  <div class="flex items-center gap-3">
                    <!-- Prep Badge -->
                    <span :class="[
                      'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider',
                      item.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : '',
                      item.status === 'preparing' ? 'bg-blue-50 text-blue-700 border border-blue-200' : '',
                      item.status === 'ready' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse' : '',
                      item.status === 'served' ? 'bg-slate-100 text-slate-500 border border-slate-200' : ''
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
                      class="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg hover:scale-105 transition-all cursor-pointer font-bold"
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
            <div class="space-y-4 pt-4 border-t border-app-border">
              <!-- Order pricing footer -->
              <div class="flex justify-between items-center text-sm">
                <span class="font-bold text-app-text-muted">Total Comanda:</span>
                <span class="font-black text-xl text-app-text">{{ orderTotal.toFixed(2) }} €</span>
              </div>

              <!-- Operations buttons -->
              <div class="flex gap-3">
                <button
                  @click="showCatalog = true"
                  class="flex-1 py-3 bg-white hover:bg-app-primary-soft border border-app-border hover:border-app-primary/20 text-app-text hover:text-app-primary font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <i class="pi pi-plus"></i>
                  <span>Añadir Comanda</span>
                </button>

                <button
                  v-if="selectedTable.orders.length > 0"
                  @click="showCheckoutDialog = true"
                  class="flex-1 py-3 bg-app-primary hover:bg-app-primary-hover text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
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
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4"
      >
        <div class="bg-white max-w-lg w-full p-6 rounded-3xl border border-app-border space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
          <button
            @click="showCatalog = false"
            class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <i class="pi pi-times"></i>
          </button>

          <div>
            <h3 class="text-xl font-bold text-app-text">Carta de Barenjoy</h3>
            <p class="text-xs text-app-text-muted">Añada productos a la Mesa {{ selectedTable?.number }}</p>
          </div>

          <!-- Catalog Category tabs -->
          <div class="flex gap-2 overflow-x-auto pb-2 border-b border-app-border">
            <button
              @click="activeCategory = 'all'"
              :class="['px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap',
                activeCategory === 'all' ? 'bg-app-primary text-white' : 'bg-slate-50 text-app-text-muted hover:bg-slate-100']"
            >
              Todos
            </button>
            <button
              v-for="cat in cartaStore.categories"
              :key="cat.id"
              @click="activeCategory = cat.id"
              :class="['px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap',
                activeCategory === cat.id ? 'bg-app-primary text-white' : 'bg-slate-50 text-app-text-muted hover:bg-slate-100']"
            >
              {{ cat.name }}
            </button>
          </div>

          <!-- Products List -->
          <div class="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-app-border hover:border-slate-200 transition-colors"
            >
              <div>
                <p class="font-bold text-sm text-app-text">{{ product.name }}</p>
                <p class="text-app-text-muted text-xs mt-0.5">{{ product.description }}</p>
                <p class="text-app-primary font-bold text-sm mt-1">{{ product.price.toFixed(2) }} €</p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  @click="addToBasket(product)"
                  class="px-3 py-1.5 bg-white hover:bg-app-primary-soft text-app-text hover:text-app-primary border border-app-border hover:border-app-primary/20 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>

          <!-- Footer Basket summary -->
          <div class="pt-4 border-t border-app-border flex justify-between items-center">
            <div>
              <p class="text-xs text-app-text-muted">Total a añadir:</p>
              <p class="text-base font-bold text-app-text">{{ basketTotal.toFixed(2) }} € ({{ basketCount }} items)</p>
            </div>
            <button
              @click="submitBasket"
              :disabled="basket.length === 0"
              class="px-5 py-2.5 bg-app-primary hover:bg-app-primary-hover text-white font-bold text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Comanda
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Dialog: Checkout / Payment Selection -->
      <div
        v-if="showCheckoutDialog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4"
      >
        <div class="bg-white max-w-md w-full p-6 rounded-3xl border border-app-border space-y-4 shadow-2xl relative animate-in fade-in duration-200">
          <button
            @click="showCheckoutDialog = false"
            class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <i class="pi pi-times"></i>
          </button>

          <h3 class="text-xl font-bold text-app-text flex items-center gap-2">
            <i class="pi pi-credit-card text-app-primary"></i>
            <span>Cobro de Cuenta</span>
          </h3>
          <p class="text-xs text-app-text-muted">Seleccione el método de pago para finalizar el servicio de la Mesa {{ selectedTable?.number }}.</p>

          <!-- Ticket Summary -->
          <div class="p-4 bg-slate-50 rounded-2xl border border-app-border text-xs space-y-2">
            <div class="flex justify-between font-bold border-b border-slate-200 pb-2 text-app-text">
              <span>Descripción</span>
              <span>Total</span>
            </div>
            <div v-for="item in selectedTable?.orders" :key="item.id" class="flex justify-between text-app-text-muted">
              <span>{{ item.name }} x{{ item.quantity }}</span>
              <span>{{ (item.price * item.quantity).toFixed(2) }} €</span>
            </div>
            <div class="flex justify-between font-black text-sm text-app-text pt-2 border-t border-slate-200">
              <span>Total Facturado</span>
              <span class="text-app-primary">{{ orderTotal.toFixed(2) }} €</span>
            </div>
          </div>

          <!-- Payment options buttons -->
          <div class="grid grid-cols-2 gap-4 pt-2">
            <button
              @click="handlePayment('card')"
              class="flex flex-col items-center gap-3 p-4 bg-slate-50 hover:bg-app-primary-soft/50 border border-app-border hover:border-app-primary/20 rounded-2xl cursor-pointer transition-all active:scale-95 group"
            >
              <div class="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                <i class="pi pi-credit-card text-lg"></i>
              </div>
              <span class="text-xs font-bold text-app-text group-hover:text-app-primary">Tarjeta de Crédito</span>
            </button>

            <button
              @click="handlePayment('cash')"
              class="flex flex-col items-center gap-3 p-4 bg-slate-50 hover:bg-app-primary-soft/50 border border-app-border hover:border-app-primary/20 rounded-2xl cursor-pointer transition-all active:scale-95 group"
            >
              <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <i class="pi pi-wallet text-lg"></i>
              </div>
              <span class="text-xs font-bold text-app-text group-hover:text-app-primary">Efectivo</span>
            </button>
          </div>
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
