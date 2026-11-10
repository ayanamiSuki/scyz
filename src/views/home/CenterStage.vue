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
        <span>3D 实景孪生引擎</span>
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
        <span>循环水光效</span>
      </button>
    </div>

    <!-- 画面中下方：当前养殖基地名称铭牌 -->
    <div
      class="absolute left-1/2 bottom-3.5 -translate-x-1/2 z-10 px-4 py-1 rounded bg-[#051b3b]/80 border border-[#00c6ff]/40 backdrop-blur-sm text-[13px] font-semibold text-[#d8f0ff] tracking-wider pointer-events-none"
      style="box-shadow: 0 2px 12px rgba(0, 0, 0, 0.55);"
    >
      {{ farmName }} · 陆基循环水 3D 孪生基地
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
          <!-- 养殖车间/虾池图标 -->
          <svg v-if="marker.type === 'cage'" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 10h18M9 5v14M15 5v14" />
          </svg>
          <!-- 循环水处理图标 -->
          <svg v-else-if="marker.type === 'cabin'" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="4" y="6" width="16" height="12" rx="2" />
            <path d="M8 10h8M8 14h5" />
          </svg>
          <!-- 综合管理中控楼图标 -->
          <svg v-else-if="marker.type === 'monitor'" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 3l7 4v6c0 4.5-3 7.5-7 8-4-.5-7-3.5-7-8V7l7-4z" />
            <circle cx="12" cy="11" r="2.5" />
          </svg>
          <!-- 拌料投喂站图标 -->
          <svg v-else-if="marker.type === 'warehouse'" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M3 10l9-6 9 6v10H3V10z" />
            <path d="M9 20v-6h6v6" />
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
          <!-- 水质监测站图标 -->
          <svg v-else class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 3v14M7 10l5-4 5 4M5 19c2-1.5 4.5-1.5 7 0s5 1.5 7 0" />
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
        class="absolute right-4 top-4 z-30 w-[272px] rounded bg-[#061d40]/95 border border-[#00e5ff]/60 p-3 shadow-2xl backdrop-blur-md"
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
const isAutoRotate = ref(false)
const showPulseEffect = ref(true)

// 每个点位实时投影后的屏幕像素坐标
const projectedMarkers = reactive<Record<string, { x: number; y: number; visible: boolean }>>({})

// 8个陆基基地点位对应的 3D 世界坐标与最佳聚焦相机位置（严格对齐实景布局）
const MARKER_3D_CONFIG: Record<
  string,
  { anchor: THREE.Vector3; camOffset: THREE.Vector3; radius: number }
> = {
  'm-greenhouse-main': {
    anchor: new THREE.Vector3(-2, 7.2, -14),
    camOffset: new THREE.Vector3(0, 32, 26),
    radius: 16
  },
  'm-front-tanks': {
    anchor: new THREE.Vector3(-14, 3.2, 21),
    camOffset: new THREE.Vector3(-16, 22, 48),
    radius: 11
  },
  'm-office-building': {
    anchor: new THREE.Vector3(17, 7.8, 12),
    camOffset: new THREE.Vector3(32, 22, 42),
    radius: 9
  },
  'm-ras-room': {
    anchor: new THREE.Vector3(-12, 3.8, 8.5),
    camOffset: new THREE.Vector3(-14, 20, 34),
    radius: 8
  },
  'm-feeder-station': {
    anchor: new THREE.Vector3(12, 5.8, -4),
    camOffset: new THREE.Vector3(30, 22, 22),
    radius: 7
  },
  'm-aerator-station': {
    anchor: new THREE.Vector3(-26, 5.2, -8),
    camOffset: new THREE.Vector3(-44, 22, 16),
    radius: 7
  },
  'm-env-station': {
    anchor: new THREE.Vector3(1, 4.5, 4.5),
    camOffset: new THREE.Vector3(10, 18, 28),
    radius: 6
  },
  'm-camera-east': {
    anchor: new THREE.Vector3(31, 6.5, 16),
    camOffset: new THREE.Vector3(48, 20, 36),
    radius: 5
  }
}

// 默认全局鸟瞰视角（复刻无人机航拍图正前偏高俯视角度）
const DEFAULT_CAM_POS = new THREE.Vector3(0, 44, 68)
const DEFAULT_TARGET = new THREE.Vector3(0, 1, 2)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let animationFrameId = 0
let resizeObserver: ResizeObserver | null = null

// 动画相关引用
let pulseRings: THREE.Mesh[] = []
let bubbleParticles: THREE.Points | null = null
let blowerFans: THREE.Object3D[] = []
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

