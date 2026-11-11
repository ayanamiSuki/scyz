<template>
  <div class="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
    <!-- 主体三列内容区：左栏 + 中栏（陆基孪生基地+实时视频） + 右栏 -->
    <main class="flex-1 min-h-0 flex gap-2.5 px-3 pt-2 pb-2.5">
      <!-- 左侧栏：基地总览 + 环境监测 + 设备状态 -->
      <aside class="w-[440px] shrink-0 flex flex-col gap-2.5 h-full">
        <LeftOverview :data="farmData.overview" />
        <RightScale :data="farmData.baseIntro" />
        <LeftEnvMonitor :metrics="farmData.envMetrics" :trends="farmData.envTrends" />
        
      </aside>

      <!-- 中间主视觉栏：全景孪生基地 + 底部4路实时视频 -->
      <section class="flex-1 min-w-0 flex flex-col gap-2.5 h-full">
        <CenterStage :farm-name="farmData.name" :markers="farmData.markers" />
        <CenterVideos :videos="farmData.videos" />
      </section>

      <!-- 右侧栏：基地介绍 + 生长分析 + 投喂管理 + 预警概览 -->
      <aside class="w-[476px] shrink-0 flex flex-col gap-2.5 h-full">
        <LeftDevice :data="farmData.deviceStatus" />
        <!-- <RightGrowth :data="farmData.growth" /> -->
        <RightFeeding :data="farmData.feeding" />
        <RightWarning :data="farmData.warnings" />
      </aside>
    </main>
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

const props = defineProps<{
  farmId: string
}>()

const farmData = computed(() => DASHBOARD_DATA_MAP[props.farmId] || DASHBOARD_DATA_MAP['farm-1'])
</script>
