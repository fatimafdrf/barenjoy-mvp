<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-extrabold tracking-tight">Carta & Menú</h2>
        <p class="text-sm text-slate-400 mt-1">Gestione los platos, precios, alérgenos y disponibilidad del catálogo</p>
      </div>
      <button 
        @click="showAddDialog = true" 
        class="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-500 font-semibold text-sm rounded-xl transition-all duration-300 cursor-pointer"
      >
        <i class="pi pi-plus"></i>
        <span>Nuevo Producto</span>
      </button>
    </div>

    <!-- Category Filter tabs -->
    <div class="flex gap-2 overflow-x-auto pb-1.5 border-b border-slate-800/80">
      <button 
        @click="activeCategory = 'all'"
        :class="['px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap', 
          activeCategory === 'all' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'bg-slate-900 text-slate-400 hover:bg-slate-800']"
      >
        Ver Todo ({{ cartaStore.menuItems.length }})
      </button>
      <button 
        v-for="cat in cartaStore.categories" 
        :key="cat.id"
        @click="activeCategory = cat.id"
        :class="['px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap', 
          activeCategory === cat.id ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'bg-slate-900 text-slate-400 hover:bg-slate-800']"
      >
        {{ cat.name }} ({{ cartaStore.menuItems.filter(i => i.category === cat.id).length }})
      </button>
    </div>

    <!-- Products Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="item in filteredItems" 
        :key="item.id"
        :class="[
          'glass rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative group',
          item.available ? 'border-white/5 hover:border-white/20' : 'border-rose-500/20 opacity-60 hover:opacity-85'
        ]"
      >
        <!-- Out of stock badge overlay -->
        <div v-if="!item.available" class="absolute top-2 right-2 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full z-10">
          Agotado
        </div>

        <!-- Card content -->
        <div class="p-6 space-y-4">
          <!-- Category and price -->
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-500/80 bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10">
              {{ categoryName(item.category) }}
            </span>
            <span class="text-lg font-black text-white">{{ item.price.toFixed(2) }} €</span>
          </div>

          <!-- Product metadata -->
          <div class="space-y-1">
            <h3 class="font-bold text-slate-100 text-base group-hover:text-amber-500 transition-colors">{{ item.name }}</h3>
            <p class="text-xs text-slate-400 leading-relaxed">{{ item.description }}</p>
          </div>

          <!-- Allergens -->
          <div class="flex flex-wrap gap-1 pt-1">
            <span 
              v-for="allergen in item.allergens" 
              :key="allergen"
              class="text-[9px] font-semibold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700"
              :title="`Contiene ${allergen}`"
            >
              {{ allergen }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-6 pt-0 border-t border-slate-850 mt-4 flex items-center justify-between gap-3">
          <!-- Toggle stock -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 font-semibold">Stock:</span>
            <button 
              @click="toggleStock(item.id, item.available)"
              :class="[
                'px-2 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer',
                item.available ? 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
              ]"
            >
              {{ item.available ? 'Disponible' : 'Agotado' }}
            </button>
          </div>

          <!-- Edit / Delete -->
          <div class="flex gap-2">
            <button 
              @click="deleteProduct(item.id)" 
              class="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-slate-950 border border-rose-500/15 hover:border-transparent rounded-xl transition-all active:scale-95 cursor-pointer"
              title="Eliminar Plato"
            >
              <i class="pi pi-trash text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Dialog: Create Product -->
    <div 
      v-if="showAddDialog" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4"
    >
      <div class="glass max-w-md w-full p-6 rounded-3xl border border-white/10 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button 
          @click="showAddDialog = false" 
          class="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
        >
          <i class="pi pi-times"></i>
        </button>

        <h3 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="pi pi-plus text-amber-500"></i>
          <span>Nuevo Producto</span>
        </h3>
        <p class="text-xs text-slate-400">Inserte un plato o bebida en el catálogo general.</p>

        <!-- Form fields -->
        <form @submit.prevent="saveProduct" class="space-y-4 pt-2">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre del plato / bebida</label>
            <input 
              v-model="newForm.name" 
              required 
              type="text" 
              placeholder="Ej. Tartar de Atún Rojo" 
              class="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Categoría</label>
            <select 
              v-model="newForm.category" 
              class="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
            >
              <option value="tapas">Tapas & Entrantes</option>
              <option value="platos">Platos Principales</option>
              <option value="bebidas">Bebidas & Coctelería</option>
              <option value="postres">Postres Artesanales</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Precio (€)</label>
              <input 
                v-model.number="newForm.price" 
                required 
                type="number" 
                step="0.05" 
                min="0.1" 
                placeholder="12.50" 
                class="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Estado inicial</label>
              <select 
                v-model="newForm.available" 
                class="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              >
                <option :value="true">Disponible</option>
                <option :value="false">Agotado</option>
              </select>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción o ingredientes</label>
            <textarea 
              v-model="newForm.description" 
              required 
              rows="3" 
              placeholder="Describa el plato, guarnición o preparación..." 
              class="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Allergens selection checklist -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Alérgenos</label>
            <div class="grid grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-2xl border border-white/5">
              <div v-for="alg in allergenOptions" :key="alg" class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  :id="`alg-${alg}`"
                  :value="alg"
                  v-model="newForm.allergens"
                  class="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label :for="`alg-${alg}`" class="text-xs text-slate-300 cursor-pointer selection:bg-transparent">{{ alg }}</label>
              </div>
            </div>
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
              Añadir Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCartaStore } from '../stores/carta'

const cartaStore = useCartaStore()

const activeCategory = ref<string>('all')
const showAddDialog = ref(false)

const allergenOptions = ['Gluten', 'Lácteos', 'Huevo', 'Pescado', 'Moluscos', 'Frutos secos', 'Sulfitos', 'Mostaza']

const newForm = ref({
  name: '',
  description: '',
  price: 0,
  category: 'tapas' as 'tapas' | 'platos' | 'bebidas' | 'postres',
  allergens: [] as string[],
  available: true
})

const filteredItems = computed(() => {
  if (activeCategory.value === 'all') return cartaStore.menuItems
  return cartaStore.menuItems.filter(item => item.category === activeCategory.value)
})

const categoryName = (catId: string) => {
  const cat = cartaStore.categories.find(c => c.id === catId)
  return cat ? cat.name : catId
}

const toggleStock = (id: string, currentAvailable: boolean) => {
  cartaStore.updateItem(id, { available: !currentAvailable })
}

const deleteProduct = (id: string) => {
  if (confirm('¿Está seguro de que desea eliminar este producto de la carta?')) {
    cartaStore.deleteItem(id)
  }
}

const saveProduct = () => {
  cartaStore.addItem({
    name: newForm.value.name,
    description: newForm.value.description,
    price: newForm.value.price,
    category: newForm.value.category,
    allergens: newForm.value.allergens,
    available: newForm.value.available
  })

  // Reset form & close modal
  newForm.value = {
    name: '',
    description: '',
    price: 0,
    category: 'tapas',
    allergens: [],
    available: true
  }
  showAddDialog.value = false
}
</script>
