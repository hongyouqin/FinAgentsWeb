# 外链分发内容库

> 本目录存放 **nbstockai.com / TradingAgents 中文版** 的外链分发素材。所有文章都基于 `/guide/*` 的 7 篇原稿改写（≥30% 差异率），避开搜索引擎重复内容判罚。

## 两周发布 SOP（与规划对齐）

| 周次 | 日期 | 平台 | 文件 | 工时 |
|---|---|---|---|---|
| W1 | Day1-2 | 知乎 | 养号（点赞/收藏/关注）+ 搜 3 个目标问题先收藏 | 1h/天 |
| W1 | Day3 | CSDN | `csdn/01-multi-agent-architecture.md` | 2h |
| W1 | Day4 | CSDN | `csdn/02-ai-stock-tools-2026.md` | 2h |
| W1 | Day5 | CSDN | `csdn/03-deepseek-vs-qwen.md` | 2h |
| W1 | Day6-7 | 知乎 | `zhihu/01-deepseek-stock-answer.md` | 3h |
| W2 | Day1 | 掘金 | `juejin/01-multi-agent-architecture.md` | 1.5h |
| W2 | Day1 | 掘金 | `juejin/02-deepseek-vs-qwen-benchmark.md` | 1.5h |
| W2 | Day2 | 掘金 | `juejin/03-prompt-engineering-maotai.md` | 1.5h |
| W2 | Day3 | 知乎 | `zhihu/02-ai-stock-worth-it-answer.md` | 3h |
| W2 | Day4 | 博客园 | `cnblogs/01-tradingagents-practice.md` | 1h |
| W2 | Day4 | 博客园 | `cnblogs/02-ai-backtest-notes.md` | 1h |
| W2 | Day5 | 简书 | `jianshu/01-ai-stock-tools-for-retail.md` | 1h |
| W2 | Day5 | 简书 | `jianshu/02-ai-stock-myth.md` | 1h |
| W2 | Day6-7 | 站长 | 复盘：`site:nbstockai.com` 收录数 / 百度排名 | 1h |

## 关键规则

### 1. 锚文本多样化（必做）

同一批外链不要都用同一个锚词。按下表轮换：

| 锚文本 | 目标 URL | 使用频次上限 |
|---|---|---|
| TradingAgents 中文版 | `/` | 3 次 |
| AI 股票分析 | `/` | 2 次 |
| nbstockai.com（裸链） | `/` | 不限 |
| 多智能体 AI | `/guide/multi-agent-stock` | 2 次 |
| DeepSeek 炒股 | `/guide/deepseek-stock-analysis` | 2 次 |
| 千问股票分析 | `/guide/qwen-stock-analysis` | 2 次 |
| AI 研报 Prompt | `/guide/maotai-ai-analysis` | 2 次 |
| AI 股票工具对比 | `/guide/ai-stock-tool-compare-2026` | 2 次 |

### 2. 标题改写要求（必做）

每篇的平台重写标题都不一样，避免"同名多发"被判作弊。

### 3. 引流规范

- 文末可放 **1 个主链接** + 可选 1 个辅助链接
- 中间正文最多插 1 个内链（配合锚文本）
- 图片水印用 `nbstockai.com`（不露 QR 码）

### 4. 防重复检测

每篇在发布前，把正文粘进 [https://www.zhanzhang.baidu.com/](https://ziyuan.baidu.com/) 的"站点比对"查一下，差异率低于 30% 需再改写。

## 目录结构

```
external-posts/
├── README.md                    ← 你现在看的这份
├── csdn/
│   ├── 01-multi-agent-architecture.md     ← W1 Day3
│   ├── 02-ai-stock-tools-2026.md          ← W1 Day4
│   └── 03-deepseek-vs-qwen.md             ← W1 Day5
├── zhihu/
│   ├── 01-deepseek-stock-answer.md        ← W1 Day6-7
│   └── 02-ai-stock-worth-it-answer.md     ← W2 Day3
├── juejin/
│   ├── 01-multi-agent-architecture.md     ← W2 Day1
│   ├── 02-deepseek-vs-qwen-benchmark.md   ← W2 Day1
│   └── 03-prompt-engineering-maotai.md    ← W2 Day2
├── cnblogs/
│   ├── 01-tradingagents-practice.md       ← W2 Day4
│   └── 02-ai-backtest-notes.md            ← W2 Day4
└── jianshu/
    ├── 01-ai-stock-tools-for-retail.md    ← W2 Day5
    └── 02-ai-stock-myth.md                ← W2 Day5
```

## 发布后记录模板

每发一篇，往下面表格追加一行，方便后续复盘排名：

| 发布日 | 平台 | 文章标题 | 发布 URL | 锚文本 | 目标落地页 | 7 日阅读 | 7 日排名查询 |
|---|---|---|---|---|---|---|---|
| 2026-05-04 | CSDN | … | … | … | … | … | … |

## 风险提示

1. **新账号必须先养号**：新号当天发带外链文章会被秒删。知乎/CSDN 建议注册满 7 天后再发。
2. **一天别发超过 2 条**：单平台单日多发容易被判批量推广。
3. **评论区主动互动**：发完后每天回复 1-2 个评论，能有效提升推荐权重。
4. **不要刷赞**：百度/平台都能识别，反而降权。

---

> 本目录内容仅用于 nbstockai.com 自家品牌的合规内容营销，所有文章观点基于实际产品功能，不涉及误导性宣传。
