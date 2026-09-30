---
name: sca-template-attack
description: "模板攻击(Template Attack, Chari-Rao-Rohatgi CHES 2002):最强的剖析(profiling)侧信道攻击——在相同/相似设备上为每个密钥假设建立高斯模板(均值向量+协方差),攻击阶段用极大似然从极少量轨迹恢复密钥。适用于有 profiling 设备的侧信道评估、信息论泄漏上限分析、授权渗透测试。不适用于无相似设备或普通分类建模场景。关键词: template attack, 模板攻击, profiling attack, Gaussian template, 高斯模板, maximum likelihood, 极大似然, 侧信道, 功耗分析。"
---

# 模板攻击(Template Attack)

## 适用场景与不适用场景

**适用**:
- 攻击者能完全控制一台**相同或相似**设备,可任意设置密钥/输入采集大量轨迹(profiling)
- 攻击阶段只有极少量轨迹(甚至 1 条)——模板攻击以 profiling 成本换取攻击样本效率
- 评估实现的信息论泄漏上限("最强已知攻击"基准);对抗高噪声

**不适用**:
- 没有相似设备:模板失配会让攻击完全失效 → 非剖析攻击(sca-cpa-attack)
- 设备工艺/时钟漂移大、无法控制采集条件 → 同样受失配限制(ML 剖析也救不了根本问题)
- 计时/缓存信道

## 前置条件与输入

- profiling 设备(与目标同型号/同批次最佳),可为每个假设值采集成百上千条标签化轨迹
- 攻击阶段:目标设备的少量轨迹
- 兴趣点(POI)挑选方法(见步骤 1)

## 方法学步骤

1. **选中间值与兴趣点(POI)**:
   - 中间值与 CPA 相同,如 v = SBox(p_i ⊕ k_i)(256 类)
   - POI 挑选:逐点 t 检验(不同 v 值之间均值差异最大的点)、PCA、或先跑一次 DPA/CPA 取攻击迹峰值
   - 取 2–6 个 POI:维数升高,样本需求平方级增长
2. **建模板(profiling)**:对每个假设值 v,在 POI 上估计多元高斯:
   模板 = (μ_v ∈ R^d, Σ_v ∈ R^(d×d))
   样本不足时退化为对角协方差或共享协方差池化(线性判别式),牺牲精度换数值稳定
3. **攻击(极大似然判决)**:对目标轨迹 y ∈ R^d,每个假设 v 的对数似然:
   log p(y|v) = −½ (y−μ_v)^T Σ_v^(−1) (y−μ_v) − ½ log|Σ_v| + const
   取 argmax_v;逐字节重复
4. **多轨迹融合**:对 m 条攻击轨迹假设独立,似然相乘(对数相加)后判决;成功率随 m 上升极快——这是模板攻击相对 CPA 的本质优势
5. **评估**:success rate 与 guessing entropy(密钥排名)对攻击轨迹数 m 作图;报告恢复所需最小 m
6. **与 CPA 的对比定位**:CPA 无需 profiling 但需更多攻击轨迹;模板信息论最强。评估报告建议两者都做,并说明 profiling 条件

## 关键细节与常见坑

- **失配是头号杀手**:profiling 与攻击设备的工艺/时钟/温度差异会让似然排序失效。缓解:同设备分时 profiling(威胁模型允许时)、只用高鲁棒 POI、池化协方差
- 维数灾:全轨迹点建全协方差必然病态——必须 POI + 对角/正则化(Σ + λI)
- 模板类别数 = 中间值空间大小:字节假设 256 类;每类样本数建议 ≥ 10×POI 数
- 与 stochastic 攻击的关系:Schindler 等 2005 用线性基回归代替逐类高斯,样本需求更低,可视为模板的低秩近似
- 掩码实现:为 (v, mask) 联合建模板(类数平方级增长)或对 share 分别处理——高阶模板攻击
- **年份口径**:会议为 CHES 2002,Springer 论文集 2003 年印行(LNCS 2523, pp.13–28),两种年份均见于引用;作者 Chari/Rao/Rohatgi(IBM Watson)

## 参考实现与工具

- SCALib(SIMPLE-Crypto)——研究级模板/随机模型实现,知识库 07 域验证
- lascar、scared、Jlsca——含剖析攻击支持,07 域验证
- 数据集:ASCAD(掩码 AES,ATmega8515/STM32;注意为功耗迹线,且仓库 2026-01-15 起只读归档)可作模板/ML 攻击公开基准
- 本项目无独立模板复现;其高斯建模+似然判决核心可在 `C:\Users\Administrator\.zcode\workspace\default\side-channel-research\reproductions\cpa_aes.js` 的仿真数据管线上扩展(假设矩阵构造完全复用)

## 已验证参考文献

- S. Chari, J. R. Rao, P. Rohatgi, "Template Attacks", CHES 2002, LNCS 2523, pp.13–28(论文集 2003 年印行)——剖析攻击范式奠基 [高]
- W. Schindler, K. Lemke, C. Paar, "A Stochastic Model for Differential Side Channel Cryptanalysis", CHES 2005(LNCS, pp.30–46)——随机模型对照路线 [高]
- S. Mangard, E. Oswald, T. Popp, Power Analysis Attacks: Revealing the Secrets of Smart Cards, Springer, 2007——模板攻击与随机模型的系统章节 [高]
- L. Masure, C. Dumas, E. Prouff, "A Comprehensive Study of Deep Learning for Side-Channel Analysis", TCHES 2020(1):348–375——现代剖析攻击的信息论视角 [高]

## 防御与缓解视角

- 模板攻击给出实现泄漏的"信息论上限":防到模板攻击打不动,非剖析攻击通常也无望
- 掩码阶数 d 使模板需联合建模的变量数指数增长,推高攻击者 profiling 成本
- 评估闭环:TVLA 检测 → 模板/CPA 攻击性验证 → 掩码加固 → 复测(参见 tvla_masking.js 的二阶检出案例)

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;profiling 与攻击真实设备需书面授权。
