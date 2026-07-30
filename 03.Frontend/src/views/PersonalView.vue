<template>
  <div class="bg-[#F8F9FA] min-h-[calc(100vh-4rem)] text-[#08071A] font-inter antialiased select-none">

    <!-- MAIN PERSONAL CONTAINER -->
    <div class="w-full max-w-[1600px] mx-auto p-4 md:p-6 h-[calc(100vh-6rem)] flex flex-col gap-6">

      <!-- HEADER -->
      <div class="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm shrink-0">
        <div>
          <span class="text-[10px] font-bold text-[#9235DF] uppercase tracking-widest block">Aveniq Workforce</span>
          <h2 class="text-2xl font-black tracking-tight font-outfit text-[#08071A] mt-0.5">
            Operaciones de Personal & Turnos
          </h2>
          <p class="text-xs text-slate-400 font-medium">Control de cuadrante semanal, registro horario de entrada/salida y auditoría de productividad.</p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0',
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

        <!-- TAB 1: EMPLEADOS -->
        <div v-if="activeTab === 'empleados'" class="h-full overflow-y-auto pr-1">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="emp in personalStore.employees"
              :key="emp.id"
              class="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between gap-5 shadow-sm hover:border-[#9235DF]/20 transition-all duration-300 relative"
            >
              <!-- Name & Role -->
              <div class="flex justify-between items-start gap-4">
                <div class="flex items-center gap-3">
                  <span class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-500 font-black text-xs">
                    {{ emp.name.split(' ').map(n => n[0]).join('') }}
                  </span>
                  <div>
                    <h4 class="text-sm font-black text-slate-900 leading-snug">{{ emp.name }}</h4>
                    <span class="text-[9px] text-[#9235DF] font-bold uppercase tracking-wider block mt-0.5">{{ emp.role }}</span>
                  </div>
                </div>

                <span :class="['px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider', getStatusBadgeClass(emp.status)]">
                  {{ emp.status }}
                </span>
              </div>

              <!-- Contract & Availability -->
              <div class="space-y-2 text-xs text-slate-550 border-t border-b border-slate-50 py-3.5">
                <div class="flex justify-between">
                  <span class="text-slate-400 font-semibold">Contrato:</span>
                  <span class="font-bold text-slate-800 uppercase text-[10px]">{{ emp.contract }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400 font-semibold">Disponibilidad:</span>
                  <span class="font-bold text-slate-800 truncate max-w-[120px]">{{ emp.availability }}</span>
                </div>
              </div>

              <!-- Hourly Cost & Hours -->
              <div class="flex justify-between items-center text-[10px] font-bold text-slate-450">
                <span>Horas: {{ emp.weeklyHours }}h / sem</span>
                <span class="text-[#08071A] font-black">{{ emp.hourlyCost.toFixed(2) }} €/h</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: PLANIFICADOR DE TURNOS (SHIFT BOARD) -->
        <div v-if="activeTab === 'turnos'" class="h-full bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm overflow-hidden">
          <div class="border-b border-slate-50 pb-4 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 class="text-sm font-black text-[#08071A] uppercase tracking-wider">Planificador Semanal de Turnos</h3>
              <p class="text-xs text-slate-450 mt-0.5 font-medium">Asigne de forma rápida el cuadrante de turnos del personal.</p>
            </div>
            <!-- Actions & Status -->
            <div class="flex items-center gap-3.5">
              <span :class="['px-3 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-wider border shadow-sm',
                hasDraftShifts
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-250']">
                Estado: {{ hasDraftShifts ? 'Borrador' : 'Publicado' }}
              </span>
              <button
                v-if="hasDraftShifts"
                @click="publishAllDrafts"
                class="px-4 py-2 bg-[#9235DF] hover:bg-[#562AAC] text-white rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm"
              >
                Publicar Cuadrante
              </button>
            </div>
          </div>

          <!-- Shifts Matrix View -->
          <div class="flex-1 overflow-x-auto py-4 pr-1 min-w-0">
            <table class="w-full border-collapse text-left text-xs font-bold text-slate-700 min-w-[700px]">
              <thead>
                <tr class="border-b border-slate-150 text-[10px] uppercase tracking-widest text-slate-450">
                  <th class="py-3 px-4 font-black text-slate-900">Empleado</th>
                  <th v-for="day in daysOfWeek" :key="day" class="py-3 px-4 font-black text-slate-900 text-center w-[12%]">
                    {{ day }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="emp in personalStore.employees" :key="emp.id" class="hover:bg-slate-50/30 transition-colors">
                  <!-- Employee Info -->
                  <td class="py-4 px-4 font-black text-slate-900">
                    <span class="block">{{ emp.name }}</span>
                    <span class="text-[9px] text-[#9235DF] font-black uppercase tracking-wider block mt-0.5">{{ emp.role }}</span>
                  </td>

                  <!-- Weekday Cells -->
                  <td v-for="day in daysOfWeek" :key="day" class="py-3 px-3 text-center align-middle">
                    <div v-for="shift in [getShiftForEmployeeAndDay(emp.id, day)]" :key="shift?.id || 'empty'">
                      <div v-if="shift" class="relative group">
                        <!-- Shift Card -->
                        <div :class="['p-2.5 rounded-2xl border text-[10px] shadow-sm flex flex-col items-center justify-center gap-1 min-h-[56px]',
                          shift.status === 'draft'
                            ? 'bg-amber-50/40 border-dashed border-amber-300 text-amber-900'
                            : 'bg-white border-slate-200 text-slate-800']">
                          <span class="font-black capitalize">{{ shift.shiftType }}</span>
                          <!-- Status Badge -->
                          <span v-if="shift.status === 'draft'" class="px-1 py-0.5 rounded bg-amber-100 text-[8px] font-black uppercase tracking-wider">
                            Borrador
                          </span>
                          <span v-else class="px-1 py-0.5 rounded bg-emerald-50 text-[8px] font-black uppercase tracking-wider text-emerald-700">
                            Ok
                          </span>
                        </div>
                      </div>

                      <!-- Quick assign button if no shift exists -->
                      <button v-else
                        @click="openQuickShiftAssignForEmployee(emp.id, day)"
                        class="w-full py-2 bg-slate-50/50 hover:bg-slate-100/80 text-slate-450 border border-dashed border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer text-center min-h-[56px] flex items-center justify-center transition-all"
                      >
                        + Turno
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 3: CONTROL HORARIO (FICHAJES) -->
        <div v-if="activeTab === 'fichajes'" class="h-full bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm overflow-hidden">
          <div class="border-b border-slate-50 pb-4 shrink-0">
            <h3 class="text-sm font-black text-[#08071A] uppercase tracking-wider">Registro de Entrada/Salida</h3>
            <p class="text-xs text-slate-450 mt-0.5 font-medium">Consola de control de presencia en tiempo real para fichar descansos y turnos.</p>
          </div>

          <!-- List of employees control blocks -->
          <div class="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            <div
              v-for="emp in personalStore.employees"
              :key="emp.id"
              class="p-4 bg-slate-50/50 rounded-3xl border border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-bold text-slate-550"
            >
              <div>
                <h4 class="font-black text-slate-900 text-sm">{{ emp.name }}</h4>
                <p class="text-[9px] text-[#9235DF] font-bold uppercase mt-0.5">Fichaje: {{ getClockInTime(emp.id) }}</p>
              </div>

              <!-- Quick action clock controllers -->
              <div class="flex items-center gap-2">
                <button
                  v-if="emp.status === 'inactivo'"
                  @click="personalStore.clockIn(emp.id)"
                  class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl cursor-pointer transition-colors text-[10px] font-black uppercase"
                >
                  Fichar Entrada
                </button>

                <div v-else class="flex items-center gap-1.5">
                  <button
                    @click="personalStore.toggleBreak(emp.id)"
                    :class="['px-3 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer border',
                      emp.status === 'descanso' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200']"
                  >
                    {{ emp.status === 'descanso' ? 'Fin Descanso' : 'Pausa Café' }}
                  </button>
                  <button
                    @click="personalStore.clockOut(emp.id)"
                    class="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl cursor-pointer transition-colors text-[10px] font-black uppercase"
                  >
                    Fichar Salida
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 4: RENDIMIENTO & PRODUCTIVIDAD -->
        <div v-if="activeTab === 'rendimiento'" class="h-full bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm overflow-hidden">
          <div class="border-b border-slate-50 pb-4 shrink-0">
            <h3 class="text-sm font-black text-[#08071A] uppercase tracking-wider">Rendimiento Operativo y Productividad</h3>
            <p class="text-xs text-slate-450 mt-0.5 font-medium">Análisis del total facturado y relación del coste de personal sobre el retorno comercial.</p>
          </div>

          <!-- Performance details -->
          <div class="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            <div
              v-for="emp in personalStore.employees"
              :key="emp.id"
              class="p-5 bg-slate-50/50 rounded-3xl border border-slate-150/70 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-xs font-bold text-slate-500"
            >
              <div>
                <h4 class="font-black text-slate-900 text-sm leading-snug">{{ emp.name }}</h4>
                <span class="text-[9px] text-[#9235DF] font-bold uppercase tracking-wider block mt-0.5">{{ emp.role }}</span>
              </div>

              <!-- Mini metrics row -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div class="px-2.5">
                  <span class="text-[8px] text-slate-400 uppercase block">Ventas</span>
                  <span class="font-black text-slate-800 text-xs block mt-0.5 font-mono">{{ getSalesTotal(emp.name) }}€</span>
                </div>
                <div class="px-2.5">
                  <span class="text-[8px] text-slate-400 uppercase block">Productividad</span>
                  <span class="font-black text-indigo-600 text-xs block mt-0.5">{{ getProductivityRatio(emp) }}x</span>
                </div>
                <div class="px-2.5">
                  <span class="text-[8px] text-slate-400 uppercase block">T. Respuesta</span>
                  <span class="font-black text-slate-800 text-xs block mt-0.5 font-mono">{{ emp.avgResponseTime }}m</span>
                </div>
                <div class="px-2.5">
                  <span class="text-[8px] text-slate-400 uppercase block">Valoración</span>
                  <span class="font-black text-amber-600 text-xs block mt-0.5">★ {{ emp.rating }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 5: INCIDENCIAS & PETICIONES -->
        <div v-if="activeTab === 'incidencias'" class="h-full grid grid-cols-1 lg:grid-cols-10 gap-6 overflow-hidden min-h-0">
          <!-- Left side list -->
          <div class="lg:col-span-6 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between overflow-hidden shadow-sm">
            <div class="shrink-0 border-b border-slate-50 pb-3 flex justify-between items-center">
              <h3 class="text-sm font-black text-slate-950 font-outfit">Histórico de Peticiones</h3>

              <button
                @click="openNewIncidentModal"
                class="px-3 py-1.5 bg-[#9235DF] hover:bg-[#562AAC] text-white text-[10px] font-black rounded-lg cursor-pointer transition-colors"
              >
                + Registrar Incidencia
              </button>
            </div>

            <!-- List of requests -->
            <div class="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
              <div
                v-for="inc in personalStore.incidents"
                :key="inc.id"
                class="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-bold text-slate-550"
              >
                <div class="space-y-0.5">
                  <div class="flex items-center gap-2">
                    <span class="font-black text-slate-900 text-xs">{{ inc.employeeName }}</span>
                    <span :class="['px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider', getIncidentBadgeClass(inc.type)]">
                      {{ inc.type }}
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-450 mt-0.5">{{ inc.details }} • Fecha: {{ inc.date }}</p>
                </div>

                <!-- Incident resolve actions -->
                <div class="flex items-center gap-2">
                  <span
                    v-if="inc.status !== 'pendiente'"
                    :class="['px-2.5 py-1 rounded-xl text-[9px] uppercase tracking-wider',
                      inc.status === 'aprobado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200']"
                  >
                    {{ inc.status }}
                  </span>

                  <div v-else class="flex items-center gap-1">
                    <button
                      @click="personalStore.resolveIncident(inc.id, 'aprobado')"
                      class="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase rounded-lg cursor-pointer transition-colors"
                    >
                      Aprobar
                    </button>
                    <button
                      @click="personalStore.resolveIncident(inc.id, 'denegado')"
                      class="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-black uppercase rounded-lg cursor-pointer transition-colors"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right side explanatory guidelines -->
          <div class="lg:col-span-4 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col gap-4 shadow-sm h-fit">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">Normativa y Operaciones</h3>
            <p class="text-xs text-slate-450 leading-relaxed font-semibold">
              El cuadrante de cuadrilla y de incidencias calcula los coeficientes de costes y rotaciones cruzando datos analíticos del Dashboard Ejecutivo.
            </p>
          </div>
        </div>

      </div>

    </div>

    <!-- DIALOG MODAL: ASSIGN SHIFT -->
    <div
      v-if="showShiftModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-sm w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          @click="showShiftModal = false"
          class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <div>
          <h3 class="text-xl font-bold text-[#08071A] font-outfit">Planificar Turno</h3>
          <p class="text-xs text-slate-400 mt-1">Asigne un cuadrante horario para el {{ activeDay }}.</p>
        </div>

        <form @submit.prevent="submitShiftAssignment" class="space-y-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Colaborador</label>
            <select v-model="shiftForm.employeeId" required class="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 focus:outline-none">
              <option
                v-for="emp in personalStore.employees"
                :key="emp.id"
                :value="emp.id"
              >
                {{ emp.name }} ({{ emp.role }})
              </option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Turno Horario</label>
            <select v-model="shiftForm.type" required class="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 focus:outline-none">
              <option value="mañana">Mañana</option>
              <option value="comida">Comida</option>
              <option value="tarde">Tarde</option>
              <option value="cena">Cena</option>
              <option value="noche">Noche</option>
            </select>
          </div>

          <div class="pt-4 flex gap-3">
            <button
              type="button"
              @click="showShiftModal = false"
              class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Guardar Turno
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DIALOG MODAL: NEW INCIDENT -->
    <div
      v-if="showIncidentModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-sm w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          @click="showIncidentModal = false"
          class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <div>
          <h3 class="text-xl font-bold text-[#08071A] font-outfit">Registrar Incidencia</h3>
          <p class="text-xs text-slate-400 mt-1">Registre solicitudes de ausencias, bajas o cambios de turno.</p>
        </div>

        <form @submit.prevent="submitIncident" class="space-y-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Empleado</label>
            <select v-model="incForm.name" required class="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 focus:outline-none">
              <option
                v-for="emp in personalStore.employees"
                :key="emp.id"
                :value="emp.name"
              >
                {{ emp.name }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Tipo Petición</label>
              <select v-model="incForm.type" required class="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 focus:outline-none">
                <option value="vacaciones">Vacaciones</option>
                <option value="baja">Baja Médica</option>
                <option value="ausencia">Ausencia Justificada</option>
                <option value="cambio">Permuta Turno</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Fecha Petición</label>
              <input v-model="incForm.date" required type="date" class="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 focus:outline-none" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Detalles</label>
            <input v-model="incForm.details" required type="text" placeholder="Ej. Solicitud 1 día por mudanza" class="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 focus:outline-none" />
          </div>

          <div class="pt-4 flex gap-3">
            <button
              type="button"
              @click="showIncidentModal = false"
              class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Enviar Petición
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePersonalStore, type ShiftType } from '../stores/personal'
import { useBiStore } from '../stores/bi'

const personalStore = usePersonalStore()
const biStore = useBiStore()

// State
const activeTab = ref<'empleados' | 'turnos' | 'fichajes' | 'rendimiento' | 'incidencias'>('empleados')
const showShiftModal = ref(false)
const showIncidentModal = ref(false)
const activeDay = ref<'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo'>('Lunes')

const shiftForm = ref({
  employeeId: 'emp1',
  type: 'comida' as ShiftType
})

const incForm = ref({
  name: '',
  type: 'vacaciones' as const,
  date: '',
  details: ''
})

const tabs = [
  { id: 'empleados' as const, label: 'Empleados (Equipo)' },
  { id: 'turnos' as const, label: 'Calendario Turnos' },
  { id: 'fichajes' as const, label: 'Fichajes' },
  { id: 'rendimiento' as const, label: 'Rendimiento BI' },
  { id: 'incidencias' as const, label: 'Incidencias' }
]

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const

// Styling classes helper
const getStatusBadgeClass = (status: string): string => {
  if (status === 'activo') return 'bg-emerald-50 text-emerald-700 border border-emerald-250'
  if (status === 'descanso') return 'bg-amber-50 text-amber-700 border border-amber-250 animate-pulse'
  return 'bg-slate-50 text-slate-500 border border-slate-200'
}

const getIncidentBadgeClass = (type: string): string => {
  if (type === 'vacaciones') return 'bg-indigo-50 text-indigo-700 border border-indigo-200'
  if (type === 'baja') return 'bg-rose-50 text-rose-700 border border-rose-200'
  if (type === 'ausencia') return 'bg-slate-50 text-slate-650 border border-slate-200'
  return 'bg-amber-50 text-amber-700 border border-amber-200'
}

const getClockInTime = (employeeId: string): string => {
  const todayStr = new Date().toISOString().split('T')[0]
  const log = personalStore.clocks.find(c => c.employeeId === employeeId && c.date === todayStr)
  if (!log) return 'Fichaje pendiente'
  if (log.checkOut) return `Entrada: ${log.checkIn} | Salida: ${log.checkOut} (Total horas: ~8h)`
  return `Activo desde las ${log.checkIn} (${log.breakMinutes > 0 ? `Descanso: ${log.breakMinutes}m` : 'Sin pausas'})`
}

const getSalesTotal = (employeeName: string): number => {
  const name = employeeName.split(' ')[0] // e.g. "Laura"
  const chartItem = biStore.salesByWaiterChart.find((item: { label: string; value: number }) => item.label.toLowerCase() === name.toLowerCase())
  return chartItem ? chartItem.value : 0
}

const getProductivityRatio = (emp: any): string => {
  const sales = getSalesTotal(emp.name)
  // personal daily cost = hourlyCost * 8 hours
  const cost = emp.hourlyCost * 8
  if (sales === 0) return '0.0'
  return (sales / cost).toFixed(1)
}

const getShiftForEmployeeAndDay = (employeeId: string, day: string) => {
  return personalStore.shifts.find(s => s.employeeId === employeeId && s.day === day)
}

const openQuickShiftAssignForEmployee = (employeeId: string, day: typeof activeDay.value) => {
  activeDay.value = day
  shiftForm.value = {
    employeeId,
    type: 'comida'
  }
  showShiftModal.value = true
}

const hasDraftShifts = computed(() => {
  return personalStore.shifts.some(s => s.status === 'draft')
})

const publishAllDrafts = () => {
  personalStore.shifts.forEach(s => {
    if (s.status === 'draft') {
      s.status = 'published'
    }
  })
  personalStore.shifts = [...personalStore.shifts]
}

const submitShiftAssignment = () => {
  personalStore.assignShift(shiftForm.value.employeeId, activeDay.value, shiftForm.value.type)
  showShiftModal.value = false
}

const openNewIncidentModal = () => {
  const todayStr = new Date().toISOString().split('T')[0]
  incForm.value = {
    name: personalStore.employees[0]?.name || '',
    type: 'vacaciones',
    date: todayStr,
    details: ''
  }
  showIncidentModal.value = true
}

const submitIncident = () => {
  personalStore.addIncident({
    employeeName: incForm.value.name,
    type: incForm.value.type,
    date: incForm.value.date,
    details: incForm.value.details
  })
  showIncidentModal.value = false
}
</script>
