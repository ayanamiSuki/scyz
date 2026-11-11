<template>
  <PanelCard title="环境监测" custom-class="h-[488px]" body-class="px-3.5 py-2 flex flex-col">
    <template #extra>
      <div class="cockpit-switch-group">
        <span
          class="cockpit-switch-btn"
          :class="{ 'is-active': envType === 'underwater' }"
          @click="envType = 'underwater'"
        >
          水下
        </span>
        <span
          class="cockpit-switch-btn"
          :class="{ 'is-active': envType === 'surface' }"
          @click="envType = 'surface'"
        >
          水上
        </span>
      </div>
    </template>

    <!-- 9项监测参数列表（水下9项水质指标 / 水上黄平县重安镇实时气象） -->
    <div class="space-y-1 shrink-0">
      <div
        v-for="item in currentMetrics"
        :key="item.key"
        class="flex items-center justify-between text-[14px] h-[25px] px-1.5 rounded hover:bg-[#00a8ff]/10 transition-colors"
      >
        <div class="flex items-center gap-2">
          <!-- 状态圆点图标 -->
          <span
            class="w-4 h-4 rounded-full flex items-center justify-center border"
            :style="{
              borderColor: `${item.color}66`,
              backgroundColor: `${item.color}22`
            }"
          >
            <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: item.color }" />
          </span>
          <span class="text-[#9cc5eb]">{{ item.label }}</span>
        </div>
        <div class="w-[156px] text-left flex items-baseline gap-1.5">
          <span class="num-highlight text-[18px] text-[#e6f4ff] leading-none">{{ item.value }}</span>
          <span class="text-[14px] text-[#7da8d6]">{{ item.unit }}</span>
        </div>
      </div>
    </div>

    <!-- 24小时趋势面积折线图 -->
    <div class="flex-1 min-h-0 mt-1">
      <BaseChart :options="chartOptions" />
    </div>

    <!-- 底部4个指标切换Tab：水温 / 溶解氧 / pH / 盐度 -->
    <div class="h-[30px] shrink-0 grid grid-cols-4 border-t border-[#00a8ff]/20 pt-1">
      <button
        v-for="tab in trendTabKeys"
        :key="tab"
        class="relative text-[14px] flex items-center justify-center cursor-pointer bg-transparent border-0 transition-colors"
        :class="activeTrendTab === tab ? 'text-[#00e5ff] font-semibold' : 'text-[#7da8d6] hover:text-white'"
        @click="activeTrendTab = tab"
      >
        <span>{{ tab }}</span>
        <span
          v-if="activeTrendTab === tab"
          class="absolute bottom-0 inset-x-3 h-[2px] bg-[#00e5ff] rounded"
          style="box-shadow: 0 0 6px #00e5ff;"
        />
      </button>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EChartsOption } from 'echarts'
import PanelCard from '@/components/PanelCard.vue'
import BaseChart from '@/components/BaseChart.vue'
import type { EnvMetricItem, EnvTrendSeries } from '@/mock/dashboardData'
import { useWeather } from '@/services/weather'

const props = defineProps<{
  metrics: {
    underwater: EnvMetricItem[]
    surface: EnvMetricItem[]
  }
  trends: Record<string, EnvTrendSeries>
}>()

const { weatherState } = useWeather()
const envType = ref<'underwater' | 'surface'>('underwater')
const trendTabKeys = ['水温', '溶解氧', 'pH', '盐度']
const activeTrendTab = ref<string>('水温')

const currentMetrics = computed(() =>
  envType.value === 'underwater'
    ? props.metrics.underwater
    : weatherState.value.surfaceMetrics?.length
      ? weatherState.value.surfaceMetrics
      : props.metrics.surface
)

const chartOptions = computed<EChartsOption>(() => {
  const seriesObj = props.trends[activeTrendTab.value] || props.trends['水温']
  return {
    grid: {
      top: 12,
      right: 12,
      bottom: 22,
      left: 34
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(6, 26, 58, 0.92)',
      borderColor: 'rgba(0, 229, 255, 0.45)',
      textStyle: { color: '#e2f1ff', fontSize: 14 },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        return `${p.AxisValue || p.name}<br/>${seriesObj.label}: <b>${p.value} ${seriesObj.unit}</b>`
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      axisLine: { lineStyle: { color: 'rgba(0, 168, 255, 0.25)' } },
      axisTick: { show: false },
      axisLabel: {
        color: '#6e96bf',
        fontSize: 12,
        margin: 6
      }
    },
    yAxis: {
      type: 'value',
      min: seriesObj.min,
      max: seriesObj.max,
      splitNumber: 3,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: { color: 'rgba(0, 168, 255, 0.12)', type: 'dashed' }
      },
      axisLabel: {
        color: '#6e96bf',
        fontSize: 12
      }
    },
    series: [
      {
        name: seriesObj.label,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        itemStyle: {
          color: '#00e5ff'
        },
        lineStyle: {
          color: '#00c6ff',
          width: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 198, 255, 0.42)' },
              { offset: 1, color: 'rgba(0, 198, 255, 0.02)' }
            ]
          }
        },
        data: seriesObj.data
      }
    ]
  }
})
</script>
