<template>
  <div class="bg-app-background min-h-[calc(100vh-4rem)]">
    <div class="max-w-7xl w-full mx-auto p-6 text-app-text space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-3xl font-extrabold tracking-tight text-app-text">Carta & Menú</h2>
          <p class="text-sm text-app-text-muted mt-1">Gestione los platos, precios, alérgenos y disponibilidad del catálogo</p>
        </div>
        <button
          @click="showAddDialog = true"
          class="flex items-center gap-2 px-4 py-2 bg-app-primary hover:bg-app-primary-hover text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-md shadow-app-primary/10 active:scale-95 cursor-pointer"
        >
          <i class="pi pi-plus"></i>
          <span>Nuevo Producto</span>
        </button>
      </div>

      <!-- Toolbar: Search & Availability Filters -->
      <div class="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-app-border shadow-sm">
        <!-- Search Input -->
        <div class="relative w-full md:max-w-md">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-muted text-xs"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre o descripción..."
            class="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-app-border text-app-text rounded-xl focus:outline-none focus:border-app-primary transition-colors"
          />
        </div>

        <!-- Availability Filters -->
        <div class="flex gap-2 w-full md:w-auto">
          <button
            v-for="filterOpt in availabilityFilters"
            :key="filterOpt.value"
            @click="activeAvailability = filterOpt.value"
            :class="[
              'flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200 cursor-pointer active:scale-95',
              activeAvailability === filterOpt.value
                ? 'bg-app-primary text-white border-app-primary shadow-sm shadow-app-primary/10'
                : 'bg-white text-app-text-muted border-app-border hover:bg-slate-50'
            ]"
          >
            {{ filterOpt.label }}
          </button>
        </div>
      </div>

      <!-- Category Filter tabs -->
      <div class="flex gap-2 overflow-x-auto pb-1.5 border-b border-app-border">
        <button
          @click="activeCategory = 'all'"
          :class="['px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap',
            activeCategory === 'all' ? 'bg-app-primary text-white shadow-md shadow-app-primary/10' : 'bg-slate-50 text-app-text-muted hover:bg-slate-100']"
        >
          Ver Todo ({{ filteredByCategoryCount('all') }})
        </button>
        <button
          v-for="cat in cartaStore.categories"
          :key="cat.id"
          @click="activeCategory = cat.id"
          :class="['px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap',
            activeCategory === cat.id ? 'bg-app-primary text-white shadow-md shadow-app-primary/10' : 'bg-slate-50 text-app-text-muted hover:bg-slate-100']"
        >
          {{ cat.name }} ({{ filteredByCategoryCount(cat.id) }})
        </button>
      </div>

      <!-- Products Grid -->
      <div v-if="filteredItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          :class="[
            'bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative group shadow-sm hover:border-slate-300',
            item.available ? 'border-app-border' : 'border-rose-200 opacity-70 hover:opacity-90'
          ]"
        >
          <!-- Out of stock badge overlay -->
          <div v-if="!item.available" class="absolute top-2 right-2 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full z-10">
            Agotado
          </div>

          <!-- Card content -->
          <div class="p-6 space-y-4">
            <!-- Category and price -->
            <div class="flex justify-between items-start">
              <span class="text-[10px] font-bold uppercase tracking-wider text-app-primary bg-app-primary-soft/45 px-2 py-0.5 rounded-md border border-app-primary/20">
                {{ categoryName(item.category) }}
              </span>
              <span class="text-lg font-black text-app-primary">{{ item.price.toFixed(2) }} €</span>
            </div>

            <!-- Product metadata -->
            <div class="space-y-1">
              <h3 class="font-bold text-app-text text-base group-hover:text-app-primary transition-colors flex items-center gap-1.5">
                <span>{{ item.name }}</span>
              </h3>
              <p class="text-xs text-app-text-muted leading-relaxed">{{ item.description }}</p>
            </div>

            <!-- Allergens -->
            <div v-if="item.allergens.length > 0" class="flex flex-wrap gap-1 pt-1">
              <span
                v-for="allergen in item.allergens"
                :key="allergen"
                class="text-[9px] font-semibold bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200"
                :title="`Contiene ${allergen}`"
              >
                {{ allergen }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="p-6 pt-0 border-t border-app-border mt-4 flex items-center justify-between gap-3">
            <!-- Toggle stock & levels -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center gap-2">
                <span class="text-xs text-app-text-muted font-semibold">Estado:</span>
                <button
                  @click="toggleStock(item.id, item.available)"
                  :class="[
                    'px-2 py-0.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer border',
                    item.available ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80'
                  ]"
                >
                  {{ item.available ? 'Disponible' : 'Agotado' }}
                </button>
              </div>
              <div v-if="item.controlStock" class="text-[10px] text-app-text-muted font-semibold flex items-center gap-1">
                <span>Stock:</span>
                <span class="text-app-text font-bold">{{ item.stock }} ud.</span>
                <span class="text-slate-400 font-normal">(Mín. {{ item.minStock }})</span>
              </div>
            </div>

            <!-- Duplicate / Delete -->
            <div class="flex gap-2">
              <button
                @click="duplicateProduct(item)"
                class="p-2 bg-slate-50 hover:bg-app-primary text-slate-500 hover:text-white border border-slate-200 hover:border-transparent rounded-xl transition-all active:scale-95 cursor-pointer"
                title="Duplicar Producto"
              >
                <i class="pi pi-copy text-xs"></i>
              </button>
              <button
                @click="deleteProduct(item.id)"
                class="p-2 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-200 hover:border-transparent rounded-xl transition-all active:scale-95 cursor-pointer"
                title="Eliminar Plato"
              >
                <i class="pi pi-trash text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state when no items match filters -->
      <div v-else class="text-center py-16 bg-white border border-app-border rounded-3xl shadow-sm space-y-3">
        <i class="pi pi-info-circle text-app-text-muted text-4xl"></i>
        <h3 class="font-bold text-lg text-app-text">No se encontraron productos</h3>
        <p class="text-sm text-app-text-muted max-w-md mx-auto">No hay platos ni bebidas en el catálogo que coincidan con la categoría, término de búsqueda o filtros seleccionados.</p>
      </div>

      <!-- Modal Dialog: Create Product -->
      <div
        v-if="showAddDialog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4"
      >
        <div class="bg-white max-w-md w-full p-6 rounded-3xl border border-app-border space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
          <button
            @click="closeAddDialog"
            class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <i class="pi pi-times"></i>
          </button>

          <h3 class="text-xl font-bold text-app-text flex items-center gap-2">
            <i class="pi pi-plus text-app-primary"></i>
            <span>Nuevo Producto</span>
          </h3>
          <p class="text-xs text-app-text-muted">Inserte un plato o bebida en el catálogo general.</p>

          <!-- Error Alert Panel -->
          <div v-if="formErrors.length > 0" class="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 space-y-1.5">
            <p class="text-xs font-bold flex items-center gap-1.5">
              <i class="pi pi-exclamation-triangle"></i>
              <span>Por favor, corrija los siguientes errores:</span>
            </p>
            <ul class="list-disc pl-5 text-[11px] space-y-0.5">
              <li v-for="err in formErrors" :key="err">{{ err }}</li>
            </ul>
          </div>

          <!-- Form fields -->
          <form @submit.prevent="saveProduct" class="space-y-4 pt-2">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-app-text-muted uppercase tracking-wider">Nombre del plato / bebida</label>
              <input
                v-model="newForm.name"
                required
                type="text"
                placeholder="Ej. Tartar de Atún Rojo"
                class="w-full bg-slate-50 border border-app-border text-app-text rounded-xl p-3 text-sm focus:outline-none focus:border-app-primary transition-colors"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-app-text-muted uppercase tracking-wider">Categoría</label>
              <select
                v-model="newForm.category"
                class="w-full bg-slate-50 border border-app-border text-app-text rounded-xl p-3 text-sm focus:outline-none focus:border-app-primary transition-colors cursor-pointer"
              >
                <option value="tapas">Tapas & Entrantes</option>
                <option value="platos">Platos Principales</option>
                <option value="bebidas">Bebidas & Coctelería</option>
                <option value="postres">Postres Artesanales</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-app-text-muted uppercase tracking-wider">Precio (€)</label>
                <input
                  v-model.number="newForm.price"
                  required
                  type="number"
                  step="0.05"
                  min="0.01"
                  placeholder="12.50"
                  class="w-full bg-slate-50 border border-app-border text-app-text rounded-xl p-3 text-sm focus:outline-none focus:border-app-primary transition-colors"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-app-text-muted uppercase tracking-wider">Estado inicial</label>
                <select
                  v-model="newForm.available"
                  class="w-full bg-slate-50 border border-app-border text-app-text rounded-xl p-3 text-sm focus:outline-none focus:border-app-primary transition-colors cursor-pointer"
                >
                  <option :value="true">Disponible</option>
                  <option :value="false">Agotado</option>
                </select>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-app-text-muted uppercase tracking-wider">Descripción o ingredientes</label>
              <textarea
                v-model="newForm.description"
                required
                rows="3"
                placeholder="Describa el plato, guarnición o preparación..."
                class="w-full bg-slate-50 border border-app-border text-app-text rounded-xl p-3 text-sm focus:outline-none focus:border-app-primary transition-colors resize-none"
              ></textarea>
            </div>

            <!-- Stock Control section -->
            <div class="space-y-3 p-3 bg-slate-50 rounded-2xl border border-app-border">
              <div class="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="control-stock"
                  v-model="newForm.controlStock"
                  class="rounded bg-white border-slate-300 text-app-primary focus:ring-0 cursor-pointer"
                />
                <label for="control-stock" class="text-xs font-bold text-app-text cursor-pointer selection:bg-transparent uppercase tracking-wider">Controlar Stock de Inventario</label>
              </div>

              <!-- Stock Values Inputs -->
              <div v-if="newForm.controlStock" class="grid grid-cols-2 gap-4 pt-1.5 border-t border-slate-200/60">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-app-text-muted uppercase tracking-wider">Stock Actual</label>
                  <input
                    v-model.number="newForm.stock"
                    required
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-full bg-white border border-app-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none focus:border-app-primary transition-colors"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-app-text-muted uppercase tracking-wider">Stock Mínimo</label>
                  <input
                    v-model.number="newForm.minStock"
                    required
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-full bg-white border border-app-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none focus:border-app-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <!-- Image Selector & Validation -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-app-text-muted uppercase tracking-wider">Imagen del producto</label>
              <div class="flex items-center gap-3">
                <input
                  type="file"
                  ref="fileInputRef"
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleImageChange"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="triggerFileInput"
                  class="px-4 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-app-border text-app-text rounded-xl transition-colors cursor-pointer"
                >
                  <i class="pi pi-image mr-1"></i> Seleccionar Imagen
                </button>
                <span class="text-xs text-app-text-muted truncate max-w-[200px]">
                  {{ selectedFileName || 'Ningún archivo seleccionado' }}
                </span>
              </div>
              <p class="text-[10px] text-app-text-muted">Formatos permitidos: JPG, PNG, WEBP. Tamaño máximo: 2 MB</p>
            </div>

            <!-- Allergens selection checklist -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-app-text-muted uppercase tracking-wider">Alérgenos</label>
              <div class="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-app-border">
                <div v-for="alg in allergenOptions" :key="alg" class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :id="`alg-${alg}`"
                    :value="alg"
                    v-model="newForm.allergens"
                    class="rounded bg-white border-slate-300 text-app-primary focus:ring-0 cursor-pointer"
                  />
                  <label :for="`alg-${alg}`" class="text-xs text-app-text cursor-pointer selection:bg-transparent">{{ alg }}</label>
                </div>
              </div>
            </div>

            <div class="pt-4 flex gap-3">
              <button
                type="button"
                @click="closeAddDialog"
                class="flex-1 py-3 text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 border border-app-border text-app-text-muted hover:text-app-text transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="flex-1 py-3 text-sm font-bold rounded-xl bg-app-primary hover:bg-app-primary-hover text-white transition-colors cursor-pointer"
              >
                Añadir Producto
              </button>
            </div>
          </form>
        </div>
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
const searchQuery = ref('')
const activeAvailability = ref<'all' | 'available' | 'unavailable'>('all')

