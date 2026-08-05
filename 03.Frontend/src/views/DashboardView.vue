<template>
  <div class="bg-[#FCFCFC] min-h-[calc(100vh-4rem)] text-[#08071A] font-inter antialiased selection:bg-[#9235DF]/10 selection:text-[#9235DF]">
    <div class="max-w-7xl w-full mx-auto p-6 md:p-10 space-y-10">

      <!-- HEADER ENTERPRISE -->
      <div class="flex flex-col gap-6 pb-8 border-b border-slate-100">
        <!-- Top bar: search, weather, IA, profiles -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <!-- Greeting, date, and weather -->
          <div class="space-y-1.5">
            <div class="flex items-center gap-3">
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> En Servicio
              </span>
              <span class="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <i class="pi pi-sun text-amber-500"></i> [Demo] {{ demoData.weather }}
              </span>
            </div>
            <h2 class="text-3xl font-black tracking-tight font-outfit text-[#08071A]">
              Buenos días, {{ userName }}
            </h2>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {{ formattedDate }}
            </p>
          </div>

          <!-- Global search and actions -->
          <div class="flex flex-wrap items-center gap-3 md:self-end">
            <!-- Search bar -->
            <div class="relative w-full sm:w-64">
              <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                placeholder="Buscar mesas, reservas, pedidos..."
                class="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-[#9235DF]/60 focus:ring-1 focus:ring-[#9235DF]/20 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#08071A] font-medium transition-all focus:outline-none"
              />
            </div>

            <!-- Botón AVA (IA) -->
            <button
              @click="openAvaAssistant"
              class="flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-tr from-[#9235DF] to-[#562AAC] hover:opacity-95 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-[#9235DF]/10 hover:shadow-lg hover:shadow-[#9235DF]/20 active:scale-95 cursor-pointer"
            >
              <i class="pi pi-sparkles"></i>
              <span>Preguntar a AVA</span>
            </button>

            <!-- Simular Venta Rápida (Developer Shortcut) -->
            <button
              @click="generateMockSale"
              class="p-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-500 hover:text-[#9235DF] transition-all cursor-pointer"
              title="Simular Venta Rápida"
              aria-label="Simular Venta Rápida"
            >
              <i class="pi pi-bolt text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Inner bar info -->
        <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
          <div class="flex items-center gap-6 text-xs text-slate-500 font-semibold">
            <span>{{ cashBoxStatus }}</span>
            <span class="text-slate-300">|</span>
            <span class="text-[#9235DF] font-bold">Aveniq v0.1.0 MVP</span>
          </div>

          <div class="flex items-center gap-3">
            <button
              @click="toggleNotifications"
              class="relative p-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              title="Ver notificaciones"
              aria-label="Ver notificaciones"
            >
              <i class="pi pi-bell text-xs"></i>
              <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#9235DF]"></span>
            </button>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#9235DF] to-[#562AAC] text-white flex items-center justify-center font-bold text-xs tracking-wide">
                {{ userInitials }}
              </div>
              <span class="text-xs font-black text-[#08071A] hidden sm:inline">{{ authStore.user?.name || 'Administrador' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MAIN GRID (ASYMMETRIC 2-COLUMN LAYOUT) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">

        <!-- LEFT COLUMN: MAIN WORKSPACE -->
        <div class="lg:col-span-2 space-y-10">

          <!-- 1. ACTION CARDS (ACCIONES RÁPIDAS) -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">Acciones Operativas</h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">

              <!-- Nuevo Pedido -->
              <router-link
                to="/mesas"
                class="flex flex-col justify-between p-6 bg-white hover:bg-slate-50 border border-slate-100 hover:border-[#9235DF]/20 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer text-left h-44"
              >
                <div class="p-3 bg-[#9235DF]/5 text-[#9235DF] rounded-2xl w-fit group-hover:scale-105 transition-transform">
                  <i class="pi pi-plus-circle text-base"></i>
                </div>
                <div class="space-y-1">
                  <span class="text-sm font-black text-[#08071A] flex items-center gap-1.5">
                    Nuevo Pedido <i class="pi pi-arrow-right text-[10px] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
                  </span>
                  <span class="text-xs text-slate-400 font-medium block">Crear un pedido para una mesa.</span>
                </div>
              </router-link>

              <!-- Nueva Reserva -->
              <button
                @click="openQuickActionModal('reserva')"
                class="flex flex-col justify-between p-6 bg-white hover:bg-slate-50 border border-slate-100 hover:border-[#9235DF]/20 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer text-left h-44 w-full"
              >
                <div class="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit group-hover:scale-105 transition-transform">
                  <i class="pi pi-calendar-plus text-base"></i>
                </div>
                <div class="space-y-1">
                  <span class="text-sm font-black text-[#08071A] flex items-center gap-1.5">
                    Nueva Reserva <i class="pi pi-arrow-right text-[10px] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
                  </span>
                  <span class="text-xs text-slate-400 font-medium block">Registrar una reserva.</span>
                </div>
              </button>

              <!-- Abrir Caja -->
              <button
                @click="openQuickActionModal('caja')"
                class="flex flex-col justify-between p-6 bg-white hover:bg-slate-50 border border-slate-100 hover:border-[#9235DF]/20 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer text-left h-44 w-full"
              >
                <div class="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit group-hover:scale-105 transition-transform">
                  <i class="pi pi-wallet text-base"></i>
                </div>
                <div class="space-y-1">
                  <span class="text-sm font-black text-[#08071A] flex items-center gap-1.5">
                    Abrir Caja <i class="pi pi-arrow-right text-[10px] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
                  </span>
                  <span class="text-xs text-slate-400 font-medium block">Iniciar un nuevo turno de caja.</span>
                </div>
              </button>

            </div>
          </div>

          <!-- 2. TIMELINE / AGENDA PREMIUM -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">Agenda de Hoy (Demostración)</h4>
            <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div class="relative pl-6 border-l border-slate-100 space-y-8">

                <!-- Dynamic Events Loop -->
                <div
                  v-for="event in demoData.events"
                  :key="event.id"
                  class="relative group"
                >
                  <!-- Indicator Node -->
                  <span :class="['absolute -left-[30.5px] top-0 w-3 h-3 rounded-full bg-white border-2 group-hover:scale-110 transition-transform',
                    event.priority === 'Alta' ? 'border-amber-500' : event.priority === 'Media' ? 'border-indigo-500' : 'border-[#9235DF]']">
                  </span>
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-[#08071A]">
                          <span v-if="event.id === 1">🎂 </span>
                          <span v-else-if="event.id === 2">👥 </span>
                          <span v-else-if="event.id === 3">🚚 </span>
                          <span v-else>👨‍🍳 </span>
                          {{ event.title }}
                        </span>
                        <span :class="['px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider',
                          event.priority === 'Alta' ? 'bg-amber-50 text-amber-700' : event.priority === 'Media' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-[#9235DF]']">
                          {{ event.priority }}
                        </span>
                      </div>
                      <p class="text-xs text-slate-400">{{ event.desc }}</p>
                    </div>
                    <span class="text-[11px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg self-start sm:self-auto shadow-sm">
                      {{ event.time }}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- PANEL OPERATIVO DEL ENCARGADO -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">Panel Operativo del Encargado</h4>
            <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">

              <!-- Tarjetas KPI -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                <div
                  v-for="card in opKpiCards"
                  :key="card.key"
                  class="py-5 px-6 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between min-h-[112px] space-y-3"
                >
                  <div class="flex items-center justify-between text-slate-500">
                    <span class="text-xs font-semibold uppercase tracking-wider">{{ card.label }}</span>
                    <i :class="['pi text-base', card.icon]" aria-hidden="true"></i>
                  </div>
                  <div>
                    <p :class="['text-2xl font-black', card.valueClass]">{{ card.value }}</p>
                    <p class="text-xs text-slate-500 font-medium">{{ card.helper }}</p>
                  </div>
                </div>
              </div>

              <!-- Carga Activa por Estación -->
              <div class="space-y-3">
                <div class="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Cocina — {{ opDashboardMetrics.kitchenActiveLinesCount }} líneas activas</span>
                  <span>Barra — {{ opDashboardMetrics.barActiveLinesCount }} líneas activas</span>
                </div>

                <div class="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <template v-if="opDashboardMetrics.kitchenActiveLinesCount + opDashboardMetrics.barActiveLinesCount > 0">
                    <div
                      :style="{ width: (opDashboardMetrics.kitchenActiveLinesCount / (opDashboardMetrics.kitchenActiveLinesCount + opDashboardMetrics.barActiveLinesCount) * 100) + '%' }"
                      class="h-full bg-[#9235DF]"
                      title="Distribución Cocina"
                    ></div>
                    <div
                      :style="{ width: (opDashboardMetrics.barActiveLinesCount / (opDashboardMetrics.kitchenActiveLinesCount + opDashboardMetrics.barActiveLinesCount) * 100) + '%' }"
                      class="h-full bg-sky-500"
                      title="Distribución Barra"
                    ></div>
                  </template>
                  <div v-else class="h-full w-full bg-slate-200" title="Sin carga"></div>
                </div>
              </div>

              <!-- Mesas con Mayor Espera -->
              <div class="space-y-4 pt-4 border-t border-slate-100">
                <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Prioridad de Atención (Mayor Espera)</h5>

                <div class="space-y-3">
                  <div
                    v-for="item in opDashboardMetrics.longestWaitingTables"
                    :key="item.tableId"
                    class="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 text-xs"
                  >
                    <div class="space-y-1">
                      <p class="font-bold text-[#08071A]">Mesa {{ item.tableNumber }}</p>
                      <p class="text-[10px] text-slate-400">
                        Estaciones: <span class="font-semibold text-slate-600">{{ item.stations }}</span>
                      </p>
                    </div>

                    <div class="flex items-center gap-3">
                      <span
                        v-if="item.alertLevel !== 'none' && item.stations.includes(' y ')"
                        class="text-[9px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                      >
                        Origen: {{ item.criticalStation }}
                      </span>

                      <span
                        v-if="item.timeState === 'invalid'"
                        class="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        Sin hora
                      </span>
                      <span
                        v-else-if="item.timeState === 'future'"
                        class="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        Hora futura
                      </span>
                      <span
                        v-else
                        :class="[
                          'text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-sm border flex items-center gap-1',
                          item.alertLevel === 'urgent' ? 'text-rose-700 bg-rose-50 border-rose-200' :
                          item.alertLevel === 'attention' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                          'text-slate-600 bg-slate-50 border-slate-200'
                        ]"
                      >
                        <i v-if="item.alertLevel === 'urgent'" class="pi pi-exclamation-triangle text-[9px] text-rose-600"></i>
                        {{ item.displayTime }}
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="opDashboardMetrics.longestWaitingTables.length === 0"
                    class="py-8 text-center bg-slate-50/30 rounded-2xl border border-dashed border-slate-200/60"
                  >
                    <i class="pi pi-check-circle text-2xl text-slate-400 mb-2 block"></i>
                    <p class="text-xs font-semibold text-slate-400">Servicio al día. No hay comandas pendientes de preparación.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- 3. KPIs CON SPARKLINES -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">Rendimiento Operativo</h4>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-6">

              <!-- Propinas de Hoy -->
              <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Propinas de Hoy</span>
                  <span class="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                    <i class="pi pi-heart"></i> Extra
                  </span>
                </div>
                <div>
                  <h5 class="text-2xl font-black text-[#08071A]">{{ totalTips.toFixed(2) }} €</h5>
                  <p class="text-[10px] text-slate-400 font-medium">acumulado voluntario</p>
                </div>
                <!-- Sparkline SVG -->
                <div class="h-10 w-full pt-2">
                  <svg class="w-full h-full overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0,15 C20,15 40,5 60,12 C80,2 100,8 100,8" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"></path>
                    <path d="M0,15 C20,15 40,5 60,12 C80,2 100,8 100,8 L100,20 L0,20 Z" fill="url(#sparklineGradTips)" opacity="0.06"></path>
                    <defs>
                      <linearGradient id="sparklineGradTips" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#f59e0b"/>
                        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <!-- Ventas Hoy -->
              <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden group hover:border-[#9235DF]/20 transition-all duration-300">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Facturación</span>
                  <span class="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <i class="pi pi-arrow-up-right"></i> [Demo] {{ demoData.salesTrend }}
                  </span>
                </div>
                <div>
                  <h5 class="text-2xl font-black text-[#08071A]">{{ totalSales.toFixed(2) }} €</h5>
                  <p class="text-[10px] text-slate-400 font-medium">vs ayer</p>
                </div>
                <!-- Sparkline SVG -->
                <div class="h-10 w-full pt-2">
                  <svg class="w-full h-full overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0,18 C15,10 30,12 45,5 C60,15 75,3 90,8 C95,2 100,5 100,5" fill="none" stroke="#9235DF" stroke-width="1.5" stroke-linecap="round"></path>
                    <path d="M0,18 C15,10 30,12 45,5 C60,15 75,3 90,8 C95,2 100,5 100,5 L100,20 L0,20 Z" fill="url(#sparklineGradVentas)" opacity="0.06"></path>
                    <defs>
                      <linearGradient id="sparklineGradVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#9235DF"/>
                        <stop offset="100%" stop-color="#9235DF" stop-opacity="0"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <!-- Ocupación -->
              <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden group hover:border-teal-500/20 transition-all duration-300">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ocupación</span>
                  <span class="text-[10px] font-bold text-teal-600">En uso</span>
                </div>
                <div>
                  <h5 class="text-2xl font-black text-[#08071A]">{{ occupiedTablesCount }} / {{ totalTablesCount }}</h5>
                  <p class="text-[10px] text-slate-400 font-medium">mesas activas</p>
                </div>
                <!-- Sparkline SVG -->
                <div class="h-10 w-full pt-2">
                  <svg class="w-full h-full overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0,15 C20,15 40,8 60,8 C80,3 100,10 100,10" fill="none" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round"></path>
                    <path d="M0,15 C20,15 40,8 60,8 C80,3 100,10 100,10 L100,20 L0,20 Z" fill="url(#sparklineGradOcup)" opacity="0.06"></path>
                    <defs>
                      <linearGradient id="sparklineGradOcup" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#0ea5e9"/>
                        <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <!-- Ticket Medio -->
              <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket Medio</span>
                  <span class="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <i class="pi pi-arrow-up-right"></i> [Demo] {{ demoData.ticketAverageTrend }}
                  </span>
                </div>
                <div>
                  <h5 class="text-2xl font-black text-[#08071A]">{{ averageTicket.toFixed(2) }} €</h5>
                  <p class="text-[10px] text-slate-400 font-medium">este mes</p>
                </div>
                <!-- Sparkline SVG -->
                <div class="h-10 w-full pt-2">
                  <svg class="w-full h-full overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0,10 C20,5 40,15 60,10 C80,5 100,2 100,2" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round"></path>
                    <path d="M0,10 C20,5 40,15 60,10 C80,5 100,2 100,2 L100,20 L0,20 Z" fill="url(#sparklineGradTicket)" opacity="0.06"></path>
                    <defs>
                      <linearGradient id="sparklineGradTicket" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#6366f1"/>
                        <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

            </div>
          </div>

          <!-- 4. KPI RESERVAS DE HOY -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">Previsión de Reservas (Hoy)</h4>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <!-- Reservas Hoy -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Reservas Hoy</span>
                <span class="text-xl font-black text-slate-800 block">{{ totalReservasCount }}</span>
              </div>

              <!-- Clientes Previstos -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Clientes Previstos</span>
                <span class="text-xl font-black text-slate-800 block">{{ expectedClients }} pax</span>
              </div>

              <!-- Mesas Reservadas -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Mesas Reservadas</span>
                <span class="text-xl font-black text-indigo-600 block">{{ reservedTablesCount }}</span>
              </div>

              <!-- No Show -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-rose-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">No Show</span>
                <span class="text-xl font-black text-rose-600 block">{{ noShowCount }}</span>
              </div>

              <!-- Ocupación Prevista -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ocupación Prevista</span>
                <span class="text-xl font-black text-emerald-600 block">{{ expectedOccupation }}%</span>
              </div>
            </div>
          </div>

          <!-- 5. KPI CRM CUSTOMER 360 -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">Resumen CRM (Clientes)</h4>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <!-- Clientes Activos -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-[#9235DF]/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Clientes Activos</span>
                <span class="text-xl font-black text-slate-800 block">{{ crmActiveClients }}</span>
              </div>

              <!-- Clientes Nuevos -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-[#9235DF]/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Clientes Nuevos</span>
                <span class="text-xl font-black text-slate-800 block">{{ crmNewClients }}</span>
              </div>

              <!-- Clientes VIP -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Clientes VIP</span>
                <span class="text-xl font-black text-amber-600 block">{{ crmVipClients }}</span>
              </div>

              <!-- Ticket Medio Global -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ticket Medio (CRM)</span>
                <span class="text-xl font-black text-emerald-600 block">{{ crmAvgTicketGlobal.toFixed(2) }} €</span>
              </div>

              <!-- Clientes con Reserva Hoy -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Reserva Hoy (CRM)</span>
                <span class="text-xl font-black text-indigo-600 block">{{ crmClientsResToday }}</span>
              </div>
            </div>
          </div>

          <!-- 6. KPI INVENTARIO ALMACÉN (ERP) -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">Resumen de Almacén (ERP)</h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <!-- Productos Críticos -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Productos Críticos</span>
                <span class="text-xl font-black text-amber-600 block">{{ erpCriticalProducts }}</span>
              </div>

              <!-- Valor Almacén -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Valor Almacén</span>
                <span class="text-xl font-black text-emerald-600 block">{{ erpWarehouseValue.toFixed(2) }} €</span>
              </div>

              <!-- Productos Agotados -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-rose-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Productos Agotados</span>
                <span class="text-xl font-black text-rose-600 block">{{ erpOutOfStockProducts }}</span>
              </div>

              <!-- Movimientos Hoy -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Movimientos Hoy</span>
                <span class="text-xl font-black text-indigo-600 block">{{ erpMovementsTodayCount }}</span>
              </div>
            </div>
          </div>

          <!-- 7. KPI ESCANDALLOS COSTES (FINANZAS) -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">Análisis de Escandallos (Finanzas)</h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <!-- Coste Medio Plato -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-[#9235DF]/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Coste Medio Plato</span>
                <span class="text-xl font-black text-slate-800 block">{{ fcCosteMedioPlato.toFixed(2) }} €</span>
              </div>

              <!-- Margen Medio -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Margen Medio</span>
                <span class="text-xl font-black text-emerald-600 block">{{ fcMargenMedio.toFixed(0) }} %</span>
              </div>

              <!-- Producto Más Rentable -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Más Rentable (Margen)</span>
                <span class="text-xs font-black text-indigo-600 block mt-1 truncate" :title="fcProductoMasRentable">{{ fcProductoMasRentable }}</span>
              </div>

              <!-- Producto Menos Rentable -->
              <div class="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-2 relative overflow-hidden group hover:border-rose-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Menos Rentable (Margen)</span>
                <span class="text-xs font-black text-rose-600 block mt-1 truncate" :title="fcProductoMenosRentable">{{ fcProductoMenosRentable }}</span>
              </div>
            </div>
          </div>

          <!-- 8. KPI GESTIÓN PERSONAL (WORKFORCE) -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">Gestión de Personal (Equipo)</h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <!-- Empleados Activos -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-slate-350 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Empleados Activos</span>
                <span class="text-xl font-black text-slate-800 block">{{ wfActiveEmployees }}</span>
              </div>

              <!-- En Turno -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-[#9235DF]/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">En Turno</span>
                <span class="text-xl font-black text-[#9235DF] block">{{ wfEmployeesOnShift }}</span>
              </div>

              <!-- Coste Laboral Hoy -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-rose-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Coste Laboral Hoy</span>
                <span class="text-xl font-black text-rose-650 block">{{ wfLabourCostToday.toFixed(2) }} €</span>
              </div>

              <!-- Productividad -->
              <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Productividad</span>
                <span class="text-xl font-black text-emerald-650 block">{{ wfProductivityRatio.toFixed(1) }}x</span>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: HEALTH CENTER & STRIPE TRANSACTIONS FEED -->
        <div class="space-y-10">

          <!-- MONITOREO LIVE KDS/BDS -->
          <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div class="space-y-1">
              <span class="text-[10px] font-bold text-[#9235DF] uppercase tracking-wider">Monitoreo Live</span>
              <h4 class="text-base font-black text-[#08071A] font-outfit">Control de Comandas (KDS)</h4>
              <p class="text-xs text-slate-400">Estado operativo y métricas de preparación activas.</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Pedidos Activos</span>
                <span class="text-base font-black text-slate-800">{{ activeOrdersCount }}</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">En Cocina</span>
                <span class="text-base font-black text-amber-600">{{ kitchenOrdersCount }}</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">En Barra</span>
                <span class="text-base font-black text-blue-600">{{ barOrdersCount }}</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Servidos</span>
                <span class="text-base font-black text-emerald-600">{{ servedOrdersCount }}</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Tiempo Medio</span>
                <span class="text-base font-black text-slate-800">{{ avgPrepTime }} min</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Mesas Ocupadas</span>
                <span class="text-base font-black text-[#9235DF]">{{ occupiedTablesCount }}</span>
              </div>
            </div>
          </div>

          <!-- HEALTH CENTER CONSOLIDADO -->
          <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div class="space-y-1">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Center</span>
              <h4 class="text-lg font-black text-[#08071A] font-outfit">Estado de Aveniq</h4>
              <p class="text-xs text-slate-400">Diagnóstico operacional en tiempo real de los módulos.</p>
            </div>

            <div class="space-y-4">
              <!-- Sala -->
              <div class="flex items-center justify-between pb-3 border-b border-slate-50">
                <span class="text-xs font-bold text-slate-600">Sala (Mapa de Mesas)</span>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Correcto
                </span>
              </div>

              <!-- Cocina -->
              <div class="flex items-center justify-between pb-3 border-b border-slate-50">
                <span class="text-xs font-bold text-slate-600">Cocina (Pantalla KDS)</span>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Correcto
                </span>
              </div>

              <!-- Barra -->
              <div class="flex items-center justify-between pb-3 border-b border-slate-50">
                <span class="text-xs font-bold text-slate-600">Barra (Pantalla BDS)</span>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Correcto
                </span>
              </div>

              <!-- Caja -->
              <div class="flex items-center justify-between pb-3 border-b border-slate-50">
                <span class="text-xs font-bold text-slate-600">Caja Registradora</span>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Correcto
                </span>
              </div>

              <!-- Delivery -->
              <div class="flex items-center justify-between pb-3 border-b border-slate-50">
                <span class="text-xs font-bold text-slate-600">Delivery Integrado</span>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> [Demo] {{ demoData.healthStatus.delivery }}
                </span>
              </div>

              <!-- Reservas -->
              <div class="flex items-center justify-between pb-3 border-b border-slate-50">
                <span class="text-xs font-bold text-slate-600">Reservas Activas</span>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Correcto
                </span>
              </div>

              <!-- Inventario -->
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-600">Inventario (Stock)</span>
                <span class="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> [Demo] {{ demoData.healthStatus.inventario }}
                </span>
              </div>
            </div>
          </div>

          <!-- STRIPE-STYLE LOGS (RECIENTES TRANSACCIONES) -->
          <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div class="flex items-center justify-between">
              <div class="space-y-1">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Historial</span>
                <h4 class="text-base font-black text-[#08071A] font-outfit">Ventas Recientes</h4>
              </div>
              <router-link to="/mesas" class="text-xs font-bold text-[#9235DF] hover:underline flex items-center gap-1">
                Ver sala <i class="pi pi-arrow-right text-[9px]"></i>
              </router-link>
            </div>

            <!-- List -->
            <div class="space-y-4 divide-y divide-slate-50">
              <div
                v-for="order in mesasStore.completedOrders.slice().reverse().slice(0, 4)"
                :key="order.id"
                @click="selectedTicket = order; showTicketDetailModal = true"
                class="pt-4 first:pt-0 flex items-center justify-between text-xs hover:bg-slate-50/50 p-2 -mx-2 rounded-2xl transition-all cursor-pointer group"
                tabindex="0"
                @keydown.enter="selectedTicket = order; showTicketDetailModal = true"
              >
                <div class="space-y-1">
                  <p class="font-bold text-[#08071A] group-hover:text-[#9235DF]">Mesa {{ order.tableNumber }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">#{{ order.id }} • {{ order.timestamp }}</p>
                </div>
                <div class="text-right space-y-1">
                  <p class="font-black text-[#08071A] text-sm">{{ order.total.toFixed(2) }} €</p>
                  <span :class="['inline-block text-[8px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase border',
                    order.paymentMethod === 'card' ? 'bg-indigo-50 text-indigo-600 border-indigo-200/60' :
                    order.paymentMethod === 'bizum' ? 'bg-[#9235DF]/5 text-[#9235DF] border-[#9235DF]/20' :
                    order.paymentMethod === 'complimentary' ? 'bg-[#9235DF]/10 text-[#9235DF] border-[#9235DF]/20' :
                    'bg-emerald-50 text-emerald-600 border-emerald-200/60']">
                    {{ order.paymentMethod === 'card' ? 'Tarjeta' : order.paymentMethod === 'bizum' ? 'Bizum' : order.paymentMethod === 'complimentary' ? 'Cortesía' : 'Efectivo' }}
                  </span>
                </div>
              </div>

              <div v-if="mesasStore.completedOrders.length === 0" class="py-6 text-center text-xs text-slate-400">
                No hay transacciones registradas hoy.
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- MODALS FOR QUICK ACTIONS -->
      <div
        v-if="activeModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
      >
        <div class="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
          <button
            @click="closeModal"
            class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <i class="pi pi-times"></i>
          </button>

          <!-- AI Assistant (AVA) Modal -->
          <div v-if="activeModal === 'ava'" class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#9235DF] to-[#562AAC] text-white flex items-center justify-center">
                <i class="pi pi-sparkles"></i>
              </div>
              <div>
                <h3 class="text-lg font-black text-[#08071A] font-outfit">Asistente AVA</h3>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aveniq Virtual Assistant</p>
              </div>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed">
              Hola, soy AVA. ¿En qué puedo ayudarte hoy? Puedo darte el desglose de ventas, buscar reservas o analizar el stock crítico de almacén.
            </p>
            <div class="space-y-2">
              <input
                type="text"
                placeholder="Escribe tu consulta aquí..."
                class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-[#08071A] focus:outline-none focus:border-[#9235DF]"
              />
            </div>
            <button @click="showSuccess('Consulta enviada')" class="w-full py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
              Consultar
            </button>
          </div>

          <!-- Reserva Modal -->
          <div v-if="activeModal === 'reserva'" class="space-y-4">
            <h3 class="text-xl font-bold text-[#08071A] font-outfit">Nueva Reserva</h3>
            <p class="text-xs text-slate-400">Asigne mesa y comensales al libro de reservas de Aveniq.</p>

            <div class="space-y-3">
              <div>
                <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nombre del Cliente</label>
                <input type="text" placeholder="Ej. Juan Pérez" class="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#08071A] focus:outline-none focus:border-[#9235DF]" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Comensales</label>
                  <input type="number" value="2" class="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#08071A] focus:outline-none focus:border-[#9235DF]" />
                </div>
                <div>
                  <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hora</label>
                  <input type="time" value="21:00" class="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#08071A] focus:outline-none focus:border-[#9235DF]" />
                </div>
              </div>
            </div>

            <button @click="showSuccess('Reserva guardada con éxito')" class="w-full py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
              Confirmar Reserva
            </button>
          </div>

          <!-- Caja Modal -->
          <div v-if="activeModal === 'caja'" class="space-y-4">
            <h3 class="text-xl font-bold text-[#08071A] font-outfit">Flujo de Caja</h3>
            <p class="text-xs text-slate-400">Verifique o asigne el fondo inicial para la sesión de hoy.</p>

            <div class="space-y-3">
              <div>
                <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fondo de Apertura</label>
                <input type="text" value="250.00 €" disabled class="w-full mt-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-400 font-semibold cursor-not-allowed" />
              </div>
              <div class="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                <p class="text-[11px] text-emerald-800 leading-relaxed">
                  Caja inicializada de forma segura. El arqueo final contabilizará ventas acumuladas.
                </p>
              </div>
            </div>

            <button @click="showSuccess('Caja verificada')" class="w-full py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
              Aceptar
            </button>
          </div>
        </div>
      </div>

      <!-- HISTORICAL TICKET DETAIL MODAL -->
      <div
        v-if="showTicketDetailModal && selectedTicket"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4 print:p-0 print:static print:bg-white print:backdrop-blur-none"
        @click.self="showTicketDetailModal = false"
      >
        <div class="bg-white max-w-sm w-full p-6 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col print:max-h-full print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-full print:static">
          <!-- Close button -->
          <button
            @click="showTicketDetailModal = false"
            class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors print:hidden"
          >
            <i class="pi pi-times"></i>
          </button>

          <h3 class="text-sm font-black text-[#08071A] font-outfit border-b border-slate-100 pb-3 flex items-center gap-2 print:hidden">
            <i class="pi pi-receipt text-[#9235DF]"></i>
            <span>Detalle de Ticket Histórico</span>
          </h3>

          <div class="flex-1 overflow-y-auto p-4 bg-slate-50/50 rounded-2xl border border-slate-100 font-mono text-[10px] text-slate-800 space-y-4 print:p-0 print:border-none print:bg-white print:text-black print:overflow-visible">

            <!-- Invoice Header -->
            <div class="text-center space-y-1">
              <h4 class="font-black text-sm tracking-tight text-[#08071A] print:text-black">AVENIQ SYSTEM</h4>
              <p>AVENIQ RESTAURANTES S.L.</p>
              <p>C.I.F. B-884728192</p>
              <p>Calle Alcalá 44, Madrid</p>
              <p>Tlf: +34 912 345 678</p>
            </div>

            <!-- Meta info -->
            <div class="border-t border-dashed border-slate-300 pt-3 space-y-1 print:border-black">
              <p>TICKET ID: #{{ selectedTicket.id }}</p>
              <p>FECHA: {{ selectedTicket.timestamp ? 'Hoy' : 'Fecha no registrada' }}  HORA: {{ selectedTicket.timestamp || '--:--' }}</p>
              <p>MESA: M-{{ selectedTicket.tableNumber }}</p>
              <p>CAMARERO: Sofía</p>
              <p class="uppercase">LIQUIDACIÓN: {{ selectedTicket.settlementType === 'complimentary' ? 'Cortesía' : 'Pago' }}</p>
            </div>

            <!-- Products List -->
            <div class="border-t border-dashed border-slate-300 pt-3 space-y-2 print:border-black">
              <div class="flex justify-between font-bold">
                <span>DESCRIPCIÓN</span>
                <span>TOTAL</span>
              </div>

              <!-- Fallback if ordersSnapshot is not present -->
              <div v-if="!selectedTicket.ordersSnapshot" class="text-slate-400 py-1 text-[9px] italic">
                Información de productos no disponible para este ticket histórico
              </div>
              <div v-else class="space-y-1.5">
                <div
                  v-for="item in selectedTicket.ordersSnapshot"
                  :key="item.orderItemId"
                  class="space-y-0.5"
                >
                  <div class="flex justify-between">
                    <span>{{ item.quantity }}x {{ item.productName }}</span>
                    <span>{{ (item.totalCents / 100).toFixed(2) }}€</span>
                  </div>
                  <div class="text-[8px] text-slate-400 pl-2">
                    Precio unitario: {{ (item.unitPriceCents / 100).toFixed(2) }}€
                  </div>
                </div>
              </div>
            </div>

            <!-- Equal Split Shares -->
            <div v-if="selectedTicket.splitSummary" class="border-t border-dashed border-slate-300 pt-3 space-y-2 print:border-black">
              <div class="flex justify-between font-bold text-[9px] text-slate-500 uppercase tracking-wider">
                <span>División a Partes Iguales</span>
                <span>{{ selectedTicket.splitSummary.peopleCount }} pers.</span>
              </div>
              <div class="space-y-1 pl-2">
                <div v-for="sh in selectedTicket.splitSummary.shares" :key="sh.paymentId" class="flex justify-between text-[9px]">
                  <span>{{ sh.label }}</span>
                  <span class="font-bold">{{ (sh.amountCents / 100).toFixed(2) }} €</span>
                </div>
              </div>
            </div>

            <!-- Product Split Summary -->
            <div v-if="selectedTicket.productSplitSummary" class="border-t border-dashed border-slate-300 pt-3 space-y-2 print:border-black">
              <div class="flex justify-between font-bold text-[9px] text-slate-500 uppercase tracking-wider">
                <span>División por Productos</span>
                <span>{{ selectedTicket.productSplitSummary.peopleCount }} pers.</span>
              </div>
              <div class="space-y-3 pl-1">
                <div v-for="p in selectedTicket.productSplitSummary.people" :key="p.paymentId" class="space-y-1 p-2 bg-slate-50/80 rounded-xl border border-slate-100/50 print:bg-white print:border-none print:p-0">
                  <div class="flex justify-between font-bold text-slate-700 print:text-black">
                    <span>{{ p.label }}</span>
                    <span>{{ (p.amountCents / 100).toFixed(2) }} €</span>
                  </div>
                  <div class="space-y-0.5 pl-2 text-[9px] text-slate-500 print:text-black">
                    <div v-for="a in p.allocations" :key="a.orderItemId" class="flex justify-between">
                      <span>{{ a.quantity }}x {{ a.productName }}</span>
                      <span>{{ (a.amountCents / 100).toFixed(2) }} €</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial Totals Breakdowns -->
            <div class="border-t border-dashed border-slate-300 pt-3 space-y-1.5 text-right font-black print:border-black">
              <div class="flex justify-between">
                <span>TOTAL BRUTO:</span>
                <span>{{ (getGrossTotalCents(selectedTicket) / 100).toFixed(2) }}€</span>
              </div>

              <!-- Discount -->
              <div v-if="selectedTicket.discount" class="flex justify-between text-rose-600 font-bold print:text-black">
                <span>DESCUENTO ({{ selectedTicket.discount.reason === 'cortesia' ? 'CORTESÍA' : 'FIDELIZACIÓN' }}):</span>
                <span>-{{ (selectedTicket.discount.amountCents / 100).toFixed(2) }}€</span>
              </div>

              <div class="flex justify-between text-xs pt-1 border-t border-slate-200 print:border-black">
                <span>TOTAL NETO FACTURADO:</span>
                <span>{{ selectedTicket.total.toFixed(2) }}€</span>
              </div>

              <!-- Tip -->
              <div v-if="selectedTicket.tipCents && selectedTicket.tipCents > 0" class="flex justify-between text-indigo-600 font-bold print:text-black">
                <span>PROPINA RECAUDADA:</span>
                <span>{{ (selectedTicket.tipCents / 100).toFixed(2) }}€</span>
              </div>

              <div class="flex justify-between text-xs pt-1.5 border-t border-dashed border-slate-300 text-[#9235DF] print:text-black print:border-black">
                <span>TOTAL RECIBIDO:</span>
                <span>{{ ((Math.round(selectedTicket.total * 100) + (selectedTicket.tipCents ?? 0)) / 100).toFixed(2) }}€</span>
              </div>
            </div>

            <!-- Payment Breakdown Details -->
            <div class="border-t border-dashed border-slate-300 pt-3 space-y-2 print:border-black">
              <div class="font-bold text-[9px] text-slate-500 uppercase tracking-wider flex justify-between">
                <span>Desglose de Pago</span>
                <span v-if="selectedTicket.isMixedPayment" class="text-[8px] px-1.5 bg-indigo-50 border border-indigo-100 rounded text-indigo-600 font-black print:border-black">Mixto</span>
              </div>

              <div class="space-y-2">
                <div
                  v-for="(payment, idx) in getPaymentDetails(selectedTicket)"
                  :key="payment.id || idx"
                  class="p-2 bg-white rounded-xl border border-slate-100 space-y-1.5 text-[9px] print:border-none print:p-0"
                >
                  <div class="flex justify-between font-bold text-slate-700 print:text-black">
                    <span>Pago #{{ Number(idx) + 1 }} - {{ formatMethodLabel(payment.method) }}</span>
                    <span>{{ (payment.amountCents / 100).toFixed(2) }} €</span>
                  </div>

                  <div class="grid grid-cols-2 gap-y-0.5 text-slate-500 pl-1 print:text-black">
                    <span v-if="payment.tipCents">Propina:</span>
                    <span v-if="payment.tipCents" class="text-right font-semibold">{{ (payment.tipCents / 100).toFixed(2) }} €</span>

                    <!-- Cash received and Change -->
                    <template v-if="payment.method === 'cash'">
                      <span>Efectivo entregado:</span>
                      <span class="text-right font-semibold">
                        {{ payment.cashReceivedCents !== undefined ? (payment.cashReceivedCents / 100).toFixed(2) : ( (payment.amountCents + (payment.tipCents ?? 0)) / 100 ).toFixed(2) }} €
                      </span>
                      <span>Cambio a devolver:</span>
                      <span class="text-right font-bold text-emerald-600 print:text-black">{{ (getChangeCents(payment) / 100).toFixed(2) }} €</span>
                    </template>

                    <!-- Bizum Manual Verification -->
                    <template v-if="payment.method === 'bizum'">
                      <span class="col-span-2 text-indigo-600 font-bold flex items-center gap-1 print:text-black">
                        <i class="pi pi-check-circle text-[8px]"></i> Verificado manualmente
                      </span>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer info -->
            <div class="text-center pt-4 border-t border-dashed border-slate-300 text-slate-400 space-y-1 print:border-black">
              <p>*** GRACIAS POR SU VISITA ***</p>
              <p>Software homologado Aveniq POS</p>
            </div>
          </div>

          <!-- Dialog Print Actions -->
          <div class="flex gap-3 print:hidden">
            <button
              @click="triggerPrint"
              class="flex-1 py-3 bg-[#9235DF] hover:bg-[#7924c2] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <i class="pi pi-print"></i>
              <span>Imprimir / PDF</span>
            </button>
            <button
              @click="showTicketDetailModal = false"
              class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      </div>

<style scoped>
@media print {
  /* Hide all dashboard/app contents */
  #app > *:not(.print\:static) {
    display: none !important;
  }
  body > *:not(.print\:static) {
    display: none !important;
  }
  /* Style print area to take full page space */
  .print\:static {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    color: black !important;
    z-index: 99999 !important;
  }
  .print\:hidden {
    display: none !important;
  }
  .print\:p-0 {
    padding: 0 !important;
  }
  .print\:m-0 {
    margin: 0 !important;
  }
  .print\:border-none {
    border: none !important;
  }
  .print\:shadow-none {
    box-shadow: none !important;
  }
  .print\:max-h-full {
    max-height: none !important;
  }
  .print\:w-full {
    width: 100% !important;
  }
  .print\:max-w-full {
    max-width: none !important;
  }
  .print\:bg-white {
    background-color: white !important;
    background: white !important;
  }
  .print\:text-black {
    color: black !important;
  }
  .print\:overflow-visible {
    overflow: visible !important;
  }
  .print\:border-black {
    border-color: black !important;
  }
}
</style>

      <!-- SUCCESS NOTIFICATION TOAST -->
      <div
        v-if="toastMessage"
        class="fixed bottom-6 right-6 z-50 bg-[#08071A] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 border border-slate-800"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-xs font-bold">{{ toastMessage }}</span>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useMesasStore } from '../stores/mesas'
import { useReservasStore } from '../stores/reservas'
import { useCrmStore } from '../stores/crm'
import { useInventarioStore } from '../stores/inventario'
import { useEscandallosStore } from '../stores/escandallos'
import { usePersonalStore } from '../stores/personal'

const authStore = useAuthStore()
const mesasStore = useMesasStore()
const reservasStore = useReservasStore()
const crmStore = useCrmStore()
const inventarioStore = useInventarioStore()
const escandallosStore = useEscandallosStore()
const personalStore = usePersonalStore()

// Centralized mock data clearly marked as demonstration values
const demoData = {
  weather: 'Madrid • 24°C Despejado',
  salesTrend: '+14.2%',
  ticketAverageTrend: '+4.2%',
  reservasCount: '8 Reservas',
  proximaReserva: 'Mesa 4 • 21:00 (Gómez, 4 pax)',
  personalActivo: '4 Activos (1 Ausencia)',
  events: [
    { id: 1, title: 'Mesa 12 cumpleaños', time: '13:00', priority: 'Alta', desc: 'Montar tarta y globos solicitados en reserva.' },
    { id: 2, title: 'Reserva Gómez (8 pax)', time: '14:30', priority: 'Media', desc: 'Menú cerrado previamente acordado.' },
    { id: 3, title: 'Glovo', time: '14:15', priority: 'Normal', desc: 'Preparar embalajes ecológicos para el repartidor.' },
    { id: 4, title: 'Cambio de turno', time: '16:00', priority: 'Normal', desc: 'Relevo de cocineros, limpieza de planchas y recuento.' }
  ],
  healthStatus: {
    delivery: 'Conectado',
    inventario: 'Stock Bajo'
  }
}

const activeModal = ref<string | null>(null)
const toastMessage = ref<string | null>(null)

const userName = computed(() => {
  if (authStore.user?.name) {
    const parts = authStore.user.name.split(' ')
    return parts[0]
  }
  return 'Administrador'
})

const userInitials = computed(() => {
  if (authStore.user?.name) {
    const parts = authStore.user.name.split(' ')
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }
  return 'AD'
})

const formattedDate = computed(() => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  const dateStr = new Date().toLocaleDateString('es-ES', options)
  return dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
})

const totalSales = computed(() => {
  return mesasStore.completedOrders.reduce((sum, o) => sum + o.total, 0)
})

const totalTips = computed(() => {
  return mesasStore.completedOrders.reduce((sum, o) => sum + (o.tipCents ?? 0), 0) / 100
})

const cashBoxStatus = computed(() => {
  const total = 250.00 + totalSales.value
  return `Caja abierta • ${total.toFixed(2)} €`
})

const totalTablesCount = computed(() => {
  return mesasStore.tables.length
})

const occupiedTablesCount = computed(() => {
  return mesasStore.tables.filter(t => t.status === 'occupied' || t.status === 'bill').length
})

const averageTicket = computed(() => {
  const count = mesasStore.completedOrders.length
  if (count === 0) return 0
  return totalSales.value / count
})

// Quick Modals Actions
const openQuickActionModal = (action: string) => {
  activeModal.value = action
}

const openAvaAssistant = () => {
  activeModal.value = 'ava'
}

const closeModal = () => {
  activeModal.value = null
}

const showSuccess = (message: string) => {
  activeModal.value = null
  toastMessage.value = message
  setTimeout(() => {
    toastMessage.value = null
  }, 3000)
}

const toggleNotifications = () => {
  toastMessage.value = 'No tienes notificaciones pendientes'
  setTimeout(() => {
    toastMessage.value = null
  }, 2500)
}

const activeOrdersCount = computed(() => {
  return mesasStore.tables.reduce((sum, t) =>
    sum + t.orders.filter(o => o.status === 'pending' || o.status === 'preparing').reduce((s, item) => s + item.quantity, 0)
  , 0)
})

const kitchenOrdersCount = computed(() => {
  return mesasStore.tables.reduce((sum, t) =>
    sum + t.orders.filter(o => o.category !== 'bebidas' && (o.status === 'pending' || o.status === 'preparing')).reduce((s, item) => s + item.quantity, 0)
  , 0)
})

const barOrdersCount = computed(() => {
  return mesasStore.tables.reduce((sum, t) =>
    sum + t.orders.filter(o => o.category === 'bebidas' && (o.status === 'pending' || o.status === 'preparing')).reduce((s, item) => s + item.quantity, 0)
  , 0)
})

const servedOrdersCount = computed(() => {
  const activeServed = mesasStore.tables.reduce((sum, t) =>
    sum + t.orders.filter(o => o.status === 'served').reduce((s, item) => s + item.quantity, 0)
  , 0)
  const historicalServed = mesasStore.completedOrders.reduce((sum, o) => sum + o.itemsCount, 0)
  return activeServed + historicalServed
})

const avgPrepTime = computed(() => {
  const activeKitchen = mesasStore.tables.reduce((acc, t) => acc + t.orders.filter(o => o.status === 'preparing').length, 0)
  if (activeKitchen === 0) return '8.5'
  return (8.5 + (activeKitchen * 0.4)).toFixed(1)
})

const reservationsToday = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  return reservasStore.reservations.filter(r => r.date === todayStr)
})

const totalReservasCount = computed(() => reservationsToday.value.length)

const expectedClients = computed(() => {
  return reservationsToday.value.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + r.pax, 0)
})

const reservedTablesCount = computed(() => {
  return new Set(reservationsToday.value.filter(r => r.status === 'confirmed' || r.status === 'seated').map(r => r.tableId).filter(Boolean)).size
})

const noShowCount = computed(() => {
  return reservationsToday.value.filter(r => r.status === 'noshow').length
})

const expectedOccupation = computed(() => {
  const totalCapacity = mesasStore.tables.reduce((sum, t) => sum + t.capacity, 0)
  if (totalCapacity === 0) return 0
  const bookedCapacity = reservationsToday.value.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + r.pax, 0)
  return Math.min(100, Math.round((bookedCapacity / totalCapacity) * 100))
})

