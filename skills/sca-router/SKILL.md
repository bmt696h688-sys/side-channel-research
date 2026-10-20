---
name: sca-router
description: "侧信道攻击(side-channel attack/SCA)研究总入口与场景路由。任何涉及功耗分析(power analysis/SPA/DPA/CPA)、电磁泄漏(EM/TEMPEST)、计时与缓存侧信道(timing/cache/Spectre)、声光热物理侧信道(acoustic/optical)、Rowhammer、掩码/恒定时间对策、TVLA 泄漏评估等密码实现安全、物理安全评估、授权渗透测试问题时,先加载本技能:判断泄漏源类型并路由到具体子技能。不适用于普通性能优化、常规计时问题或非授权目标。关键词: side-channel, SCA, 侧信道, 功耗分析, 泄漏, physical security。"
---

# 侧信道研究路由器(SCA Router)

## 适用场景与不适用场景

**适用**:
- 问题涉及密码实现(软件/硬件/固件)通过物理量泄漏秘密:时间、功耗、电磁、声/光/热、缓存与微架构状态
- 授权渗透测试中的物理安全评估(智能卡、嵌入式设备、密码库、服务器)
- 防御研究:掩码、恒定时间编程、泄漏检测与认证评估(TVLA/FIPS 140-3 语境)
- SCA 学习、文献定位、实验设计

**不适用**:
- 普通性能优化与常规计时问题(耗时与秘密无关)
- 纯密码学理论(算法层面,不涉及实现)
- 网络协议漏洞、Web 漏洞等非物理信道问题
- 任何未授权目标(见"伦理与授权边界")

## 前置条件与输入

- 一段问题描述:目标设备/代码、怀疑泄漏的物理量、攻击者能力假设(接触/近场/远程/共享硬件)
- 明确授权语境(自有设备、实验环境或书面授权)

## 方法学步骤

1. **判断这是不是侧信道问题**,三要素缺一不可:
   - 存在秘密(密钥/口令/明文)影响某个**物理可观测量**的机制(分支、访存、总线翻转、电流、辐射……)
   - 攻击者在威胁模型内**可以测量**该量
   - 该依赖**可被区分**:单次可读(SPA 级)或统计可分(其余方法)
2. **分类泄漏源**:
   - 时间类:执行时长依赖秘密 → 算法计时/缓存计时/分支预测/SMT 端口
   - 功耗类:电流消耗依赖秘密(串联电阻/电流探头)
   - 电磁类:近场/远场辐射;显示器内容重建(TEMPEST)
   - 声光热机械类:键盘声、风扇噪声、LED、屏幕反射、光子发射、余温
   - 缓存/微架构状态类:Prime+Probe、Flush+Reload、瞬态执行残留
   - 相邻类:Rowhammer(主动扰动而非被动观测,同属物理安全,单独路由)
3. **查映射表路由**到具体技能,按其方法学执行;防御类问题(掩码/恒定时间)配合对应攻击技能做验证。
4. **无硬件时**:走仿真路径——本项目 reproductions/ 下三个零依赖实验(CPA/计时/TVLA)完整演示方法学核心。
5. **跨类问题**:按泄漏源分别路由;评估报告需覆盖全部可达信道,而非只测最方便的一个。

### 场景 → 技能映射表(覆盖其余 18 个技能)

