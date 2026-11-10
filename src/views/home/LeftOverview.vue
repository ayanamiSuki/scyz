<template>
  <PanelCard title="基地总览" custom-class="h-[232px]" body-class="px-3 py-2.5">
    <div class="grid grid-cols-2 grid-rows-3 gap-x-2 gap-y-2.5 h-full items-center">
      <div
        v-for="item in data"
        :key="item.key"
        class="flex items-center gap-2.5 px-1 py-1 rounded hover:bg-[#00a8ff]/10 transition-colors"
      >
        <TechIcon :name="item.icon" size-class="w-10 h-10" />
        <div class="min-w-0 flex-1">
          <div class="text-[11px] text-[#7da8d6] leading-tight mb-1">
            {{ item.label }}
          </div>
          <div
            v-if="item.key === 'species'"
            class="text-[13px] font-semibold text-[#e6f4ff] truncate"
            :title="String(item.value)"
          >
            {{ item.value }}
          </div>
          <div v-else class="flex items-baseline gap-1">
            <span class="num-highlight text-[17px] text-white leading-none">
              {{ item.value }}
            </span>
            <span class="text-[11px] text-[#7da8d6]">{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import PanelCard from '@/components/PanelCard.vue'
import TechIcon from '@/components/TechIcon.vue'
import type { OverviewItem } from '@/mock/dashboardData'

defineProps<{
  data: OverviewItem[]
}>()
</script>
