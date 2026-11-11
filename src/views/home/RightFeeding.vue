<template>
  <PanelCard title="投喂管理" custom-class="h-[296px]" body-class="px-3.5 py-2 flex flex-col">
    <template #extra>
      <span class="text-[14px] text-[#00e5ff] font-medium">{{ data.stageTitle }}</span>
    </template>

    <!-- 上半部分：今日投喂环形图 + 1/2/3号料与保健添加剂占比明细 -->
    <div class="flex items-center h-[100px] shrink-0">
      <div class="w-[98px] h-[98px] relative shrink-0">
        <BaseChart :options="chartOptions" />
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span class="text-[12px] text-[#7da8d6] leading-tight">今日总投({{ data.unit }})</span>
          <span class="num-highlight text-[18px] text-white mt-0.5 leading-none">{{ data.todayTotal }}</span>
        </div>
      </div>

      <div class="flex-1 pl-3.5 space-y-1 text-[14px]">
        <div
          v-for="item in data.slices"
          :key="item.name"
          class="flex items-center justify-between leading-snug"
        >
          <div class="flex items-center gap-2 min-w-[84px]">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: item.color }" />
            <span class="text-[#d6ecff] truncate">{{ item.name }}</span>
          </div>
          <div class="text-[#9cc5eb] text-right w-[76px] font-mono">
            {{ item.count }} {{ item.unit }}
          </div>
          <div class="text-[#8ab4dc] text-right w-[58px] font-mono">
            {{ item.percent }}
          </div>
        </div>
      </div>
    </div>

    <!-- 下半部分：6时段投喂配方明细表 -->
    <div class="flex items-center justify-between text-[14px] text-[#8ab4dc] mt-1 mb-1 shrink-0">
      <span>每餐基础料：1号料100g + 2号料250g + 3号料50g</span>
      <span class="text-[#00e5ff]">6餐/日</span>
    </div>
    <div class="flex-1 min-h-0 overflow-hidden">
      <el-table :data="data.plans" class="cockpit-table w-full" height="100%">
        <el-table-column prop="time" label="时间" width="62" />
        <el-table-column prop="baseFeed" label="基础饲料" width="172" show-overflow-tooltip />
        <el-table-column prop="supplement" label="营养/保健添加" min-width="130" show-overflow-tooltip />
        <el-table-column prop="amount" label="合计(g)" width="76" align="right">
          <template #default="{ row }">
            <span class="num-highlight text-[18px] text-[#00e5ff]">{{ row.amount }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import PanelCard from '@/components/PanelCard.vue'
import BaseChart from '@/components/BaseChart.vue'
import type { ScaleSliceItem, FeedingPlanItem } from '@/mock/dashboardData'

const props = defineProps<{
  data: {
    stageTitle: string
    todayTotal: number
    unit: string
    slices: ScaleSliceItem[]
    plans: FeedingPlanItem[]
  }
}>()

const chartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(6, 26, 58, 0.92)',
    borderColor: 'rgba(0, 229, 255, 0.45)',
    textStyle: { color: '#e2f1ff', fontSize: 14 }
  },
  series: [
    {
      name: '今日投喂配方',
      type: 'pie',
      radius: ['66%', '84%'],
      center: ['50%', '50%'],
      label: { show: false },
      labelLine: { show: false },
      data: props.data.slices.map((s) => ({
        value: s.count,
        name: s.name,
        itemStyle: { color: s.color }
      }))
    }
  ]
}))
</script>
