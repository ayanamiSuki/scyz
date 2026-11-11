<template>
  <PanelCard
    title="实时视频"
    more-text="播放第一天"
    custom-class="h-[248px] shrink-0"
    body-class="px-3 py-2.5"
    @more="openVideoDialog(localVideos[0])"
  >
    <!-- 一排 5 个视频卡片栅格布局 -->
    <div class="grid grid-cols-5 gap-2.5 h-full">
      <div
        v-for="video in localVideos"
        :key="video.id"
        class="relative rounded overflow-hidden border border-[#00a8ff]/30 hover:border-[#00e5ff] cursor-pointer group bg-[#04152f] flex flex-col transition-all duration-200 hover:shadow-[0_0_14px_rgba(0,229,255,0.25)]"
        @click="openVideoDialog(video)"
      >
        <!-- 视频首帧缩略图区域 -->
        <div class="relative flex-1 min-h-0 overflow-hidden bg-black/50">
          <img
            v-if="thumbnails[video.id]"
            :src="thumbnails[video.id]"
            :alt="video.name"
            class="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-300"
          />
          <video
            v-else
            :src="video.videoUrl + '#t=0.001'"
            preload="metadata"
            muted
            playsinline
            class="w-full h-full object-cover block pointer-events-none group-hover:scale-105 transition-transform duration-300"
          />

          <!-- 悬浮播放指示图标 -->
          <div
            class="play-mask absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <!-- 播放按钮主体 -->
            <div
              class="play-core relative w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            >
              <!-- 向外扩散的呼吸光环 -->
              <span class="play-halo absolute inset-0 rounded-full border border-[#00e5ff]/50" />
              <!-- 缓慢旋转的虚线环 -->
              <span class="play-dash absolute -inset-[5px] rounded-full border border-dashed border-[#00e5ff]/35" />

              <div
                class="relative w-full h-full rounded-full flex items-center justify-center border border-[#00e5ff]/90 bg-[#021024]/60 backdrop-blur-[2px] shadow-[0_0_16px_rgba(0,229,255,0.5),inset_0_0_14px_rgba(0,229,255,0.28)] transition-all duration-300 group-hover:bg-[#00e5ff] group-hover:shadow-[0_0_26px_rgba(0,229,255,0.9),inset_0_0_10px_rgba(255,255,255,0.35)]"
              >
                <svg
                  class="w-[15px] h-[15px] translate-x-[1.5px] text-[#00e5ff] drop-shadow-[0_0_6px_rgba(0,229,255,0.85)] transition-colors duration-300 group-hover:text-[#021024] group-hover:drop-shadow-none"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            <!-- 操作提示文字 -->
            <span
              class="text-[10px] leading-none tracking-[0.18em] pl-[0.18em] text-[#d5f1ff] drop-shadow-[0_0_6px_rgba(0,229,255,0.7)]"
            >
              点击播放
            </span>
          </div>
        </div>

        <!-- 底部视频对应名称栏 -->
        <div
          class="h-[30px] px-2.5 bg-[#041633]/95 border-t border-[#00a8ff]/25 flex items-center justify-between shrink-0"
        >
          <span class="text-[13px] font-medium text-[#d6ecff] tracking-wide truncate">{{ video.name }}</span>
          <span class="flex items-center gap-1 text-[11px] text-[#00e5ff]/85">
            <span class="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
            <span>回放</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 800*600 居中视频播放弹窗 -->
    <Teleport to="body">
      <div
        v-if="activeDialogVideo"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm"
        @click.self="closeDialog"
      >
        <div
          class="w-[800px] h-[600px] rounded-lg border border-[#00c6ff]/60 bg-[#04152f] flex flex-col shadow-[0_0_48px_rgba(0,180,255,0.4)] overflow-hidden"
        >
          <!-- 弹窗顶栏 -->
          <div
            class="h-[46px] px-4 bg-gradient-to-r from-[#061d3f] to-[#041630] border-b border-[#00a8ff]/30 flex items-center justify-between shrink-0 select-none"
          >
            <div class="flex items-center gap-2.5">
              <span class="w-2.5 h-2.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] animate-pulse" />
              <span class="text-[15px] font-semibold text-[#e2f3ff] tracking-wide">
                {{ activeDialogVideo.name }} · 视频回放
              </span>
            </div>

            <button
              type="button"
              class="w-7 h-7 rounded flex items-center justify-center text-[#7ea9d4] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="关闭 (Esc)"
              @click="closeDialog"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 弹窗主体视频播放区 -->
          <div class="flex-1 min-h-0 bg-black flex items-center justify-center relative">
            <video
              ref="dialogVideoRef"
              :src="activeDialogVideo.videoUrl"
              controls
              autoplay
              playsinline
              class="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </PanelCard>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import PanelCard from '@/components/PanelCard.vue'

