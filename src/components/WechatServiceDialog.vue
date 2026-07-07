<template>
  <el-dialog
    v-model="visible"
    title="交流与客服"
    width="460px"
    align-center
    destroy-on-close
    class="wechat-service-dialog"
  >
    <div class="wechat-service-body">
      <!-- 两个二维码并排 -->
      <div class="qrcode-row">
        <!-- 客服二维码 -->
        <div class="qrcode-item">
          <div class="qrcode-wrap">
            <img :src="qhyQrCode" alt="客服二维码" />
          </div>
          <div class="qrcode-label">客服微信</div>
          <div class="qrcode-desc">1 对 1 咨询服务</div>
        </div>
        <!-- 群二维码 -->
        <div class="qrcode-item">
          <div class="qrcode-wrap">
            <img src="/assets/wxqyercoe.png" alt="进群二维码" />
          </div>
          <div class="qrcode-label">投资交流群</div>
          <div class="qrcode-desc">每日热点 · 研报福利</div>
        </div>
      </div>
      <p class="service-tip">扫码添加客服或进群，获取最新资讯与交流支持</p>
      <p class="service-sub">如无法扫码，可截图后打开微信识别</p>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import qhyQrCode from '../../assets/qhy.png'

defineOptions({ name: 'WechatServiceDialog' })

const visible = ref(false)

function open() {
  visible.value = true
}

function close() {
  visible.value = false
}

defineExpose({ open, close })
</script>

<style scoped lang="scss">
.wechat-service-dialog {
  .wechat-service-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 0 16px;
  }

  // 两码并排容器
  .qrcode-row {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-bottom: 16px;
    width: 100%;
  }

  .qrcode-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .qrcode-wrap {
    width: 150px;
    height: 150px;
    padding: 8px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 6px;
    }
  }

  .qrcode-label {
    margin-top: 10px;
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
  }

  .qrcode-desc {
    margin-top: 2px;
    font-size: 12px;
    color: #64748b;
    line-height: 1.4;
    text-align: center;
  }

  .service-tip {
    font-size: 13px;
    color: #475569;
    margin: 0 0 8px;
    text-align: center;
    line-height: 1.5;
  }

  .service-sub {
    font-size: 12px;
    color: #94a3b8;
    margin: 0;
  }
}

// 移动端适配：窄屏纵向堆叠
@media (max-width: 480px) {
  .wechat-service-dialog {
    .qrcode-row {
      flex-direction: column;
      gap: 16px;
    }

    .qrcode-wrap {
      width: 160px;
      height: 160px;
      margin: 0 auto;
    }
  }
}
</style>
