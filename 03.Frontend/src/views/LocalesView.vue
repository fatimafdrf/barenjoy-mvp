<template>
  <div class="bg-[#F8F9FA] min-h-[calc(100vh-4rem)] text-[#08071A] font-inter antialiased select-none">

    <!-- MAIN POS WRAPPER -->
    <div class="w-full max-w-[1600px] mx-auto p-4 md:p-6 h-[calc(100vh-6rem)] flex flex-col gap-6">

      <!-- 1. HEADER POS -->
      <div class="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shrink-0">
        <div>
          <span class="text-[10px] font-bold text-[#9235DF] uppercase tracking-widest">Aveniq Smart POS</span>
          <h2 class="text-2xl font-black tracking-tight font-outfit text-[#08071A] mt-0.5">
            Caja Registradora
          </h2>
          <p class="text-xs text-slate-400 font-medium">Terminal de venta rústico y arqueo de tickets en mesa.</p>
        </div>

        <!-- Live Total Sales Counter -->
        <div class="flex items-center gap-4">
          <div class="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 text-center shadow-inner">
            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Ventas de Hoy</span>
            <span class="text-sm font-black text-[#9235DF] block mt-0.5">{{ totalSalesToday.toFixed(2) }} €</span>
          </div>
          <button
            @click="showPrintReceiptModal(null)"
            class="px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <i class="pi pi-print"></i>
            <span>Arqueo Diario</span>
          </button>
        </div>
      </div>

      <!-- 2. THREE COLUMN LAYOUT CONTAINER -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-10 gap-6 overflow-hidden min-h-0">

        <!-- LEFT COLUMN: SIMPLIFIED MAP (3/10 equivalent to 30%) -->
        <div class="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col gap-4 overflow-hidden shadow-sm">
          <div class="flex flex-col gap-3 shrink-0">
            <h3 class="text-sm font-black text-[#08071A] uppercase tracking-wider">Distribución de Sala</h3>
            <!-- Filter selectors -->
            <div class="flex p-0.5 bg-slate-50 border border-slate-100 rounded-xl">
              <button
                v-for="opt in tableFilterOpts"
                :key="opt.value"
                @click="activeTableFilter = opt.value"
                :class="['flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all cursor-pointer',
                  activeTableFilter === opt.value ? 'bg-white text-[#9235DF] shadow-sm border border-slate-200/20' : 'text-slate-500 hover:text-slate-800']"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Tables Grid List -->
          <div class="flex-1 overflow-y-auto pr-1 space-y-3.5">
            <div
              v-for="table in filteredTables"
              :key="table.id"
              @click="selectPosTable(table)"
              :class="[
                'p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between group shadow-sm select-none',
                selectedTable?.id === table.id
                  ? 'ring-2 ring-[#9235DF] bg-[#9235DF]/5 border-[#9235DF]'
                  : 'bg-white border-slate-100 hover:border-slate-300'
              ]"
            >
              <div class="flex items-center gap-3">
                <span :class="['w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs',
                  table.orders.length === 0 ? 'bg-slate-50 text-slate-400' : 'bg-[#9235DF]/10 text-[#9235DF]']"
                >
                  {{ table.number }}
                </span>
                <div>
                  <h4 class="text-xs font-black text-slate-800">Mesa {{ table.number }}</h4>
                  <p class="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                    {{ table.capacity }} pax • {{ table.status === 'free' ? 'Libre' : getTableElapsedTime(table) }}
                  </p>
                </div>
              </div>

              <div class="text-right space-y-0.5">
                <span class="text-xs font-black text-[#08071A] block">
                  {{ getTableTotal(table).toFixed(2) }} €
                </span>
                <!-- Color status indicators -->
                <span :class="['inline-block w-2 h-2 rounded-full',
                  table.orders.length === 0 ? 'bg-slate-350' :
                  getTableReadyCount(table) === table.orders.length ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500']"
                ></span>
              </div>
            </div>

            <div v-if="filteredTables.length === 0" class="text-center py-10 text-slate-350 text-xs">
              No hay mesas en esta categoría.
            </div>
          </div>
        </div>

        <!-- CENTER COLUMN: BILL DETAILS (4/10 equivalent to 40%) -->
        <div class="lg:col-span-4 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between overflow-hidden shadow-sm">
          <div v-if="!selectedTable" class="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div class="w-12 h-12 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <i class="pi pi-credit-card text-[#9235DF] text-lg"></i>
            </div>
            <div>
              <h4 class="text-xs font-black text-[#08071A] uppercase tracking-wider">Caja no vinculada</h4>
              <p class="text-xs text-slate-400 max-w-[200px] mx-auto mt-1.5 leading-relaxed">
                Seleccione una mesa del plano izquierdo para auditar la cuenta y realizar el cobro.
              </p>
            </div>
          </div>

          <div v-else class="flex-1 flex flex-col justify-between h-full overflow-hidden">
            <!-- Account Header -->
            <div class="border-b border-slate-50 pb-3.5 flex justify-between items-center shrink-0">
              <div>
                <h3 class="text-base font-black text-slate-900 font-outfit">Mesa {{ selectedTable.number }}</h3>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Auditoría de Pedido • {{ selectedTable.orders.length }} productos
                </p>
              </div>
              <button
                @click="resetSelectedTable"
                class="p-1 text-slate-300 hover:text-slate-500 transition-colors"
                title="Cerrar mesa seleccionada"
              >
                <i class="pi pi-times text-xs"></i>
              </button>
            </div>

            <!-- Receipt Items Area -->
            <div class="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div v-if="selectedTable.orders.length === 0" class="text-center py-10 text-slate-350 text-xs">
                Esta mesa no tiene productos cargados.
              </div>

              <!-- Group by category -->
              <div v-else class="space-y-4">
                <div
                  v-for="cat in activeAccountCategories"
                  :key="cat"
                  class="space-y-2"
                >
                  <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{{ getCategoryLabel(cat) }}</span>

                  <div class="space-y-2">
                    <div
                      v-for="item in getCategoryItems(cat)"
                      :key="item.id"
                      class="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-all text-xs"
                    >
                      <div class="flex justify-between items-start gap-4">
                        <div class="space-y-0.5 flex-1 min-w-0">
                          <p class="font-bold text-[#08071A] truncate flex items-center gap-1.5">
                            <span v-if="invitedItemIds.includes(item.id)" class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-wider border border-emerald-100 shrink-0">
                              Invitado
                            </span>
                            <span :class="invitedItemIds.includes(item.id) ? 'line-through text-slate-400' : ''">{{ item.name }}</span>
                          </p>
                          <p v-if="item.notes" class="text-slate-400 text-[9px] font-semibold italic">{{ item.notes }}</p>
                        </div>

                        <!-- Price summary -->
                        <span class="font-black text-slate-800 shrink-0">
                          {{ getItemDisplayTotal(item) }} €
                        </span>
                      </div>

                      <div class="flex items-center justify-between gap-4 pt-1 border-t border-slate-100/50">
                        <span class="text-[9px] text-slate-400 font-bold">Unidad: {{ item.price.toFixed(2) }}€</span>

                        <!-- Quantity modifiers -->
                        <div class="flex items-center gap-2">
                          <button
                            @click="toggleItemInvitation(item.id)"
                            class="px-2 py-0.5 rounded text-[8px] font-black uppercase border cursor-pointer active:scale-95 transition-all"
                            :class="invitedItemIds.includes(item.id)
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'"
                          >
                            {{ invitedItemIds.includes(item.id) ? 'Cobrar' : 'Regalar' }}
                          </button>

                          <div class="flex items-center gap-1">
                            <button
                              @click="decrementOrderItem(item.id)"
                              class="w-5 h-5 rounded bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 cursor-pointer"
                            >-</button>
                            <span class="font-bold text-xs w-4 text-center">{{ item.quantity }}</span>
                            <button
                              @click="incrementOrderItem(item.id)"
                              class="w-5 h-5 rounded bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 cursor-pointer"
                            >+</button>
                            <button
                              @click="removeOrderItem(item.id)"
                              class="p-1 text-slate-300 hover:text-rose-500 ml-1 cursor-pointer"
                            >
                              <i class="pi pi-trash text-[9px]"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ticket Footer Math Calculations -->
            <div class="border-t border-slate-150 pt-4 space-y-3 shrink-0 bg-white">
              <div class="space-y-1.5 text-xs text-slate-500">
                <div class="flex justify-between">
                  <span>Subtotal</span>
                  <span class="font-bold text-slate-700">{{ activeSubtotal.toFixed(2) }} €</span>
                </div>

                <div class="flex justify-between text-[10px] text-slate-400">
                  <span>IVA Incluido (10%)</span>
                  <span>{{ activeIVA.toFixed(2) }} €</span>
                </div>

                <div v-if="appliedDiscount > 0" class="flex justify-between text-rose-600 font-semibold bg-rose-50/50 px-2 py-0.5 rounded">
                  <span>Descuento Aplicado</span>
                  <span>- {{ appliedDiscount.toFixed(2) }} €</span>
                </div>

                <div v-if="appliedTip > 0" class="flex justify-between text-emerald-600 font-semibold bg-emerald-50/50 px-2 py-0.5 rounded">
                  <span>Propina</span>
                  <span>+ {{ appliedTip.toFixed(2) }} €</span>
                </div>
              </div>

              <!-- Main TOTAL -->
              <div class="flex justify-between items-center border-t border-slate-100 pt-3">
                <span class="font-black text-slate-800 text-sm uppercase">Total Neto</span>
                <span class="text-2xl font-black text-[#9235DF] font-outfit">{{ activeBillTotal.toFixed(2) }} €</span>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: ACTIONS PANEL (3/10 equivalent to 30%) -->
        <div class="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between overflow-y-auto shadow-sm">
          <div v-if="!selectedTable" class="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-300">
            <i class="pi pi-sliders-h text-lg"></i>
            <p class="text-xs mt-2">Acciones operativas no disponibles.</p>
          </div>

          <div v-else class="flex-1 flex flex-col justify-between h-full space-y-6">
            <div class="space-y-6">
              <h3 class="text-sm font-black text-[#08071A] uppercase tracking-wider">Acciones de Caja</h3>

              <!-- POS Main Actions List -->
              <div class="grid grid-cols-1 gap-2.5">
                <button
                  @click="openPaymentModal"
                  class="w-full py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <i class="pi pi-credit-card"></i>
                  <span>Cobrar Ticket</span>
                </button>

                <button
                  @click="openSplitModal"
                  class="w-full py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <i class="pi pi-users"></i>
                  <span>Dividir Cuenta</span>
                </button>

                <!-- Discount Trigger toggle -->
                <div class="space-y-2">
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Descuentos</span>
                  <div class="flex gap-1.5">
                    <button
                      v-for="d in discountOptions"
                      :key="d.value"
                      @click="setPercentageDiscount(d.value)"
                      :class="['flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer border',
                        discountPercentage === d.value
                          ? 'bg-[#9235DF]/10 border-[#9235DF] text-[#9235DF]'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600']"
                    >
                      {{ d.label }}
                    </button>
                  </div>
                </div>

                <!-- Tips Selector -->
                <div class="space-y-2 pt-2 border-t border-slate-50">
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Propina</span>
                  <div class="grid grid-cols-3 gap-1.5">
                    <button
                      v-for="t in tipOptions"
                      :key="t.value"
                      @click="setPercentageTip(t.value)"
                      :class="['py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer border',
                        tipPercentage === t.value
                          ? 'bg-emerald-550 border-emerald-500 text-emerald-700 bg-emerald-50'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600']"
                    >
                      {{ t.label }}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <!-- Secondary Actions -->
            <div class="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <button
                @click="showPrintReceiptModal(selectedTable)"
                class="py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 font-bold text-[10px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i class="pi pi-print text-[9px]"></i>
                <span>Ver Ticket</span>
              </button>

              <button
                @click="forceCloseTable"
                class="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-[10px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i class="pi pi-power-off text-[9px]"></i>
                <span>Cerrar Mesa</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>

    <!-- COBRAR TICKET MODAL -->
    <div
      v-if="showPaymentModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-250 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          @click="showPaymentModal = false"
          class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <div>
          <h3 class="text-xl font-bold text-[#08071A] flex items-center gap-2 font-outfit">
            <i class="pi pi-credit-card text-[#9235DF]"></i>
            <span>Método de Pago</span>
          </h3>
          <p class="text-xs text-slate-400 mt-1">Selecciona el medio de liquidación para el total de la mesa.</p>
        </div>

        <!-- Receipt summary -->
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
          <div class="flex justify-between font-black text-sm text-[#08071A]">
            <span>Importe Total</span>
            <span class="text-[#9235DF] text-base">{{ activeBillTotal.toFixed(2) }} €</span>
          </div>
          <div class="flex justify-between text-[10px] text-slate-400">
            <span>Incluyendo descuentos e impuestos de caja</span>
            <span>Total neto</span>
          </div>
        </div>

        <!-- Quick Payment Buttons Grid -->
        <div class="grid grid-cols-2 gap-4">
          <button
            @click="processPayment('card')"
            class="flex flex-col items-center gap-3 p-4 bg-slate-50 hover:bg-[#9235DF]/5 border border-slate-100 hover:border-[#9235DF]/20 rounded-2xl cursor-pointer transition-all active:scale-95 group text-center"
          >
            <div class="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
              <i class="pi pi-credit-card text-lg"></i>
            </div>
            <span class="text-xs font-bold text-slate-600 group-hover:text-[#9235DF]">Tarjeta</span>
          </button>

          <button
            @click="processPayment('cash')"
            class="flex flex-col items-center gap-3 p-4 bg-slate-50 hover:bg-[#9235DF]/5 border border-slate-100 hover:border-[#9235DF]/20 rounded-2xl cursor-pointer transition-all active:scale-95 group text-center"
          >
            <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
              <i class="pi pi-wallet text-lg"></i>
            </div>
            <span class="text-xs font-bold text-slate-600 group-hover:text-[#9235DF]">Efectivo</span>
          </button>

          <button
            @click="processPayment('bizum')"
            class="flex flex-col items-center gap-3 p-4 bg-slate-50 hover:bg-[#9235DF]/5 border border-slate-100 hover:border-[#9235DF]/20 rounded-2xl cursor-pointer transition-all active:scale-95 group text-center"
          >
            <div class="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
              <i class="pi pi-mobile text-lg"></i>
            </div>
            <span class="text-xs font-bold text-slate-600 group-hover:text-[#9235DF]">Bizum</span>
          </button>

          <button
            @click="openMixedPayment"
            class="flex flex-col items-center gap-3 p-4 bg-slate-50 hover:bg-[#9235DF]/5 border border-slate-100 hover:border-[#9235DF]/20 rounded-2xl cursor-pointer transition-all active:scale-95 group text-center"
          >
            <div class="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
              <i class="pi pi-percentage text-lg"></i>
            </div>
            <span class="text-xs font-bold text-slate-600 group-hover:text-[#9235DF]">Pago Mixto</span>
          </button>
        </div>
      </div>
    </div>

    <!-- DIVIDIR CUENTA MODAL (BILL SPLITTING) -->
    <div
      v-if="showSplitModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-xl w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <button
          @click="showSplitModal = false"
          class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <div>
          <h3 class="text-xl font-bold text-[#08071A] flex items-center gap-2 font-outfit">
            <i class="pi pi-users text-[#9235DF]"></i>
            <span>Dividir Cuenta Visual</span>
          </h3>
          <p class="text-xs text-slate-400 mt-1">Elige el tipo de división e ingresa el cobro correspondiente.</p>
        </div>

        <!-- Splitting type selectors -->
        <div class="flex p-0.5 bg-slate-50 border border-slate-100 rounded-xl shrink-0">
          <button
            @click="activeSplitType = 'persons'"
            :class="['flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer',
              activeSplitType === 'persons' ? 'bg-white text-[#9235DF] shadow-sm' : 'text-slate-500 hover:text-slate-800']"
          >
            Por Personas
          </button>
          <button
            @click="activeSplitType = 'amount'"
            :class="['flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer',
              activeSplitType === 'amount' ? 'bg-white text-[#9235DF] shadow-sm' : 'text-slate-500 hover:text-slate-800']"
          >
            Por Importe
          </button>
          <button
            @click="activeSplitType = 'items'"
            :class="['flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer',
              activeSplitType === 'items' ? 'bg-white text-[#9235DF] shadow-sm' : 'text-slate-500 hover:text-slate-800']"
          >
            Por Productos
          </button>
        </div>

        <div class="flex-1 overflow-y-auto py-2 space-y-4">
          <!-- TAB 1: BY PERSONS -->
          <div v-if="activeSplitType === 'persons'" class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Número de Comensales / Personas</label>
              <div class="flex items-center gap-4">
                <input
                  v-model.number="splitPersonsCount"
                  type="range"
                  min="2"
                  max="12"
                  class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#9235DF]"
                />
                <span class="w-12 text-center text-sm font-black text-slate-900 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50">
                  {{ splitPersonsCount }} pax
                </span>
              </div>
            </div>

            <!-- Split Preview grid -->
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div class="flex justify-between text-xs text-slate-500">
                <span>Total de la Cuenta:</span>
                <span class="font-bold text-slate-800">{{ activeBillTotal.toFixed(2) }} €</span>
              </div>
              <div class="flex justify-between font-black text-sm text-[#08071A] border-t border-slate-200/60 pt-2.5">
                <span>Por Persona ({{ splitPersonsCount }} partes):</span>
                <span class="text-[#9235DF]">{{ (activeBillTotal / splitPersonsCount).toFixed(2) }} €</span>
              </div>
            </div>
          </div>

          <!-- TAB 2: BY AMOUNT -->
          <div v-else-if="activeSplitType === 'amount'" class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Importe a Cobrar Parcial</label>
              <div class="relative w-full">
                <input
                  v-model.number="splitCustomAmount"
                  type="number"
                  step="0.01"
                  max="activeBillTotal"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-8 text-xs font-semibold focus:outline-none focus:border-[#9235DF]"
                />
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">€</span>
              </div>
            </div>

            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div class="flex justify-between text-slate-500">
                <span>Importe Pendiente:</span>
                <span class="font-bold text-slate-800">{{ (activeBillTotal - splitCustomAmount).toFixed(2) }} €</span>
              </div>
            </div>
          </div>

          <!-- TAB 3: BY ITEMS -->
          <div v-else-if="activeSplitType === 'items'" class="space-y-4">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Seleccione los productos para este sub-ticket</span>
            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              <div
                v-for="item in selectedTable?.orders || []"
                :key="item.id"
                @click="toggleSplitProduct(item.id)"
                :class="['p-3 rounded-xl border text-xs cursor-pointer flex justify-between items-center transition-all',
                  splitSelectedProductIds.includes(item.id)
                    ? 'border-[#9235DF] bg-[#9235DF]/5 font-bold text-[#9235DF]'
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50 text-slate-600']"
              >
                <span>{{ item.quantity }}x {{ item.name }}</span>
                <span>{{ (item.price * item.quantity).toFixed(2) }} €</span>
              </div>
            </div>

            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs text-slate-500">
              <div class="flex justify-between">
                <span>Sub-total Productos Seleccionados:</span>
                <span class="font-bold text-slate-800">{{ splitItemsTotal.toFixed(2) }} €</span>
              </div>
              <div class="flex justify-between border-t border-slate-200 pt-2 font-black text-sm text-[#08071A]">
                <span>Total Sub-ticket:</span>
                <span class="text-[#9235DF]">{{ splitItemsTotal.toFixed(2) }} €</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Split Payment Action Button -->
        <div class="pt-4 border-t border-slate-150 flex gap-3 shrink-0 bg-white">
          <button
            @click="showSplitModal = false"
            class="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
          >
            Cancelar
          </button>
          <button
            @click="processSplitPayment"
            class="flex-1 py-2.5 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
          >
            Cobrar Parte
          </button>
        </div>
      </div>
    </div>

    <!-- PRINT RECEIPT PREVIEW MODAL -->
    <div
      v-if="showReceiptPreview"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-sm w-full p-6 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <button
          @click="showReceiptPreview = false"
          class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <!-- Simulated Print Invoice -->
        <div class="flex-1 overflow-y-auto p-4 bg-slate-50/50 rounded-2xl border border-slate-100 font-mono text-[10px] text-slate-800 space-y-4">
          <div class="text-center space-y-1">
            <h4 class="font-black text-sm tracking-tight text-[#08071A]">AVENIQ SYSTEM</h4>
            <p>AVENIQ RESTAURANTES S.L.</p>
            <p>C.I.F. B-884728192</p>
            <p>Calle Alcalá 44, Madrid</p>
            <p>Tlf: +34 912 345 678</p>
          </div>

          <div class="border-t border-dashed border-slate-300 pt-3 space-y-1">
            <p>TICKET: #{{ Math.floor(Math.random() * 89999) + 10000 }}</p>
            <p>FECHA: 29/07/2026  HORA: 08:55</p>
            <p>MESA: M-{{ receiptPreviewTable?.number || 'Gral' }}</p>
            <p>CAMARERO: Sofía</p>
          </div>

          <div class="border-t border-dashed border-slate-300 pt-3 space-y-2">
            <div class="flex justify-between font-bold">
              <span>DESCRIPCION</span>
              <span>TOTAL</span>
            </div>

            <div
              v-for="item in receiptPreviewTable?.orders"
              :key="item.id"
              class="flex justify-between"
            >
              <span>{{ item.quantity }}x {{ item.name.substring(0, 18) }}</span>
              <span>{{ (item.price * item.quantity).toFixed(2) }}€</span>
            </div>
          </div>

          <div class="border-t border-dashed border-slate-300 pt-3 space-y-1.5 text-right font-black">
            <div class="flex justify-between">
              <span>SUBTOTAL (IVA INC):</span>
              <span>{{ getTableTotal(receiptPreviewTable || {} as Table).toFixed(2) }}€</span>
            </div>
            <div class="flex justify-between text-[9px] font-normal text-slate-500">
              <span>BASE IMPONIBLE (10%):</span>
              <span>{{ (getTableTotal(receiptPreviewTable || {} as Table) / 1.10).toFixed(2) }}€</span>
            </div>
            <div class="flex justify-between text-[9px] font-normal text-slate-500">
              <span>CUOTA IVA (10%):</span>
              <span>{{ (getTableTotal(receiptPreviewTable || {} as Table) - (getTableTotal(receiptPreviewTable || {} as Table) / 1.10)).toFixed(2) }}€</span>
            </div>
            <div class="flex justify-between text-[#9235DF] text-xs pt-1 border-t border-slate-200">
              <span>TOTAL FACTURADO:</span>
              <span>{{ getTableTotal(receiptPreviewTable || {} as Table).toFixed(2) }}€</span>
            </div>
          </div>

          <div class="text-center pt-4 border-t border-dashed border-slate-300 text-slate-400 space-y-1">
            <p>*** GRACIAS POR SU VISITA ***</p>
            <p>Software homologado Aveniq POS</p>
          </div>
        </div>

        <button
          @click="showReceiptPreview = false"
          class="w-full py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center font-inter"
        >
          Cerrar Vista de Impresión
        </button>
      </div>
    </div>

    <!-- PAGO MIXTO MODAL -->
    <div
      v-if="showMixedPaymentModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          @click="showMixedPaymentModal = false"
          class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <div>
          <h3 class="text-xl font-bold text-[#08071A] flex items-center gap-2 font-outfit">
            <i class="pi pi-percentage text-amber-600"></i>
            <span>Pago Mixto Registrado</span>
          </h3>
          <p class="text-xs text-slate-400 mt-1">Configure los importes recibidos en efectivo y tarjeta.</p>
        </div>

        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recibido en Efectivo</label>
            <input
              v-model.number="mixedCashAmount"
              type="number"
              step="0.01"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recibido en Tarjeta / Bizum</label>
            <input
              v-model.number="mixedCardAmount"
              type="number"
              step="0.01"
              class="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs font-semibold cursor-not-allowed"
              disabled
            />
          </div>
        </div>

        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 space-y-2">
          <div class="flex justify-between font-black text-sm text-[#08071A]">
            <span>Total Factura</span>
            <span class="text-[#9235DF]">{{ activeBillTotal.toFixed(2) }} €</span>
          </div>
        </div>

        <button
          @click="processPayment('mixed')"
          class="w-full py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer text-center"
        >
          Procesar Transacción Mixta
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMesasStore, type Table } from '../stores/mesas'

