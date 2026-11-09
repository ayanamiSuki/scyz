<template>
  <footer class="h-[82px] shrink-0 grid grid-cols-7 gap-3 px-3 pb-2.5 pt-1">
    <div
      v-for="item in items"
      :key="item.key"
      class="bottom-summary-card px-3.5 flex items-center gap-3.5"
    >
      <TechIcon :name="item.icon" size-class="w-12 h-12" />
      <div class="min-w-0 flex-1">
        <div class="text-[12px] text-[#8ab4dc] mb-1 truncate">
          {{ item.label }}
        </div>
        <div class="flex items-baseline gap-1">
          <span class="num-highlight text-[21px] text-white leading-none">
            {{ item.value }}
          </span>
          <span class="text-[11px] text-[#7da8d6]">{{ item.unit }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import TechIcon from '@/components/TechIcon.vue'
import type { BottomSummaryItem } from '@/mock/dashboardData'

defineProps<{
  items: BottomSummaryItem[]
}>()
</script>

