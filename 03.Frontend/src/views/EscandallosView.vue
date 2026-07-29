<template>
  <div class="bg-[#F8F9FA] min-h-[calc(100vh-4rem)] text-[#08071A] font-inter antialiased select-none">
    
    <!-- MAIN ESCANDALLOS ERP CONTAINER -->
    <div class="w-full max-w-[1600px] mx-auto p-4 md:p-6 h-[calc(100vh-6rem)] flex flex-col gap-6">
      
      <!-- HEADER -->
      <div class="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shrink-0">
        <div>
          <span class="text-[10px] font-bold text-[#9235DF] uppercase tracking-widest">Aveniq Gastronomy</span>
          <h2 class="text-2xl font-black tracking-tight font-outfit text-[#08071A] mt-0.5">
            Escandallos & Costes Recetas
          </h2>
          <p class="text-xs text-slate-400 font-medium">Control analítico de costos, margen de contribución, y optimización de carta en tiempo real.</p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer',
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
        
        <!-- TAB 1: RECETAS -->
        <div v-if="activeTab === 'recetas'" class="h-full flex flex-col md:flex-row gap-6">
          <!-- Left side control panel -->
          <div class="w-full md:w-80 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between shrink-0 shadow-sm">
            <div class="space-y-4">
              <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">Filtros & Alta</h3>
              
              <!-- Search Recipe -->
              <div class="relative w-full">
                <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Buscar receta..."
                  class="w-full bg-slate-50 border border-slate-200 focus:border-[#9235DF]/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#08071A] font-semibold transition-colors focus:outline-none"
                />
              </div>

              <!-- Categories filter -->
              <div class="space-y-2">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Categoría</span>
                <div class="flex gap-1.5">
                  <button
                    v-for="cat in categories"
                    :key="cat.value"
                    @click="activeCategory = cat.value"
                    :class="['px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border',
                      activeCategory === cat.value 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50']"
                  >
                    {{ cat.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- New Recipe CTA -->
            <button
              @click="openNewRecipeModal"
              class="w-full py-3 bg-gradient-to-tr from-[#9235DF] to-[#562AAC] hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-95 transition-all mt-4"
            >
              <i class="pi pi-plus"></i>
              <span>Nueva Receta</span>
            </button>
          </div>

          <!-- Recipe visual grid catalog -->
          <div class="flex-1 overflow-y-auto pr-1">
            <div v-if="filteredRecipes.length === 0" class="text-center py-20 text-slate-350 text-xs">
              No se encontraron recetas con el criterio seleccionado.
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <div
                v-for="recipe in filteredRecipes"
                :key="recipe.id"
                class="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-[#9235DF]/20 transition-all duration-300 relative overflow-hidden group"
              >
                <!-- Title & Prep Time -->
                <div class="flex justify-between items-start gap-4">
                  <div>
                    <h4 class="text-sm font-black text-slate-900 leading-snug">{{ recipe.name }}</h4>
                    <span class="text-[9px] text-slate-400 font-bold uppercase block mt-1">Prep: {{ recipe.prepTime }} mins</span>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                    {{ recipe.category }}
                  </span>
                </div>

                <!-- Financial Performance Meter -->
                <div class="grid grid-cols-3 gap-2 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/50 text-[10px] text-slate-500 font-bold text-center">
                  <div>
                    <span class="text-[8px] text-slate-400 block uppercase tracking-wider">Costo</span>
                    <span class="text-slate-800 font-black text-xs block mt-0.5">{{ recipe.totalCost.toFixed(2) }}€</span>
                  </div>
                  <div>
                    <span class="text-[8px] text-slate-400 block uppercase tracking-wider">Margen (€)</span>
                    <span class="text-slate-800 font-black text-xs block mt-0.5">{{ recipe.profit.toFixed(2) }}€</span>
                  </div>
                  <div>
                    <span class="text-[8px] text-slate-400 block uppercase tracking-wider">Margen (%)</span>
                    <span :class="['font-black text-xs block mt-0.5', getMarginColorClass(recipe.marginPercent)]">
                      {{ recipe.marginPercent.toFixed(0) }}%
                    </span>
                  </div>
                </div>

                <!-- Sale Price & CTAs -->
                <div class="border-t border-slate-50 pt-3 flex items-center justify-between gap-4">
                  <div>
                    <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">P. Venta</span>
                    <span class="text-xs font-black text-[#9235DF]">{{ recipe.salePrice.toFixed(2) }} €</span>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <button 
                      @click="selectRecipeTab(recipe, 'ingredientes')"
                      class="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 text-slate-500 text-[10px] font-bold rounded-lg cursor-pointer border border-slate-100 transition-colors"
                    >
                      Ingredientes
                    </button>
                    <button 
                      @click="selectRecipeTab(recipe, 'costes')"
                      class="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg cursor-pointer border border-indigo-100 transition-colors"
                    >
                      Costes
                    </button>
                  </div>
                </div>

                <!-- Color coded margin indicator strip -->
                <span :class="['absolute top-0 left-0 right-0 h-1', getMarginBarClass(recipe.marginPercent)]"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: INGREDIENTES EDITOR -->
        <div v-if="activeTab === 'ingredientes'" class="h-full grid grid-cols-1 lg:grid-cols-10 gap-6 overflow-hidden min-h-0">
          <!-- Left side recipe selector -->
          <div class="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col gap-4 overflow-y-auto shadow-sm">
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Seleccionar Receta</span>
            
            <div class="space-y-2">
              <button
                v-for="rec in escandallosStore.recipesWithCosts"
                :key="rec.id"
                @click="selectedRecipeId = rec.id"
                :class="['w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1',
                  selectedRecipeId === rec.id 
                    ? 'border-[#9235DF] bg-[#9235DF]/5 text-[#9235DF]' 
                    : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700']"
              >
                <span class="font-black text-xs text-slate-900 block">{{ rec.name }}</span>
                <span class="text-[9px] text-slate-400 uppercase font-bold block">Receta de {{ rec.category }}</span>
              </button>
            </div>
          </div>

          <!-- Recipe ingredients detailed list -->
          <div class="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between overflow-hidden shadow-sm">
            <div v-if="!selectedRecipe" class="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-350">
              <div class="w-12 h-12 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-500">
                <i class="pi pi-compass text-lg"></i>
              </div>
              <h4 class="text-xs font-black uppercase tracking-wider mt-3">Editor de Ingredientes</h4>
              <p class="text-xs text-slate-450 mt-1 max-w-[200px] leading-relaxed">
                Seleccione una receta a la izquierda para cargar y estructurar su composición de materias primas.
              </p>
            </div>

            <div v-else class="flex-1 flex flex-col justify-between overflow-hidden h-full space-y-4">
              <!-- Top details -->
              <div class="shrink-0 border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 class="text-sm font-black text-slate-950 font-outfit">{{ selectedRecipe.name }}</h3>
                  <p class="text-[9px] text-slate-400 uppercase font-bold mt-0.5">Composición de Ingredientes • Costo: {{ selectedRecipe.rawMaterialCost.toFixed(2) }} €</p>
                </div>

                <button
                  @click="openAddIngredientInline"
                  class="px-3 py-1.5 bg-[#9235DF] hover:bg-[#562AAC] text-white text-[10px] font-black rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <i class="pi pi-plus"></i>
                  <span>Añadir Insumo</span>
                </button>
              </div>

              <!-- List of ingredients -->
              <div class="flex-1 overflow-y-auto space-y-3 pr-1">
                <div 
                  v-for="(ing, idx) in selectedRecipe.ingredients" 
                  :key="idx"
                  class="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 text-xs text-slate-500 font-bold"
                >
                  <div class="flex-1">
                    <h4 class="font-black text-slate-900">{{ ing.name }}</h4>
                    <p class="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                      Costo Unitario: {{ getIngredientUnitCost(ing.name).toFixed(2) }}€ / {{ ing.unit }}
                    </p>
                  </div>

                  <div class="flex items-center gap-4">
                    <!-- Qty input editor -->
                    <div class="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1 w-28">
                      <input 
                        type="number" 
                        step="any"
                        min="0.01" 
                        v-model.number="ing.quantity"
                        @input="saveRecipesState"
                        class="w-full text-center font-black text-slate-800 focus:outline-none"
                      />
                      <span class="text-[9px] text-slate-400 font-bold uppercase select-none">{{ ing.unit }}</span>
                    </div>

                    <!-- Cost detail -->
                    <div class="w-16 text-right">
                      <span class="text-slate-400 text-[8px] uppercase block">Parcial</span>
                      <span class="font-black text-slate-800">{{ (ing.quantity * getIngredientUnitCost(ing.name)).toFixed(2) }}€</span>
                    </div>

                    <button
                      @click="removeIngredientFromRecipe(idx)"
                      class="p-2 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                    >
                      <i class="pi pi-trash text-[10px]"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: COSTES PANEL -->
        <div v-if="activeTab === 'costes'" class="h-full grid grid-cols-1 lg:grid-cols-10 gap-6 overflow-hidden min-h-0">
          <!-- Left side selector -->
          <div class="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col gap-4 overflow-y-auto shadow-sm">
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Seleccionar Receta</span>
            <div class="space-y-2">
              <button
                v-for="rec in escandallosStore.recipesWithCosts"
                :key="rec.id"
                @click="selectedRecipeId = rec.id"
                :class="['w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1',
                  selectedRecipeId === rec.id 
                    ? 'border-[#9235DF] bg-[#9235DF]/5 text-[#9235DF]' 
                    : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700']"
              >
                <span class="font-black text-xs text-slate-900 block">{{ rec.name }}</span>
                <span class="text-[9px] text-slate-400 uppercase font-bold block">Receta de {{ rec.category }}</span>
              </button>
            </div>
          </div>

          <!-- Cost audit sheet -->
          <div class="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between overflow-y-auto shadow-sm">
            <div v-if="!selectedRecipe" class="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-350">
              <div class="w-12 h-12 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-500">
                <i class="pi pi-chart-bar text-lg"></i>
              </div>
              <h4 class="text-xs font-black uppercase tracking-wider mt-3">Análisis Coste / Margen</h4>
              <p class="text-xs text-slate-450 mt-1 max-w-[200px] leading-relaxed">
                Seleccione una receta a la izquierda para ver su estructura de costos y semáforo financiero.
              </p>
            </div>

            <div v-else class="space-y-6">
              <!-- Top details -->
              <div class="border-b border-slate-50 pb-4">
                <h3 class="text-base font-black text-slate-950 font-outfit">{{ selectedRecipe.name }}</h3>
                <p class="text-[9px] text-slate-400 uppercase font-bold mt-0.5">Estructura Financiera e Indicadores Operativos</p>
              </div>

              <!-- Interactive adjustments forms -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-500 font-bold">
                <div class="space-y-1">
                  <label class="text-[9px] text-slate-400 uppercase block tracking-wider">Precio Venta (€)</label>
                  <input 
                    v-model.number="selectedRecipe.salePrice"
                    type="number"
                    step="any"
                    @input="saveRecipesState"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#9235DF] font-black text-slate-900"
                  />
                </div>

                <div class="space-y-1">
                  <label class="text-[9px] text-slate-400 uppercase block tracking-wider">Mano de Obra (€)</label>
                  <input 
                    v-model.number="selectedRecipe.laborCost"
                    type="number"
                    step="any"
                    @input="saveRecipesState"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#9235DF] font-black text-slate-900"
                  />
                </div>

                <div class="space-y-1">
                  <label class="text-[9px] text-slate-400 uppercase block tracking-wider">Coste Energético (€)</label>
                  <input 
                    v-model.number="selectedRecipe.energyCost"
                    type="number"
                    step="any"
                    @input="saveRecipesState"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#9235DF] font-black text-slate-900"
                  />
                </div>
              </div>

              <!-- General Breakdown -->
              <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-4 text-xs font-bold text-slate-550">
                <span class="text-[9px] text-slate-400 uppercase tracking-widest block border-b border-slate-200 pb-2">Desglose de Costes Gastronómicos</span>
                
                <div class="flex justify-between items-center text-slate-700">
                  <span>1. Coste Materia Prima:</span>
                  <span class="font-mono text-[#08071A] font-black">{{ selectedRecipe.rawMaterialCost.toFixed(2) }} €</span>
                </div>
                <div class="flex justify-between items-center text-slate-700">
                  <span>2. Coste Mano de Obra:</span>
                  <span class="font-mono text-[#08071A] font-black">{{ selectedRecipe.laborCost.toFixed(2) }} €</span>
                </div>
                <div class="flex justify-between items-center text-slate-700">
                  <span>3. Coste Energético:</span>
                  <span class="font-mono text-[#08071A] font-black">{{ selectedRecipe.energyCost.toFixed(2) }} €</span>
                </div>
                <div class="flex justify-between items-center text-slate-900 text-sm border-t border-slate-200 pt-3">
                  <span>COSTE DE ELABORACIÓN TOTAL:</span>
                  <span class="font-mono font-black text-[#9235DF] text-base">{{ selectedRecipe.totalCost.toFixed(2) }} €</span>
                </div>
              </div>

              <!-- Semáforo visual block -->
              <div :class="['p-4 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-bold text-xs', getMarginAlertClass(selectedRecipe.marginPercent)]">
                <div>
                  <span class="text-[9px] uppercase tracking-wider block opacity-70">Semáforo de Rentabilidad</span>
                  <span class="text-sm font-black mt-0.5 block">{{ getMarginAlertLabel(selectedRecipe.marginPercent) }}</span>
                </div>

                <div class="text-right">
                  <span class="text-[9px] uppercase tracking-wider block opacity-70">Beneficio Neto</span>
                  <span class="text-base font-black font-mono block">{{ selectedRecipe.profit.toFixed(2) }} € / plato</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 4: RENTABILIDAD RANKINGS -->
        <div v-if="activeTab === 'rentabilidad'" class="h-full grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          <!-- Ranking: Más rentables -->
          <div class="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4 shadow-sm h-fit">
            <h3 class="text-sm font-black text-emerald-700 uppercase tracking-wider flex items-center gap-2">
              <i class="pi pi-arrow-up-right"></i>
              <span>Platos con Mayor Margen (€)</span>
            </h3>

            <div class="space-y-3 mt-2">
              <div 
                v-for="rec in sortedByProfit" 
                :key="rec.id"
                class="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex items-center justify-between gap-4 text-xs font-bold"
              >
                <div>
                  <h4 class="font-black text-slate-900">{{ rec.name }}</h4>
                  <p class="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Precio: {{ rec.salePrice.toFixed(2) }}€ • Costo: {{ rec.totalCost.toFixed(2) }}€</p>
                </div>

                <div class="text-right">
                  <span class="text-[8px] text-slate-450 block uppercase">Retorno</span>
                  <span class="font-black text-emerald-600 text-sm font-mono">+{{ rec.profit.toFixed(2) }} €</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Ranking: Mayor margen % -->
          <div class="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4 shadow-sm h-fit">
            <h3 class="text-sm font-black text-indigo-700 uppercase tracking-wider flex items-center gap-2">
              <i class="pi pi-percentage"></i>
              <span>Platos con Mayor Margen (%)</span>
            </h3>

            <div class="space-y-3 mt-2">
              <div 
                v-for="rec in sortedByMarginPercent" 
                :key="rec.id"
                class="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex items-center justify-between gap-4 text-xs font-bold"
              >
                <div>
                  <h4 class="font-black text-slate-900">{{ rec.name }}</h4>
                  <p class="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Precio: {{ rec.salePrice.toFixed(2) }}€ • Costo: {{ rec.totalCost.toFixed(2) }}€</p>
                </div>

                <div class="text-right">
                  <span class="text-[8px] text-slate-450 block uppercase">Margen %</span>
                  <span class="font-black text-indigo-600 text-sm font-mono">{{ rec.marginPercent.toFixed(0) }} %</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- DIALOG MODAL: NEW RECIPE -->
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
          <h3 class="text-xl font-bold text-[#08071A] font-outfit">Nueva Ficha de Receta</h3>
          <p class="text-xs text-slate-400 mt-1">Defina los detalles comerciales de la receta.</p>
        </div>

        <form @submit.prevent="saveNewRecipe" class="space-y-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Nombre del Plato/Bebida</label>
            <input v-model="newForm.name" required type="text" placeholder="Ej. Croquetas de Rabo de Toro" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#9235DF]" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Categoría</label>
              <select v-model="newForm.category" required class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none">
                <option value="comida">Comida</option>
                <option value="bebida">Bebida</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Tiempo Prep (mins)</label>
              <input v-model.number="newForm.prepTime" required type="number" min="1" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Precio Venta (€)</label>
              <input v-model.number="newForm.salePrice" required type="number" step="any" min="0.1" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Mano de Obra (€)</label>
              <input v-model.number="newForm.laborCost" required type="number" step="any" min="0" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase tracking-wider block">Energía (€)</label>
              <input v-model.number="newForm.energyCost" required type="number" step="any" min="0" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none" />
            </div>
          </div>

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
              Registrar Ficha
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DIALOG MODAL: ADD INGREDIENT INLINE -->
    <div
      v-if="showAddIngModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
    >
      <div class="bg-white max-w-sm w-full p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          @click="showAddIngModal = false"
          class="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <div>
          <h3 class="text-xl font-bold text-[#08071A] font-outfit">Vincular Materia Prima</h3>
          <p class="text-xs text-slate-400 mt-1">Añada un insumo de almacén a la fórmula técnica.</p>
        </div>

        <form @submit.prevent="submitAddIngredient" class="space-y-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Insumo del Almacén</label>
            <select v-model="ingForm.name" required class="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 focus:outline-none">
              <option 
                v-for="inv in inventarioStore.products" 
                :key="inv.id" 
                :value="inv.name"
              >
                {{ inv.name }} ({{ inv.cost.toFixed(2) }}€ / {{ inv.unit }})
              </option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase tracking-wider block">Cantidad a añadir</label>
            <input v-model.number="ingForm.qty" required type="number" step="any" min="0.001" placeholder="Ej. 0.3 o 1" class="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 font-black text-slate-900 focus:outline-none" />
          </div>

          <div class="pt-4 flex gap-3">
            <button
              type="button"
              @click="showAddIngModal = false"
              class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 py-3 bg-[#9235DF] hover:bg-[#562AAC] text-white font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Añadir
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEscandallosStore } from '../stores/escandallos'
import { useInventarioStore } from '../stores/inventario'

const escandallosStore = useEscandallosStore()
const inventarioStore = useInventarioStore()

// State
const activeTab = ref<'recetas' | 'ingredientes' | 'costes' | 'rentabilidad'>('recetas')
const searchQuery = ref('')
const activeCategory = ref<'all' | 'comida' | 'bebida'>('all')
const selectedRecipeId = ref<string>('rc1')

const showNewModal = ref(false)
const showAddIngModal = ref(false)

const newForm = ref({
  name: '',
  category: 'comida' as const,
  prepTime: 10,
  salePrice: 10.00,
  laborCost: 1.00,
  energyCost: 0.20
})

const ingForm = ref({
  name: '',
  qty: 0
})

const tabs = [
  { id: 'recetas' as const, label: 'Recetas (Escandallo)' },
  { id: 'ingredientes' as const, label: 'Ingredientes Editor' },
  { id: 'costes' as const, label: 'Ficha de Costes' },
  { id: 'rentabilidad' as const, label: 'Ranking Rentabilidad' }
]

const categories = [
  { label: 'Todos', value: 'all' as const },
  { label: 'Comidas', value: 'comida' as const },
  { label: 'Bebidas', value: 'bebida' as const }
]

// Current selected recipe helper
const selectedRecipe = computed(() => {
  return escandallosStore.recipesWithCosts.find(r => r.id === selectedRecipeId.value)
})

// Search & category filter maps
const filteredRecipes = computed(() => {
  return escandallosStore.recipesWithCosts.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    if (!matchesSearch) return false

    if (activeCategory.value !== 'all' && r.category !== activeCategory.value) return false
    
    return true
  })
})

