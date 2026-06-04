<template>
  <div class="min-h-screen bg-slate-950 flex text-slate-100 font-sans">
    <!-- Mobile Sidebar Backdrop -->
    <div 
      v-if="mobileOpen" 
      @click="mobileOpen = false" 
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
    ></div>

    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 glass border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div>
        <!-- Logo -->
        <div class="h-16 flex items-center justify-between px-6 border-b border-slate-800/50">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <span class="font-extrabold text-slate-950 text-lg">B</span>
            </div>
            <div>
              <h1 class="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Barenjoy</h1>
              <p class="text-[10px] text-amber-500 uppercase tracking-widest font-semibold">SaaS RESTAURANTE</p>
            </div>
          </div>
          
          <button @click="mobileOpen = false" class="lg:hidden p-1 text-slate-400 hover:text-white">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="p-4 space-y-1">
          <router-link 
            v-for="item in navItems" 
            :key="item.to" 
            :to="item.to" 
            @click="mobileOpen = false"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-200"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span class="font-medium text-sm">{{ item.name }}</span>
            <!-- Badge if it represents live status -->
            <span 
              v-if="item.badge" 
              class="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </nav>
      </div>

      <!-- User Profile Box -->
      <div class="p-4 border-t border-slate-800/50">
        <div class="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
          <!-- Avatar -->
          <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 font-bold text-amber-500">
            {{ userInitials }}
          </div>
          
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-slate-200 truncate">{{ authStore.user?.name }}</h4>
            <!-- Role Badge -->
            <span :class="['inline-block text-[10px] px-2 py-0.5 rounded-md font-bold mt-0.5 uppercase tracking-wider', roleBadgeClass]">
              {{ roleLabel }}
            </span>
          </div>

          <!-- Logout Button -->
          <button 
            @click="handleLogout" 
            class="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
            title="Cerrar Sesión"
          >
            <i class="pi pi-power-off"></i>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Container -->
    <div class="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
      <!-- Top Header -->
      <header class="h-16 flex items-center justify-between px-6 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div class="flex items-center gap-4">
          <!-- Hamburger toggle for mobile -->
          <button 
            @click="mobileOpen = true" 
            class="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <i class="pi pi-bars text-xl"></i>
          </button>
          
          <!-- Venue Selector -->
          <div class="flex items-center gap-2">
            <i class="pi pi-building text-amber-500"></i>
            <select 
              :value="localesStore.activeLocaleId"
              @change="(e) => localesStore.switchLocale((e.target as HTMLSelectElement).value)"
              class="bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2 pr-8 cursor-pointer focus:outline-none"
            >
              <option 
                v-for="locale in localesStore.locales" 
                :key="locale.id" 
                :value="locale.id"
              >
                {{ locale.name }} {{ locale.status === 'closed' ? '🔴' : '🟢' }}
              </option>
            </select>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-4">
          <!-- Live Indicator -->
          <div class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
            <span class="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            <span class="text-xs text-teal-400 font-semibold uppercase tracking-wider">Live Sync</span>
          </div>

          <!-- Quick System View Roles list -->
          <div class="text-xs text-slate-400 hidden xl:block">
            Modo: <span class="text-amber-500 font-semibold">{{ roleLabel }}</span>
          </div>
        </div>
      </header>

      <!-- View Content -->
      <main class="flex-1 p-6 max-w-7xl w-full mx-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useLocalesStore } from '../stores/locales'
import { useMesasStore } from '../stores/mesas'

// Import Lucide Icons
import { 
  LayoutDashboard, 
  MapPin, 
  ChefHat, 
  GlassWater, 
  Grid2X2, 
  Utensils 
} from '@lucide/vue'

const authStore = useAuthStore()
const localesStore = useLocalesStore()
const mesasStore = useMesasStore()
const router = useRouter()

const mobileOpen = ref(false)

// Navigation items definition
const navItems = computed(() => [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Locales', to: '/locales', icon: MapPin },
  { name: 'Mapa de Mesas', to: '/mesas', icon: Grid2X2 },
  { name: 'Carta / Menú', to: '/carta', icon: Utensils },
  { 
    name: 'Cocina (KDS)', 
    to: '/cocina', 
    icon: ChefHat,
    badge: mesasStore.kitchenItems.filter(i => i.item.status !== 'ready').length || undefined
  },
  { 
    name: 'Barra (BDS)', 
    to: '/barra', 
    icon: GlassWater,
    badge: mesasStore.barItems.filter(i => i.item.status !== 'ready').length || undefined
  }
])

// Get initials of user
const userInitials = computed(() => {
  const name = authStore.user?.name || 'User'
  const parts = name.split(' ')
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

// Role formatting
const roleLabel = computed(() => {
  const role = authStore.user?.role
  if (role === 'admin') return 'Administrador'
  if (role === 'waiter') return 'Camarero'
  if (role === 'kitchen') return 'Cocina'
  if (role === 'bar') return 'Barra'
  return 'Usuario'
})

const roleBadgeClass = computed(() => {
  const role = authStore.user?.role
  if (role === 'admin') return 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
  if (role === 'waiter') return 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
  if (role === 'kitchen') return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
  if (role === 'bar') return 'bg-violet-500/10 text-violet-500 border border-violet-500/20'
  return 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
})

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style>
/* Page transition animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
