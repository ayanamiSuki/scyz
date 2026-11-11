<template>
  <PanelCard title="公司简介" custom-class="h-[230px]" body-class="px-3.5 py-2 flex flex-col justify-between">
    <template #extra>
      <span class="text-[14px] text-[#00e5ff] flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-[#00e5ff]" />
        <span>{{ data.location }}</span>
      </span>
    </template>

    <!-- 顶部核心定位标签 -->
    <div class="flex flex-wrap items-center gap-2 shrink-0">
      <span v-for="tag in data.tags" :key="tag" class="px-2.5 py-0.5 rounded text-[14px] bg-[#00a8ff]/15 border border-[#00e5ff]/35 text-[#8ce7ff]">
        {{ tag }}
      </span>
    </div>

    <!-- 中部基地介绍正文 -->
    <p class="text-[14px] description text-[#cfe8ff] leading-[1.5] m-0 line-clamp-3" :title="data.description">
      {{ data.description }}
    </p>

    <!-- 底部3项核心指标亮点 -->
    <div class="grid grid-cols-3 gap-2 pt-1.5 border-t border-[#00a8ff]/20 shrink-0">
      <div v-for="item in data.highlights" :key="item.label" class="bg-[#041836]/75 itemx rounded px-2.5 py-1 border border-[#00a8ff]/20 flex items-center justify-between">
        <span class="text-[14px] text-[#7da8d6]">{{ item.label }}</span>
        <span class="num-highlight text-[18px] text-[#00e5ff] leading-none">{{ item.value }}</span>
      </div>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import PanelCard from '@/components/PanelCard.vue';
import type { BaseIntroData } from '@/mock/dashboardData';

defineProps<{
  data: BaseIntroData;
}>();
</script>
<style lang="css" scoped>
.itemx {
  flex-direction: column;
}
.description {
  white-space: pre-wrap;
}
</style>