const crmActiveClients = computed(() => {
  return crmStore.clients.filter(c => c.visitsCount >= 4).length
})

const crmNewClients = computed(() => {
  return crmStore.clients.filter(c => c.visitsCount <= 1).length
})

const crmVipClients = computed(() => {
  return crmStore.clients.filter(c => c.tags.includes('VIP')).length
})

const crmAvgTicketGlobal = computed(() => {
  const active = crmStore.clients.filter(c => c.visitsCount > 0)
  if (active.length === 0) return 0
  return active.reduce((sum, c) => sum + c.avgTicket, 0) / active.length
})

const crmClientsResToday = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  return new Set(reservasStore.reservations.filter(r => r.date === todayStr && r.status !== 'cancelled').map(r => r.clientName.toLowerCase())).size
})

const erpCriticalProducts = computed(() => {
  return inventarioStore.products.filter(p => p.stock < p.minStock && p.stock > 0).length
})

const erpWarehouseValue = computed(() => {
  return inventarioStore.products.reduce((sum, p) => sum + (p.stock * p.cost), 0)
})

const erpOutOfStockProducts = computed(() => {
  return inventarioStore.products.filter(p => p.stock === 0).length
})

const erpMovementsTodayCount = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  return inventarioStore.movements.filter(m => m.date === todayStr).length
})

