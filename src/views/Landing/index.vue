<script setup lang="ts">
import HeroSection from './components/HeroSection.vue'
import FeaturesSection from './components/FeaturesSection.vue'
import TechSection from './components/TechSection.vue'
import CTASection from './components/CTASection.vue'
</script>

<template>
  <div class="landing-page">
    <!-- Hero 区 -->
    <HeroSection />

    <!-- 功能介绍区 -->
    <FeaturesSection />

    <!-- 技术优势区 -->
    <TechSection />

    <!-- CTA 区 -->
    <CTASection />
  </div>
</template>

<style scoped lang="scss">
.landing-page {
  width: 100%;
  overflow-x: hidden;
  background: #0f172a;
}
</style>
