<script setup lang="ts">
interface Props {
  size?: number | string
  showText?: boolean
  showBadge?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 32,
  showText: false,
  showBadge: false
})

// 计算尺寸
const logoSize = computed(() => {
  if (typeof props.size === 'number') {
    return `${props.size}px`
  }
  return props.size
})
</script>

<template>
  <div class="logo-wrapper">
    <svg 
      class="logo-svg" 
      :style="{ width: logoSize, height: logoSize }"
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 外层六边形边框 -->
      <path 
        d="M16 2L28 9L28 23L16 30L4 23L4 9Z" 
        stroke="url(#logoGradient1)" 
        stroke-width="1.5" 
        fill="none" 
        stroke-linejoin="round"
      />
      
      <!-- 上升折线 -->
      <path 
        d="M7 24L10 20L13 22L16 17L19 19L22 14L25 16L28 12" 
        stroke="url(#logoGradient2)" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      
      <!-- 渐变定义 -->
      <defs>
        <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06b6d4" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
        <linearGradient id="logoGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#06b6d4" />
          <stop offset="50%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>

    <!-- 可选文字 -->
    <span v-if="showText" class="logo-text">FinAgents</span>
    
    <!-- 可选徽章 -->
    <span v-if="showBadge" class="logo-badge">AI</span>
  </div>
</template>

<style scoped lang="scss">
.logo-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-svg {
  flex-shrink: 0;
  filter: drop-shadow(0 0 12px rgba(6, 182, 212, 0.3));
  transition: filter 0.3s ease;

  &:hover {
    filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.5));
  }
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.logo-badge {
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 6px;
  letter-spacing: 0.05em;
}
</style>
