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

const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: LoginView,
        meta: { title: 'Iniciar Sesión - Siply' }
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
        meta: { title: 'Dashboard - Siply' }
      },
      {
        path: 'locales',
        name: 'locales',
        component: LocalesView,
        meta: { title: 'Locales - Siply' }
      },
      {
        path: 'mesas',
        name: 'mesas',
        component: MesasView,
        meta: { title: 'Mapa de Mesas - Siply' }
      },
      {
        path: 'carta',
        name: 'carta',
        component: CartaView,
        meta: { title: 'Carta & Menú - Siply' }
      },
      {
        path: 'cocina',
        name: 'cocina',
        component: CocinaView,
        meta: { title: 'Pantalla de Cocina - Siply' }
      },
      {
        path: 'barra',
        name: 'barra',
        component: BarraView,
        meta: { title: 'Pantalla de Barra - Siply' }
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
