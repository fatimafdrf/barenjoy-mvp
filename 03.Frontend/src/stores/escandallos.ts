import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useInventarioStore } from './inventario'

export interface RecipeIngredient {
  name: string
  quantity: number
  unit: string
}

export interface Recipe {
  id: string
  name: string
  category: 'comida' | 'bebida'
  prepTime: number // in minutes
  salePrice: number
  laborCost: number
  energyCost: number
  ingredients: RecipeIngredient[]
}

export const useEscandallosStore = defineStore('escandallos', () => {
  const DEFAULT_RECIPES: Recipe[] = [
    {
      id: 'rc1',
      name: 'Hamburguesa Dry Aged',
      category: 'comida',
      prepTime: 12,
      salePrice: 14.50,
      laborCost: 1.50,
      energyCost: 0.30,
      ingredients: [
        { name: 'Ternera Picada Dry Aged', quantity: 1, unit: 'uds' },
        { name: 'Pan Brioche Artesanal', quantity: 1, unit: 'uds' }
      ]
    },
    {
      id: 'rc2',
      name: 'Bravas Aveniq',
      category: 'comida',
      prepTime: 8,
      salePrice: 8.50,
      laborCost: 1.00,
      energyCost: 0.20,
      ingredients: [
        { name: 'Patatas Lavadas', quantity: 0.3, unit: 'kg' },
        { name: 'Aceite de Oliva Virgen Extra', quantity: 0.05, unit: 'litros' }
      ]
    },
    {
      id: 'rc3',
      name: 'Cerveza Heineken',
      category: 'bebida',
      prepTime: 1,
      salePrice: 3.55,
      laborCost: 0.20,
      energyCost: 0.05,
      ingredients: [
        { name: 'Cerveza Heineken', quantity: 1, unit: 'botellas' }
      ]
    },
    {
      id: 'rc4',
      name: 'Agua Mineral Solán de Cabras',
      category: 'bebida',
      prepTime: 1,
      salePrice: 3.00,
      laborCost: 0.10,
      energyCost: 0.05,
      ingredients: [
        { name: 'Agua Mineral', quantity: 1, unit: 'botellas' }
      ]
    }
  ]

  const loadRecipes = (): Recipe[] => {
    try {
      const data = localStorage.getItem('aveniq_recipes')
      if (data) {
        return JSON.parse(data)
      }
    } catch (e) {
      console.error('Error loading recipes from localStorage:', e)
    }
    return DEFAULT_RECIPES
  }

  const recipes = ref<Recipe[]>(loadRecipes())

  watch(recipes, () => {
    localStorage.setItem('aveniq_recipes', JSON.stringify(recipes.value))
  }, { deep: true })

  // Computed Recipes with reactive calculations based on live inventory costs
  const recipesWithCosts = computed(() => {
    const inventarioStore = useInventarioStore()
    return recipes.value.map(recipe => {
      // Calculate total raw material cost by searching in inventario store
      const rawMaterialCost = recipe.ingredients.reduce((sum, ing) => {
        const invItem = inventarioStore.products.find(p => p.name.toLowerCase() === ing.name.toLowerCase())
        const unitCost = invItem ? invItem.cost : 0
        return sum + (ing.quantity * unitCost)
      }, 0)

      const totalCost = rawMaterialCost + recipe.laborCost + recipe.energyCost
      const profit = recipe.salePrice - totalCost
      const marginPercent = recipe.salePrice > 0 ? (profit / recipe.salePrice) * 100 : 0
      
      let status: 'excellent' | 'normal' | 'risk' = 'normal'
      if (marginPercent > 70) status = 'excellent'
      else if (marginPercent < 40) status = 'risk'

      return {
        ...recipe,
        rawMaterialCost,
        totalCost,
        profit,
        marginPercent,
        status
      }
    })
  })

  // Actions
  const addRecipe = (newRec: Omit<Recipe, 'id'>) => {
    const recipe: Recipe = {
      ...newRec,
      id: 'rc-' + Math.random().toString(36).substr(2, 9)
    }
    recipes.value.push(recipe)
    return recipe
  }

  const deleteRecipe = (id: string) => {
    recipes.value = recipes.value.filter(r => r.id !== id)
  }

  const updateLaborEnergy = (recipeId: string, labor: number, energy: number) => {
    const r = recipes.value.find(item => item.id === recipeId)
    if (r) {
      r.laborCost = labor
      r.energyCost = energy
    }
  }

  return {
    recipes,
    recipesWithCosts,
    addRecipe,
    deleteRecipe,
    updateLaborEnergy
  }
})
