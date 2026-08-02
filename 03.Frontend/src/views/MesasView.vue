<template>
  <div class="bg-[#FCFCFC] min-h-[calc(100vh-4rem)] text-[#08071A] font-inter antialiased overflow-x-hidden">

    <!-- 1. MAPA DE SALA VIEW (WHEN NOT ACTIVE ORDERING) -->
    <div v-if="!isOrdering" class="max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
      <!-- HEADER WITH PREMIUM STATUS INDICATORS -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <span class="text-[10px] font-bold text-[#9235DF] uppercase tracking-widest">Aveniq Sala Pro</span>
          <h2 class="text-3xl font-black tracking-tight font-outfit text-[#08071A] mt-1">
            Plano de Mesas
          </h2>
          <p class="text-xs text-slate-400 font-medium">
            Gestión visual del aforo, estados operativos e importes acumulados.
          </p>
        </div>

        <!-- Leyendas / Estados Premium -->
        <div class="flex flex-wrap gap-3 p-1.5 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-inner text-[10px] font-black text-slate-400 uppercase tracking-wider">
          <div class="flex items-center gap-1.5 px-2.5 py-1">
            <span class="w-1.5 h-1.5 rounded-full bg-white border border-slate-200"></span>
            <span>Disponible</span>
          </div>
          <div class="flex items-center gap-1.5 px-2.5 py-1">
            <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
            <span>Ocupada</span>
          </div>
          <div class="flex items-center gap-1.5 px-2.5 py-1">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span>Reservada</span>
          </div>
          <div class="flex items-center gap-1.5 px-2.5 py-1">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Limpieza</span>
          </div>
          <div class="flex items-center gap-1.5 px-2.5 py-1">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span>Bloqueada</span>
          </div>
        </div>
      </div>

      <!-- MAIN SPLIT WORKSPACE (75% MAP / 25% NOTION SIDEBAR) -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- LEFT PANEL: ARCHITECTURAL FLOOR MAP -->
        <div class="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 space-y-6 shadow-sm flex flex-col justify-between min-h-[620px] relative overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-50">
            <div>
              <h3 class="text-lg font-black text-[#08071A] font-outfit">Sala Principal & Terraza</h3>
              <p class="text-[11px] text-slate-400 font-medium">Un clic abre comanda • Doble clic abre ficha técnica</p>
            </div>
            <!-- Toggle modo edición -->
            <button
              @click="toggleDesignMode"
              :class="['px-4 py-2 border rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer flex items-center gap-2',
                isDesignMode ? 'bg-[#9235DF]/10 border-[#9235DF] text-[#9235DF]' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800']"
            >
              <i class="pi pi-sliders-h"></i>
              <span>{{ isDesignMode ? 'Modo Edición Activo' : 'Editar Plano' }}</span>
            </button>
          </div>

          <!-- ZONES NAVIGATION BAR -->
          <div class="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 select-none border-b border-slate-50">
            <button
              type="button"
              :aria-pressed="selectedZoneId === 'all'"
              aria-label="Ver todas las zonas de mesas"
              :disabled="isZoneChangeBlocked"
              @click="changeZone('all')"
              class="px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9235DF] disabled:opacity-50 disabled:cursor-not-allowed"
              :class="[
                selectedZoneId === 'all'
                  ? 'bg-[#9235DF] border-[#9235DF] text-white font-extrabold shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              ]"
            >
              <span>Todas</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full" :class="selectedZoneId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'">
                {{ allVisibleLocationTables.length }}
              </span>
            </button>

            <button
              v-for="zone in visibleZones"
              :key="zone.id"
              type="button"
              :aria-pressed="selectedZoneId === zone.id"
              :aria-label="`Filtrar por zona ${zone.name}`"
              :disabled="isZoneChangeBlocked"
              @click="changeZone(zone.id)"
              class="px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9235DF] disabled:opacity-50 disabled:cursor-not-allowed"
              :class="[
                selectedZoneId === zone.id
                  ? 'bg-[#9235DF] border-[#9235DF] text-white font-extrabold shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              ]"
            >
              <span>{{ zone.name }}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full" :class="selectedZoneId === zone.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'">
                {{ currentLocationTables.filter(t => t.resolvedZoneId === zone.id).length }}
              </span>
            </button>

            <button
              v-if="legacyTables.length > 0"
              type="button"
              :aria-pressed="selectedZoneId === 'legacy'"
              aria-label="Filtrar por mesas sin zona"
              :disabled="isZoneChangeBlocked"
              @click="changeZone('legacy')"
              class="px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9235DF] disabled:opacity-50 disabled:cursor-not-allowed"
              :class="[
                selectedZoneId === 'legacy'
                  ? 'bg-[#9235DF] border-[#9235DF] text-white font-extrabold shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              ]"
            >
              <span>Sin zona</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full" :class="selectedZoneId === 'legacy' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'">
                {{ legacyTables.length }}
              </span>
            </button>
          </div>

          <!-- FLOOR MAP CANVAS -->
          <div class="flex-1 min-h-[500px] w-full bg-[#FBFBFC] border border-slate-100 rounded-3xl relative p-6 overflow-hidden">
            <div class="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:32px_32px] opacity-40"></div>
            <div class="absolute inset-y-0 left-[35%] w-[1px] border-r border-dashed border-slate-200/60 z-0"></div>
            <div class="absolute inset-y-0 left-[68%] w-[1px] border-r border-dashed border-slate-200/60 z-0"></div>
            <div class="absolute top-[50%] left-0 right-[68%] h-[1px] border-b border-dashed border-slate-200/60 z-0"></div>

            <div class="absolute top-4 left-4 text-[9px] text-slate-400 font-black uppercase tracking-widest z-10">Zona A (Ventana)</div>
            <div class="absolute bottom-4 left-4 text-[9px] text-slate-400 font-black uppercase tracking-widest z-10">Zona B (Interior)</div>
            <div class="absolute top-4 left-[38%] text-[9px] text-slate-400 font-black uppercase tracking-widest z-10">Barra & Café</div>
            <div class="absolute top-4 left-[71%] text-[9px] text-slate-400 font-black uppercase tracking-widest z-10">Terraza Aveniq</div>

            <!-- Empty state when no tables configurations are present -->
            <div v-if="visibleTables.length === 0" class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-50/50">
              <i class="pi pi-info-circle text-slate-400 text-2xl mb-2"></i>
              <p class="text-xs text-slate-500 font-semibold">No hay mesas o posiciones configuradas en esta zona.</p>
            </div>

            <button
              v-for="table in visibleTables"
              :key="table.id"
              @click="selectNormalizedTable(table)"
              @dblclick="openFichaModalNormalized(table)"
              :draggable="isDesignMode"
              @dragstart="handleDragStart($event, table.id)"
              @dragover.prevent
              @drop="handleDrop($event, table.id)"
              :style="{
                left: `${table.x}%`,
                top: `${table.y}%`
              }"
              :class="[
                'absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer border active:scale-95 hover:-translate-y-0.5 select-none shadow-md hover:shadow-lg',
                getTableMetadata(table).shape === 'circle' ? 'rounded-full w-20 h-20' : '',
                getTableMetadata(table).shape === 'square' ? 'rounded-2xl w-20 h-20' : '',
                getTableMetadata(table).shape === 'rectangle' ? 'rounded-2xl w-28 h-18' : '',
                getTableMetadata(table).shape === 'barra' ? 'rounded-full w-14 h-14 border-dashed' : '',
                getTableMetadata(table).shape === 'terraza' ? 'rounded-2xl w-20 h-20 border-double border-4' : '',
                selectedTable?.id === table.id ? 'ring-2 ring-[#9235DF] scale-105 z-20 shadow-xl' : '',
                blockedTableIds.includes(table.id) ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70 shadow-none' : '',
                !blockedTableIds.includes(table.id) && table.orders.length === 0 && table.status === 'free' ? 'bg-white border-slate-200 text-slate-700 hover:border-[#9235DF]/20' : '',
                !blockedTableIds.includes(table.id) && table.orders.length === 0 && table.status === 'reserved' ? 'bg-white border-indigo-500 text-indigo-700 hover:border-indigo-600' : '',
                !blockedTableIds.includes(table.id) && table.orders.length > 0 ? getTableServiceStatus(table).colorClass : ''
              ]"
            >
              <div class="relative w-full h-full flex flex-col items-center justify-center p-2">
                <!-- Top-right corner dot -->
                <span
                  v-if="!blockedTableIds.includes(table.id) && table.orders.length > 0"
                  class="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                  :class="getTableServiceStatus(table).dotClass"
                ></span>
                <span v-else-if="!blockedTableIds.includes(table.id) && table.status === 'reserved'" class="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <i v-else-if="blockedTableIds.includes(table.id)" class="pi pi-lock text-[8px] text-slate-400 absolute top-2 right-2"></i>

                <!-- Waitstaff Initial -->
                <span v-if="(table.status !== 'free' || table.orders.length > 0) && !blockedTableIds.includes(table.id)" class="absolute top-1.5 left-2 text-[8px] font-black text-slate-400 uppercase">
                  {{ getTableMetadata(table).waiter[0] }}
                </span>

                <!-- Table label -->
                <span class="text-xs font-black text-slate-900 leading-none">{{ getServicePointLabel(table) }}</span>
                <!-- Table capacity metadata -->
                <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  {{ table.capacity }} pax
                </span>

                <!-- Discrete Live KDS/BDS indicators -->
                <div v-if="table.orders.length > 0 && !blockedTableIds.includes(table.id)" class="flex gap-1.5 mt-1 select-none">
                  <span
                    v-if="getTableServiceStatus(table).showKitchenIcon"
                    class="text-[9px]"
                    :class="getTableServiceStatus(table).kitchenIconColor === 'text-slate-400' ? 'opacity-40' : ''"
                    title="Cocina"
                  >
                    🍽
                  </span>
                  <span
                    v-if="getTableServiceStatus(table).showBarIcon"
                    class="text-[9px]"
                    :class="getTableServiceStatus(table).barIconColor === 'text-slate-400' ? 'opacity-40' : ''"
                    title="Barra"
                  >
                  </span>
                  <span
                    v-if="getTableServiceStatus(table).showServedIcon"
                    class="text-[9px]"
                    title="Servido"
                  >
                    ✅
                  </span>
                </div>

                <!-- Pricing & elapsed time metadata -->
                <div v-if="(table.status !== 'free' || table.orders.length > 0) && !blockedTableIds.includes(table.id)" class="flex items-center gap-1 mt-1 text-[8px] font-black text-[#9235DF]">
                  <span>{{ getTableTotal(table).toFixed(0) }}€</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-slate-400 font-mono">{{ getTableMetadata(table).elapsedTime }}</span>
                </div>
              </div>

              <!-- Badge quantity items -->
              <span
                v-if="table.orders.length > 0"
                class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#9235DF] text-white text-[9px] font-black flex items-center justify-center border border-white"
              >
                {{ table.orders.reduce((sum, item) => sum + item.quantity, 0) }}
              </span>

              <!-- Badge ready items count -->
              <span
                v-if="getTableReadyCount(table) > 0"
                class="absolute -bottom-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black tracking-tight flex items-center gap-0.5 border border-white whitespace-nowrap shadow-sm"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>{{ getTableReadyCount(table) }} listo</span>
              </span>
            </button>
          </div>
        </div>

        <!-- RIGHT PANEL: NOTION-STYLE SIDEBAR (25% width - Hidden on mobile) -->
        <div class="hidden lg:flex lg:col-span-1 flex-col h-full bg-white rounded-3xl border border-slate-100 p-8 shadow-sm justify-between overflow-y-auto">
          <div v-if="!selectedTable" class="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div class="w-12 h-12 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <i class="pi pi-grid text-[#9235DF] text-lg"></i>
            </div>
            <div>
              <h4 class="text-xs font-black text-[#08071A] uppercase tracking-wider">Mesa no seleccionada</h4>
              <p class="text-xs text-slate-400 max-w-[180px] mx-auto mt-1.5 leading-relaxed">
                Selecciona cualquier mesa del plano para ver su estado y comanda activa.
              </p>
            </div>
          </div>

          <div v-else class="flex-1 flex flex-col justify-between h-full space-y-8">
            <div class="space-y-6">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h3 class="text-xl font-black text-[#08071A] font-outfit">Mesa {{ selectedTable.number }}</h3>
                  <span class="px-2 py-0.5 rounded bg-slate-50 text-slate-500 text-[8px] font-black uppercase tracking-widest border border-slate-100">
                    {{ getTableMetadata(selectedTable).zone }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 font-medium">Panel de servicio activo.</p>
                <div v-if="hasPartialPayments || hasActiveSplit" class="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-2xl text-[11px] text-amber-700 font-semibold space-y-1">
                  <div class="flex items-center gap-1.5">
                    <i class="pi pi-exclamation-triangle"></i>
                    <span>Modificaciones bloqueadas</span>
                  </div>
                  <p class="text-[10px] text-amber-600/90 font-medium leading-relaxed">
                    {{ hasActiveSplit && selectedTable?.splitPayment?.mode === 'products' ? 'La cuenta está dividida por productos y ya no puede modificarse.' : hasActiveSplit ? 'La cuenta está dividida y ya no puede modificarse.' : 'La cuenta tiene pagos parciales y ya no puede modificarse.' }}
                  </p>
                </div>
              </div>

              <!-- Primary action: enter dedicated ordering flow -->
              <div class="grid grid-cols-1 gap-2 border-b border-slate-50 pb-4">
                <button
                  :disabled="hasPartialPayments || hasActiveSplit"
                  @click="startOrdering"
                  class="w-full py-2.5 bg-[#9235DF] hover:bg-[#562AAC] text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#9235DF]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i class="pi pi-plus"></i>
                  <span>Añadir Comanda</span>
                </button>

                <button
                  v-if="selectedTable.orders.length > 0"
                  @click="tryCheckout"
                  class="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <i class="pi pi-credit-card"></i>
                  <span>Cobrar Cuenta</span>
                </button>

                <button
                  v-if="selectedTable.status === 'occupied' && selectedTable.orders.length > 0 && !showCheckoutDialog && !hasPartialPayments && !hasActiveSplit"
                  type="button"
                  @click="showMoveAccountModal = true; selectedTargetTableId = null"
                  class="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-[#9235DF] hover:border-[#9235DF]/40 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <i class="pi pi-arrow-right-arrow-left"></i>
                  <span>Mover cuenta</span>
                </button>
              </div>

              <!-- Metadata list -->
              <div class="space-y-3.5 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 font-medium">Estado:</span>
                  <select
                    v-model="selectedTable.status"
                    @change="updateStatus"
                    class="bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold cursor-pointer text-[#08071A] focus:outline-none focus:border-[#9235DF]"
                  >
                    <option value="free">Disponible</option>
                    <option value="occupied">Ocupada</option>
                    <option value="reserved">Reservada</option>
                    <option value="bill">Pide Cuenta</option>
                  </select>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-slate-400 font-medium">Camarero:</span>
                  <span class="font-bold text-[#08071A]">{{ getTableMetadata(selectedTable).waiter }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-slate-400 font-medium">Tiempo ocupada:</span>
                  <span class="font-bold text-[#08071A]">{{ getTableMetadata(selectedTable).elapsedTime || '0 min' }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-slate-400 font-medium">Capacidad:</span>
                  <span class="font-bold text-[#08071A]">{{ selectedTable.capacity }} comensales</span>
                </div>

                <div class="flex items-center justify-between border-t border-slate-50 pt-3">
                  <span class="text-slate-400 font-medium">Importe Total:</span>
                  <span class="text-lg font-black text-[#9235DF]">{{ orderTotal.toFixed(2) }} €</span>
                </div>
              </div>

              <!-- Warning block -->
              <div v-if="showReleaseWarning"
                :class="[
                  'border rounded-2xl p-4 text-xs space-y-2 shrink-0 relative animate-in fade-in duration-200',
                  warningType === 'success'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                    : 'bg-rose-50 border-rose-100 text-rose-800'
                ]"
              >
                <button
                  type="button"
                  @click="showReleaseWarning = false"
                  :class="[
                    'absolute top-2.5 right-2.5 p-1 cursor-pointer',
                    warningType === 'success' ? 'text-emerald-400 hover:text-emerald-700' : 'text-rose-400 hover:text-rose-700'
                  ]"
                >
                  <i class="pi pi-times text-[10px]"></i>
                </button>
                <div class="flex gap-2">
                  <i
                    :class="[
                      'pi text-sm mt-0.5 shrink-0',
                      warningType === 'success' ? 'pi-check-circle text-emerald-500' : 'pi-exclamation-triangle text-rose-500'
                    ]"
                  ></i>
                  <div class="space-y-1">
                    <p class="font-bold" :class="warningType === 'success' ? 'text-emerald-800' : 'text-rose-800'">
                      {{ warningType === 'success' ? 'Operación Completada' : 'Operación Bloqueada' }}
                    </p>
                    <p class="text-[11px] leading-relaxed" :class="warningType === 'success' ? 'text-emerald-700' : 'text-rose-700'">
                      {{ warningMessage }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Read-only active items list -->
              <div class="space-y-3 pt-4 border-t border-slate-50">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Productos pedidos</span>
                <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
                  <div
                    v-for="item in selectedTable.orders"
                    :key="item.id"
                    class="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-100 text-xs hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <div class="flex-1 min-w-0 pr-2">
                      <p class="font-bold text-[#08071A] truncate">{{ item.name }}</p>
                      <p class="text-slate-400 text-[10px] font-semibold mt-0.5">
                        {{ item.quantity }} x {{ item.price.toFixed(2) }} €
                      </p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <span :class="[
                        'px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border',
                        item.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : '',
                        item.status === 'preparing' ? 'bg-blue-50 text-blue-700 border-blue-200' : '',
                        item.status === 'ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse' : '',
                        item.status === 'served' ? 'bg-slate-50 text-slate-400 border-slate-200' : ''
                      ]">
                        {{
                          item.status === 'pending' ? 'Pendiente' :
                          item.status === 'preparing' ? 'Cocción' :
                          item.status === 'ready' ? 'Listo' : 'Servido'
                        }}
                      </span>
                      <button
                        v-if="item.status === 'ready'"
                        @click="markServed(item.id)"
                        class="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg hover:scale-105 transition-all cursor-pointer"
                        title="Entregar"
                      >
                        <i class="pi pi-check text-[9px]"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MOBILE BOTTOM DRAWER SHEET -->
      <div
        v-if="selectedTable"
        class="lg:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 transition-opacity"
        @click="selectedTable = null"
      ></div>
      <div
        :class="['lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-slate-100 p-6 shadow-2xl z-50 transition-all duration-300 max-h-[80vh] flex flex-col justify-between overflow-y-auto',
          selectedTable ? 'translate-y-0' : 'translate-y-full']"
      >
        <div class="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 cursor-pointer" @click="selectedTable = null"></div>
        <div v-if="selectedTable" class="space-y-6">
          <div class="flex justify-between items-start">
            <div class="space-y-0.5">
              <h3 class="text-lg font-black text-[#08071A] font-outfit">Mesa {{ selectedTable.number }}</h3>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Zona: {{ getTableMetadata(selectedTable).zone }} • Camarero: {{ getTableMetadata(selectedTable).waiter }}
              </p>
              <div v-if="hasPartialPayments || hasActiveSplit" class="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-2xl text-[11px] text-amber-700 font-semibold space-y-1">
                <div class="flex items-center gap-1.5">
                  <i class="pi pi-exclamation-triangle"></i>
                  <span>Modificaciones bloqueadas</span>
                </div>
                <p class="text-[10px] text-amber-600/90 font-medium leading-relaxed">
                  {{ hasActiveSplit && selectedTable?.splitPayment?.mode === 'products' ? 'La cuenta está dividida por productos y ya no puede modificarse.' : hasActiveSplit ? 'La cuenta está dividida y ya no puede modificarse.' : 'La cuenta tiene pagos parciales y ya no puede modificarse.' }}
                </p>
              </div>
            </div>
            <select
              v-model="selectedTable.status"
              @change="updateStatus"
              class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer text-[#08071A]"
            >
              <option value="free">Disponible</option>
              <option value="occupied">Ocupada</option>
              <option value="reserved">Reservada</option>
              <option value="bill">Pide Cuenta</option>
            </select>
          </div>

          <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div class="space-y-0.5">
              <span class="text-slate-400 font-semibold block uppercase tracking-wider text-[9px]">Total Acumulado</span>
              <span class="text-xl font-black text-[#08071A]">{{ orderTotal.toFixed(2) }} €</span>
            </div>
            <div class="flex gap-2">
              <button
                :disabled="hasPartialPayments || hasActiveSplit"
                @click="startOrdering"
                class="px-4 py-2.5 bg-[#9235DF] text-white font-black text-xs rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Comanda
              </button>
              <button
                v-if="selectedTable.orders.length > 0"
                @click="tryCheckout"
                class="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cobrar
              </button>
              <button
                v-if="selectedTable.status === 'occupied' && selectedTable.orders.length > 0 && !showCheckoutDialog && !hasPartialPayments && !hasActiveSplit"
                type="button"
                @click="showMoveAccountModal = true; selectedTargetTableId = null"
                class="px-4 py-2.5 bg-white border border-slate-200 text-[#9235DF] font-bold text-xs rounded-xl"
              >
                Mover
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. DEDICATED FULL-PAGE ORDERING FLOW VIEW (SPRINT 3) -->
    <div v-else class="min-h-[calc(100vh-4rem)] flex flex-col">
      <!-- 2.1 CABECERA DE MESA (Compact & highly readable header bar) -->
      <div class="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between gap-6 shadow-sm shrink-0">
        <div class="flex items-center gap-4">
          <!-- Back button -->
          <button
            @click="stopOrdering"
            class="p-2.5 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer flex items-center justify-center"
            title="Volver al plano de mesas"
          >
            <i class="pi pi-arrow-left text-xs"></i>
          </button>
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#9235DF] to-[#562AAC] text-white flex items-center justify-center font-bold text-xs">
                M{{ activeOrderingTable?.number }}
              </span>
              <h3 class="text-base font-black text-[#08071A]">Mesa {{ activeOrderingTable?.number }}</h3>
              <span class="text-[9px] font-black uppercase bg-teal-50 text-teal-700 border border-teal-200/50 px-1.5 py-0.5 rounded">
                {{ activeOrderingTable?.status }}
              </span>
            </div>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <span>Pax: {{ activeOrderingTable?.capacity }}</span>
              <span>•</span>
              <span>Camarero: {{ getTableMetadata(activeOrderingTable!).waiter }}</span>
              <span>•</span>
              <span>Abierta hace: {{ getTableMetadata(activeOrderingTable!).elapsedTime || '0 min' }}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-right hidden sm:block">
            <span class="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Total Acumulado</span>
            <span class="text-base font-black text-[#9235DF]">{{ (getTableTotal(activeOrderingTable!) + basketTotal).toFixed(2) }} €</span>
          </div>
          <button
            @click="triggerSendConfirm"
            :disabled="basket.length === 0"
            class="px-5 py-2.5 bg-[#9235DF] hover:bg-[#562AAC] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl transition-all shadow-md shadow-[#9235DF]/10 cursor-pointer flex items-center gap-2"
          >
            <i class="pi pi-send"></i>
            <span>Enviar Comanda</span>
          </button>
        </div>
      </div>

      <!-- 2.2 THREE-ZONE CONTAINER -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-0 overflow-hidden">

        <!-- ZONE 1: CATEGORIES NAVIGATION (Left column - 15% width equivalent) -->
        <div class="bg-white border-r border-slate-100 p-4 flex flex-col gap-1.5 overflow-y-auto shrink-0 select-none">
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2 block">Categorías</span>
          <button
            v-for="cat in displayCategories"
            :key="cat.id"
            @click="activeCategory = cat.id"
            :class="['w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-3',
              activeCategory === cat.id
                ? 'bg-[#9235DF]/5 text-[#9235DF] shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50']"
          >
            <i :class="['pi', cat.icon, 'text-xs', activeCategory === cat.id ? 'text-[#9235DF]' : 'text-slate-400']"></i>
            <span>{{ cat.name }}</span>
            <span v-if="cat.id !== 'favoritos'" class="text-[9px] font-mono text-slate-300 ml-auto">
              ({{ getCategoryItemsCount(cat.id) }})
            </span>
          </button>
        </div>

        <!-- ZONE 2: PRODUCTS CATALOG (Center Column - 55% width equivalent) -->
        <div class="lg:col-span-2 bg-[#FBFBFC] p-6 flex flex-col gap-6 overflow-y-auto h-[calc(100vh-8.5rem)]">
          <!-- SEARCH & FAVS CONTROLS -->
          <div class="flex flex-col gap-4 shrink-0">
            <!-- Search bar immediate -->
            <div class="relative w-full">
              <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                placeholder="Buscar plato, bebida, código o tag... (Presiona '/' para enfocar)"
                class="w-full bg-white hover:bg-slate-50/50 focus:bg-white border border-slate-200/80 focus:border-[#9235DF] focus:ring-1 focus:ring-[#9235DF]/10 rounded-2xl pl-10 pr-12 py-3 text-xs text-[#08071A] font-semibold transition-all focus:outline-none"
              />
              <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                /
              </span>
            </div>

            <!-- Fast-Click Favorites / Frecuentes row -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Productos Frecuentes [Demo]</span>
                <span class="text-[9px] text-[#9235DF] font-bold">Un toque añade inmediato</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  v-for="fav in favoriteItems"
                  :key="fav.id"
                  @click="addProductImmediate(fav)"
                  class="p-3 bg-white hover:bg-slate-50 border border-slate-200/60 rounded-2xl shadow-sm text-left transition-all active:scale-95 cursor-pointer flex items-center justify-between group"
                >
                  <div class="space-y-0.5">
                    <p class="text-xs font-bold text-slate-800 truncate max-w-[100px]">{{ fav.name }}</p>
                    <p class="text-[10px] font-black text-[#9235DF]">{{ fav.price.toFixed(2) }} €</p>
                  </div>
                  <div class="p-1.5 bg-slate-50 group-hover:bg-[#9235DF]/5 text-slate-400 group-hover:text-[#9235DF] rounded-lg transition-colors">
                    <i class="pi pi-plus text-[9px]"></i>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- PRODUCTS GRID -->
          <div class="space-y-4">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Catálogo de Artículos</span>

            <div v-if="filteredCatalogItems.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="item in filteredCatalogItems"
                :key="item.id"
                :class="[
                  'bg-white rounded-3xl border p-5 flex flex-col justify-between relative group shadow-sm transition-all duration-300 hover:shadow-md select-none',
                  item.available ? 'border-slate-200/60' : 'border-rose-100 opacity-60'
                ]"
              >
                <!-- Availability Badges -->
                <div class="absolute top-4 right-4 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider">
                  <span v-if="!item.available" class="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md border border-rose-100">
                    Agotado
                  </span>
                  <span v-else-if="item.id === 'm1'" class="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-100 animate-pulse">
                    Últimas 3 uds.
                  </span>
                  <span v-else class="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                    Disponible
                  </span>
                </div>

                <div class="space-y-3">
                  <div class="space-y-1">
                    <span class="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                      Cod: {{ item.code }} • {{ item.category }}
                    </span>
                    <h4 class="text-sm font-black text-slate-900 leading-snug">{{ item.name }}</h4>
                    <p class="text-xs text-slate-400 leading-relaxed">{{ item.description }}</p>
                  </div>

                  <!-- Allergens and tags -->
                  <div class="flex flex-wrap gap-1">
                    <span v-for="tag in item.tags" :key="tag" class="px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 text-[8px] font-bold uppercase">
                      #{{ tag }}
                    </span>
                    <span v-for="alg in item.allergens" :key="alg" class="px-1.5 py-0.5 rounded bg-amber-50/50 text-amber-700 text-[8px] font-semibold">
                      {{ alg }}
                    </span>
                  </div>
                </div>

                <!-- Footer details / addition controls -->
                <div class="flex items-center justify-between gap-3 pt-4 border-t border-slate-50 mt-4">
                  <span class="text-sm font-black text-[#9235DF]">{{ item.price.toFixed(2) }} €</span>

                  <div class="flex items-center gap-1.5">
                    <!-- Config modifiers button -->
                    <button
                      v-if="item.available"
                      @click="openModifiersModal(item)"
                      class="p-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-500 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                      title="Ajustar modificaciones e ingredientes"
                    >
                      <i class="pi pi-cog text-[10px]"></i>
                    </button>
                    <!-- Add instant unit button -->
                    <button
                      @click="addProductImmediate(item)"
                      :disabled="!item.available"
                      class="px-4 py-2 bg-slate-900 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1"
                    >
                      <i class="pi pi-plus text-[9px]"></i>
                      <span>Añadir</span>
                    </button>
                  </div>
                </div>

                <!-- Visual feedback check when added recently -->
                <div
                  v-if="addedFeedbackId === item.id"
                  class="absolute inset-0 bg-white/90 backdrop-blur-xs rounded-3xl flex items-center justify-center text-[#9235DF] font-bold text-xs gap-2 animate-in fade-in duration-200"
                >
                  <i class="pi pi-check-circle text-sm"></i>
                  <span>¡Añadido!</span>
                </div>

              </div>
            </div>

            <!-- Empty catalog state -->
            <div v-else class="py-16 text-center bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
              <i class="pi pi-info-circle text-slate-300 text-2xl"></i>
              <p class="text-xs text-slate-400">No se encontraron artículos que coincidan con la búsqueda.</p>
            </div>
          </div>
        </div>

        <!-- ZONE 3: ACTIVECOMANDA WORKSPACE (Right Column - 30% width equivalent) -->
        <div class="bg-white border-l border-slate-100 p-6 flex flex-col justify-between h-[calc(100vh-8.5rem)] overflow-y-auto">

          <div class="space-y-6">
            <!-- Active Pending Basket section -->
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b border-slate-50 pb-2">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nuevos (Por Enviar)</span>
                <span class="text-[9px] font-black text-[#9235DF] bg-[#9235DF]/5 px-2 py-0.5 rounded">
                  {{ basketCount }} items
                </span>
              </div>

              <!-- Pending items list -->
              <div v-if="basket.length > 0" class="space-y-3.5">
                <div
                  v-for="(item, index) in basket"
                  :key="item.id"
                  class="space-y-2 pb-3 border-b border-slate-50/50"
                >
                  <div class="flex items-start justify-between gap-3 text-xs">
                    <div class="space-y-0.5">
                      <p class="font-bold text-slate-800">{{ item.name }}</p>
                      <p class="text-[10px] text-slate-400 font-bold uppercase">
                        Destino: <span class="text-[#9235DF]">{{ getItemDestinationLabel(item.category) }}</span>
                      </p>
                    </div>
                    <span class="font-black text-slate-700 shrink-0">{{ (item.price * item.quantity).toFixed(2) }} €</span>
                  </div>

                  <!-- Notes/Modifiers description -->
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span
                      v-for="mod in getItemModifiersList(item.notes)"
                      :key="mod"
                      class="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-semibold border border-slate-200/40"
                    >
                      {{ mod }}
                    </span>
                    <button
                      @click="openModifiersModal(getCatalogItemRef(item.menuItemId))"
                      class="text-[9px] font-bold text-[#9235DF] hover:underline cursor-pointer"
                    >
                      + Modificador
                    </button>
                  </div>

                  <div class="flex items-center justify-between gap-4 pt-1">
                    <!-- Text note input -->
                    <input
                      v-model="item.notes"
                      type="text"
                      placeholder="Obs. de cocina..."
                      class="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] focus:outline-none focus:border-[#9235DF]"
                    />

                    <!-- Controls quantity -->
                    <div class="flex items-center gap-1.5 shrink-0">
                      <button
                        @click="decrementBasketItem(index)"
                        class="w-5 h-5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 cursor-pointer"
                      >-</button>
                      <span class="font-bold text-xs w-4 text-center">{{ item.quantity }}</span>
                      <button
                        @click="incrementBasketItem(index)"
                        class="w-5 h-5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 cursor-pointer"
                      >+</button>
                      <button
                        @click="removeFromBasket(index)"
                        class="p-1 text-rose-400 hover:text-rose-600 ml-1 cursor-pointer"
                      >
                        <i class="pi pi-trash text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty basket state -->
              <div v-else class="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/60 text-slate-400 text-xs">
                Usa el catálogo de la izquierda para seleccionar productos.
              </div>
            </div>

            <!-- Already Sent items section (Read only to avoid duplicates) -->
            <div v-if="activeOrderingTable?.orders && activeOrderingTable.orders.length > 0" class="space-y-4 pt-4 border-t border-slate-100">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En preparación / Enviado</span>
                <span class="text-[9px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  {{ activeOrderingTable.orders.length }} enviados
                </span>
              </div>

              <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
                <div
                  v-for="sent in activeOrderingTable.orders"
                  :key="sent.id"
                  class="flex justify-between items-center p-2.5 rounded-xl bg-slate-50/50 border border-slate-100 text-xs"
                >
                  <div class="space-y-0.5">
                    <span class="font-bold text-slate-700">{{ sent.name }} (x{{ sent.quantity }})</span>
                    <p class="text-[9px] text-slate-400 font-semibold italic">{{ sent.notes || 'Sin observaciones' }}</p>
                  </div>
                  <span :class="[
                    'px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border',
                    sent.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : '',
                    sent.status === 'preparing' ? 'bg-blue-50 text-blue-700 border-blue-200' : '',
                    sent.status === 'ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse' : '',
                    sent.status === 'served' ? 'bg-slate-50 text-slate-400 border-slate-200' : ''
                  ]">
                    {{ sent.status }}
                  </span>
                </div>
              </div>
            </div>

          </div>

          <!-- Total estimated footer & Send button -->
          <div class="pt-4 border-t border-slate-100 space-y-4 shrink-0 bg-white">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-slate-400 uppercase">Subtotal estimado</span>
              <span class="text-base font-black text-[#08071A]">{{ basketTotal.toFixed(2) }} €</span>
            </div>
            <button
              @click="triggerSendConfirm"
              :disabled="basket.length === 0"
              class="w-full py-3 bg-[#9235DF] hover:bg-[#562AAC] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#9235DF]/10"
            >
              <i class="pi pi-send"></i>
              <span>Enviar a Cocina / Barra</span>
            </button>
          </div>

        </div>

      </div>

      <!-- MODIFIERS MODAL (DOUBLE-CLICK / DETAILS BUTTON) -->
      <div
        v-if="showModifiersModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
      >
        <div class="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative">
          <button
            @click="closeModifiersModal"
            class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <i class="pi pi-times"></i>
          </button>

          <div>
            <h3 class="text-lg font-black text-[#08071A] font-outfit">Modificadores de Plato</h3>
            <p class="text-xs text-slate-400 font-medium">Configura ingredientes, preparación o prioridad para {{ activeModifierItem?.name }}.</p>
          </div>

          <div class="space-y-4">
            <!-- Modifiers checklist grid -->
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="mod in standardModifiers"
                :key="mod.code"
                @click="toggleModifier(mod.label)"
                :class="['p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center gap-2',
                  selectedModifiers.includes(mod.label)
                    ? 'bg-[#9235DF]/5 border-[#9235DF] text-[#9235DF]'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/50']"
              >
                <i :class="['pi', selectedModifiers.includes(mod.label) ? 'pi-check-circle text-[#9235DF]' : 'pi-circle text-slate-300', 'text-xs']"></i>
                <span>{{ mod.label }}</span>
              </button>
            </div>

            <!-- Custom notes input inside modifiers modal -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Observaciones adicionales</label>
              <input
                v-model="customModifierNote"
                type="text"
                placeholder="Escribe otros detalles de preparación..."
                class="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#9235DF]"
              />
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              @click="closeModifiersModal"
              class="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              @click="applyModifiers"
              class="flex-1 py-2.5 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
            >
              Aplicar y Añadir
            </button>
          </div>
        </div>
      </div>

      <!-- SEND COMANDA CONFIRMATION POPUP -->
      <div
        v-if="showSendConfirmModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
      >
        <div class="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
          <button
            @click="showSendConfirmModal = false"
            class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <i class="pi pi-times"></i>
          </button>

          <div class="flex items-center gap-3 text-[#9235DF]">
            <i class="pi pi-send text-xl"></i>
            <h3 class="text-xl font-black text-[#08071A] font-outfit">Confirmación de Envío</h3>
          </div>

          <p class="text-xs text-slate-400 leading-relaxed">
            Revisa el desglose de destinos antes de enviar los nuevos productos a preparación.
          </p>

          <!-- Desglose grid -->
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-3">
            <div class="flex justify-between font-bold text-slate-700">
              <span>Destino</span>
              <span>Uds.</span>
            </div>

            <div class="flex justify-between text-slate-500">
              <span class="flex items-center gap-1.5">🟢 Barra / Bebidas</span>
              <span class="font-bold">{{ getSendDestinationsCount().barra }} uds.</span>
            </div>

            <div class="flex justify-between text-slate-500">
              <span class="flex items-center gap-1.5">🍳 Cocina / Platos</span>
              <span class="font-bold">{{ getSendDestinationsCount().cocina }} uds.</span>
            </div>

            <div class="flex justify-between font-black text-sm text-[#08071A] pt-2.5 border-t border-slate-200">
              <span>Total Estimado</span>
              <span class="text-[#9235DF]">{{ basketTotal.toFixed(2) }} €</span>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              @click="showSendConfirmModal = false"
              class="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
            >
              Corregir
            </button>
            <button
              @click="confirmSendComanda"
              class="flex-1 py-2.5 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
            >
              Confirmar Envío
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- DETAILED FICHA MODAL (DOUBLE-CLICK IN MAPA) -->
    <div
      v-if="showFichaModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-lg w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          @click="closeFichaModal"
          class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9235DF] to-[#562AAC] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#9235DF]/10">
            M-{{ activeFichaTable?.number }}
          </div>
          <div>
            <h3 class="text-xl font-black text-[#08071A] font-outfit">Ficha Técnica de la Mesa</h3>
            <p class="text-xs text-slate-400 font-medium">Información de servicio detallada en tiempo real.</p>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto space-y-6 pr-1 my-2">
          <!-- Ficha Grid -->
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Zona Asignada</span>
              <span class="text-xs font-black text-slate-800 uppercase tracking-wide">
                {{ activeFichaTable ? getTableMetadata(activeFichaTable).zone : '-' }}
              </span>
            </div>
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Camarero en Turno</span>
              <span class="text-xs font-black text-slate-800">
                {{ activeFichaTable ? getTableMetadata(activeFichaTable).waiter : '-' }}
              </span>
            </div>
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Formato Físico</span>
              <span class="text-xs font-black text-slate-800 uppercase tracking-wide">
                {{ activeFichaTable ? getTableMetadata(activeFichaTable).shape : '-' }}
              </span>
            </div>
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Estado del Servicio</span>
              <span class="text-xs font-black text-[#9235DF] uppercase tracking-wide">
                {{ activeFichaTable ? activeFichaTable.status : '-' }}
              </span>
            </div>
          </div>

          <!-- Lock / Block table control -->
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Controles de Mesa</span>
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-600">Bloquear mesa en el plano</span>
              <button
                @click="toggleTableLock"
                :class="['px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer',
                  activeFichaTable && blockedTableIds.includes(activeFichaTable.id)
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100']"
              >
                {{ activeFichaTable && blockedTableIds.includes(activeFichaTable.id) ? 'Desbloquear' : 'Bloquear Mesa' }}
              </button>
            </div>
          </div>

          <!-- Items timeline / details log -->
          <div class="space-y-3">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Items de Comanda</span>
            <div class="space-y-2">
              <div
                v-for="item in activeFichaTable?.orders"
                :key="item.id"
                class="flex justify-between items-center p-3 rounded-2xl bg-white border border-slate-100 text-xs shadow-sm"
              >
                <div class="space-y-0.5">
                  <span class="font-bold text-slate-800">{{ item.name }}</span>
                  <p class="text-[10px] text-slate-400 font-semibold">{{ item.quantity }} unidades • Categoría: {{ item.category }}</p>
                </div>
                <span class="font-black text-slate-800">{{ (item.price * item.quantity).toFixed(2) }} €</span>
              </div>
              <div v-if="activeFichaTable?.orders.length === 0" class="py-6 text-center text-xs text-slate-400">
                No hay productos registrados en la comanda de esta mesa.
              </div>
            </div>
          </div>
        </div>

        <button @click="closeFichaModal" class="w-full py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
          Volver al Plano
        </button>
      </div>
    </div>

    <!-- WARNING READY UNBOARDED ITEMS (MAP VIEW ONLY) -->
    <div
      v-if="showReadyWarningModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          @click="showReadyWarningModal = false"
          class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <h3 class="text-xl font-bold text-amber-600 flex items-center gap-2 font-outfit">
          <i class="pi pi-exclamation-triangle"></i>
          <span>Advertencia de Cobro</span>
        </h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Hay productos listos que todavía no constan como servidos. Revisa la mesa antes de cobrar.
        </p>

        <div class="flex gap-3 pt-2">
          <button
            @click="showReadyWarningModal = false"
            class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
          >
            Revisar comanda
          </button>
          <button
            @click="proceedToCheckout"
            class="flex-1 py-2.5 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
          >
            Continuar con el cobro
          </button>
        </div>
      </div>
    </div>

    <!-- CHECKOUT PAYMENT SELECTION (MAP VIEW ONLY) -->
    <div
      v-if="showCheckoutDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          @click="showCheckoutDialog = false"
          class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <h3 class="text-xl font-bold text-[#08071A] flex items-center gap-2 font-outfit">
          <i class="pi pi-credit-card text-[#9235DF]"></i>
          <span>Cobro de Cuenta</span>
        </h3>
        <p class="text-xs text-slate-400">Servicio de la Mesa {{ selectedTable?.number }}.</p>

        <!-- Summary panel showing Total, Paid, and Remaining -->
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
          <div class="flex justify-between font-medium text-slate-500">
            <span>Total Bruto:</span>
            <span class="font-bold text-[#08071A]">{{ selectedTable ? (mesasStore.getTableGrossTotalCents(selectedTable.id) / 100).toFixed(2) : '0.00' }} €</span>
          </div>
          <div v-if="selectedTable && mesasStore.getTableDiscountCents(selectedTable.id) > 0" class="flex justify-between font-medium text-red-500">
            <span>Descuento ({{ selectedTable.discount?.type === 'percentage' ? selectedTable.discount.percentage + '%' : 'Fijo' }}) - {{ selectedTable.discount?.reason.toUpperCase() }}:</span>
            <span class="font-bold">-{{ (mesasStore.getTableDiscountCents(selectedTable.id) / 100).toFixed(2) }} €</span>
          </div>
          <div v-if="selectedTable && mesasStore.getTableDiscountCents(selectedTable.id) > 0" class="flex justify-between font-bold text-slate-700">
            <span>Total Neto:</span>
            <span class="font-bold">{{ (mesasStore.getTableNetTotalCents(selectedTable.id) / 100).toFixed(2) }} €</span>
          </div>
          <div class="flex justify-between font-medium text-slate-500">
            <span>Total Pagado:</span>
            <span class="font-bold text-emerald-600">{{ selectedTable ? (mesasStore.getTablePaidCents(selectedTable.id) / 100).toFixed(2) : '0.00' }} €</span>
          </div>
          <div class="flex justify-between font-black text-sm text-[#08071A] pt-2 border-t border-slate-200">
            <span>Importe Pendiente:</span>
            <span class="text-[#9235DF]">{{ selectedTable ? (mesasStore.getTableRemainingCents(selectedTable.id) / 100).toFixed(2) : '0.00' }} €</span>
          </div>
        </div>

        <!-- History of partial payments registered if any -->
        <div v-if="selectedTable?.partialPayments && selectedTable.partialPayments.length > 0" class="space-y-2">
          <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Historial de Abonos</span>
          <div class="max-h-24 overflow-y-auto space-y-1.5 pr-1">
            <div
              v-for="p in selectedTable.partialPayments"
              :key="p.id"
              class="flex flex-col justify-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-[10px] space-y-1"
            >
              <div class="flex justify-between items-center w-full">
                <div class="flex items-center gap-1.5 text-slate-600">
                  <i :class="p.method === 'cash' ? 'pi pi-wallet text-emerald-500' : p.method === 'bizum' ? 'pi pi-mobile text-[#9235DF]' : 'pi pi-credit-card text-indigo-500'"></i>
                  <span class="font-bold uppercase text-[9px]">
                    {{ p.method === 'cash' ? 'Efectivo' : p.method === 'bizum' ? 'Bizum' : 'Tarjeta' }}
                  </span>
                </div>
                <span class="font-black text-slate-700 text-xs">{{ (p.amountCents / 100).toFixed(2) }} €</span>
              </div>
              <span v-if="p.method === 'bizum' && p.verifiedManually" class="text-[8px] text-[#9235DF] font-bold block leading-none flex items-center gap-0.5">
                <i class="pi pi-check text-[7px]"></i>
                <span>Verificado manualmente</span>
              </span>
            </div>
          </div>
        </div>

        <!-- SPLIT PAYMENT VIEW (When splitPayment is active) -->
        <div v-if="selectedTable && selectedTable.splitPayment" class="space-y-4">
          <!-- 1. EQUAL SPLIT DISPLAY -->
          <div v-if="selectedTable.splitPayment.mode === 'equal'" class="space-y-4">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Reparto entre comensales</span>
            <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
              <div
                v-for="share in selectedTable.splitPayment.shares"
                :key="share.id"
                class="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-2xl"
              >
                <div class="space-y-0.5">
                  <span class="font-bold text-xs text-[#08071A]">{{ share.label }}</span>
                  <span class="text-[10px] text-slate-400 font-mono block">{{ (share.amountCents / 100).toFixed(2) }} €</span>
                </div>
                <div>
                  <span v-if="share.status === 'paid'" class="text-emerald-600 text-xs font-black flex items-center gap-1">
                    <i class="pi pi-check-circle"></i>
                    <span>PAGADO</span>
                  </span>
                  <div v-else class="flex items-center gap-2">
                    <button
                      v-if="processingShareId !== share.id"
                      @click="startPayShare(share)"
                      class="px-3 py-1 bg-[#9235DF] hover:bg-[#9235DF]/90 text-white text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-95"
                    >
                      Cobrar
                    </button>
                    <span v-else class="text-[#9235DF] text-xs font-bold flex items-center gap-1.5 animate-pulse">
                      <i class="pi pi-spin pi-spinner text-xs"></i>
                      <span>Procesando...</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sub-dialog for payment method confirmation of a single share -->
            <div v-if="activeShareToPay" class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
              <div class="flex justify-between items-center">
                <span class="text-xs font-black text-slate-700">Cobrar {{ activeShareToPay.label }} ({{ (activeShareToPay.amountCents / 100).toFixed(2) }} €)</span>
                <button @click="activeShareToPay = null; resetBizum()" class="text-slate-400 hover:text-slate-600"><i class="pi pi-times text-xs"></i></button>
              </div>

              <!-- Main Method selection -->
              <div v-if="!(bizumVerificationActive && bizumVerificationType === 'share')" class="grid grid-cols-3 gap-2">
                <button
                  @click="confirmPayShare('card')"
                  :disabled="processingShareId !== null"
                  class="flex justify-center items-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 cursor-pointer disabled:opacity-50"
                >
                  <i class="pi pi-credit-card"></i>
                  <span>Tarjeta</span>
                </button>
                <button
                  @click="confirmPayShare('cash')"
                  :disabled="processingShareId !== null"
                  class="flex justify-center items-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 cursor-pointer disabled:opacity-50"
                >
                  <i class="pi pi-wallet"></i>
                  <span>Efectivo</span>
                </button>
                <button
                  @click="bizumVerificationType = 'share'; bizumVerificationActive = true"
                  :disabled="processingShareId !== null"
                  class="flex justify-center items-center gap-1.5 py-2 bg-[#9235DF]/5 hover:bg-[#9235DF]/10 text-[#9235DF] text-xs font-bold rounded-xl border border-[#9235DF]/20 cursor-pointer disabled:opacity-50"
                >
                  <i class="pi pi-mobile"></i>
                  <span>Bizum</span>
                </button>
              </div>

              <!-- Bizum Manual Verification sub-card -->
              <div v-else class="p-3 bg-white rounded-xl border border-slate-100 space-y-2.5 animate-in fade-in duration-200">
                <p class="text-[10px] text-slate-500 font-bold text-center leading-tight">
                  Confirma que has verificado la recepción del Bizum antes de continuar.
                </p>
                <div class="flex gap-2">
                  <button
                    @click="confirmPayShare('bizum', true); resetBizum()"
                    :disabled="processingShareId !== null"
                    class="flex-1 py-1.5 bg-[#9235DF] hover:bg-[#9235DF]/95 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    Confirmar cobro
                  </button>
                  <button
                    @click="resetBizum"
                    class="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>

            <!-- Cancellation option -->
            <div class="pt-4 border-t border-slate-100 flex justify-between items-center gap-2">
              <button
                type="button"
                @click="handleCancelSplit"
                :disabled="selectedTable.splitPayment.shares.some(s => s.status === 'paid')"
                class="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-500 disabled:text-slate-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancelar división
              </button>
              <p v-if="selectedTable.splitPayment.shares.some(s => s.status === 'paid')" class="text-[10px] text-slate-400 font-semibold italic text-right leading-tight flex-1">
                No se puede cancelar la división porque ya existen pagos registrados.
              </p>
            </div>
          </div>

          <!-- 2. PRODUCT SPLIT DISPLAY -->
          <div v-else-if="selectedTable.splitPayment.mode === 'products'" class="space-y-4">
            <!-- Draft view for assignments -->
            <div v-if="selectedTable.splitPayment.status === 'draft'" class="space-y-4">
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Asignación de productos por persona</span>

              <!-- Desktop Matrix View -->
              <div class="hidden sm:block overflow-x-auto border border-slate-100 rounded-2xl max-h-72">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-slate-50 border-b border-slate-100 font-bold text-slate-500">
                      <th class="p-3">Producto</th>
                      <th v-for="p in selectedTable.splitPayment.people" :key="p.id" class="p-3 text-center w-24">
                        {{ p.label }}
                      </th>
                      <th class="p-3 text-right text-amber-600 font-black">Sin Asignar</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-semibold text-slate-700">
                    <tr v-for="item in selectedTable.orders" :key="item.id" class="hover:bg-slate-50/50">
                      <td class="p-3">
                        <div class="font-bold text-[#08071A]">{{ item.name }}</div>
                        <div class="text-[10px] text-slate-400 font-mono">{{ (item.price).toFixed(2) }} € x {{ item.quantity }}</div>
                      </td>
                      <td v-for="p in selectedTable.splitPayment.people" :key="p.id" class="p-3 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            @click="handleUnassignProduct(p.id, item.id, 1)"
                            :disabled="!(p.allocations.find(a => a.orderItemId === item.id)?.quantity)"
                            class="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <i class="pi pi-minus text-[8px]"></i>
                          </button>
                          <span class="font-black text-xs min-w-[12px]">
                            {{ p.allocations.find(a => a.orderItemId === item.id)?.quantity || 0 }}
                          </span>
                          <button
                            type="button"
                            @click="handleAssignProduct(p.id, item.id, 1)"
                            :disabled="mesasStore.getUnassignedQuantity(selectedTable.id, item.id) <= 0"
                            class="w-5 h-5 rounded-md bg-[#9235DF]/10 hover:bg-[#9235DF]/20 text-[#9235DF] flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <i class="pi pi-plus text-[8px]"></i>
                          </button>
                        </div>
                      </td>
                      <td class="p-3 text-right font-black text-amber-600">
                        {{ mesasStore.getUnassignedQuantity(selectedTable.id, item.id) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Mobile Card View -->
              <div class="block sm:hidden space-y-3 max-h-72 overflow-y-auto pr-1">
                <div
                  v-for="item in selectedTable.orders"
                  :key="item.id"
                  class="bg-slate-50 border border-slate-100 p-3 rounded-2xl space-y-2.5"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <span class="font-bold text-xs text-[#08071A]">{{ item.name }}</span>
                      <span class="text-[10px] text-slate-400 font-mono block">{{ (item.price).toFixed(2) }} € x {{ item.quantity }}</span>
                    </div>
                    <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                      Sin asignar: {{ mesasStore.getUnassignedQuantity(selectedTable.id, item.id) }}
                    </span>
                  </div>

                  <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                    <div
                      v-for="p in selectedTable.splitPayment.people"
                      :key="p.id"
                      class="flex items-center justify-between bg-white border border-slate-100 p-1.5 rounded-xl"
                    >
                      <span class="text-[10px] font-bold text-slate-500">{{ p.label }}</span>
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="handleUnassignProduct(p.id, item.id, 1)"
                          :disabled="!(p.allocations.find(a => a.orderItemId === item.id)?.quantity)"
                          class="w-4 h-4 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <i class="pi pi-minus text-[7px]"></i>
                        </button>
                        <span class="font-bold text-xs">
                          {{ p.allocations.find(a => a.orderItemId === item.id)?.quantity || 0 }}
                        </span>
                        <button
                          type="button"
                          @click="handleAssignProduct(p.id, item.id, 1)"
                          :disabled="mesasStore.getUnassignedQuantity(selectedTable.id, item.id) <= 0"
                          class="w-4 h-4 rounded-md bg-[#9235DF]/10 hover:bg-[#9235DF]/20 text-[#9235DF] flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <i class="pi pi-plus text-[7px]"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Subtotal Preview -->
              <div class="bg-slate-50 border border-slate-100 p-3 rounded-2xl space-y-2">
                <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Previsualización de cuentas</span>
                <div class="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto pr-1">
                  <div v-for="p in selectedTable.splitPayment.people" :key="p.id" class="flex justify-between items-center text-[10px] bg-white border border-slate-100 p-2 rounded-xl">
                    <span class="font-bold text-slate-600">{{ p.label }}</span>
                    <span class="font-black text-slate-800">{{ (p.allocations.reduce((sum, a) => sum + a.amountCents, 0) / 100).toFixed(2) }} €</span>
                  </div>
                </div>
              </div>

              <!-- Confirmation and cancel controls -->
              <div class="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  @click="handleCancelSplit"
                  class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 text-center"
                >
                  Cancelar división
                </button>
                <button
                  type="button"
                  @click="handleConfirmProductSplit"
                  class="flex-1 py-2 bg-[#9235DF] hover:bg-[#9235DF]/95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 text-center"
                >
                  Confirmar Reparto
                </button>
              </div>
            </div>

            <!-- Confirmed view for payment -->
            <div v-else-if="selectedTable.splitPayment.status === 'confirmed'" class="space-y-4">
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cobro por Persona</span>
              <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
                <div
                  v-for="person in selectedTable.splitPayment.people"
                  :key="person.id"
                  class="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-2xl"
                >
                  <div class="space-y-0.5">
                    <span class="font-bold text-xs text-[#08071A]">{{ person.label }}</span>
                    <span class="text-[10px] text-slate-400 font-mono block">{{ (person.amountCents / 100).toFixed(2) }} €</span>
                  </div>
                  <div>
                    <span v-if="person.status === 'paid'" class="text-emerald-600 text-xs font-black flex items-center gap-1">
                      <i class="pi pi-check-circle"></i>
                      <span>PAGADO</span>
                    </span>
                    <div v-else class="flex items-center gap-2">
                      <button
                        v-if="processingPersonId !== person.id"
                        @click="startPayPerson(person)"
                        class="px-3 py-1 bg-[#9235DF] hover:bg-[#9235DF]/90 text-white text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-95"
                      >
                        Cobrar
                      </button>
                      <span v-else class="text-[#9235DF] text-xs font-bold flex items-center gap-1.5 animate-pulse">
                        <i class="pi pi-spin pi-spinner text-xs"></i>
                        <span>Procesando...</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment Method confirmation for product split -->
              <div v-if="activePersonToPay" class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-black text-slate-700">Cobrar {{ activePersonToPay.label }} ({{ (activePersonToPay.amountCents / 100).toFixed(2) }} €)</span>
                  <button @click="activePersonToPay = null; resetBizum()" class="text-slate-400 hover:text-slate-600"><i class="pi pi-times text-xs"></i></button>
                </div>

                <!-- Main Method selection -->
                <div v-if="!(bizumVerificationActive && bizumVerificationType === 'person')" class="grid grid-cols-3 gap-2">
                  <button
                    @click="confirmPayPerson('card')"
                    :disabled="processingPersonId !== null"
                    class="flex justify-center items-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 cursor-pointer disabled:opacity-50"
                  >
                    <i class="pi pi-credit-card"></i>
                    <span>Tarjeta</span>
                  </button>
                  <button
                    @click="confirmPayPerson('cash')"
                    :disabled="processingPersonId !== null"
                    class="flex justify-center items-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 cursor-pointer disabled:opacity-50"
                  >
                    <i class="pi pi-wallet"></i>
                    <span>Efectivo</span>
                  </button>
                  <button
                    @click="bizumVerificationType = 'person'; bizumVerificationActive = true"
                    :disabled="processingPersonId !== null"
                    class="flex justify-center items-center gap-1.5 py-2 bg-[#9235DF]/5 hover:bg-[#9235DF]/10 text-[#9235DF] text-xs font-bold rounded-xl border border-[#9235DF]/20 cursor-pointer disabled:opacity-50"
                  >
                    <i class="pi pi-mobile"></i>
                    <span>Bizum</span>
                  </button>
                </div>

                <!-- Bizum Manual Verification sub-card -->
                <div v-else class="p-3 bg-white rounded-xl border border-slate-100 space-y-2.5 animate-in fade-in duration-200">
                  <p class="text-[10px] text-slate-500 font-bold text-center leading-tight">
                    Confirma que has verificado la recepción del Bizum antes de continuar.
                  </p>
                  <div class="flex gap-2">
                    <button
                      @click="confirmPayPerson('bizum', true); resetBizum()"
                      :disabled="processingPersonId !== null"
                      class="flex-1 py-1.5 bg-[#9235DF] hover:bg-[#9235DF]/95 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                    >
                      Confirmar cobro
                    </button>
                    <button
                      @click="resetBizum"
                      class="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>

              <!-- Cancellation Option -->
              <div class="pt-4 border-t border-slate-100 flex justify-between items-center gap-2">
                <button
                  type="button"
                  @click="handleCancelSplit"
                  :disabled="selectedTable.splitPayment.people.some(p => p.status === 'paid')"
                  class="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-500 disabled:text-slate-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar división
                </button>
                <p v-if="selectedTable.splitPayment.people.some(p => p.status === 'paid')" class="text-[10px] text-slate-400 font-semibold italic text-right leading-tight flex-1">
                  No se puede cancelar la división porque ya existen pagos registrados.
                </p>
              </div>
            </div>
          </div>
          <span v-if="paymentAmountInputError" class="text-[10px] text-red-500 font-bold block text-center mt-2">{{ paymentAmountInputError }}</span>
        </div>

        <!-- REGULAR CHECKOUT (When no splitPayment is active) -->
        <div v-else class="space-y-6">
          <!-- Discount Editor Panel (Only before payments and splits) -->
          <div v-if="selectedTable" class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-xs">
            <!-- Discount Form -->
            <div v-if="showDiscountForm" class="space-y-3 animate-in fade-in duration-200">
              <h4 class="font-bold text-[#08071A] flex items-center gap-1.5 font-outfit">
                <i class="pi pi-tag text-[#9235DF]"></i>
                <span>Configurar Descuento</span>
              </h4>

              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="discountFormType = 'percentage'"
                  :class="['py-2 text-center text-[10px] font-bold rounded-xl border transition-all cursor-pointer',
                    discountFormType === 'percentage' ? 'bg-[#9235DF]/10 text-[#9235DF] border-[#9235DF]/30' : 'bg-white text-slate-500 border-slate-200']"
                >
                  Porcentaje (%)
                </button>
                <button
                  type="button"
                  @click="discountFormType = 'fixed'"
                  :class="['py-2 text-center text-[10px] font-bold rounded-xl border transition-all cursor-pointer',
                    discountFormType === 'fixed' ? 'bg-[#9235DF]/10 text-[#9235DF] border-[#9235DF]/30' : 'bg-white text-slate-500 border-slate-200']"
                >
                  Importe Fijo (€)
                </button>
              </div>

              <div class="space-y-1">
                <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {{ discountFormType === 'percentage' ? 'Porcentaje de descuento' : 'Importe de descuento (€)' }}
                </label>
                <input
                  type="text"
                  v-model="discountFormValue"
                  :placeholder="discountFormType === 'percentage' ? 'Ej: 10' : 'Ej: 5.50'"
                  class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#9235DF] text-[#08071A]"
                />
              </div>

              <div class="space-y-1">
                <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Motivo</label>
                <select
                  v-model="discountFormReason"
                  class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#9235DF] text-[#08071A]"
                >
                  <option value="cortesia">Cortesía</option>
                  <option value="incidencia">Incidencia</option>
                  <option value="promocion">Promoción</option>
                  <option value="empleado">Empleado</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Detalle del motivo <span v-if="discountFormReason === 'otro'" class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  v-model="discountFormReasonDetails"
                  placeholder="Ej: Plato frío / Invitación cliente habitual"
                  class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#9235DF] text-[#08071A]"
                />
              </div>

              <span v-if="discountFormError" class="text-[10px] text-red-500 font-bold block">{{ discountFormError }}</span>

              <div class="flex gap-2 pt-1">
                <button
                  type="button"
                  @click="handleApplyDiscount"
                  class="flex-1 py-2 bg-[#9235DF] hover:bg-[#9235DF]/95 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Aplicar
                </button>
                <button
                  type="button"
                  @click="showDiscountForm = false"
                  class="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>

            <!-- Active Discount Display / Action Trigger -->
            <div v-else>
              <div v-if="selectedTable.discount" class="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                <div class="space-y-0.5">
                  <p class="font-bold text-[#08071A]">Descuento Aplicado</p>
                  <p class="text-[10px] text-slate-400">
                    {{ selectedTable.discount.type === 'percentage' ? selectedTable.discount.percentage + '%' : (selectedTable.discount.valueCents / 100).toFixed(2) + ' €' }}
                    • Motivo: <span class="font-semibold text-slate-600 uppercase text-[9px]">{{ selectedTable.discount.reason }}</span>
                  </p>
                  <p v-if="selectedTable.discount.reasonDetails" class="text-[9px] text-slate-400 italic">
                    "{{ selectedTable.discount.reasonDetails }}"
                  </p>
                </div>
                <div v-if="!hasPartialPayments" class="flex gap-1">
                  <button
                    type="button"
                    @click="triggerReplaceDiscount"
                    class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    Sustituir
                  </button>
                  <button
                    type="button"
                    @click="handleRemoveDiscount"
                    class="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
                <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <i class="pi pi-lock"></i>
                  <span>Congelado</span>
                </span>
              </div>
              <div v-else-if="!hasPartialPayments">
                <button
                  type="button"
                  @click="triggerAddDiscount"
                  class="w-full py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 hover:border-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <i class="pi pi-tag text-[#9235DF]"></i>
                  <span>Aplicar Descuento / Cortesía</span>
                </button>
              </div>
              <div v-else class="text-center text-[10px] text-slate-400 font-semibold italic">
                No se pueden aplicar descuentos con pagos activos.
              </div>
            </div>
          </div>

          <!-- Cortesía Total Check vs Normal Checkout Toggles -->
          <div v-if="selectedTable && mesasStore.getTableNetTotalCents(selectedTable.id) === 0" class="space-y-4">
            <div class="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-center space-y-3">
              <i class="pi pi-gift text-2xl text-[#9235DF]"></i>
              <h4 class="text-xs font-bold text-[#08071A] uppercase font-outfit">Cortesía Total Activada</h4>
              <p class="text-[11px] text-slate-500 leading-tight">
                El total neto de esta mesa es 0,00 € debido a un descuento de cortesía del 100%. La mesa se cerrará liberando el estado y descontando el stock del inventario sin registrar cobros monetarios.
              </p>

              <div v-if="!complimentaryConfirmActive" class="pt-2">
                <button
                  type="button"
                  @click="complimentaryConfirmActive = true"
                  class="w-full py-2.5 bg-[#9235DF] hover:bg-[#9235DF]/95 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  Completar cortesía
                </button>
              </div>
              <div v-else class="p-3 bg-white rounded-xl border border-slate-100 space-y-3 animate-in fade-in duration-200">
                <p class="text-[10px] text-slate-700 font-bold leading-tight">
                  ¿Estás seguro de completar la cortesía total?
                </p>
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="handleCompleteComplimentary"
                    class="flex-1 py-2 bg-[#9235DF] hover:bg-[#9235DF]/95 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Sí, cerrar mesa
                  </button>
                  <button
                    type="button"
                    @click="complimentaryConfirmActive = false"
                    class="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="space-y-6">
            <!-- Tab toggles for complete vs partial vs split payment mode -->
            <div class="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                @click="checkoutTab = 'complete'; paymentAmountInputError = ''"
                :class="['flex-1 py-1.5 text-center text-[10px] sm:text-xs font-bold rounded-lg transition-all', checkoutTab === 'complete' ? 'bg-white text-[#9235DF] shadow-sm' : 'text-slate-500 hover:text-slate-700']"
              >
                Pagar Completo
              </button>
              <button
                type="button"
                @click="checkoutTab = 'partial'; paymentAmountInputError = ''"
                :class="['flex-1 py-1.5 text-center text-[10px] sm:text-xs font-bold rounded-lg transition-all', checkoutTab === 'partial' ? 'bg-white text-[#9235DF] shadow-sm' : 'text-slate-500 hover:text-slate-700']"
              >
                Pago Parcial
              </button>
              <button
                type="button"
                :disabled="hasPartialPayments"
                @click="checkoutTab = 'split'; paymentAmountInputError = ''"
                :class="['flex-1 py-1.5 text-center text-[10px] sm:text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed', checkoutTab === 'split' ? 'bg-white text-[#9235DF] shadow-sm' : 'text-slate-500 hover:text-slate-700']"
              >
                Dividir Mesa
              </button>
            </div>

            <!-- Mode content -->
            <div v-if="checkoutTab === 'complete'" class="space-y-4">
              <p class="text-[11px] text-slate-400 text-center">Pulse el método para saldar la cuenta restante por completo.</p>
              <div v-if="!(bizumVerificationActive && bizumVerificationType === 'complete')" class="grid grid-cols-3 gap-3">
                <button
                  @click="handleDirectPayment('card')"
                  class="flex flex-col items-center gap-3 p-3 bg-slate-50 hover:bg-[#9235DF]/5 border border-slate-100 hover:border-[#9235DF]/20 rounded-2xl cursor-pointer transition-all active:scale-95 group"
                >
                  <div class="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                    <i class="pi pi-credit-card"></i>
                  </div>
                  <span class="text-[10px] font-bold text-slate-600 group-hover:text-[#9235DF]">Tarjeta</span>
                </button>
                <button
                  @click="handleDirectPayment('cash')"
                  class="flex flex-col items-center gap-3 p-3 bg-slate-50 hover:bg-[#9235DF]/5 border border-slate-100 hover:border-[#9235DF]/20 rounded-2xl cursor-pointer transition-all active:scale-95 group"
                >
                  <div class="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                    <i class="pi pi-wallet"></i>
                  </div>
                  <span class="text-[10px] font-bold text-slate-600 group-hover:text-[#9235DF]">Efectivo</span>
                </button>
                <button
                  @click="bizumVerificationType = 'complete'; bizumVerificationActive = true"
                  class="flex flex-col items-center gap-3 p-3 bg-slate-50 hover:bg-[#9235DF]/5 border border-slate-100 hover:border-[#9235DF]/20 rounded-2xl cursor-pointer transition-all active:scale-95 group"
                >
                  <div class="w-9 h-9 rounded-full bg-[#9235DF]/10 text-[#9235DF] flex items-center justify-center border border-[#9235DF]/20 group-hover:scale-105 transition-transform">
                    <i class="pi pi-mobile"></i>
                  </div>
                  <span class="text-[10px] font-bold text-slate-600 group-hover:text-[#9235DF]">Bizum</span>
                </button>
              </div>

              <!-- Bizum Manual Verification sub-card -->
              <div v-else class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                <p class="text-xs font-semibold text-slate-700 text-center leading-tight">
                  Confirma que has verificado la recepción del Bizum antes de continuar.
                </p>
                <div class="flex gap-2">
                  <button
                    @click="handleDirectPayment('bizum', true); resetBizum()"
                    class="flex-1 py-2 bg-[#9235DF] hover:bg-[#9235DF]/95 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                  >
                    Confirmar cobro
                  </button>
                  <button
                    @click="resetBizum"
                    class="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>

            <div v-else-if="checkoutTab === 'partial'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Importe a Pagar (€)</label>
                <input
                  type="text"
                  v-model="paymentAmountInput"
                  :disabled="bizumVerificationActive && bizumVerificationType === 'partial'"
                  placeholder="Ej: 20.50"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#9235DF] text-[#08071A] disabled:opacity-50"
                />
                <span v-if="paymentAmountInputError" class="text-[10px] text-red-500 font-bold block">{{ paymentAmountInputError }}</span>
              </div>

              <div v-if="!(bizumVerificationActive && bizumVerificationType === 'partial')" class="grid grid-cols-3 gap-3">
                <button
                  @click="handleCustomPayment('card')"
                  class="flex flex-col items-center gap-3 p-3 bg-slate-50 hover:bg-[#9235DF]/5 border border-slate-100 hover:border-[#9235DF]/20 rounded-2xl cursor-pointer transition-all active:scale-95 group"
                >
                  <div class="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                    <i class="pi pi-credit-card"></i>
                  </div>
                  <span class="text-[10px] font-bold text-slate-600 group-hover:text-[#9235DF]">Tarjeta</span>
                </button>
                <button
                  @click="handleCustomPayment('cash')"
                  class="flex flex-col items-center gap-3 p-3 bg-slate-50 hover:bg-[#9235DF]/5 border border-slate-100 hover:border-[#9235DF]/20 rounded-2xl cursor-pointer transition-all active:scale-95 group"
                >
                  <div class="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                    <i class="pi pi-wallet"></i>
                  </div>
                  <span class="text-[10px] font-bold text-slate-600 group-hover:text-[#9235DF]">Efectivo</span>
                </button>
                <button
                  @click="triggerPartialBizum"
                  class="flex flex-col items-center gap-3 p-3 bg-slate-50 hover:bg-[#9235DF]/5 border border-slate-100 hover:border-[#9235DF]/20 rounded-2xl cursor-pointer transition-all active:scale-95 group"
                >
                  <div class="w-9 h-9 rounded-full bg-[#9235DF]/10 text-[#9235DF] flex items-center justify-center border border-[#9235DF]/20 group-hover:scale-105 transition-transform">
                    <i class="pi pi-mobile"></i>
                  </div>
                  <span class="text-[10px] font-bold text-slate-600 group-hover:text-[#9235DF]">Bizum</span>
                </button>
              </div>

              <!-- Bizum Manual Verification sub-card -->
              <div v-else class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                <p class="text-xs font-semibold text-slate-700 text-center leading-tight">
                  Confirma que has verificado la recepción del Bizum antes de continuar.
                </p>
                <div class="flex gap-2">
                  <button
                    @click="handleCustomPayment('bizum', true); resetBizum()"
                    class="flex-1 py-2 bg-[#9235DF] hover:bg-[#9235DF]/95 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                  >
                    Confirmar cobro
                  </button>
                  <button
                    @click="resetBizum"
                    class="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>

            <div v-else-if="checkoutTab === 'split'" class="space-y-4">
              <div v-if="hasPartialPayments" class="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-[11px] text-amber-700 font-semibold">
                No se puede dividir la cuenta porque ya tiene pagos registrados.
              </div>
              <div v-else class="space-y-4">
                <!-- Split Mode Switcher -->
                <div class="flex bg-slate-100 p-1 rounded-xl mb-2">
                  <button
                    type="button"
                    @click="splitModeInput = 'equal'; paymentAmountInputError = ''"
                    :class="['flex-1 py-1 text-center text-[10px] font-bold rounded-lg transition-all', splitModeInput === 'equal' ? 'bg-white text-[#9235DF] shadow-sm' : 'text-slate-500 hover:text-slate-700']"
                  >
                    A partes iguales
                  </button>
                  <button
                    type="button"
                    @click="splitModeInput = 'products'; paymentAmountInputError = ''"
                    :class="['flex-1 py-1 text-center text-[10px] font-bold rounded-lg transition-all', splitModeInput === 'products' ? 'bg-white text-[#9235DF] shadow-sm' : 'text-slate-500 hover:text-slate-700']"
                  >
                    Por productos
                  </button>
                </div>

                <p class="text-[11px] text-slate-400 text-center">
                  {{ splitModeInput === 'equal' ? 'Seleccione el número de personas para dividir la cuenta a partes iguales.' : 'Seleccione el número de personas para distribuir los productos.' }}
                </p>

                <div class="flex items-center justify-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <button
                    type="button"
                    @click="decrementPeopleCount"
                    :disabled="splitPeopleInput <= 2"
                    class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
                  >
                    <i class="pi pi-minus text-xs"></i>
                  </button>
                  <span class="text-lg font-black text-slate-800 w-8 text-center">{{ splitPeopleInput }}</span>
                  <button
                    type="button"
                    @click="incrementPeopleCount"
                    :disabled="splitPeopleInput >= 20"
                    class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
                  >
                    <i class="pi pi-plus text-xs"></i>
                  </button>
                </div>

                <button
                  type="button"
                  @click="handleCreateSplit"
                  class="w-full py-2.5 bg-[#9235DF] hover:bg-[#9235DF]/95 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  Confirmar División
                </button>
                <span v-if="paymentAmountInputError" class="text-[10px] text-red-500 font-bold block text-center">{{ paymentAmountInputError }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MOVE ACCOUNT MODAL (2.8C) -->
    <div
      v-if="showMoveAccountModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          @click="showMoveAccountModal = false"
          class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <h3 class="text-xl font-bold text-[#08071A] flex items-center gap-2 font-outfit">
          <i class="pi pi-arrow-right-arrow-left text-[#9235DF]"></i>
          <span>Mover cuenta</span>
        </h3>

        <p class="text-xs text-slate-400">
          Selecciona el nuevo punto de servicio para mover la cuenta de <span class="font-bold text-slate-700">{{ selectedTableLabel }}</span>. Los pedidos y comandas conservarán su estado actual.
        </p>

        <!-- Destination selection container -->
        <div class="max-h-72 overflow-y-auto space-y-4 pr-1">
          <!-- Non-empty destinations layout -->
          <template v-if="validDestinations.length > 0">
            <!-- Active zones -->
            <div v-for="zone in visibleZones" :key="zone.id" class="space-y-2">
              <h4 v-if="validDestinations.some(t => t.resolvedZoneId === zone.id)" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {{ zone.name }}
              </h4>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="targetTable in validDestinations.filter(t => t.resolvedZoneId === zone.id)"
                  :key="targetTable.id"
                  type="button"
                  @click="selectedTargetTableId = targetTable.id"
                  :class="[
                    'px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center',
                    selectedTargetTableId === targetTable.id
                      ? 'bg-[#9235DF]/10 border-[#9235DF] text-[#9235DF] font-extrabold ring-1 ring-[#9235DF]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  ]"
                >
                  {{ getServicePointLabel(targetTable) }}
                </button>
              </div>
            </div>

            <!-- Legacy (Sin zona) -->
            <div v-if="validDestinations.some(t => t.resolvedZoneId === 'legacy')" class="space-y-2">
              <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin zona</h4>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="targetTable in validDestinations.filter(t => t.resolvedZoneId === 'legacy')"
                  :key="targetTable.id"
                  type="button"
                  @click="selectedTargetTableId = targetTable.id"
                  :class="[
                    'px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center',
                    selectedTargetTableId === targetTable.id
                      ? 'bg-[#9235DF]/10 border-[#9235DF] text-[#9235DF] font-extrabold ring-1 ring-[#9235DF]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  ]"
                >
                  {{ getServicePointLabel(targetTable) }}
                </button>
              </div>
            </div>
          </template>

          <!-- Empty destinations layout -->
          <div v-else class="text-center py-6 text-slate-400 space-y-1">
            <i class="pi pi-info-circle text-lg"></i>
            <p class="text-xs font-medium">No hay puntos de servicio libres disponibles para el traslado.</p>
          </div>
        </div>

        <!-- Confirmation preview box -->
        <div v-if="selectedTargetTableId" class="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-slate-600 space-y-1.5 animate-in fade-in duration-200">
          <p class="font-bold text-[#08071A]">¿Mover la cuenta de {{ selectedTableLabel }} a {{ getTargetTableLabel(selectedTargetTableId) }}?</p>
          <p class="text-[11px] text-slate-500">Se trasladarán {{ selectedTable?.orders.length }} productos. Los pedidos y comandas conservarán su estado actual.</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="showMoveAccountModal = false; selectedTargetTableId = null"
            class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="!selectedTargetTableId"
            @click="executeTableMove"
            class="flex-1 py-2.5 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmar traslado
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useMesasStore, type Table, type NormalizedTable, type PaymentMethod, type DiscountReason } from '../stores/mesas'
import { useCartaStore, type MenuItem } from '../stores/carta'
import { useLocalesStore } from '../stores/locales'

const mesasStore = useMesasStore()
const localesStore = useLocalesStore()
const cartaStore = useCartaStore()

const selectedTable = ref<Table | null>(null)
const showCheckoutDialog = ref(false)
const showReadyWarningModal = ref(false)
const activeCategory = ref<string>('all')
const showReleaseWarning = ref(false)
const warningMessage = ref('')
const warningType = ref<'success' | 'error'>('error')

const showDiscountForm = ref(false)
const discountFormType = ref<'percentage' | 'fixed'>('percentage')
const discountFormValue = ref('')
const discountFormReason = ref<DiscountReason>('cortesia')
const discountFormReasonDetails = ref('')
const discountFormError = ref('')
const complimentaryConfirmActive = ref(false)

const hasPartialPayments = computed(() => {
  if (!selectedTable.value) return false
  return (selectedTable.value.partialPayments?.length ?? 0) > 0
})

const hasActiveSplit = computed(() => {
  return !!selectedTable.value?.splitPayment
})

const checkoutTab = ref<'complete' | 'partial' | 'split'>('complete')
const splitModeInput = ref<'equal' | 'products'>('equal')
const splitPeopleInput = ref(2)
const processingShareId = ref<string | null>(null)
const activeShareToPay = ref<any | null>(null)

const processingPersonId = ref<string | null>(null)
const activePersonToPay = ref<any | null>(null)

const bizumVerificationActive = ref(false)
const bizumVerificationType = ref<'complete' | 'partial' | 'share' | 'person' | null>(null)
const resetBizum = () => {
  bizumVerificationActive.value = false
  bizumVerificationType.value = null
}

const decrementPeopleCount = () => {
  if (splitPeopleInput.value > 2) {
    splitPeopleInput.value--
  }
}

const incrementPeopleCount = () => {
  if (splitPeopleInput.value < 20) {
    splitPeopleInput.value++
  }
}

const handleCreateSplit = () => {
  if (!selectedTable.value) return
  paymentAmountInputError.value = ''

  if (splitModeInput.value === 'products') {
    handleCreateProductSplit()
    return
  }

  const res = mesasStore.createEqualSplit(selectedTable.value.id, splitPeopleInput.value)
  if (res.success) {
    const updated = mesasStore.tables.find(t => t.id === selectedTable.value?.id)
    if (updated) {
      selectedTable.value = updated
    }
  } else {
    if (res.reason === 'existing_partial_payments') {
      paymentAmountInputError.value = 'No se puede dividir la cuenta porque ya tiene pagos registrados.'
    } else if (res.reason === 'too_many_people') {
      paymentAmountInputError.value = 'El límite máximo de personas es 20.'
    } else if (res.reason === 'people_exceeds_cents') {
      paymentAmountInputError.value = 'El número de personas supera el importe disponible en céntimos.'
    } else {
      paymentAmountInputError.value = `Error al crear la división: ${res.reason}`
    }
  }
}

const parseFixedDiscountInput = (val: string): { cents: number; error?: string } => {
  const clean = val.trim()
  if (!clean) return { cents: 0, error: 'Introduzca un importe.' }

  const match = clean.match(/^(\d+)(?:[.,](\d{1,2}))?$/)
  if (!match) {
    return { cents: 0, error: 'Formato incorrecto. Ej: 5.50 o 5,50' }
  }

  const euros = parseInt(match[1], 10)
  let cents = 0
  if (match[2]) {
    cents = parseInt(match[2].padEnd(2, '0'), 10)
  }

  const totalCents = euros * 100 + cents
  if (totalCents <= 0) {
    return { cents: 0, error: 'El descuento debe ser mayor que cero.' }
  }

  return { cents: totalCents }
}

const handleApplyDiscount = () => {
  if (!selectedTable.value) return
  discountFormError.value = ''

  if (discountFormReason.value === 'otro' && !discountFormReasonDetails.value.trim()) {
    discountFormError.value = 'El detalle del motivo es obligatorio para "Otro".'
    return
  }

  let valNum = 0
  if (discountFormType.value === 'percentage') {
    const parsed = parseInt(discountFormValue.value.trim(), 10)
    if (isNaN(parsed) || parsed < 1 || parsed > 100 || String(parsed) !== discountFormValue.value.trim()) {
      discountFormError.value = 'El porcentaje debe ser un entero entre 1 y 100.'
      return
    }
    valNum = parsed
  } else {
    const parsed = parseFixedDiscountInput(discountFormValue.value)
    if (parsed.error) {
      discountFormError.value = parsed.error
      return
    }
    valNum = parsed.cents
  }

  const res = mesasStore.applyTableDiscount({
    tableId: selectedTable.value.id,
    type: discountFormType.value,
    value: valNum,
    reason: discountFormReason.value,
    reasonDetails: discountFormReasonDetails.value.trim() || undefined
  })

  if (res.success) {
    showDiscountForm.value = false
    const updated = mesasStore.tables.find(t => t.id === selectedTable.value?.id)
    if (updated) selectedTable.value = updated
  } else {
    discountFormError.value = `Error: ${res.reason}`
  }
}

const handleRemoveDiscount = () => {
  if (!selectedTable.value) return
  const res = mesasStore.removeTableDiscount(selectedTable.value.id)
  if (res.success) {
    showDiscountForm.value = false
    const updated = mesasStore.tables.find(t => t.id === selectedTable.value?.id)
    if (updated) selectedTable.value = updated
  }
}

const triggerAddDiscount = () => {
  discountFormValue.value = ''
  discountFormReason.value = 'cortesia'
  discountFormReasonDetails.value = ''
  discountFormError.value = ''
  showDiscountForm.value = true
}

const triggerReplaceDiscount = () => {
  if (!selectedTable.value || !selectedTable.value.discount) return
  const disc = selectedTable.value.discount
  discountFormType.value = disc.type
  if (disc.type === 'percentage') {
    discountFormValue.value = String(disc.percentage)
  } else {
    discountFormValue.value = (disc.valueCents / 100).toFixed(2).replace('.', ',')
  }
  discountFormReason.value = disc.reason
  discountFormReasonDetails.value = disc.reasonDetails || ''
  discountFormError.value = ''
  showDiscountForm.value = true
}

const handleCompleteComplimentary = () => {
  if (!selectedTable.value) return
  const res = mesasStore.completeComplimentaryTable(selectedTable.value.id)
  if (res.success) {
    showCheckoutDialog.value = false
    selectedTable.value = null
    showReleaseWarning.value = false
    complimentaryConfirmActive.value = false
  } else {
    paymentAmountInputError.value = `Error en cortesía: ${res.reason}`
  }
}

const handleCreateProductSplit = () => {
  if (!selectedTable.value) return
  paymentAmountInputError.value = ''

  const res = mesasStore.createProductSplit(selectedTable.value.id, splitPeopleInput.value)
  if (res.success) {
    const updated = mesasStore.tables.find(t => t.id === selectedTable.value?.id)
    if (updated) {
      selectedTable.value = updated
    }
  } else {
    paymentAmountInputError.value = `Error al crear la división: ${res.reason}`
  }
}

const handleAssignProduct = (personId: string, orderItemId: string, qty: number) => {
  if (!selectedTable.value) return
  paymentAmountInputError.value = ''
  const res = mesasStore.assignProductQuantity({
    tableId: selectedTable.value.id,
    personId,
    orderItemId,
    quantity: qty
  })
  if (res.success) {
    const updated = mesasStore.tables.find(t => t.id === selectedTable.value?.id)
    if (updated) selectedTable.value = updated
  } else {
    paymentAmountInputError.value = `Error al asignar: ${res.reason}`
  }
}

const handleUnassignProduct = (personId: string, orderItemId: string, qty: number) => {
  if (!selectedTable.value) return
  paymentAmountInputError.value = ''
  const res = mesasStore.unassignProductQuantity({
    tableId: selectedTable.value.id,
    personId,
    orderItemId,
    quantity: qty
  })
  if (res.success) {
    const updated = mesasStore.tables.find(t => t.id === selectedTable.value?.id)
    if (updated) selectedTable.value = updated
  } else {
    paymentAmountInputError.value = `Error al desasignar: ${res.reason}`
  }
}

const handleConfirmProductSplit = () => {
  if (!selectedTable.value) return
  paymentAmountInputError.value = ''
  const res = mesasStore.confirmProductSplit(selectedTable.value.id)
  if (res.success) {
    const updated = mesasStore.tables.find(t => t.id === selectedTable.value?.id)
    if (updated) selectedTable.value = updated
  } else {
    if (res.reason === 'unassigned_products') {
      paymentAmountInputError.value = 'Quedan productos pendientes de asignar.'
    } else if (res.reason === 'person_has_no_allocations') {
      paymentAmountInputError.value = 'Todas las personas deben tener al menos un producto asignado.'
    } else {
      paymentAmountInputError.value = `Error al confirmar: ${res.reason}`
    }
  }
}

const triggerPartialBizum = () => {
  paymentAmountInputError.value = ''
  const parseRes = parseAmountInput(paymentAmountInput.value)
  if (parseRes.error) {
    paymentAmountInputError.value = parseRes.error
    return
  }
  bizumVerificationType.value = 'partial'
  bizumVerificationActive.value = true
}

const handleCancelProductSplit = () => {
  if (!selectedTable.value) return
  paymentAmountInputError.value = ''
  const res = mesasStore.cancelProductSplit(selectedTable.value.id)
  if (res.success) {
    const updated = mesasStore.tables.find(t => t.id === selectedTable.value?.id)
    if (updated) selectedTable.value = updated
  } else {
    paymentAmountInputError.value = `Error al cancelar: ${res.reason}`
  }
}

const startPayPerson = (person: any) => {
  resetBizum()
  activePersonToPay.value = person
}

const confirmPayPerson = (method: PaymentMethod, verifiedManually?: boolean) => {
  if (!selectedTable.value || !activePersonToPay.value) return
  const personId = activePersonToPay.value.id
  processingPersonId.value = personId

  const res = mesasStore.payProductSplitPerson({
    tableId: selectedTable.value.id,
    personId,
    method,
    verifiedManually
  })

  setTimeout(() => {
    processingPersonId.value = null
    activePersonToPay.value = null

    if (res.success) {
      if (res.isFullyPaid) {
        showCheckoutDialog.value = false
        selectedTable.value = null
      } else {
        const updated = mesasStore.tables.find(t => t.id === selectedTable.value?.id)
        if (updated) {
          selectedTable.value = updated
        }
      }
    } else {
      paymentAmountInputError.value = `Error en el pago: ${res.reason}`
    }
  }, 200)
}

const startPayShare = (share: any) => {
  resetBizum()
  activeShareToPay.value = share
}

const confirmPayShare = (method: PaymentMethod, verifiedManually?: boolean) => {
  if (!selectedTable.value || !activeShareToPay.value) return
  const shareId = activeShareToPay.value.id
  processingShareId.value = shareId

  const res = mesasStore.paySplitShare({
    tableId: selectedTable.value.id,
    shareId,
    method,
    verifiedManually
  })

  setTimeout(() => {
    processingShareId.value = null
    activeShareToPay.value = null

    if (res.success) {
      if (res.isFullyPaid) {
        showCheckoutDialog.value = false
        selectedTable.value = null
      } else {
        const updated = mesasStore.tables.find(t => t.id === selectedTable.value?.id)
        if (updated) {
          selectedTable.value = updated
        }
      }
    } else {
      paymentAmountInputError.value = `Error en el pago: ${res.reason}`
    }
  }, 200)
}

const handleCancelSplit = () => {
  if (!selectedTable.value) return
  paymentAmountInputError.value = ''

  if (selectedTable.value.splitPayment?.mode === 'products') {
    handleCancelProductSplit()
    return
  }

  const res = mesasStore.cancelEqualSplit(selectedTable.value.id)
  if (res.success) {
    const updated = mesasStore.tables.find(t => t.id === selectedTable.value?.id)
    if (updated) {
      selectedTable.value = updated
    }
  } else {
    paymentAmountInputError.value = `Error al cancelar: ${res.reason}`
  }
}

const isPartialMode = ref(false)
const paymentAmountInput = ref('')
const paymentAmountInputError = ref('')

watch(showReleaseWarning, (newVal) => {
  if (!newVal) {
    warningType.value = 'error'
  }
})

watch(selectedTable, () => {
  showReleaseWarning.value = false
  warningType.value = 'error'
  isPartialMode.value = false
  paymentAmountInput.value = ''
  paymentAmountInputError.value = ''
  resetBizum()

  showDiscountForm.value = false
  discountFormValue.value = ''
  discountFormReason.value = 'cortesia'
  discountFormReasonDetails.value = ''
  discountFormError.value = ''
  complimentaryConfirmActive.value = false
})

watch(checkoutTab, () => {
  resetBizum()
})

// Interactive Ficha Modal states
const showFichaModal = ref(false)
const activeFichaTable = ref<Table | null>(null)

// Design & Drag state hooks
const isDesignMode = ref(false)
const blockedTableIds = ref<string[]>(['t12']) // Mesa 12 starts as blocked

// FLOW OF ORDERS PRO STATES (SPRINT 3)
const isOrdering = ref(false)
const activeOrderingTable = ref<Table | null>(null)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const addedFeedbackId = ref<string | null>(null)

// Modifiers Panel States
const showModifiersModal = ref(false)
const activeModifierItem = ref<MenuItem | null>(null)
const selectedModifiers = ref<string[]>([])
const customModifierNote = ref('')

// Send Confirmation Dialog States
const showSendConfirmModal = ref(false)

const selectedZoneId = ref<string>('all')

const allNormalizedTables = computed(() =>
  mesasStore.getNormalizedTables()
)

const currentLocationTables = computed(() =>
  allNormalizedTables.value.filter(table =>
    table.resolvedLocationId === localesStore.activeLocaleId
  )
)

const legacyTables = computed(() =>
  allNormalizedTables.value.filter(table =>
    table.resolvedLocationId === undefined ||
    table.resolvedZoneId === 'legacy'
  )
)

const allVisibleLocationTables = computed(() => [
  ...currentLocationTables.value,
  ...legacyTables.value.filter(
    legacy =>
      !currentLocationTables.value.some(table => table.id === legacy.id)
  )
])

const visibleZones = computed(() =>
  [...mesasStore.getServiceZones(localesStore.activeLocaleId)]
    .sort((a, b) => a.order - b.order)
)

const visibleTables = computed(() => {
  if (selectedZoneId.value === 'all') {
    return allVisibleLocationTables.value
  }

  if (selectedZoneId.value === 'legacy') {
    return legacyTables.value
  }

  return currentLocationTables.value.filter(
    table => table.resolvedZoneId === selectedZoneId.value
  )
})

const isZoneChangeBlocked = computed(() =>
  showCheckoutDialog.value ||
  showFichaModal.value ||
  showModifiersModal.value ||
  showSendConfirmModal.value ||
  showMoveAccountModal.value
)

const getServicePointLabel = (table: NormalizedTable) =>
  table.resolvedType === 'bar'
    ? `Barra ${table.number}`
    : `M-${table.number}`

const selectNormalizedTable = (table: NormalizedTable) => {
  const realTable = mesasStore.tables.find(item => item.id === table.id)
  if (!realTable) return
  selectTable(realTable)
}

const openFichaModalNormalized = (table: NormalizedTable) => {
  const realTable = mesasStore.tables.find(item => item.id === table.id)
  if (!realTable) return
  openFichaModal(realTable)
}

function changeZone(zoneId: string) {
  if (isZoneChangeBlocked.value) return
  selectedZoneId.value = zoneId
  selectedTable.value = null
  basket.value = []
  isOrdering.value = false
  activeOrderingTable.value = null
}

const showMoveAccountModal = ref(false)
const selectedTargetTableId = ref<string | null>(null)

const validDestinations = computed(() => {
  if (!selectedTable.value) return []
  return allNormalizedTables.value.filter(table =>
    table.id !== selectedTable.value?.id &&
    table.resolvedLocationId !== undefined &&
    table.resolvedLocationId === selectedTable.value?.locationId &&
    table.resolvedActive === true &&
    table.status === 'free' &&
    table.orders.length === 0 &&
    !blockedTableIds.value.includes(table.id)
  )
})

const getMoveErrorMsg = (reason?: string) => {
  switch (reason) {
    case 'source_not_found': return 'La mesa de origen ya no existe.'
    case 'target_not_found': return 'La mesa de destino ya no existe.'
    case 'same_table': return 'Selecciona un destino diferente.'
    case 'unknown_location': return 'No se puede confirmar que ambas mesas pertenezcan al mismo local.'
    case 'different_location': return 'No se pueden mover cuentas entre locales distintos.'
    case 'source_free': return 'La mesa de origen no tiene una cuenta activa.'
    case 'source_not_transferable': return 'La cuenta de origen ya no puede trasladarse.'
    case 'target_reserved': return 'La mesa de destino está reservada.'
    case 'target_not_free': return 'La mesa de destino ya no está libre.'
    case 'target_has_orders': return 'La mesa destino conserva pedidos y no puede utilizarse.'
    case 'target_inactive': return 'El punto de servicio está inactivo.'
    case 'source_has_partial_payments': return 'La mesa de origen ya tiene pagos parciales registrados y no puede moverse.'
    case 'source_has_active_split': return 'La mesa de origen ya tiene una división activa y no puede moverse.'
    case 'table_not_found': return 'La mesa especificada no existe.'
    case 'table_has_no_orders': return 'La mesa no tiene ningún pedido activo.'
    case 'invalid_amount': return 'El importe especificado no es válido.'
    case 'amount_exceeds_remaining': return 'El importe especificado supera el pendiente de la cuenta.'
    case 'invalid_payment_method': return 'El método de pago seleccionado no es válido.'
    case 'already_paid': return 'La cuenta de esta mesa ya ha sido saldada.'
    default: return 'Ha ocurrido un error inesperado al mover la cuenta.'
  }
}

const executeTableMove = () => {
  if (!selectedTable.value || !selectedTargetTableId.value) return
  if (showCheckoutDialog.value) return

  const sourceId = selectedTable.value.id
  const targetId = selectedTargetTableId.value

  const res = mesasStore.moveTableAccount(sourceId, targetId)
  if (res.success) {
    showMoveAccountModal.value = false
    selectedTargetTableId.value = null

    // Reset current selection
    selectedTable.value = null
    basket.value = []
    isOrdering.value = false
    activeOrderingTable.value = null

    const targetMesa = mesasStore.tables.find(t => t.id === targetId)
    if (targetMesa) {
      const normTarget = allNormalizedTables.value.find(t => t.id === targetId)
      if (normTarget) {
        selectedZoneId.value = normTarget.resolvedZoneId
      }
      selectedTable.value = targetMesa
    }

    warningMessage.value = 'La cuenta se ha trasladado correctamente.'
    warningType.value = 'success'
    showReleaseWarning.value = true
  } else {
    warningMessage.value = getMoveErrorMsg(res.reason)
    warningType.value = 'error'
    showReleaseWarning.value = true
    showMoveAccountModal.value = false
  }
}

const selectedTableLabel = computed(() => {
  if (!selectedTable.value) return ''
  const norm = allNormalizedTables.value.find(t => t.id === selectedTable.value?.id)
  return norm ? getServicePointLabel(norm) : `M-${selectedTable.value.number}`
})

const getTargetTableLabel = (id: string) => {
  const target = allNormalizedTables.value.find(t => t.id === id)
  if (!target) return ''
  const zoneName = target.resolvedZoneId === 'legacy'
    ? 'Sin zona'
    : (visibleZones.value.find(z => z.id === target.resolvedZoneId)?.name || '')
  return `${zoneName} · ${getServicePointLabel(target)}`
}

const displayCategories = [
  { id: 'favoritos', name: 'Favoritos', icon: 'pi-star' },
  { id: 'tapas', name: 'Entrantes', icon: 'pi-apple' },
  { id: 'platos', name: 'Principales', icon: 'pi-bolt' },
  { id: 'postres', name: 'Postres', icon: 'pi-heart' },
  { id: 'bebidas', name: 'Bebidas', icon: 'pi-filter' },
  { id: 'vinos', name: 'Vinos', icon: 'pi-glass' },
  { id: 'cafes', name: 'Cafés', icon: 'pi-coffee' }
]

const standardModifiers = [
  { label: 'Sin cebolla', code: 'SC' },
  { label: 'Sin gluten', code: 'SG' },
  { label: 'Poco hecho', code: 'PH' },
  { label: 'Muy hecho', code: 'MH' },
  { label: 'Extra queso', code: 'EQ' },
  { label: 'Para compartir', code: 'PC' }
]

// Extended menu list including coffee and wine subsets (marked clearly as demo data)
const extendedMenuItems = computed(() => {
  const storeItems = cartaStore.menuItems.map(item => ({
    ...item,
    code: `P-${item.id.toUpperCase()}`,
    tags: item.category === 'bebidas' ? ['frío', 'bar'] : ['cocina', 'caliente']
  }))

  const demoItems = [
    { id: 'demo-c1', name: '[Demo] Café Solo', description: 'Café espresso intenso de grano selecto.', price: 1.5, category: 'cafes', allergens: [], available: true, code: 'D-CAF01', tags: ['caliente', 'café'] },
    { id: 'demo-c2', name: '[Demo] Café con Leche', description: 'Café espresso con leche cremosa.', price: 1.8, category: 'cafes', allergens: ['Lácteos'], available: true, code: 'D-CAF02', tags: ['caliente', 'café'] },
    { id: 'demo-c3', name: '[Demo] Café Cortado', description: 'Espresso corto cortado con leche.', price: 1.6, category: 'cafes', allergens: ['Lácteos'], available: true, code: 'D-CAF03', tags: ['caliente', 'café'] },
    { id: 'demo-w1', name: '[Demo] Copa Rioja Crianza', description: 'Vino tinto crianza D.O.Ca. Rioja.', price: 3.5, category: 'vinos', allergens: [], available: true, code: 'D-VIN01', tags: ['copa', 'vino'] },
    { id: 'demo-w2', name: '[Demo] Copa Rueda Verdejo', description: 'Vino blanco joven D.O. Rueda.', price: 3.2, category: 'vinos', allergens: [], available: true, code: 'D-VIN02', tags: ['copa', 'vino'] }
  ]

  return [...storeItems, ...demoItems]
})

// Favorite items selection
const favoriteItems = computed(() => {
  return extendedMenuItems.value.filter(item =>
    item.id === 'm1' || item.id === 'm2' || item.id === 'm4' || item.id === 'm7'
  )
})

// Immediate local filtering catalog items computed
const filteredCatalogItems = computed(() => {
  let items = extendedMenuItems.value.filter(item => {
    if (activeCategory.value === 'all') return true
    if (activeCategory.value === 'favoritos') {
      return item.id === 'm1' || item.id === 'm2' || item.id === 'm4' || item.id === 'm7'
    }
    return item.category === activeCategory.value
  })

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    items = items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return items
})

const getCategoryItemsCount = (catId: string): number => {
  return extendedMenuItems.value.filter(item => item.category === catId).length
}

// Shopping basket structure for adding menu items
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

// Start ordering dedicated page layout
const startOrdering = () => {
  if (selectedTable.value) {
    activeOrderingTable.value = selectedTable.value
    basket.value = []
    isOrdering.value = true
    activeCategory.value = 'all'
    searchQuery.value = ''
    showReleaseWarning.value = false
  }
}

const stopOrdering = () => {
  isOrdering.value = false
  activeOrderingTable.value = null
  basket.value = []
}

// Keyboard shortcuts for instant search
const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.key === '/' && document.activeElement !== searchInputRef.value) {
    event.preventDefault()
    if (searchInputRef.value) {
      searchInputRef.value.focus()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

// Add product to basket immediately
const addProductImmediate = (product: any) => {
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

  // Provide brief visual confirmation check
  addedFeedbackId.value = product.id
  setTimeout(() => {
    if (addedFeedbackId.value === product.id) {
      addedFeedbackId.value = null
    }
  }, 800)
}

// Open modifiers modal
const openModifiersModal = (product: any) => {
  if (!product) return
  activeModifierItem.value = product
  selectedModifiers.value = []
  customModifierNote.value = ''

  // Pre-fill modifiers if item is already in basket
  const basketRef = basket.value.find(item => item.menuItemId === product.id)
  if (basketRef && basketRef.notes) {
    const activeMods = basketRef.notes.split(', ')
    selectedModifiers.value = activeMods.filter(m =>
      standardModifiers.some(sm => sm.label === m)
    )
    customModifierNote.value = activeMods.filter(m =>
      !standardModifiers.some(sm => sm.label === m)
    ).join(', ')
  }

  showModifiersModal.value = true
}

const closeModifiersModal = () => {
  showModifiersModal.value = false
  activeModifierItem.value = null
}

const toggleModifier = (label: string) => {
  const index = selectedModifiers.value.indexOf(label)
  if (index > -1) {
    selectedModifiers.value.splice(index, 1)
  } else {
    selectedModifiers.value.push(label)
  }
}

const applyModifiers = () => {
  if (activeModifierItem.value) {
    const list = [...selectedModifiers.value]
    if (customModifierNote.value.trim()) {
      list.push(customModifierNote.value.trim())
    }
    const notesStr = list.join(', ')

    // If item already exists in basket, update its notes
    const existing = basket.value.find(item => item.menuItemId === activeModifierItem.value?.id)
    if (existing) {
      existing.notes = notesStr
    } else {
      basket.value.push({
        id: 'b-' + Math.random().toString(36).substr(2, 9),
        menuItemId: activeModifierItem.value.id,
        name: activeModifierItem.value.name,
        price: activeModifierItem.value.price,
        category: activeModifierItem.value.category,
        quantity: 1,
        notes: notesStr
      })
    }

    closeModifiersModal()
  }
}

const getCatalogItemRef = (menuItemId: string) => {
  return extendedMenuItems.value.find(item => item.id === menuItemId)
}

const getItemDestinationLabel = (category: string) => {
  return category === 'tapas' || category === 'platos' ? 'Cocina' : 'Barra'
}

const getItemModifiersList = (notes: string): string[] => {
  if (!notes) return []
  return notes.split(', ').filter(Boolean)
}

// Send Comanda flow
const triggerSendConfirm = () => {
  showSendConfirmModal.value = true
}

const getSendDestinationsCount = () => {
  let cocina = 0
  let barra = 0
  basket.value.forEach(item => {
    if (item.category === 'tapas' || item.category === 'platos') {
      cocina += item.quantity
    } else {
      barra += item.quantity
    }
  })
  return { cocina, barra }
}

const confirmSendComanda = () => {
  if (activeOrderingTable.value && basket.value.length > 0) {
    // Map custom demo categories to fit store type 'tapas' | 'platos' | 'bebidas' | 'postres'
    const itemsToSubmit = basket.value.map(item => {
      let storeCat: 'tapas' | 'platos' | 'bebidas' | 'postres' = 'bebidas'
      if (item.category === 'tapas') storeCat = 'tapas'
      else if (item.category === 'platos') storeCat = 'platos'
      else if (item.category === 'postres') storeCat = 'postres'

      return {
        id: item.menuItemId,
        name: item.name,
        price: item.price,
        category: storeCat,
        quantity: item.quantity,
        notes: item.notes.trim()
      }
    })

    mesasStore.addItemsToTableOrder(activeOrderingTable.value.id, itemsToSubmit)

    // Clear and exit ordering view back to tables map
    basket.value = []
    showSendConfirmModal.value = false
    isOrdering.value = false

    // Sync active references
    const updated = mesasStore.tables.find(t => t.id === activeOrderingTable.value?.id)
    if (updated) {
      selectedTable.value = updated
      activeOrderingTable.value = updated
    }
  }
}

const getTableServiceStatus = (table: Table) => {
  const orders = table.orders
  if (orders.length === 0) {
    return {
      text: 'Disponible',
      colorClass: 'bg-white border-slate-200 text-slate-700 hover:border-[#9235DF]/20',
      dotClass: '',
      showKitchenIcon: false,
      showBarIcon: false,
      showServedIcon: false,
      kitchenIconColor: 'text-slate-400',
      barIconColor: 'text-slate-400'
    }
  }

  const kitchenOrders = orders.filter(o => o.category !== 'bebidas')
  const barOrders = orders.filter(o => o.category === 'bebidas')

  const kPending = kitchenOrders.some(o => o.status === 'pending' || o.status === 'preparing')
  const kReady = kitchenOrders.some(o => o.status === 'ready')
  const kServed = kitchenOrders.length > 0 && kitchenOrders.every(o => o.status === 'served')

  const bPending = barOrders.some(o => o.status === 'pending' || o.status === 'preparing')
  const bReady = barOrders.some(o => o.status === 'ready')
  const bServed = barOrders.length > 0 && barOrders.every(o => o.status === 'served')

  // Determine the overall status and color of the table
  let text = 'Servicio en curso'
  let colorClass = 'bg-white border-teal-500 text-teal-700 hover:border-teal-600'
  let dotClass = 'bg-teal-500 animate-pulse'

  if (kPending && bPending) {
    text = 'Cocina + Barra pendientes'
    colorClass = 'bg-white border-purple-500 text-purple-700 hover:border-purple-600'
    dotClass = 'bg-purple-500 animate-pulse'
  } else if (kPending) {
    text = 'Cocina pendiente'
    colorClass = 'bg-white border-amber-500 text-amber-700 hover:border-amber-600'
    dotClass = 'bg-amber-500 animate-pulse'
  } else if (bPending) {
    text = 'Barra pendiente'
    colorClass = 'bg-white border-blue-500 text-blue-700 hover:border-blue-600'
    dotClass = 'bg-blue-500 animate-pulse'
  } else if (kReady && bReady) {
    text = 'Lista para servir'
    colorClass = 'bg-white border-emerald-500 text-emerald-700 hover:border-emerald-600 animate-bounce'
    dotClass = 'bg-emerald-500 animate-bounce'
  } else if (kReady) {
    text = 'Cocina lista'
    colorClass = 'bg-white border-emerald-450 text-emerald-700 hover:border-emerald-500'
    dotClass = 'bg-emerald-400 animate-pulse'
  } else if (bReady) {
    text = 'Bebidas listas'
    colorClass = 'bg-white border-emerald-450 text-emerald-700 hover:border-emerald-500'
    dotClass = 'bg-emerald-400 animate-pulse'
  } else if (kServed || bServed || orders.every(o => o.status === 'served')) {
    text = 'Servicio en curso'
    colorClass = 'bg-white border-teal-500 text-teal-700 hover:border-teal-600'
    dotClass = 'bg-teal-50'
  }

  // Visual status indicators on the table card itself (Flujo 6 & Sala requirements)
  const showKitchenIcon = kitchenOrders.length > 0
  const showBarIcon = barOrders.length > 0
  const showServedIcon = orders.every(o => o.status === 'served')

  // Colors for icons:
  // - Pending/Preparing: amber or blue
  // - Ready: emerald
  // - Served: slate (dimmed)
  const kitchenIconColor = kReady ? 'text-emerald-500' : kPending ? 'text-amber-500' : 'text-slate-400'
  const barIconColor = bReady ? 'text-emerald-500' : bPending ? 'text-blue-500' : 'text-slate-400'

  return {
    text,
    colorClass,
    dotClass,
    showKitchenIcon,
    showBarIcon,
    showServedIcon,
    kitchenIconColor,
    barIconColor
  }
}

// Metadata generator for tables visual shapes, waitstaff, and elapsed time
interface TableMetadata {
  shape: 'circle' | 'square' | 'rectangle' | 'barra' | 'terraza'
  zone: 'ventana' | 'interior' | 'barra' | 'terraza'
  waiter: string
  elapsedTime: string
}

const getTableMetadata = (table: Table): TableMetadata => {
  const waiterNames = ['Sofía', 'Mateo', 'Clara', 'Felipe']
  const waiter = waiterNames[table.number % waiterNames.length]

  let shape: 'circle' | 'square' | 'rectangle' | 'barra' | 'terraza' = 'square'
  let zone: 'ventana' | 'interior' | 'barra' | 'terraza' = 'interior'

  if (table.number >= 1 && table.number <= 3) {
    zone = 'ventana'
    shape = table.number === 2 ? 'circle' : 'square'
  } else if (table.number >= 4 && table.number <= 6) {
    zone = 'interior'
    shape = table.number === 4 ? 'rectangle' : table.number === 5 ? 'square' : 'circle'
  } else if (table.number >= 7 && table.number <= 9) {
    zone = 'barra'
    shape = 'barra'
  } else {
    zone = 'terraza'
    shape = 'terraza'
  }

  const elapsedTime = table.status !== 'free' ? `${(table.number * 8) + 12} min` : ''

  return { shape, zone, waiter, elapsedTime }
}

const selectTable = (table: Table) => {
  if (blockedTableIds.value.includes(table.id)) {
    warningMessage.value = `La Mesa ${table.number} está marcada como Bloqueada. Desbloquéala desde la Ficha Técnica (Doble Clic).`
    showReleaseWarning.value = true
    return
  }
  selectedTable.value = table
  basket.value = []
  showReleaseWarning.value = false
  showReadyWarningModal.value = false
}

const getTableTotal = (table: Table): number => {
  return table.orders.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

const updateStatus = () => {
  if (selectedTable.value) {
    const tableId = selectedTable.value.id
    const newStatus = selectedTable.value.status

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
  return getTableTotal(selectedTable.value)
})

// Calculate ready items count for a given table
const getTableReadyCount = (table: Table): number => {
  return table.orders
    .filter(o => o.status === 'ready')
    .reduce((sum, item) => sum + item.quantity, 0)
}

// Basket helpers
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

const markServed = (itemId: string) => {
  if (selectedTable.value) {
    mesasStore.updateOrderItemStatus(selectedTable.value.id, itemId, 'served')
  }
}

const tryCheckout = () => {
  if (!selectedTable.value) return
  if (selectedTable.value.orders.length === 0) return

  const { hasUnfinished, hasReadyUnserved } = mesasStore.canCheckoutTable(selectedTable.value.id)

  if (hasUnfinished) {
    warningMessage.value = 'No puedes cobrar esta mesa porque todavía hay productos pendientes o en preparación.'
    warningType.value = 'error'
    showReleaseWarning.value = true
    return
  }

  if (hasReadyUnserved) {
    showReadyWarningModal.value = true
    return
  }

  isPartialMode.value = false
  paymentAmountInput.value = ''
  paymentAmountInputError.value = ''
  checkoutTab.value = 'complete'
  splitPeopleInput.value = 2
  processingShareId.value = null
  activeShareToPay.value = null
  showCheckoutDialog.value = true
}

const proceedToCheckout = () => {
  showReadyWarningModal.value = false
  isPartialMode.value = false
  paymentAmountInput.value = ''
  paymentAmountInputError.value = ''
  checkoutTab.value = 'complete'
  splitPeopleInput.value = 2
  processingShareId.value = null
  activeShareToPay.value = null
  showCheckoutDialog.value = true
}

const parseAmountInput = (val: string): { cents: number; error?: string } => {
  const cleanVal = val.trim()
  if (!cleanVal) {
    return { cents: 0, error: 'Por favor, introduce un importe.' }
  }
  const regex = /^\d+(?:[.,]\d{1,2})?$/
  if (!regex.test(cleanVal)) {
    return { cents: 0, error: 'Formato inválido. Ejemplo: 20.50 o 20,50' }
  }

  const parts = cleanVal.split(/[.,]/)
  const euros = parseInt(parts[0], 10)
  const cents = parts[1] ? parseInt(parts[1].padEnd(2, '0').slice(0, 2), 10) : 0
  const totalCents = euros * 100 + cents

  if (totalCents <= 0) {
    return { cents: 0, error: 'El importe debe ser mayor que cero.' }
  }

  if (selectedTable.value) {
    const remainingCents = mesasStore.getTableRemainingCents(selectedTable.value.id)
    if (totalCents > remainingCents) {
      return { cents: 0, error: `El importe no puede superar el pendiente (${(remainingCents / 100).toFixed(2)} €).` }
    }
  }

  return { cents: totalCents }
}

const handleDirectPayment = (method: PaymentMethod, verifiedManually?: boolean) => {
  if (!selectedTable.value) return
  const remainingCents = mesasStore.getTableRemainingCents(selectedTable.value.id)
  const res = mesasStore.registerTablePayment({
    tableId: selectedTable.value.id,
    amountCents: remainingCents,
    method,
    verifiedManually
  })

  if (res.success) {
    showCheckoutDialog.value = false
    isPartialMode.value = false
    paymentAmountInput.value = ''
    paymentAmountInputError.value = ''
    selectedTable.value = null
    showReleaseWarning.value = false
  } else {
    warningMessage.value = getMoveErrorMsg(res.reason)
    warningType.value = 'error'
    showReleaseWarning.value = true
    showCheckoutDialog.value = false
  }
}

const handleCustomPayment = (method: PaymentMethod, verifiedManually?: boolean) => {
  if (!selectedTable.value) return
  paymentAmountInputError.value = ''

  const parseRes = parseAmountInput(paymentAmountInput.value)
  if (parseRes.error) {
    paymentAmountInputError.value = parseRes.error
    return
  }

  const amountCents = parseRes.cents
  const res = mesasStore.registerTablePayment({
    tableId: selectedTable.value.id,
    amountCents,
    method,
    verifiedManually
  })

  if (res.success) {
    if (res.isFullyPaid) {
      showCheckoutDialog.value = false
      isPartialMode.value = false
      paymentAmountInput.value = ''
      paymentAmountInputError.value = ''
      selectedTable.value = null
      showReleaseWarning.value = false
    } else {
      paymentAmountInput.value = ''
      paymentAmountInputError.value = ''
      const updated = mesasStore.tables.find(t => t.id === selectedTable.value?.id)
      if (updated) {
        selectedTable.value = updated
      }
    }
  } else {
    paymentAmountInputError.value = getMoveErrorMsg(res.reason)
  }
}

// Double click action to open Ficha modal
const openFichaModal = (table: Table) => {
  activeFichaTable.value = table
  showFichaModal.value = true
}

const closeFichaModal = () => {
  showFichaModal.value = false
  activeFichaTable.value = null
  if (selectedTable.value) {
    const updated = mesasStore.tables.find(t => t.id === selectedTable.value?.id)
    if (updated) selectedTable.value = updated
  }
}

// Toggle table block status locally
const toggleTableLock = () => {
  if (activeFichaTable.value) {
    const index = blockedTableIds.value.indexOf(activeFichaTable.value.id)
    if (index > -1) {
      blockedTableIds.value.splice(index, 1)
    } else {
      blockedTableIds.value.push(activeFichaTable.value.id)
      if (selectedTable.value?.id === activeFichaTable.value.id) {
        selectedTable.value = null
      }
    }
  }
}

const toggleDesignMode = () => {
  isDesignMode.value = !isDesignMode.value
  showReleaseWarning.value = false
}

// Drag & Drop event slots architecture (for future layout edit iterations)
const handleDragStart = (event: DragEvent, tableId: string) => {
  if (!isDesignMode.value) return
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', tableId)
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleDrop = (event: DragEvent, targetTableId: string) => {
  if (!isDesignMode.value) return
  if (event.dataTransfer) {
    const draggedTableId = event.dataTransfer.getData('text/plain')
    if (draggedTableId && draggedTableId !== targetTableId) {
      const draggedTable = mesasStore.tables.find(t => t.id === draggedTableId)
      const targetTable = mesasStore.tables.find(t => t.id === targetTableId)
      if (draggedTable && targetTable) {
        const tempX = draggedTable.x
        const tempY = draggedTable.y
        draggedTable.x = targetTable.x
        draggedTable.y = targetTable.y
        targetTable.x = tempX
        targetTable.y = tempY
      }
    }
  }
}
</script>
