<template>
  <PanelCard title="设备状态" custom-class="flex-1 min-h-0" body-class="px-3 py-2 flex items-center">
    <!-- 左侧环形图 -->
    <div class="w-[132px] h-[132px] relative shrink-0">
      <BaseChart :options="chartOptions" />
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-[10px] text-[#7da8d6] leading-tight">设备在线率</span>
        <span class="num-highlight text-[17px] text-white mt-0.5">{{ data.onlineRate }}%</span>
      </div>
    </div>

    <!-- 右侧图例与数值明细 -->
    <div class="flex-1 pl-3 space-y-2.5 text-xs">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-[2px] bg-[#22c55e]" />
          <span class="text-[#9cc5eb]">在线设备</span>
        </div>
        <span class="num-highlight text-[14px] text-white">{{ data.online }}</span>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-[2px] bg-[#ef4444]" />
          <span class="text-[#9cc5eb]">离线设备</span>
        </div>
        <span class="num-highlight text-[14px] text-white">{{ data.offline }}</span>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-[2px] bg-[#f59e0b]" />
          <span class="text-[#9cc5eb]">告警设备</span>
        </div>
        <span class="num-highlight text-[14px] text-white">{{ data.warning }}</span>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-[2px] bg-[#3b82f6]" />
          <span class="text-[#9cc5eb]">设备总数</span>
        </div>
        <span class="num-highlight text-[14px] text-white">{{ data.total }}</span>
      </div>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import PanelCard from '@/components/PanelCard.vue'
import BaseChart from '@/components/BaseChart.vue'
import type { DeviceStatusData } from '@/mock/dashboardData'

const props = defineProps<{
  data: DeviceStatusData
}>()

const chartOptions = computed<EChartsOption>(() => {
  const standby = Math.max(0, props.data.total - props.data.online - props.data.offline - props.data.warning)
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(6, 26, 58, 0.92)',
      borderColor: 'rgba(0, 229, 255, 0.45)',
      textStyle: { color: '#e2f1ff', fontSize: 11 }
    },
    series: [
      {
        name: '设备状态',
        type: 'pie',
        radius: ['66%', '84%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: props.data.online, name: '在线设备', itemStyle: { color: '#22c55e' } },
          { value: props.data.warning, name: '告警设备', itemStyle: { color: '#f59e0b' } },
          { value: props.data.offline, name: '离线设备', itemStyle: { color: '#ef4444' } },
          { value: standby, name: '待机备用', itemStyle: { color: '#1e90ff' } }
        ]
      }
    ]
  }
})
</script>