const fcCosteMedioPlato = computed(() => {
  const len = escandallosStore.recipesWithCosts.length
  if (len === 0) return 0
  return escandallosStore.recipesWithCosts.reduce((sum, r) => sum + r.totalCost, 0) / len
})

const fcMargenMedio = computed(() => {
  const len = escandallosStore.recipesWithCosts.length
  if (len === 0) return 0
  return escandallosStore.recipesWithCosts.reduce((sum, r) => sum + r.marginPercent, 0) / len
})

const fcProductoMasRentable = computed(() => {
  if (escandallosStore.recipesWithCosts.length === 0) return 'Ninguno'
  const sorted = [...escandallosStore.recipesWithCosts].sort((a, b) => b.marginPercent - a.marginPercent)
  return `${sorted[0].name} (${sorted[0].marginPercent.toFixed(0)}%)`
})

const fcProductoMenosRentable = computed(() => {
  if (escandallosStore.recipesWithCosts.length === 0) return 'Ninguno'
  const sorted = [...escandallosStore.recipesWithCosts].sort((a, b) => a.marginPercent - b.marginPercent)
  return `${sorted[0].name} (${sorted[0].marginPercent.toFixed(0)}%)`
})

const wfActiveEmployees = computed(() => {
  return personalStore.employees.length
})

