<template>
  <div class="bg-slate-950 min-h-[calc(100vh-4rem)] p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-extrabold tracking-tight">Locales & Sucursales</h2>
        <p class="text-sm text-slate-400 mt-1">Administración de sucursales del grupo Barenjoy</p>
      </div>
      <button 
        @click="showAddDialog = true" 
        class="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-500 font-semibold text-sm rounded-xl transition-all duration-300 cursor-pointer"
      >
        <i class="pi pi-plus"></i>
        <span>Agregar Sucursal</span>
      </button>
    </div>

    <!-- Locales Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="locale in localesStore.locales" 
        :key="locale.id"
        :class="[
          'glass rounded-3xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden group',
          localesStore.activeLocaleId === locale.id ? 'border-amber-500/40 glow-amber bg-slate-900/60' : 'border-white/5 hover:border-white/20'
        ]"
      >
        <!-- Top Highlight for Active Local -->
        <div 
          v-if="localesStore.activeLocaleId === locale.id" 
          class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"
        ></div>

        <!-- Card Body -->
        <div class="p-6 space-y-4">
          <!-- Title & Status -->
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-bold text-lg text-white group-hover:text-amber-500 transition-colors">{{ locale.name }}</h3>
              <p class="text-xs text-slate-500 font-mono mt-0.5">ID: {{ locale.id }}</p>
            </div>
            
            <button 
              @click="toggleStatus(locale.id, locale.status)"
              :class="[
                'px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-95',
                locale.status === 'open' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
              ]"
              :title="locale.status === 'open' ? 'Cambiar a cerrado' : 'Cambiar a abierto'"
            >
              <i class="pi pi-circle-fill text-[8px] mr-1" :class="locale.status === 'open' ? 'text-emerald-400' : 'text-rose-400'"></i>
              {{ locale.status === 'open' ? 'Abierto' : 'Cerrado' }}
            </button>
          </div>

          <!-- Description Fields -->
          <div class="space-y-2.5 text-sm pt-2">
            <div class="flex items-center gap-2.5 text-slate-300">
              <i class="pi pi-map-marker text-slate-500 text-xs"></i>
              <span class="truncate">{{ locale.address }}</span>
            </div>
            <div class="flex items-center gap-2.5 text-slate-300">
              <i class="pi pi-phone text-slate-500 text-xs"></i>
              <span>{{ locale.phone }}</span>
            </div>
            <div class="flex items-center gap-2.5 text-slate-300">
              <i class="pi pi-user text-slate-500 text-xs"></i>
              <span>Gerente: <strong class="text-slate-200">{{ locale.manager }}</strong></span>
            </div>
            <div class="flex items-center gap-2.5 text-slate-300">
              <i class="pi pi-grid text-slate-500 text-xs"></i>
              <span>Mesas configuradas: <strong class="text-slate-200">{{ locale.tablesCount }}</strong></span>
            </div>
          </div>
        </div>

        <!-- Card Actions -->
        <div class="p-6 pt-0 border-t border-slate-800/40 mt-4 flex gap-3">
          <button 
            @click="localesStore.switchLocale(locale.id)"
            :disabled="localesStore.activeLocaleId === locale.id"
            :class="[
              'flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-98',
              localesStore.activeLocaleId === locale.id 
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-default' 
                : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5'
            ]"
          >
            {{ localesStore.activeLocaleId === locale.id ? 'Seleccionado' : 'Establecer Activo' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Dialog for adding branch -->
    <div 
      v-if="showAddDialog" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4"
    >
      <div class="glass max-w-md w-full p-6 rounded-3xl border border-white/10 space-y-4 shadow-2xl relative animate-in fade-in duration-200">
        <button 
          @click="showAddDialog = false" 
          class="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
        >
          <i class="pi pi-times"></i>
        </button>

        <h3 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="pi pi-building text-amber-500"></i>
          <span>Agregar Sucursal</span>
        </h3>
        <p class="text-xs text-slate-400">Configure los detalles iniciales del nuevo restaurante.</p>

        <!-- Form fields -->
        <form @submit.prevent="saveLocale" class="space-y-4 pt-2">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre del local</label>
            <input 
              v-model="newForm.name" 
              required 
              type="text" 
              placeholder="Ej. Barenjoy Retiro" 
              class="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Dirección</label>
            <input 
              v-model="newForm.address" 
              required 
              type="text" 
              placeholder="Ej. Calle Alcalá 44, Madrid" 
              class="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Teléfono</label>
              <input 
                v-model="newForm.phone" 
                required 
                type="text" 
                placeholder="+34 600 000 000" 
                class="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Nº Mesas</label>
              <input 
                v-model.number="newForm.tablesCount" 
                required 
                type="number" 
                min="1" 
                max="50" 
                class="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Gerente encargado</label>
            <input 
              v-model="newForm.manager" 
              required 
              type="text" 
              placeholder="Ej. Carmen Ortiz" 
              class="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div class="pt-4 flex gap-3">
            <button 
              type="button" 
              @click="showAddDialog = false" 
              class="flex-1 py-3 text-sm font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="flex-1 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 transition-colors cursor-pointer"
            >
              Guardar Sucursal
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLocalesStore } from '../stores/locales'

const localesStore = useLocalesStore()

const showAddDialog = ref(false)

const newForm = ref({
  name: '',
  address: '',
  phone: '',
  tablesCount: 10,
  manager: '',
  status: 'closed' as 'open' | 'closed'
})

const toggleStatus = (id: string, currentStatus: 'open' | 'closed') => {
  const newStatus = currentStatus === 'open' ? 'closed' : 'open'
  localesStore.updateLocale(id, { status: newStatus })
}

const saveLocale = () => {
  localesStore.addLocale({
    name: newForm.value.name,
    address: newForm.value.address,
    phone: newForm.value.phone,
    tablesCount: newForm.value.tablesCount,
    manager: newForm.value.manager,
    status: newForm.value.status
  })
  
  // Reset form & close modal
  newForm.value = {
    name: '',
    address: '',
    phone: '',
    tablesCount: 10,
    manager: '',
    status: 'closed'
  }
  showAddDialog.value = false
}
</script>
