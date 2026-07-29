<template>
  <div class="bg-[#F8F9FA] min-h-[calc(100vh-4rem)] text-[#08071A] font-inter antialiased select-none">
    
    <!-- MAIN RESERVATIONS CONTAINER -->
    <div class="w-full max-w-[1600px] mx-auto p-4 md:p-6 h-[calc(100vh-6rem)] flex flex-col gap-6">
      
      <!-- HEADER -->
      <div class="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shrink-0">
        <div>
          <span class="text-[10px] font-bold text-[#9235DF] uppercase tracking-widest">Aveniq Reservations</span>
          <h2 class="text-2xl font-black tracking-tight font-outfit text-[#08071A] mt-0.5">
            Libro de Reservas
          </h2>
          <p class="text-xs text-slate-400 font-medium">Control de comensales, solapamiento de mesas y tiempos de estancia en Sala.</p>
        </div>

        <div class="flex items-center gap-3">
          <button 
            @click="openNewReservationModal"
            class="px-4 py-2.5 bg-gradient-to-tr from-[#9235DF] to-[#562AAC] hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 active:scale-95 transition-all"
          >
            <i class="pi pi-plus"></i>
            <span>Nueva Reserva</span>
          </button>
        </div>
      </div>

      <!-- MAIN CONTENT GRID -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-10 gap-6 overflow-hidden min-h-0">
        
        <!-- LEFT COLUMN: CALENDAR & FILTERS (2.5/10 equivalent to 25%) -->
        <div class="lg:col-span-2.5 lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col gap-5 overflow-hidden shadow-sm">
          <div class="space-y-4 shrink-0">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">Planificación</h3>
            
            <!-- Calendar View Switches -->
            <div class="flex p-0.5 bg-slate-50 border border-slate-100 rounded-xl">
              <button
                v-for="v in calendarViews"
                :key="v.value"
                @click="activeCalendarView = v.value"
                :class="['flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all cursor-pointer',
                  activeCalendarView === v.value ? 'bg-white text-[#9235DF] shadow-sm border border-slate-200/20' : 'text-slate-500 hover:text-slate-800']"
              >
                {{ v.label }}
              </button>
            </div>

            <!-- Shifts Filter -->
            <div class="space-y-1.5">
              <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Turno del Servicio</label>
              <div class="flex gap-1.5">
                <button
                  v-for="s in shiftOptions"
                  :key="s.value"
                  @click="activeShiftFilter = s.value"
                  :class="['flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer border',
                    activeShiftFilter === s.value 
                      ? 'bg-[#9235DF]/10 border-[#9235DF] text-[#9235DF]' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50']"
                >
                  {{ s.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Date Selector Panel -->
          <div class="flex-1 overflow-y-auto pr-1 space-y-4">
            <!-- Simplified Calendar Days list for the current month -->
            <div class="space-y-2">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Calendario Mensual</span>
              <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 pb-1.5 border-b border-slate-50">
                <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
              </div>
              <div class="grid grid-cols-7 gap-1">
                <button
                  v-for="day in calendarDays"
                  :key="day.dateStr"
                  @click="selectDate(day.dateStr)"
                  :class="[
                    'py-2.5 rounded-lg font-black text-xs transition-all cursor-pointer active:scale-90 flex flex-col items-center justify-center relative',
                    day.isToday ? 'border border-[#9235DF]/30' : '',
                    selectedDateStr === day.dateStr 
                      ? 'bg-[#9235DF] text-white shadow-md shadow-[#9235DF]/20' 
                      : 'bg-white hover:bg-slate-50 text-slate-700'
                  ]"
                >
                  <span>{{ day.dayNum }}</span>
                  <span 
                    v-if="getDayReservationsCount(day.dateStr) > 0" 
                    :class="['w-1.5 h-1.5 rounded-full absolute bottom-1', selectedDateStr === day.dateStr ? 'bg-white' : 'bg-[#9235DF]']"
                  ></span>
                </button>
              </div>
            </div>

            <!-- Date summary info -->
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
              <div class="flex justify-between">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Día Activo:</span>
                <span class="font-black text-slate-700 font-mono">{{ formattedActiveDate }}</span>
              </div>
              <div class="flex justify-between border-t border-slate-200/60 pt-2 text-slate-500">
                <span>Reservas totales:</span>
                <span class="font-bold text-slate-800">{{ activeDayReservations.length }}</span>
              </div>
              <div class="flex justify-between text-slate-500">
                <span>Total pax previstos:</span>
                <span class="font-bold text-[#9235DF]">{{ activeDayPaxTotal }} pax</span>
              </div>
            </div>
          </div>
        </div>

        <!-- CENTER COLUMN: TIMELINE & SATELLITE ROOM MAP (4.5/10 equivalent to 45%) -->
        <div class="lg:col-span-4 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between overflow-hidden shadow-sm">
          <div class="flex flex-col gap-3 shrink-0">
            <div class="flex justify-between items-center">
              <h3 class="text-sm font-black text-[#08071A] uppercase tracking-wider">Centro de Control</h3>
              <!-- Tab Selector -->
              <div class="flex p-0.5 bg-slate-50 border border-slate-100 rounded-lg">
                <button
                  @click="activeCenterTab = 'timeline'"
                  :class="['px-3 py-1.5 text-[9px] font-black rounded-lg transition-all cursor-pointer',
                    activeCenterTab === 'timeline' ? 'bg-white text-[#9235DF] shadow-sm' : 'text-slate-500 hover:text-slate-800']"
                >
                  Timeline
                </button>
                <button
                  @click="activeCenterTab = 'sala'"
                  :class="['px-3 py-1.5 text-[9px] font-black rounded-lg transition-all cursor-pointer',
                    activeCenterTab === 'sala' ? 'bg-white text-[#9235DF] shadow-sm' : 'text-slate-500 hover:text-slate-800']"
                >
                  Asignación Plano
                </button>
              </div>
            </div>
          </div>

          <!-- TAB 1: TIMELINE -->
          <div v-show="activeCenterTab === 'timeline'" class="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            <div v-if="filteredReservations.length === 0" class="text-center py-12 text-slate-350 text-xs">
              No hay reservas programadas para este turno/día.
            </div>

            <!-- Interactive Timeline Schedule List -->
            <div v-else class="space-y-3">
              <div
                v-for="res in sortedFilteredReservations"
                :key="res.id"
                @click="selectedRes = res"
                draggable="true"
                @dragstart="handleDragStartRes($event, res)"
                :class="[
                  'p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between group shadow-sm select-none',
                  selectedRes?.id === res.id 
                    ? 'ring-2 ring-[#9235DF] bg-[#9235DF]/5 border-[#9235DF]' 
                    : 'bg-white border-slate-100 hover:border-slate-300'
                ]"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div :class="['w-10 h-10 rounded-xl flex flex-col items-center justify-center font-bold font-mono', getStatusBgClass(res.status)]">
                    <span class="text-xs leading-none">{{ res.time }}</span>
                    <span class="text-[8px] uppercase tracking-wider mt-0.5">{{ res.pax }} pax</span>
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-xs font-black text-slate-800 truncate flex items-center gap-1.5">
                      {{ res.clientName }}
                      <span v-if="res.allergies" class="w-1.5 h-1.5 rounded-full bg-rose-500" title="Alergia alimentaria crítica"></span>
                    </h4>
                    <p class="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                      Mesa {{ getTableNumberById(res.tableId) }} • {{ res.duration }} min
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <span :class="['px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider', getStatusTextClass(res.status)]">
                    {{ getStatusLabel(res.status) }}
                  </span>
                  <i class="pi pi-angle-right text-[10px] text-slate-300 group-hover:translate-x-0.5 transition-transform"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: INTERACTIVE ROOM MAP -->
          <div v-show="activeCenterTab === 'sala'" class="flex-1 relative bg-slate-50 rounded-3xl border border-slate-100/50 overflow-hidden my-4">
            
            <!-- Simplified tables layout coordinates rendering -->
            <div class="absolute inset-0 p-6 flex items-center justify-center">
              <div class="w-full h-full relative max-w-[480px] max-h-[360px] border border-slate-200/40 rounded-2xl bg-white shadow-inner overflow-hidden">
                <div 
                  v-for="table in mesasStore.tables" 
                  :key="table.id"
                  @dragover.prevent
                  @drop="handleDropRes($event, table.id)"
                  :style="{
                    left: `${table.x}%`,
                    top: `${table.y}%`
                  }"
                  :class="[
                    'absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-300 rounded-2xl w-16 h-16 border shadow-sm select-none',
                    getTableResStatusClass(table.id)
                  ]"
                >
                  <span class="text-[10px] font-black text-slate-900 leading-none">M-{{ table.number }}</span>
                  <span class="text-[8px] text-slate-400 font-medium mt-0.5">{{ table.capacity }} pax</span>
                  
                  <!-- Reservation label on table card -->
                  <span 
                    v-if="getTableActiveRes(table.id)"
                    draggable="true"
                    @dragstart="handleDragStartRes($event, getTableActiveRes(table.id)!)"
                    class="mt-1 px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8px] font-black truncate max-w-[54px] cursor-grab active:cursor-grabbing"
                    :title="getTableActiveRes(table.id)?.clientName"
                  >
                    {{ getTableActiveRes(table.id)?.clientName.split(' ').pop() }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Legend info -->
            <div class="absolute bottom-3 inset-x-0 flex justify-center gap-4 text-[9px] font-bold text-slate-500 select-none">
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded bg-white border border-slate-200"></span> Libre</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded bg-indigo-50 border border-indigo-300"></span> Reservada</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded bg-[#9235DF]/10 border-[#9235DF]/30"></span> En Servicio</span>
            </div>
          </div>

          <!-- Bottom Summary Status counts -->
          <div class="border-t border-slate-100 pt-4 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 bg-white">
            <span class="text-blue-600">{{ getStatusCount('confirmed') }} Confirmadas</span>
            <span class="text-purple-600">{{ getStatusCount('seated') }} Sentados</span>
            <span class="text-rose-600">{{ getStatusCount('noshow') }} No Show</span>
            <span class="text-slate-500">{{ getStatusCount('finished') }} Finalizadas</span>
          </div>
        </div>

        <!-- RIGHT COLUMN: RESERVATION DETAILS & VALIDATION (3/10 equivalent to 30%) -->
        <div class="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between overflow-y-auto shadow-sm">
          <div v-if="!selectedRes" class="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-350">
            <div class="w-12 h-12 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-500">
              <i class="pi pi-user text-lg"></i>
            </div>
            <h4 class="text-xs font-black uppercase tracking-wider mt-3">Ficha de Reserva</h4>
            <p class="text-xs text-slate-400 mt-1 max-w-[200px] leading-relaxed">
              Seleccione una reserva del Timeline para ver los datos del cliente y ejecutar operaciones.
            </p>
          </div>

          <div v-else class="flex-1 flex flex-col justify-between h-full space-y-6">
            <div class="space-y-6">
              <div class="border-b border-slate-50 pb-3.5 flex justify-between items-start">
                <div>
                  <h3 class="text-base font-black text-slate-900 font-outfit">{{ selectedRes.clientName }}</h3>
                  <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Ficha de Cliente • ID: {{ selectedRes.id }}</p>
                </div>
                <span :class="['px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border', getStatusTextClass(selectedRes.status)]">
                  {{ getStatusLabel(selectedRes.status) }}
                </span>
              </div>

              <!-- General Fields Grid -->
              <div class="space-y-4 text-xs">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Teléfono</label>
                    <p class="font-bold text-slate-800 mt-1">{{ selectedRes.phone }}</p>
                  </div>
                  <div>
                    <label class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Email</label>
                    <p class="font-bold text-slate-800 mt-1 truncate">{{ selectedRes.email }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3 border-t border-slate-50 pt-3.5">
                  <div>
                    <label class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Pax / Comensales</label>
                    <p class="font-bold text-slate-800 mt-1">{{ selectedRes.pax }} personas</p>
                  </div>
                  <div>
                    <label class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Mesa Asignada</label>
                    <select 
                      :value="selectedRes.tableId || ''"
                      @change="(e) => changeResTable(selectedRes!.id, (e.target as HTMLSelectElement).value)"
                      class="mt-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-[11px] font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="">Sin Mesa</option>
                      <option 
                        v-for="table in mesasStore.tables" 
                        :key="table.id" 
                        :value="table.id"
                      >
                        Mesa {{ table.number }} ({{ table.capacity }} pax)
                      </option>
                    </select>
                  </div>
                </div>

                <div class="border-t border-slate-50 pt-3.5 space-y-2">
                  <div v-if="selectedRes.allergies" class="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700">
                    <span class="text-[8px] font-black uppercase tracking-wider block">⚠️ Alergias Críticas</span>
                    <span class="font-bold mt-0.5 block">{{ selectedRes.allergies }}</span>
                  </div>

                  <div v-if="selectedRes.preferences" class="p-2.5 bg-slate-50 rounded-xl text-slate-600">
                    <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Preferencias</span>
                    <span class="font-bold mt-0.5 block">{{ selectedRes.preferences }}</span>
                  </div>

                  <div v-if="selectedRes.celebration" class="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700">
                    <span class="text-[8px] font-black uppercase tracking-wider block">🎉 Celebración Especial</span>
                    <span class="font-bold mt-0.5 block">{{ selectedRes.celebration }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Operations Actions Buttons -->
            <div class="space-y-2 pt-4 border-t border-slate-100">
              <button
                v-if="selectedRes.status === 'pending'"
                @click="updateStatus(selectedRes.id, 'confirmed')"
                class="w-full py-2.5 bg-[#9235DF] hover:bg-[#562AAC] text-white font-black text-xs rounded-xl shadow transition-all cursor-pointer"
              >
                Confirmar Reserva
              </button>

              <button
                v-if="selectedRes.status === 'confirmed'"
                @click="seatGuests(selectedRes)"
                class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <i class="pi pi-check-circle"></i>
                <span>Sentar Clientes (Ocupar Mesa)</span>
              </button>

              <button
                v-if="selectedRes.status === 'seated'"
                @click="updateStatus(selectedRes.id, 'finished')"
                class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition-all cursor-pointer"
              >
                Finalizar Servicio
              </button>

              <div class="grid grid-cols-2 gap-2 pt-1">
                <button
                  v-if="selectedRes.status !== 'cancelled' && selectedRes.status !== 'finished'"
                  @click="updateStatus(selectedRes.id, 'cancelled')"
                  class="py-2 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  v-if="selectedRes.status !== 'noshow' && selectedRes.status !== 'finished'"
                  @click="updateStatus(selectedRes.id, 'noshow')"
                  class="py-2 border border-slate-200 text-slate-500 hover:text-amber-700 hover:bg-amber-50 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                >
                  No Show
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>

    <!-- DIALOG MODAL: NEW RESERVATION -->
    <div
      v-if="showNewModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          @click="showNewModal = false"
          class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <div>
          <h3 class="text-xl font-bold text-[#08071A] flex items-center gap-2 font-outfit">
            <i class="pi pi-calendar text-[#9235DF]"></i>
            <span>Nueva Reserva</span>
          </h3>
          <p class="text-xs text-slate-400 mt-1">Introduzca los datos para registrar y asignar una mesa comercial.</p>
        </div>

        <!-- Warning block for overlapping errors -->
        <div v-if="warningMessage" class="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex gap-2.5 text-xs text-amber-800">
          <i class="pi pi-exclamation-triangle text-amber-600 mt-0.5"></i>
          <div>
            <p class="font-bold">Aviso de Validación</p>
            <p class="mt-0.5 text-[11px] leading-relaxed">{{ warningMessage }}</p>
          </div>
        </div>

        <!-- Form fields -->
        <form @submit.prevent="saveNewReservation" class="space-y-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Nombre del Cliente</label>
            <input 
              v-model="newForm.clientName" 
              required 
              type="text" 
              placeholder="Ej. Familia Gómez" 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#9235DF]"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Teléfono</label>
              <input 
                v-model="newForm.phone" 
                required 
                type="text" 
                placeholder="+34 600 000 000" 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
              />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Comensales (Pax)</label>
              <input 
                v-model.number="newForm.pax" 
                required 
                type="number" 
                min="1" 
                max="12" 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Hora</label>
              <input 
                v-model="newForm.time" 
                required 
                type="time" 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
              />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Asignar Mesa</label>
              <select 
                v-model="newForm.tableId"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
              >
                <option value="">Sin Asignar</option>
                <option 
                  v-for="table in mesasStore.tables" 
                  :key="table.id" 
                  :value="table.id"
                >
                  Mesa {{ table.number }} ({{ table.capacity }} pax)
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Alergias</label>
              <input 
                v-model="newForm.allergies" 
                type="text" 
                placeholder="Ej. Mariscos, Gluten" 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
              />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Celebración</label>
              <input 
                v-model="newForm.celebration" 
                type="text" 
                placeholder="Ej. Aniversario" 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
              />
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="pt-4 flex gap-3">
            <button
              type="button"
              @click="showNewModal = false"
              class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Guardar Reserva
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useReservasStore, type Reservation } from '../stores/reservas'
import { useMesasStore } from '../stores/mesas'

const reservasStore = useReservasStore()
const mesasStore = useMesasStore()

// Navigation/Calendar View details
const selectedDateStr = ref(new Date().toISOString().split('T')[0])
const activeCalendarView = ref<'day' | 'week' | 'month'>('month')
const activeShiftFilter = ref<'all' | 'lunch' | 'dinner'>('all')
const activeCenterTab = ref<'timeline' | 'sala'>('timeline')

const calendarViews = [
  { label: 'Día', value: 'day' as const },
  { label: 'Semana', value: 'week' as const },
  { label: 'Mes', value: 'month' as const }
]

const shiftOptions = [
  { label: 'Todos', value: 'all' as const },
  { label: 'Comida', value: 'lunch' as const },
  { label: 'Cena', value: 'dinner' as const }
]

const selectedRes = ref<Reservation | null>(null)
const showNewModal = ref(false)
const warningMessage = ref<string | null>(null)

const newForm = ref({
  clientName: '',
  phone: '',
  email: '',
  pax: 2,
  time: '14:00',
  duration: 90,
  tableId: '',
  notes: '',
  allergies: '',
  preferences: '',
  celebration: ''
})

// Dynamic calendar generation for current month
const calendarDays = computed(() => {
  const days = []
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  // Generate 28 days for preview
  for (let i = 1; i <= 28; i++) {
    const d = new Date(year, month, i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      dayNum: i,
      dateStr,
      isToday: new Date().getDate() === i
    })
  }
  return days
})

const getDayReservationsCount = (dateStr: string): number => {
  return reservasStore.reservations.filter(r => r.date === dateStr).length
}

const selectDate = (dateStr: string) => {
  selectedDateStr.value = dateStr
  selectedRes.value = null
}

const formattedActiveDate = computed(() => {
  const d = new Date(selectedDateStr.value)
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
})

// Calculations totals
const activeDayReservations = computed(() => {
  return reservasStore.reservations.filter(r => r.date === selectedDateStr.value)
})

const activeDayPaxTotal = computed(() => {
  return activeDayReservations.value
    .filter(r => r.status !== 'cancelled')
    .reduce((sum, r) => sum + r.pax, 0)
})

// Filters mapping
const filteredReservations = computed(() => {
  return activeDayReservations.value.filter(res => {
    if (activeShiftFilter.value === 'all') return true
    const hour = parseInt(res.time.split(':')[0])
    if (activeShiftFilter.value === 'lunch') return hour >= 12 && hour < 17
    if (activeShiftFilter.value === 'dinner') return hour >= 19 && hour <= 23
    return false
  })
})

const sortedFilteredReservations = computed(() => {
  return filteredReservations.value.slice().sort((a, b) => a.time.localeCompare(b.time))
})

// Table mapping helpers
const getTableNumberById = (tableId?: string): string => {
  if (!tableId) return 'Sin asignar'
  const t = mesasStore.tables.find(x => x.id === tableId)
  return t ? String(t.number) : 'Sin asignar'
}

const getTableActiveRes = (tableId: string): Reservation | null => {
  // Find confirmed or seated reservation assigned to this table today
  return activeDayReservations.value.find(r => 
    r.tableId === tableId && 
    (r.status === 'confirmed' || r.status === 'seated')
  ) || null
}

// Colors and visual styling helpers
const getStatusLabel = (status: string): string => {
  if (status === 'pending') return 'Pendiente'
  if (status === 'confirmed') return 'Confirmada'
  if (status === 'seated') return 'Sentados'
  if (status === 'finished') return 'Finalizada'
  if (status === 'cancelled') return 'Cancelada'
  return 'No Show'
}

const getStatusBgClass = (status: string): string => {
  if (status === 'pending') return 'bg-slate-550/10 text-slate-500 bg-slate-50'
  if (status === 'confirmed') return 'bg-blue-50 text-blue-600 border border-blue-100'
  if (status === 'seated') return 'bg-purple-50 text-purple-600 border border-purple-100'
  if (status === 'finished') return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
  if (status === 'cancelled') return 'bg-rose-50 text-rose-600 border border-rose-100'
  return 'bg-slate-100 text-slate-600 border border-slate-200'
}

const getStatusTextClass = (status: string): string => {
  if (status === 'pending') return 'text-slate-500 bg-slate-100 border-slate-200'
  if (status === 'confirmed') return 'text-blue-700 bg-blue-50 border-blue-200'
  if (status === 'seated') return 'text-purple-700 bg-purple-50 border-purple-200'
  if (status === 'finished') return 'text-emerald-700 bg-emerald-50 border-emerald-200'
  if (status === 'cancelled') return 'text-rose-700 bg-rose-50 border-rose-200'
  return 'text-slate-700 bg-slate-100 border-slate-200'
}

const getStatusCount = (status: string): number => {
  return activeDayReservations.value.filter(r => r.status === status).length
}

const getTableResStatusClass = (tableId: string): string => {
  const activeRes = getTableActiveRes(tableId)
  if (!activeRes) return 'bg-white border-slate-200 hover:border-slate-350'
  if (activeRes.status === 'seated') return 'bg-[#9235DF]/5 border-[#9235DF]/40 text-[#9235DF] scale-102 font-bold'
  return 'bg-indigo-50 border-indigo-300 text-indigo-700'
}

// Action operations handlers
const updateStatus = (id: string, newStatus: any) => {
  reservasStore.updateReservation(id, { status: newStatus })
  if (selectedRes.value && selectedRes.value.id === id) {
    selectedRes.value.status = newStatus
  }
}

const changeResTable = (resId: string, tableId: string) => {
  // Overlapping and sizing validations
  if (tableId !== '') {
    const table = mesasStore.tables.find(t => t.id === tableId)
    const res = reservasStore.reservations.find(r => r.id === resId)
    if (table && res) {
      // 1. Capacity warning
      if (table.capacity < res.pax) {
        alert(`¡Aviso!: La Mesa ${table.number} tiene capacidad para ${table.capacity} pax y la reserva es de ${res.pax} comensales.`)
      }
      
      // 2. Overlap check
      const isOverlapped = activeDayReservations.value.some(r => 
        r.id !== resId && 
        r.tableId === tableId && 
        (r.status === 'confirmed' || r.status === 'seated') &&
        Math.abs(timeToMinutes(r.time) - timeToMinutes(res.time)) < 90
      )
      
      if (isOverlapped) {
        alert(`¡Error!: Conflicto de horario. La Mesa ${table.number} ya está reservada en un rango menor a 90 minutos.`)
        return
      }
    }
  }

  reservasStore.updateReservation(resId, { tableId: tableId || undefined })
  if (selectedRes.value && selectedRes.value.id === resId) {
    selectedRes.value.tableId = tableId || undefined
  }
}

const seatGuests = (res: Reservation) => {
  if (!res.tableId) {
    alert('Por favor, asigne una mesa antes de sentar a los comensales.')
    return
  }
  reservasStore.seatReservation(res.id, res.tableId)
  selectedRes.value = null
  activeCenterTab.value = 'sala'
}

// Drag & Drop visual logic
const draggedRes = ref<Reservation | null>(null)

const handleDragStartRes = (event: DragEvent, res: Reservation) => {
  draggedRes.value = res
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', res.id)
  }
}

const handleDropRes = (event: DragEvent, targetTableId: string) => {
  event.preventDefault()
  const resId = event.dataTransfer?.getData('text/plain') || draggedRes.value?.id
  if (resId) {
    changeResTable(resId, targetTableId)
  }
  draggedRes.value = null
}

// Modals
const openNewReservationModal = () => {
  warningMessage.value = null
  newForm.value = {
    clientName: '',
    phone: '',
    email: '',
    pax: 2,
    time: '21:00',
    duration: 90,
    tableId: '',
    notes: '',
    allergies: '',
    preferences: '',
    celebration: ''
  }
  showNewModal.value = true
}

const saveNewReservation = () => {
  warningMessage.value = null
  
  // Validation 1: schedule check
  const hour = parseInt(newForm.value.time.split(':')[0])
  const isOutOfHours = (hour < 12 || hour >= 17) && (hour < 19 || hour > 23)
  if (isOutOfHours) {
    warningMessage.value = 'El restaurante solo admite reservas en horario comercial: 12:00 - 17:00 y 19:00 - 00:00.'
    return
  }

  // Validation 2: sizing check
  if (newForm.value.tableId) {
    const table = mesasStore.tables.find(t => t.id === newForm.value.tableId)
    if (table && table.capacity < newForm.value.pax) {
      warningMessage.value = `Capacidad insuficiente. La Mesa ${table.number} solo admite ${table.capacity} pax y el registro es para ${newForm.value.pax} personas.`
      return
    }

    // Validation 3: overlap check
    const isOverlapped = activeDayReservations.value.some(r => 
      r.tableId === newForm.value.tableId && 
      (r.status === 'confirmed' || r.status === 'seated') &&
      Math.abs(timeToMinutes(r.time) - timeToMinutes(newForm.value.time)) < 90
    )
    if (isOverlapped) {
      warningMessage.value = `¡Conflicto de horario! La Mesa elegida ya está ocupada por otra reserva en ese rango de tiempo.`
      return
    }
  }

  // Save entry
  const added = reservasStore.addReservation({
    clientName: newForm.value.clientName,
    phone: newForm.value.phone,
    email: newForm.value.email || `${newForm.value.clientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
    pax: newForm.value.pax,
    date: selectedDateStr.value,
    time: newForm.value.time,
    duration: newForm.value.duration,
    status: 'confirmed',
    tableId: newForm.value.tableId || undefined,
    notes: newForm.value.notes || undefined,
    allergies: newForm.value.allergies || undefined,
    preferences: newForm.value.preferences || undefined,
    celebration: newForm.value.celebration || undefined
  })

  selectedRes.value = added
  showNewModal.value = false
}

// Helpers time
const timeToMinutes = (timeStr: string): number => {
  const parts = timeStr.split(':')
  return parseInt(parts[0]) * 60 + parseInt(parts[1])
}
</script>
