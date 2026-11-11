<template>
  <div
    ref="containerRef"
    class="relative w-full flex-1 min-h-0 rounded overflow-hidden border border-[#00a8ff]/25 shadow-inner select-none group bg-[#020d1f]"
  >
    <!-- Three.js 3D 渲染画布容器 -->
    <div ref="canvasWrapRef" class="w-full h-full block cursor-grab active:cursor-grabbing" />

    <!-- 四周柔和暗角过渡（贴合大屏融合感） -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="box-shadow: inset 0 0 46px 14px rgba(3, 14, 34, 0.78)"
    />

    <!-- HUD 控制栏与底部铭牌/备案信息（含顶部双场景切换 Tabs） -->
    <StageHudControls
      :farm-name="farmName"
      :scene-tab="sceneTab"
      :is-auto-rotate="isAutoRotate"
      :show-pulse-effect="showPulseEffect"
      @change-scene-tab="switchSceneTab"
      @toggle-auto-rotate="toggleAutoRotate"
      @reset-camera="resetCameraView"
      @toggle-pulse="togglePulseEffect"
    />

    <!-- 场景 1：3D 孪生厂区空间锚定点位气泡与实时监测详情弹窗 -->
    <StageMarkerOverlay
      v-if="sceneTab === 'farm'"
      :markers="markers"
      :projected-markers="projectedMarkers"
      :active-marker="activeMarker"
      @select-marker="selectMarker"
      @clear-marker="clearActiveMarker"
    />

    <!-- 场景 2：贵州省及周边产销辐射 3D 点线地图图例与仓库供货详情弹窗 -->
    <StageMapOverlay
      v-else
      :selected-hub-id="selectedHubId"
      @select-hub="selectMapHub"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { StageMarker } from '@/mock/dashboardData'
import StageHudControls from './components/StageHudControls.vue'
import StageMarkerOverlay from './components/StageMarkerOverlay.vue'
import StageMapOverlay from './components/StageMapOverlay.vue'
import { useThreeStage } from './three/useThreeStage'

const props = defineProps<{
  farmName: string
  markers: StageMarker[]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const canvasWrapRef = ref<HTMLDivElement | null>(null)

const {
  sceneTab,
  selectedHubId,
  activeMarker,
  isAutoRotate,
  showPulseEffect,
  projectedMarkers,
  selectMarker,
  clearActiveMarker,
  switchSceneTab,
  selectMapHub,
  resetCameraView,
  toggleAutoRotate,
  togglePulseEffect
} = useThreeStage(containerRef, canvasWrapRef, () => props.markers)
</script>
