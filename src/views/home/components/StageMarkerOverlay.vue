<template>
  <!-- 孪生点位交互标记（3D 空间坐标实时锚定投影） -->
  <div
    v-for="marker in markers"
    v-show="projectedMarkers[marker.id]?.visible"
    :key="marker.id"
    class="absolute -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center cursor-pointer group/marker select-none"
    :style="{
      left: `${projectedMarkers[marker.id]?.x ?? 50}px`,
      top: `${projectedMarkers[marker.id]?.y ?? 50}px`
    }"
    @click.stop="$emit('select-marker', marker)"
  >
    <!-- 顶部图标+文字胶囊 -->
    <div class="flex items-center gap-1.5">
      <!-- 左侧圆形双环科技图标 -->
      <div
        class="relative w-7 h-7 rounded-full flex items-center justify-center bg-[#072652]/90 border border-[#7dd3fc]/85 shadow-md group-hover/marker:border-[#00e5ff] group-hover/marker:scale-110 transition-all marker-pulse"
        :class="{
          'ring-2 ring-[#00e5ff] bg-[#006699]/90 scale-110': activeMarker?.id === marker.id
        }"
      >
        <!-- 养殖车间/虾池图标 -->
        <svg
          v-if="marker.type === 'cage'"
          class="w-3.5 h-3.5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18M9 5v14M15 5v14" />
        </svg>
        <!-- 循环水处理图标 -->
        <svg
          v-else-if="marker.type === 'cabin'"
          class="w-3.5 h-3.5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="M8 10h8M8 14h5" />
        </svg>
        <!-- 综合管理中控楼图标 -->
        <svg
          v-else-if="marker.type === 'monitor'"
          class="w-3.5 h-3.5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M12 3l7 4v6c0 4.5-3 7.5-7 8-4-.5-7-3.5-7-8V7l7-4z" />
          <circle cx="12" cy="11" r="2.5" />
        </svg>
        <!-- 拌料/设备房图标 -->
        <svg
          v-else-if="marker.type === 'warehouse'"
          class="w-3.5 h-3.5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M3 10l9-6 9 6v10H3V10z" />
          <path d="M9 20v-6h6v6" />
        </svg>
        <!-- 休闲平台图标 -->
        <svg
          v-else-if="marker.type === 'leisure'"
          class="w-3.5 h-3.5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M4 18h16M6 18v-5h12v5M12 4l8 5H4l8-5zM12 9v4" />
        </svg>
        <!-- 增氧机图标 -->
        <svg
          v-else-if="marker.type === 'aerator'"
          class="w-3.5 h-3.5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <circle cx="12" cy="12" r="3" />
          <path
            d="M12 9a4.5 4.5 0 0 1 4.5-4.5M15 12a4.5 4.5 0 0 1 4.5 4.5M12 15a4.5 4.5 0 0 1-4.5 4.5M9 12a4.5 4.5 0 0 1-4.5-4.5"
          />
        </svg>
        <!-- 摄像头图标 -->
        <svg
          v-else-if="marker.type === 'camera'"
          class="w-3.5 h-3.5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <rect x="3" y="7" width="13" height="10" rx="2" />
          <polygon points="16,10 21,7 21,17 16,14" />
        </svg>
        <!-- 水质监测站图标 -->
        <svg
          v-else
          class="w-3.5 h-3.5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M12 3v14M7 10l5-4 5 4M5 19c2-1.5 4.5-1.5 7 0s5 1.5 7 0" />
        </svg>
      </div>

      <!-- 右侧胶囊文字标签 -->
      <span
        class="px-2.5 py-0.5 rounded bg-[#051d3f]/85 border text-[14px] backdrop-blur-sm whitespace-nowrap transition-all shadow"
        :class="
          activeMarker?.id === marker.id
            ? 'border-[#00e5ff] text-[#00e5ff] font-semibold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
            : 'border-[#00c6ff]/40 text-[#e2f1ff] group-hover/marker:text-[#00e5ff] group-hover/marker:border-[#00e5ff]'
        "
      >
        {{ marker.name }}
      </span>
    </div>

    <!-- 3D 锚定引线与发光底座点 -->
    <div class="w-[1px] h-3.5 bg-gradient-to-b from-[#00e5ff] to-transparent opacity-80" />
    <div class="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
  </div>

  <!-- 点击点位后弹出的实时孪生信息浮窗 -->
  <transition name="el-fade-in-linear">
    <div
      v-if="activeMarker"
      class="absolute right-3.5 top-12 z-30 w-[320px] rounded bg-[#061d40]/95 border border-[#00e5ff]/60 p-3.5 shadow-2xl backdrop-blur-md"
    >
      <div class="flex items-center justify-between border-b border-[#00a8ff]/25 pb-2 mb-2">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping" />
          <span class="text-[16px] font-semibold text-white">{{ activeMarker.name }}</span>
          <span
            class="px-2 py-0.5 text-[12px] rounded bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40"
          >
            {{ activeMarker.status }}
          </span>
        </div>
        <button
          class="text-[#7da8d6] hover:text-white text-[14px] bg-transparent border-0 cursor-pointer"
          @click="$emit('clear-marker')"
        >
          ✕
        </button>
      </div>

      <p class="text-[14px] text-[#9cc5eb] leading-relaxed mb-2.5">
        {{ activeMarker.detail }}
      </p>

      <div class="grid grid-cols-3 gap-1.5 bg-[#03122a]/80 p-2 rounded border border-[#00a8ff]/20">
        <div v-for="m in activeMarker.metrics" :key="m.label" class="text-center">
          <div class="text-[14px] text-[#6e96bf]">{{ m.label }}</div>
          <div class="num-highlight text-[16px] text-[#00e5ff] mt-0.5">{{ m.value }}</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { StageMarker } from '@/mock/dashboardData'
import type { ProjectedMarkerPos } from '../three/stageConfig'

defineProps<{
  markers: StageMarker[]
  projectedMarkers: Record<string, ProjectedMarkerPos>
  activeMarker: StageMarker | null
}>()

defineEmits<{
  (e: 'select-marker', marker: StageMarker): void
  (e: 'clear-marker'): void
}>()
</script>

