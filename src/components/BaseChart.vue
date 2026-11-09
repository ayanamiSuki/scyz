<template>
  <div ref="chartRef" class="w-full h-full" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = defineProps<{
  options: EChartsOption
}>()

const chartRef = ref<HTMLDivElement | null>(null)
const chartInstance = shallowRef<echarts.ECharts | null>(null)

const initChart = () => {
  if (!chartRef.value) return
  // 使用较高的 devicePixelRatio 确保在 3840x2160 4K 大屏 scale(2) 放大后图表依然锐利清晰
  chartInstance.value = echarts.init(chartRef.value, undefined, {
    renderer: 'canvas',
    devicePixelRatio: Math.max(window.devicePixelRatio || 1, 2)
  })
  chartInstance.value.setOption(props.options, true)
}

const resizeChart = () => {
  chartInstance.value?.resize()
}

watch(
  () => props.options,
  (newOpt) => {
    if (chartInstance.value && newOpt) {
      chartInstance.value.setOption(newOpt, true)
    }
  },
  { deep: true }
)

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance.value?.dispose()
})
</script>

