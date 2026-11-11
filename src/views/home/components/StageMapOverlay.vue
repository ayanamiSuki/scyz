<template>
  <!-- 1. 左上侧：产销辐射网络图例与三大仓快速筛选面板 -->
  <div
    class="absolute left-3.5 top-12 z-20 w-[290px] rounded bg-[#041630]/90 border border-[#00c6ff]/40 p-3 backdrop-blur-md shadow-xl"
  >
    <div class="flex items-center justify-between border-b border-[#00a8ff]/25 pb-2 mb-2.5">
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-4 rounded-sm bg-[#00e5ff]" />
        <span class="text-[14px] font-semibold text-white tracking-wide">
          重安镇总厂 · 产销辐射网
        </span>
      </div>
      <span class="text-[12px] text-[#7dd3fc] bg-[#00a8ff]/20 px-2 py-0.5 rounded">
        3大枢纽仓
      </span>
    </div>

    <!-- 辐射统计概览 -->
    <div class="grid grid-cols-3 gap-1.5 mb-2.5 text-center">
      <div class="bg-[#072247]/80 rounded p-1.5 border border-[#00c6ff]/25">
        <div class="text-[11px] text-[#8ab4dc]">已合作枢纽</div>
        <div class="text-[16px] font-bold text-[#00e5ff] mt-0.5">2 仓</div>
      </div>
      <div class="bg-[#072247]/80 rounded p-1.5 border border-[#00c6ff]/25">
        <div class="text-[11px] text-[#8ab4dc]">已供货县市</div>
        <div class="text-[16px] font-bold text-[#38bdf8] mt-0.5">34 城</div>
      </div>
      <div class="bg-[#261a07]/80 rounded p-1.5 border border-[#fbbf24]/35">
        <div class="text-[11px] text-[#fcd34d]">2027省内覆盖</div>
        <div class="text-[16px] font-bold text-[#fbbf24] mt-0.5">70%</div>
      </div>
    </div>

    <!-- 仓库筛选切换按钮组 -->
    <div class="space-y-1.5">
      <button
        type="button"
        class="w-full px-2.5 py-1.5 rounded text-left text-[13px] flex items-center justify-between border transition-all cursor-pointer"
        :class="
          selectedHubId === 'all'
            ? 'bg-[#00a8ff]/30 border-[#00e5ff] text-white font-semibold'
            : 'bg-[#061d3d]/75 border-[#00c6ff]/25 text-[#9cc5eb] hover:border-[#00e5ff]/60'
        "
        @click="$emit('select-hub', 'all')"
      >
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-[#ffe066]" />
          <span>全部辐射网络（黄平重安镇总览）</span>
        </span>
        <span class="text-[11px] text-[#7dd3fc]">全景</span>
      </button>

      <button
        v-for="hub in hubs"
        :key="hub.id"
        type="button"
        class="w-full px-2.5 py-1.5 rounded text-left text-[13px] flex items-center justify-between border transition-all cursor-pointer"
        :class="
          selectedHubId === hub.id
            ? hub.status === 'planned'
              ? 'bg-[#fbbf24]/25 border-[#fbbf24] text-[#fef08a] font-semibold'
              : 'bg-[#00a8ff]/30 border-[#00e5ff] text-white font-semibold'
            : 'bg-[#061d3d]/75 border-[#00c6ff]/25 text-[#bfe3ff] hover:border-[#00e5ff]/60'
        "
        @click="$emit('select-hub', hub.id)"
      >
        <span class="flex items-center gap-1.5">
          <span
            class="w-2 h-2 rounded-full"
            :style="{ backgroundColor: hub.color }"
          />
          <span>{{ hub.name }}</span>
          <span
            class="text-[11px] px-1.5 py-0.2 rounded"
            :class="
              hub.status === 'planned'
                ? 'bg-[#fbbf24]/20 text-[#fcd34d]'
                : 'bg-[#00e5ff]/15 text-[#7dd3fc]'
            "
          >
            {{ hub.status === 'planned' ? '2027规划' : `${hub.cities.length}城` }}
          </span>
        </span>
        <span class="text-[11px] opacity-80">聚焦 ▸</span>
      </button>
    </div>

    <!-- 飞线图例说明 -->
    <div class="mt-2.5 pt-2 border-t border-[#00a8ff]/20 flex items-center justify-between text-[11px] text-[#8ab4dc]">
      <span class="flex items-center gap-1">
        <span class="w-4 h-0.5 bg-[#00e5ff] inline-block" />
        <span>已合作供货飞线</span>
      </span>
      <span class="flex items-center gap-1">
        <span class="w-4 h-0.5 border-b border-dashed border-[#fbbf24] inline-block" />
        <span>2027合作意向规划</span>
      </span>
    </div>
  </div>

  <!-- 2. 右上侧：选中枢纽仓时的供应/规划城市详情卡片 -->
  <transition name="el-fade-in-linear">
    <div
      v-if="activeHub"
      class="absolute right-3.5 top-12 z-30 w-[330px] rounded bg-[#051a38]/95 border p-3.5 shadow-2xl backdrop-blur-md"
      :class="
        activeHub.status === 'planned' ? 'border-[#fbbf24]/75' : 'border-[#00e5ff]/70'
      "
    >
      <div class="flex items-center justify-between border-b border-[#00a8ff]/25 pb-2 mb-2">
        <div class="flex items-center gap-2">
          <span
            class="w-2.5 h-2.5 rounded-full animate-pulse"
            :style="{ backgroundColor: activeHub.color }"
          />
          <span class="text-[16px] font-bold text-white">{{ activeHub.name }}</span>
          <span
            class="px-2 py-0.5 text-[11px] rounded border"
            :class="
              activeHub.status === 'planned'
                ? 'bg-[#fbbf24]/20 text-[#fde68a] border-[#fbbf24]/50'
                : 'bg-[#22c55e]/20 text-[#4ade80] border-[#22c55e]/45'
            "
          >
            {{ activeHub.statusText }}
          </span>
        </div>
        <button
          type="button"
          class="text-[#7da8d6] hover:text-white text-[14px] bg-transparent border-0 cursor-pointer"
          @click="$emit('select-hub', 'all')"
        >
          ✕
        </button>
      </div>

      <p class="text-[13px] text-[#b8dbf8] leading-relaxed mb-2">
        {{ activeHub.description }}
      </p>

      <div
        class="text-[12px] px-2.5 py-1.5 rounded mb-2.5 border"
        :class="
          activeHub.status === 'planned'
            ? 'bg-[#2d1e06]/80 border-[#fbbf24]/40 text-[#fde68a]'
            : 'bg-[#03152e]/85 border-[#00a8ff]/30 text-[#7dd3fc]'
        "
      >
        <span class="font-semibold">辐射范围：</span>{{ activeHub.coverageNote }}
      </div>

      <div class="text-[12px] text-[#8ab4dc] mb-1.5">
        {{ activeHub.status === 'planned' ? '规划覆盖核心地州市：' : '主要供货城市清单：' }}
      </div>
      <div class="flex flex-wrap gap-1.5 max-h-[168px] overflow-y-auto pr-1">
        <span
          v-for="city in activeHub.cities"
          :key="city.id"
          class="px-2 py-0.5 rounded text-[12px] border"
          :class="
            activeHub.status === 'planned'
              ? 'bg-[#362407]/85 border-[#fbbf24]/45 text-[#fef08a]'
              : 'bg-[#082b56]/85 border-[#00c6ff]/40 text-[#e0f2fe]'
          "
        >
          {{ city.name }}
        </span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MAP_HUB_WAREHOUSES, type HubId } from '../three/mapStageData'

const props = defineProps<{
  selectedHubId: HubId | 'all'
}>()

defineEmits<{
  (e: 'select-hub', hubId: HubId | 'all'): void
}>()

const hubs = MAP_HUB_WAREHOUSES

const activeHub = computed(() => {
  if (props.selectedHubId === 'all') return null
  return MAP_HUB_WAREHOUSES.find((h) => h.id === props.selectedHubId) ?? null
})
</script>
