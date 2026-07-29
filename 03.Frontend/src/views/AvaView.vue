<template>
  <div class="bg-[#F8F9FA] min-h-[calc(100vh-4rem)] text-[#08071A] font-inter antialiased select-none">
    
    <!-- MAIN AVA SPLIT CONTAINER -->
    <div class="w-full max-w-[1600px] mx-auto p-4 md:p-6 h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
      
      <!-- LEFT COLUMN: CONVERSATION HISTORY & QUICK PROMPTS (4 cols) -->
      <div class="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between overflow-hidden shadow-sm">
        <div class="space-y-6 flex-1 overflow-y-auto pr-1">
          <div>
            <span class="text-[10px] font-bold text-[#9235DF] uppercase tracking-widest block">Consola AVA AI</span>
            <h3 class="text-base font-black tracking-tight font-outfit text-[#08071A] mt-0.5">Asistente Operativo</h3>
          </div>

          <!-- Quick Prompts List -->
          <div class="space-y-2">
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Prompts Recomendados</span>
            <div class="space-y-1.5">
              <button 
                v-for="p in quickPrompts" 
                :key="p"
                @click="selectPrompt(p)"
                class="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 rounded-xl text-[10px] font-bold text-slate-650 cursor-pointer block truncate transition-colors"
                :title="p"
              >
                {{ p }}
              </button>
            </div>
          </div>

          <!-- Conversation History List -->
          <div class="space-y-2 pt-2">
            <div class="flex justify-between items-center">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Historial Reciente</span>
              <button 
                v-if="avaStore.history.length > 0"
                @click="avaStore.clearHistory"
                class="text-[9px] text-[#9235DF] font-bold uppercase hover:underline cursor-pointer"
              >
                Borrar
              </button>
            </div>

            <div v-if="avaStore.history.length === 0" class="text-[10px] text-slate-400 font-semibold italic py-2">
              No hay consultas ejecutadas hoy.
            </div>
            <div v-else class="space-y-1.5">
              <div 
                v-for="msg in avaStore.history" 
                :key="msg.id"
                @click="avaStore.activeMessage = msg"
                :class="['p-2.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-colors flex justify-between items-center gap-2',
                  avaStore.activeMessage?.id === msg.id 
                    ? 'bg-[#9235DF]/5 border-[#9235DF]/20 text-[#9235DF]' 
                    : 'bg-white hover:bg-slate-50 border-slate-150 text-slate-650']"
              >
                <span class="truncate flex-1">{{ msg.prompt }}</span>
                <span class="text-[8px] text-slate-400">{{ msg.timestamp }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom Query Input Area -->
        <form @submit.prevent="submitCustomPrompt" class="pt-4 border-t border-slate-100 mt-4 shrink-0 flex gap-2">
          <input 
            v-model="customPrompt" 
            type="text" 
            placeholder="Pregunta a AVA sobre el negocio..." 
            class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#9235DF]"
          />
          <button 
            type="submit"
            class="p-2.5 bg-[#9235DF] hover:bg-[#562AAC] text-white rounded-xl cursor-pointer flex items-center justify-center shrink-0"
          >
            <i class="pi pi-send text-xs"></i>
          </button>
        </form>
      </div>

      <!-- CENTER COLUMN: AI RESPONSE CONSOLE & ALERTS (6 cols) -->
      <div class="lg:col-span-6 flex flex-col gap-6 overflow-hidden min-h-0">
        
        <!-- Active Response Panel -->
        <div class="flex-1 bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between overflow-hidden shadow-sm">
          <div class="border-b border-slate-50 pb-4 shrink-0 flex justify-between items-center">
            <div>
              <h3 class="text-sm font-black text-[#08071A] uppercase tracking-wider">Respuesta Ejecutiva</h3>
              <p class="text-xs text-slate-450 mt-0.5 font-medium">Análisis detallado generado por el motor heurístico AVA AI.</p>
            </div>
            
            <button 
              v-if="avaStore.activeMessage"
              @click="avaStore.toggleFavorite(avaStore.activeMessage.prompt)"
              class="p-2 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <i :class="['pi text-sm', avaStore.favorites.includes(avaStore.activeMessage.prompt) ? 'pi-star-fill text-amber-500' : 'pi-star']"></i>
            </button>
          </div>

          <!-- Active Answer Output Viewport -->
          <div class="flex-1 overflow-y-auto py-5 space-y-5 pr-1 text-xs">
            <div v-if="!avaStore.activeMessage" class="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <span class="w-12 h-12 rounded-full bg-[#9235DF]/10 text-[#9235DF] flex items-center justify-center animate-pulse">
                <i class="pi pi-sparkles text-lg"></i>
              </span>
              <div>
                <h4 class="font-black text-slate-900">Consola de Dirección Operativa</h4>
                <p class="text-[10px] text-slate-400 max-w-xs mt-1 font-semibold leading-relaxed">
                  Haz clic en cualquiera de las consultas recomendadas del panel izquierdo o redacta tu consulta en la caja de texto.
                </p>
              </div>
            </div>

            <div v-else class="space-y-5 font-bold text-slate-650">
              <!-- Summary block -->
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-1">
                <span class="text-[8px] text-slate-450 block uppercase tracking-wider">Resumen Ejecutivo</span>
                <p class="text-slate-800 font-bold leading-relaxed">{{ avaStore.activeMessage.summary }}</p>
              </div>

              <!-- Data used block -->
              <div class="space-y-1.5">
                <span class="text-[8px] text-slate-450 block uppercase tracking-wider">Datos Auditados</span>
                <p class="text-slate-700 leading-relaxed font-semibold">{{ avaStore.activeMessage.dataUsed }}</p>
              </div>

              <!-- Conclusions block -->
              <div class="space-y-1.5">
                <span class="text-[8px] text-slate-450 block uppercase tracking-wider">Conclusiones Clave</span>
                <p class="text-slate-900 leading-relaxed font-black">{{ avaStore.activeMessage.conclusions }}</p>
              </div>

              <!-- Recommended actions lists -->
              <div class="space-y-2 border-t border-slate-100 pt-4">
                <span class="text-[8px] text-slate-450 block uppercase tracking-wider">Acciones Estratégicas Sugeridas</span>
                <ul class="space-y-2">
                  <li 
                    v-for="(act, idx) in avaStore.activeMessage.actionsRecommended" 
                    :key="idx"
                    class="flex items-start gap-2 text-slate-750 font-bold"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-[#9235DF] block mt-1.5 shrink-0"></span>
                    <span class="leading-relaxed font-semibold">{{ act }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- System Alerts Panel -->
        <div class="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-3 shrink-0">
          <span class="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Mesa de Control de Alertas</span>
          
          <div class="grid grid-cols-3 gap-3">
            <div class="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between gap-3 text-[10px] font-bold text-rose-950">
              <div class="space-y-0.5">
                <span class="font-black text-rose-800 uppercase block tracking-wider">Críticas</span>
                <span>{{ criticalAlertsCount }} Activas</span>
              </div>
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 block animate-pulse"></span>
            </div>

            <div class="p-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between gap-3 text-[10px] font-bold text-amber-950">
              <div class="space-y-0.5">
                <span class="font-black text-amber-800 uppercase block tracking-wider">Importantes</span>
                <span>3 Activas</span>
              </div>
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 block"></span>
            </div>

            <div class="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3 text-[10px] font-bold text-indigo-950">
              <div class="space-y-0.5">
                <span class="font-black text-indigo-800 uppercase block tracking-wider">Informativas</span>
                <span>6 Activas</span>
              </div>
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-400 block"></span>
            </div>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN: CONTEXT & QUICK ACTIONS (3 cols) -->
      <div class="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between overflow-hidden shadow-sm">
        <div class="space-y-5 flex-1 overflow-y-auto pr-1">
          <div>
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Contexto de Auditoría</span>
            <h4 class="text-sm font-black text-slate-900 mt-0.5 font-outfit">Módulos Consultados</h4>
          </div>

          <div v-if="!avaStore.activeMessage" class="text-[10px] text-slate-400 font-semibold italic py-2">
            Selecciona una consulta para auditar el contexto.
          </div>
          
          <div v-else class="space-y-4">
            <!-- Consulted modules tags -->
            <div class="flex flex-wrap gap-1.5">
              <span 
                v-for="mod in avaStore.activeMessage.modulesConsulted" 
                :key="mod"
                class="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-xl text-[9px] font-bold text-slate-600 uppercase tracking-wider"
              >
                {{ mod }}
              </span>
            </div>

            <!-- Priority badge details -->
            <div class="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-xs font-bold space-y-1">
              <span class="text-slate-400 block uppercase text-[8px] tracking-wider">Grado de Prioridad Operativa:</span>
              <div class="flex items-center gap-2 mt-1">
                <span :class="['w-2.5 h-2.5 rounded-full', getPriorityColor(avaStore.activeMessage.priority)]"></span>
                <span class="font-black uppercase text-slate-800">{{ avaStore.activeMessage.priority }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick actions shortcuts -->
        <div v-if="avaStore.activeMessage && avaStore.activeMessage.actionRoute" class="pt-4 border-t border-slate-100 mt-4 shrink-0">
          <router-link 
            :to="avaStore.activeMessage.actionRoute"
            class="w-full py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            <i class="pi pi-external-link"></i>
            <span>{{ avaStore.activeMessage.actionText || 'Ver Módulo' }}</span>
          </router-link>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAvaStore } from '../stores/ava'
import { useInventarioStore } from '../stores/inventario'

const avaStore = useAvaStore()
const inventarioStore = useInventarioStore()

const customPrompt = ref('')

const quickPrompts = [
  '¿Qué debo comprar mañana?',
  '¿Qué productos tienen peor margen?',
  '¿Qué camarero vende más?',
  '¿Qué mesas generan más ingresos?',
  '¿Qué clientes llevan tiempo sin venir?',
  '¿Qué reservas tienen riesgo de No Show?',
  '¿Qué productos agotaremos hoy?',
  '¿Cuál ha sido el beneficio esta semana?'
]

// Computed Alerts stats
const criticalAlertsCount = computed(() => {
  return inventarioStore.products.filter(p => p.stock < p.minStock && p.stock > 0).length
})

const getPriorityColor = (priority: 'alta' | 'media' | 'baja'): string => {
  if (priority === 'alta') return 'bg-rose-500 animate-pulse'
  if (priority === 'media') return 'bg-amber-400'
  return 'bg-indigo-400'
}

const selectPrompt = (promptText: string) => {
  avaStore.sendPrompt(promptText)
}

const submitCustomPrompt = () => {
  if (!customPrompt.value.trim()) return
  avaStore.sendPrompt(customPrompt.value)
  customPrompt.value = ''
}
</script>