// Ranking helper calculations
const sortedByProfit = computed(() => {
  return [...escandallosStore.recipesWithCosts].sort((a, b) => b.profit - a.profit)
})

const sortedByMarginPercent = computed(() => {
  return [...escandallosStore.recipesWithCosts].sort((a, b) => b.marginPercent - a.marginPercent)
})

// Style tags mappings
const getMarginColorClass = (percent: number): string => {
  if (percent > 70) return 'text-emerald-600'
  if (percent < 40) return 'text-rose-600'
  return 'text-amber-500'
}

const getMarginBarClass = (percent: number): string => {
  if (percent > 70) return 'bg-emerald-500'
  if (percent < 40) return 'bg-rose-500 animate-pulse'
  return 'bg-amber-400'
}

const getMarginAlertClass = (percent: number): string => {
  if (percent > 70) return 'bg-emerald-50 border-emerald-100 text-emerald-800'
  if (percent < 40) return 'bg-rose-50 border-rose-100 text-rose-800 animate-pulse'
  return 'bg-amber-50 border-amber-100 text-amber-800'
}

const getMarginAlertLabel = (percent: number): string => {
  if (percent > 70) return 'Alta Rentabilidad (Verde)'
  if (percent < 40) return 'Crítico - Margen insuficiente (Rojo)'
  return 'Aceptable (Amarillo)'
}