const wfEmployeesOnShift = computed(() => {
  return personalStore.employees.filter(e => e.status === 'activo' || e.status === 'descanso').length
})

const wfLabourCostToday = computed(() => {
  return personalStore.employees
    .filter(e => e.status === 'activo' || e.status === 'descanso')
    .reduce((sum, e) => sum + (e.hourlyCost * 8), 0)
})

const wfProductivityRatio = computed(() => {
  const salesToday = mesasStore.completedOrders.reduce((sum, o) => sum + o.total, 0)
  const costToday = wfLabourCostToday.value
  if (costToday === 0) return 0
  return salesToday / costToday
})

// Must remain aligned with validated KDS/BDS thresholds.
// Kitchen: 10/20 min. Bar: 5/10 min.
const KITCHEN_ATTENTION_THRESHOLD_MINUTES = 10
const KITCHEN_URGENT_THRESHOLD_MINUTES = 20
const BAR_ATTENTION_THRESHOLD_MINUTES = 5
const BAR_URGENT_THRESHOLD_MINUTES = 10

const OP_ALERT_RANK = {
  none: 0,
  normal: 1,
  attention: 2,
  urgent: 3
} as const

const nowRef = ref(Date.now())
let operationalClockInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  nowRef.value = Date.now()
  operationalClockInterval = setInterval(() => {
    nowRef.value = Date.now()
  }, 60_000)
})

