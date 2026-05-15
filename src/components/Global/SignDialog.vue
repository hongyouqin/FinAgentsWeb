<template>
  <el-dialog
    v-model="signStore.dialogVisible"
    width="400px"
    :show-close="false"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    class="sign-dialog"
    @close="signStore.closeDialog()"
    destroy-on-close
  >
    <template #header>
      <div class="sign-header">
        <el-icon class="sign-header-icon"><Calendar /></el-icon>
        <span class="sign-header-title">每日签到</span>
        <button class="sign-close-btn" @click="signStore.closeDialog()">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </template>

    <div class="sign-body">
      <!-- 状态指示区 -->
      <div class="sign-status-area" :class="{ signed: signStore.signed }">
        <!-- 未签到：礼物图标 -->
        <div v-if="!signStore.signed" class="status-icon-wrap unsigned">
          <el-icon class="status-icon"><Present /></el-icon>
        </div>
        <!-- 已签到：勾选图标 + 动画 -->
        <div v-else class="status-icon-wrap signed-anim">
          <div class="success-check">✓</div>
          <div v-if="signStore.lastResult" class="success-particles">
            <span v-for="i in 6" :key="i" class="particle" :style="{ '--delay': `${i * 0.08}s`, '--angle': `${i * 60}deg` }" />
          </div>
        </div>
      </div>

      <!-- 状态文案 -->
      <div class="sign-status-text">
        <template v-if="!signStore.signed">
          <div class="status-main">签到可得 <span class="reward-num">{{ rewardAmount }}</span> 算力</div>
          <div class="status-sub">点击下方按钮领取今日奖励</div>
        </template>
        <template v-else>
          <div class="status-main success"><span class="reward-num">{{ rewardAmount }}</span> 算力领取成功</div>
          <div class="status-sub">明日记得再来哦 ~</div>
        </template>
      </div>

      <!-- 签到按钮 -->
      <button
        class="sign-btn"
        :class="{ signed: signStore.signed, animating: signStore.animating }"
        :disabled="signStore.signed || signStore.animating || !signStore.canSign"
        @click="handleSign"
      >
        <template v-if="signStore.signed">
          <el-icon class="btn-icon-check"><CircleCheckFilled /></el-icon>
          <span>今日已签到</span>
        </template>
        <template v-else-if="signStore.animating">
          <span class="btn-loading" />
          <span>签到中...</span>
        </template>
        <template v-else>
          <span>立即签到</span>
        </template>
      </button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Close, Calendar, Present, CircleCheckFilled } from '@element-plus/icons-vue'
import { useSignStore } from '@/stores/sign'
import { useAuthStore } from '@/stores/auth'

const signStore = useSignStore()
const authStore = useAuthStore()

/** 签到奖励算力金额：优先用接口返回值，其次默认 1.5 */
const rewardAmount = computed(() => {
  const v = signStore.lastResult?.reward_points
  if (typeof v === 'number' && v > 0) return v
  return 1.5
})

const handleSign = async () => {
  const ok = await signStore.doSign()
  if (ok) {
    // 刷新积分余额
    authStore.fetchUserBalance()
  }
}
</script>

<style lang="scss" scoped>
// ─── 弹窗覆盖 ─────────────────────────────────
:deep(.el-dialog) {
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18) !important;
}

:deep(.el-dialog__header) {
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.el-dialog__body) {
  padding: 0 !important;
}

// ─── Header ──────────────────────────────────────
.sign-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 24px 12px;
  position: relative;

  .sign-header-icon {
    font-size: 22px;
    color: #06b6d4;
  }

  .sign-header-title {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    flex: 1;
  }

  .sign-close-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: rgba(100, 116, 139, 0.08);
    color: #94a3b8;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      background: rgba(100, 116, 139, 0.15);
      color: #64748b;
    }
  }
}

// ─── Body ────────────────────────────────────────
.sign-body {
  padding: 8px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

// ─── 积分余额 ────────────────────────────────────
// 状态指示区
.sign-status-area {
  position: relative;
  padding: 12px 0 4px;

  .status-icon-wrap {
    position: relative;
    width: 88px;
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.unsigned {
      background: linear-gradient(135deg, #cffafe, #a5f3fc);
      border-radius: 50%;
      box-shadow: 0 8px 24px rgba(6, 182, 212, 0.18);

      .status-icon {
        font-size: 44px;
        color: #0891b2;
      }
    }
  }

  .signed-anim {
    .success-check {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
      font-size: 40px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: successPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);
    }

    .success-particles {
      position: absolute;
      inset: 0;

      .particle {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #fbbf24;
        animation: particleBurst 0.6s ease-out var(--delay) both;
      }
    }
  }
}

// 状态文案
.sign-status-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;

  .status-main {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;

    &.success {
      color: #16a34a;
    }

    .reward-num {
      font-size: 22px;
      font-weight: 800;
      color: #f59e0b;
      margin: 0 2px;
    }
  }

  .status-sub {
    font-size: 13px;
    color: #94a3b8;
  }
}

// ─── 签到状态提示 ────────────────────────────────
.signed-hint,
.unsigned-hint {
  display: none;
}

// ─── 签到按钮 ────────────────────────────────────
.sign-btn {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: white;
  box-shadow: 0 4px 16px rgba(6, 182, 212, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(6, 182, 212, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &.signed {
    background: #f1f5f9;
    color: #94a3b8;
    box-shadow: none;
    cursor: default;

    .btn-icon-check {
      color: #22c55e;
      font-size: 18px;
    }
  }

  &.animating {
    opacity: 0.8;
  }

  .btn-loading {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// ─── 提示 ─────────────────────────────────────────
.sign-tip {
  display: none;
}

// ─── 签到成功 ────────────────────────────────────
.sign-success-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  width: 100%;
}

.success-anim {
  position: relative;
  width: 80px;
  height: 80px;

  .success-check {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    font-size: 36px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: successPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);
  }

  .success-particles {
    position: absolute;
    inset: 0;

    .particle {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #fbbf24;
      animation: particleBurst 0.6s ease-out var(--delay) both;

      &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: inherit;
      }
    }
  }
}

@keyframes successPop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes particleBurst {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
  100% {
    transform: translate(
      calc(-50% + cos(var(--angle)) * 50px),
      calc(-50% + sin(var(--angle)) * 50px)
    ) scale(1);
    opacity: 0;
  }
}

.success-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  .reward-amount {
    font-size: 28px;
    font-weight: 800;
    color: #f59e0b;
    animation: rewardBounce 0.6s ease-out;
  }

  .reward-label {
    font-size: 13px;
    color: #94a3b8;
  }
}

@keyframes rewardBounce {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.success-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  background: #f8fafc;
  border-radius: 14px;
  width: 100%;
  justify-content: center;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      font-size: 11px;
      color: #94a3b8;
    }
  }
}

// ─── 过渡动画 ────────────────────────────────────
.sign-success-enter-active {
  transition: all 0.4s ease-out;
}
.sign-success-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>
