# 侧信道攻击(SCA)研究知识库 — 总索引

> 创建:2026-09-30 | 状态:第一阶段完成 | 验证体系:见 [verification/VERIFICATION.md](verification/VERIFICATION.md)

## 项目结构

```
side-channel-research/
├── INDEX.md                  ← 本文件
├── knowledge/                ← 经验证的知识库(按领域)
│   ├── 01-power-analysis/            功耗分析与剖析攻击(SPA/DPA/CPA/Template/ML)   23条
│   ├── 02-em-tempest-powerline/      电磁侧信道/TEMPEST/电力线                     22条
│   ├── 03-timing-cache-microarch/    计时/缓存/微架构/Spectre/Rowhammer            24条
│   ├── 04-physical-acoustic-optical-thermal/  声学/光学/热/气隙外泄               24条
│   ├── 05-countermeasures-evaluation/ 掩码/恒定时间/TVLA/标准化评估               25条
│   ├── 06-classics-books-courses/    经典文献/书籍/课程/会议/生态                  20条
│   └── 07-tools-datasets/            工具/数据集/动手资源(跨域综合)
├── reproductions/            ← 可复跑的复现实验(Node.js,零依赖)
│   ├── sca_common.js         AES-128(FIPS-197+SP800-38A KAT锚定)+统计工具
│   ├── cpa_aes.js            实验1: CPA功耗分析(16/16字节恢复+噪声研究)
│   ├── timing_attack.js      实验2: 字节级计时攻击(8/8恢复+恒定时间对照)
│   ├── tvla_masking.js       实验3: TVLA泄漏检测+一阶掩码有效性
│   ├── timing_attack_results.txt  实验2输出日志
│   └── README.md             实验方法学、结果与迭代记录
├── verification/VERIFICATION.md   真实性验证报告(四层验证体系+纠错+隔离区)
├── skills/                   ← 技能库清单(技能本体安装于 <工作区>/.agents/skills/,可被ZCode发现)
└── ROADMAP.md                路线图(技能扩充到40+/后续复现/持续调研计划)
```

## 核心数字

- **139 个资源条目**(6 个领域,91% 高置信度,全部经权威 URL 实访验证)
- **40+ 处常见引用错误被核实纠正**(其中 4 处出现在本项目自己的初稿中,已修正)
- **3 个复现实验全部成功**,结果与理论定量吻合,任何人可零成本重跑验证
- **20 个技能文件**覆盖六大类侧信道场景(第一批 19 个 + 2026-10-20 增补轨迹预处理,安装于 `<工作区>/.agents/skills/`,路线图扩至 40+)

## 快速导航(按任务)

| 你想做什么 | 去哪里 |
|---|---|
| 系统入门侧信道领域 | knowledge/06 入门路径 → Anderson 第18-19章(免费) → 01 域三篇经典原文 |
| 理解某类攻击原理 | knowledge/01–04 对应领域的"方法地图"小节 |
| 动手复现一个攻击 | reproductions/(零硬件) → knowledge/07(ChipWhisperer/ASCAD 硬件路径) |
| 评估/加固自己的实现 | knowledge/05(TVLA/dudect/掩码/恒定时间) + reproductions/tvla_masking.js |
| 引用文献(写报告) | 先读对应领域 README 的"纠错"小节,再读 verification/VERIFICATION.md 第四节 |
| 处理某个具体攻击场景 | skills/ 库(sca-router 为总入口,按场景路由) |

## 使用纪律(保证"真实性"承诺)

1. 引用任何外部文献前,先查该条目的置信度标注与"纠错"小节
2. 凡标注 [未验证] 的内容不得作为事实引用
3. 复现实验的结论以 `node <脚本>` 重跑输出为准,不依赖本文档转述
