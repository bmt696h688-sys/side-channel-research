---
name: sca-spa-analysis
description: "简单功耗分析(Simple Power Analysis/SPA):直接观察少量功耗轨迹的波形特征识别密码操作(RSA 平方/乘法、AES SBox/轮函数)并推断秘密。适用于智能卡/嵌入式密码实现安全评估、授权渗透测试中的功耗轨迹人工判读。不适用于普通性能分析或无功耗测量数据的常规计时问题。关键词: SPA, simple power analysis, 简单功耗分析, power trace, 功耗轨迹, 侧信道, 泄漏判读。"
---

# 简单功耗分析(SPA)

## 适用场景与不适用场景

**适用**:
- 已有(或能采集)目标设备功耗轨迹,想通过目测/简单统计识别操作序列
- 典型目标:RSA/ECC 等含数据依赖控制流的实现(窗口指数、double-and-add 标量乘)、无掩码 AES 的轮结构识别
- 快速判断实现的泄漏"可读性",为后续 DPA/CPA 做侦察、定位兴趣时间点

**不适用**:
- 噪声大、操作不可目测分辨 → 用 sca-dpa-attack / sca-cpa-attack 的统计区分器
- 掩码/随机延迟实现:操作特征被打散,单轨迹 SPA 基本失效
- 无物理测量条件的纯网络计时问题 → sca-remote-timing

## 前置条件与输入

- 目标设备功耗轨迹:串联电阻 / 电流探头 / ChipWhisperer 采集(采集工程见 sca-trace-acquisition)
- 目标算法与实现的先验知识:轮数、是否窗口法、是否有随机化
- 轨迹基本对齐(触发同步)

## 方法学步骤

1. **采集与预处理**:用触发信号对齐目标操作窗口;采样率 ≥ 目标主频的 5–10 倍;至少保存覆盖单次完整密码操作的轨迹
2. **结构识别**:目测轨迹的周期性包络——时钟周期级锯齿、轮函数级重复块。AES-128 应呈现 10 个相似电流块;RSA 模乘呈现大幅值、较长的电流包络
3. **操作判别(RSA/ECC 的核心场景)**:
   - 窗口法指数中,平方(S)与乘法(M)的功耗包络幅值/形状有可测差异
   - 从 S/M 序列推指数位:每窗口 w 位,序列模式对应指数位,逐步恢复
   - 判别方法:在 S 与 M 的特征区间上建立均值±σ 参考带,看单条轨迹落入哪个带;自动化可用模板分类(见 sca-template-attack)
4. **AES 场景**:识别 SBox 查表与轮密钥加的电流峰位置,为 CPA 定位泄漏时间点
5. **结果验证**:用恢复的部分秘密做一致性检查(已知明密文对、指数低位等);SPA 常只恢复部分秘密,剩余交给 DPA/CPA
6. **判据**:两操作类别在特征统计量上的间隔应显著大于类内 σ(粗略 ≥3σ);否则放弃 SPA 升级为统计攻击

## 关键细节与常见坑

- SPA 的本质是"单轨迹信噪比足够高",对噪声、失配、随机延迟极不耐受
- 可读性取决于实现的规整性:软件实现比硬件规整、无流水线 8 位 MCU 比复杂 SoC 可读
- RSA 盲化(blinding)破坏 S/M 序列与秘密的对应关系,SPA 随之失效
- 轨迹物理量:串联电阻测的是电流;关注波形形状与相对幅值,而非绝对标定
- 电源去耦电容会滤掉高频开关活动——看不到特征时换近场 EM 探头(sca-em-emanation),不要轻易下"无泄漏"结论
- SPA 与 DPA/CPA 不是竞争关系:SPA 侦察定位,统计攻击提取密钥

## 参考实现与工具

- ChipWhisperer(采集+分析,SCA101 课程 26 课)——知识库 07 域验证
- SCALib / lascar / scared(Python 分析库)——知识库 07 域验证
- `C:\Users\Administrator\.zcode\workspace\default\side-channel-research\reproductions\tvla_masking.js`——其未掩码实现的 SBox 泄漏点 |t| 达 19–71,统计上佐证"未掩码软件实现的 SBox 活动在轨迹上高度可见"这一 SPA 前提

## 已验证参考文献

- P. Kocher, J. Jaffe, B. Jun, "Differential Power Analysis", CRYPTO 1999(LNCS 1666, pp.388–397)——SPA 概念与 DPA 一并提出的奠基论文 [高]
- P. Kocher, J. Jaffe, B. Jun, P. Rohatgi, "Introduction to differential power analysis", Journal of Cryptographic Engineering 1(3), 2011——原作者团队的教程性重述,含 SPA 概念 [高]
- S. Mangard, E. Oswald, T. Popp, Power Analysis Attacks: Revealing the Secrets of Smart Cards, Springer, 2007——SPA/DPA/模板攻击与对策的最系统教材 [高]
- F.-X. Standaert, "Introduction to Side-Channel Attacks", in Secure Integrated Circuits and Systems, Springer, 2010 [高]

## 防御与缓解视角

- 根源是数据依赖控制流:改用恒定操作序列(always-multiply、Montgomery ladder)
- 随机化:RSA 盲化、随机延迟(Coron-Kizhvatov CHES 2009/2010,见 sca-masking-countermeasures)、操作 shuffling,降低轨迹可读性
- 结构性防御:掩码(sca-masking-countermeasures)、隐藏类对策(双轨逻辑 WDDL)

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;对真实设备进行功耗测量需书面授权。
