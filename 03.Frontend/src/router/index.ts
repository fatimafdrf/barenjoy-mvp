import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Layouts
import AppLayout from '../layouts/AppLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

// Views
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import LocalesView from '../views/LocalesView.vue'
import MesasView from '../views/MesasView.vue'
import CartaView from '../views/CartaView.vue'
import CocinaView from '../views/CocinaView.vue'
import BarraView from '../views/BarraView.vue'
import ReservasView from '../views/ReservasView.vue'
import CrmView from '../views/CrmView.vue'
import InventarioView from '../views/InventarioView.vue'
import EscandallosView from '../views/EscandallosView.vue'
import BiView from '../views/BiView.vue'

const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: LoginView,
        meta: { title: 'Iniciar Sesión - Aveniq' }
      }
    ]
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView,
        meta: { title: 'Dashboard - Aveniq' }
      },
      {
        path: 'locales',
        name: 'locales',
        component: LocalesView,
        meta: { title: 'Locales - Aveniq' }
      },
      {
        path: 'mesas',
        name: 'mesas',
        component: MesasView,
        meta: { title: 'Mapa de Mesas - Aveniq' }
      },
      {
        path: 'reservas',
        name: 'reservas',
        component: ReservasView,
        meta: { title: 'Gestión de Reservas - Aveniq' }
      },
      {
        path: 'crm',
        name: 'crm',
        component: CrmView,
        meta: { title: 'Gestión de Clientes CRM - Aveniq' }
      },
      {
        path: 'inventario',
        name: 'inventario',
        component: InventarioView,
        meta: { title: 'Gestión de Almacén e Inventario - Aveniq' }
      },
      {
        path: 'escandallos',
        name: 'escandallos',
        component: EscandallosView,
        meta: { title: 'Escandallos y Costes Gastronómicos - Aveniq' }
      },
      {
        path: 'bi',
        name: 'bi',
        component: BiView,
        meta: { title: 'Business Intelligence Ejecutivo - Aveniq' }
      },
      {
        path: 'carta',
        name: 'carta',
        component: CartaView,
        meta: { title: 'Carta & Menú - Aveniq' }
      },
      {
        path: 'cocina',
        name: 'cocina',
        component: CocinaView,
        meta: { title: 'Pantalla de Cocina - Aveniq' }
      },
      {
        path: 'barra',
        name: 'barra',
        component: BarraView,
        meta: { title: 'Pantalla de Barra - Aveniq' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Update page title
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next({ name: 'login' })
    } else {
      next()
    }
  } else {
    // If user is authenticated and tries to open login page, redirect to dashboard
    if (to.name === 'login' && authStore.isAuthenticated) {
      next({ name: 'dashboard' })
    } else {
      next()
    }
  }
})

export default router
