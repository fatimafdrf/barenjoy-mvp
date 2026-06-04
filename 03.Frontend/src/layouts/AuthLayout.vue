<template>
  <div class="min-h-screen w-full relative flex items-center justify-center bg-slate-950 overflow-hidden px-4">
    <!-- Animated background gradients -->
    <div class="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-amber-500/10 blur-[120px] animate-pulse duration-[10s]"></div>
    <div class="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-teal-500/10 blur-[120px] animate-pulse duration-[15s]"></div>
    
    <!-- Floating background shapes for organic feel -->
    <div class="absolute top-1/4 left-1/3 w-32 h-32 rounded-full border border-white/5 bg-white/2 backdrop-blur-3xl animate-bounce duration-[20s]"></div>
    <div class="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full border border-white/5 bg-white/2 backdrop-blur-3xl animate-pulse duration-[8s]"></div>

    <!-- Main View Container -->
    <div class="w-full max-w-md z-10">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
// Auth Layout
</script>

<style scoped>
.animate-pulse {
  animation: pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.1); }
}
</style>
