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

          <!-- 3. KPIs CON SPARKLINES -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">Rendimiento Operativo</h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">

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
                class="pt-4 first:pt-0 flex items-center justify-between text-xs"
              >
                <div class="space-y-1">
                  <p class="font-bold text-[#08071A]">Mesa {{ order.tableNumber }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">#{{ order.id }} • {{ order.timestamp }}</p>
                </div>
                <div class="text-right space-y-1">
                  <p class="font-black text-[#08071A] text-sm">{{ order.total.toFixed(2) }} €</p>
                  <span :class="['inline-block text-[8px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase',
                    order.paymentMethod === 'card' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200/60' : 'bg-emerald-50 text-emerald-600 border border-emerald-200/60']">
                    {{ order.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo' }}
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
import { ref, computed } from 'vue'
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
</script>
