<template>
  <el-dialog
    v-model="visible"
    title="交流与客服"
    width="380px"
    align-center
    destroy-on-close
    class="wechat-service-dialog"
  >
    <div class="wechat-service-body">
      <div class="qrcode-wrap">
        <img src="/assets/wxqyercoe.png" alt="企业微信二维码" />
      </div>
      <p class="service-tip">扫码添加企业微信，回复「进群」加入投资交流群</p>
      <div class="service-benefits">
        <span class="benefit-tag">1 对 1 客服</span>
        <span class="benefit-tag">每日热点</span>
        <span class="benefit-tag">研报福利</span>
      </div>
      <p class="service-sub">如无法扫码，可截图后打开微信识别</p>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
    padding: 8px 0 16px;
  }

  .service-tip {
    font-size: 14px;
    color: #1e293b;
    margin: 0 0 16px;
    text-align: center;
    line-height: 1.5;
  }

  .qrcode-wrap {
    width: 220px;
    height: 220px;
    padding: 12px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 8px;
    }
  }

  .service-benefits {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;

    .benefit-tag {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      font-size: 12px;
      color: #059669;
      background: rgba(5, 150, 105, 0.08);
      border: 1px solid rgba(5, 150, 105, 0.2);
      border-radius: 100px;
    }
  }

  .service-sub {
    font-size: 12px;
    color: #94a3b8;
    margin: 0;
  }
}
</style>
