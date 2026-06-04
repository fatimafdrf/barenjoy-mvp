<template>
  <div class="glass p-8 rounded-3xl glow-amber border border-white/10 w-full shadow-2xl relative">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/20">
        <span class="font-black text-slate-950 text-3xl">B</span>
      </div>
      <h2 class="text-2xl font-bold tracking-tight text-white">Bienvenido a Barenjoy</h2>
      <p class="text-xs text-slate-400 mt-1">El sistema inteligente de gestión para tu local</p>
    </div>

    <!-- Mode Selector for demo testing -->
    <div class="space-y-3">
      <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-4">Acceso de Demostración (MVP)</p>
      
      <button 
        @click="selectRole('admin')"
        class="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-500 transition-all duration-300 font-semibold cursor-pointer group"
      >
        <div class="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
          AD
        </div>
        <div class="text-left">
          <p class="text-sm font-bold text-slate-200">Administrador</p>
          <p class="text-[11px] text-slate-400">Ver estadísticas, locales y carta</p>
        </div>
        <i class="pi pi-chevron-right ml-auto text-xs group-hover:translate-x-1 transition-transform"></i>
      </button>

      <button 
        @click="selectRole('waiter')"
        class="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 transition-all duration-300 font-semibold cursor-pointer group"
      >
        <div class="w-10 h-10 rounded-xl bg-blue-500 text-slate-950 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
          CA
        </div>
        <div class="text-left">
          <p class="text-sm font-bold text-slate-200">Camarero (Sala)</p>
          <p class="text-[11px] text-slate-400">Tomar comandas y gestionar mesas</p>
        </div>
        <i class="pi pi-chevron-right ml-auto text-xs group-hover:translate-x-1 transition-transform"></i>
      </button>

      <button 
        @click="selectRole('kitchen')"
        class="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 transition-all duration-300 font-semibold cursor-pointer group"
      >
        <div class="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
          CO
        </div>
        <div class="text-left">
          <p class="text-sm font-bold text-slate-200">Chef (Cocina)</p>
          <p class="text-[11px] text-slate-400">KDS: Gestión de comandas de comida</p>
        </div>
        <i class="pi pi-chevron-right ml-auto text-xs group-hover:translate-x-1 transition-transform"></i>
      </button>

      <button 
        @click="selectRole('bar')"
        class="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-400 transition-all duration-300 font-semibold cursor-pointer group"
      >
        <div class="w-10 h-10 rounded-xl bg-violet-500 text-slate-950 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
          BA
        </div>
        <div class="text-left">
          <p class="text-sm font-bold text-slate-200">Barman (Barra)</p>
          <p class="text-[11px] text-slate-400">BDS: Preparación de bebidas y cafés</p>
        </div>
        <i class="pi pi-chevron-right ml-auto text-xs group-hover:translate-x-1 transition-transform"></i>
      </button>
    </div>

    <!-- Footer branding -->
    <div class="text-center mt-8 text-[11px] text-slate-500">
      Barenjoy MVP &copy; 2026 - Conectado a base de datos local
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
