---
name: sca-ml-profiling
description: "机器学习/深度学习剖析侧信道攻击(ML/DL-SCA):用 MLP/CNN 在 profiling 轨迹上学习密钥相关中间值的泄漏表征,攻击阶段直接分类;CNN+数据增强可对抗时域抖动。适用于 ASCAD 基准研究、智能卡侧信道评估、授权渗透测试。不适用于普通机器学习建模或非侧信道的分类问题。关键词: deep learning SCA, CNN profiling attack, ASCAD, 机器学习侧信道, 深度学习剖析攻击, 侧信道, 功耗分析, data augmentation。"
---

# 机器学习/深度学习剖析攻击(ML/DL-SCA)

## 适用场景与不适用场景

**适用**:
- 有 profiling 数据(标签化轨迹),目标是掩码/抖动对策下的密钥恢复
- CNN + 随机窗口裁剪数据增强,免对齐预处理对抗随机延迟
- 研究复现:ASCAD 掩码 AES 基准上的架构对比与消融

**不适用**:
- 无 profiling 数据 → 非剖析攻击(CPA)
- 追求最小可复现方法 → 模板攻击(sca-template-attack)
- 普通模式识别/性能建模(无秘密依赖)

## 前置条件与输入

- profiling 集(带中间值标签)+ 攻击集(严格分离)
- 基准数据:ASCAD(ANSSI/CEA,掩码 AES,ATmega8515 与 STM32 两版;仓库 BSD 许可,2026-01-15 起只读归档,仍可克隆)
- 训练框架(PyTorch/TensorFlow;ASCAD 仓库含训练脚本)

## 方法学步骤

1. **定义标签**:与 CPA 相同的中间值(如 v = SBox(p_i ⊕ k_i)),按字节训练 256 类分类器
2. **架构选择(按演进路线)**:
   - MLP(Maghrebi, SPACE 2016):全连接,泄漏近线性可分时已够用
   - CNN(Cagli, CHES 2017):卷积块自动提特征;**随机窗口裁剪数据增强**使网络容忍时移,等效免对齐
   - ASCAD 高效 CNN(Zaid, TCHES 2020):降采样 + 多卷积块的小型架构,单卡可训
3. **训练**:交叉熵损失(理论上近似感知信息最大化,见 Masure 2020);标签类别平衡;验证集早停;**固定多个随机种子**——种子间方差是结论稳定性的主要威胁
4. **攻击阶段**:对攻击集轨迹输出类别概率,多轨迹对数概率求和融合,取 argmax;记录密钥排名
5. **评估**:guessing entropy(密钥排名中位数)与 success rate 对攻击轨迹数 m 作图;报告恢复所需最小 m
6. **调参要点**:学习率调度(cosine/step)、batch size 32–256、卷积核宽度与抖动幅度匹配(抖动大 → 大裁剪窗);不要默认更大网络更好(见 Wouters 2020)
7. **对照实验**:同一数据上跑 CPA/模板作基线;DL 的优势应体现在抖动/掩码场景,否则未必值得复杂度

## 关键细节与常见坑

- **发表处纠正**:Cagli 等 2017 为 **CHES 2017**(LNCS 10529, pp.45–68),**不是 CRYPTO 2017**;eprint 号 2017/740
- **引用口径**:Zaid 等为 TCHES vol. 2020, issue 1, pp.1–36(在线 2019-11-19);常被误引为 "2019" 或 "2020(3)"
- **Wouters 2020 的纠偏**:对 Zaid 架构的批判性复现——同等训练预算与多种子下,精简网络可匹配/超过复杂网络;架构对比必须控制训练预算与种子方差,否则结论不可信
- ASCAD 是**功耗(Icc)迹线不是 EM**(常见误记);仓库已归档只读(2026-01-15)
- 数据泄漏陷阱:profiling/攻击集的明文-轨迹必须严格分离,否则评估虚高
- 增强变换不得依赖密钥信息(如按已知泄漏点精确对齐后裁剪),否则得到虚假成功率
- 过拟合的表现:profiling 准确率高而攻击集排名不收敛;用攻击集做早停是错误的(它就是评估对象)
- 类不平衡与字节间共享网络时的字节索引输入是常见工程细节

## 参考实现与工具

- ASCAD 仓库(https://github.com/ANSSI-FR/ASCAD)——掩码 AES 数据集 + CNN 训练脚本,知识库 07 域验证
- SCALib(SIMPLE-Crypto)——研究级 SCA 库含 ML 工具,07 域验证
- `C:\Users\Administrator\.zcode\workspace\default\side-channel-research\reproductions\tvla_masking.js`——掩码实现的一阶/二阶泄漏统计复现:泄漏存在但藏在二阶统计量里(一阶 0/20 报警、二阶 14/16 报警),这是 DL-SCA 在 ASCAD 上能"隐式学到高阶泄漏"的统计学背景

## 已验证参考文献

- H. Maghrebi, T. Portigliatti, E. Prouff, "Breaking Cryptographic Implementations Using Deep Learning Techniques", SPACE 2016(LNCS, pp.3–26)——DL-SCA 开山 [高]
- E. Cagli, C. Dumas, E. Prouff, "Convolutional Neural Networks with Data Augmentation against Jitter-Based Countermeasures", **CHES 2017**(LNCS 10529, pp.45–68;eprint 2017/740)[高]
- E. Prouff, R. Strullu, R. Benadjila, E. Cagli, C. Dumas, "Study of Deep Learning Techniques for Side-Channel Analysis and Introduction of ASCAD Database", Journal of Cryptographic Engineering 10(2), 2020(eprint 2018/053)——引入 ASCAD 基准 [高]
- R. Benadjila, E. Prouff, R. Strullu, E. Cagli, C. Dumas, "Deep Learning for SCA and Introduction of ASCAD Database", J. Cryptogr. Eng. 10(2):163–188, 2020(DOI 10.1007/s13389-019-00220-8)[高]
- G. Zaid, L. Bossuet, A. Habrard, A. Venelli, "Methodology for Efficient CNN Architectures in Profiling Attacks", TCHES 2020(1):1–36(在线 2019-11-19)[高]
- L. Wouters, V. Arribas, B. Gierlichs, B. Preneel, "Revisiting a Methodology for Efficient CNN Architectures in Profiling Attacks", TCHES 2020(3):147–168——批判性复现与方法论纠偏 [高]
- L. Masure, C. Dumas, E. Prouff, "A Comprehensive Study of Deep Learning for Side-Channel Analysis", TCHES 2020(1):348–375——交叉熵 ≈ 感知信息最大化 [高]
- G. Hospodar, B. Gierlichs, E. De Mulder, I. Verbauwhede, J. Vandewalle, "Machine learning in side-channel analysis: a first study", J. Cryptographic Engineering 1(4):293–302, 2011——ML-SCA 最早系统研究 [高]
- B. Hettwer, S. Gehrer, T. Güneysu, "Applications of machine learning techniques in side-channel attacks: a survey", J. Cryptographic Engineering 10(2):135–162, 2020 [高]

## 防御与缓解视角

- DL-SCA 的主要收益是对抖动与一阶掩码的鲁棒性 → 对策:更高阶掩码(联合建模成本指数增长)、时隙随机化打散卷积感受野
- 评估不能只看一阶 TVLA:DL 可隐式学习高阶统计量
- 域失配(profiling 与攻击采集条件差异)是天然障碍,但不应作为唯一防线

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;profiling 与攻击真实设备需书面授权。
