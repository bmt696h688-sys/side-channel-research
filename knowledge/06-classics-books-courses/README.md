# 06 · 基础经典文献、书籍、课程、会议与工具生态

> 由调研 agent 于 2026-09-30 联网搜集,共约 35 次实际网页核验(Springer、Crossref、TCHES 官网、Coursera、GitHub API、eprint);置信度分级见每条标注。

## 领域综述

SCA 领域奠基于 Kocher 的计时攻击(1996)与差分功耗分析(1999),Kelsey 等 1998 年系统提出 "side channel" 概念。学术生态以 CHES 会议(1999 年创办,2018 年起转为 IACR TCHES 期刊)与 COSADE workshop(2010 年起)为核心;教材以 Anderson《Security Engineering》、Mangard 等《Power Analysis Attacks》为代表。动手生态高度依赖开源 ChipWhisperer 平台与 DPA Contest/ASCAD 等公开数据集。

## 资源清单

| # | 标题 | 作者 | 年份 | 出处/类型 | URL | 内容与重要性 | 验证证据 | 置信度 |
|---|---|---|---|---|---|---|---|---|
| 1 | Timing Attacks on Implementations of Diffie-Hellman, RSA, DSS, and Other Systems | Paul C. Kocher | 1996 | CRYPTO '96, LNCS 1109, pp.104-113 | https://doi.org/10.1007/3-540-68697-5_9 | 计时攻击开山之作 | 实访 Springer 章节页,确认题名/作者/LNCS 1109/页码/1996 | 高 |
| 2 | Differential Power Analysis | Kocher, Jaffe, Jun | 1999 | CRYPTO '99, LNCS 1666, pp.388-397 | https://doi.org/10.1007/3-540-48405-1_25 | DPA 奠基论文 | 实访 Springer 页确认全部元数据,确为 CRYPTO 1999(非 1998) | 高 |
| 3 | Side Channel Cryptanalysis of Product Ciphers | Kelsey, Schneier, Wagner, Hall | 1998(会议)/2000(期刊) | **ESORICS '98**, LNCS 1485, pp.97-110;期刊版 J. Computer Security 8(2-3):141-158 | https://doi.org/10.1007/BFb0055858 | 系统化"侧信道"概念的经典,引用极混乱(见纠错) | 实访 Springer 章节页确认收录于 "Computer Security — ESORICS 98";Crossref 确认期刊版 DOI 10.3233/JCS-2000-82-304,无 SAC 版本 | 高 |
| 4 | Correlation Power Analysis with a Leakage Model | Brier, Clavier, Olivier | 2004 | CHES 2004, pp.16-29 | https://doi.org/10.1007/978-3-540-28632-5_2 | CPA 标准方法与 Hamming 重量泄漏模型 | Crossref 实查确认全部元数据 | 高 |
| 5 | Template Attacks | Chari, Rao, Rohatgi | 2002 | CHES 2002, pp.13-28 | https://doi.org/10.1007/3-540-36400-5_3 | 最强 profiling 攻击范式 | Crossref 实查确认(论文集 2003 年出版,会议为 2002) | 高 |
| 6 | IACR TCHES 期刊(前身 CHES 会议) | IACR | 2018 起为期刊 | 期刊,Diamond OA,每年 4 期 | https://tches.iacr.org/ | 领域旗舰;官网自述 CHES "running since 1999"、自 CHES 2018 起转为期刊/会议混合模式 | 实访官网首页;Crossref 最早论文 2018-02-14;首届 CHES'99(Worcester, Koç&Paar 编)亦经 Crossref 确认 | 高 |
| 7 | COSADE(International Workshop on Constructive Side-Channel Analysis and Secure Design) | 社区 | 2010 年起 | workshop 系列,2014 年起 Springer LNCS | https://doi.org/10.1007/978-3-319-10175-0 | SCA 方法论专题会(官网 cosade.org 已失效,以 Springer 卷为准) | 实访 Springer 2014 卷页面:确认为"第 5 届"(LNCS 8622,Paris,Prouff 主编),推得 2010 年创办 | 中高 |
| 8 | Security Engineering, 3rd ed.(免费在线) | Ross Anderson | 2020(3rd) | Wiley;作者主页免费 PDF | https://www.cl.cam.ac.uk/~rja14/book.html | 系统安全圣经;3rd ed 第 19 章 "Side Channels"、第 18 章 "Physical Tamper Resistance" | 实访 book.html:三个版本章节 PDF 均免费提供,3rd ed 有全书合并 PDF | 高 |
| 9 | Power Analysis Attacks: Revealing the Secrets of Smart Cards | Mangard, Oswald, Popp | 2007 | Springer(精装 2007-03-12) | https://doi.org/10.1007/978-0-387-38162-6 | SPA/DPA/Template 攻击与对策最系统教材 | 实访 Springer 书目页:确认出版社/年份/ISBN 978-0-387-30857-9 | 高 |
| 10 | Cryptographic Engineering | Çetin Kaya Koç(编) | 2009 | Springer, ISBN 978-0-387-71816-3 | https://doi.org/10.1007/978-0-387-71817-0 | 含 Joye "Basics of Side-Channel Analysis" 与 Rohatgi EM 攻击等专章 | 实访 Springer 书目页确认编者/年份/ISBN 及 SCA 章节 | 高 |
| 11 | Hardware Security(公开课) | Gang Qu, University of Maryland | 在线 | Coursera | https://www.coursera.org/learn/hardware-security | 7 模块,含 "Side Channel Attacks and Countermeasures" | 实访课程页:确认校方、讲师、SCA 模块、开放选课 | 高 |
| 12 | ChipWhisperer 开源工具链+官方教程体系 | NewAE Technology (Colin O'Flynn) | 持续维护 | 开源软硬件+课程 | https://github.com/newaetech/chipwhisperer | SCA 动手实践事实标准;硬件产品线 Lite/Nano/Pro/Husky;SCA101(26 课)课程,Jupyter 教程在独立仓库 chipwhisperer-jupyter | GitHub/文档站/课程站三处实访交叉确认 | 高 |
| 13 | ChipWhisperer: An Open-Source Platform for Hardware Embedded Security Research | O'Flynn, Chen | 2014 | COSADE 2014, LNCS 8622, pp.243-260 | https://doi.org/10.1007/978-3-319-10175-0_17 | 平台学术文献 | Crossref 实查确认 | 高 |
| 14 | Cryptopals Crypto Challenges, **Set 4 (#31/#32)** | cryptopals.com | 在线免费 | 实战练习集 | https://cryptopals.com/sets/4/challenges/31 | #31 "Implement and break HMAC-SHA1 with an artificial timing leak"、#32 "…slightly less artificial timing leak"——计时攻击入门首选 | 实访 sets/4 及 challenge 31 页确认题号与标题 | 高 |
| 15 | ASCAD 数据集与论文 | Prouff, Strullu, Benadjila, Cagli, Dumas (ANSSI) | 2018/2020 | J. Cryptographic Engineering 10(2) + GitHub | https://github.com/ANSSI-FR/ASCAD | 掩码 AES(ATmega8515 与 STM32)深度学习 SCA 基准;仓库 2026-01-15 起归档只读 | 实访 GitHub 仓库与 eprint 2018/053 | 高 |
| 16 | DPA Contest 系列 | 社区竞赛 | 2008 起 | 公开轨迹数据集 | 原官网 dpacontest.org(现为停放域名) | 首届于 CHES 2008 启动,目标 DES 固定密钥、80,000 条轨迹;v4/v4.2 为 AES 的 RSM(rotating s-box masking)+shuffling 防护实现 | 实访 dpacontest.org 确认已停用;实访 eprint 2008/517(Standaert 等);SCN 2016 论文经 Crossref/OpenAlex 确认 v4=AES-256 RSM | 中高 |
| 17 | The Hardware Hacking Handbook | O'Flynn & van Woudenberg | 2021 | No Starch Press | https://learn.chipwhisperer.io | SCA 与故障注入动手专著 | 官方学习站实访确认书名/作者/出版社 | 中高 |
| 18 | CHES 2016 Capture the Flag | NewAE/CHES 社区 | 2016 | CTF(轨迹公开) | writeup: https://github.com/M0nteCarl0/CHES-2016-Capture-the-Flag-writeup | 少见的大规模公开 SCA CTF,26 题,配套 ChipWhisperer/scared/Jlsca 多框架解法 | GitHub API 实取 README 确认 | 中高 |
| 19 | RHme 系列硬件 CTF(RHme1/2/3, 2015-2018) | Riscure | 2015-2018 | Arduino 板卡 CTF(含 SCA 与故障注入题) | https://github.com/Keysight/RHme-2015 | 硬件安全 CTF 经典 | GitHub API 确认三届仓库(现位于 Keysight org) | 中 |
| 20 | Cryptology ePrint Archive | IACR | 在线 | 预印本库 | https://eprint.iacr.org/ | 领域最新成果第一落点;编辑部制,仅作范围/底线审核不评审 | 实访首页确认运营模式与 2026 年编号(超 2200 份) | 高 |

## 工具与数据集

| 名称 | 用途 | URL | 验证情况 |
|---|---|---|---|
| ChipWhisperer | 开源 SCA+故障注入一体化 | https://github.com/newaetech/chipwhisperer | 已验证 |
| lascar | Ledger's Advanced Side-Channel Analysis Repository(Python,LGPL) | https://github.com/Ledger-Donjon/lascar | 已验证(注:LedgerHQ/lascar 仅为镜像) |
| scared + estraces | eshard 的 Python SCA 攻击库+大数据集管理 | https://github.com/eshard/scared | 已验证 |
| Jlsca | Julia SCA 工具包(原 Riscure,现 Keysight org) | https://github.com/Keysight/Jlsca | 已验证 |
| SideChannelMarvels | Deadpool/Daredevil/Tracer/JeanGrey 等(偏白盒密码/DFA) | https://github.com/SideChannelMarvels | 已验证 |
| Riscure Inspector | 商业 SCA 测试平台 | 官网 403 反爬 | **未验证** |

## 入门路径

1. **Anderson《Security Engineering》3rd ed 第 18-19 章(免费 PDF)**——先建立"物理世界泄漏"的工程全景与历史语境
2. **Kocher 1996 + DPA 1999 + Brier CPA 2004 三篇原文**——按时间线读原典,理解计时→功耗→相关性区分器的演进
3. **Mangard/Oswald/Popp《Power Analysis Attacks》**——系统补齐建模、防护(掩码/隐藏)与工程细节
4. **ChipWhisperer SCA101 课程/Jupyter 教程**——有硬件则采集自己的轨迹复现 CPA;无条件可先读教程源码(或用本项目 `reproductions/` 仿真复现)
5. **Cryptopals Set 4 #31-32 + ASCAD 数据集**——零硬件完成计时攻击,再做功耗分析实验;此后以 TCHES 与 eprint 跟进前沿

## 纠错与存疑

**纠错(经实证核实):**
1. **Kelsey/Schneier/Wagner/Hall 论文 venue**:常见被引为 "SAC 1998/Selected Areas in Cryptography"、甚至 1996 年——实际正式出处为 **ESORICS 1998**(LNCS 1485, pp.97-110),另有期刊版 J. Computer Security 8(2-3):141-158, **2000**;Crossref 全库检索不存在 SAC 版本
2. **DPA 论文年份**:确为 CRYPTO **1999**,常见 "1998" 为误引
3. **TCHES 转换时间**:官方声明 "Starting with CHES 2018" 切换为期刊/会议混合模式,Crossref 最早 TCHES 论文为 2018-02-14(首卷 Vol.2018(1))——"2017 年创刊"的说法与存档不符
4. **ChipWhisperer 论文标题**:准确为 "...for Hardware **Embedded** Security Research"(常被漏掉 Embedded)
5. **失效链接**:dpacontest.org 现为待售停放域名,cosade.org DNS 已失效——引用时应改用存档或 Springer 卷
6. **仓库迁移**:Jlsca 与 RHme 仓库现位于 **Keysight** org(原 Riscure);lascar 正主仓库为 Ledger-Donjon;ASCAD 仓库已归档只读(2026-01-15)

**存疑(未能实际核实,引用前请复核):**
- DPA Contest 主办方(常见归于 TELECOM ParisTech)及 v2/v3 版本具体目标——官网已死且 archive.org 不可达;已核实部分:CHES 2008 启动、v1 为 DES/80,000 轨迹、v4/v4.2 为 AES RSM 防护
- COSADE 2010 首届举办地(常见说法 Cologne)——仅核实 2014 年为第 5 届
- Riscure Inspector 商业工具(官网 403)
- Mangard 书属 "Advances in Information Security vol.31" 系列的常见说法——Springer 页面未标注卷系
