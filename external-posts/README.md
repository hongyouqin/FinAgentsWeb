# 外链分发内容库

> 本目录存放 **nbstockai.com / TradingAgents 中文版** 的外链分发素材。所有文章都基于 `/guide/*` 的 7 篇原稿改写（≥30% 差异率），避开搜索引擎重复内容判罚。

## 三周发布 SOP（与规划对齐）

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
| **W3** | **Day1** | **CSDN** | **`csdn/04-tet-indicator-strategy.md`**（TET 三维指标策略主推文） | **2h** |
| **W3** | **Day4** | **知乎** | **`zhihu/03-tet-indicator-answer.md`**（TET 散户问答向） | **3h** |
| **W3** | **Day6** | **掘金** | **`juejin/04-tet-indicator-implementation.md`**（Vue3+ECharts 工程向） | **1.5h** |
| **W3** | **Day7** | **站长** | **TET 三平台复盘 + 百度主动推送新 slug** | **1h** |

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
| TET 指标 | `/guide/tet-indicator-strategy` | 3 次（新加的主锚文本） |
| A股量化择时 | `/guide/tet-indicator-strategy` | 2 次（TET 的同义换词） |

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
│   ├── 03-deepseek-vs-qwen.md             ← W1 Day5
│   └── 04-tet-indicator-strategy.md       ← W3 Day1 （TET主推文）
├── zhihu/
│   ├── 01-deepseek-stock-answer.md        ← W1 Day6-7（首版，已发目标问题 B「DeepSeek 能用来做股票分析吗」）
│   ├── 02-ai-stock-worth-it-answer.md     ← W2 Day3
│   ├── 03-tet-indicator-answer.md         ← W3 Day4
│   └── 04-deep-learning-stock-prediction.md ← W1 Day7 追加（口语真人化、发圆桌问题「深度学习做股票预测靠谱吗」）
├── juejin/
│   ├── 01-multi-agent-architecture.md     ← W2 Day1
│   ├── 02-deepseek-vs-qwen-benchmark.md   ← W2 Day1
│   ├── 03-prompt-engineering-maotai.md    ← W2 Day2
│   └── 04-tet-indicator-implementation.md ← W3 Day6
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
| 2026-05-08 | CSDN | LangChain 实战：基于多智能体的股票研究流程拆解 | https://blog.csdn.net/llc18230851423/article/details/160880313 | 多智能体 AI | /guide/multi-agent-stock | 待填 | 待填 |
| 2026-05-09 | CSDN | 我用 6 个维度评了 2026 年主流 AI 股票分析工具，发现没有通用最优解（或按实际发布标题替换） | https://blog.csdn.net/llc18230851423/article/details/160916130?spm=1001.2014.3001.5501 | AI 股票工具对比 | /guide/ai-stock-tool-compare-2026 | 待填 | 待填 |
| 2026-05-10 | CSDN | DeepSeek V4 vs 通义千问 Qwen-Plus：A 股基本面分析能力实测横评（或按实际发布标题替换） | https://blog.csdn.net/llc18230851423/article/details/160960651?spm=1001.2014.3001.5501 | DeepSeek vs 通义千问 完整横评 | /guide/deepseek-vs-qwen-stock | 待填 | 待填 |

## 收录基线记录

| 日期 | `site:nbstockai.com` 收录数 | 已收录页面 | 备注 |
|---|---|---|---|
| 2026-05-06 | 1 | 首页 `www.nbstockai.com/` | SEO 基建首日基线，知乎养号 Day1 完成 |
| 2026-05-18 | 5 | 首页 `/`、注册 `/register`、关于 `/about`、TET 指标 `/guide/tet-indicator-strategy`、AI工具对比 `/guide/ai-stock-tool-compare-2026` | W2 Day6 复盘：+4 增量。7 篇 guide 中 2 篇已收录，其余 5 篇 + learning/guide 列表页未收录。百度主动推送 15 URL 遇 quota 上限（400 over quota），需次日补推 |
| 2026-05-23 | 0 | 无 | **百度降权**：`site:nbstockai.com` 返回 0 结果。抹取诊断正常（抓取成功）、ICP 备案正常（渝ICP备2021000340号-15）。判断为短期外链增速过快触发飓风/细雨算法。已停止外链分发、提交站长反馈，等待 2-4 周恢复 |

## 任务排期（具体日历）

> 以 2026-05-06（周三）为 Day1 起算，全期 20 天（W1 + W2 + W3）。默认每天 19:00–21:00 是发布 / 互动默认时段（资讯类高峰、推荐权重高）。

