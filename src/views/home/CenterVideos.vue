<template>
  <PanelCard
    title="实时视频"
    more-text="全部视频"
    custom-class="h-[172px] shrink-0"
    body-class="px-3 py-2"
    @more="togglePlayAll"
  >
    <div class="grid grid-cols-6 gap-2.5 h-full">
      <div
        v-for="video in videos"
        :key="video.id"
        class="relative rounded overflow-hidden border border-[#00a8ff]/35 hover:border-[#00e5ff] cursor-pointer group bg-[#04152f] flex flex-col"
        @click="toggleVideoItem(video.id)"
      >
        <!-- 视频画面或裁剪缩略图 -->
        <div class="relative flex-1 min-h-0 overflow-hidden">
          <video
            v-if="playingMap[video.id]"
            :src="video.videoUrl"
            :poster="video.cover"
            autoplay
            loop
            muted
            playsinline
            class="w-full h-full object-cover block"
          />
          <img
            v-else
            :src="video.cover"
            :alt="video.name"
            class="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-300"
          />

          <!-- 播放状态角标 -->
          <div
            v-if="playingMap[video.id]"
            class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 border border-[#22c55e]/60 flex items-center gap-1 text-[9px] text-[#4ade80]"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span>LIVE</span>
          </div>

          <!-- 悬浮播放提示层 -->
          <div
            v-else
            class="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <div class="w-7 h-7 rounded-full bg-[#00e5ff]/80 text-[#021024] flex items-center justify-center shadow">
              <svg class="w-4 h-4 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 底部通道名称栏（还原原型底部深色半透明条） -->
        <div class="h-[22px] px-2 bg-[#041633]/90 border-t border-[#00a8ff]/20 flex items-center justify-between shrink-0">
          <span class="text-[11px] text-[#d6ecff] truncate">{{ video.name }}</span>
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="playingMap[video.id] ? 'bg-[#00e5ff]' : 'bg-[#22c55e]/70'"
          />
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import PanelCard from '@/components/PanelCard.vue'
import type { VideoFeedItem } from '@/mock/dashboardData'

const props = defineProps<{
  videos: VideoFeedItem[]
}>()

// 记录每个视频卡片是否正在播放1秒测试视频
const playingMap = reactive<Record<string, boolean>>({})

const toggleVideoItem = (id: string) => {
  playingMap[id] = !playingMap[id]
}

const togglePlayAll = () => {
  const allPlaying = props.videos.every((v) => playingMap[v.id])
  props.videos.forEach((v) => {
    playingMap[v.id] = !allPlaying
  })
  ElMessage.success(!allPlaying ? '已开启全部 6 路实时监控测试视频流' : '已切换为封面缩略图模式')
}
</script>

