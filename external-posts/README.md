# 外链分发内容库

> 本目录存放 **nbstockai.com / TradingAgents 中文版** 的外链分发素材。所有文章都基于 `/guide/*` 的 7 篇原稿改写（≥30% 差异率），避开搜索引擎重复内容判罚。

## 两周发布 SOP（与规划对齐）

| 周次 | 日期 | 平台 | 文件 | 工时 |
|---|---|---|---|---|
| W1 | Day1-2 | 知乎 | 养号（点赞/收藏/关注）+ 搜 3 个目标问题先收藏 | 1h/天 | ✅ Day1-2 已完成 |
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

## 收录基线记录

| 日期 | `site:nbstockai.com` 收录数 | 已收录页面 | 备注 |
|---|---|---|---|
| 2026-05-06 | 1 | 首页 `www.nbstockai.com/` | SEO 基建首日基线，知乎养号 Day1 完成 |

## 任务排期（具体日历）

> 以 2026-05-06（周三）为 Day1 起算，全期 13 天。默认每天 19:00–21:00 是发布 / 互动默认时段（资讯类高峰、推荐权重高）。

| 日期 | 周几 | 阶段 | 平台 | 主任务 | 关键动作 | 预计工时 |
|---|---|---|---|---|---|---|
| 2026-05-06 | 三 | W1 Day1 | 知乎 + CSDN | 养号 + 基线 | 点赞/收藏/关注、收藏 3 个目标问题、CSDN 账号准备、记录 site 收录 | 1h | ✅ |
| 2026-05-07 | 四 | W1 Day2 | 知乎 + CSDN | 互动 + 软贴 | 评论高赞回答、1 条软回答（DS vs ChatGPT）、CSDN 水文铺垫 | 1h | ✅ |
| **2026-05-08** | **五** | **W1 Day3** | **CSDN** | **发首篇硬稿** | 发布 `csdn/01-multi-agent-architecture.md`、标题重写、文末 1 主链（锚文本：多智能体 AI → `/guide/multi-agent-stock`） | 2h | ⏳ |
| 2026-05-09 | 六 | W1 Day4 | CSDN | 发第二篇 | 发布 `csdn/02-ai-stock-tools-2026.md`、锚文本：AI 股票工具对比 → `/guide/ai-stock-tool-compare-2026`、上篇评论区回复 1–2 条 | 2h | ⏳ |
| 2026-05-10 | 日 | W1 Day5 | CSDN | 发第三篇 | 发布 `csdn/03-deepseek-vs-qwen.md`、锚文本：DeepSeek 炒股 → `/guide/deepseek-stock-analysis`、首页裸链补 1 个 | 2h | ⏳ |
| 2026-05-11 | 一 | W1 Day6 | 知乎 | 起草回答 | 起草 `zhihu/01-deepseek-stock-answer.md`、打磨开头 100 字钩子、间插 1 内链 | 1.5h | ⏳ |
| 2026-05-12 | 二 | W1 Day7 | 知乎 | 发布回答 | 完稿发布 zhihu 01、文末锚文本：TradingAgents 中文版 → `/`、发后 30min 内主动评论区回复 | 1.5h | ⏳ |
| 2026-05-13 | 三 | W2 Day1 | 掘金 | 双发 01+02 | 发布 `juejin/01-multi-agent-architecture.md` + `juejin/02-deepseek-vs-qwen-benchmark.md`（间隔7h）、锚文本错开 | 3h | ⏳ |
| 2026-05-14 | 四 | W2 Day2 | 掘金 | 发 03 | 发布 `juejin/03-prompt-engineering-maotai.md`、锚文本：AI 研报 Prompt → `/guide/maotai-ai-analysis` | 1.5h | ⏳ |
| 2026-05-15 | 五 | W2 Day3 | 知乎 | 第二条回答 | 发布 `zhihu/02-ai-stock-worth-it-answer.md`、锚文本：AI 股票分析 → `/`、评论区互动 | 3h | ⏳ |
| 2026-05-16 | 六 | W2 Day4 | 博客园 | 双发 01+02 | 发布 `cnblogs/01-tradingagents-practice.md` + `cnblogs/02-ai-backtest-notes.md`（间隔4h） | 2h | ⏳ |
| 2026-05-17 | 日 | W2 Day5 | 简书 | 双发 01+02 | 发布 `jianshu/01-ai-stock-tools-for-retail.md` + `jianshu/02-ai-stock-myth.md`（间隔4h）、裸链为主 | 2h | ⏳ |
| 2026-05-18 | 一 | W2 Day6 | 站长 | 复盘上 | 查 `site:nbstockai.com` 收录增量、统计各平台 7 日阅读量、补百度资源提交 | 1h | ⏳ |
| 2026-05-19 | 二 | W2 Day7 | 站长 | 复盘下 | 查目标关键词排名（不超 5 个）、汇总问题与下轮调整 | 1h | ⏳ |

### 高优先级提醒

- **Day3（2026-05-08）是首篇硬稿起点**，是 W1 最关键的一天：标题 / 锦文本 / 发布时间点都会影响后续评估。
- **周六日发文**（Day5 / Day9　Day12）阅读高峰推后到 20:00。
- **复盘日不要发文**（Day13-14），专心收集数据。
- 若某天赶不上，**额外 1 天补上**不要同日补发（避免单平台超 2 条被判推广）。

### 执行状态检查表

- [x] **W1 Day1**（2026-05-06）：知乎养号（点赞/收藏/关注）+ 搜 3 个目标问题收藏 + CSDN 账号准备 + 收录基线记录（1 个）
- [x] **W1 Day2**（2026-05-07）：知乎目标问题互动（点赞/评论高赞回答）+ 关注 AI/量化相关话题与大 V + 知乎发软回答 1 条（DeepSeek vs ChatGPT）+ CSDN 发水文铺垫 1 条（多智能体架构随笔）
- [ ] **W1 Day3**（2026-05-08）：CSDN 发布 `csdn/01-multi-agent-architecture.md`
- [ ] **W1 Day4**（2026-05-09）：CSDN 发布 `csdn/02-ai-stock-tools-2026.md`
- [ ] **W1 Day5**（2026-05-10）：CSDN 发布 `csdn/03-deepseek-vs-qwen.md`
- [ ] **W1 Day6**（2026-05-11）：知乎起草 `zhihu/01-deepseek-stock-answer.md`
- [ ] **W1 Day7**（2026-05-12）：知乎发布 zhihu 01
- [ ] **W2 Day1**（2026-05-13）：掘金发布 01 + 02
- [ ] **W2 Day2**（2026-05-14）：掘金发布 03
- [ ] **W2 Day3**（2026-05-15）：知乎发布 zhihu 02
- [ ] **W2 Day4**（2026-05-16）：博客园发布 01 + 02
- [ ] **W2 Day5**（2026-05-17）：简书发布 01 + 02
- [ ] **W2 Day6**（2026-05-18）：复盘收录数 + 阅读量
- [ ] **W2 Day7**（2026-05-19）：复盘排名 + 下轮调整

## 风险提示

1. **新账号必须先养号**：新号当天发带外链文章会被秒删。知乎/CSDN 建议注册满 7 天后再发。
2. **一天别发超过 2 条**：单平台单日多发容易被判批量推广。
3. **评论区主动互动**：发完后每天回复 1-2 个评论，能有效提升推荐权重。
4. **不要刷赞**：百度/平台都能识别，反而降权。

---

> 本目录内容仅用于 nbstockai.com 自家品牌的合规内容营销，所有文章观点基于实际产品功能，不涉及误导性宣传。