onUnmounted(() => {
  if (operationalClockInterval !== null) {
    clearInterval(operationalClockInterval)
    operationalClockInterval = null
  }
})

// Helpers
const opGetLineStation = (item: any): 'KITCHEN' | 'BAR' | 'UNKNOWN' => {
  const station = item.productionStation
  if (station === 'KITCHEN') return 'KITCHEN'
  if (station === 'BAR') return 'BAR'
  if (!station) {
    if (item.category === 'bebidas') return 'BAR'
    if (item.category) return 'KITCHEN'
  }
  return 'UNKNOWN'
}

const opGetLineAlertLevel = (item: any): 'normal' | 'attention' | 'urgent' | 'none' => {
  if (item.status === 'ready' || item.status === 'served') return 'none'
  const ts = item.createdAt
  if (typeof ts !== 'number' || !Number.isFinite(ts) || nowRef.value - ts < 0) return 'none'

  const elapsed = Math.floor((nowRef.value - ts) / 60_000)
  const station = opGetLineStation(item)
  if (station === 'KITCHEN') {
    return elapsed >= KITCHEN_URGENT_THRESHOLD_MINUTES ? 'urgent' : elapsed >= KITCHEN_ATTENTION_THRESHOLD_MINUTES ? 'attention' : 'normal'
  }
  if (station === 'BAR') {
    return elapsed >= BAR_URGENT_THRESHOLD_MINUTES ? 'urgent' : elapsed >= BAR_ATTENTION_THRESHOLD_MINUTES ? 'attention' : 'normal'
  }
  return 'none'
}

