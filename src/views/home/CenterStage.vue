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
      style="box-shadow: inset 0 0 46px 14px rgba(3, 14, 34, 0.78);"
    />

    <!-- 左上角：3D 孪生场景状态与操作提示 -->
    <div class="absolute left-3.5 top-3 z-20 flex items-center gap-2 pointer-events-none">
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#051b3b]/80 border border-[#00c6ff]/35 backdrop-blur-sm text-[11px] text-[#bfe3ff]">
        <span class="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
        <span>3D 实时孪生引擎</span>
        <span class="text-[#00e5ff]/60">|</span>
        <span class="text-[#7da8d6]">拖拽旋转 · 滚轮缩放 · 点击点位聚焦</span>
      </div>
    </div>

    <!-- 左下角：3D 视角与特效控制栏 -->
    <div class="absolute left-3.5 bottom-3.5 z-20 flex items-center gap-2">
      <button
        type="button"
        class="px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-sm border"
        :class="
          isAutoRotate
            ? 'bg-[#00a8ff]/30 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.3)]'
            : 'bg-[#051b3b]/80 border-[#00c6ff]/35 text-[#c8e4ff] hover:border-[#00e5ff]'
        "
        @click="toggleAutoRotate"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
        <span>{{ isAutoRotate ? '巡航中' : '自动巡航' }}</span>
      </button>

      <button
        type="button"
        class="px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5 bg-[#051b3b]/80 border border-[#00c6ff]/35 text-[#c8e4ff] hover:border-[#00e5ff] hover:text-[#00e5ff] transition-all cursor-pointer backdrop-blur-sm"
        @click="resetCameraView"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
        <span>全厂复位</span>
      </button>

      <button
        type="button"
        class="px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-sm border"
        :class="
          showPulseEffect
            ? 'bg-[#00a8ff]/25 border-[#00e5ff]/80 text-[#00e5ff]'
            : 'bg-[#051b3b]/80 border-[#00c6ff]/35 text-[#8ab4dc] hover:border-[#00e5ff]'
        "
        @click="togglePulseEffect"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9" stroke-dasharray="3 3" />
          <circle cx="12" cy="12" r="4" />
        </svg>
        <span>脉冲光效</span>
      </button>
    </div>

    <!-- 画面中下方：当前养殖场名称铭牌 -->
    <div
      class="absolute left-1/2 bottom-3.5 -translate-x-1/2 z-10 px-4 py-1 rounded bg-[#051b3b]/80 border border-[#00c6ff]/40 backdrop-blur-sm text-[14px] font-semibold text-[#d8f0ff] tracking-wider pointer-events-none"
      style="box-shadow: 0 2px 12px rgba(0, 0, 0, 0.55);"
    >
      {{ farmName }} · 3D 数字孪生工厂
    </div>

    <!-- 右下角：公网安备与 ICP 备案信息 -->
    <div class="absolute right-3.5 bottom-3.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#051b3b]/80 border border-[#00c6ff]/35 backdrop-blur-sm text-[11px] text-[#8ab4dc]">
      <img
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAoCAYAAACWwljjAAAFQklEQVRYw+3Wa1BUdRjH8SOpMeg4WhZGpDIxiaaTeUFgWrxE4AVRQJGlRRAVIV1JkbgMgQLi5AVBQSVLSp0xlEAUKBEEFZCrCstll8UV2AV2YbmoGCrYv31+R95UL5pmmtamZ+bz6rz5nvOc/5zDcX9jGLs/iTxuyvIlWYkRFeTHA2HVRFtzfhthTG5KuH96/vUgNlC4mMgyw1NJit/aAXLKazYje9xtIMZ/OZz50gW+9hcNkvoLEemEPbnrSP47QYwxQ5Ifv54RqzcXwFFvSyjaOhfavN8F7Y5ZcC/HH9JOB4LNa9Zw5YA76OZV8vIGMdZtSp7cDrtOnOavYiQhTAiPwi1AMtIQaqyngsxpBtw2GAGDKfaQmpUAa6xc4Vfp4UtEdzAMycsT9JQ1Tyctl/2eEkuTlYysF/rCUNxMqDEzgTqzSXBnpgnIHCzgjvEEuD52DLBr3rA1MAaWmNtB582wdtIljZ9G9D+IPU6aTxIPBjHCcXvg3CEh9K2fDLWvjIH6D6fwTIyheuwEqLUyhzLOALq8pkN+bgRw3HY4FBsMzxojZxP9DequLjAlQwVrbpIjhyIY4UYGQ/buhdBqPxlk3Gion2IMDQIz3kJe/ZS34I7uHkmD7VSQVgYDNyIAwsNCgfXGXoOBPjP9DKrOCAogA2etGTmTHAMcFwFZye7wS5QlVHGjoEw4A2qPCUBZ6AzNcQ5Q/YYRdO+YB1U3dsDwypLio4FJ3ECryIzWz6Cm3NgTRHN8HiPF6eHAGSbAdh8feFZkB7krzaHE9h2o85sDsiAbkIsXQMN+e2CtGyF0kzdwXCgU5++D/ouLQFV4OEU/g2Q/iNuIPNaKkQflAWBqexxGjhLDVUcL6IwSQN3SGVChe6FJg9dckCx6D1QBliDZLIAxo7eA8eyv4KE0BJqTrHkZvnL9DJKn+Twmt0NsGGHZy2Dn3kQYfsQ53Hh4/r4RNGz8AIpdzKEuaAF0RC2E57MmQgE3ATjuM/CPiANW7AqSfQJQ5vk362eQKmd3JrmXsoSRocpNIMnbB9zbceDIWUPmuHFQNMkISqa9DpUvNK6YDpW2s8DfwBK48WFQnhMCgzUBoLy0BrRVe5P0NWjPLdKUsJiR1tR1wGp8IeZwMgx/SrgRvjxuAziNcwLvyathLOcJHLflhRDYGRYFrNET2rJ5yvPLoas0tOj/oL8UpC4JHyTSU+6MNCS4gvKoAB5WiKG+MAQSg0WwLXQ/ZJ3xhao0FxB5hYCbUwAEfhEF3Td8QP2dAOQnPwFlxgrolUVq9TPoaX+ZB2nLc2Gk6awj1MU78HZZwJMid2Byb550JQwVO0NfxlJgdz14vWKeRAiK6DlQF28PLZdcoLNcBIO92bb6GTQ8Q/13RURT6tlH2gvXMlITLYD6uI+gp2ozdF0VQXumM6ivCqGvahM8kPiDItkeGo8tB025GFQ3xFrSr06zI3/4yde7oN7m0sWk5eKWDqK5JWJQvAHac9ygq3Adr9gTNNc3QG85rzPfHe5/7wDtPwuhp/Zz6CjyhaZzwi6ivfetHdH/oP77+3PJQOsuRnqkQdCa4wWqyx6gyecpL64GTaEX7ycXUJz4GJp1B4O0X/Hg0Xp1tFV+8Ei1k6c5coHofxBrrzQinbKYo0SVJ+wn6iurGHlY5gY911aDJnMFaHXXiDp9GQyvtKfUA9QFTtBZ7gPdit0tpFd9OpwwFmlA9D/o9yNLDpxIKmI8PMnNSNtviCLVpYTITzrXEGWaq4qos0WgOPdpCenIF+eRrurjB4k0PXopYZG6gMg/D/gNBUxhAbSAmKMAAAAASUVORK5CYII="
        alt=""
        class="w-4 h-4 shrink-0"
      />
      <a
        href="https://beian.mps.gov.cn/#/query/webSearch?code=52011502009461"
        rel="noreferrer"
        target="_blank"
        class="text-[#8ab4dc] hover:text-[#00e5ff] no-underline transition-colors"
      >
        贵公网安备52011502009461
      </a>
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        class="ml-3 text-[#8ab4dc] hover:text-[#00e5ff] no-underline transition-colors"
      >
        黔ICP备2024041452号-1
      </a>
    </div>

    <!-- 10个孪生点位交互标记（3D 空间坐标实时锚定投影） -->
    <div
      v-for="marker in markers"
      v-show="projectedMarkers[marker.id]?.visible"
      :key="marker.id"
      class="absolute -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center cursor-pointer group/marker select-none"
      :style="{
        left: `${projectedMarkers[marker.id]?.x ?? 50}px`,
        top: `${projectedMarkers[marker.id]?.y ?? 50}px`
      }"
      @click.stop="selectMarker(marker)"
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
          <!-- 网箱群图标 -->
          <svg v-if="marker.type === 'cage'" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <ellipse cx="12" cy="8" rx="7" ry="3" />
            <path d="M5 8v8c0 1.7 3.1 3 7 3s7-1.3 7-3V8" />
            <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
          </svg>
          <!-- 设备舱图标 -->
          <svg v-else-if="marker.type === 'cabin'" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="4" y="6" width="16" height="12" rx="2" />
            <path d="M8 10h8M8 14h5" />
          </svg>
          <!-- 监控中心图标 -->
          <svg v-else-if="marker.type === 'monitor'" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 3l7 4v6c0 4.5-3 7.5-7 8-4-.5-7-3.5-7-8V7l7-4z" />
            <circle cx="12" cy="11" r="2.5" />
          </svg>
          <!-- 饲料仓库图标 -->
          <svg v-else-if="marker.type === 'warehouse'" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M3 10l9-6 9 6v10H3V10z" />
            <path d="M9 20v-6h6v6" />
          </svg>
          <!-- 休闲平台图标 -->
          <svg v-else-if="marker.type === 'leisure'" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 3c5 0 9 3.5 9 8H3c0-4.5 4-8 9-8z" />
            <path d="M12 11v9M9 20h6" />
          </svg>
          <!-- 增氧机图标 -->
          <svg v-else-if="marker.type === 'aerator'" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 9a4.5 4.5 0 0 1 4.5-4.5M15 12a4.5 4.5 0 0 1 4.5 4.5M12 15a4.5 4.5 0 0 1-4.5 4.5M9 12a4.5 4.5 0 0 1-4.5-4.5" />
          </svg>
          <!-- 摄像头图标 -->
          <svg v-else-if="marker.type === 'camera'" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="7" width="13" height="10" rx="2" />
            <polygon points="16,10 21,7 21,17 16,14" />
          </svg>
          <!-- 环境平台图标 -->
          <svg v-else-if="marker.type === 'env'" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 3v14M7 10l5-4 5 4M5 19c2-1.5 4.5-1.5 7 0s5 1.5 7 0" />
          </svg>
          <!-- 投喂平台图标 -->
          <svg v-else class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v8M8 12h8" />
          </svg>
        </div>

        <!-- 右侧胶囊文字标签 -->
        <span
          class="px-2 py-0.5 rounded bg-[#051d3f]/85 border text-[11px] backdrop-blur-sm whitespace-nowrap transition-all shadow"
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
        class="absolute right-4 top-4 z-30 w-[265px] rounded bg-[#061d40]/95 border border-[#00e5ff]/60 p-3 shadow-2xl backdrop-blur-md"
      >
        <div class="flex items-center justify-between border-b border-[#00a8ff]/25 pb-2 mb-2">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping" />
            <span class="text-xs font-semibold text-white">{{ activeMarker.name }}</span>
            <span class="px-1.5 py-0.2 text-[10px] rounded bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40">
              {{ activeMarker.status }}
            </span>
          </div>
          <button
            class="text-[#7da8d6] hover:text-white text-xs bg-transparent border-0 cursor-pointer"
            @click="clearActiveMarker"
          >
            ✕
          </button>
        </div>

        <p class="text-[11px] text-[#9cc5eb] leading-relaxed mb-2.5">
          {{ activeMarker.detail }}
        </p>

        <div class="grid grid-cols-3 gap-1.5 bg-[#03122a]/80 p-2 rounded border border-[#00a8ff]/20">
          <div v-for="m in activeMarker.metrics" :key="m.label" class="text-center">
            <div class="text-[10px] text-[#6e96bf]">{{ m.label }}</div>
            <div class="num-highlight text-[12px] text-[#00e5ff] mt-0.5">{{ m.value }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { StageMarker } from '@/mock/dashboardData'

const props = defineProps<{
  farmName: string
  markers: StageMarker[]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const canvasWrapRef = ref<HTMLDivElement | null>(null)

const activeMarker = ref<StageMarker | null>(null)
const isAutoRotate = ref(true)
const showPulseEffect = ref(true)

// 每个点位实时投影后的屏幕像素坐标
const projectedMarkers = reactive<Record<string, { x: number; y: number; visible: boolean }>>({})

// 10个点位对应的 3D 世界坐标与最佳观测相机偏移
const MARKER_3D_CONFIG: Record<
  string,
  { anchor: THREE.Vector3; camOffset: THREE.Vector3; radius: number }
> = {
  'm-cage-north': {
    anchor: new THREE.Vector3(2, 4.5, -22),
    camOffset: new THREE.Vector3(18, 20, 8),
    radius: 15
  },
  'm-cage-south': {
    anchor: new THREE.Vector3(-24, 4.5, 4),
    camOffset: new THREE.Vector3(-4, 18, 28),
    radius: 15
  },
  'm-cabin': {
    anchor: new THREE.Vector3(0, 8.2, 6),
    camOffset: new THREE.Vector3(14, 15, 24),
    radius: 7
  },
  'm-monitor': {
    anchor: new THREE.Vector3(-11, 12.5, 13),
    camOffset: new THREE.Vector3(-24, 18, 30),
    radius: 6
  },
  'm-warehouse': {
    anchor: new THREE.Vector3(-3, 9.5, 16),
    camOffset: new THREE.Vector3(-14, 16, 34),
    radius: 6
  },
  'm-leisure': {
    anchor: new THREE.Vector3(9, 6.5, 17),
    camOffset: new THREE.Vector3(22, 14, 34),
    radius: 7
  },
  'm-aerator': {
    anchor: new THREE.Vector3(17, 3.8, 13),
    camOffset: new THREE.Vector3(30, 14, 28),
    radius: 6
  },
  'm-camera': {
    anchor: new THREE.Vector3(25, 10.5, 9),
    camOffset: new THREE.Vector3(40, 16, 24),
    radius: 5
  },
  'm-env': {
    anchor: new THREE.Vector3(34, 6.5, 1),
    camOffset: new THREE.Vector3(48, 15, 18),
    radius: 5
  },
  'm-feeder': {
    anchor: new THREE.Vector3(24, 7.5, -10),
    camOffset: new THREE.Vector3(42, 16, 8),
    radius: 7
  }
}

// 默认全局鸟瞰视角
const DEFAULT_CAM_POS = new THREE.Vector3(0, 42, 68)
const DEFAULT_TARGET = new THREE.Vector3(2, 0, -1)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let animationFrameId = 0
let resizeObserver: ResizeObserver | null = null

// 动画相关引用
let oceanGeometry: THREE.PlaneGeometry | null = null
let oceanBaseZ: Float32Array | null = null
let pulseRings: THREE.Mesh[] = []
let radarDishGroup: THREE.Group | null = null
let windBladesGroup: THREE.Group | null = null
let cameraScanCone: THREE.Mesh | null = null
let bubbleParticles: THREE.Points | null = null
let fishParticles: THREE.Points | null = null
let flowPulses: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; progress: number; speed: number }[] = []
let highlightGroup: THREE.Group | null = null
let highlightRingOuter: THREE.Mesh | null = null
let highlightBeam: THREE.Mesh | null = null

// 相机平滑飞行插值状态
let flyState: {
  active: boolean
  targetPos: THREE.Vector3
  targetLookAt: THREE.Vector3
} = {
  active: false,
  targetPos: DEFAULT_CAM_POS.clone(),
  targetLookAt: DEFAULT_TARGET.clone()
}

// 创建径向发光贴图（用于粒子与光环）
function createGlowTexture(colorHex = '#00e5ff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 30)
  gradient.addColorStop(0, '#ffffff')
  gradient.addColorStop(0.35, colorHex)
  gradient.addColorStop(1, 'rgba(0, 229, 255, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

// 构建深水抗风浪圆形养殖网箱单元
function createCageUnit(radius = 4.2, depth = 6.5): THREE.Group {
  const group = new THREE.Group()

  // 外圈双层高密度浮管
  const outerRingGeo = new THREE.TorusGeometry(radius, 0.24, 12, 48)
  outerRingGeo.rotateX(Math.PI / 2)
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x0b3c68,
    metalness: 0.5,
    roughness: 0.3,
    emissive: 0x004477,
    emissiveIntensity: 0.35
  })
  const outerRing = new THREE.Mesh(outerRingGeo, ringMat)
  outerRing.position.y = 0.25
  group.add(outerRing)

  const innerRingGeo = new THREE.TorusGeometry(radius * 0.86, 0.16, 10, 48)
  innerRingGeo.rotateX(Math.PI / 2)
  const innerRingMat = new THREE.MeshStandardMaterial({
    color: 0x00d8ff,
    emissive: 0x00a8ff,
    emissiveIntensity: 0.6,
    roughness: 0.2
  })
  const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat)
  innerRing.position.y = 0.32
  group.add(innerRing)

  // 网箱顶部护栏圈
  const railGeo = new THREE.TorusGeometry(radius * 0.93, 0.06, 8, 40)
  railGeo.rotateX(Math.PI / 2)
  const railMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  const rail = new THREE.Mesh(railGeo, railMat)
  rail.position.y = 0.95
  group.add(rail)

  // 水面投食器/监测浮球（网箱中心）
  const centerPodGeo = new THREE.CylinderGeometry(0.65, 0.85, 1.1, 16)
  const centerPodMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a5f,
    metalness: 0.6,
    roughness: 0.3,
    emissive: 0x00e5ff,
    emissiveIntensity: 0.25
  })
  const centerPod = new THREE.Mesh(centerPodGeo, centerPodMat)
  centerPod.position.y = 0.55
  group.add(centerPod)

  // 十字走道栈桥
  const walkwayGeo = new THREE.BoxGeometry(radius * 1.9, 0.12, 0.55)
  const walkwayMat = new THREE.MeshStandardMaterial({
    color: 0x164e78,
    metalness: 0.4,
    roughness: 0.6
  })
  const walkway = new THREE.Mesh(walkwayGeo, walkwayMat)
  walkway.position.y = 0.38
  group.add(walkway)

  // 水下养殖网衣（半透明深蓝科技网格质感）
  const netGeo = new THREE.CylinderGeometry(radius * 0.84, radius * 0.72, depth, 24, 4, true)
  const netMat = new THREE.MeshBasicMaterial({
    color: 0x00c6ff,
    wireframe: true,
    transparent: true,
    opacity: 0.22
  })
  const netMesh = new THREE.Mesh(netGeo, netMat)
  netMesh.position.y = -depth / 2 + 0.2
  group.add(netMesh)

  // 水下内胆柔和发光水体体积
  const waterColGeo = new THREE.CylinderGeometry(radius * 0.8, radius * 0.68, depth * 0.9, 24)
  const waterColMat = new THREE.MeshBasicMaterial({
    color: 0x0077be,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide
  })
  const waterCol = new THREE.Mesh(waterColGeo, waterColMat)
  waterCol.position.y = -depth / 2 + 0.2
  group.add(waterCol)

  return group
}

