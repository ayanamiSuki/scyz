<template>
  <PanelCard title="投喂管理" custom-class="h-[268px]" body-class="px-3 py-2 flex flex-col">
    <!-- 上半部分：今日投喂环形图 + 饲料占比明细 -->
    <div class="flex items-center h-[106px] shrink-0">
      <div class="w-[104px] h-[104px] relative shrink-0">
        <BaseChart :options="chartOptions" />
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span class="text-[9px] text-[#7da8d6]">今日投喂(kg)</span>
          <span class="num-highlight text-[16px] text-white mt-0.5">{{ data.todayTotal }}</span>
        </div>
      </div>

      <div class="flex-1 pl-2 space-y-1.5 text-[11px]">
        <div
          v-for="item in data.slices"
          :key="item.name"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-1.5 min-w-[68px]">
            <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: item.color }" />
            <span class="text-[#d6ecff] truncate">{{ item.name }}</span>
          </div>
          <div class="text-[#9cc5eb] text-right w-[56px] font-mono">
            {{ item.count }} {{ item.unit }}
          </div>
          <div class="text-[#8ab4dc] text-right w-[42px] font-mono">
            {{ item.percent }}
          </div>
        </div>
      </div>
    </div>

    <!-- 下半部分：投喂计划 ElementPlus Table -->
    <div class="text-[11px] text-[#8ab4dc] mt-1 mb-1 shrink-0">投喂计划</div>
    <div class="flex-1 min-h-0 overflow-hidden">
      <el-table :data="data.plans" class="cockpit-table w-full" height="100%">
        <el-table-column prop="time" label="时间" width="52" />
        <el-table-column prop="cage" label="网箱" width="68" />
        <el-table-column prop="feedType" label="饲料类型" min-width="68" />
        <el-table-column prop="amount" label="投喂量(kg)" width="74" align="center" />
        <el-table-column prop="status" label="状态" width="56" align="right">
          <template #default="{ row }">
            <span :class="row.status === '已完成' ? 'text-[#22c55e]' : 'text-[#f59e0b]'">
              {{ row.status }}
            </span>
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
    todayTotal: number
    slices: ScaleSliceItem[]
    plans: FeedingPlanItem[]
  }
}>()

const chartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(6, 26, 58, 0.92)',
    borderColor: 'rgba(0, 229, 255, 0.45)',
    textStyle: { color: '#e2f1ff', fontSize: 11 }
  },
  series: [
    {
      name: '今日投喂',
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

