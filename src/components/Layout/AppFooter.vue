<template>
  <div class="app-footer">
    <div class="footer-content">
      <div class="copyright">
        <span>© 2026 FinAgents rights reserved.</span>
        <!-- <span class="rights">All rights reserved.</span> -->
      </div>
      <div class="disclaimer-text">
        FinAgents 是一款由人工智能驱动的多智能体股票分析辅助工具，不具备证券投资咨询资质。平台内提供的所有分析结果、评分及参考意见，均由 AI 基于公开历史数据自动生成，仅供学习、研究及技术交流使用，不构成任何形式的投资建议或决策依据。

股票市场受多种因素影响，存在市场风险、流动性风险、政策风险等，投资者可能面临本金损失的风险。用户应基于自身风险承受能力独立审慎决策。因使用本工具所产生的任何投资行为及其后果，均由用户自行承担。

市场有风险，投资需谨慎。
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Footer组件逻辑
</script>

<style lang="scss" scoped>
.app-footer {
  .footer-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 6px;
    color: var(--el-text-color-regular);
    font-size: 14px;
    padding: 12px 16px;
    text-align: center;
  }

  .rights {
    margin-left: 4px;
  }

  .disclaimer-text {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.6;
    max-width: 1100px;
  }
}
</style>

