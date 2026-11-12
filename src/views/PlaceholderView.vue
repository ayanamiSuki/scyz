<template>
  <div class="flex-1 min-h-0 flex items-center justify-center p-8">
    <div class="cockpit-panel w-[520px] p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/40 flex items-center justify-center text-[#00e5ff]">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-white tracking-wider mb-2">
        {{ route.meta.title || '功能模块' }}
      </h2>
      <p class="text-xs text-[#8ab4dc] mb-6">
        当前路由模块为预留空页面，核心可视化大屏功能已集成于【首页】。
      </p>
      <div class="flex items-center justify-center gap-3">
        <router-link
          to="/"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#0088ff]/30 hover:bg-[#00a8ff]/50 border border-[#00e5ff]/60 text-xs text-white no-underline transition-all"
        >
          <span>返回驾驶舱首页</span>
        </router-link>
        <router-link
          to="/data-manage"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#00e5ff]/20 hover:bg-[#00e5ff]/30 border border-[#00e5ff] text-xs text-[#00e5ff] no-underline transition-all"
        >
          <span>进入数据配置管理</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

