<template>
  <div class="min-h-screen bg-app-background flex text-app-text font-sans">
    <!-- Mobile Sidebar Backdrop -->
    <div 
      v-if="mobileOpen" 
      @click="mobileOpen = false" 
      class="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
    ></div>

    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-app-border flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen shadow-sm',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div>
        <!-- Logo -->
        <div class="h-16 flex items-center justify-between px-6 border-b border-app-border">
          <AveniqLogo variant="horizontal" />
          
          <button @click="mobileOpen = false" class="lg:hidden p-1 text-slate-500 hover:text-slate-800">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="p-4 space-y-1">
          <router-link 
            v-for="item in navItems" 
            :key="item.to" 
            :to="item.to" 
            active-class="aveniq-nav-active"
            @click="mobileOpen = false"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-app-text hover:bg-slate-50 transition-all duration-200"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span class="font-medium text-sm">{{ item.name }}</span>
            <!-- Badge if it represents live status -->
            <span 
              v-if="item.badge" 
              class="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-app-primary text-white"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </nav>
      </div>

      <!-- User Profile Box -->
      <div class="p-4 border-t border-app-border">
        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-app-border">
          <!-- Avatar -->
          <div class="w-10 h-10 rounded-full bg-app-primary-soft flex items-center justify-center border border-app-primary/20 font-bold text-app-primary">
            {{ userInitials }}
          </div>
          
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-app-text truncate">{{ authStore.user?.name }}</h4>
            <!-- Role Badge -->
            <span :class="['inline-block text-[10px] px-2 py-0.5 rounded-md font-bold mt-0.5 uppercase tracking-wider', roleBadgeClass]">
              {{ roleLabel }}
            </span>
          </div>

          <!-- Logout Button -->
          <button 
            @click="handleLogout" 
            class="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
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
      <header class="h-16 flex items-center justify-between px-6 border-b border-app-border bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-sm">
        <div class="flex items-center gap-4">
          <!-- Hamburger toggle for mobile -->
          <button 
            @click="mobileOpen = true" 
            class="lg:hidden p-2 text-slate-600 hover:text-slate-950 rounded-lg hover:bg-slate-100"
          >
            <i class="pi pi-bars text-xl"></i>
          </button>
          
          <!-- Venue Selector -->
          <div class="flex items-center gap-2">
            <i class="pi pi-building text-app-primary"></i>
            <select 
              :value="localesStore.activeLocaleId"
              @change="(e) => localesStore.switchLocale((e.target as HTMLSelectElement).value)"
              class="bg-white border border-app-border text-app-text text-sm rounded-lg focus:ring-app-primary focus:border-app-primary block p-2 pr-8 cursor-pointer focus:outline-none"
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
          <div class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span class="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Live Sync</span>
          </div>

          <!-- Quick System View Roles list -->
          <div class="text-xs text-app-text-muted hidden xl:block">
            Modo: <span class="text-app-primary font-semibold">{{ roleLabel }}</span>
          </div>
        </div>
      </header>

      <!-- View Content -->
      <main class="flex-1 min-h-[calc(100vh-4rem)]">
        <div class="w-full">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
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
import AveniqLogo from '../components/AveniqLogo.vue'

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
  if (role === 'admin') return 'bg-app-primary-soft text-app-primary border border-app-primary/20'
  if (role === 'waiter') return 'bg-blue-50 text-blue-600 border border-blue-200/60'
  if (role === 'kitchen') return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
  if (role === 'bar') return 'bg-violet-50 text-violet-600 border border-violet-200/60'
  return 'bg-slate-50 text-slate-600 border border-slate-200'
})

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.aveniq-nav-active {
  background-color: var(--color-app-primary-soft);
  color: var(--color-app-primary);
  box-shadow: inset 3px 0 0 var(--color-app-primary);
  font-weight: 600;
  border-left: 0;
}
</style>

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
