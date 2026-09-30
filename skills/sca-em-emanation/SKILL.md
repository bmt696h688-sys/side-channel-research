---
name: sca-em-emanation
description: "电磁(EM)侧信道攻击:近场探头定位芯片泄漏点、EM-DPA/CPA 提取密钥、对 PC/手机的远场 SDR 与机壳电势攻击(Genkin 系列)。适用于智能卡/嵌入式/SoC 侧信道评估与授权渗透测试。不适用于显示器内容重建(见 sca-tempest-video-reconstruction)或普通 EMI 调试。关键词: EM side-channel, electromagnetic analysis, EMA, 电磁泄漏, 电磁分析, 近场探头, side-channel, 侧信道, SDR。"
---

# 电磁(EM)侧信道

## 适用场景与不适用场景

**适用**:
- 不可侵入目标:近场 EM 探头贴片采集(智能卡、MCU、SoC 的密码协处理器)
- 远场:SDR 接收笔记本/手机在密码运算期间的辐射,提取 RSA/ElGamal/ECDH/ECDSA 密钥
- 机壳电势/接地通道:手触机壳、导线、以太网线耦合提取密钥

**不适用**:
- 显示器内容重建/TEMPEST(目标是图像信息而非密钥)→ sca-tempest-video-reconstruction
- 普通 EMI/EMC 合规调试(无秘密依赖)
- 供电/电池类电力侧信道 → sca-power-and-sensor-side-channels

## 前置条件与输入

- 近场:磁环/电场探头(或 ChipWhisperer EM 探头套件)、示波器/SDR、目标板
- 远场:SDR + 天线;Genkin 系列证明口袋级设备("PITA")即可完成对笔记本的密钥提取
- 目标实现知识(算法、窗口法、运算时长)以确定采集窗口与同步

## 方法学步骤

1. **泄漏分类**(Agrawal CHES 2002 分类学):近场(场强 ∝ 1/r³,贴片)vs 远场(∝ 1/r);直接调制(数据直接辐射)vs 杂散调制(载波被数据调制)——分类决定解调与滤波方式
2. **近场定位(智能卡/芯片)**:
   - 探头在芯片表面做网格扫描(步进 ≤1mm),每个位置采集同一密码操作的短轨迹
   - 用固定 vs 随机 t 检验(见 sca-tvla-leakage-detection)或 CPA 攻击迹峰值定位最大泄漏区域(密码协处理器、SBox 单元)
3. **采集**:采样率覆盖目标谐波带宽(至少主频的数次谐波);触发同步;近场幅值随频率与探头取向变化,磁环取向应正交于目标电流流向
4. **区分器**:EM 轨迹与功耗轨迹统计同构——DPA/CPA/模板直接套用(见 sca-cpa-attack、sca-template-attack);必要时先解调(AM/包络检波)再相关
5. **远场 PC 攻击(Genkin 范式,窗口指数目标)**:
   - 密钥相关信号以窄带形式出现在时钟谐波及其边带
   - 接收链:天线 → 低噪放 → SDR/示波器;在运算窗口内捕获,FFT 定位密钥相关谱线
   - 信号处理:窄带滤波/解调 → 与窗口序列对齐 → 逐窗口判决平方/乘 → 拼出指数/密钥
6. **机壳电势攻击**:测量机壳对地电位(经手、导线或以太网线耦合),信号处理同上——本质是"接触式的辐射耦合"
7. **判据**:每窗口判决统计量的边际应超噪声 σ;密钥恢复以完整指数/私钥输出为准,并注明采集时长与距离

## 关键细节与常见坑

- **Genkin 系列引用纠正**:
  - "Stealing Keys from PCs Using a Radio"为**四作者**(含 Lev Pachmanov),CHES 2015(LNCS 9293, pp.207–228);其 eprint 页(2015/170)至今标注 "Preprint",易被误认为未正式发表
  - ECDH 论文题名为 "…Attacks on **PCs**"、venue 为 **CT-RSA 2016**(常被误作 CHES 2016);手机 ECDSA 论文才是 **CCS 2016**(五作者,含 Yarom)——两者常被混引
- 近场探头位置毫米级敏感:结果可重复性依赖夹具固定
- EM 与功耗通道的泄漏点不完全重合;EM 的空间局部性是优势(可分离多目标/子模块,也可用于定位)
- 复杂 SoC(Longo 2015)上数字噪声强(缓存层次等),需更窄滤波与更长积分
- 去耦电容会吸收高频辐射:探头贴近管脚/裸芯比贴封装顶面有效
- 远场攻击需要目标长时间运行同一运算(窗口指数的重复性是可利用性的前提)

## 参考实现与工具

- ChipWhisperer(含 EM 探头配件、采集分析链、SCA101 教程)——知识库 07 域验证
- TempestSDR(显示器 EM 重建;属 sca-tempest-video-reconstruction 场景)——07 域验证
- 本项目暂无 EM 复现(需探头/SDR 硬件,知识库 02 域已声明);区分器统计核心与 `C:\Users\Administrator\.zcode\workspace\default\side-channel-research\reproductions\cpa_aes.js` 完全同构,可先用其验证区分器实现,再迁移到 EM 轨迹

## 已验证参考文献

- K. Gandolfi, C. Mourtel, F. Olivier, "Electromagnetic Analysis: Concrete Results", CHES 2001(LNCS 2162, pp.251–261)——智能卡 EM 分析奠基 [高]
- D. Agrawal, B. Archambeault, J. R. Rao, P. Rohatgi, "The EM Side-Channel(s)", CHES 2002(LNCS 2523, pp.29–45)——EM 泄漏分类学 [高]
- D. Genkin, L. Pachmanov, I. Pipman, E. Tromer, "Stealing Keys from PCs Using a Radio: Cheap Electromagnetic Attacks on Windowed Exponentiation", CHES 2015(LNCS 9293, pp.207–228)[高]
- D. Genkin, L. Pachmanov, I. Pipman, E. Tromer, "ECDH Key-Extraction via Low-Bandwidth Electromagnetic Attacks on PCs", CT-RSA 2016(LNCS 9610, pp.219–235)[高]
- D. Genkin, L. Pachmanov, I. Pipman, E. Tromer, Y. Yarom, "ECDSA Key Extraction from Mobile Devices via Nonintrusive Physical Side Channels", ACM CCS 2016, pp.1626–1638 [高]
- J. Longo, E. De Mulder, D. Page, M. Tunstall, "SoC It to EM: ElectroMagnetic Side-Channel Attacks on a Complex System-on-Chip", CHES 2015(LNCS 9293, pp.620–640)[高]
- A. Sayakkara, N.-A. Le-Khac, M. Scanlon, "A Survey of Electromagnetic Side-Channel Attacks...", Digital Investigation 29:43–54, 2019——综述与数字取证视角 [高]

## 防御与缓解视角

- 设备级:屏蔽(法拉第笼/导电涂层)、滤波(去耦/铁氧体)、布局(降低电流环路面积)
- 算法层:恒定时间窗口指数、盲化、掩码(EM 与功耗共享对策体系)
- 评估:近场网格扫描 + 多探头位置 TVLA,防止"测了一个点就宣布安全"

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;对真实设备(尤其他人 PC/手机)的任何 EM 测量需书面授权。
