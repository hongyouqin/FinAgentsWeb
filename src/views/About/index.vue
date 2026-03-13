<template>
  <div class="about">
    123
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  TrendCharts,
  Search,
  Files,
  Document,
  Monitor,
  Setting,
  Message,
  ChatDotRound,
  Cpu,
  Star,
  Link,
  CircleCheck
} from '@element-plus/icons-vue'

const router = useRouter()
const buildTime = ref(new Date().toLocaleString('zh-CN'))

// 粒子背景
const particles = ref<Array<{ x: number; y: number; size: number; opacity: number }>>([])
const initParticles = () => {
  particles.value = Array.from({ length: 25 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.15
  }))
}

onMounted(() => {
  initParticles()
})

const goToAnalysis = () => {
  router.push('/analysis/single')
}

const viewDocumentation = () => {
  window.open('https://mp.weixin.qq.com/s/ppsYiBncynxlsfKFG8uEbw', '_blank')
}
</script>

<style lang="scss" scoped>
@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

@keyframes scan-move {
  0% { top: -2px; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}

.about {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;

  // Hero Section
  .hero-section {
    background: radial-gradient(ellipse at top, #164e63 0%, #0f172a 55%, #020617 100%);
    border-radius: 20px;
    padding: 60px 40px;
    margin-bottom: 48px;
    color: white;
    position: relative;
    overflow: hidden;

    .hero-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
      overflow: hidden;
    }

    .particles-container {
      position: absolute;
      inset: 0;
    }

    .particle {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
      pointer-events: none;
    }

    .grid-overlay {
      position: absolute;
      inset: -50px;
      background-image:
        linear-gradient(rgba(6, 182, 212, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(6, 182, 212, 0.08) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: grid-move 20s linear infinite;
    }

    .scan-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.6), transparent);
      animation: scan-move 8s ease-in-out infinite;
      z-index: 1;
    }

    .glow-effect {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      animation: glow-pulse 4s ease-in-out infinite;
      pointer-events: none;

      &.glow-1 {
        width: 400px;
        height: 400px;
        background: rgba(6, 182, 212, 0.15);
        top: -100px;
        left: -100px;
        animation-delay: 0s;
      }

      &.glow-2 {
        width: 350px;
        height: 350px;
        background: rgba(59, 130, 246, 0.12);
        bottom: -80px;
        right: -80px;
        animation-delay: 2s;
      }
    }

    .hero-content {
      display: flex;
      align-items: center;
      gap: 60px;
      position: relative;
      z-index: 2;
    }

    .hero-text {
      flex: 1;

      .hero-title {
        font-size: 48px;
        font-weight: 700;
        margin: 0 0 16px 0;
        line-height: 1.2;

        .version-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          margin-left: 16px;
          backdrop-filter: blur(10px);
        }
      }

      .hero-subtitle {
        font-size: 24px;
        font-weight: 500;
        margin: 0 0 16px 0;
        opacity: 0.9;
      }

      .hero-description {
        font-size: 16px;
        line-height: 1.6;
        margin: 0 0 20px 0;
        opacity: 0.8;
        max-width: 600px;
      }

      .hero-acknowledgment {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 32px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        max-width: 600px;

        .el-icon {
          font-size: 16px;
          color: #ffd700;
        }

        a {
          color: white;
          text-decoration: none;
          font-weight: 500;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;

          &:hover {
            border-bottom-color: white;
          }
        }
      }

      .hero-actions {
        display: flex;
        gap: 16px;

        .el-button {
          padding: 12px 24px;
          font-size: 16px;
          border-radius: 8px;

          &.el-button--primary {
            background: white;
            color: #06b6d4;
            border: none;

            &:hover {
              background: rgba(255, 255, 255, 0.9);
              transform: translateY(-2px);
            }
          }

          &:not(.el-button--primary) {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);

            &:hover {
              background: rgba(255, 255, 255, 0.2);
              transform: translateY(-2px);
            }
          }
        }
      }
    }

    .hero-visual {
      .hero-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border-radius: 16px;
        padding: 32px;
        border: 1px solid rgba(255, 255, 255, 0.2);

        .hero-stats {
          display: flex;
          gap: 24px;

          .stat-item {
            text-align: center;

            .stat-number {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 8px;
            }

            .stat-label {
              font-size: 14px;
              opacity: 0.8;
            }
          }
        }
      }
    }
  }

  // Section Headers
  .section-header {
    text-align: center;
    margin-bottom: 48px;

    .section-title {
      font-size: 36px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      margin: 0 0 16px 0;
    }

    .section-subtitle {
      font-size: 18px;
      color: var(--el-text-color-regular);
      margin: 0;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
  }

  // Features Section
  .features-section {
    margin-bottom: 80px;

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;

      .feature-card {
        background: var(--el-bg-color);
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid var(--el-border-color-lighter);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-success));
        }

        &:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .feature-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;

          .feature-icon {
            width: 56px;
            height: 56px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;

            &.primary {
              background: linear-gradient(135deg, #059669, #06b6d4);
            }

            &.success {
              background: linear-gradient(135deg, var(--el-color-success), #52c41a);
            }

            &.warning {
              background: linear-gradient(135deg, var(--el-color-warning), #faad14);
            }

            &.info {
              background: linear-gradient(135deg, var(--el-color-info), #1890ff);
            }

            &.danger {
              background: linear-gradient(135deg, var(--el-color-danger), #ff4d4f);
            }
          }

          h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #1a202c;
          }
        }

        p {
          color: var(--el-text-color-regular);
          line-height: 1.6;
          margin: 0 0 20px 0;
        }

        .feature-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .el-tag {
            border-radius: 12px;
            border: none;
            font-size: 12px;
          }
        }
      }
    }
  }

  // Origin Section
  .origin-section {
    margin-bottom: 80px;

    .origin-content {
      max-width: 900px;
      margin: 0 auto;

      .origin-card {
        background: var(--el-bg-color);
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid var(--el-border-color-lighter);
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #059669, #06b6d4);
        }

        .origin-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid var(--el-border-color-lighter);

          .origin-icon {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            background: linear-gradient(135deg, #059669, #06b6d4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            color: white;
            flex-shrink: 0;
          }

          .origin-info {
            flex: 1;

            h3 {
              margin: 0 0 8px 0;
              font-size: 24px;
              font-weight: 700;
              color: var(--el-text-color-primary);
            }

            .origin-link {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              color: var(--el-color-primary);
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
              transition: all 0.3s ease;

              .el-icon {
                font-size: 14px;
              }

              &:hover {
                color: #06b6d4;
                text-decoration: underline;
              }
            }
          }
        }

        .origin-description {
          p {
            color: var(--el-text-color-regular);
            line-height: 1.8;
            margin: 0 0 20px 0;
            font-size: 15px;

            strong {
              color: var(--el-text-color-primary);
              font-weight: 600;
            }
          }

          .origin-improvements {
            list-style: none;
            padding: 0;
            margin: 24px 0;

            li {
              display: flex;
              align-items: flex-start;
              gap: 12px;
              padding: 12px 0;
              color: var(--el-text-color-regular);
              line-height: 1.6;
              font-size: 15px;

              .check-icon {
                color: var(--el-color-success);
                font-size: 18px;
                margin-top: 2px;
                flex-shrink: 0;
              }

              strong {
                color: var(--el-text-color-primary);
                font-weight: 600;
              }
            }
          }

          .origin-thanks {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 32px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(59, 130, 246, 0.08));
            border-radius: 12px;
            border-left: 4px solid #06b6d4;
            font-size: 15px;
            color: var(--el-text-color-regular);

            .el-icon {
              color: #ffd700;
              font-size: 20px;
              flex-shrink: 0;
            }

            strong {
              color: var(--el-text-color-primary);
              font-weight: 600;
            }
          }
        }
      }
    }
  }

  // Tech Section
  .tech-section {
    margin-bottom: 80px;

    .tech-stack {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 32px;

      .tech-category {
        background: var(--el-bg-color);
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid var(--el-border-color-lighter);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .tech-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;

          .tech-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: white;

            &.frontend {
              background: linear-gradient(135deg, #42b883, #35495e);
            }

            &.backend {
              background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            }

            &.ai {
              background: linear-gradient(135deg, #a55eea, #26de81);
            }
          }

          h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #1a202c;
          }
        }

        .tech-list {
          .tech-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid var(--el-border-color-extra-light);

            &:last-child {
              border-bottom: none;
            }

            .tech-name {
              font-weight: 500;
              color: #1a202c;
            }

            .tech-desc {
              font-size: 14px;
              color: var(--el-text-color-regular);
            }
          }
        }
      }
    }
  }

  // Version Section
  .version-section {
    margin-bottom: 80px;

    .version-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;

      .version-card {
        background: linear-gradient(135deg, #059669 0%, #06b6d4 100%);
        border-radius: 16px;
        padding: 32px;
        color: white;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .version-main {
          text-align: center;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;

          .version-number {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .version-status {
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 16px;
            border-radius: 20px;
            font-size: 14px;
            display: inline-block;
            backdrop-filter: blur(10px);
          }
        }

        .version-details {
          position: relative;
          z-index: 1;

          .version-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);

            &:last-child {
              border-bottom: none;
            }

            .label {
              opacity: 0.8;
            }

            .value {
              font-weight: 500;
            }
          }
        }
      }

      .framework-info {
        background: var(--el-bg-color);
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid var(--el-border-color-lighter);

        h4 {
          margin: 0 0 24px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1a202c;
        }

        .framework-list {
          .framework-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid var(--el-border-color-extra-light);

            &:last-child {
              border-bottom: none;
            }

            .name {
              font-weight: 500;
              color: #1a202c;
            }

            .version {
              background: var(--el-color-primary-light-9);
              color: var(--el-color-primary);
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
  // Contact Section
  .contact-section {
    margin-bottom: 80px;

    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;

      .contact-card {
        background: var(--el-bg-color);
        border-radius: 16px;
        padding: 32px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid var(--el-border-color-lighter);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .contact-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 24px;
          color: white;

          &.email {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          }

          &.qq {
            background: linear-gradient(135deg, #12c2e9, #c471ed);
          }

          &.wechat {
            background: linear-gradient(135deg, #07c160, #00d4aa);
          }

          &.docs {
            background: linear-gradient(135deg, #059669, #06b6d4);
          }
        }

        h4 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1a202c;
        }

        p {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 500;
          color: #1a202c;

          .doc-link {
            color: var(--el-color-primary);
            text-decoration: none;
            font-weight: 500;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .contact-desc {
          font-size: 14px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }

  // Footer Section
  .footer-section {
    text-align: center;
    padding: 40px 0;
    border-top: 1px solid var(--el-border-color-extra-light);
    color: var(--el-text-color-regular);

    .footer-content {
      p {
        margin: 8px 0;
        font-size: 14px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .about {
    .version-section .version-info {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 768px) {
  .about {
    padding: 0 16px;

    .hero-section {
      padding: 40px 24px;

      .hero-content {
        flex-direction: column;
        gap: 32px;
        text-align: center;
      }

      .hero-text {
        .hero-title {
          font-size: 36px;

          .version-badge {
            display: block;
            margin: 16px auto 0;
            width: fit-content;
          }
        }

        .hero-subtitle {
          font-size: 20px;
        }

        .hero-actions {
          justify-content: center;
          flex-wrap: wrap;
        }
      }
    }

    .section-header {
      .section-title {
        font-size: 28px;
      }

      .section-subtitle {
        font-size: 16px;
      }
    }

    .features-section .features-grid {
      grid-template-columns: 1fr;
    }

    .tech-section .tech-stack {
      grid-template-columns: 1fr;
    }

    .contact-section .contact-grid {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 480px) {
  .about {
    .hero-section {
      padding: 32px 20px;

      .hero-text {
        .hero-title {
          font-size: 28px;
        }

        .hero-subtitle {
          font-size: 18px;
        }

        .hero-actions {
          .el-button {
            padding: 10px 20px;
            font-size: 14px;
          }
        }
      }
    }

    .features-section .features-grid .feature-card {
      padding: 24px;
    }

    .tech-section .tech-stack .tech-category {
      padding: 24px;
    }

    .contact-section .contact-grid .contact-card {
      padding: 24px;
    }
  }
}
</style>
