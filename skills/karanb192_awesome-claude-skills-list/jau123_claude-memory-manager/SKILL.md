---
name: memory-management
description: Claude Code auto-memory 与 CLAUDE.md 的管理方法 — 判断值不值得记、记到哪一层(行内注释 / .claude/rules / memory / CLAUDE.md)、怎么写 frontmatter 与 description、何时 update 何时拆分、索引 MEMORY.md 的容量与 hub 化。用户说"记一下""新增/更新记忆""沉淀经验""复盘""改 memory schema""audit memory""记忆系统乱了"时使用;功能开发或长 debug 收尾有值得沉淀的结论时也用。
---

# Memory Management

memory 装**事实**(踩过的坑、业界数据、项目状态),本 skill 装**方法**(记什么、记到哪、怎么写)。不要把 schema 规范抄进 memory 文件。

## 快速路由

| 用户说 | 做 |
|---|---|
| "记一下"(模糊)/ "复盘" / "开发完了看看有什么值得记" | Mode 1 候选评估 |
| "记一下今天那个 X 坑"(具体单条) | Mode 2 新建 |
| "更新 / 修正某条 memory" | Mode 3 update(优先于新建) |
| "改 schema / 加 type / 改分组" | Mode 4 结构变更 |
| "记忆系统乱了 / audit" | 跑 `bash scripts/audit-memory.sh`;没有则从 `templates/audit-memory.template.sh` 复制 |
| 新项目零记忆起步 | 见 `templates/bootstrap.md` |

## 六条规则

**1. 先判断值不值得记。** 同一个坑第二次踩 → 必记;对抗审查得出的非显然判断 → 记 Why;业界对照 / 实测数字 → 记;一次性 debug 修完没有沉淀价值 → 不记(commit message 够了)。**"很久没读"不是删除理由**,删的依据是主题已消失或被取代。

**2. 再判断记到哪(四级路由)。** 问一句:未来需要这条时,我是盯着某个代码位置,还是在做跨文件决策 / 排查某类报错?

| 触发 | 去处 |
|---|---|
| 盯某一行/块,一句话讲得清 Why | 行内代码注释(写前先 grep,往往已有) |
| 一组具体文件的多点契约 / 检查清单 | `.claude/rules/<x>.md` + `paths:` frontmatter(进 git,碰路径自动注入) |
| 场景 / 报错 / 跨文件 / 平台与 SDK 行为 / 墓碑 / SOP / 经济推理 | memory(本系统) |
| 每个 session 都要守的规则 | CLAUDE.md |

绑文件的 feedback 默认拆:内核进注释,memory 只留跨切原则 + 指针。拿不准就留 memory,宁可少迁。