// 创建径向发光贴图（用于曝气气泡与流光粒子）
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

// 创建波浪纹理贴图（用于大棚波纹顶板真实质感）
function createCorrugatedRoofTexture(baseColor: string, stripeColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, 128, 128)
  ctx.fillStyle = stripeColor
  for (let y = 0; y < 128; y += 8) {
    ctx.fillRect(0, y, 128, 3)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 6)
  return tex
}

/**
 * 构建方形钢筋混凝土对虾养殖池矩阵（用于前区露天池群与大棚内部池群）
 * 还原实景图：灰白色厚混凝土池壁、十字走道、池底中心排污圆孔、池内水体
 */
function createConcreteTankMatrix(options: {
  rows: number
  cols: number
  cellW: number
  cellD: number
  wallH: number
  wallT: number
  hasWater: boolean
  waterOpacity?: number
}): THREE.Group {
  const { rows, cols, cellW, cellD, wallH, wallT, hasWater, waterOpacity = 0.45 } = options
  const group = new THREE.Group()
  const totalW = cols * cellW
  const totalD = rows * cellD

  // 混凝土池底板
  const floorGeo = new THREE.BoxGeometry(totalW + wallT, 0.25, totalD + wallT)
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0xb8c4cf,
    roughness: 0.78,
    metalness: 0.12
  })
  const floorWallMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.68,
    metalness: 0.15
  })
  const floorMesh = new THREE.Mesh(floorGeo, concreteMat)
  floorMesh.position.y = 0.125
  group.add(floorMesh)

  // 横向池壁 (rows + 1 条)
  const hWallGeo = new THREE.BoxGeometry(totalW + wallT, wallH, wallT)
  for (let r = 0; r <= rows; r++) {
    const wall = new THREE.Mesh(hWallGeo, floorWallMat)
    wall.position.set(0, wallH / 2 + 0.2, -totalD / 2 + r * cellD)
    group.add(wall)
  }

  // 纵向池壁 (cols + 1 条)
  const vWallGeo = new THREE.BoxGeometry(wallT, wallH, totalD + wallT)
  for (let c = 0; c <= cols; c++) {
    const wall = new THREE.Mesh(vWallGeo, floorWallMat)
    wall.position.set(-totalW / 2 + c * cellW, wallH / 2 + 0.2, 0)
    group.add(wall)
  }

  // 每个方池内部细节：中心底排污口、斜角加固、水体
  const drainGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12)
  const drainMat = new THREE.MeshBasicMaterial({ color: 0x1e293b })
  const waterGeo = new THREE.PlaneGeometry(cellW - wallT * 1.1, cellD - wallT * 1.1)
  waterGeo.rotateX(-Math.PI / 2)
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0369a1,
    emissive: 0x023e68,
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.5,
    transparent: true,
    opacity: waterOpacity
  })

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = -totalW / 2 + (c + 0.5) * cellW
      const cz = -totalD / 2 + (r + 0.5) * cellD

      // 池底中央排污口（还原航拍图中每个水泥方池正中的黑点）
      const drain = new THREE.Mesh(drainGeo, drainMat)
      drain.position.set(cx, 0.27, cz)
      group.add(drain)

      if (hasWater) {
        const water = new THREE.Mesh(waterGeo, waterMat)
        water.position.set(cx, wallH * 0.68, cz)
        group.add(water)
      }
    }
  }

  return group
}

/**
 * 构建整座“重安对虾养殖示范基地”实景 3D 孪生场景
 * 1:1 还原航拍图：
 * - 后方/中部：大跨度波浪拱形钢结构保温养殖大棚（深灰主体+右侧银白顶棚+前排钢桁架透视区）
 * - 中间过渡区：深水沉淀与循环水管道沟槽
 * - 左前方：3×9 露天钢筋混凝土方形虾池矩阵（浅灰水泥池壁+池心排污口）
 * - 右前方：两层混凝土综合管理中控楼（一层门廊立柱+二层走廊与方窗）+ 前方硬化广场与围栏
 * - 周边地貌：右侧沿溪流砂石路、后方生态水塘与山林、远景6根高架桥墩
 */
