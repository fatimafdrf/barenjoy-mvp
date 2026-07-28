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

              <!-- Ready count indicator -->
              <span
                v-if="getTableReadyCount(table) > 0"
                class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black tracking-tight flex items-center gap-0.5 border border-white whitespace-nowrap shadow-sm shadow-emerald-500/20"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>{{ getTableReadyCount(table) }} {{ getTableReadyCount(table) === 1 ? 'listo' : 'listos' }}</span>
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

            <!-- Warning Alert Block -->
            <div v-if="showReleaseWarning" class="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs space-y-2 shrink-0 relative animate-in fade-in duration-200">
              <button 
                type="button"
                @click="showReleaseWarning = false"
                class="absolute top-2 right-2 text-rose-400 hover:text-rose-700 p-1 cursor-pointer"
              >
                <i class="pi pi-times text-[10px]"></i>
              </button>
              <div class="flex gap-2">
                <i class="pi pi-exclamation-triangle text-rose-500 text-sm mt-0.5 shrink-0"></i>
                <div class="space-y-1">
                  <p class="font-bold text-rose-800">Operación Bloqueada</p>
                  <p class="text-[11px] leading-relaxed text-rose-700">{{ warningMessage }}</p>
                </div>
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
                  <div class="flex-1 min-w-0 pr-2">
                    <p class="font-bold text-app-text truncate">{{ item.name }}</p>
                    <p class="text-app-text-muted text-[10px] mt-0.5">
                      {{ item.quantity }} x {{ item.price.toFixed(2) }} €
                    </p>
                    <p v-if="item.notes" class="text-app-primary text-[10px] font-medium mt-1 italic flex items-center gap-1">
                      <i class="pi pi-info-circle text-[9px]"></i>
                      <span>Nota: {{ item.notes }}</span>
                    </p>
                  </div>

                  <div class="flex items-center gap-3 shrink-0">
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
                  @click="openCatalog"
                  class="flex-1 py-3 bg-white hover:bg-app-primary-soft border border-app-border hover:border-app-primary/20 text-app-text hover:text-app-primary font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <i class="pi pi-plus"></i>
                  <span>Añadir Comanda</span>
                </button>

                <button
                  v-if="selectedTable.orders.length > 0"
                  @click="tryCheckout"
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
            <h3 class="text-xl font-bold text-app-text">Carta de Aveniq</h3>
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

          <!-- Basket Config Section -->
          <div v-if="basket.length > 0" class="border-t border-app-border pt-3 space-y-2 shrink-0">
            <p class="text-xs font-bold text-app-text-muted uppercase tracking-wider">Productos Seleccionados</p>
            <div class="max-h-40 overflow-y-auto space-y-2 pr-1">
              <div 
                v-for="(item, index) in basket" 
                :key="item.id"
                class="p-2.5 bg-slate-50 border border-app-border rounded-xl flex flex-col gap-2 text-xs"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-app-text">{{ item.name }} ({{ item.price.toFixed(2) }} €)</span>
                  <div class="flex items-center gap-2">
                    <button 
                      type="button"
                      @click="decrementBasketItem(index)"
                      class="w-5 h-5 rounded bg-white hover:bg-slate-100 border border-app-border flex items-center justify-center font-bold text-app-text cursor-pointer"
                    >-</button>
                    <span class="font-bold w-4 text-center">{{ item.quantity }}</span>
                    <button 
                      type="button"
                      @click="incrementBasketItem(index)"
                      class="w-5 h-5 rounded bg-white hover:bg-slate-100 border border-app-border flex items-center justify-center font-bold text-app-text cursor-pointer"
                    >+</button>
                    <button 
                      type="button"
                      @click="removeFromBasket(index)"
                      class="p-1 text-rose-500 hover:text-rose-700 ml-1 cursor-pointer"
                    >
                      <i class="pi pi-trash text-xs"></i>
                    </button>
                  </div>
                </div>
                <!-- Notes Input -->
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-app-text-muted font-semibold uppercase shrink-0">Nota:</span>
                  <input
                    v-model="item.notes"
                    type="text"
                    maxlength="200"
                    placeholder="Ej. Sin cebolla, poco hecho (máx 200 car.)"
                    class="w-full bg-white border border-app-border text-app-text rounded-lg px-2.5 py-1 text-[11px] focus:outline-none focus:border-app-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Basket summary -->
          <div class="pt-4 border-t border-app-border flex justify-between items-center shrink-0">
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

      <!-- Modal Dialog: Warning - Ready Unserved items -->
      <div
        v-if="showReadyWarningModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4"
      >
        <div class="bg-white max-w-md w-full p-6 rounded-3xl border border-app-border space-y-4 shadow-2xl relative animate-in fade-in duration-200">
          <button
            @click="showReadyWarningModal = false"
            class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <i class="pi pi-times"></i>
          </button>

          <h3 class="text-xl font-bold text-app-text flex items-center gap-2 text-amber-600">
            <i class="pi pi-exclamation-triangle"></i>
            <span>Advertencia de Cobro</span>
          </h3>
          <p class="text-xs text-app-text-muted leading-relaxed">
            Hay productos listos que todavía no constan como servidos. Revisa la mesa antes de cobrar.
          </p>

          <div class="flex gap-3 pt-2">
            <button
              @click="showReadyWarningModal = false"
              class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-app-text border border-app-border font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
            >
              Revisar comanda
            </button>
            <button
              @click="proceedToCheckout"
              class="flex-1 py-2.5 bg-app-primary hover:bg-app-primary-hover text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
            >
              Continuar con el cobro
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
const showReadyWarningModal = ref(false)
const activeCategory = ref<string>('all')
const showReleaseWarning = ref(false)
const warningMessage = ref('')

