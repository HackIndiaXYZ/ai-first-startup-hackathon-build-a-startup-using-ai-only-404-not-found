---
name: demo-skill
description: "A deliberately flawed package, shipped so `whetstone verify` has something to catch. 触发词:demo / example。与 whetstone 同族,不重复它。"
---

# Demo Skill — 故意写坏的示例包 / deliberately flawed

> 这个包**故意违反**证据纪律,用来演示 `whetstone verify` 抓什么。
> Deliberately breaks the evidence rules so `verify` has something to find.
> 合规的对照版在 `bin/verify_selftest.sh` 的 `mkclean` 夹具里。

## 原理与约束 (L1)

- 一次性写入的存储写坏就回不去,所以写之前必须先把原始内容存下来。

## 设计与流程 (L2)

- 校验失败时先在 0x1A40 读回原始字节比对,不从上层现象反推。

## 坑 (L2)

见 `pitfalls.md`。

## 平台参数 (L3)

> 具体值见 `params/soc-x.md`。
- 已支持平台:soc-x

## 溯源

- 来源:commit 1a2b3c4d
- 提炼日期:2026-09-02
- 复现记录:
  - soc-x · 2026-08-01 · commit 1a2b3c4d
  - soc-x · 2026-09-01 · commit 5e6f7a8b
- 验证方式:bash scripts/check.sh · 实测:通过 2026-09-01
- 置信度:high