| 日期 | 周几 | 阶段 | 平台 | 主任务 | 关键动作 | 预计工时 |
|---|---|---|---|---|---|---|
| 2026-05-06 | 三 | W1 Day1 | 知乎 + CSDN | 养号 + 基线 | 点赞/收藏/关注、收藏 3 个目标问题、CSDN 账号准备、记录 site 收录 | 1h | ✅ |
| 2026-05-07 | 四 | W1 Day2 | 知乎 + CSDN | 互动 + 软贴 | 评论高赞回答、1 条软回答（DS vs ChatGPT）、CSDN 水文铺垫 | 1h | ✅ |
| 2026-05-08 | 五 | W1 Day3 | CSDN | 发首篇硬稿 | 首版被判营销宣传，改造 v2 版（去标题商业词 + 删导流段 + 支持引用论文）发布成功、链接已记录 | 2h | ✅ |
| 2026-05-09 | 六 | W1 Day4 | CSDN | 发第二篇 | `csdn/02-ai-stock-tools-2026.md` 按 Day3 v2 合规思路改造 + 发布卡片全部就绪（标题/标签/摘要/占位评论/回复模板），当日已发布（具体 URL 待回填到「发布后记录」表） | 2h | ✅ |
| 2026-05-10 | 日 | W1 Day5 | CSDN | 发第三篇 | 发布 `csdn/03-deepseek-vs-qwen.md`（合规改造已落地：压掉 2 次 `TradingAgents 中文版` 锚文本、首段补免责声明、结语弱化倾向性），锚文本：DeepSeek vs 通义千问 完整横评 → `/guide/deepseek-vs-qwen-stock` × 1 + `nbstockai.com` 裸链 × 1；周日 20:00 已发布 | 2h | ✅ |
| 2026-05-11 | 一 | W1 Day6 | 知乎 | 起草回答 | 起草 `zhihu/01-deepseek-stock-answer.md`（✅ 合规精修 5 处落地：frontmatter 锚文本策略明文化、首段后补小样本免责、违禁词清理、懒人方案段改“架构方法论索引”、文末补主锚）、开头 100 字钩子三选一、正文辅锚DeepSeek炒股×1 + 文末主锚TradingAgents 中文版×1、Day7 发布卡片已交付（目标问题B + 3 条占位评论 + 5 条回复模板 + checklist） | 1.5h | ✅ |
| 2026-05-12 | 二 | W1 Day7 | 知乎 | 发布回答 | 临时改稿：原zhihu/01已于Day6随手回答过，改新建 `zhihu/04-deep-learning-stock-prediction.md`（口语真人化、老程序员踩坑叙事风）、目标问题「深度学习做股票预测靠谱吗」（圆桌收录）、锚文本策略：零锚 + 1 裸链 `nbstockai.com`（纯文本不加 hyperlink）、已发布 | 1.5h | ✅ |
| 2026-05-13 | 三 | W2 Day1 | 掘金 | 双发 01+02 | 发布 `juejin/01-multi-agent-architecture.md` + `juejin/02-deepseek-vs-qwen-benchmark.md`（间隔7h）、锚文本错开 | 3h | ✅ 已完成：✅ 双稿合规改造落地（删硬广段 / 理顺锚文本 / 首段补免责 / Tag 压到 3 个）+ ✅ 发布卡片已交付（14:00 发 01 / 21:00 发 02）+ ✅ 双稿已发布（待回填 URL 至「发布后记录」表） |
| 2026-05-14 | 四 | W2 Day2 | 掘金 | 发 03 | 发布 `juejin/03-prompt-engineering-maotai.md`、锚文本：AI 研报 Prompt → `/guide/maotai-ai-analysis` | 1.5h | ✅ 已完成：✅ 合规改造落地（Tag 压到 3 个 / 首段补免责声明 / 结语删硬广 / 副锚 multi-agent 压到 1 次）+ ✅ 发布卡片已交付（标题 B / 3 个标签 / 摘要 / 3 条占位评论 / 5 条回复模板 / checklist）+ ✅ 周四 20:00 已发布（待回填 URL 至「发布后记录」表） |
| 2026-05-15 | 五 | W2 Day3 | 知乎 | 第二条回答 | 发布 `zhihu/02-ai-stock-worth-it-answer.md`、锚文本：AI 股票分析 → `/`、评论区互动 | 3h | ✅ 已完成：✅ 合规改造 4 处（frontmatter 锚文本策略明文化 / 首段补免责声明 / 工具推荐段去硬广改自然叙事 / 裸链纯文本化）+ ✅ 发布卡片已交付（目标问题 A + 3 条占位评论 + 4 条回复模板 + checklist）+ ✅ 周四 20:00 已发布（待回填 URL 至「发布后记录」表） |
| 2026-05-16 | 六 | W2 Day4 | 博客园 | 双发 01+02 | 发布 `cnblogs/01-tradingagents-practice.md` + `cnblogs/02-ai-backtest-notes.md`（间隔4h） | 2h | ✅ 已完成：✅ 双稿合规改造落地（首段补免责 / 01 压 4→1 超链 / 02 压 6→1 超链 / 改裸文本 / 明确“基于 TradingAgents 中文改造”）+ ✅ 发布卡片已交付（标题 / Tag / 间隔时间 / 合规 checklist）+ ✅ 16:00 发 01 / 20:00 发 02 已发布（URL 待回填「发布后记录」表）
| 2026-05-17 | 日 | W2 Day5 | 简书 | 双发 01+02 | 发布 `jianshu/01-ai-stock-tools-for-retail.md` + `jianshu/02-ai-stock-myth.md`（间隔4h）、裸链为主、双稿前端合规改造落地 | 2h | ✅ 已完成：✅ 双稿裸链合规改造落地（全超链改裸文本 / 01 配额已用尽锚改裸提及 / 02 落地页对齐锚文本表 / 双稿补免责声明）+ ✅ 16:00 发 01 / 20:00 发 02 已发布（URL 待回填「发布后记录」表） |
| 2026-05-18 | 一 | W2 Day6 | 站长 | 复盘上 | ✅ 收录增量：5 页（+4 vs Day1）；✅ 阅读量盘点：CSDN 300-400/篇 + 收藏10/点赞10；掘金 30-40/篇；博客园个位数；知乎 1 篇破万（1.1万阅读/238收藏/77赞）+ 其余 100 左右；⚠️ 推送待次日重试（quota 不足） | 1h | ✅ 已完成 |
| 2026-05-19 | 二 | W2 Day7 | 站长 | 复盘下 | ✅ 关键词排名：品牌词「TradingAgents 中文版」未进首页（被 tradingagents-cn.com 分流）；「AI 股票分析」未出现；「DeepSeek 炒股」未出现（但知乎专栏在首页）；「TET 指标」未出现。⚠️ 百度推送连续 2 日 over quota，需登录站长平台手动提交或等配额恢复。📋 W3 调整建议见下 | 1h | ✅ 已完成 |
| **2026-05-20** | **三** | **W3 Day1** | **CSDN** | **发 TET 主推文** | 发布 `csdn/04-tet-indicator-strategy.md`（TET 三维指标策略全解）、锚文本：TET 指标 → `/guide/tet-indicator-strategy` × 1（首次使用，quota 1/3）；副锚配额已用尽改裸文本；与 CSDN 03（05-10）间隔 10 天 | 2h | ✅ 已完成：✅ 合规改造 + ✅ 封面图已生成 + ✅ 20:00 已发布（URL 待回填「发布后记录」表） |
| **2026-05-21** | **四** | **W3 Day2** | **知乎** | **养号 + 互动** | ✅ 锁定 5 个 TET 目标问题（见下方清单）；点赞/收藏/关注高赞回答；为 W3 Day4 发稿预热 | 1h | ✅ 已完成：✅ 5 个目标问题已锁定 + ✅ 预热清单已交付 |
| **2026-05-22** | **五** | **W3 Day3** | **CSDN** | **Day1 发篇回流** | 在 `csdn/04` 下回复真实读者 1-2 条、再扣 1 条占位评论（标题可用「为什么你定义 TI≤-1 不做空」）、将发布 URL 记录到下方表格 | 1h | ✅ 已完成：发布 48h 评论区仍空，调整为「占位 1 先上 + 站外引流 + CSDN 同领域互动」路线；⏳ URL 待回填「发布后记录」表 |
| **2026-05-23** | **六** | **W3 Day4** | **知乎** | **发 TET 问答篇** | 发布 `zhihu/03-tet-indicator-answer.md` 到 Day2 挑出的 1-2 个问题下；开头不贴链接，文末掉 1 个裸链 `nbstockai.com` + 1 个 `/guide/tet-indicator-strategy` 锚文本；周六 20:00 发格外加权 | 3h | ✅ 已完成：✅ 双链违规合规精修（文末 2 超链 → 1 超链 + 1 裸链）+ ✅ 发布卡片已交付 + ✅ 已发布（URL 待回填「发布后记录」表） |
| **2026-05-24** | **日** | **W3 Day5** | **知乎** | **⛔ 暂缓** | 百度降权恢复期，停止一切外链分发，转入 Phase 2 自然流量获客策略 | - | ⛔ 暂缓 |
| **2026-05-25** | **一** | **W3 Day6** | **掘金** | **⛔ 暂缓** | 同上 | - | ⛔ 暂缓 |
| **2026-05-26** | **二** | **W3 Day7** | **站长** | **⛔ 暂缓** | 同上 | - | ⛔ 暂缓 |

