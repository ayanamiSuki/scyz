<template>
  <div
    class="relative flex items-center justify-center shrink-0 select-none"
    :class="sizeClass"
  >
    <!-- 科技感双层发光底座背景 -->
    <svg class="w-full h-full" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient :id="`grad-${name}`" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#0066cc" stop-opacity="0.25" />
        </linearGradient>
        <radialGradient :id="`glow-${name}`" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.32" />
          <stop offset="100%" stop-color="#003366" stop-opacity="0.05" />
        </radialGradient>
      </defs>

      <!-- 外圈光晕与刻度圆环 -->
      <circle cx="24" cy="24" r="21" :fill="`url(#glow-${name})`" :stroke="`url(#grad-${name})`" stroke-width="1" />
      <circle cx="24" cy="24" r="17" stroke="#00e5ff" stroke-opacity="0.28" stroke-width="0.8" stroke-dasharray="3 2" />

      <!-- 养殖水体 (立方水体轮廓) -->
      <g v-if="name === 'water'" stroke="#00e5ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="24" cy="16" rx="10" ry="4" fill="rgba(0,229,255,0.15)" />
        <path d="M14 16v14c0 2.2 4.5 4 10 4s10-1.8 10-4V16" fill="rgba(0,150,255,0.12)" />
        <path d="M14 23c0 2.2 4.5 4 10 4s10-1.8 10-4" stroke-opacity="0.65" />
      </g>

      <!-- 养殖网箱 (圆柱网箱网格) -->
      <g v-else-if="name === 'cage'" stroke="#00e5ff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="24" cy="17" rx="11" ry="4" fill="rgba(0,229,255,0.18)" />
        <path d="M13 17v12c0 2.2 4.9 4 11 4s11-1.8 11-4V17" fill="rgba(0,130,255,0.1)" />
        <path d="M13 23c0 2.2 4.9 4 11 4s11-1.8 11-4" stroke-opacity="0.6" />
        <line x1="18" y1="20" x2="18" y2="32" stroke-opacity="0.55" />
        <line x1="24" y1="21" x2="24" y2="33" stroke-opacity="0.55" />
        <line x1="30" y1="20" x2="30" y2="32" stroke-opacity="0.55" />
      </g>

      <!-- 养殖品种 (双鱼剪影) -->
      <g v-else-if="name === 'species'" stroke="#00e5ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 22c4-5 11-5 15 0-4 5-11 5-15 0z" fill="rgba(0,229,255,0.22)" />
        <path d="M28 22l5-3.5v7L28 22z" fill="rgba(0,229,255,0.25)" />
        <circle cx="17" cy="21.5" r="1" fill="#ffffff" />
        <path d="M17 29c3-3 8-3 11 0-3 3-8 3-11 0z" stroke-opacity="0.7" />
      </g>

      <!-- 养殖面积 (立体海域网格) -->
      <g v-else-if="name === 'area'" stroke="#00e5ff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="24,13 36,19 24,25 12,19" fill="rgba(0,229,255,0.2)" />
        <polyline points="12,24 24,30 36,24" stroke-opacity="0.75" />
        <polyline points="12,29 24,35 36,29" stroke-opacity="0.5" />
        <line x1="18" y1="16" x2="30" y2="22" stroke-opacity="0.6" />
        <line x1="30" y1="16" x2="18" y2="22" stroke-opacity="0.6" />
      </g>

      <!-- 设计产能 (雷达靶心与指标) -->
      <g v-else-if="name === 'capacity'" stroke="#00e5ff" stroke-width="1.5" stroke-linecap="round">
        <circle cx="24" cy="24" r="9" fill="rgba(0,229,255,0.14)" />
        <circle cx="24" cy="24" r="3.5" fill="#00e5ff" />
        <line x1="24" y1="11" x2="24" y2="15" />
        <line x1="24" y1="33" x2="24" y2="37" />
        <line x1="11" y1="24" x2="15" y2="24" />
        <line x1="33" y1="24" x2="37" y2="24" />
      </g>

      <!-- 当前存塘 (立体水箱鱼群) -->
      <g v-else-if="name === 'stock'" stroke="#00e5ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="14" y="16" width="20" height="16" rx="2" fill="rgba(0,180,255,0.2)" />
        <path d="M14 22c3-1.5 6 1.5 10 0s7 1.5 10 0" stroke="#38bdf8" />
        <path d="M20 27c2.5-2 5.5-2 8 0-2.5 2-5.5 2-8 0z" fill="#00e5ff" />
      </g>

      <!-- 今日投喂量 (料袋/投料) -->
      <g v-else-if="name === 'feed'" stroke="#00e5ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 20h14l2 12H15l2-12z" fill="rgba(0,229,255,0.2)" />
        <path d="M20 20c0-3 1.5-5 4-5s4 2 4 5" />
        <circle cx="24" cy="26" r="2.2" fill="#00e5ff" />
      </g>

      <!-- 累计产量 (勋章/齿轮称重) -->
      <g v-else-if="name === 'yield'" stroke="#00e5ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="24,13 33,18 33,29 24,34 15,29 15,18" fill="rgba(0,229,255,0.18)" />
        <polyline points="20,24 23,27 29,20" stroke="#ffffff" stroke-width="2" />
      </g>

      <!-- 设备在线率 (信号脉冲球) -->
      <g v-else stroke="#00e5ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="24" cy="24" r="9" fill="rgba(34,197,94,0.2)" stroke="#22c55e" />
        <path d="M18 24h3l2-4 3 8 2-4h3" stroke="#4ade80" stroke-width="1.8" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  sizeClass?: string
}

withDefaults(defineProps<Props>(), {
  sizeClass: 'w-11 h-11'
})
</script>

