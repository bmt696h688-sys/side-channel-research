# 01 · 功耗分析与剖析攻击(Power Analysis & Profiling SCA)

> 由调研 agent 于 2026-09-30 联网搜集,每条资源经权威来源实访验证(Crossref DOI 注册库、IACR eprint、TCHES 官网、Springer、GitHub、Coursera),置信度分级见每条标注;验证方法总述见 `../../verification/VERIFICATION.md`。

## 方法地图

```
非剖析攻击(只需少量已知明文/密文)
├── SPA  简单功耗分析(直接读轨迹特征,如RSA平方/乘法的波形差异)
├── DPA  差分功耗分析(Kocher 1999,划分函数+均值差)
├── CPA  相关性功耗分析(Brier 2004,汉明重量/距离模型+Pearson相关)★工程默认
└── MIA  互信息分析(Gierlichs 2008,免泄漏模型假设)
剖析攻击(先在相同设备上建模,再攻击)
├── Template Attack(Chari 2002,高斯模板,信息论最强)
├── Stochastic Attack(Schindler 2005,线性基回归)
└── ML/DL 剖析(Maghrebi 2016 → Cagli 2017 → ASCAD/Zaid 2020)
高阶攻击(对付掩码)
└── 二阶/高阶DPA(Messerges 2000起)
```

**本域复现锚点**: `../../reproductions/cpa_aes.js`(CPA 完整复现:16/16 字节恢复+噪声鲁棒性研究)、`../../reproductions/tvla_masking.js`(掩码实现的一阶/二阶泄漏检测)

## 领域综述

功耗侧信道通过测量密码设备运行时的功耗轨迹提取密钥,是嵌入式密码实现最实际的威胁之一。自 Kocher 等 1999 年 CRYPTO 提出 DPA 以来,该领域发展出 CPA(汉明重量/距离泄漏模型+相关性)、模板攻击(高斯剖析)、随机模型(stochastic)、MIA(互信息)等剖析与非剖析攻击范式,并已系统化为 Mangard/Oswald/Popp 2007 年专著。近十年主线是深度学习剖析攻击(2016 年起,以 ASCAD 为标准基准),以及对掩码实现的高阶攻击。工具链以 ChipWhisperer(动手)与 SCALib(研究)为代表。

## 资源清单

