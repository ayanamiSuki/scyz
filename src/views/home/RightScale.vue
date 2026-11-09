<template>
  <PanelCard title="养殖规模分析" custom-class="h-[178px]" body-class="px-3 py-2 flex items-center">
    <template #extra>
      <div class="cockpit-switch-group">
        <span
          class="cockpit-switch-btn"
          :class="{ 'is-active': mode === 'species' }"
          @click="mode = 'species'"
        >
          按品种
        </span>
        <span
          class="cockpit-switch-btn"
          :class="{ 'is-active': mode === 'cage' }"
          @click="mode = 'cage'"
        >
          按网箱
        </span>
      </div>
    </template>

    <!-- 左侧环形图 -->
    <div class="w-[116px] h-[116px] relative shrink-0">
      <BaseChart :options="chartOptions" />
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-[10px] text-[#7da8d6]">存塘量</span>
        <div class="flex items-baseline gap-0.5 mt-0.5">
          <span class="num-highlight text-[14px] text-white">{{ data.totalStock }}</span>
          <span class="text-[9px] text-[#7da8d6]">尾</span>
        </div>
      </div>
    </div>

    <!-- 右侧品种/网箱明细列表 -->
    <div class="flex-1 pl-2 space-y-2 text-[11px]">
      <div
        v-for="item in currentList"
        :key="item.name"
        class="flex items-center justify-between"
      >
        <div class="flex items-center gap-1.5 min-w-[68px]">
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: item.color }" />
          <span class="text-[#d6ecff] truncate">{{ item.name }}</span>
        </div>
        <div class="text-[#9cc5eb] text-right w-[68px] font-mono">
          {{ item.count }} {{ item.unit }}
        </div>
        <div class="text-[#8ab4dc] text-right w-[42px] font-mono">
          {{ item.percent }}
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EChartsOption } from 'echarts'
import PanelCard from '@/components/PanelCard.vue'
import BaseChart from '@/components/BaseChart.vue'
import type { ScaleSliceItem } from '@/mock/dashboardData'

const props = defineProps<{
  data: {
    totalStock: number
    bySpecies: ScaleSliceItem[]
    byCage: ScaleSliceItem[]
  }
}>()

const mode = ref<'species' | 'cage'>('species')

const currentList = computed(() =>
  mode.value === 'species' ? props.data.bySpecies : props.data.byCage
)

const chartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(6, 26, 58, 0.92)',
    borderColor: 'rgba(0, 229, 255, 0.45)',
    textStyle: { color: '#e2f1ff', fontSize: 11 }
  },
  series: [
    {
      name: '养殖规模',
      type: 'pie',
      radius: ['66%', '84%'],
      center: ['50%', '50%'],
      label: { show: false },
      labelLine: { show: false },
      data: currentList.value.map((item) => ({
        value: item.count,
        name: item.name,
        itemStyle: { color: item.color }
      }))
    }
  ]
}))
</script>