function buildChonganShrimpBase(sceneInstance: THREE.Scene) {
  // 1. 山谷大地基底与数字孪生科技网格
  const groundGeo = new THREE.PlaneGeometry(260, 260)
  groundGeo.rotateX(-Math.PI / 2)
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x081a2c,
    roughness: 0.88,
    metalness: 0.15
  })
  const groundMesh = new THREE.Mesh(groundGeo, groundMat)
  groundMesh.position.y = -0.2
  sceneInstance.add(groundMesh)

  const gridHelper = new THREE.GridHelper(220, 55, 0x00a8ff, 0x072b4d)
  gridHelper.position.y = -0.12
  const gridMat = gridHelper.material as THREE.Material
  gridMat.transparent = true
  gridMat.opacity = 0.25
  sceneInstance.add(gridHelper)

  // 2. 基地硬化混凝土总台基
  const compoundPadGeo = new THREE.BoxGeometry(66, 0.5, 64)
  const compoundPadMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.75,
    metalness: 0.15
  })
  const compoundPad = new THREE.Mesh(compoundPadGeo, compoundPadMat)
  compoundPad.position.set(0, 0.05, 0)
  sceneInstance.add(compoundPad)

  // 台基外框科技流光线
  const padEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(compoundPadGeo),
    new THREE.LineBasicMaterial({ color: 0x00c6ff, transparent: true, opacity: 0.5 })
  )
  padEdge.position.copy(compoundPad.position)
  sceneInstance.add(padEdge)

  // 3. 后方主体：大跨度钢结构保温养殖大棚 (z: -30 ~ +6, x: -30 ~ +30)
  const greenhouseGroup = new THREE.Group()
  greenhouseGroup.position.set(0, 0.3, -12)

  // 3.1 大棚内部对虾养殖方池矩阵 (6排 × 12列 室内循环水虾池)
  const indoorPools = createConcreteTankMatrix({
    rows: 6,
    cols: 12,
    cellW: 4.8,
    cellD: 5.4,
    wallH: 1.65,
    wallT: 0.22,
    hasWater: true,
    waterOpacity: 0.58
  })
  indoorPools.position.set(0, 0, 0)
  greenhouseGroup.add(indoorPools)

  // 3.2 钢结构立柱与轻钢桁架屋面系统
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.65,
    roughness: 0.3
  })
  const darkRoofTex = createCorrugatedRoofTexture('#263240', '#18222d')
  const silverRoofTex = createCorrugatedRoofTexture('#cbd5e1', '#94a3b8')

  const darkRoofMat = new THREE.MeshStandardMaterial({
    map: darkRoofTex,
    color: 0x334155,
    roughness: 0.45,
    metalness: 0.55,
    side: THREE.DoubleSide
  })
  const silverRoofMat = new THREE.MeshStandardMaterial({
    map: silverRoofTex,
    color: 0xe2e8f0,
    roughness: 0.35,
    metalness: 0.7,
    side: THREE.DoubleSide
  })

  const bayCols = 9 // 9跨连栋波浪拱顶
  const bayRows = 7 // 7排进深（前排第6排裸露钢桁架，还原实景图前缘透视结构）
  const bayW = 6.4
  const bayD = 4.8
  const ghWidth = bayCols * bayW // 57.6
  const ghDepth = bayRows * bayD // 33.6
  const eaveH = 3.8

  // 钢结构立柱与纵向主梁
  const pillarGeo = new THREE.BoxGeometry(0.22, eaveH, 0.22)
  const longBeamGeo = new THREE.BoxGeometry(0.16, 0.24, ghDepth)
  for (let c = 0; c <= bayCols; c++) {
    const px = -ghWidth / 2 + c * bayW
    const beam = new THREE.Mesh(longBeamGeo, steelMat)
    beam.position.set(px, eaveH, 0)
    greenhouseGroup.add(beam)

    for (let r = 0; r <= bayRows; r++) {
      const pz = -ghDepth / 2 + r * bayD
      const pillar = new THREE.Mesh(pillarGeo, steelMat)
      pillar.position.set(px, eaveH / 2, pz)
      greenhouseGroup.add(pillar)
    }
  }

  // 横向钢桁架与檩条（特别是前排裸露钢架区 r = bayRows - 1）
  const crossBeamGeo = new THREE.BoxGeometry(ghWidth, 0.22, 0.18)
  for (let r = 0; r <= bayRows; r++) {
    const pz = -ghDepth / 2 + r * bayD
    const crossBeam = new THREE.Mesh(crossBeamGeo, steelMat)
    crossBeam.position.set(0, eaveH, pz)
    greenhouseGroup.add(crossBeam)
  }

  // 连排波浪拱形屋顶单元（前排留出裸露钢桁架与局部斜搭板，右侧第8跨使用银白板，1:1还原实景照片）
  for (let r = 0; r < bayRows; r++) {
    const cz = -ghDepth / 2 + (r + 0.5) * bayD
    for (let c = 0; c < bayCols; c++) {
      const cx = -ghWidth / 2 + (c + 0.5) * bayW

      // 每一跨内部加上细钢屋架檩条（让前排未封顶区呈现照片里的白色密集网格钢架）
      for (let s = -1; s <= 1; s++) {
        const purlin = new THREE.Mesh(
          new THREE.BoxGeometry(bayW * 0.96, 0.1, 0.1),
          steelMat
        )
        purlin.position.set(cx, eaveH + 0.35 - Math.abs(s) * 0.15, cz + s * (bayD * 0.3))
        greenhouseGroup.add(purlin)
      }
      for (let k = -2; k <= 2; k++) {
        const rafter = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.1, bayD * 0.96),
          steelMat
        )
        rafter.position.set(cx + k * (bayW * 0.2), eaveH + 0.38 - Math.abs(k) * 0.08, cz)
        greenhouseGroup.add(rafter)
      }

      // 判断是否铺设保温顶板：
      // 前排 (r === bayRows - 1) 大部分裸露钢架，仅第2跨和最右侧银白跨铺设，完美复刻航拍图前缘！
      const isFrontExposed = r === bayRows - 1 && c !== 2 && c !== bayCols - 1
      // 右上角最后一跨的前两排也有部分裸露钢架
      const isBackRightExposed = c === bayCols - 1 && r < 2

      if (!isFrontExposed && !isBackRightExposed) {
        // 创建微拱波浪形屋面板
        const archGeo = new THREE.CylinderGeometry(
          bayW * 0.56,
          bayW * 0.56,
          bayD * 0.98,
          16,
          1,
          true,
          -Math.PI * 0.32,
          Math.PI * 0.64
        )
        archGeo.rotateX(Math.PI / 2)
        // 右侧边跨 (c >= bayCols - 2) 局部采用银白反光板，其余采用深灰保温板
        const useSilver = c === bayCols - 1 || (c === bayCols - 2 && r >= 2 && r <= 4)
        const archMesh = new THREE.Mesh(archGeo, useSilver ? silverRoofMat : darkRoofMat)
        archMesh.position.set(cx, eaveH - bayW * 0.24, cz)
        archMesh.scale.set(1, 0.52, 1)
        greenhouseGroup.add(archMesh)

        // 拱顶科技描边线，增强数字孪生层次感
        if (r % 2 === 0 && c % 2 === 0) {
          const wire = new THREE.LineSegments(
            new THREE.EdgesGeometry(archGeo),
            new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.22 })
          )
          wire.position.copy(archMesh.position)
          wire.scale.copy(archMesh.scale)
          greenhouseGroup.add(wire)
        }
      }
    }
  }

  // 大棚四周浅灰砖混围墙（前侧留出观察开口）
  const sideWallGeo = new THREE.BoxGeometry(0.35, eaveH * 0.85, ghDepth)
  const leftWall = new THREE.Mesh(sideWallGeo, steelMat)
  leftWall.position.set(-ghWidth / 2 - 0.2, eaveH * 0.42, 0)
  greenhouseGroup.add(leftWall)

  sceneInstance.add(greenhouseGroup)

  // 4. 中间过渡区：深水沉淀池与循环水处理管廊 (z: +6 ~ +11, x: -30 ~ +3)
  const trenchGroup = new THREE.Group()
  trenchGroup.position.set(-13.5, 0.3, 8.5)
  const trenchPools = createConcreteTankMatrix({
    rows: 1,
    cols: 5,
    cellW: 6.4,
    cellD: 4.2,
    wallH: 2.2,
    wallT: 0.32,
    hasWater: true,
    waterOpacity: 0.78
  })
  trenchGroup.add(trenchPools)

  // 管廊上方银色输水主管与斜撑桁架
  const mainPipeGeo = new THREE.CylinderGeometry(0.22, 0.22, 32, 12)
  mainPipeGeo.rotateZ(Math.PI / 2)
  const pipeMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35,
    metalness: 0.8,
    roughness: 0.2
  })
  const mainPipe = new THREE.Mesh(mainPipeGeo, pipeMat)
  mainPipe.position.set(0, 2.35, -1.8)
  trenchGroup.add(mainPipe)
  sceneInstance.add(trenchGroup)

  // 5. 左前方：3排×9列露天钢筋混凝土方形虾池矩阵 (z: +11.5 ~ +29.5, x: -30 ~ +3)
  const frontTanksGroup = new THREE.Group()
  frontTanksGroup.position.set(-13, 0.3, 20.5)

  const mainFrontMatrix = createConcreteTankMatrix({
    rows: 3,
    cols: 9,
    cellW: 3.4,
    cellD: 5.6,
    wallH: 1.85,
    wallT: 0.26,
    hasWater: false // 还原航拍图左前方水泥方池浅灰白色池底与中心排污孔视觉特征
  })
  frontTanksGroup.add(mainFrontMatrix)

  // 最左侧边角附加的2个阶梯调节方池（还原照片左下角突出的一列方池）
  const sideExtraMatrix = createConcreteTankMatrix({
    rows: 2,
    cols: 1,
    cellW: 3.2,
    cellD: 5.6,
    wallH: 1.85,
    wallT: 0.26,
    hasWater: false
  })
  sideExtraMatrix.position.set(-16.9, 0, 2.8)
  frontTanksGroup.add(sideExtraMatrix)
  sceneInstance.add(frontTanksGroup)

  // 6. 右前方：两层混凝土综合管理中控大楼 + 前院广场 (x: +4 ~ +30, z: +6.5 ~ +29.5)
  const officeBuildingGroup = new THREE.Group()
  officeBuildingGroup.position.set(17, 0.3, 12)

  const bldgW = 24
  const bldgD = 9.5
  const floor1H = 3.4
  const floor2H = 3.4
  const concreteBldgMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.62,
    metalness: 0.18
  })
  const darkWindowMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x004466,
    emissiveIntensity: 0.35,
    roughness: 0.2,
    metalness: 0.8
  })

  // 一层主体与二层楼板、平屋顶
  const slabGeo = new THREE.BoxGeometry(bldgW, 0.35, bldgD)
  const midSlab = new THREE.Mesh(slabGeo, concreteBldgMat)
  midSlab.position.y = floor1H
  officeBuildingGroup.add(midSlab)

  const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(bldgW + 0.6, 0.4, bldgD + 0.6), concreteBldgMat)
  roofSlab.position.y = floor1H + floor2H
  officeBuildingGroup.add(roofSlab)

  // 屋顶四周女儿墙与发光科技灯带
  const parapetEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(bldgW + 0.6, 0.5, bldgD + 0.6)),
    new THREE.LineBasicMaterial({ color: 0x00e5ff })
  )
  parapetEdge.position.y = floor1H + floor2H + 0.2
  officeBuildingGroup.add(parapetEdge)

  // 大楼背墙与左右山墙
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(bldgW, floor1H + floor2H, 0.4),
    concreteBldgMat
  )
  backWall.position.set(0, (floor1H + floor2H) / 2, -bldgD / 2 + 0.2)
  officeBuildingGroup.add(backWall)

  const sideWallBldgGeo = new THREE.BoxGeometry(0.4, floor1H + floor2H, bldgD)
  const leftBldgWall = new THREE.Mesh(sideWallBldgGeo, concreteBldgMat)
  leftBldgWall.position.set(-bldgW / 2 + 0.2, (floor1H + floor2H) / 2, 0)
  officeBuildingGroup.add(leftBldgWall)

  const rightBldgWall = new THREE.Mesh(sideWallBldgGeo, concreteBldgMat)
  rightBldgWall.position.set(bldgW / 2 - 0.2, (floor1H + floor2H) / 2, 0)
  officeBuildingGroup.add(rightBldgWall)

  // 正立面结构（严格还原照片：二层左半部分为敞开式外廊立柱，右半部分为实墙配4个方窗；一层带突出门廊雨棚）
  const colGeo = new THREE.BoxGeometry(0.45, floor1H + floor2H, 0.45)
  for (let i = -3; i <= 3; i++) {
    const col = new THREE.Mesh(colGeo, concreteBldgMat)
    col.position.set(i * 3.8, (floor1H + floor2H) / 2, bldgD / 2 - 0.25)
    officeBuildingGroup.add(col)
  }

  // 二层右侧实墙与4个方形窗口（对应照片大楼右上侧的4个深色方窗）
  const rightUpperWall = new THREE.Mesh(
    new THREE.BoxGeometry(11.2, floor2H - 0.3, 0.35),
    concreteBldgMat
  )
  rightUpperWall.position.set(6.2, floor1H + floor2H / 2, bldgD / 2 - 0.25)
  officeBuildingGroup.add(rightUpperWall)

  const winGeo = new THREE.BoxGeometry(1.5, 1.35, 0.42)
  for (let w = 0; w < 4; w++) {
    const winMesh = new THREE.Mesh(winGeo, darkWindowMat)
    winMesh.position.set(2.0 + w * 2.75, floor1H + floor2H / 2 + 0.1, bldgD / 2 - 0.24)
    officeBuildingGroup.add(winMesh)
  }

  // 一层内退玻璃幕墙/门厅
  const groundInterior = new THREE.Mesh(
    new THREE.BoxGeometry(bldgW - 1.2, floor1H - 0.2, bldgD - 1.8),
    darkWindowMat
  )
  groundInterior.position.set(0, floor1H / 2, -0.5)
  officeBuildingGroup.add(groundInterior)

  // 一层前伸门廊雨棚与两根门廊立柱（还原照片大楼左中部的凸出门廊）
  const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.32, 2.8), concreteBldgMat)
  porchRoof.position.set(-2.5, floor1H + 0.05, bldgD / 2 + 1.3)
  officeBuildingGroup.add(porchRoof)

  const porchColGeo = new THREE.BoxGeometry(0.38, floor1H, 0.38)
  ;[-7.4, 2.4].forEach((px) => {
    const pCol = new THREE.Mesh(porchColGeo, concreteBldgMat)
    pCol.position.set(px, floor1H / 2, bldgD / 2 + 2.5)
    officeBuildingGroup.add(pCol)
  })

  sceneInstance.add(officeBuildingGroup)

  // 6.2 大楼前方硬化院坝广场 (x: +4 ~ +31, z: +17 ~ +29.5)
  const courtyardGeo = new THREE.BoxGeometry(27, 0.35, 13)
  const courtyardMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.8,
    metalness: 0.1
  })
  const courtyard = new THREE.Mesh(courtyardGeo, courtyardMat)
  courtyard.position.set(17, 0.38, 23.2)
  sceneInstance.add(courtyard)

  // 7. 基地前缘黑色铁艺围栏 (z = +30.2, x: -31 ~ +31)
  const fenceGroup = new THREE.Group()
  fenceGroup.position.set(0, 0.3, 30.2)
  const fenceRail = new THREE.Mesh(
    new THREE.BoxGeometry(62, 0.12, 0.12),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  )
  fenceRail.position.y = 1.4
  fenceGroup.add(fenceRail)

  const postGeo = new THREE.BoxGeometry(0.18, 1.5, 0.18)
  const postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 })
  for (let fx = -30; fx <= 30; fx += 3) {
    const post = new THREE.Mesh(postGeo, postMat)
    post.position.set(fx, 0.75, 0)
    fenceGroup.add(post)
  }
  sceneInstance.add(fenceGroup)

  // 8. 罗茨鼓风增氧机房与精准拌料罐体设备点缀
  // 左侧罗茨风机组 (m-aerator-station)
  const aeratorStation = new THREE.Group()
  aeratorStation.position.set(-28.5, 0.4, -8)
  blowerFans = []
  for (let b = 0; b < 4; b++) {
    const blower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 1.4, 16),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x005588,
        emissiveIntensity: 0.5,
        metalness: 0.7
      })
    )
    blower.rotation.z = Math.PI / 2
    blower.position.set(0, 1.1, (b - 1.5) * 2.2)
    aeratorStation.add(blower)

    const fanRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.08, 8, 20),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff })
    )
    fanRing.rotation.y = Math.PI / 2
    fanRing.position.set(-0.72, 1.1, (b - 1.5) * 2.2)
    aeratorStation.add(fanRing)
    blowerFans.push(fanRing)
  }
  sceneInstance.add(aeratorStation)

  // 9. 周边真实山谷地貌环境还原（右侧道路与溪流、后方生态水塘与绿植、远景6根高架桥墩）
  // 9.1 右侧沿河进场道路与重安江支流溪水
  const roadGeo = new THREE.PlaneGeometry(7.5, 96)
  roadGeo.rotateX(-Math.PI / 2)
  const roadMesh = new THREE.Mesh(
    roadGeo,
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 })
  )
  roadMesh.position.set(35.5, 0.02, -4)
  roadMesh.rotation.y = 0.08
  sceneInstance.add(roadMesh)

  const streamGeo = new THREE.PlaneGeometry(9, 110)
  streamGeo.rotateX(-Math.PI / 2)
  const streamMesh = new THREE.Mesh(
    streamGeo,
    new THREE.MeshStandardMaterial({
      color: 0x0c4a6e,
      emissive: 0x082f49,
      roughness: 0.25,
      metalness: 0.6
    })
  )
  streamMesh.position.set(44, -0.05, -4)
  streamMesh.rotation.y = 0.08
  sceneInstance.add(streamMesh)

  // 9.2 后方生态尾水沉淀塘 (还原照片左后方的水面)
  const backPondGeo = new THREE.PlaneGeometry(26, 14)
  backPondGeo.rotateX(-Math.PI / 2)
  const backPond = new THREE.Mesh(
    backPondGeo,
    new THREE.MeshStandardMaterial({
      color: 0x075985,
      roughness: 0.2,
      metalness: 0.65
    })
  )
  backPond.position.set(-16, 0.02, -39)
  sceneInstance.add(backPond)

  // 9.3 远景高架桥巨型双柱桥墩（还原照片顶部最具辨识度的6座高架桥墩！）
  const pierGroup = new THREE.Group()
  pierGroup.position.set(0, 0, -56)
  const pierGeo = new THREE.BoxGeometry(2.6, 26, 3.2)
  const pierMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.6,
    metalness: 0.2
  })
  for (let p = -2.5; p <= 2.5; p += 1) {
    const pier = new THREE.Mesh(pierGeo, pierMat)
    pier.position.set(p * 18, 13, (Math.abs(p) % 2) * -3)
    pierGroup.add(pier)
  }
  sceneInstance.add(pierGroup)

  // 9.4 右侧山坡与后方林带低多边形绿植群
  const treeMat = new THREE.MeshStandardMaterial({
    color: 0x14532d,
    emissive: 0x052e16,
    emissiveIntensity: 0.35,
    roughness: 0.85,
    flatShading: true
  })
  const treeGeo = new THREE.DodecahedronGeometry(2.4, 1)
  // 后方林带
  for (let tx = -6; tx <= 26; tx += 3.2) {
    for (let tz = -38; tz <= -31; tz += 3.2) {
      const foliage = new THREE.Mesh(treeGeo, treeMat)
      const s = 0.7 + Math.random() * 0.65
      foliage.scale.set(s, s * 0.85, s)
      foliage.position.set(tx + (Math.random() - 0.5) * 1.5, 1.5, tz + (Math.random() - 0.5) * 1.5)
      sceneInstance.add(foliage)
    }
  }
  // 右侧溪流外侧山体林带
  for (let tz = -42; tz <= 32; tz += 4.2) {
    for (let layer = 0; layer < 3; layer++) {
      const foliage = new THREE.Mesh(treeGeo, treeMat)
      const s = 1.1 + layer * 0.4 + Math.random() * 0.4
      foliage.scale.set(s, s * 0.9, s)
      foliage.position.set(50 + layer * 4.5, 1.8 + layer * 2.2, tz)
      sceneInstance.add(foliage)
    }
  }

  // 10. 循环水与精准投喂流光管道系统（带动态脉冲能量球）
  flowPulses = []
  const pipeRoutes = [
    // 循环水处理中心 -> 保温大棚主养池群
    [
      new THREE.Vector3(-12, 1.8, 8.5),
      new THREE.Vector3(-12, 1.8, -4),
      new THREE.Vector3(-12, 1.8, -18),
      new THREE.Vector3(6, 1.8, -18),
      new THREE.Vector3(6, 1.8, -4)
    ],
    // 循环水处理中心 -> 前区水泥方池群
    [
      new THREE.Vector3(-12, 1.8, 8.5),
      new THREE.Vector3(-22, 1.6, 15),
      new THREE.Vector3(-22, 1.6, 25),
      new THREE.Vector3(-4, 1.6, 25)
    ],
    // 综合管理中控楼 -> 精准拌料站 -> 在线水质站
    [
      new THREE.Vector3(17, 2.2, 12),
      new THREE.Vector3(12, 2.2, -4),
      new THREE.Vector3(1, 2.0, 4.5)
    ]
  ]

  const pulseSphereGeo = new THREE.SphereGeometry(0.38, 12, 12)
  const pulseSphereMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff })

  pipeRoutes.forEach((pts) => {
    const curve = new THREE.CatmullRomCurve3(pts)
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.14, 8, false)
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x00a8ff,
      transparent: true,
      opacity: 0.45
    })
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat)
    sceneInstance.add(tubeMesh)

    for (let k = 0; k < 3; k++) {
      const pulseMesh = new THREE.Mesh(pulseSphereGeo, pulseSphereMat)
      sceneInstance.add(pulseMesh)
      flowPulses.push({
        mesh: pulseMesh,
        curve,
        progress: k / 3,
        speed: 0.16 + Math.random() * 0.05
      })
    }
  })

  // 11. 底部周期扩散脉冲扫描环
  pulseRings = []
  for (let i = 0; i < 3; i++) {
    const pGeo = new THREE.RingGeometry(1.5, 2.2, 64)
    pGeo.rotateX(-Math.PI / 2)
    const pMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    const pMesh = new THREE.Mesh(pGeo, pMat)
    pMesh.position.set(0, 0.42, 0)
    pMesh.userData = { phase: i / 3 }
    sceneInstance.add(pMesh)
    pulseRings.push(pMesh)
  }

  // 12. 258个虾池纳米微孔曝气气泡粒子系统
  const bubbleCount = 200
  const bubblePositions = new Float32Array(bubbleCount * 3)
  for (let i = 0; i < bubbleCount; i++) {
    bubblePositions[i * 3] = (Math.random() - 0.5) * 52
    bubblePositions[i * 3 + 1] = 0.6 + Math.random() * 2.8
    bubblePositions[i * 3 + 2] = -26 + Math.random() * 34
  }
  const bubbleGeo = new THREE.BufferGeometry()
  bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePositions, 3))
  const bubbleMat = new THREE.PointsMaterial({
    size: 0.65,
    map: createGlowTexture('#00e5ff'),
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  bubbleParticles = new THREE.Points(bubbleGeo, bubbleMat)
  sceneInstance.add(bubbleParticles)

  // 13. 选中点位时的 3D 锁定高亮光环与光柱
  highlightGroup = new THREE.Group()
  highlightGroup.visible = false

  const hRingGeo = new THREE.RingGeometry(3.8, 4.6, 48)
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
  highlightRingOuter.position.y = 0.6
  highlightGroup.add(highlightRingOuter)

  const hBeamGeo = new THREE.CylinderGeometry(2.4, 2.4, 14, 32, 1, true)
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
  scene.background = new THREE.Color(0x031124)
  scene.fog = new THREE.FogExp2(0x031124, 0.0062)

  camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 420)
  camera.position.copy(DEFAULT_CAM_POS)

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  wrap.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.copy(DEFAULT_TARGET)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.maxPolarAngle = Math.PI / 2 - 0.08
  controls.minDistance = 16
  controls.maxDistance = 145
  controls.autoRotate = isAutoRotate.value
  controls.autoRotateSpeed = 0.4

  controls.addEventListener('start', () => {
    flyState.active = false
  })

  // 灯光系统（兼顾混凝土实景层次与科技蓝光氛围）
  const ambientLight = new THREE.AmbientLight(0x7aa5d2, 1.55)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xf0f9ff, 1.95)
  dirLight.position.set(38, 78, 46)
  scene.add(dirLight)

  const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.75)
  fillLight.position.set(-45, 35, -30)
  scene.add(fillLight)

  const cyanPointLight = new THREE.PointLight(0x00e5ff, 2.6, 85)
  cyanPointLight.position.set(0, 16, -6)
  scene.add(cyanPointLight)

  // 构建重安对虾养殖示范基地 3D 模型
  buildChonganShrimpBase(scene)

  // 启动动画循环
  const clock = new THREE.Clock()
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    const elapsed = clock.getElapsedTime()
    const delta = clock.getDelta() || 0.016

    // 1. 周期脉冲光环扩散特效
    pulseRings.forEach((ring) => {
      ring.visible = showPulseEffect.value
      if (!showPulseEffect.value) return
      const phase = (elapsed * 0.2 + ring.userData.phase) % 1
      const scale = 1 + phase * 32
      ring.scale.set(scale, scale, 1)
      const mat = ring.material as THREE.MeshBasicMaterial
      mat.opacity = (1 - phase) * 0.35
    })

    // 2. 循环水管网流光脉冲球移动
    flowPulses.forEach((item) => {
      item.progress = (item.progress + item.speed * 0.008) % 1
      const pt = item.curve.getPointAt(item.progress)
      item.mesh.position.copy(pt)
      item.mesh.visible = showPulseEffect.value
    })

    // 3. 虾池微孔增氧气泡上浮
    if (bubbleParticles) {
      bubbleParticles.visible = showPulseEffect.value
      const bPos = bubbleParticles.geometry.attributes.position
      for (let i = 0; i < bPos.count; i++) {
        let py = bPos.getY(i) + 0.025
        if (py > 3.2) py = 0.6
        bPos.setY(i, py)
      }
      bPos.needsUpdate = true
    }

    // 4. 罗茨风机叶轮光环旋转
    blowerFans.forEach((fan) => {
      fan.rotation.x = elapsed * 3.5
    })

    // 5. 选中点位高亮光环呼吸动画
    if (highlightGroup && highlightGroup.visible && highlightRingOuter) {
      const pulseScale = 1 + Math.sin(elapsed * 4) * 0.08
      highlightRingOuter.scale.set(pulseScale, pulseScale, 1)
      highlightRingOuter.rotation.z = elapsed * 0.8
    }

    // 6. 相机平滑聚焦飞行插值 (Fly-to)
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
