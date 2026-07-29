import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Layouts
import AppLayout from '../layouts/AppLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('../views/LoginView.vue'),
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
        component: () => import('../views/DashboardView.vue'),
        meta: { title: 'Dashboard - Aveniq', roles: ['admin', 'waiter', 'kitchen', 'bar'] }
      },
      {
        path: 'locales',
        name: 'locales',
        component: () => import('../views/LocalesView.vue'),
        meta: { title: 'Locales - Aveniq', roles: ['admin', 'waiter'] }
      },
      {
        path: 'mesas',
        name: 'mesas',
        component: () => import('../views/MesasView.vue'),
        meta: { title: 'Mapa de Mesas - Aveniq', roles: ['admin', 'waiter'] }
      },
      {
        path: 'reservas',
        name: 'reservas',
        component: () => import('../views/ReservasView.vue'),
        meta: { title: 'Gestión de Reservas - Aveniq', roles: ['admin', 'waiter'] }
      },
      {
        path: 'crm',
        name: 'crm',
        component: () => import('../views/CrmView.vue'),
        meta: { title: 'Gestión de Clientes CRM - Aveniq', roles: ['admin', 'waiter'] }
      },
      {
        path: 'inventario',
        name: 'inventario',
        component: () => import('../views/InventarioView.vue'),
        meta: { title: 'Gestión de Almacén e Inventario - Aveniq', roles: ['admin'] }
      },
      {
        path: 'escandallos',
        name: 'escandallos',
        component: () => import('../views/EscandallosView.vue'),
        meta: { title: 'Escandallos y Costes Gastronómicos - Aveniq', roles: ['admin'] }
      },
      {
        path: 'bi',
        name: 'bi',
        component: () => import('../views/BiView.vue'),
        meta: { title: 'Business Intelligence Ejecutivo - Aveniq', roles: ['admin'] }
      },
      {
        path: 'personal',
        name: 'personal',
        component: () => import('../views/PersonalView.vue'),
        meta: { title: 'Gestión de Personal y Turnos - Aveniq', roles: ['admin'] }
      },
      {
        path: 'ava',
        name: 'ava',
        component: () => import('../views/AvaView.vue'),
        meta: { title: 'AVA AI Director de Operaciones - Aveniq', roles: ['admin'] }
      },
      {
        path: 'carta',
        name: 'carta',
        component: () => import('../views/CartaView.vue'),
        meta: { title: 'Carta & Menú - Aveniq', roles: ['admin', 'waiter'] }
      },
      {
        path: 'cocina',
        name: 'cocina',
        component: () => import('../views/CocinaView.vue'),
        meta: { title: 'Pantalla de Cocina - Aveniq', roles: ['admin', 'kitchen'] }
      },
      {
        path: 'barra',
        name: 'barra',
        component: () => import('../views/BarraView.vue'),
        meta: { title: 'Pantalla de Barra - Aveniq', roles: ['admin', 'bar'] }
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

  const isAuthRequired = to.matched.some(record => record.meta.requiresAuth)

  if (isAuthRequired) {
    if (!authStore.isAuthenticated) {
      next({ name: 'login' })
    } else {
      // Validate roles if restricted
      const userRole = authStore.user?.role
      const allowedRoles = to.meta.roles as string[] | undefined

      if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
        // Redirige al Dashboard si no tiene permisos
        next({ name: 'dashboard' })
      } else {
        next()
      }
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