const mesasStore = useMesasStore()

// State management
const selectedTable = ref<Table | null>(null)
const activeTableFilter = ref<'all' | 'free' | 'occupied' | 'ready'>('all')

const tableFilterOpts = [
  { label: 'Todas', value: 'all' as const },
  { label: 'Libres', value: 'free' as const },
  { label: 'Ocupadas', value: 'occupied' as const },
  { label: 'Listas', value: 'ready' as const }
]

// Calculation Options
const discountOptions = [
  { label: '0%', value: 0 },
  { label: '5%', value: 5 },
  { label: '10%', value: 10 },
  { label: '15%', value: 15 },
  { label: '20%', value: 20 }
]

const tipOptions = [
  { label: 'Sin propina', value: 0 },
  { label: '5%', value: 5 },
  { label: '10%', value: 10 },
  { label: '15%', value: 15 }
]

// Local calculation state
const discountPercentage = ref(0)
const tipPercentage = ref(0)
const invitedItemIds = ref<string[]>([])

// Modal States
const showPaymentModal = ref(false)
const showSplitModal = ref(false)
const showReceiptPreview = ref(false)
const showMixedPaymentModal = ref(false)

// Bill Splitting states
const activeSplitType = ref<'persons' | 'amount' | 'items'>('persons')
const splitPersonsCount = ref(2)
const splitCustomAmount = ref(0)
const splitSelectedProductIds = ref<string[]>([])
const receiptPreviewTable = ref<Table | null>(null)

