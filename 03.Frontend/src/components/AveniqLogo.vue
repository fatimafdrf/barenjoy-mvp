<template>
  <div :class="containerClass" :style="containerStyle">
    <!-- Icon -->
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      :class="svgIconClass"
      :style="svgStyle"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="primaryColor" />
          <stop offset="100%" :stop-color="secondaryColor" />
        </linearGradient>
      </defs>
      <!-- Beautiful abstract geometric A -->
      <path 
        d="M 50 10 
           C 40 10, 32 18, 28 28
           L 8 72
           C 4 80, 10 90, 19 90
           L 32 90
           C 37 90, 42 86, 44 80
           L 50 64
           L 56 80
           C 58 86, 63 90, 68 90
           L 81 90
           C 90 90, 96 80, 92 72
           L 72 28
           C 68 18, 60 10, 50 10 Z
           M 50 36
           A 9 9 0 1 1 50 54
           A 9 9 0 1 1 50 36 Z" 
        :fill="iconFill" 
        fill-rule="evenodd" 
      />
    </svg>

    <!-- Text "Aveniq" -->
    <span 
      v-if="variant === 'horizontal' || variant === 'vertical'"
      :class="textClass"
    >
      Aveniq
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'horizontal' | 'vertical' | 'icon' | 'square'
    color?: 'default' | 'mono' | 'white' | 'dark'
    size?: number | string
    iconSize?: number | string
    gradientId?: string
  }>(),
  {
    variant: 'horizontal',
    color: 'default',
    size: '',
    iconSize: '',
    gradientId: 'aveniq-logo-grad'
  }
)

const primaryColor = '#9235DF'
const secondaryColor = '#562AAC'

const containerClass = computed(() => {
  if (props.variant === 'vertical') {
    return 'flex flex-col items-center gap-3 text-center'
  }
  if (props.variant === 'square') {
    return 'flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#9235DF] to-[#562AAC] p-2.5 shadow-md shadow-app-primary/10'
  }
  return 'flex items-center gap-3'
})

const containerStyle = computed(() => {
  if (props.variant === 'square') {
    const s = typeof props.size === 'number' ? `${props.size}px` : props.size || '48px'
    return { width: s, height: s }
  }
  return {}
})

const svgIconClass = computed(() => {
  if (props.variant === 'square') return 'w-full h-full'
  return ''
})

const svgStyle = computed(() => {
  if (props.variant === 'square') return {}
  const s = typeof props.iconSize === 'number' ? `${props.iconSize}px` : props.iconSize
  const defaultSize = props.variant === 'vertical' ? '64px' : '32px'
  const finalSize = s || defaultSize
  return {
    width: finalSize,
    height: finalSize
  }
})

const iconFill = computed(() => {
  if (props.variant === 'square' || props.color === 'white') return '#FFFFFF'
  if (props.color === 'mono') return 'currentColor'
  if (props.color === 'dark') return '#08071A'
  return `url(#${props.gradientId})`
})

const textClass = computed(() => {
  let colorClass = 'text-app-primary'
  if (props.color === 'white') colorClass = 'text-white'
  if (props.color === 'mono') colorClass = 'text-current'
  if (props.color === 'dark') colorClass = 'text-[#08071A]'

  const fontClass = 'font-black tracking-tight font-sans'
  const sizeClass = props.variant === 'vertical' ? 'text-3xl' : 'text-2xl'
  
  return `${fontClass} ${sizeClass} ${colorClass}`
})
</script>
