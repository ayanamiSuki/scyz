<template>
  <PanelCard title="基地介绍" custom-class="h-[192px]" body-class="px-3 py-2 flex flex-col justify-between">
    <template #extra>
      <span class="text-[11px] text-[#00e5ff] flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />
        <span>{{ data.location }}</span>
      </span>
    </template>

    <!-- 顶部核心定位标签 -->
    <div class="flex flex-wrap items-center gap-1.5 shrink-0">
      <span
        v-for="tag in data.tags"
        :key="tag"
        class="px-2 py-0.5 rounded text-[10px] bg-[#00a8ff]/15 border border-[#00e5ff]/35 text-[#8ce7ff]"
      >
        {{ tag }}
      </span>
    </div>

    <!-- 中部基地介绍正文 -->
    <p class="text-[11.5px] text-[#cfe8ff] leading-[1.6] m-0 line-clamp-4">
      {{ data.description }}
    </p>

    <!-- 底部3项核心指标亮点 -->
    <div class="grid grid-cols-3 gap-2 pt-1.5 border-t border-[#00a8ff]/20 shrink-0">
      <div
        v-for="item in data.highlights"
        :key="item.label"
        class="bg-[#041836]/75 rounded px-2 py-1 border border-[#00a8ff]/20 flex items-center justify-between"
      >
        <span class="text-[10px] text-[#7da8d6]">{{ item.label }}</span>
        <span class="num-highlight text-[12px] text-[#00e5ff]">{{ item.value }}</span>
      </div>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import PanelCard from '@/components/PanelCard.vue'
import type { BaseIntroData } from '@/mock/dashboardData'

defineProps<{
  data: BaseIntroData
}>()
</script>