// Mixed payment amounts
const mixedCashAmount = ref(0)
const mixedCardAmount = computed(() => {
  return Math.max(0, activeBillTotal.value - mixedCashAmount.value)
})

// Filtered tables selector list
const filteredTables = computed(() => {
  return mesasStore.tables.filter(table => {
    if (activeTableFilter.value === 'all') return true
    if (activeTableFilter.value === 'free') return table.orders.length === 0
    if (activeTableFilter.value === 'occupied') return table.orders.length > 0
    if (activeTableFilter.value === 'ready') return getTableReadyCount(table) === table.orders.length && table.orders.length > 0
  })
})

const selectPosTable = (table: Table) => {
  selectedTable.value = table
  // Reset billing inputs when selecting new table
  discountPercentage.value = 0
  tipPercentage.value = 0
  invitedItemIds.value = []
  splitCustomAmount.value = 0
  splitSelectedProductIds.value = []
}

const resetSelectedTable = () => {
  selectedTable.value = null
}

// Helpers
const getTableTotal = (table: Table): number => {
  if (!table || !table.orders) return 0
  return table.orders.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

const getTableReadyCount = (table: Table): number => {
  if (!table || !table.orders) return 0
  return table.orders.filter(o => o.status === 'ready').length
}

const getTableElapsedTime = (table: Table): string => {
  return `${(table.number * 8) + 12} min`
}

// Categories helper
const activeAccountCategories = computed(() => {
  if (!selectedTable.value) return []
  const cats = selectedTable.value.orders.map(o => o.category)
  return [...new Set(cats)]
})

const getCategoryItems = (cat: string) => {
  if (!selectedTable.value) return []
  return selectedTable.value.orders.filter(o => o.category === cat)
}

const getCategoryLabel = (cat: string): string => {
  if (cat === 'tapas') return 'Entrantes & Tapas'
  if (cat === 'platos') return 'Platos Principales'
  if (cat === 'postres') return 'Postres'
  return 'Bebidas & Cafés'
}

// Modify active order details locally
const incrementOrderItem = (itemId: string) => {
  if (selectedTable.value) {
    const item = selectedTable.value.orders.find(o => o.id === itemId)
    if (item) item.quantity++
  }
}

const decrementOrderItem = (itemId: string) => {
  if (selectedTable.value) {
    const item = selectedTable.value.orders.find(o => o.id === itemId)
    if (item) {
      if (item.quantity > 1) item.quantity--
      else removeOrderItem(itemId)
    }
  }
}

const removeOrderItem = (itemId: string) => {
  if (selectedTable.value) {
    selectedTable.value.orders = selectedTable.value.orders.filter(o => o.id !== itemId)
  }
}

// Invited items toggles
const toggleItemInvitation = (itemId: string) => {
  const index = invitedItemIds.value.indexOf(itemId)
  if (index > -1) {
    invitedItemIds.value.splice(index, 1)
  } else {
    invitedItemIds.value.push(itemId)
  }
}

const getItemDisplayTotal = (item: any): string => {
  if (invitedItemIds.value.includes(item.id)) return '0.00'
  return (item.price * item.quantity).toFixed(2)
}

// Financial Math properties
const activeSubtotal = computed(() => {
  if (!selectedTable.value) return 0
  return selectedTable.value.orders.reduce((sum, item) => {
    if (invitedItemIds.value.includes(item.id)) return sum
    return sum + (item.price * item.quantity)
  }, 0)
})

const activeIVA = computed(() => {
  // 10% included in subtotal
  return activeSubtotal.value - (activeSubtotal.value / 1.10)
})

const appliedDiscount = computed(() => {
  return activeSubtotal.value * (discountPercentage.value / 100)
})

const appliedTip = computed(() => {
  return activeSubtotal.value * (tipPercentage.value / 100)
})

const activeBillTotal = computed(() => {
  return Math.max(0, activeSubtotal.value - appliedDiscount.value + appliedTip.value)
})

// Set discounts and tips percentage
const setPercentageDiscount = (val: number) => {
  discountPercentage.value = val
}

const setPercentageTip = (val: number) => {
  tipPercentage.value = val
}

// Payment flows trigger
const openPaymentModal = () => {
  if (selectedTable.value && selectedTable.value.orders.length > 0) {
    mixedCashAmount.value = Math.floor(activeBillTotal.value / 2)
    showPaymentModal.value = true
  }
}

const openSplitModal = () => {
  if (selectedTable.value && selectedTable.value.orders.length > 0) {
    splitCustomAmount.value = Math.floor(activeBillTotal.value / 2)
    splitSelectedProductIds.value = []
    showSplitModal.value = true
  }
}

const openMixedPayment = () => {
  showPaymentModal.value = false
  showMixedPaymentModal.value = true
}

const processPayment = (method: 'card' | 'cash' | 'bizum' | 'mixed') => {
  if (selectedTable.value) {
    // Record payment details inside store history completedOrders
    const finalMethod = method === 'card' ? 'card' : method === 'bizum' ? 'bizum' : 'cash'
    mesasStore.checkoutTable(selectedTable.value.id, finalMethod)

    // Close payment modalls and clean active selections
    showPaymentModal.value = false
    showMixedPaymentModal.value = false
    selectedTable.value = null
  }
}

// Bill Split visual actions
const toggleSplitProduct = (id: string) => {
  const index = splitSelectedProductIds.value.indexOf(id)
  if (index > -1) {
    splitSelectedProductIds.value.splice(index, 1)
  } else {
    splitSelectedProductIds.value.push(id)
  }
}

const splitItemsTotal = computed(() => {
  if (!selectedTable.value) return 0
  return selectedTable.value.orders.reduce((sum, item) => {
    if (splitSelectedProductIds.value.includes(item.id)) {
      return sum + (item.price * item.quantity)
    }
    return sum
  }, 0)
})

const processSplitPayment = () => {
  if (selectedTable.value) {
    let paidAmount = 0
    if (activeSplitType.value === 'persons') {
      paidAmount = activeBillTotal.value / splitPersonsCount.value
    } else if (activeSplitType.value === 'amount') {
      paidAmount = splitCustomAmount.value
    } else {
      paidAmount = splitItemsTotal.value
    }

    // Register a completed sale log entry in store completedOrders
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    mesasStore.completedOrders.push({
      id: 'split-' + Math.random().toString(36).substr(2, 9),
      tableNumber: selectedTable.value.number,
      itemsCount: 1,
      total: paidAmount,
      paymentMethod: 'card',
      timestamp
    })

    // Subtract paid items or amounts from the active order
    if (activeSplitType.value === 'items') {
      selectedTable.value.orders = selectedTable.value.orders.filter(item =>
        !splitSelectedProductIds.value.includes(item.id)
      )
    } else {
      // General discount subtraction trick to reduce remaining balance on the same active table
      const remainingRatio = Math.max(0, activeBillTotal.value - paidAmount) / activeBillTotal.value
      selectedTable.value.orders.forEach(item => {
        item.price = item.price * remainingRatio
      })
    }

    // If order gets empty, close the table
    if (selectedTable.value.orders.length === 0) {
      mesasStore.setTableStatus(selectedTable.value.id, 'free')
      selectedTable.value = null
    }

    showSplitModal.value = false
  }
}

// Receipt Printer Modal
const showPrintReceiptModal = (table: Table | null) => {
  receiptPreviewTable.value = table || selectedTable.value
  showReceiptPreview.value = true
}

// Manual force close table
const forceCloseTable = () => {
  if (selectedTable.value) {
    mesasStore.checkoutTable(selectedTable.value.id, 'cash')
    selectedTable.value = null
  }
}

// Group Sales Statistics computation
const totalSalesToday = computed(() => {
  return mesasStore.completedOrders.reduce((sum, item) => sum + item.total, 0)
})
</script>