| # | 标题 | 作者 | 年份 | 出处/类型 | URL | 内容与重要性 | 验证证据 | 置信度 |
|---|---|---|---|---|---|---|---|---|
| 1 | Power Analysis Attacks: Revealing the Secrets of Smart Cards | S. Mangard, E. Oswald, T. Popp | 2007(精装 2007-03-12) | Springer 专著 | https://link.springer.com/book/10.1007/978-0-387-38162-6 | 领域唯一系统性教科书,覆盖 SPA/DPA/模板攻击与掩码等对策 | Springer 官网页:书名/三作者/Graz TU/精装 2007、ISBN 978-0-387-30857-9、338 页;Crossref 交叉到同 ISBN | 高 |
| 2 | Differential Power Analysis | P. Kocher, J. Jaffe, B. Jun | 1999 | CRYPTO '99(LNCS 1666, pp.388–397) | https://doi.org/10.1007/3-540-48405-1_25 | 开创性 DPA 论文(Crossref 记录被引 4360 次) | Crossref DOI 直查:题/作者/"Advances in Cryptology — CRYPTO' 99"/1999 | 高 |
| 3 | Correlation Power Analysis with a Leakage Model | E. Brier, C. Clavier, F. Olivier | 2004 | CHES 2004(LNCS, pp.16–29) | https://doi.org/10.1007/978-3-540-28632-5_2 | CPA 与汉明重量/汉明距离泄漏模型,实践中最常用的非剖析攻击 | Crossref DOI 直查+独立检索两次,均确认仅此三位作者(无 Walter),CHES 2004 | 高 |
| 4 | Template Attacks | S. Chari, J. R. Rao, P. Rohatgi | 2002(会议) | CHES 2002, LNCS 2523, pp.13–28 | https://doi.org/10.1007/3-540-36400-5_3 | 剖析攻击范式奠基(IBM Watson),信息论上最强 | Crossref:题/三作者/CHES 2002/LNCS,会议 2002 年举行、论文集 2003 年印行 | 高 |
| 5 | A Stochastic Model for Differential Side Channel Cryptanalysis | W. Schindler, K. Lemke, C. Paar | 2005 | CHES 2005(LNCS, pp.30–46) | https://doi.org/10.1007/11545262_3 | 随机模型/stochastic 攻击奠基,泄漏线性基+系数回归 | Crossref:三作者/CHES 2005/被引 354 | 高 |
| 6 | Mutual Information Analysis | B. Gierlichs, L. Batina, P. Tuyls, B. Preneel | 2008 | CHES 2008(LNCS, pp.426–442) | https://doi.org/10.1007/978-3-540-85053-3_27 | 免泄漏模型的通用剖析攻击 | Crossref:题/四作者(拼写 Gierlichs)/CHES 2008 | 高 |
| 7 | Mutual Information Analysis: a Comprehensive Study | L. Batina, B. Gierlichs, E. Prouff, M. Rivain, F.-X. Standaert, N. Veyrat-Charvillon | 2011 | Journal of Cryptology | https://doi.org/10.1007/s00145-010-9084-8 | MIA 的系统化理论版 | Crossref 检索返回完整元数据 | 高 |
| 8 | Using Second-Order Power Analysis to Attack DPA Resistant Software | T. S. Messerges | 2000 | CHES 2000(LNCS, pp.238–251) | https://doi.org/10.1007/3-540-44499-8_19 | 高阶 DPA/对掩码实现攻击的经典起点 | Crossref:作者/CHES 2000/被引 280 | 高 |
| 9 | Introduction to Side-Channel Attacks | F.-X. Standaert | 2010 | 《Secure Integrated Circuits and Systems》章节, Springer | https://doi.org/10.1007/978-0-387-71829-3_2 | 极佳的领域入门综述章节 | Crossref:题/作者(Springer 系统录入)/2010 | 高 |
| 10 | Machine learning in side-channel analysis: a first study | G. Hospodar, B. Gierlichs, E. De Mulder, I. Verbauwhede, J. Vandewalle | 2011 | Journal of Cryptographic Engineering 1(4):293–302 | https://doi.org/10.1007/s13389-011-0023-x | ML-SCA 最早系统研究 | Crossref:五作者/JoCE 1(4)/2011 | 高 |
| 11 | Breaking Cryptographic Implementations Using Deep Learning Techniques | H. Maghrebi, T. Portigliatti, E. Prouff | 2016 | SPACE 2016(LNCS, pp.3–26) | https://doi.org/10.1007/978-3-319-49445-6_1 | 深度学习 SCA 的开山之作(MLP/CNN) | Crossref:三作者/SPACE 2016/被引 392 | 高 |
| 12 | Convolutional Neural Networks with Data Augmentation against Jitter-Based Countermeasures | E. Cagli, C. Dumas, E. Prouff | 2017 | **CHES 2017**(LNCS 10529, pp.45–68,非 CRYPTO) | https://eprint.iacr.org/2017/740 | CNN+数据增强对抗时域抖动,免预处理剖析攻击里程碑 | Crossref DOI 10.1007/978-3-319-66787-4_3 明确为 CHES 2017 论文集;eprint 号 2017/740 | 高 |
| 13 | Study of Deep Learning Techniques for Side-Channel Analysis and Introduction of ASCAD Database | E. Prouff, R. Strullu, R. Benadjila, E. Cagli, C. Dumas | 2020(在线 2018/2019) | Journal of Cryptographic Engineering 10(2) | https://eprint.iacr.org/2018/053 | 引入 ASCAD 基准数据集,DL-SCA 系统研究 | eprint 2018/053 页面(注明发表于 JoCE 10(2), DOI 10.1007/s13389-019-00220-8);GitHub ASCAD 仓库交叉 | 高 |
| 14 | Methodology for Efficient CNN Architectures in Profiling Attacks | G. Zaid, L. Bossuet, A. Habrard, A. Venelli | 2019-11-19(卷期 2020) | TCHES 2020(1):1–36 | https://tches.iacr.org/index.php/TCHES/article/view/8391 | ASCAD 上最著名的高效 CNN 架构方法论 | TCHES 官网文章页:卷 2020 期 1、pp.1–36、2019-11-19;Crossref 交叉 | 高 |
| 15 | Revisiting a Methodology for Efficient CNN Architectures in Profiling Attacks | L. Wouters, V. Arribas, B. Gierlichs, B. Preneel | 2020 | TCHES 2020(3):147–168 | https://doi.org/10.46586/tches.v2020.i3.147-168 | 对 #14 的批判性复现与精简,方法论纠偏 | Crossref 完整元数据 | 高 |
| 16 | A Comprehensive Study of Deep Learning for Side-Channel Analysis | L. Masure, C. Dumas, E. Prouff | 2019-11(卷期 2020) | TCHES 2020(1):348–375 | https://doi.org/10.46586/tches.v2020.i1.348-375 | DL-SCA 理论:交叉熵损失≈感知信息最大化 | Crossref DOI 直查 | 高 |
| 17 | Applications of machine learning techniques in side-channel attacks: a survey | B. Hettwer, S. Gehrer, T. Güneysu | 2020(在线 2019) | Journal of Cryptographic Engineering 10(2):135–162 | https://doi.org/10.1007/s13389-019-00212-8 | 近年 ML/DL-SCA 权威综述 | Crossref DOI 直查+检索交叉 | 高 |
| 18 | Introduction to differential power analysis | P. Kocher, J. Jaffe, B. Jun, P. Rohatgi | 2011 | Journal of Cryptographic Engineering 1(3) | https://doi.org/10.1007/s13389-011-0006-y | 原作者团队的 DPA 教程性重述,含 SPA 概念 | Crossref 检索完整元数据 | 高 |
| 19 | Practical improvements of side-channel attacks on AES: feedback from the 2nd DPA contest | C. Clavier, J.-L. Danger, S. Guilley 等 19 人 | 2014 | Journal of Cryptographic Engineering 4(4):259–274 | https://doi.org/10.1007/s13389-014-0075-9 | DPA Contest v2(掩码 AES)的官方复盘 | Crossref DOI 直查:19 位作者/JoCE 4(4)/2014 | 高 |
| 20 | Analysis and Improvements of the DPA Contest v4 Implementation | S. Bhasin, M. Bruneau, J.-L. Danger, S. Guilley, Z. Najm | 2014 | SPACE 2014(LNCS 8804) | https://doi.org/10.1007/978-3-319-12060-7_14 | DPA Contest v4(旋转 S 盒掩码 AES)分析与修复 | Crossref 检索完整元数据 | 高 |
| 21 | ChipWhisperer: An Open-Source Platform for Hardware Embedded Security Research | C. O'Flynn, Z. Chen | 2014 | **COSADE 2014**(LNCS, pp.243–260,非 CARDIS) | https://doi.org/10.1007/978-3-319-10175-0_17 | 开源功耗/毛刺攻击平台论文 | Crossref:题(含 "Embedded")/二作者/COSADE 2014 | 高 |
| 22 | Hardware Security(公开课) | G. Qu(University of Maryland) | — | Coursera 课程 | https://www.coursera.org/learn/hardware-security | 模块 4 覆盖功耗分析等物理攻击;3.7 万人注册 | Coursera 页面实访:教师/模块内容/评分 4.3 | 高 |
| 23 | The Hardware Hacking Handbook: Breaking Embedded Security with Hardware Attacks | J. van Woudenberg, C. O'Flynn | 2021(待核) | No Starch Press 书籍 | https://github.com/HardwareHackingHandbook/notebooks | 实战向硬件攻击书(含功耗 SCA/故障注入),配套 Jupyter | GitHub 官方配套仓库实访;出版社/年份页 403 未直接核实 | 中 |

