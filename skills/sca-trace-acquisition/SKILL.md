---
name: sca-trace-acquisition
description: "功耗/EM 轨迹采集工程:触发与同步、采样率与分辨率、探头选择(串联电阻/电流探头/近场 EM)、噪声与对齐控制、示波器参数、ChipWhisperer 实操路径(SCA101 课程)、公开数据集(ASCAD 等)。适用于侧信道实验搭建、智能卡/嵌入式设备评估的采集环节、授权渗透测试准备。不适用于普通信号采集或性能 profiling。关键词: trace acquisition, 轨迹采集, power measurement, 功耗测量, oscilloscope, 示波器, ChipWhisperer, 近场探头, sampling rate, 采样率, 侧信道。"
---

# 功耗/EM 轨迹采集工程

## 适用场景与不适用场景

**适用**:
- 搭建侧信道实验:为 SPA/DPA/CPA/模板/ML 攻击或 TVLA 评估提供高质量轨迹
- 评估采集链路本身的信噪比与对齐误差(它们直接决定攻击所需轨迹数)
- 选择硬件方案(ChipWhisperer vs 示波器+探头)与公开数据集

**不适用**:
- 普通信号完整性/EMC 测量(无秘密依赖目标)
- 纯软件计时信道(sca-remote-timing)
- 性能 profiling(采样物理量,不是软件指标)

## 前置条件与输入

- 目标设备与控制接口:能否注入触发信号(GPIO/固件钩子)、能否重复执行同一运算
- 采集设备:示波器(带宽/采样率/分辨率/存储深度)或 ChipWhisperer(Lite/Nano/Pro/Husky)
- 探头:串联小电阻(侵入)、电流探头(非侵入)、近场 EM 探头(磁环/电场)

## 方法学步骤

1. **确定采集方案**:
   - 串联电阻法:目标 VDD 串 5–50Ω,测其压降 ∝ 电流——精度高但需改动供电
   - 电流探头:夹在供电线上,非侵入;带宽与磁饱和是限制
   - 近场 EM:贴封装网格扫描定位(见 sca-em-emanation)——无需改供电,空间选择性好
2. **触发与同步**:
   - 固件在目标运算(如 AES 单轮)前拉高 GPIO,采集卡以此触发——对齐质量的根本
   - 触发抖动 → "触发后过采样 + 软件对齐"补偿;无触发源(黑盒设备)用能量包络或互相关对齐
3. **采样参数**:
   - 采样率 ≥ 目标主频的 5–10 倍(开关瞬态在时钟沿,欠采样会削峰)
   - 分辨率 8–12 bit;垂直量程调到信号满量程的 60–90%(防量化噪声主导)
   - 采集窗口只覆盖感兴趣运算(如首轮 SBox),减少数据量与离线搜索成本
4. **输入与元数据管理**:
   - 每条轨迹记录:明文/密文、随机数、样本数组
   - TVLA 需 fixed/random 两组**交替**采集(防温度漂移趋势被误判为泄漏)
   - 明文字节在 256 值上覆盖均匀(否则攻击假设欠约束,见 cpa_aes.js 的假设矩阵)
5. **噪声控制与量化**:
   - 稳压供电、屏蔽干扰、恒温;平均化慎用(会抹掉操作差异)
   - 量化链路噪声 σ:同一输入重复采 100 条,逐点标准差;σ 直接进入所需轨迹数公式 ρ ≈ √(Var/(Var+σ²))(见 sca-cpa-attack 与 cpa_aes.js 的 σ×N 相变表:σ=3.0 时 N=50 仅 6/16、N=300 才 16/16)
6. **对齐与存储**:
   - 软件对齐:互相关峰值对齐/动态时间规整;随机延迟对策用重采样或交给 CNN 数据增强(sca-ml-profiling)
   - 存储按 (N × T) 矩阵 + 元数据;estraces/scared 可管理大数据集
7. **ChipWhisperer 实操路径**:
   - SCA101 课程(26 课)从连接目标板、采集到 CPA 完整走一遍;Jupyter 教程在独立仓库 chipwhisperer-jupyter
   - Python API 循环采集,scope.gain/samples/offset 逐步调优
