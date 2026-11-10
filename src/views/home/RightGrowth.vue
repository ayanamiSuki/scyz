<template>
  <PanelCard title="生长分析" custom-class="h-[228px]" body-class="px-3 py-2 flex flex-col">
    <template #extra>
      <span class="text-[10px] text-[#8ab4dc]">放苗天数曲线 (1斤=500g)</span>
    </template>

    <!-- 顶部品种与阶段说明条 -->
    <div class="flex items-center justify-between text-[10.5px] text-[#8ab4dc] shrink-0 mb-0.5">
      <div class="flex items-center gap-1.5 truncate" :title="data.subtitle">
        <span class="w-2 h-0.5 bg-[#00e5ff] inline-block shrink-0" />
        <span class="truncate">{{ data.subtitle }}</span>
      </div>
      <span class="text-[#00e5ff] shrink-0 ml-1">单重(g)</span>
    </div>

    <!-- 中间7阶段对虾生长曲线图 -->
    <div class="flex-1 min-h-0">
      <BaseChart :options="chartOptions" />
    </div>

    <!-- 底部4项核心生长指标 -->
    <div class="grid grid-cols-4 gap-1 pt-1.5 border-t border-[#00a8ff]/15 shrink-0">
      <div>
        <div class="text-[10px] text-[#7da8d6]">当前日龄</div>
        <div class="mt-0.5">
          <span class="num-highlight text-[13px] text-[#00e5ff]">{{ data.currentDay }}</span>
        </div>
      </div>

      <div>
        <div class="text-[10px] text-[#7da8d6]">当前头数</div>
        <div class="mt-0.5">
          <span class="num-highlight text-[12px] text-white">{{ data.currentSpec }}</span>
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
          <span class="num-highlight text-[14px] text-[#4ade80]">{{ data.survivalRate }}</span>
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

const chartOptions = computed<EChartsOption>(() => {
  const stages = props.data.stages || []
  return {
    grid: {
      top: 10,
      right: 12,
      bottom: 18,
      left: 28
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(6, 26, 58, 0.95)',
      borderColor: 'rgba(0, 229, 255, 0.5)',
      textStyle: { color: '#e2f1ff', fontSize: 11 },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        const st = stages[p.dataIndex]
        if (!st) return ''
        return [
          `<div style="font-weight:600;color:#00e5ff;margin-bottom:2px;">放苗 ${st.dayLabel}（${st.stageDesc}）</div>`,
          `单尾均重：<b>${st.weight} g</b>`,
          `规格头数：<b>${st.headCount}</b>`,
          `体长范围：<b>${st.lengthRange}</b>`
        ].join('<br/>')
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: stages.map((s) => s.dayLabel),
      axisLine: { lineStyle: { color: 'rgba(0, 168, 255, 0.25)' } },
      axisTick: { show: false },
      axisLabel: { color: '#6e96bf', fontSize: 10, margin: 5 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 22,
      interval: 5,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(0, 168, 255, 0.12)', type: 'dashed' } },
      axisLabel: { color: '#6e96bf', fontSize: 10 }
    },
    series: [
      {
        name: '单尾体重',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        itemStyle: { color: '#00e5ff' },
        lineStyle: { color: '#1e90ff', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 229, 255, 0.45)' },
              { offset: 1, color: 'rgba(30, 144, 255, 0.02)' }
            ]
          }
        },
        data: stages.map((s) => s.weight)
      }
    ]
  }
})
</script>
