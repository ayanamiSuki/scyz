<template>
  <header class="w-full h-[78px] shrink-0 relative select-none z-20">
    <!-- 顶部科技装饰背景线条与梯形主标题底座 -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1920 78" fill="none">
      <defs>
        <linearGradient id="headerBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0a2858" stop-opacity="0.95" />
          <stop offset="60%" stop-color="#061a3a" stop-opacity="0.88" />
          <stop offset="100%" stop-color="#04122a" stop-opacity="0.75" />
        </linearGradient>
        <linearGradient id="centerTrapezoid" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0d4185" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#07234d" stop-opacity="0.95" />
        </linearGradient>
        <linearGradient id="cyanLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.1" />
          <stop offset="30%" stop-color="#00e5ff" stop-opacity="0.85" />
          <stop offset="50%" stop-color="#ffffff" stop-opacity="0.95" />
          <stop offset="70%" stop-color="#00e5ff" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#00e5ff" stop-opacity="0.1" />
        </linearGradient>
      </defs>

      <!-- 整体深色渐层底 -->
      <rect width="1920" height="78" fill="url(#headerBgGrad)" />

      <!-- 顶部左右翼斜切装饰框 -->
      <path
        d="M0 36 H590 L618 4 H1302 L1330 36 H1920"
        stroke="rgba(0, 180, 255, 0.35)"
        stroke-width="1.2"
        fill="none"
      />
      <!-- 中央大标题梯形发光底座 -->
      <polygon
        points="615,0 1305,0 1272,42 648,42"
        fill="url(#centerTrapezoid)"
        stroke="url(#cyanLineGrad)"
        stroke-width="1.6"
      />
      <!-- 梯形两侧斜向科技高亮刻线 -->
      <line x1="628" y1="6" x2="653" y2="38" stroke="#00e5ff" stroke-width="2" stroke-opacity="0.7" />
      <line x1="636" y1="6" x2="661" y2="38" stroke="#00e5ff" stroke-width="1" stroke-opacity="0.4" />
      <line x1="1292" y1="6" x2="1267" y2="38" stroke="#00e5ff" stroke-width="2" stroke-opacity="0.7" />
      <line x1="1284" y1="6" x2="1259" y2="38" stroke="#00e5ff" stroke-width="1" stroke-opacity="0.4" />

      <!-- 底部导航分割发光底线 -->
      <line x1="0" y1="77" x2="1920" y2="77" stroke="url(#cyanLineGrad)" stroke-width="1.2" />
    </svg>

    <!-- 第一层：左（园区选择+搜索）、中（主标题）、右（天气+时间+用户） -->
    <div class="relative z-10 h-[42px] px-4 flex items-center justify-between">
      <!-- 左侧：园区选择 + 搜索栏 -->
      <div class="flex items-center gap-3 w-[560px]">
        <div class="flex items-center text-xs text-[#8ab4dc] shrink-0">
          <span>养殖园区：</span>
          <el-select
            :model-value="currentFarmId"
            size="small"
            class="cockpit-select w-[126px]"
            popper-class="cockpit-popper"
            @update:model-value="(val: string) => $emit('update:currentFarmId', val)"
          >
            <el-option
              v-for="farm in FARM_LIST"
              :key="farm.id"
              :label="farm.name"
              :value="farm.id"
            />
          </el-select>
        </div>

        <!-- 搜索框 -->
        <div class="flex items-center w-[235px]">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索你感兴趣的内容"
            class="cockpit-search"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <button
                class="flex items-center gap-0.5 text-[#00e5ff] hover:text-white text-[11px] cursor-pointer bg-transparent border-0 pl-1"
                @click="handleSearch"
              >
                <el-icon><Search /></el-icon>
                <span>搜索</span>
              </button>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 中央：主标题 -->
      <div class="absolute left-1/2 -translate-x-1/2 top-0 h-[40px] flex items-center justify-center pointer-events-none">
        <h1
          class="text-[24px] font-bold tracking-[4px] text-white m-0"
          style="text-shadow: 0 0 14px rgba(0, 229, 255, 0.75), 0 2px 4px rgba(0, 0, 0, 0.8);"
        >
          贵州裕宸水产发展有限公司
        </h1>
      </div>

      <!-- 右侧：天气、日期时间、管理员、全屏按钮 -->
      <div class="flex items-center justify-end gap-5 w-[560px] text-xs text-[#bce3ff]">
        <div class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-[#fbbf24]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
          </svg>
          <span>24℃ 多云</span>
        </div>

        <div class="font-mono text-[#9cc5eb] tracking-wider">
          {{ currentTimeStr }}
        </div>

        <div class="flex items-center gap-1.5 cursor-pointer hover:text-white">
          <div class="w-5 h-5 rounded-full bg-[#1e90ff]/40 border border-[#00e5ff]/60 flex items-center justify-center text-[11px] text-white">
            <el-icon><UserFilled /></el-icon>
          </div>
          <span>admin</span>
          <el-icon class="text-[10px] text-[#7da8d6]"><ArrowDown /></el-icon>
        </div>

        <button
          class="text-[#7da8d6] hover:text-[#00e5ff] transition-colors cursor-pointer bg-transparent border-0 p-1"
          title="切换全屏"
          @click="toggleFullScreen"
        >
          <el-icon class="text-sm"><FullScreen /></el-icon>
        </button>
      </div>
    </div>

    <!-- 第二层：9大业务导航菜单栏 -->
    <nav class="relative z-10 h-[36px] flex items-center justify-center gap-7">
      <router-link
        v-for="item in NAV_ITEMS"
        :key="item.path"
        :to="item.path"
        class="relative h-full px-3 flex items-center gap-1.5 text-[13px] font-medium no-underline transition-all duration-200"
        :class="
          route.path === item.path
            ? 'text-white font-semibold'
            : 'text-[#8ab4dc] hover:text-[#d8f0ff]'
        "
      >
        <el-icon class="text-[14px]" :class="route.path === item.path ? 'text-[#00e5ff]' : 'text-[#6ca0d4]'">
          <HomeFilled v-if="item.icon === 'home'" />
          <Aim v-else-if="item.icon === 'monitor'" />
          <Odometer v-else-if="item.icon === 'env'" />
          <Box v-else-if="item.icon === 'feeding'" />
          <TrendCharts v-else-if="item.icon === 'growth'" />
          <Cpu v-else-if="item.icon === 'device'" />
          <BellFilled v-else-if="item.icon === 'warning'" />
          <Histogram v-else-if="item.icon === 'report'" />
          <Setting v-else />
        </el-icon>
        <span>{{ item.name }}</span>

        <!-- 激活态底部高亮光条与梯形光晕 -->
        <template v-if="route.path === item.path">
          <span
            class="absolute inset-x-0 bottom-0 h-[2.5px] bg-[#00e5ff] rounded-t"
            style="box-shadow: 0 -2px 10px #00e5ff, 0 0 8px #00e5ff;"
          />
          <span
            class="absolute inset-0 pointer-events-none"
            style="background: radial-gradient(ellipse at bottom, rgba(0, 229, 255, 0.28) 0%, transparent 72%);"
          />
        </template>
      </router-link>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search,
  UserFilled,
  ArrowDown,
  FullScreen,
  HomeFilled,
  Aim,
  Odometer,
  Box,
  TrendCharts,
  Cpu,
  BellFilled,
  Histogram,
  Setting
} from '@element-plus/icons-vue'
import { FARM_LIST, NAV_ITEMS } from '@/mock/dashboardData'

defineProps<{
  currentFarmId: string
}>()

const emit = defineEmits<{
  (e: 'update:currentFarmId', val: string): void
  (e: 'search', keyword: string): void
}>()

const route = useRoute()
const searchKeyword = ref('')
const currentTimeStr = ref('2024-05-20 10:30:45')

let timer: number | null = null

const formatNow = () => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = now.getFullYear()
  const m = pad(now.getMonth() + 1)
  const d = pad(now.getDate())
  const hh = pad(now.getHours())
  const mm = pad(now.getMinutes())
  const ss = pad(now.getSeconds())
  currentTimeStr.value = `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

const handleSearch = () => {
  const kw = searchKeyword.value.trim()
  if (!kw) {
    ElMessage.info('请输入需要检索的网箱、设备或指标名称')
    return
  }
  emit('search', kw)
}

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

onMounted(() => {
  formatNow()
  timer = window.setInterval(formatNow, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

