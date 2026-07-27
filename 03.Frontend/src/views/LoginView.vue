<template>
  <div class="bg-white p-8 rounded-3xl border border-app-border w-full shadow-xl relative">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="font-extrabold text-3xl tracking-tight text-app-primary mb-2">
        Siply
      </h1>
      <p class="text-xs text-app-text-muted">El sistema inteligente de gestión para tu local</p>
    </div>

    <!-- Mode Selector for demo testing -->
    <div class="space-y-3">
      <p class="text-xs font-semibold text-app-text-muted uppercase tracking-widest text-center mb-4">Acceso de Demostración (MVP)</p>
      
      <button 
        @click="selectRole('admin')"
        class="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-app-border hover:shadow-md transition-all duration-300 font-semibold cursor-pointer group"
      >
        <div class="w-10 h-10 rounded-xl bg-app-primary-soft text-app-primary flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
          AD
        </div>
        <div class="text-left">
          <p class="text-sm font-bold text-app-text">Administrador</p>
          <p class="text-[11px] text-app-text-muted">Ver estadísticas, locales y carta</p>
        </div>
        <i class="pi pi-chevron-right ml-auto text-xs text-slate-400 group-hover:text-app-primary group-hover:translate-x-1 transition-all duration-300"></i>
      </button>

      <button 
        @click="selectRole('waiter')"
        class="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-app-border hover:shadow-md transition-all duration-300 font-semibold cursor-pointer group"
      >
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
          CA
        </div>
        <div class="text-left">
          <p class="text-sm font-bold text-app-text">Camarero (Sala)</p>
          <p class="text-[11px] text-app-text-muted">Tomar comandas y gestionar mesas</p>
        </div>
        <i class="pi pi-chevron-right ml-auto text-xs text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300"></i>
      </button>

      <button 
        @click="selectRole('kitchen')"
        class="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-app-border hover:shadow-md transition-all duration-300 font-semibold cursor-pointer group"
      >
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
          CO
        </div>
        <div class="text-left">
          <p class="text-sm font-bold text-app-text">Chef (Cocina)</p>
          <p class="text-[11px] text-app-text-muted">KDS: Gestión de comandas de comida</p>
        </div>
        <i class="pi pi-chevron-right ml-auto text-xs text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all duration-300"></i>
      </button>

      <button 
        @click="selectRole('bar')"
        class="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-app-border hover:shadow-md transition-all duration-300 font-semibold cursor-pointer group"
      >
        <div class="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
          BA
        </div>
        <div class="text-left">
          <p class="text-sm font-bold text-app-text">Barman (Barra)</p>
          <p class="text-[11px] text-app-text-muted">BDS: Preparación de bebidas y cafés</p>
        </div>
        <i class="pi pi-chevron-right ml-auto text-xs text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all duration-300"></i>
      </button>
    </div>

    <!-- Footer branding -->
    <div class="text-center mt-8 text-[11px] text-app-text-muted">
      Siply MVP &copy; 2026 - Conectado a base de datos local
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore, type UserRole } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const selectRole = async (role: UserRole) => {
  const success = await authStore.login(role)
  if (success) {
    // Redirect based on role to make flow feel smart
    if (role === 'kitchen') {
      router.push({ name: 'cocina' })
    } else if (role === 'bar') {
      router.push({ name: 'barra' })
    } else if (role === 'waiter') {
      router.push({ name: 'mesas' })
    } else {
      router.push({ name: 'dashboard' })
    }
  }
}
</script>
