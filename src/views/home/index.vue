<template>
  <div class="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
    <!-- 主体三列内容区：左栏 + 中栏（海景孪生+实时视频） + 右栏 -->
    <main class="flex-1 min-h-0 flex gap-2.5 px-3 pt-2 pb-1.5">
      <!-- 左侧栏：园区总览 + 环境监测 + 设备状态 -->
      <aside class="w-[330px] shrink-0 flex flex-col gap-2.5 h-full">
        <LeftOverview :data="farmData.overview" />
        <LeftEnvMonitor :metrics="farmData.envMetrics" :trends="farmData.envTrends" />
        <LeftDevice :data="farmData.deviceStatus" />
      </aside>

      <!-- 中间主视觉栏：全景孪生海景 + 底部6路实时视频 -->
      <section class="flex-1 min-w-0 flex flex-col gap-2.5 h-full">
        <CenterStage :farm-name="farmData.name" :markers="farmData.markers" />
        <CenterVideos :videos="farmData.videos" />
      </section>

      <!-- 右侧栏：养殖规模分析 + 生长分析 + 投喂管理 + 预警概览 -->
      <aside class="w-[348px] shrink-0 flex flex-col gap-2 h-full">
        <RightScale :data="farmData.scaleAnalysis" />
        <RightGrowth :data="farmData.growth" />
        <RightFeeding :data="farmData.feeding" />
        <RightWarning :data="farmData.warnings" />
      </aside>
    </main>

    <!-- 底部7项关键指标横栏 -->
    <BottomSummary :items="farmData.bottomSummary" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DASHBOARD_DATA_MAP } from '@/mock/dashboardData'
import LeftOverview from './LeftOverview.vue'
import LeftEnvMonitor from './LeftEnvMonitor.vue'
import LeftDevice from './LeftDevice.vue'
import CenterStage from './CenterStage.vue'
import CenterVideos from './CenterVideos.vue'
import RightScale from './RightScale.vue'
import RightGrowth from './RightGrowth.vue'
import RightFeeding from './RightFeeding.vue'
import RightWarning from './RightWarning.vue'
import BottomSummary from './BottomSummary.vue'

const props = defineProps<{
  farmId: string
}>()

const farmData = computed(() => DASHBOARD_DATA_MAP[props.farmId] || DASHBOARD_DATA_MAP['farm-1'])
</script>

