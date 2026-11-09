<template>
  <ScaleBox :width="1920" :height="1080" :keep-ratio="true">
    <div
      class="w-[1920px] h-[1080px] flex flex-col overflow-hidden relative"
      style="background: radial-gradient(circle at 50% 42%, #072652 0%, #041531 55%, #020b1b 100%);"
    >
      <!-- 顶部导航与主标题栏 -->
      <TopHeader
        v-model:current-farm-id="currentFarmId"
        @search="onSearch"
      />

      <!-- 路由视图容器 -->
      <router-view v-slot="{ Component }">
        <component :is="Component" :farm-id="currentFarmId" />
      </router-view>
    </div>
  </ScaleBox>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import ScaleBox from '@/components/ScaleBox.vue'
import TopHeader from '@/components/TopHeader.vue'

const currentFarmId = ref('farm-1')

const onSearch = (kw: string) => {
  ElMessage.success(`已检索关键字：“${kw}”，匹配到当前园区相关监控点位`)
}
</script>