interface OpTableWaitingData {
  tableId: string
  tableNumber: number
  oldestCreatedAt?: number
  timeState: 'past' | 'future' | 'invalid'
  displayTime: string
  alertLevel: 'normal' | 'attention' | 'urgent' | 'none'
  criticalStation: 'Cocina' | 'Barra' | 'Ninguna'
  stations: string
}

// Consolidated Metrics
const opDashboardMetrics = computed(() => {
  let tablesInService = 0
  let pendingLinesCount = 0
  let preparingLinesCount = 0
  let urgentTablesCount = 0
  let kitchenActiveLinesCount = 0
  let barActiveLinesCount = 0
  const longestWaitingTables: OpTableWaitingData[] = []

  mesasStore.tables.forEach(t => {
    let hasActive = false
    let hasService = false
    let oldestPast: number | undefined = undefined
    let oldestFuture: number | undefined = undefined

    let highestLevel: 'normal' | 'attention' | 'urgent' | 'none' = 'none'
    let criticalStation: 'Cocina' | 'Barra' | 'Ninguna' = 'Ninguna'
    let criticalTimestamp: number | null = null
    const stationsSet = new Set<string>()

    for (const o of t.orders) {
      if (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready') {
        hasService = true
      }

      if (o.status === 'pending' || o.status === 'preparing') {
        hasActive = true
        if (o.status === 'pending') pendingLinesCount++
        else preparingLinesCount++

        const station = opGetLineStation(o)
        if (station === 'KITCHEN') {
          kitchenActiveLinesCount++
          stationsSet.add('Cocina')
        } else if (station === 'BAR') {
          barActiveLinesCount++
          stationsSet.add('Barra')
        }

        const ts = o.createdAt
        if (typeof ts === 'number' && Number.isFinite(ts)) {
          if (ts <= nowRef.value) {
            if (oldestPast === undefined || ts < oldestPast) oldestPast = ts
          } else {
            if (oldestFuture === undefined || ts < oldestFuture) oldestFuture = ts
          }
        }

        // Alert Level evaluation
        const level = opGetLineAlertLevel(o)
        const rank = OP_ALERT_RANK[level]
        const highestRank = OP_ALERT_RANK[highestLevel]

        const levelStation = station === 'KITCHEN' ? 'Cocina' : station === 'BAR' ? 'Barra' : 'Ninguna'
        const levelTs = typeof ts === 'number' && Number.isFinite(ts) && ts <= nowRef.value ? ts : null

        if (rank > highestRank) {
          highestLevel = level
          criticalStation = levelStation
          criticalTimestamp = levelTs
        } else if (rank === highestRank && level !== 'none') {
          if (levelTs !== null) {
            if (criticalTimestamp === null || levelTs < criticalTimestamp) {
              criticalStation = levelStation
              criticalTimestamp = levelTs
            }
          }
        }
      }
    }

    if (hasService) tablesInService++
    if (highestLevel === 'urgent') urgentTablesCount++

    if (hasActive) {
      let displayTime = 'Sin hora'
      let timeState: 'past' | 'future' | 'invalid' = 'invalid'
      let representativeTs = oldestPast

      if (oldestPast !== undefined) {
        timeState = 'past'
        const elapsed = Math.floor((nowRef.value - oldestPast) / 60_000)
        displayTime = `${elapsed} min`
      } else if (oldestFuture !== undefined) {
        timeState = 'future'
        displayTime = 'Hora futura'
        representativeTs = oldestFuture
      }

      longestWaitingTables.push({
        tableId: t.id,
        tableNumber: t.number,
        oldestCreatedAt: representativeTs,
        timeState,
        displayTime,
        alertLevel: highestLevel,
        criticalStation,
        stations: stationsSet.size > 0 ? Array.from(stationsSet).join(' y ') : 'Sin clasificar'
      })
    }
  })

  // Sort and slice longest waiting tables
  longestWaitingTables.sort((a, b) => {
    if (a.timeState === 'past' && b.timeState !== 'past') return -1
    if (a.timeState !== 'past' && b.timeState === 'past') return 1
    if (a.timeState === 'past' && b.timeState === 'past') return a.oldestCreatedAt! - b.oldestCreatedAt!

    if (a.timeState === 'future' && b.timeState !== 'future') return -1
    if (a.timeState !== 'future' && b.timeState === 'future') return 1
    if (a.timeState === 'future' && b.timeState === 'future') return a.oldestCreatedAt! - b.oldestCreatedAt!

    return a.tableNumber - b.tableNumber
  })

  return {
    tablesInService,
    pendingLinesCount,
    preparingLinesCount,
    urgentTablesCount,
    kitchenActiveLinesCount,
    barActiveLinesCount,
    longestWaitingTables: longestWaitingTables.slice(0, 5)
  }
})