import videoDay1 from './assets/第一天.mp4'
import videoDay5 from './assets/第五天.mp4'
import videoDay9 from './assets/第九天.mp4'
import videoDay14 from './assets/第十四天.mp4'
import videoDay22 from './assets/第二十二天.mp4'

interface VideoItem {
  id: string
  name: string
  videoUrl: string
}

defineProps<{
  videos?: unknown[]
}>()

const localVideos: VideoItem[] = [
  { id: 'v1', name: '第一天', videoUrl: videoDay1 },
  { id: 'v2', name: '第五天', videoUrl: videoDay5 },
  { id: 'v3', name: '第九天', videoUrl: videoDay9 },
  { id: 'v4', name: '第十四天', videoUrl: videoDay14 },
  { id: 'v5', name: '第二十二天', videoUrl: videoDay22 }
]

const thumbnails = reactive<Record<string, string>>({})
const activeDialogVideo = ref<VideoItem | null>(null)
const dialogVideoRef = ref<HTMLVideoElement | null>(null)

// 提取视频第一帧作为缩略图海报
function captureFirstFrame(videoItem: VideoItem) {
  const video = document.createElement('video')
  video.src = videoItem.videoUrl
  video.crossOrigin = 'anonymous'
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'

  let captured = false
  const takeShot = () => {
    if (captured) return
    try {
      const w = video.videoWidth || 320
      const h = video.videoHeight || 180
      if (w > 0 && h > 0) {
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
          if (dataUrl && dataUrl.length > 100) {
            thumbnails[videoItem.id] = dataUrl
            captured = true
          }
        }
      }
    } catch {
      // 容错处理：若 Canvas 导出受限，模板有原生 video #t=0.001 兜底
    }
  }

  video.addEventListener('loadeddata', () => {
    video.currentTime = 0.05
  })
  video.addEventListener('seeked', () => {
    takeShot()
    video.remove()
  })
  video.addEventListener('error', () => {
    video.remove()
  })
}

const openVideoDialog = (video: VideoItem) => {
  activeDialogVideo.value = video
}

const closeDialog = () => {
  if (dialogVideoRef.value) {
    dialogVideoRef.value.pause()
    dialogVideoRef.value.currentTime = 0
  }
  activeDialogVideo.value = null
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && activeDialogVideo.value) {
    closeDialog()
  }
}

onMounted(() => {
  localVideos.forEach((v) => captureFirstFrame(v))
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
/* 悬浮遮罩：四周轻暗角 + 顶部青色微光，突出播放按钮 */
.play-mask {
  background: radial-gradient(
      circle at 50% 48%,
      rgba(0, 10, 26, 0.42) 0%,
      rgba(0, 10, 26, 0.5) 55%,
      rgba(0, 8, 20, 0.7) 100%
    ),
    linear-gradient(180deg, rgba(0, 229, 255, 0.1) 0%, transparent 50%);
}

/* 扩散光环 */
@keyframes play-halo {
  0% {
    transform: scale(0.95);
    opacity: 0.75;
  }
  70% {
    transform: scale(1.55);
    opacity: 0;
  }
  100% {
    transform: scale(1.55);
    opacity: 0;
  }
}

/* 虚线环旋转 */
@keyframes play-dash-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.play-halo {
  animation: play-halo 2.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

.play-dash {
  animation: play-dash-spin 9s linear infinite;
}
</style>