8. **无硬件路径**:公开数据集(ASCAD 掩码 AES,注意为功耗迹线且 2026-01 起只读归档;CHES 2016 CTF 轨迹)或本项目零依赖仿真复现

## 关键细节与常见坑

- **地环路**:示波器与目标共地不当引入工频干扰——差分探头/隔离是标准解
- 探头带宽不足会平滑开关瞬态,泄漏点"变矮变宽"而非消失——易被误判为低泄漏
- 去耦电容就近供给瞬态电流:串联电阻的测点选在电容前还是后,信号形状不同
- 采样钟与目标钟成整数关系会产生走样条纹;略偏置采样率可避免系统性走样
- 触发到数据的固定延迟要扣除;时钟漂移在长采集中积累,分段触发更稳
- **ASCAD 是功耗(Icc)迹线不是 EM**——跨域引用勿写错;仓库 2026-01-15 起归档只读
- DPA Contest 官网已死(域名停放转售),历史数据以论文层为准;新项目用 ASCAD
- 温度/供电漂移会让"前后采的两组"出现系统差异,被 TVLA 误判为泄漏——交替采集是纪律

## 参考实现与工具

- ChipWhisperer(https://github.com/newaetech/chipwhisperer,GPL;Lite/Nano/Pro/Husky 硬件线)+ SCA101 26 课教程——知识库 07 域验证
- 分析/管理库:SCALib(SIMPLE-Crypto)、lascar(正主仓库 Ledger-Donjon)、scared + estraces(eshard)、Jlsca(现 Keysight org)——07 域验证
- 公开数据集:ASCAD(ANSSI,已归档只读)、CHES 2016 CTF 轨迹(镜像 colinoflynn/ches2016ctf)、Keystroke-Datasets(声学域)——07 域验证
- 本项目仿真锚点:`C:\Users\Administrator\.zcode\workspace\default\side-channel-research\reproductions\`(cpa_aes.js / timing_attack.js / tvla_masking.js;固定种子、FIPS-197 与 SP 800-38A 已知答案测试锚定,零成本验证方法学核心)

## 已验证参考文献

- C. O'Flynn, Z. Chen, "ChipWhisperer: An Open-Source Platform for Hardware Embedded Security Research", COSADE 2014(LNCS, pp.243–260)——**注意 venue 为 COSADE 2014(非 CARDIS),标题含 "Embedded"** [高]
- S. Mangard, E. Oswald, T. Popp, Power Analysis Attacks: Revealing the Secrets of Smart Cards, Springer, 2007——测量设置、噪声建模与攻击-评估工程章节 [高]
- J. van Woudenberg, C. O'Flynn, The Hardware Hacking Handbook: Breaking Embedded Security with Hardware Attacks, No Starch Press, 2021——实战向采集/攻击专著(出版社页未直接核实,配套 notebooks 仓库已验证)[中]
- E. Prouff, R. Strullu, R. Benadjila, E. Cagli, C. Dumas, "Study of Deep Learning Techniques for Side-Channel Analysis and Introduction of ASCAD Database", J. Cryptographic Engineering 10(2), 2020——基准数据集的采集条件与规格 [高]
- J. Longo, E. De Mulder, D. Page, M. Tunstall, "SoC It to EM: ElectroMagnetic Side-Channel Attacks on a Complex System-on-Chip", CHES 2015(LNCS 9293, pp.620–640)——复杂 SoC 上 EM 采集的可行性与工程细节 [高]

## 防御与缓解视角

- 采集链路的每一项工程参数(σ、对齐误差)都是防御方可推高的指标:随机延迟/抖动提高对齐误差,隐藏对策降低 SNR
- 评估报告应披露采集配置(探头类型、采样率、σ),否则"所需轨迹数"不可比较
- 防御方自查:用与攻击者同等级的采集链路做 TVLA,而不是用更差的链路自证安全

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;对真实设备的物理测量(开壳、串电阻、贴探头)需书面授权。
