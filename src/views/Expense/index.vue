<template>
  <div class="expense-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-bg">
        <div class="glow-effect glow-1" />
        <div class="glow-effect glow-2" />
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <el-icon><Wallet /></el-icon>
          <span>管理员面板</span>
        </div>
        <h1 class="hero-title">收支账本</h1>
        <p class="hero-subtitle">记录与管理平台收入、支出，按月扎帐，清晰掌握财务状况</p>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">

      <!-- 月份选择 + 扎帐概览 -->
      <div class="month-bar">
        <el-date-picker
          v-model="currentMonth"
          type="month"
          placeholder="选择月份"
          format="YYYY-MM"
          value-format="YYYY-MM"
          @change="onMonthChange"
          style="width: 160px"
        />
        <el-button type="primary" :icon="Plus" @click="openDialog()">新增记录</el-button>
      </div>

      <!-- 扎帐概览卡片 -->
      <div class="summary-cards">
        <div class="summary-card income">
          <div class="card-icon"><el-icon><Top /></el-icon></div>
          <div class="card-info">
            <span class="card-value">¥{{ formatMoney(settlement?.total_income) }}</span>
            <span class="card-label">总收入</span>
          </div>
        </div>
        <div class="summary-card expense">
          <div class="card-icon"><el-icon><Bottom /></el-icon></div>
          <div class="card-info">
            <span class="card-value">¥{{ formatMoney(settlement?.total_expense) }}</span>
            <span class="card-label">总支出</span>
          </div>
        </div>
        <div class="summary-card balance">
          <div class="card-icon"><el-icon><Wallet /></el-icon></div>
          <div class="card-info">
            <span class="card-value">¥{{ formatMoney(settlement?.balance) }}</span>
            <span class="card-label">结余</span>
          </div>
        </div>
        <div class="summary-card count">
          <div class="card-icon"><el-icon><Document /></el-icon></div>
          <div class="card-info">
            <span class="card-value">{{ settlement?.record_count ?? 0 }}</span>
            <span class="card-label">记录数（收入 {{ settlement?.income_count ?? 0 }} / 支出 {{ settlement?.expense_count ?? 0 }}）</span>
          </div>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-select v-model="filterType" placeholder="收支类型" clearable style="width: 120px" @change="fetchRecords">
          <el-option label="收入" value="income" />
          <el-option label="支出" value="expense" />
        </el-select>
        <el-input v-model="filterCategory" placeholder="分类筛选" clearable style="width: 140px" @clear="fetchRecords" @keyup.enter="fetchRecords" />
        <el-button :icon="Refresh" @click="fetchRecords">刷新</el-button>
      </div>

      <!-- 记录表格 -->
      <el-table :data="records" v-loading="tableLoading" stripe style="width: 100%" empty-text="暂无记录">
        <el-table-column label="类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.record_type === 'income' ? 'success' : 'danger'" size="small" effect="plain">
              {{ row.record_type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" min-width="120" show-overflow-tooltip />
        <el-table-column label="金额" width="120" align="right">
          <template #default="{ row }">
            <span :class="row.record_type === 'income' ? 'text-income' : 'text-expense'">
              {{ row.record_type === 'income' ? '+' : '-' }}¥{{ formatMoney(row.amount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column label="日期" width="120" align="center">
          <template #default="{ row }">{{ row.record_date?.slice(0, 10) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-popconfirm title="确定删除该记录？" @confirm="handleDelete(row._id)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          background
          @current-change="fetchRecords"
        />
      </div>

      <!-- 分类汇总 -->
      <div class="category-section" v-if="categorySummary.length">
        <h3 class="section-title">分类汇总（{{ currentMonth }}）</h3>
        <div class="category-chips">
          <div class="category-chip" v-for="item in categorySummary" :key="item.category">
            <span class="chip-name">{{ item.category }}</span>
            <span class="chip-amount">¥{{ formatMoney(item.total_amount) }}</span>
            <el-progress :percentage="item.percentage" :stroke-width="6" :show-text="false" style="width: 80px" />
            <span class="chip-pct">{{ item.percentage }}%</span>
          </div>
        </div>
      </div>

    </div>

    <!-- 新增/编辑弹框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑记录' : '新增记录'"
      width="460px"
      destroy-on-close
      align-center
    >
      <el-form :model="form" label-width="72px" ref="formRef" :rules="formRules">
        <el-form-item label="类型" prop="record_type">
          <el-radio-group v-model="form.record_type">
            <el-radio value="income">收入</el-radio>
            <el-radio value="expense">支出</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-input v-model="form.category" placeholder="如：充值、token消耗、服务器" />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="form.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
        <el-form-item label="日期" prop="record_date">
          <el-date-picker
            v-model="form.record_date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh, Top, Bottom, Wallet, Document } from '@element-plus/icons-vue'
import expenseApi from '@/api/expense'
import type { ExpenseRecord, MonthlySettlement, CategorySummaryItem } from '@/api/expense'
import type { FormInstance, FormRules } from 'element-plus'

// ---- 状态 ----
const currentMonth = ref(getDefaultMonth())
const records = ref<ExpenseRecord[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const tableLoading = ref(false)
const settlement = ref<MonthlySettlement | null>(null)
const categorySummary = ref<CategorySummaryItem[]>([])

// 筛选
const filterType = ref<string>('')
const filterCategory = ref('')

// 弹框
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  record_type: 'expense' as 'income' | 'expense',
  category: '',
  amount: 0,
  description: '',
  record_date: new Date().toISOString().slice(0, 10) + 'T00:00:00',
})

const formRules: FormRules = {
  record_type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  record_date: [{ required: true, message: '请选择日期', trigger: 'change' }],
}

// ---- 方法 ----
function getDefaultMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatMoney(val?: number) {
  if (val == null) return '0.00'
  return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function onMonthChange() {
  currentPage.value = 1
  fetchAll()
}

function fetchAll() {
  fetchRecords()
  fetchSettlement()
  fetchCategorySummary()
}

async function fetchRecords() {
  tableLoading.value = true
  try {
    const res = await expenseApi.getRecords({
      year_month: currentMonth.value,
      record_type: (filterType.value as any) || undefined,
      category: filterCategory.value || undefined,
      page: currentPage.value,
      page_size: pageSize,
    })
    const data = res.data ?? res
    records.value = data.items ?? []
    total.value = data.total ?? 0
  } catch (e) {
    console.error(e)
  } finally {
    tableLoading.value = false
  }
}

async function fetchSettlement() {
  try {
    const res = await expenseApi.getMonthlySettlement(currentMonth.value)
    settlement.value = res.data ?? null
  } catch (e) {
    console.error(e)
  }
}

async function fetchCategorySummary() {
  try {
    const res = await expenseApi.getCategorySummary(currentMonth.value)
    categorySummary.value = res.data ?? []
  } catch (e) {
    console.error(e)
  }
}

function openDialog(row?: ExpenseRecord) {
  if (row) {
    isEdit.value = true
    editId.value = row._id
    form.record_type = row.record_type
    form.category = row.category
    form.amount = row.amount
    form.description = row.description
    form.record_date = row.record_date
  } else {
    isEdit.value = false
    editId.value = ''
    form.record_type = 'expense'
    form.category = ''
    form.amount = 0
    form.description = ''
    form.record_date = new Date().toISOString().slice(0, 10) + 'T00:00:00'
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await expenseApi.updateRecord(editId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await expenseApi.createRecord({ ...form })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchAll()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(id: string) {
  try {
    await expenseApi.deleteRecord(id)
    ElMessage.success('删除成功')
    fetchAll()
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败')
  }
}

onMounted(() => fetchAll())
</script>

<style lang="scss" scoped>
.expense-page {
  .hero-section {
    position: relative;
    padding: 48px 24px 36px;
    overflow: hidden;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }
  .hero-bg {
    position: absolute; inset: 0; overflow: hidden;
    .glow-effect {
      position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.25;
      &.glow-1 { width: 300px; height: 300px; background: #6366f1; top: -80px; left: 10%; }
      &.glow-2 { width: 240px; height: 240px; background: #06b6d4; bottom: -60px; right: 15%; }
    }
  }
  .hero-content { position: relative; max-width: 1400px; margin: 0 auto; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(99, 102, 241, 0.15); color: #818cf8;
    padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-bottom: 12px;
    border: 1px solid rgba(99, 102, 241, 0.3);
  }
  .hero-title { font-size: 28px; font-weight: 700; color: #f1f5f9; margin: 0 0 8px; }
  .hero-subtitle { font-size: 14px; color: #94a3b8; margin: 0; }

  .content-wrapper {
    max-width: 1400px; margin: 0 auto; padding: 24px;
  }

  .month-bar {
    display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
  }

  // 概览卡片
  .summary-cards {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
  }
  .summary-card {
    display: flex; align-items: center; gap: 14px;
    background: #fff; border-radius: 12px; padding: 18px 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f1f5f9;
    .card-icon {
      width: 44px; height: 44px; border-radius: 10px; display: flex;
      align-items: center; justify-content: center; font-size: 20px;
    }
    .card-info { display: flex; flex-direction: column; }
    .card-value { font-size: 20px; font-weight: 700; line-height: 1.2; }
    .card-label { font-size: 12px; color: #64748b; margin-top: 2px; }
    &.income .card-icon { background: rgba(34,197,94,0.1); color: #16a34a; }
    &.income .card-value { color: #16a34a; }
    &.expense .card-icon { background: rgba(239,68,68,0.1); color: #dc2626; }
    &.expense .card-value { color: #dc2626; }
    &.balance .card-icon { background: rgba(99,102,241,0.1); color: #6366f1; }
    &.balance .card-value { color: #6366f1; }
    &.count .card-icon { background: rgba(14,165,233,0.1); color: #0284c7; }
    &.count .card-value { color: #0284c7; }
  }

  // 筛选栏
  .filter-bar {
    display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;
  }

  .text-income { color: #16a34a; font-weight: 600; }
  .text-expense { color: #dc2626; font-weight: 600; }

  .pagination-wrapper {
    display: flex; justify-content: center; margin-top: 20px;
  }

  // 分类汇总
  .category-section {
    margin-top: 28px;
    .section-title { font-size: 15px; font-weight: 600; color: #334155; margin-bottom: 12px; }
  }
  .category-chips {
    display: flex; flex-wrap: wrap; gap: 12px;
  }
  .category-chip {
    display: flex; align-items: center; gap: 10px;
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
    padding: 10px 16px; min-width: 220px;
    .chip-name { font-size: 13px; color: #334155; font-weight: 500; min-width: 60px; }
    .chip-amount { font-size: 14px; font-weight: 700; color: #0f172a; min-width: 70px; text-align: right; }
    .chip-pct { font-size: 12px; color: #64748b; min-width: 38px; text-align: right; }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .expense-page {
    .hero-section { padding: 32px 16px 24px; }
    .hero-title { font-size: 22px; }
    .content-wrapper { padding: 16px; }
    .summary-cards { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .summary-card .card-value { font-size: 16px; }
  }
}

@media (max-width: 480px) {
  .expense-page {
    .summary-cards { grid-template-columns: 1fr; }
    .month-bar { flex-direction: column; align-items: stretch; }
    .filter-bar { flex-direction: column; align-items: stretch; }
    .category-chip { min-width: 100%; }
  }
}
</style>