## 工具与数据集

| 名称 | 用途 | URL | 验证情况 |
|---|---|---|---|
| ChipWhisperer (NewAE Technology) | 开源功耗采集+分析+毛刺攻击全工具链,含 Jupyter 教程 | https://github.com/newaetech/chipwhisperer | 已验证:仓库实访,GPL,约 1.6k stars |
| SCALib (SIMPLE-Crypto) | 研究级 SCA Python 库(SNR/模板/随机模型/ML 等) | https://github.com/simple-crypto/scalib | 已验证:仓库实访;JOSS 2023 论文 DOI 10.21105/joss.05196 经 Crossref 确认 |
| ASCAD (ANSSI/CEA) | 掩码 AES 剖析攻击标准数据集(ATmega8515 与 STM32)+训练脚本 | https://github.com/ANSSI-FR/ASCAD | 已验证:仓库实访(BSD 许可)。**注意:2026-01-15 起已归档只读** |
| DPA Contest v2/v4 | 历史 SCA 竞赛数据(掩码/防攻击 AES) | 原官网 dpacontest.org 已失效(域名转售停放) | 论文层面已验证(#19、#20);官网本体未能访问 |
| HardwareHackingHandbook/notebooks | 书籍配套动手环境(Vagrant+Jupyter) | https://github.com/HardwareHackingHandbook/notebooks | 已验证:raw README 实访 |

## 入门路径

1. **F.-X. Standaert, "Introduction to Side-Channel Attacks" (2010)** — 20 页建立攻击模型、泄漏与信息论框架的全局图景
2. **Mangard/Oswald/Popp (2007) 全书** — 系统学习 SPA/DPA/CPA/模板攻击与对策,仍是最好的单一教材
3. **三篇经典原文对照读: Kocher 1999 (DPA) → Brier 2004 (CPA) → Chari 2002 (Template)** — 非剖析与剖析两条路线的原始思路;辅以 Schindler 2005(stochastic)与 Gierlichs 2008 (MIA)
4. **ChipWhisperer Jupyter 教程 + Hardware Hacking Handbook notebooks** — 用真实硬件采集功耗、跑 CPA(无硬件可先用本项目 `reproductions/cpa_aes.js` 仿真复现)
5. **Hettwer 2020 综述 → Maghrebi 2016 → Cagli 2017 → Prouff 2018/ASCAD → Zaid 2020(+Wouters 2020 复现)** — 进入深度学习剖析攻击前沿

## 纠错与存疑(引用本域文献前必读)

**已核实的常见引用错误:**
1. **CPA 论文作者**: 仅 Eric Brier、Christophe Clavier、Francis Olivier 三人,**不含 Colin Walter**(Crossref 两次独立查询确认)
2. **Cagli et al. 2017 发表处**: 为 **CHES 2017**(Taipei,LNCS 10529),**不是 CRYPTO 2017**;eprint 号为 **2017/740**
3. **MIA 作者姓氏**: 正确拼写为 **Gierlichs**,非 "Gierlicchs"
4. **Zaid et al. (ASCAD 论文)**: 正式引用为 **TCHES vol. 2020, issue 1, pp.1–36**(在线发表 2019-11-19);常被引作 "2019" 或 "2020(3)" 均不准确
5. **ChipWhisperer 论文**: 发表于 **COSADE 2014** 而非 CARDIS;标题为 "...for Hardware **Embedded** Security Research"
6. **Template Attacks 年份**: 会议为 CHES 2002,Springer 论文集 2003 年印行,两种年份均见引用
7. **Prouff et al. ASCAD 论文**: 最终发表处为 Journal of Cryptographic Engineering 10(2) (2020),并非会议论文
8. **Benadjila** 的名为 **Ryad** Benadjila

**存疑(未能实际核实,已隔离):**
- [未验证] TELECOM Paris 侧信道 MOOC(FUN-MOOC 平台):平台搜索无渲染结果,无法确认其存在与现状
- [未验证-部分] Hardware Hacking Handbook 出版社页 403(书籍与配套仓库已验证)
- [未验证] Kocher/Jaffe/Jun 1998 年 CRI 技术报告原始 PDF(可用已验证的 2011 年 JoCE 版替代)
- [未验证] dpacontest.org 历史快照(域名已停放转售)