| 用户问题特征 | 加载技能 |
|---|---|
| 少量功耗轨迹,直接目测识别操作(RSA 平方/乘法、AES SBox) | sca-spa-analysis |
| 批量轨迹+已知明文,经典均值差分恢复密钥(DPA) | sca-dpa-attack |
| 汉明重量/距离模型 + Pearson 相关(工程默认) | sca-cpa-attack |
| 能在相同/相似设备上先建模(profiling 高斯模板) | sca-template-attack |
| MLP/CNN 深度学习剖析攻击(ASCAD、抗抖动) | sca-ml-profiling |
| 检测设备是否泄漏/认证评估(TVLA、Welch t) | sca-tvla-leakage-detection |
| 电磁探头、近场扫描、远场 SDR、机壳电势 | sca-em-emanation |
| 远程网络计时、算法计时、字节级前缀攻击 | sca-remote-timing |
| 共享 LLC、Prime+Probe/Evict+Time、AES T-table、跨沙箱 | sca-cache-prime-probe |
| clflush + 共享页、Flush+Reload、RSA 窗口/ECDSA nonce | sca-cache-flush-reload |
| Spectre/Meltdown、瞬态执行、KPTI/retpoline | sca-spectre-meltdown |
| Rowhammer、DRAM 位翻转、ECC/TRR 有效性 | sca-rowhammer |
| 键盘声学、声学密码分析、打印机噪声 | sca-acoustic-side-channel |
| TEMPEST、van Eck、显示器/HDMI 内容重建 | sca-tempest-video-reconstruction |
| 电池/USB/无线充电电流、机壳地电位、电源 LED | sca-power-and-sensor-side-channels |
| 设计/评估掩码对策(ISW、阈值实现) | sca-masking-countermeasures |
| 编写或验证恒定时间代码(dudect、ct-verif) | sca-constant-time-defense |
| 功耗/EM 轨迹采集工程(触发、采样、对齐、探头) | sca-trace-acquisition |
| 轨迹预处理(对齐/去同步、降噪/平均、去趋势、POI/降维、压缩、DL 管线) | sca-trace-preprocessing |

## 关键细节与常见坑

- 侧信道是**意外**的信息通道:密码协议正确 ≠ 实现安全;泄漏来自实现层的数据依赖行为
- 先问威胁模型:攻击者能接触设备(功耗/EM 近场)还是只能远程(计时/缓存)?决定方法选择
- 统计类攻击都需轨迹数规划:噪声越大样本越多(定量相变见 cpa_aes.js 的 σ×N 矩阵)
- 故障注入(电压/时钟毛刺、激光)是主动攻击,与本路由的被动侧信道不同;Rowhammer 是软件可触发的扰动,作为边界情况归入 sca-rowhammer
- 防御结论要对应信道:掩码防功耗/EM,恒定时间防计时/缓存,二者正交且常需叠加

## 参考实现与工具

- `C:\Users\Administrator\.zcode\workspace\default\side-channel-research\reproductions\`——三个零依赖 Node.js 实验(CPA/计时/TVLA),验证锚点见各技能
- `C:\Users\Administrator\.zcode\workspace\default\side-channel-research\knowledge\`——七个已验证文献域(功耗/EM/计时缓存/物理/对策/经典/工具)
- 工具生态(知识库 07 域验证):ChipWhisperer(采集+分析)、SCALib/lascar/scared/Jlsca(分析库)、Mastik(微架构)、dudect(恒定时间检测)

## 已验证参考文献

- F.-X. Standaert, "Introduction to Side-Channel Attacks", in Secure Integrated Circuits and Systems, Springer, 2010——20 页建立攻击模型与信息论框架 [高]
- S. Mangard, E. Oswald, T. Popp, Power Analysis Attacks: Revealing the Secrets of Smart Cards, Springer, 2007 [高]
- Q. Ge, Y. Yarom, D. Cock, G. Heiser, "A survey of microarchitectural timing attacks and countermeasures on contemporary hardware", J. Cryptographic Engineering 8(1):1–27, 2018 [高]
- R. Anderson, Security Engineering, 3rd ed., Wiley, 2020——第 18 章 Physical Tamper Resistance、第 19 章 Side Channels,作者主页免费 PDF [高]
- J. Kelsey, B. Schneier, D. Wagner, C. Hall, "Side Channel Cryptanalysis of Product Ciphers", ESORICS 1998(LNCS 1485, pp.97–110);期刊版 J. Computer Security 8(2–3):141–158, 2000——"侧信道"概念系统化的经典(注意 venue 为 ESORICS 1998,非 SAC)[高]

## 防御与缓解视角

路由到攻击技能的同时同步考虑对应防御:掩码(sca-masking-countermeasures)、恒定时间(sca-constant-time-defense)、泄漏检测与认证(sca-tvla-leakage-detection)、微架构缓解(sca-spectre-meltdown)。标准评估闭环:检测泄漏 → 攻击性验证 → 加对策 → 复测。

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;对真实目标(他人设备、生产系统)进行任何测量或攻击前必须获得书面授权。