### 高优先级提醒

- **Day3（2026-05-08）是首篇硬稿起点**，是 W1 最关键的一天：标题 / 锚文本 / 发布时间点都会影响后续评估。
- **周六日发文**（Day5 / Day9　Day12 / W3 Day4）阅读高峰推后到 20:00。
- **复盘日不要发文**（Day13-14 / W3 Day7），专心收集数据。
- **TET 主题同平台间隔 ≥ 5 天**：CSDN 04（05-20）与 CSDN 03（05-10）相隔 10 天；知乎 TET（05-23）与知乎 02（05-15）相隔 8 天；掘金 TET（05-25）与掘金 03（05-14）相隔 11 天。
- 若某天赶不上，**额外 1 天补上**不要同日补发（避免单平台超 2 条被判推广）。

### 执行状态检查表

- [x] **W1 Day1**（2026-05-06）：知乎养号（点赞/收藏/关注）+ 搜 3 个目标问题收藏 + CSDN 账号准备 + 收录基线记录（1 个）
- [x] **W1 Day2**（2026-05-07）：知乎目标问题互动（点赞/评论高赞回答）+ 关注 AI/量化相关话题与大 V + 知乎发软回答 1 条（DeepSeek vs ChatGPT）+ CSDN 发水文铺垫 1 条（多智能体架构随笔）
- [x] **W1 Day3**（2026-05-08）：CSDN 发布 `csdn/01-multi-agent-architecture.v2.md`（首版审核未过，v2 合规改造后通过）
- [x] **W1 Day4**（2026-05-09）：CSDN 发布 `csdn/02-ai-stock-tools-2026.md`（✅ 合规改造 + ✅ 发布卡片走完 + ✅ 已发布，记得补登发布 URL 到「发布后记录」表）
- [x] **W1 Day5**（2026-05-10）：CSDN 发布 `csdn/03-deepseek-vs-qwen.md`（✅ 合规改造 + ✅ 发布卡片走完 + ✅ 已发布，URL 已入库 `/details/160960651`，锚文本：DeepSeek vs 通义千问 完整横评 → `/guide/deepseek-vs-qwen-stock` × 1 + `nbstockai.com` 裸链 × 1）
- [x] **W1 Day6**（2026-05-11）：知乎起草 `zhihu/01-deepseek-stock-answer.md`（✅ 合规精修 5 处落地 + ✅ 锁定目标问题 B「DeepSeek 能用来做股票分析吗」 + ✅ 钩子三选一 + ✅ Day7 发布卡片全集已交付）
- [x] **W1 Day7**（2026-05-12）：知乎发布 `zhihu/04-deep-learning-stock-prediction.md`（✅ 原 zhihu/01 昨日已用于随手回答，改新建 04 口语真人化版 + ✅ 发到圆桌问题「深度学习做股票预测靠谱吗」 + ✅ 零锚 + 1 裸链 `nbstockai.com`纯文本 + ✅ 已发布，URL 待回填「发布后记录」表）
- [x] **W2 Day1**（2026-05-13）：掘金发布 01 + 02（✅ 已完成：✅ juejin/01 合规改造（3处）+ ✅ juejin/02 合规改造（4处）+ ✅ 双篇发布卡片已交付 + ✅ 14:00 发 01 / 21:00 发 02 已发布，待回填 URL 至「发布后记录」表）
- [x] **W2 Day2**（2026-05-14）：掘金发布 `juejin/03-prompt-engineering-maotai.md`（✅ 已完成：✅ 合规改造 4 处（Tag 压到 3 / 首段补免责 / 表格前补范例提示 / 结语去硬广 / 副锚压到 1 次）+ ✅ 发布卡片已交付周四 20:00 发布完成，URL 待回填「发布后记录」表）
- [x] **W2 Day3**（2026-05-15）：知乎发布 `zhihu/02-ai-stock-worth-it-answer.md`（✅ 已完成：✅ 合规改造 4 处（frontmatter 锚文本策略明文化 / 首段补免责 / 工具推荐段去硬广 / 裸链纯文本化）+ ✅ 发布卡片已交付 + ✅ 周四 20:00 已发布，URL 待回填「发布后记录」表）+ ✅ 追加回答「为什么用AI通过技术性炒股没有盛行」问题
- [x] **W2 Day4**（2026-05-16）：博客园发布 01+02（✅ 已完成合规改造：✅ 双稿首段补免责 + ✅ 01 超链 4→1 + ✅ 02 超链 6→1 + ✅ 明确「基于 TradingAgents 框架中文改造」 + ✅ 压掉配额已用尽的副锚（AI 股票工具对比 / 多智能体 AI / AI 研报 Prompt）+ ✅ 发布卡片已交付 + ✅ 16:00 发 01 / 20:00 发 02 已发布，URL 待回填「发布后记录」表）
- [x] **W2 Day5**（2026-05-17）：简书发布 01 + 02（✅ 已完成合规改造：✅ 全部超链改裸文本符合简书裸链为主策略 + ✅ 01 主锚 AI 股票工具对比配额已用尽改裸文本 + ✅ 02 DeepSeek 炒股落地页对齐 /guide/deepseek-stock-analysis + ✅ 双稿首段补免责声明 + ✅ 16:00 发 01 / 20:00 发 02 已发布，URL 待回填「发布后记录」表）
- [x] **W2 Day6**（2026-05-18）：复盘收录数 + 阅读量（✅ 收录 5 页 / +4；✅ 阅读量：CSDN 300-400·掘金 30-40·博客园个位数·知乎 1 篇破万；⚠️ 推送待次日补）
- [x] **W2 Day7**（2026-05-19）：复盘排名 + 下轮调整（✅ 关键词排名已查：品牌词被分流·内容词均未进首页；⚠️ 推送连续 2 日配额不足；📋 W3 调整方案已产出）
- [x] **W3 Day1**（2026-05-20）：CSDN 发布 `csdn/04-tet-indicator-strategy.md`（✅ 合规改造 + ✅ 封面图 + ✅ 20:00 已发布，URL 待回填「发布后记录」表）
- [x] **W3 Day2**（2026-05-21）：知乎目标问题定位 + 养号点赞收藏（✅ 5 个 TET 目标问题已锁定，见 README 清单；点赞收藏互动待手动操作）
- [x] **W3 Day3**（2026-05-22）：CSDN 04 评论区起虚 + 站外引流 + URL 入库（发布 48h 评论区仍空，调整为「占位 1 先上 + 站外引流 + CSDN 同领域互动」路线；⏳ URL 待手动回填）
- [x] **W3 Day4**（2026-05-23）：知乎发布 `zhihu/03-tet-indicator-answer.md`（✅ 双链违规合规精修落地（1 超链 + 1 裸链）+ ✅ 周六 20:00 已发布，URL 待回填「发布后记录」表）
- [x] **W3 Day5**（2026-05-24）：⛔ 暂缓（百度降权恢复期，停止外链分发，转 Phase 2 自然流量获客）
- [x] **W3 Day6**（2026-05-25）：⛔ 暂缓（同上）
- [x] **W3 Day7**（2026-05-26）：⛔ 暂缓（同上）