⚠️ rules 注入边界(官方文档,2026-10 核对):
- `paths:` 规则在 Read / Write / Edit 匹配文件时注入(早期版本 Write 新建文件不注入)。
- `.claude/rules` 目录或规则文件若是**指向工作目录外的符号链接**,按外部 import 处理:要先批准外部 import,批准后也只加载**不带** `paths:` 的规则 —— 带 `paths:` 的规则静默失效(实测确认,连批准提示都不弹)。规则文件放在仓库里的真实目录,别软链到仓库外。
- 用户级 `~/.claude/rules/` 的 `paths:` 在早期版本被忽略(issue #21858,已关闭);要依赖它先实测。
- 新建或迁移规则后,Read 一个匹配文件确认规则真的注入了;注入不了的契约留在 CLAUDE.md。

**3. 优先 update 已有文件。** 主题相关就 update(加段或 changelog);只有主题完全正交才新建。碎片化 = 找不到 = 失忆。

**4. topic 文件不自动加载,description 决定命中。** 启动只加载 MEMORY.md;原生没有语义召回,Claude 凭索引行的 description 决定读不读。description 必须是**场景关键词 + 核心结论**,读到就知道"X 场景查 Y 结论"。

**5. 何时拆而不是 update。** 文件 > 100 行且新内容与原主题正交;或已有 ≥ 4 个 H2 且新内容是第 5 个主题;或新内容跟标题 / description 不匹配 → 拆新文件。

**6. 索引层容量。** 原生限制:MEMORY.md 只加载前 **200 行或 25KB**(官方口径 KB,实测按字符计;frontmatter 与块级 HTML 注释不计入,v2.1.211+)。v2.1.210 起写入超限时 Claude Code 会回报错误、要求重写到 140 行内,接近上限会提醒;手工编辑或更旧版本仍是静默截断。建议安全线 **≤ 190 行 / ≤ 23,000 字符**,目标 **≤ 120 行 / ≤ 16,000 字符** —— 离墙远一点,才不会被原生报错逼着仓促压缩。量法**只信 audit 脚本**(自动选 UTF-8 locale);手动量必须带 UTF-8 的 `LC_ALL`,裸 `wc -m` 在无 locale 的 shell 里等于字节,中文虚高约 30%。

索引结构:每组只留 ⭐⭐⭐ / ⚠️⚠️ 直达行 + 一行 hub 指针,**全量条目放组 hub 文件**(`reference_<group>_hub.md`)。新条目默认挂 hub,只有真正每次 session 都可能撞到的才上 MEMORY.md。超限时的瘦身顺序:先迁(下沉到注释 / rules)→ 删真墓碑 → 排序(⭐⭐⭐ 靠顶)→ 下沉到 hub → 最后才压 description。原生超限报错后的本能动作是压缩 description,恰好排在最后一位。

## Mode 1:候选评估

1. 回顾本次会话:用户校正、审查发现、未预期 bug、业界对照、非显然决策。
2. 逐条过规则 1;通过的再过规则 2 定去处。
3. 每条判断:已有文件覆盖?→ Mode 3;超规则 5 阈值?→ 拆;该进 CLAUDE.md?→ 改 CLAUDE.md。
4. 列"新增 / update / 拆分"清单给用户确认,再写。

## Mode 2:新建

1. **type**(与原生四类一致):`feedback`(踩坑、用户校正,必含 Why + 何时复用)/ `reference`(原生指外部资源指针;本 skill 也用它装深度参考、SOP、业界对照)/ `project`(状态快照、进行中工作)/ `user`(用户角色与偏好)。
2. **文件名** `<type>_<topic>[_<modifier>].md`,全小写下划线。不用连字符、驼峰、下划线开头。
3. **frontmatter**(必填三项):

```yaml
---
name: kebab-case-slug
description: 场景关键词 + 核心结论
type: feedback | reference | project | user
---
```

`type` 平铺或嵌套在 `metadata:` 下都算,audit 两种都认。原生写法随版本变,新建时跟随当前原生写法,不为统一格式批量改存量。`modified` 由 Claude Code 写入时自动维护(v2.1.214+),不要手写。

4. **正文**。feedback 结构:标题(What 一句话)→ 核心结论 + 背景 → `## Why`(或 `## 根因` / `## 教训` / `## 原因`;也可行内 `**Why:**`)→ `## How to apply`(description 已含场景词时可省)。reference / project 按主题自然组织。
5. **加索引**:默认加到组 hub 文件;只有 ⭐⭐⭐ / ⚠️⚠️ 级别才同时加 MEMORY.md。行格式 `- [短标签](完整文件名.md) — hook`,短标签 = 去 type 前缀的连字符名;跨主题在末尾加 `(亦见 [[other]])`。分组冻结,不新建分组。

## Mode 3:update

1. `grep -l "<关键词>" memory/*.md` 确认归属。
2. 新数据补充 → 加段或 changelog;结论被推翻 → 旧文件顶部加 `⚠️ Superseded by [[new-slug]]`,新文件写明取代了什么;只是 description 不清楚 → 改索引行。
3. 改了 description 就同步 MEMORY.md / hub 对应行。

## Mode 4:结构变更

改 schema / 加 type / 改分组前必读:

- hook `if: "Write(memory/*.md)"` 语法无效;`if:` 是 permission rule 不是文件 glob
- 不要用 exit 2 阻塞 hook,用 soft warning(PostToolUse hook 回 `additionalContext` 即可)
- 不要把权威规范放 `_schema.md` 这类下划线文件,Claude 不主动读
- 不要在项目 `.claude/settings.json` 配 hook,该目录常在 .gitignore
- 原生 auto-memory 的写法(type 种类、frontmatter 形态)会随版本变;改 schema 前先看当前原生写法,别和它对着干
- 加必填字段同步三处:本 skill Mode 2 → MEMORY.md 顶部速查段 → audit 脚本 `REQUIRED_FIELDS`
- 改前先跑 audit 拿基线;现有文件违反新规 > 10% 就先迁移再切换

流程:跑 audit → 设计变更(改本 skill + 项目状态文件)→ 检查存量违规率 → 同步 MEMORY.md 速查段 → 改 audit 脚本 → 复跑 audit。

## 与官方工具的分工

- **`consolidate-memory`**(官方 skill):周期性合并去重、修 stale 事实、修剪索引,适合"整体过一遍"。大扫除先跑它拿第一意见,逐条拍板后按本 skill 的规则落笔。
- **`/doctor prompt-audit`**(v2.1.283+):审 CLAUDE.md / rules / skills 里过时或冲突的指令,默认不覆盖 auto memory 目录。memory 库的体检用本 skill 的 audit 脚本。
- **原生索引超限报错**:写入后才触发,且只给"压缩"一个方向;预算和瘦身顺序由本 skill 管。

## 常见错误

| 错 | 对 |
|---|---|
| description 写"Supabase 问题" | "supabase.from() tab 切换死锁,用 fetch" |
| feedback 只写是什么 | 必带 Why,保护未来不重新质疑 |
| 同主题新建第二个文件 | update 已有 |
| 新建分组放一条 | 用已有分组 + `(亦见 X)` |
| 每条都上 MEMORY.md | 默认挂 hub,MEMORY.md 只放 ⭐⭐⭐ |
| 用 hook exit 2 强制阻塞 | soft warning + 事后 audit |
| `.claude/rules` 软链到仓库外统一管理 | 规则放仓库内真实目录,否则带 `paths:` 的全部失效 |

## 写完自检

- [ ] type / 文件名 / frontmatter 三字段 / feedback 有 Why
- [ ] description = 场景词 + 结论;想 3 个未来会问的场景,凭它能命中吗
- [ ] 加到正确的 hub(或 MEMORY.md,仅 ⭐⭐⭐);没新建分组;跨主题加了亦见
- [ ] 文件 < 100 行 / < 5 个 H2;绑文件的内核是否该下沉到注释
- [ ] 新建或迁移了 rules → Read 一个匹配文件,确认注入
- [ ] 跑 `bash scripts/audit-memory.sh`,MEMORY.md 大小以脚本为准

## 项目工具

`scripts/audit-memory.sh` 检查:frontmatter 完整性、feedback 缺 Why、命名、索引断链(MEMORY.md + 所有 hub)、单文件超载、大组密度、索引大小(按原生口径剔除 frontmatter 与 HTML 注释)、超长索引行、退役关键词、`modified` 字段、120 天未触。目标硬规则合规率 ≥ 95%。没有脚本的项目从 `templates/audit-memory.template.sh` 复制并改 `MEMORY_DIR`(或设环境变量 `CLAUDE_MEMORY_DIR`)。
