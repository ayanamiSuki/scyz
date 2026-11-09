<template>
  <PanelCard title="预警概览" custom-class="flex-1 min-h-0" body-class="px-3 py-2 flex flex-col">
    <!-- 顶部三级告警统计概览 -->
    <div class="grid grid-cols-3 gap-2 mb-2 shrink-0">
      <!-- 紧急告警 -->
      <div class="flex items-center gap-2 px-2 py-1.5 rounded bg-[#072247]/60 border border-[#ef4444]/25">
        <svg class="w-6 h-6 text-[#ef4444] shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
        <div>
          <div class="text-[10px] text-[#8ab4dc] leading-none">紧急告警</div>
          <div class="flex items-baseline gap-0.5 mt-1">
            <span class="num-highlight text-[14px] text-[#ef4444] leading-none">{{ data.urgent }}</span>
            <span class="text-[10px] text-[#7da8d6]">条</span>
          </div>
        </div>
      </div>

      <!-- 重要告警 -->
      <div class="flex items-center gap-2 px-2 py-1.5 rounded bg-[#072247]/60 border border-[#f59e0b]/25">
        <svg class="w-6 h-6 text-[#f59e0b] shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
        <div>
          <div class="text-[10px] text-[#8ab4dc] leading-none">重要告警</div>
          <div class="flex items-baseline gap-0.5 mt-1">
            <span class="num-highlight text-[14px] text-[#f59e0b] leading-none">{{ data.important }}</span>
            <span class="text-[10px] text-[#7da8d6]">条</span>
          </div>
        </div>
      </div>

      <!-- 一般告警 -->
      <div class="flex items-center gap-2 px-2 py-1.5 rounded bg-[#072247]/60 border border-[#eab308]/25">
        <svg class="w-6 h-6 text-[#facc15] shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
        <div>
          <div class="text-[10px] text-[#8ab4dc] leading-none">一般告警</div>
          <div class="flex items-baseline gap-0.5 mt-1">
            <span class="num-highlight text-[14px] text-[#facc15] leading-none">{{ data.normal }}</span>
            <span class="text-[10px] text-[#7da8d6]">条</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部预警列表 ElementPlus Table -->
    <div class="flex-1 min-h-0 overflow-hidden">
      <el-table :data="data.list" class="cockpit-table w-full" height="100%">
        <el-table-column prop="time" label="时间" width="76" />
        <el-table-column prop="content" label="预警内容" min-width="96" show-overflow-tooltip />
        <el-table-column prop="level" label="级别" width="46" align="center">
          <template #default="{ row }">
            <span
              class="px-1.5 py-0.5 rounded text-[10px]"
              :class="
                row.level === '重要'
                  ? 'bg-[#ef4444]/20 text-[#f87171]'
                  : 'bg-[#f59e0b]/20 text-[#fbbf24]'
              "
            >
              {{ row.level }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="52" align="right">
          <template #default="{ row }">
            <span :class="row.status === '已处理' ? 'text-[#22c55e]' : 'text-[#f59e0b]'">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import PanelCard from '@/components/PanelCard.vue'
import type { WarningRecordItem } from '@/mock/dashboardData'

defineProps<{
  data: {
    urgent: number
    important: number
    normal: number
    list: WarningRecordItem[]
  }
}>()
</script>