// KPI configuration for iteration
const opKpiCards = computed(() => [
  {
    key: 'tables',
    label: 'Mesas en servicio',
    value: opDashboardMetrics.value.tablesInService,
    helper: 'mesas activas',
    icon: 'pi-users',
    valueClass: 'text-[#08071A]'
  },
  {
    key: 'pending',
    label: 'Líneas pendientes',
    value: opDashboardMetrics.value.pendingLinesCount,
    helper: 'comandas en cola',
    icon: 'pi-clock text-sky-500',
    valueClass: 'text-[#08071A]'
  },
  {
    key: 'preparing',
    label: 'En preparación',
    value: opDashboardMetrics.value.preparingLinesCount,
    helper: 'en elaboración',
    icon: 'pi-spinner text-[#9235DF]',
    valueClass: 'text-[#08071A]'
  },
  {
    key: 'urgent',
    label: 'Mesas urgentes',
    value: opDashboardMetrics.value.urgentTablesCount,
    helper: 'espera excedida',
    icon: 'pi-exclamation-triangle text-rose-500',
    valueClass: opDashboardMetrics.value.urgentTablesCount > 0 ? 'text-rose-600' : 'text-[#08071A]'
  }
])

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

  // Trigger brief alert
  toastMessage.value = `Venta simulada registrada en Mesa ${tableNum} por ${total.toFixed(2)} €`
  setTimeout(() => {
    toastMessage.value = null
  }, 3000)
}

