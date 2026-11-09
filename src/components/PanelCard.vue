<template>
  <section class="cockpit-panel flex flex-col" :class="customClass">
    <header class="cockpit-panel-header shrink-0">
      <div class="cockpit-panel-title">
        <span>{{ title }}</span>
      </div>
      <div class="flex items-center gap-2">
        <slot name="extra">
          <span
            v-if="showArrow"
            class="text-[#6ca0d4] hover:text-[#00e5ff] cursor-pointer text-xs flex items-center gap-0.5 transition-colors"
            @click="$emit('more')"
          >
            <span v-if="moreText" class="text-[11px]">{{ moreText }}</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </slot>
      </div>
    </header>
    <div class="flex-1 min-h-0 relative" :class="bodyClass">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title: string
  showArrow?: boolean
  moreText?: string
  customClass?: string
  bodyClass?: string
}

withDefaults(defineProps<Props>(), {
  showArrow: true,
  moreText: '',
  customClass: '',
  bodyClass: 'p-3'
})

defineEmits<{
  (e: 'more'): void
}>()
</script>

