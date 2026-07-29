<template>
  <div class="bg-[#FCFCFC] min-h-[calc(100vh-4rem)] text-[#08071A] font-inter antialiased overflow-x-hidden">
    <div class="max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">

      <!-- HEADER WITH PREMIUM SUBTLE LEGEND -->
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

        <!-- Leyendas / Estados Premium (Sin bordes duros) -->
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

      <!-- MAIN SPLIT WORKSPACE (75% FLOOR MAP / 25% NOTION SIDEBAR) -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">

        <!-- LEFT PANEL: ARCHITECTURAL FLOOR MAP (75% width) -->
        <div class="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 space-y-6 shadow-sm flex flex-col justify-between min-h-[620px] relative overflow-hidden">

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-50">
            <div>
              <h3 class="text-lg font-black text-[#08071A] font-outfit">Sala Principal & Terraza</h3>
              <p class="text-[11px] text-slate-400 font-medium">Un clic abre comanda • Doble clic abre ficha técnica</p>
            </div>
            <!-- Toggle modo edición (Drag & Drop placeholder) -->
            <button
              @click="toggleDesignMode"
              :class="['px-4 py-2 border rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer flex items-center gap-2',
                isDesignMode ? 'bg-[#9235DF]/10 border-[#9235DF] text-[#9235DF]' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800']"
            >
              <i class="pi pi-sliders-h"></i>
              <span>{{ isDesignMode ? 'Modo Edición Activo' : 'Editar Plano' }}</span>
            </button>
          </div>

          <!-- FLOOR MAP CANVAS -->
          <div class="flex-1 min-h-[500px] w-full bg-[#FBFBFC] border border-slate-100 rounded-3xl relative p-6 overflow-hidden">
            <!-- Grid pattern overlays -->
            <div class="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:32px_32px] opacity-40"></div>

            <!-- Room Layout architectural lines / Zone dividers -->
            <div class="absolute inset-y-0 left-[35%] w-[1px] border-r border-dashed border-slate-200/60 z-0"></div>
            <div class="absolute inset-y-0 left-[68%] w-[1px] border-r border-dashed border-slate-200/60 z-0"></div>
            <div class="absolute top-[50%] left-0 right-[68%] h-[1px] border-b border-dashed border-slate-200/60 z-0"></div>

            <!-- Zone labels -->
            <div class="absolute top-4 left-4 text-[9px] text-slate-400 font-black uppercase tracking-widest z-10">Zona A (Ventana)</div>
            <div class="absolute bottom-4 left-4 text-[9px] text-slate-400 font-black uppercase tracking-widest z-10">Zona B (Interior)</div>
            <div class="absolute top-4 left-[38%] text-[9px] text-slate-400 font-black uppercase tracking-widest z-10">Barra & Café</div>
            <div class="absolute top-4 left-[71%] text-[9px] text-slate-400 font-black uppercase tracking-widest z-10">Terraza Aveniq</div>

            <!-- Render tables (Styled as premium physical objects with soft shadows) -->
            <button
              v-for="table in mesasStore.tables"
              :key="table.id"
              @click="selectTable(table)"
              @dblclick="openFichaModal(table)"
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
                // Shapes classes
                getTableMetadata(table).shape === 'circle' ? 'rounded-full w-20 h-20' : '',
                getTableMetadata(table).shape === 'square' ? 'rounded-2xl w-20 h-20' : '',
                getTableMetadata(table).shape === 'rectangle' ? 'rounded-2xl w-28 h-18' : '',
                getTableMetadata(table).shape === 'barra' ? 'rounded-full w-14 h-14 border-dashed' : '',
                getTableMetadata(table).shape === 'terraza' ? 'rounded-2xl w-20 h-20 border-double border-4' : '',
                // Selected state
                selectedTable?.id === table.id ? 'ring-2 ring-[#9235DF] scale-105 z-20 shadow-xl' : '',
                // Blocked state
                blockedTableIds.includes(table.id) ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70 shadow-none' : '',
                // Dynamic Status states (Clean styles with glowing indicators)
                !blockedTableIds.includes(table.id) && table.status === 'free' ? 'bg-white border-slate-200 text-slate-700 hover:border-[#9235DF]/20' : '',
                !blockedTableIds.includes(table.id) && table.status === 'occupied' ? 'bg-white border-teal-500 text-teal-700 hover:border-teal-600' : '',
                !blockedTableIds.includes(table.id) && table.status === 'reserved' ? 'bg-white border-indigo-500 text-indigo-700 hover:border-indigo-600' : '',
                !blockedTableIds.includes(table.id) && table.status === 'bill' ? 'bg-white border-amber-500 text-amber-700 hover:border-amber-600' : ''
              ]"
            >
              <div class="relative w-full h-full flex flex-col items-center justify-center p-2">
                <!-- Status indicator dot (Top-right corner) -->
                <span v-if="table.status === 'occupied'" class="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                <span v-else-if="table.status === 'reserved'" class="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span v-else-if="table.status === 'bill'" class="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                <i v-else-if="blockedTableIds.includes(table.id)" class="pi pi-lock text-[8px] text-slate-400 absolute top-2 right-2"></i>

                <!-- Waitstaff Assigned Initial (Top-left corner) -->
                <span v-if="table.status !== 'free' && !blockedTableIds.includes(table.id)" class="absolute top-1.5 left-2 text-[8px] font-black text-slate-400 uppercase">
                  {{ getTableMetadata(table).waiter[0] }}
                </span>

                <!-- Table label -->
                <span class="text-xs font-black text-slate-900 leading-none">M-{{ table.number }}</span>
                <!-- Table capacity metadata -->
                <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  {{ table.capacity }} pax
                </span>

                <!-- Pricing & elapsed time metadata (Subtle bottom row) -->
                <div v-if="table.status !== 'free' && !blockedTableIds.includes(table.id)" class="flex items-center gap-1 mt-1 text-[8px] font-black text-[#9235DF]">
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

          <!-- Empty state -->
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

          <!-- Active Table state -->
          <div v-else class="flex-1 flex flex-col justify-between h-full space-y-8">
            <div class="space-y-6">

              <!-- Notion-style Header info -->
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h3 class="text-xl font-black text-[#08071A] font-outfit">Mesa {{ selectedTable.number }}</h3>
                  <span class="px-2 py-0.5 rounded bg-slate-50 text-slate-500 text-[8px] font-black uppercase tracking-widest border border-slate-100">
                    {{ getTableMetadata(selectedTable).zone }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 font-medium">Panel contextual del servicio activo.</p>
              </div>

              <!-- Quick action primary buttons at the top -->
              <div class="grid grid-cols-1 gap-2 border-b border-slate-50 pb-4">
                <button
                  @click="openCatalog"
                  class="w-full py-2.5 bg-[#9235DF] hover:bg-[#562AAC] text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#9235DF]/10"
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
              </div>

              <!-- General Table Metadata (Notion-style property list) -->
              <div class="space-y-3.5 text-xs">
                <!-- Estado -->
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

                <!-- Camarero -->
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 font-medium">Camarero:</span>
                  <span class="font-bold text-[#08071A]">{{ getTableMetadata(selectedTable).waiter }}</span>
                </div>

                <!-- Tiempo ocupada -->
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 font-medium">Tiempo ocupada:</span>
                  <span class="font-bold text-[#08071A]">{{ getTableMetadata(selectedTable).elapsedTime || '0 min' }}</span>
                </div>

                <!-- Capacidad -->
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 font-medium">Capacidad:</span>
                  <span class="font-bold text-[#08071A]">{{ selectedTable.capacity }} comensales</span>
                </div>

                <!-- Importe acumulado -->
                <div class="flex items-center justify-between border-t border-slate-50 pt-3">
                  <span class="text-slate-400 font-medium">Importe Total:</span>
                  <span class="text-lg font-black text-[#9235DF]">{{ orderTotal.toFixed(2) }} €</span>
                </div>
              </div>

              <!-- Warning alerts block -->
              <div v-if="showReleaseWarning" class="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-4 text-xs space-y-2 shrink-0 relative animate-in fade-in duration-200">
                <button
                  type="button"
                  @click="showReleaseWarning = false"
                  class="absolute top-2.5 right-2.5 text-rose-400 hover:text-rose-700 p-1 cursor-pointer"
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

              <!-- Products detail list -->
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
                      <!-- Badge -->
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
                      <!-- Action check -->
                      <button
                        v-if="item.status === 'ready'"
                        @click="markServed(item.id)"
                        class="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg hover:scale-105 transition-all cursor-pointer"
                        title="Entregar al Cliente"
                      >
                        <i class="pi pi-check text-[9px]"></i>
                      </button>
                    </div>
                  </div>
                  <div v-if="selectedTable.orders.length === 0" class="text-center py-6 text-slate-400 text-xs">
                    Mesa sin comandas activas.
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <!-- MOBILE SLIDING CONTEXTUAL DRAWER (Slide-up drawer for one-handed use) -->
      <div
        v-if="selectedTable"
        class="lg:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 transition-opacity"
        @click="selectedTable = null"
      ></div>
      <div
        :class="['lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-slate-100 p-6 shadow-2xl z-50 transition-all duration-300 max-h-[80vh] flex flex-col justify-between overflow-y-auto',
          selectedTable ? 'translate-y-0' : 'translate-y-full']"
      >
        <!-- Top slider pull handle -->
        <div class="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 cursor-pointer" @click="selectedTable = null"></div>

        <div v-if="selectedTable" class="space-y-6">
          <div class="flex justify-between items-start">
            <div class="space-y-0.5">
              <h3 class="text-lg font-black text-[#08071A] font-outfit">Mesa {{ selectedTable.number }}</h3>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Zona: {{ getTableMetadata(selectedTable).zone }} • Camarero: {{ getTableMetadata(selectedTable).waiter }}
              </p>
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

          <!-- Pricing summary -->
          <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div class="space-y-0.5">
              <span class="text-slate-400 font-semibold block uppercase tracking-wider text-[9px]">Total Acumulado</span>
              <span class="text-xl font-black text-[#08071A]">{{ orderTotal.toFixed(2) }} €</span>
            </div>
            <div class="flex gap-2">
              <button
                @click="openCatalog"
                class="px-4 py-2.5 bg-[#9235DF] hover:bg-[#562AAC] text-white font-black text-xs rounded-xl shadow-md"
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
            </div>
          </div>

          <!-- Warning block alert -->
          <div v-if="showReleaseWarning" class="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-4 text-xs space-y-2 relative">
            <button
              type="button"
              @click="showReleaseWarning = false"
              class="absolute top-2.5 right-2.5 text-rose-400 hover:text-rose-700 p-1 cursor-pointer"
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

          <!-- Items list -->
          <div class="space-y-3">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Productos pedidos</span>
            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              <div
                v-for="item in selectedTable.orders"
                :key="item.id"
                class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs shadow-sm"
              >
                <div class="flex-1 min-w-0 pr-2">
                  <p class="font-bold text-[#08071A] truncate">{{ item.name }}</p>
                  <p class="text-slate-400 text-[10px] font-semibold mt-0.5">{{ item.quantity }} x {{ item.price.toFixed(2) }} €</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border bg-white">
                    {{ item.status }}
                  </span>
                  <button
                    v-if="item.status === 'ready'"
                    @click="markServed(item.id)"
                    class="p-1 bg-emerald-500 text-white rounded-lg"
                  >
                    <i class="pi pi-check text-[9px]"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DETAILED FICHA MODAL (DOUBLE-CLICK) -->
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

      <!-- CATALOG MODAL (ADD ITEMS) -->
      <div
        v-if="showCatalog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
      >
        <div class="bg-white max-w-lg w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <button
            @click="showCatalog = false"
            class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <i class="pi pi-times"></i>
          </button>

          <div>
            <h3 class="text-xl font-bold text-[#08071A] font-outfit">Carta de Aveniq</h3>
            <p class="text-xs text-slate-400 font-medium">Añada productos a la Mesa {{ selectedTable?.number }}</p>
          </div>

          <!-- Category tabs -->
          <div class="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100">
            <button
              @click="activeCategory = 'all'"
              :class="['px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap',
                activeCategory === 'all' ? 'bg-[#9235DF] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100']"
            >
              Todos
            </button>
            <button
              v-for="cat in cartaStore.categories"
              :key="cat.id"
              @click="activeCategory = cat.id"
              :class="['px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap',
                activeCategory === cat.id ? 'bg-[#9235DF] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100']"
            >
              {{ cat.name }}
            </button>
          </div>

          <!-- Products list -->
          <div class="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
            >
              <div>
                <p class="font-bold text-sm text-[#08071A]">{{ product.name }}</p>
                <p class="text-slate-400 text-xs mt-0.5 leading-relaxed">{{ product.description }}</p>
                <p class="text-[#9235DF] font-bold text-sm mt-1">{{ product.price.toFixed(2) }} €</p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  @click="addToBasket(product)"
                  class="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>

          <!-- Basket selected products -->
          <div v-if="basket.length > 0" class="border-t border-slate-100 pt-3 space-y-2 shrink-0">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Productos Seleccionados</p>
            <div class="max-h-40 overflow-y-auto space-y-2 pr-1">
              <div
                v-for="(item, index) in basket"
                :key="item.id"
                class="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-2 text-xs"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-[#08071A]">{{ item.name }} ({{ item.price.toFixed(2) }} €)</span>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="decrementBasketItem(index)"
                      class="w-5 h-5 rounded bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#08071A] cursor-pointer"
                    >-</button>
                    <span class="font-bold w-4 text-center">{{ item.quantity }}</span>
                    <button
                      type="button"
                      @click="incrementBasketItem(index)"
                      class="w-5 h-5 rounded bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#08071A] cursor-pointer"
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
                <div class="flex items-center gap-2">
                  <span class="text-[9px] text-slate-400 font-bold uppercase shrink-0">Nota:</span>
                  <input
                    v-model="item.notes"
                    type="text"
                    maxlength="200"
                    placeholder="Ej. Sin cebolla, poco hecho (máx 200 car.)"
                    class="w-full bg-white border border-slate-200 text-[#08071A] rounded-lg px-2.5 py-1 text-[11px] focus:outline-none focus:border-[#9235DF]"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Basket total footer -->
          <div class="pt-4 border-t border-slate-100 flex justify-between items-center shrink-0">
            <div>
              <p class="text-xs text-slate-400">Total a añadir:</p>
              <p class="text-base font-bold text-[#08071A]">{{ basketTotal.toFixed(2) }} € ({{ basketCount }} items)</p>
            </div>
            <button
              @click="submitBasket"
              :disabled="basket.length === 0"
              class="px-5 py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Comanda
            </button>
          </div>
        </div>
      </div>

      <!-- WARNING READY UNBOARDED ITEMS -->
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

      <!-- CHECKOUT PAYMENT SELECTION -->
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
          <p class="text-xs text-slate-400">Seleccione el método de pago para finalizar el servicio de la Mesa {{ selectedTable?.number }}.</p>

          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
            <div class="flex justify-between font-bold border-b border-slate-200 pb-2 text-[#08071A]">
              <span>Descripción</span>
              <span>Total</span>
            </div>
            <div v-for="item in selectedTable?.orders" :key="item.id" class="flex justify-between text-slate-500 font-medium">
              <span>{{ item.name }} x{{ item.quantity }}</span>
              <span>{{ (item.price * item.quantity).toFixed(2) }} €</span>
            </div>
            <div class="flex justify-between font-black text-sm text-[#08071A] pt-2 border-t border-slate-200">
              <span>Total Facturado</span>
              <span class="text-[#9235DF]">{{ orderTotal.toFixed(2) }} €</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-2">
            <button
              @click="handlePayment('card')"
              class="flex flex-col items-center gap-3 p-4 bg-slate-50 hover:bg-[#9235DF]/5 border border-slate-100 hover:border-[#9235DF]/20 rounded-2xl cursor-pointer transition-all active:scale-95 group"
            >
              <div class="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                <i class="pi pi-credit-card text-lg"></i>
              </div>
              <span class="text-xs font-bold text-slate-600 group-hover:text-[#9235DF]">Tarjeta de Crédito</span>
            </button>

            <button
              @click="handlePayment('cash')"
              class="flex flex-col items-center gap-3 p-4 bg-slate-50 hover:bg-[#9235DF]/5 border border-slate-100 hover:border-[#9235DF]/20 rounded-2xl cursor-pointer transition-all active:scale-95 group"
            >
              <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <i class="pi pi-wallet text-lg"></i>
              </div>
              <span class="text-xs font-bold text-slate-600 group-hover:text-[#9235DF]">Efectivo</span>
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

// Interactive Ficha Modal states
const showFichaModal = ref(false)
const activeFichaTable = ref<Table | null>(null)

// Design & Drag state hooks
const isDesignMode = ref(false)
const blockedTableIds = ref<string[]>(['t12']) // Mesa 12 starts as blocked

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

const getTableTotal = (table: Table): number => {
  return table.orders.reduce((sum, item) => sum + (item.price * item.quantity), 0)
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
      category: item.category as 'tapas' | 'platos' | 'bebidas' | 'postres',
      quantity: item.quantity,
      notes: item.notes.trim()
    }))

    mesasStore.addItemsToTableOrder(selectedTable.value.id, itemsToSubmit)
    basket.value = []
    showCatalog.value = false
    showReleaseWarning.value = false

    const updated = mesasStore.tables.find(t => t.id === selectedTable.value?.id)
    if (updated) selectedTable.value = updated
  }
}

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