// 构建整座海上水产养殖工厂 3D 场景
function buildAquacultureFactory(sceneInstance: THREE.Scene) {
  // 1. 动态海面 + 科技网格层
  oceanGeometry = new THREE.PlaneGeometry(240, 240, 96, 96)
  oceanGeometry.rotateX(-Math.PI / 2)
  const posAttr = oceanGeometry.attributes.position
  oceanBaseZ = new Float32Array(posAttr.count)
  for (let i = 0; i < posAttr.count; i++) {
    oceanBaseZ[i] = posAttr.getY(i)
  }

  const oceanMat = new THREE.MeshStandardMaterial({
    color: 0x032245,
    emissive: 0x011024,
    roughness: 0.22,
    metalness: 0.75,
    flatShading: true
  })
  const oceanMesh = new THREE.Mesh(oceanGeometry, oceanMat)
  oceanMesh.receiveShadow = true
  sceneInstance.add(oceanMesh)

  // 海面数字孪生坐标网格
  const gridHelper = new THREE.GridHelper(220, 55, 0x00a8ff, 0x07335c)
  gridHelper.position.y = 0.08
  const gridMat = gridHelper.material as THREE.Material
  gridMat.transparent = true
  gridMat.opacity = 0.26
  sceneInstance.add(gridHelper)

  // 2. 底部周期扩散脉冲扫描环（3层交替扩散）
  pulseRings = []
  for (let i = 0; i < 3; i++) {
    const pGeo = new THREE.RingGeometry(1.5, 2.3, 64)
    pGeo.rotateX(-Math.PI / 2)
    const pMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    const pMesh = new THREE.Mesh(pGeo, pMat)
    pMesh.position.set(0, 0.16, 4)
    pMesh.userData = { phase: i / 3 }
    sceneInstance.add(pMesh)
    pulseRings.push(pMesh)
  }

  // 3. 北区深水抗风浪网箱群 (m-cage-north: 2x3 阵列)
  const northGroup = new THREE.Group()
  northGroup.position.set(2, 0, -22)
  const northCols = 3
  const northRows = 2
  const spacingX = 11.5
  const spacingZ = 11.0

  for (let r = 0; r < northRows; r++) {
    for (let c = 0; c < northCols; c++) {
      const cage = createCageUnit(4.3, 7)
      cage.position.set((c - 1) * spacingX, 0, (r - 0.5) * spacingZ)
      northGroup.add(cage)
    }
  }
  // 北区中央连接浮桥
  const northBridgeGeo = new THREE.BoxGeometry(spacingX * 2.4, 0.25, 1.4)
  const bridgeMat = new THREE.MeshStandardMaterial({
    color: 0x0e416c,
    emissive: 0x004477,
    emissiveIntensity: 0.4,
    roughness: 0.4
  })
  const northBridge = new THREE.Mesh(northBridgeGeo, bridgeMat)
  northBridge.position.set(0, 0.35, 0)
  northGroup.add(northBridge)
  sceneInstance.add(northGroup)

  // 4. 南区高密度智能网箱群 (m-cage-south: 2x3 阵列)
  const southGroup = new THREE.Group()
  southGroup.position.set(-24, 0, 4)
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const cage = createCageUnit(3.8, 6)
      cage.position.set((c - 1) * 9.8, 0, (r - 0.5) * 9.8)
      southGroup.add(cage)
    }
  }
  const southBridge = new THREE.Mesh(new THREE.BoxGeometry(22, 0.25, 1.3), bridgeMat)
  southBridge.position.set(0, 0.35, 0)
  southGroup.add(southBridge)
  sceneInstance.add(southGroup)

  // 5. 中央海上综合总控主平台（承载设备舱、监控中心、饲料仓库、休闲平台）
  const mainPlatformGroup = new THREE.Group()
  mainPlatformGroup.position.set(-1, 0, 12)

  // 主甲板多层钢构基座
  const deckGeo = new THREE.BoxGeometry(28, 1.4, 18)
  const deckMat = new THREE.MeshStandardMaterial({
    color: 0x0d2b4d,
    metalness: 0.65,
    roughness: 0.35
  })
  const deckMesh = new THREE.Mesh(deckGeo, deckMat)
  deckMesh.position.y = 3.2
  mainPlatformGroup.add(deckMesh)

  // 主平台四周科技霓虹灯带边框
  const deckEdgeGeo = new THREE.EdgesGeometry(deckGeo)
  const deckEdgeMat = new THREE.LineBasicMaterial({ color: 0x00e5ff })
  const deckEdge = new THREE.LineSegments(deckEdgeGeo, deckEdgeMat)
  deckEdge.position.y = 3.2
  mainPlatformGroup.add(deckEdge)

  // 6根跨海导管架立柱 + 水线发光防撞环
  const legOffsets = [
    [-11.5, -7],
    [0, -7],
    [11.5, -7],
    [-11.5, 7],
    [0, 7],
    [11.5, 7]
  ]
  const legGeo = new THREE.CylinderGeometry(0.95, 1.15, 12, 16)
  const legMat = new THREE.MeshStandardMaterial({ color: 0x16426b, metalness: 0.7, roughness: 0.3 })
  legOffsets.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, legMat)
    leg.position.set(lx, -2.5, lz)
    mainPlatformGroup.add(leg)

    // 水面发光环
    const collarGeo = new THREE.TorusGeometry(1.25, 0.14, 10, 24)
    collarGeo.rotateX(Math.PI / 2)
    const collarMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff })
    const collar = new THREE.Mesh(collarGeo, collarMat)
    collar.position.set(lx, 0.25, lz)
    mainPlatformGroup.add(collar)
  })

  // 5.1 设备舱与风光储微电网模块 (m-cabin)
  const cabinGroup = new THREE.Group()
  cabinGroup.position.set(1, 3.9, -5)
  const cabinBoxGeo = new THREE.BoxGeometry(8.5, 3.2, 5.2)
  const cabinBoxMat = new THREE.MeshStandardMaterial({
    color: 0x133b63,
    metalness: 0.6,
    roughness: 0.3,
    emissive: 0x052442
  })
  const cabinBox = new THREE.Mesh(cabinBoxGeo, cabinBoxMat)
  cabinBox.position.y = 1.6
  cabinGroup.add(cabinBox)

  // 设备舱发光能量格栅与光伏顶板
  const cabinWire = new THREE.LineSegments(
    new THREE.EdgesGeometry(cabinBoxGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8 })
  )
  cabinWire.position.y = 1.6
  cabinGroup.add(cabinWire)

  // 光伏阵列板
  for (let i = -1; i <= 1; i++) {
    const solarGeo = new THREE.BoxGeometry(2.3, 0.12, 3.8)
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x005588,
      emissiveIntensity: 0.5,
      metalness: 0.85,
      roughness: 0.15
    })
    const solarPanel = new THREE.Mesh(solarGeo, solarMat)
    solarPanel.position.set(i * 2.6, 3.55, 0)
    solarPanel.rotation.x = 0.22
    cabinGroup.add(solarPanel)
  }

  // 海上微电网风力发电机（带动态旋转叶片）
  const turbineTower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.42, 8.5, 12),
    new THREE.MeshStandardMaterial({ color: 0xd8f0ff, metalness: 0.5, roughness: 0.2 })
  )
  turbineTower.position.set(5.2, 4.2, -1.2)
  cabinGroup.add(turbineTower)

  windBladesGroup = new THREE.Group()
  windBladesGroup.position.set(5.2, 8.4, -0.9)
  const bladeGeo = new THREE.BoxGeometry(0.28, 3.6, 0.08)
  bladeGeo.translate(0, 1.6, 0)
  const bladeMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff })
  for (let b = 0; b < 3; b++) {
    const blade = new THREE.Mesh(bladeGeo, bladeMat)
    blade.rotation.z = (b * Math.PI * 2) / 3
    windBladesGroup.add(blade)
  }
  cabinGroup.add(windBladesGroup)
  mainPlatformGroup.add(cabinGroup)

  // 5.2 监控中心塔楼 (m-monitor)
  const monitorGroup = new THREE.Group()
  monitorGroup.position.set(-10, 3.9, 1)
  const towerBase = new THREE.Mesh(
    new THREE.BoxGeometry(5.8, 5.2, 5.8),
    new THREE.MeshStandardMaterial({ color: 0x103459, metalness: 0.65, roughness: 0.25 })
  )
  towerBase.position.y = 2.6
  monitorGroup.add(towerBase)

  // 顶部全景中控玻璃舱
  const controlRoom = new THREE.Mesh(
    new THREE.CylinderGeometry(3.4, 2.8, 2.4, 8),
    new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00a8ff,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85
    })
  )
  controlRoom.position.y = 6.4
  monitorGroup.add(controlRoom)

  const towerRoof = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 3.5, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0x0d2b4d, metalness: 0.7, roughness: 0.3 })
  )
  towerRoof.position.y = 7.95
  monitorGroup.add(towerRoof)

  // 旋转航海雷达天线
  radarDishGroup = new THREE.Group()
  radarDishGroup.position.set(0, 8.7, 0)
  const radarBar = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.28, 0.38),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff })
  )
  radarDishGroup.add(radarBar)
  monitorGroup.add(radarDishGroup)
  mainPlatformGroup.add(monitorGroup)

  // 5.3 智能恒温饲料仓库立筒仓群 (m-warehouse)
  const warehouseGroup = new THREE.Group()
  warehouseGroup.position.set(-2, 3.9, 4)
  for (let s = -1; s <= 1; s++) {
    const silo = new THREE.Group()
    silo.position.set(s * 2.5, 0, 0)
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.05, 4.6, 20),
      new THREE.MeshStandardMaterial({
        color: 0x1e4e79,
        metalness: 0.7,
        roughness: 0.25
      })
    )
    cyl.position.y = 2.3
    silo.add(cyl)

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(1.12, 1.2, 20),
      new THREE.MeshStandardMaterial({
        color: 0x00c6ff,
        emissive: 0x006699,
        emissiveIntensity: 0.45
      })
    )
    cone.position.y = 5.2
    silo.add(cone)

    // 料位发光指示条
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 3.4, 0.16),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff })
    )
    strip.position.set(0, 2.3, 1.02)
    silo.add(strip)
    warehouseGroup.add(silo)
  }
  mainPlatformGroup.add(warehouseGroup)

  // 5.4 海洋牧场生态休闲平台 (m-leisure)
  const leisureGroup = new THREE.Group()
  leisureGroup.position.set(9.5, 3.9, 4.2)
  const leisureDeck = new THREE.Mesh(
    new THREE.BoxGeometry(7.2, 0.4, 7.2),
    new THREE.MeshStandardMaterial({ color: 0x174978, roughness: 0.4 })
  )
  leisureDeck.position.y = 0.2
  leisureGroup.add(leisureDeck)

  // 景观张拉膜遮阳顶棚（双圆锥发光顶）
  for (let k = -1; k <= 1; k += 2) {
    const canopy = new THREE.Mesh(
      new THREE.ConeGeometry(2.2, 1.8, 16),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.88
      })
    )
    canopy.position.set(k * 1.6, 2.4, 0)
    leisureGroup.add(canopy)

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 2.2, 8),
      new THREE.MeshBasicMaterial({ color: 0xbae6fd })
    )
    pole.position.set(k * 1.6, 1.1, 0)
    leisureGroup.add(pole)
  }
  mainPlatformGroup.add(leisureGroup)
  sceneInstance.add(mainPlatformGroup)

  // 6. 增氧机纳米微孔阵列 (m-aerator)
  const aeratorGroup = new THREE.Group()
  aeratorGroup.position.set(17, 0.3, 13)
  const aeratorOffsets = [
    [-2.8, -2.2],
    [2.8, -2.2],
    [-2.8, 2.2],
    [2.8, 2.2]
  ]
  aeratorOffsets.forEach(([ax, az]) => {
    const unit = new THREE.Group()
    unit.position.set(ax, 0, az)
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.3, 0.15, 10, 24),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff })
    )
    ring.rotation.x = Math.PI / 2
    unit.add(ring)

    const motor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.9, 12),
      new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x15803d,
        emissiveIntensity: 0.6
      })
    )
    motor.position.y = 0.45
    unit.add(motor)
    aeratorGroup.add(unit)
  })
  sceneInstance.add(aeratorGroup)

  // 7. 全域光电雷达球机塔 (m-camera)
  const cameraTowerGroup = new THREE.Group()
  cameraTowerGroup.position.set(25, 0, 9)
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.9, 9.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x1e4976, wireframe: false, metalness: 0.7 })
  )
  mast.position.y = 4.5
  cameraTowerGroup.add(mast)

  const domePod = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff })
  )
  domePod.position.y = 9.5
  cameraTowerGroup.add(domePod)

  // 摄像头旋转扫描视场光锥
  const coneGeo = new THREE.ConeGeometry(4.8, 11, 24, 1, true)
  coneGeo.translate(0, -5.5, 0)
  coneGeo.rotateZ(0.48)
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  cameraScanCone = new THREE.Mesh(coneGeo, coneMat)
  cameraScanCone.position.y = 9.5
  cameraTowerGroup.add(cameraScanCone)
  sceneInstance.add(cameraTowerGroup)

  // 8. 多参数海洋环境监测浮标站 (m-env)
  const envBuoyGroup = new THREE.Group()
  envBuoyGroup.position.set(34, 0, 1)
  const buoyFloat = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 1.6, 1.2, 16),
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xb45309,
      emissiveIntensity: 0.35,
      roughness: 0.3
    })
  )
  buoyFloat.position.y = 0.6
  envBuoyGroup.add(buoyFloat)

  const buoyMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.45, 5.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
  )
  buoyMast.position.y = 3.2
  envBuoyGroup.add(buoyMast)

  const sensorBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x4ade80 })
  )
  sensorBeacon.position.y = 5.9
  envBuoyGroup.add(sensorBeacon)

  // 水下探测激光柱
  const subLaser = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.9, 7, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  subLaser.position.y = -3.5
  envBuoyGroup.add(subLaser)
  sceneInstance.add(envBuoyGroup)

  // 9. 远程精准气力投喂平台 (m-feeder)
  const feederGroup = new THREE.Group()
  feederGroup.position.set(24, 0, -10)
  const feederDeck = new THREE.Mesh(
    new THREE.BoxGeometry(8, 1.0, 8),
    new THREE.MeshStandardMaterial({ color: 0x10375c, metalness: 0.6, roughness: 0.3 })
  )
  feederDeck.position.y = 2.6
  feederGroup.add(feederDeck)

  const feederHopper = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 0.9, 3.8, 16),
    new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x006699,
      emissiveIntensity: 0.4
    })
  )
  feederHopper.position.y = 4.8
  feederGroup.add(feederHopper)

  const feederCap = new THREE.Mesh(
    new THREE.ConeGeometry(2.0, 1.2, 16),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff })
  )
  feederCap.position.y = 7.2
  feederGroup.add(feederCap)
  sceneInstance.add(feederGroup)

  // 10. 气力投喂与微电网海底/水面流光管道（带动态能量脉冲球）
  flowPulses = []
  const pipeRoutes = [
    // 饲料仓 -> 投喂平台 -> 北区网箱群
    [
      new THREE.Vector3(-3, 4.5, 16),
      new THREE.Vector3(10, 3.2, 4),
      new THREE.Vector3(24, 3.5, -10),
      new THREE.Vector3(14, 1.2, -18),
      new THREE.Vector3(2, 0.8, -22)
    ],
    // 饲料仓/设备舱 -> 南区网箱群
    [
      new THREE.Vector3(-3, 4.5, 16),
      new THREE.Vector3(-12, 2.5, 10),
      new THREE.Vector3(-24, 0.8, 4)
    ],
    // 设备舱 -> 增氧机阵列 -> 环境浮标
    [
      new THREE.Vector3(0, 4.2, 7),
      new THREE.Vector3(17, 0.8, 13),
      new THREE.Vector3(34, 0.8, 1)
    ]
  ]

  const pulseSphereGeo = new THREE.SphereGeometry(0.42, 12, 12)
  const pulseSphereMat = new THREE.MeshBasicMaterial({ color: 0x7df9ff })

  pipeRoutes.forEach((pts) => {
    const curve = new THREE.CatmullRomCurve3(pts)
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.16, 8, false)
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x00a8ff,
      transparent: true,
      opacity: 0.42
    })
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat)
    sceneInstance.add(tubeMesh)

    // 每条管道生成3个流动光球
    for (let k = 0; k < 3; k++) {
      const pulseMesh = new THREE.Mesh(pulseSphereGeo, pulseSphereMat)
      sceneInstance.add(pulseMesh)
      flowPulses.push({
        mesh: pulseMesh,
        curve,
        progress: k / 3,
        speed: 0.18 + Math.random() * 0.06
      })
    }
  })

  // 11. 增氧机与网箱上浮气泡粒子系统
  const bubbleCount = 220
  const bubblePositions = new Float32Array(bubbleCount * 3)
  for (let i = 0; i < bubbleCount; i++) {
    if (i < 90) {
      // 聚集在增氧机区域 (17, y, 13)
      bubblePositions[i * 3] = 17 + (Math.random() - 0.5) * 9
      bubblePositions[i * 3 + 1] = -6 + Math.random() * 6.5
      bubblePositions[i * 3 + 2] = 13 + (Math.random() - 0.5) * 9
    } else if (i < 160) {
      // 北区网箱群气泡与鱼群光点
      bubblePositions[i * 3] = 2 + (Math.random() - 0.5) * 28
      bubblePositions[i * 3 + 1] = -6 + Math.random() * 6.2
      bubblePositions[i * 3 + 2] = -22 + (Math.random() - 0.5) * 16
    } else {
      // 南区网箱群气泡与鱼群光点
      bubblePositions[i * 3] = -24 + (Math.random() - 0.5) * 24
      bubblePositions[i * 3 + 1] = -5.5 + Math.random() * 5.8
      bubblePositions[i * 3 + 2] = 4 + (Math.random() - 0.5) * 14
    }
  }
  const bubbleGeo = new THREE.BufferGeometry()
  bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePositions, 3))
  const bubbleMat = new THREE.PointsMaterial({
    size: 0.75,
    map: createGlowTexture('#00e5ff'),
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  bubbleParticles = new THREE.Points(bubbleGeo, bubbleMat)
  sceneInstance.add(bubbleParticles)

  // 12. 水下金色鱼群游动粒子系统
  const fishCount = 160
  const fishPositions = new Float32Array(fishCount * 3)
  for (let i = 0; i < fishCount; i++) {
    const isNorth = i % 2 === 0
    const cx = isNorth ? 2 : -24
    const cz = isNorth ? -22 : 4
    fishPositions[i * 3] = cx + (Math.random() - 0.5) * 22
    fishPositions[i * 3 + 1] = -4.5 + Math.random() * 3.8
    fishPositions[i * 3 + 2] = cz + (Math.random() - 0.5) * 12
  }
  const fishGeo = new THREE.BufferGeometry()
  fishGeo.setAttribute('position', new THREE.BufferAttribute(fishPositions, 3))
  const fishMat = new THREE.PointsMaterial({
    size: 0.65,
    map: createGlowTexture('#38bdf8'),
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  fishParticles = new THREE.Points(fishGeo, fishMat)
  sceneInstance.add(fishParticles)

  // 13. 选中点位时的 3D 锁定高亮光环与光柱
  highlightGroup = new THREE.Group()
  highlightGroup.visible = false

  const hRingGeo = new THREE.RingGeometry(4.2, 5.0, 48)
  hRingGeo.rotateX(-Math.PI / 2)
  highlightRingOuter = new THREE.Mesh(
    hRingGeo,
    new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  highlightRingOuter.position.y = 0.35
  highlightGroup.add(highlightRingOuter)

  const hBeamGeo = new THREE.CylinderGeometry(2.6, 2.6, 14, 32, 1, true)
  hBeamGeo.translate(0, 7, 0)
  highlightBeam = new THREE.Mesh(
    hBeamGeo,
    new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  highlightGroup.add(highlightBeam)
  sceneInstance.add(highlightGroup)
}

// 更新所有 3D 点位在 2D 容器上的投影坐标
function updateMarkerProjections() {
  if (!camera || !containerRef.value) return
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  if (width === 0 || height === 0) return

  const tempVec = new THREE.Vector3()
  for (const marker of props.markers) {
    const cfg = MARKER_3D_CONFIG[marker.id]
    if (!cfg) continue

    tempVec.copy(cfg.anchor)
    tempVec.project(camera)

    const isBehind = tempVec.z > 1
    const screenX = (tempVec.x * 0.5 + 0.5) * width
    const screenY = (-tempVec.y * 0.5 + 0.5) * height
    const inBounds =
      !isBehind && screenX >= -40 && screenX <= width + 40 && screenY >= -40 && screenY <= height + 40

    projectedMarkers[marker.id] = {
      x: Math.round(screenX),
      y: Math.round(screenY),
      visible: inBounds
    }
  }
}

// 初始化 Three.js 场景
function initThreeScene() {
  const wrap = canvasWrapRef.value
  const container = containerRef.value
  if (!wrap || !container) return

  const width = container.clientWidth || 800
  const height = container.clientHeight || 500

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020f22)
  scene.fog = new THREE.FogExp2(0x020f22, 0.0068)

  camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 400)
  camera.position.copy(DEFAULT_CAM_POS)

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  wrap.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.copy(DEFAULT_TARGET)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.maxPolarAngle = Math.PI / 2 - 0.06 // 限制不穿入海面以下
  controls.minDistance = 14
  controls.maxDistance = 135
  controls.autoRotate = isAutoRotate.value
  controls.autoRotateSpeed = 0.45

  // 用户手动拖拽画面时中断相机飞行插值
  controls.addEventListener('start', () => {
    flyState.active = false
  })

  // 灯光系统
  const ambientLight = new THREE.AmbientLight(0x4b8bbe, 1.35)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xbfe8ff, 1.8)
  dirLight.position.set(45, 75, 40)
  scene.add(dirLight)

  const cyanPointLight = new THREE.PointLight(0x00e5ff, 3.2, 85)
  cyanPointLight.position.set(0, 18, 6)
  scene.add(cyanPointLight)

  const northPointLight = new THREE.PointLight(0x00a8ff, 2.2, 65)
  northPointLight.position.set(2, 12, -22)
  scene.add(northPointLight)

  // 构建 3D 水产工厂与特效
  buildAquacultureFactory(scene)

  // 启动动画循环
  const clock = new THREE.Clock()
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    const elapsed = clock.getElapsedTime()
    const delta = clock.getDelta() || 0.016

    // 1. 海面波浪顶点律动
    if (oceanGeometry && oceanBaseZ) {
      const pos = oceanGeometry.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i)
        const vz = pos.getZ(i)
        const wave =
          Math.sin(vx * 0.11 + elapsed * 1.6) * 0.28 +
          Math.cos(vz * 0.09 + elapsed * 1.3) * 0.24
        pos.setY(i, wave)
      }
      pos.needsUpdate = true
    }

    // 2. 底部周期脉冲光环扩散特效
    pulseRings.forEach((ring) => {
      ring.visible = showPulseEffect.value
      if (!showPulseEffect.value) return
      const phase = (elapsed * 0.22 + ring.userData.phase) % 1
      const scale = 1 + phase * 32
      ring.scale.set(scale, scale, 1)
      const mat = ring.material as THREE.MeshBasicMaterial
      mat.opacity = (1 - phase) * 0.42
    })

    // 3. 雷达、风机与摄像头扫描锥动画
    if (radarDishGroup) {
      radarDishGroup.rotation.y = elapsed * 1.8
    }
    if (windBladesGroup) {
      windBladesGroup.rotation.z = -elapsed * 2.2
    }
    if (cameraScanCone) {
      cameraScanCone.rotation.y = Math.sin(elapsed * 0.8) * 1.2
    }

    // 4. 输送管网流光脉冲移动
    flowPulses.forEach((item) => {
      item.progress = (item.progress + item.speed * 0.008) % 1
      const pt = item.curve.getPointAt(item.progress)
      item.mesh.position.copy(pt)
    })

    // 5. 增氧机与网箱气泡上浮循环
    if (bubbleParticles) {
      const bPos = bubbleParticles.geometry.attributes.position
      for (let i = 0; i < bPos.count; i++) {
        let py = bPos.getY(i) + 0.045
        if (py > 0.3) py = -6.0
        bPos.setY(i, py)
      }
      bPos.needsUpdate = true
    }

    // 6. 水下鱼群环游轻微摆动
    if (fishParticles) {
      fishParticles.rotation.y = Math.sin(elapsed * 0.35) * 0.08
    }

    // 7. 选中点位高亮光环呼吸动画
    if (highlightGroup && highlightGroup.visible && highlightRingOuter) {
      const pulseScale = 1 + Math.sin(elapsed * 4) * 0.08
      highlightRingOuter.scale.set(pulseScale, pulseScale, 1)
      highlightRingOuter.rotation.z = elapsed * 0.8
    }

    // 8. 相机平滑聚焦飞行插值 (Fly-to)
    if (flyState.active && camera && controls) {
      camera.position.lerp(flyState.targetPos, Math.min(1, delta * 4.5 + 0.06))
      controls.target.lerp(flyState.targetLookAt, Math.min(1, delta * 4.5 + 0.06))
      if (
        camera.position.distanceTo(flyState.targetPos) < 0.35 &&
        controls.target.distanceTo(flyState.targetLookAt) < 0.25
      ) {
        flyState.active = false
      }
    }

    if (controls) {
      controls.autoRotate = isAutoRotate.value && !flyState.active
      controls.update()
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
      updateMarkerProjections()
    }
  }

  animate()

  // 容器尺寸自适应
  resizeObserver = new ResizeObserver(() => {
    if (!containerRef.value || !renderer || !camera) return
    const w = containerRef.value.clientWidth
    const h = containerRef.value.clientHeight
    if (w > 0 && h > 0) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      updateMarkerProjections()
    }
  })
  resizeObserver.observe(container)
}

