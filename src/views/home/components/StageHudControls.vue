<template>
  <!-- 左上角：3D 孪生场景状态与操作提示 -->
  <div class="absolute left-3.5 top-3 z-20 flex items-center gap-2 pointer-events-none">
    <div
      class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#051b3b]/80 border border-[#00c6ff]/35 backdrop-blur-sm text-[11px] text-[#bfe3ff]"
    >
      <span class="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
      <span>3D 实景孪生引擎</span>
      <span class="text-[#00e5ff]/60">|</span>
      <span class="text-[#7da8d6]">拖拽旋转 · 滚轮缩放 · 点击点位聚焦</span>
    </div>
  </div>

  <!-- 左下角：3D 视角与特效控制栏 -->
  <div class="absolute left-3.5 bottom-3.5 z-20 flex items-center gap-2">
    <button
      type="button"
      class="px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-sm border"
      :class="
        isAutoRotate
          ? 'bg-[#00a8ff]/30 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.3)]'
          : 'bg-[#051b3b]/80 border-[#00c6ff]/35 text-[#c8e4ff] hover:border-[#00e5ff]'
      "
      @click="$emit('toggle-auto-rotate')"
    >
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
      </svg>
      <span>{{ isAutoRotate ? '巡航中' : '自动巡航' }}</span>
    </button>

    <button
      type="button"
      class="px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5 bg-[#051b3b]/80 border border-[#00c6ff]/35 text-[#c8e4ff] hover:border-[#00e5ff] hover:text-[#00e5ff] transition-all cursor-pointer backdrop-blur-sm"
      @click="$emit('reset-camera')"
    >
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </svg>
      <span>全厂复位</span>
    </button>

    <button
      type="button"
      class="px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-sm border"
      :class="
        showPulseEffect
          ? 'bg-[#00a8ff]/25 border-[#00e5ff]/80 text-[#00e5ff]'
          : 'bg-[#051b3b]/80 border-[#00c6ff]/35 text-[#8ab4dc] hover:border-[#00e5ff]'
      "
      @click="$emit('toggle-pulse')"
    >
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="9" stroke-dasharray="3 3" />
        <circle cx="12" cy="12" r="4" />
      </svg>
      <span>循环水光效</span>
    </button>
  </div>

  <!-- 画面中下方：当前养殖基地名称铭牌 -->
  <div
    class="absolute left-1/2 bottom-3.5 -translate-x-1/2 z-10 px-4 py-1 rounded bg-[#051b3b]/80 border border-[#00c6ff]/40 backdrop-blur-sm text-[13px] font-semibold text-[#d8f0ff] tracking-wider pointer-events-none"
    style="box-shadow: 0 2px 12px rgba(0, 0, 0, 0.55)"
  >
    {{ farmName }} · 陆基循环水 3D 孪生基地
  </div>

  <!-- 右下角：公网安备与 ICP 备案信息 -->
  <div
    class="absolute right-3.5 bottom-3.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#051b3b]/80 border border-[#00c6ff]/35 backdrop-blur-sm text-[11px] text-[#8ab4dc]"
  >
    <img
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAoCAYAAACWwljjAAAFQklEQVRYw+3Wa1BUdRjH8SOpMeg4WhZGpDIxiaaTeUFgWrxE4AVRQJGlRRAVIV1JkbgMgQLi5AVBQSVLSp0xlEAUKBEEFZCrCstll8UV2AV2YbmoGCrYv31+R95UL5pmmtamZ+bz6rz5nvOc/5zDcX9jGLs/iTxuyvIlWYkRFeTHA2HVRFtzfhthTG5KuH96/vUgNlC4mMgyw1NJit/aAXLKazYje9xtIMZ/OZz50gW+9hcNkvoLEemEPbnrSP47QYwxQ5Ifv54RqzcXwFFvSyjaOhfavN8F7Y5ZcC/HH9JOB4LNa9Zw5YA76OZV8vIGMdZtSp7cDrtOnOavYiQhTAiPwi1AMtIQaqyngsxpBtw2GAGDKfaQmpUAa6xc4Vfp4UtEdzAMycsT9JQ1Tyctl/2eEkuTlYysF/rCUNxMqDEzgTqzSXBnpgnIHCzgjvEEuD52DLBr3rA1MAaWmNtB582wdtIljZ9G9D+IPU6aTxIPBjHCcXvg3CEh9K2fDLWvjIH6D6fwTIyheuwEqLUyhzLOALq8pkN+bgRw3HY4FBsMzxojZxP9DequLjAlQwVrbpIjhyIY4UYGQ/buhdBqPxlk3Gion2IMDQIz3kJe/ZS34I7uHkmD7VSQVgYDNyIAwsNCgfXGXoOBPjP9DKrOCAogA2etGTmTHAMcFwFZye7wS5QlVHGjoEw4A2qPCUBZ6AzNcQ5Q/YYRdO+YB1U3dsDwypLio4FJ3ECryIzWz6Cm3NgTRHN8HiPF6eHAGSbAdh8feFZkB7krzaHE9h2o85sDsiAbkIsXQMN+e2CtGyF0kzdwXCgU5++D/ouLQFV4OEU/g2Q/iNuIPNaKkQflAWBqexxGjhLDVUcL6IwSQN3SGVChe6FJg9dckCx6D1QBliDZLIAxo7eA8eyv4KE0BJqTrHkZvnL9DJKn+Twmt0NsGGHZy2Dn3kQYfsQ53Hh4/r4RNGz8AIpdzKEuaAF0RC2E57MmQgE3ATjuM/CPiANW7AqSfQJQ5vk362eQKmd3JrmXsoSRocpNIMnbB9zbceDIWUPmuHFQNMkISqa9DpUvNK6YDpW2s8DfwBK48WFQnhMCgzUBoLy0BrRVe5P0NWjPLdKUsJiR1tR1wGp8IeZwMgx/SrgRvjxuAziNcwLvyathLOcJHLflhRDYGRYFrNET2rJ5yvPLoas0tOj/oL8UpC4JHyTSU+6MNCS4gvKoAB5WiKG+MAQSg0WwLXQ/ZJ3xhao0FxB5hYCbUwAEfhEF3Td8QP2dAOQnPwFlxgrolUVq9TPoaX+ZB2nLc2Gk6awj1MU78HZZwJMid2Byb550JQwVO0NfxlJgdz14vWKeRAiK6DlQF28PLZdcoLNcBIO92bb6GTQ8Q/13RURT6tlH2gvXMlITLYD6uI+gp2ozdF0VQXumM6ivCqGvahM8kPiDItkeGo8tB025GFQ3xFrSr06zI3/4yde7oN7m0sWk5eKWDqK5JWJQvAHac9ygq3Adr9gTNNc3QG85rzPfHe5/7wDtPwuhp/Zz6CjyhaZzwi6ivfetHdH/oP77+3PJQOsuRnqkQdCa4wWqyx6gyecpL64GTaEX7ycXUJz4GJp1B4O0X/Hg0Xp1tFV+8Ei1k6c5coHofxBrrzQinbKYo0SVJ+wn6iurGHlY5gY911aDJnMFaHXXiDp9GQyvtKfUA9QFTtBZ7gPdit0tpFd9OpwwFmlA9D/o9yNLDpxIKmI8PMnNSNtviCLVpYTITzrXEGWaq4qos0WgOPdpCenIF+eRrurjB4k0PXopYZG6gMg/D/gNBUxhAbSAmKMAAAAASUVORK5CYII="
      alt=""
      class="w-4 h-4 shrink-0"
    />
    <a
      href="https://beian.mps.gov.cn/#/query/webSearch?code=52011502009461"
      rel="noreferrer"
      target="_blank"
      class="text-[#8ab4dc] hover:text-[#00e5ff] no-underline transition-colors"
    >
      贵公网安备52011502009461
    </a>
    <a
      href="https://beian.miit.gov.cn/"
      target="_blank"
      class="ml-3 text-[#8ab4dc] hover:text-[#00e5ff] no-underline transition-colors"
    >
      黔ICP备2024041452号-1
    </a>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  farmName: string
  isAutoRotate: boolean
  showPulseEffect: boolean
}>()

defineEmits<{
  (e: 'toggle-auto-rotate'): void
  (e: 'reset-camera'): void
  (e: 'toggle-pulse'): void
}>()
</script>

