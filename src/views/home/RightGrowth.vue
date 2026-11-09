<template>
  <PanelCard title="生长分析" custom-class="h-[212px]" body-class="px-3 py-2 flex flex-col">
    <!-- 顶部图例标题 -->
    <div class="flex items-center gap-1.5 text-[11px] text-[#7da8d6] shrink-0">
      <span class="w-2 h-0.5 bg-[#00e5ff] inline-block" />
      <span>平均体重 (g)</span>
    </div>

    <!-- 中间平滑面积图 -->
    <div class="flex-1 min-h-0">
      <BaseChart :options="chartOptions" />
    </div>

    <!-- 底部4项核心生长指标 -->
    <div class="grid grid-cols-4 gap-1 pt-1.5 border-t border-[#00a8ff]/15 shrink-0">
      <div>
        <div class="text-[10px] text-[#7da8d6]">平均体重</div>
        <div class="flex items-baseline gap-0.5 mt-0.5">
          <span class="num-highlight text-[14px] text-white">{{ data.avgWeight }}</span>
          <span class="text-[10px] text-[#7da8d6]">g</span>
        </div>
      </div>

      <div>
        <div class="text-[10px] text-[#7da8d6]">日增量</div>
        <div class="flex items-baseline gap-0.5 mt-0.5">
          <span class="num-highlight text-[14px] text-white">{{ data.dailyGain }}</span>
          <span class="text-[10px] text-[#7da8d6]">g</span>
        </div>
      </div>

      <div>
        <div class="text-[10px] text-[#7da8d6]">均匀度</div>
        <div class="mt-0.5">
          <span class="num-highlight text-[14px] text-white">{{ data.uniformity }}</span>
        </div>
      </div>

      <div>
        <div class="text-[10px] text-[#7da8d6]">成活率</div>
        <div class="mt-0.5">
          <span class="num-highlight text-[14px] text-white">{{ data.survivalRate }}</span>
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import PanelCard from '@/components/PanelCard.vue'
import BaseChart from '@/components/BaseChart.vue'
import type { GrowthData } from '@/mock/dashboardData'

const props = defineProps<{
  data: GrowthData
}>()

const chartOptions = computed<EChartsOption>(() => ({
  grid: {
    top: 8,
    right: 10,
    bottom: 18,
    left: 28
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(6, 26, 58, 0.92)',
    borderColor: 'rgba(0, 229, 255, 0.45)',
    textStyle: { color: '#e2f1ff', fontSize: 11 }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.data.dates,
    axisLine: { lineStyle: { color: 'rgba(0, 168, 255, 0.25)' } },
    axisTick: { show: false },
    axisLabel: { color: '#6e96bf', fontSize: 10, margin: 5 }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 800,
    interval: 200,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: 'rgba(0, 168, 255, 0.12)', type: 'dashed' } },
    axisLabel: { color: '#6e96bf', fontSize: 10 }
  },
  series: [
    {
      name: '平均体重',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#1e90ff', width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(30, 144, 255, 0.45)' },
            { offset: 1, color: 'rgba(30, 144, 255, 0.02)' }
          ]
        }
      },
      data: props.data.weights
    }
  ]
}))
</script>