// 点击点位：高亮 3D 区域 + 镜头平滑聚焦 + 打开实时浮窗
const selectMarker = (marker: StageMarker) => {
  if (activeMarker.value?.id === marker.id) {
    clearActiveMarker()
    return
  }

  activeMarker.value = marker
  const cfg = MARKER_3D_CONFIG[marker.id]
  if (cfg) {
    flyState.targetLookAt.copy(cfg.anchor)
    flyState.targetPos.copy(cfg.camOffset)
    flyState.active = true

    if (highlightGroup && highlightRingOuter && highlightBeam) {
      highlightGroup.position.set(cfg.anchor.x, 0, cfg.anchor.z)
      const rScale = cfg.radius / 5
      highlightBeam.scale.set(rScale, 1, rScale)
      highlightGroup.visible = true
    }
  }
}

const clearActiveMarker = () => {
  activeMarker.value = null
  if (highlightGroup) {
    highlightGroup.visible = false
  }
}

const resetCameraView = () => {
  clearActiveMarker()
  flyState.targetPos.copy(DEFAULT_CAM_POS)
  flyState.targetLookAt.copy(DEFAULT_TARGET)
  flyState.active = true
}

const toggleAutoRotate = () => {
  isAutoRotate.value = !isAutoRotate.value
}

const togglePulseEffect = () => {
  showPulseEffect.value = !showPulseEffect.value
}

// 切换养殖场时同步更新选中点位数据
watch(
  () => props.markers,
  (newMarkers) => {
    if (activeMarker.value) {
      const matched = newMarkers.find((m) => m.id === activeMarker.value?.id)
      activeMarker.value = matched ?? null
    }
  }
)

onMounted(() => {
  initThreeScene()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  resizeObserver?.disconnect()
  controls?.dispose()
  if (scene) {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose())
        } else {
          mesh.material.dispose()
        }
      }
    })
  }
  renderer?.dispose()
})
</script>