// Shopping basket structure for adding menu items with optional notes support
interface BasketItem {
  id: string
  menuItemId: string
  name: string
  price: number
  category: string
  quantity: number
  notes: string
}
const basket = ref<BasketItem[]>([])

const selectTable = (table: Table) => {
  selectedTable.value = table
  basket.value = []
  showReleaseWarning.value = false
  showReadyWarningModal.value = false
}

const updateStatus = () => {
  if (selectedTable.value) {
    const tableId = selectedTable.value.id
    const newStatus = selectedTable.value.status
    
    // Retrieve previous status in case we reject the action
    const storeTable = mesasStore.tables.find(t => t.id === tableId)
    const previousStatus = storeTable ? storeTable.status : 'free'

    const accepted = mesasStore.setTableStatus(tableId, newStatus)
    if (!accepted) {
      selectedTable.value.status = previousStatus
      warningMessage.value = 'No puedes liberar esta mesa porque todavía tiene una comanda. Cobra la cuenta antes de liberarla.'
      showReleaseWarning.value = true
    } else {
      showReleaseWarning.value = false
    }
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

// Calculate ready items count for a given table
const getTableReadyCount = (table: Table): number => {
  return table.orders
    .filter(o => o.status === 'ready')
    .reduce((sum, item) => sum + item.quantity, 0)
}

// Open catalog and clean temporal notes
const openCatalog = () => {
  basket.value = []
  showCatalog.value = true
  showReleaseWarning.value = false
}

// Basket helpers
const addToBasket = (product: MenuItem) => {
  // If product exists in basket and has NO notes, increment quantity
  const existing = basket.value.find(item => item.menuItemId === product.id && item.notes === '')
  if (existing) {
    existing.quantity++
  } else {
    basket.value.push({
      id: 'b-' + Math.random().toString(36).substr(2, 9),
      menuItemId: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      quantity: 1,
      notes: ''
    })
  }
}

const incrementBasketItem = (index: number) => {
  if (basket.value[index]) {
    basket.value[index].quantity++
  }
}

const decrementBasketItem = (index: number) => {
  if (basket.value[index]) {
    if (basket.value[index].quantity > 1) {
      basket.value[index].quantity--
    } else {
      basket.value.splice(index, 1)
    }
  }
}

const removeFromBasket = (index: number) => {
  basket.value.splice(index, 1)
}

const basketTotal = computed(() => {
  return basket.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const basketCount = computed(() => {
  return basket.value.reduce((sum, item) => sum + item.quantity, 0)
})

const submitBasket = () => {
  if (selectedTable.value && basket.value.length > 0) {
    const itemsToSubmit = basket.value.map(item => ({
      id: item.menuItemId,
      name: item.name,
      price: item.price,
      category: item.category,
      quantity: item.quantity,
      notes: item.notes.trim()
    }))
    
    mesasStore.addItemsToTableOrder(selectedTable.value.id, itemsToSubmit)
    basket.value = []
    showCatalog.value = false
    showReleaseWarning.value = false
    
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

const tryCheckout = () => {
  if (!selectedTable.value) return
  
  // Prevent billing of empty tables
  if (selectedTable.value.orders.length === 0) {
    return
  }
  
  const { hasUnfinished, hasReadyUnserved } = mesasStore.canCheckoutTable(selectedTable.value.id)
  
  if (hasUnfinished) {
    warningMessage.value = 'No puedes cobrar esta mesa porque todavía hay productos pendientes o en preparación.'
    showReleaseWarning.value = true
    return
  }
  
  if (hasReadyUnserved) {
    showReadyWarningModal.value = true
    return
  }
  
  showCheckoutDialog.value = true
}

const proceedToCheckout = () => {
  showReadyWarningModal.value = false
  showCheckoutDialog.value = true
}

const handlePayment = (method: 'card' | 'cash') => {
  if (selectedTable.value) {
    const success = mesasStore.checkoutTable(selectedTable.value.id, method)
    if (success) {
      showCheckoutDialog.value = false
      selectedTable.value = null
      showReleaseWarning.value = false
    } else {
      showCheckoutDialog.value = false
      warningMessage.value = 'No puedes cobrar esta mesa porque todavía hay productos pendientes o en preparación.'
      showReleaseWarning.value = true
    }
  }
}
</script>
