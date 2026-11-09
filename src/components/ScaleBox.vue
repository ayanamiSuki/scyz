<template>
  <div class="w-screen h-screen overflow-hidden bg-[#020916] relative flex items-center justify-center">
    <div
      ref="scaleRef"
      class="shrink-0 origin-center transition-transform duration-150 ease-out relative overflow-hidden"
      :style="{
        width: `${width}px`,
        height: `${height}px`,
        transform: `scale(${scaleX}, ${scaleY})`
      }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  width?: number
  height?: number
  /** 是否保持严格等比缩放（默认 true，在16:9如3840x2160大屏下恰好2倍满屏无黑边） */
  keepRatio?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 1920,
  height: 1080,
  keepRatio: true
})

const scaleX = ref(1)
const scaleY = ref(1)

const updateScale = () => {
  const ww = window.innerWidth / props.width
  const wh = window.innerHeight / props.height
  if (props.keepRatio) {
    const s = Math.min(ww, wh)
    scaleX.value = s
    scaleY.value = s
  } else {
    scaleX.value = ww
    scaleY.value = wh
  }
}

onMounted(() => {
  updateScale()
  window.addEventListener('resize', updateScale)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScale)
})
</script>