const availabilityFilters = [
  { label: 'Todos', value: 'all' as const },
  { label: 'Disponibles', value: 'available' as const },
  { label: 'No disponibles', value: 'unavailable' as const }
]

const allergenOptions = ['Gluten', 'Lácteos', 'Huevo', 'Pescado', 'Moluscos', 'Frutos secos', 'Sulfitos', 'Mostaza']

const newForm = ref({
  name: '',
  description: '',
  price: 0.1,
  category: 'tapas' as 'tapas' | 'platos' | 'bebidas' | 'postres',
  allergens: [] as string[],
  available: true,
  controlStock: false,
  stock: 0,
  minStock: 0
})

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFileName = ref('')
const imageError = ref('')
const formErrors = ref<string[]>([])

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleImageChange = (event: Event) => {
  imageError.value = ''
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) {
    selectedFileName.value = ''
    return
  }

  // Validate format
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    imageError.value = 'Formato de imagen no permitido. Solo se aceptan JPG, PNG y WEBP.'
    selectedFileName.value = ''
    target.value = ''
    return
  }

  // Validate size (2 MB = 2 * 1024 * 1024 bytes)
  if (file.size > 2 * 1024 * 1024) {
    imageError.value = 'El tamaño de la imagen no puede superar los 2 MB.'
    selectedFileName.value = ''
    target.value = ''
    return
  }

  selectedFileName.value = file.name
}