const showTicketDetailModal = ref(false)
const selectedTicket = ref<any>(null)

const getGrossTotalCents = (ticket: any) => {
  if (!ticket) return 0
  if (ticket.grossTotalCents !== undefined) return ticket.grossTotalCents
  if (ticket.ordersSnapshot) {
    return ticket.ordersSnapshot.reduce((sum: number, item: any) => sum + item.totalCents, 0)
  }
  return Math.round(ticket.total * 100)
}

const getChangeCents = (payment: any) => {
  if (!payment) return 0
  const cash = payment.cashReceivedCents ?? (payment.amountCents + (payment.tipCents ?? 0))
  const diff = cash - payment.amountCents - (payment.tipCents ?? 0)
  return diff >= 0 ? diff : 0
}

const formatMethodLabel = (method: string): string => {
  if (method === 'cash') return 'Efectivo'
  if (method === 'card') return 'Tarjeta'
  if (method === 'bizum') return 'Bizum'
  if (method === 'complimentary') return 'Cortesía'
  return method
}

const getPaymentDetails = (ticket: any) => {
  if (!ticket) return []
  if (ticket.payments && ticket.payments.length > 0) {
    return ticket.payments
  }
  // For legacy completed orders, build a single payment matching the total
  return [{
    id: 'legacy-p',
    amountCents: Math.round(ticket.total * 100),
    tipCents: ticket.tipCents,
    method: ticket.paymentMethod,
    createdAt: ticket.timestamp,
    verifiedManually: ticket.paymentMethod === 'bizum' ? true : undefined
  }]
}

const triggerPrint = () => {
  window.print()
}
</script>
