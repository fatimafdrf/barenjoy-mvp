<template>
  <div class="min-h-screen w-full relative flex items-center justify-center bg-app-background overflow-x-hidden overflow-y-auto px-4 py-6">
    <!-- Discreet background gradients behind the card -->
    <div class="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-app-primary/5 blur-[120px] pointer-events-none"></div>
    <div class="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-app-primary/5 blur-[120px] pointer-events-none"></div>
    
    <!-- Floating background shapes for organic feel -->
    <div class="absolute top-1/4 left-1/3 w-32 h-32 rounded-full border border-app-border/40 bg-white/20 backdrop-blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full border border-app-border/40 bg-white/20 backdrop-blur-3xl pointer-events-none"></div>

    <!-- Main View Container -->
    <div class="w-full max-w-md z-10">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