const filteredByCategoryCount = (catId: string) => {
  return cartaStore.menuItems.filter(item => {
    const matchesCategory = catId === 'all' || item.category === catId
    const matchesSearch = !searchQuery.value.trim() || 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesAvailability = activeAvailability.value === 'all' || 
      (activeAvailability.value === 'available' && item.available) || 
      (activeAvailability.value === 'unavailable' && !item.available)
    return matchesCategory && matchesSearch && matchesAvailability
  }).length
}

const filteredItems = computed(() => {
  return cartaStore.menuItems.filter(item => {
    const matchesCategory = activeCategory.value === 'all' || item.category === activeCategory.value
    
    const matchesSearch = !searchQuery.value.trim() || 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      
    const matchesAvailability = activeAvailability.value === 'all' || 
      (activeAvailability.value === 'available' && item.available) || 
      (activeAvailability.value === 'unavailable' && !item.available)
      
    return matchesCategory && matchesSearch && matchesAvailability
  })
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

const duplicateProduct = (item: any) => {
  const duplicate = {
    name: `${item.name} Copia`,
    description: item.description,
    price: item.price,
    category: item.category,
    allergens: [...item.allergens],
    available: false,
    controlStock: item.controlStock || false,
    stock: item.controlStock ? 0 : undefined,
    minStock: item.controlStock ? item.minStock : undefined
  }
  cartaStore.addItem(duplicate)
}

const closeAddDialog = () => {
  showAddDialog.value = false
  formErrors.value = []
  imageError.value = ''
  selectedFileName.value = ''
  newForm.value = {
    name: '',
    description: '',
    price: 0.1,
    category: 'tapas',
    allergens: [],
    available: true,
    controlStock: false,
    stock: 0,
    minStock: 0
  }
}

const saveProduct = () => {
  formErrors.value = []

  // Validaciones
  if (!newForm.value.name.trim()) {
    formErrors.value.push('El nombre del producto es obligatorio.')
  }
  if (!newForm.value.description.trim()) {
    formErrors.value.push('La descripción es obligatoria.')
  }
  if (typeof newForm.value.price !== 'number' || isNaN(newForm.value.price) || newForm.value.price <= 0) {
    formErrors.value.push('El precio debe ser un número mayor que 0.')
  }
  
  if (newForm.value.controlStock) {
    if (typeof newForm.value.stock !== 'number' || isNaN(newForm.value.stock) || newForm.value.stock < 0) {
      formErrors.value.push('El stock actual debe ser un número entero mayor o igual que 0.')
    }
    if (typeof newForm.value.minStock !== 'number' || isNaN(newForm.value.minStock) || newForm.value.minStock < 0) {
      formErrors.value.push('El stock mínimo debe ser un número entero mayor o igual que 0.')
    }
    if (newForm.value.stock !== undefined && newForm.value.minStock !== undefined && newForm.value.minStock > newForm.value.stock) {
      formErrors.value.push('El stock mínimo no puede superar el stock actual.')
    }
  }

  if (imageError.value) {
    formErrors.value.push(imageError.value)
  }

  // Si hay errores, no guardar
  if (formErrors.value.length > 0) {
    return
  }

  // Guardar producto
  cartaStore.addItem({
    name: newForm.value.name.trim(),
    description: newForm.value.description.trim(),
    price: newForm.value.price,
    category: newForm.value.category,
    allergens: newForm.value.allergens,
    available: newForm.value.available,
    controlStock: newForm.value.controlStock,
    stock: newForm.value.controlStock ? newForm.value.stock : undefined,
    minStock: newForm.value.controlStock ? newForm.value.minStock : undefined
  })

  // Reset & close
  closeAddDialog()
}
</script>