## Phase 2：自然流量获客期（2026-05-24 起）

> 百度降权恢复期，停止外链分发，转向平台内自然流量获客。核心原则：零外链、靠内容质量和品牌词口播引导用户主动搜索。

| 优先级 | 渠道 | 每周投入 | 核心做法 |
|---|---|---|---|
| P0 | 知乎（无链接纯内容） | 3-4h | 每周 2-3 条高质量回答，不带任何链接，只在个人简介写站点 |
| P1 | 短视频（抖音/视频号） | 4-5h | 屏录+配音演示 AI 研报流程，口播品牌词，不放链接/二维码 |
| P2 | 微信生态（公众号+群） | 2-3h | 公众号每周 1-2 篇 + 社群裂变（邀请 3 人进群送算力） |
| P3 | 小红书 | 2-3h | 图文种草，每周 3-4 条，图片带 nbstockai.com 水印 |
| P4 | 百度恢复 | 0.5h/周 | 提交反馈 + 每 2 周检查 site: 命令 |

## 风险提示

1. **新账号必须先养号**：新号当天发带外链文章会被秒删。知乎/CSDN 建议注册满 7 天后再发。
2. **一天别发超过 2 条**：单平台单日多发容易被判批量推广。
3. **评论区主动互动**：发完后每天回复 1-2 个评论，能有效提升推荐权重。
4. **不要刷赞**：百度/平台都能识别，反而降权。

---

> 本目录内容仅用于 nbstockai.com 自家品牌的合规内容营销，所有文章观点基于实际产品功能，不涉及误导性宣传。