// Helpers for ingredient costs
const getIngredientUnitCost = (name: string): number => {
  const item = inventarioStore.products.find(p => p.name.toLowerCase() === name.toLowerCase())
  return item ? item.cost : 0
}

const saveRecipesState = () => {
  // Directly writing to localstorage triggered by watcher deep inside store
}

// Navigation helpers
const selectRecipeTab = (recipe: any, tab: 'ingredientes' | 'costes') => {
  selectedRecipeId.value = recipe.id
  activeTab.value = tab
}

// CRUD recipe actions
const openNewRecipeModal = () => {
  newForm.value = {
    name: '',
    category: 'comida',
    prepTime: 10,
    salePrice: 10.00,
    laborCost: 1.00,
    energyCost: 0.20
  }
  showNewModal.value = true
}

const saveNewRecipe = () => {
  const added = escandallosStore.addRecipe({
    name: newForm.value.name,
    category: newForm.value.category,
    prepTime: newForm.value.prepTime,
    salePrice: newForm.value.salePrice,
    laborCost: newForm.value.laborCost,
    energyCost: newForm.value.energyCost,
    ingredients: []
  })
  
  selectedRecipeId.value = added.id
  showNewModal.value = false
}

const openAddIngredientInline = () => {
  ingForm.value = {
    name: '',
    qty: 0
  }
  showAddIngModal.value = true
}

const submitAddIngredient = () => {
  const recipe = escandallosStore.recipes.find(r => r.id === selectedRecipeId.value)
  const item = inventarioStore.products.find(p => p.name === ingForm.value.name)
  if (recipe && item) {
    // Check if ingredient already exists in recipe
    const existing = recipe.ingredients.find(i => i.name.toLowerCase() === ingForm.value.name.toLowerCase())
    if (existing) {
      existing.quantity += ingForm.value.qty
    } else {
      recipe.ingredients.push({
        name: item.name,
        quantity: ingForm.value.qty,
        unit: item.unit
      })
    }
  }
  showAddIngModal.value = false
}

const removeIngredientFromRecipe = (idx: number) => {
  const recipe = escandallosStore.recipes.find(r => r.id === selectedRecipeId.value)
  if (recipe) {
    recipe.ingredients.splice(idx, 1)
  }
}
</script>
