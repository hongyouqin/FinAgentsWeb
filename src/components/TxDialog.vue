<template>
  <el-dialog
    v-model="showTxDialog"
    title="算力记录"
    :width="isMobile ? '95vw' : '680px'"
    :align-center="!isMobile"
    destroy-on-close
  >
    <div class="tx-dialog">
      <!-- 类型切换 + 刷新 -->
      <div class="tx-toolbar">
        <div class="tx-tabs">
          <div
            v-for="tab in txTypeTabs"
            :key="tab.value"
            class="tx-tab"
            :class="{ active: txType === tab.value }"
            @click="selectTxType(tab.value)"
          >
            {{ tab.label }}
          </div>
        </div>
        <el-button text size="small" :loading="txLoading" @click="loadTransactions">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <!-- 列表 -->
      <div v-loading="txLoading" class="tx-list-wrap">
        <!-- PC 表格 -->
        <el-table
          v-if="!isMobile"
          :data="txList"
          class="tx-table"
          stripe
          max-height="440"
          style="width:100%"
        >
          <el-table-column label="时间" prop="created_at" width="175">
            <template #default="{ row }">
              <span class="tx-time">{{ row.created_at }}</span>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="getTxTypeTag(row.type)" size="small" round>
                {{ getTxTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="算力变动" width="110" align="right">
            <template #default="{ row }">
              <span class="tx-amount" :class="row.type === 'RECHARGE' ? 'tx-in' : 'tx-out'">
                {{ row.type === 'RECHARGE' ? '+' : '-' }}{{ row.amount }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="剩余算力" width="110" align="right">
            <template #default="{ row }">
              <span v-if="row.after_balance !== null" class="tx-balance">{{ row.after_balance }}</span>
              <span v-else class="tx-balance-na">—</span>
            </template>
          </el-table-column>
          <el-table-column label="说明" min-width="160" prop="description">
            <template #default="{ row }">
              <span class="tx-desc">{{ row.description || '—' }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 移动端卡片 -->
        <div v-else class="tx-mobile-list">
          <div v-for="item in txList" :key="item.id" class="tx-mobile-item">
            <div class="tx-mobile-top">
              <el-tag :type="getTxTypeTag(item.type)" size="small" round>{{ getTxTypeText(item.type) }}</el-tag>
              <span class="tx-amount" :class="item.type === 'RECHARGE' ? 'tx-in' : 'tx-out'">
                {{ item.type === 'RECHARGE' ? '+' : '-' }}{{ item.amount }} ⚡
              </span>
            </div>
            <div class="tx-mobile-desc">{{ item.description || '—' }}</div>
            <div class="tx-mobile-bot">
              <span class="tx-time">{{ item.created_at }}</span>
              <span v-if="item.after_balance !== null" class="tx-balance">剩余：{{ item.after_balance }}</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="txList.length === 0 && !txLoading" class="tx-empty">
          <el-icon class="empty-icon"><List /></el-icon>
          <p>暂无算力流水记录</p>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { Refresh, List } from '@element-plus/icons-vue'
import { useTxDialog } from '@/composables/useTxDialog'

const { width: windowWidth } = useWindowSize()
const isMobile = computed(() => windowWidth.value <= 768)

const {
  showTxDialog,
  txLoading,
  txType,
  txList,
  txTypeTabs,
  loadTransactions,
  selectTxType,
  getTxTypeTag,
  getTxTypeText,
} = useTxDialog()
</script>

<style lang="scss" scoped>
.tx-dialog { padding: 4px 0; }

.tx-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}

.tx-tabs {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.tx-tab {
  padding: 6px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  user-select: none;
  &:hover { color: #0f172a; background: rgba(255,255,255,0.6); }
  &.active {
    background: white;
    color: #06b6d4;
    font-weight: 600;
    box-shadow: 0 1px 6px rgba(0,0,0,0.1);
  }
}

.tx-list-wrap { min-height: 200px; }

.tx-table {
  border-radius: 12px;
  overflow: hidden;
  :deep(th) { background: #f8fafc !important; color: #475569; font-weight: 600; }
}

.tx-time { font-size: 12px; color: #64748b; }
.tx-amount {
  font-size: 14px;
  font-weight: 700;
  &.tx-in { color: #059669; }
  &.tx-out { color: #ef4444; }
}
.tx-balance { font-size: 13px; color: #1e293b; font-weight: 500; }
.tx-balance-na { color: #cbd5e1; }
.tx-desc { font-size: 13px; color: #475569; }

.tx-mobile-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 56vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-right: 2px;
}
.tx-mobile-item { padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; }
.tx-mobile-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.tx-mobile-desc { font-size: 12px; color: #64748b; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tx-mobile-bot {
  display: flex;
  justify-content: space-between;
  .tx-time { font-size: 11px; color: #94a3b8; }
  .tx-balance { font-size: 11px; color: #059669; font-weight: 600; }
}
.tx-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;
  .empty-icon { font-size: 40px; color: #cbd5e1; margin-bottom: 10px; }
  p { margin: 0; font-size: 14px; }
}

@media (max-width: 768px) {
  .tx-dialog { padding: 0; }
  .tx-toolbar { flex-wrap: wrap; gap: 8px; }
  .tx-list-wrap { min-height: 120px; }
  .tx-empty { padding: 36px 16px; .empty-icon { font-size: 32px; } }
}

@media (max-width: 480px) {
  .tx-toolbar { flex-wrap: wrap; }
  .tx-tabs { width: 100%; justify-content: stretch; .tx-tab { flex: 1; text-align: center; padding: 6px 10px; } }
  .tx-mobile-list { max-height: 52vh; }
  .tx-mobile-item { padding: 10px 12px; }
}
</style>
