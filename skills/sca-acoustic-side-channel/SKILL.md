---
name: sca-acoustic-side-channel
description: "声学侧信道:键盘击键声三代演进(Asonov-Agrawal 2004 → Zhuang 2005/2009 → 深度学习 Harrison 2023 约90%)、声学密码分析(Genkin-Shamir-Tromer CRYPTO 2014 手机录音提取 RSA 密钥)、打印机噪声重建文本。适用于物理安全评估、授权渗透测试、声学泄漏防御研究。不适用于普通音频处理或语音识别。关键词: acoustic side-channel, 键盘声学, keystroke acoustics, acoustic cryptanalysis, 声学密码分析, 侧信道, 泄漏, deep learning。"
---

# 声学侧信道

## 适用场景与不适用场景

**适用**:
- 评估键盘输入的声学泄漏(机械/笔记本键盘,近场麦克风、手机或会议软件音轨)
- 评估密码实现的声学泄漏:风扇转速/电容啸叫与 CPU 运算耦合(GnuPG RSA 场景)
- 打印机(针式)噪声重建打印内容
- 零硬件动手:Keystroke-Datasets 公开数据集 + CoAtNet 复现

**不适用**:
- 语音识别/普通音频 ML(无秘密依赖)
- 非声学的振动/热通道(见知识库 04 域、sca-power-and-sensor-side-channels)
- 未授权对他人键盘/设备/通话的录音——法律风险极高

## 前置条件与输入

- 录音链路:近场麦克风、手机、或会议软件音轨
- 目标先验:键盘型号/布局(已知键盘可大幅提升识别率);密码算法与运算时长(声学密码分析)
- 数据集:JBFH-Dev/Keystroke-Datasets(手机/Zoom 按键录音,2023 论文官方数据)

## 方法学步骤

1. **键盘声学(深度学习范式, Harrison 2023)**:
   - 数据:逐键录音切段(每键数百样本),标签 = 键位(36 类:字母+数字)
   - 特征:Mel 频谱/MFCC;模型:CoAtNet(卷积+注意力)
   - 精度:手机录音约 90%;Zoom 音轨(经 codec 降噪)亦达类似量级
   - 评估:top-1 精度 + 混淆矩阵(相邻键混淆决定口令搜索空间的实际缩减)
2. **键盘声学(经典范式, Zhuang 2005/2009)**:
   - 约 10 分钟已知文本录音做校准(聚类各键的声学指纹)
   - 语言模型 + 频率分析解码未知录音——无需预训练神经模型
3. **声学密码分析(Genkin-Shamir-Tromer CRYPTO 2014 范式)**:
   - 场景:手机置于笔记本旁,录音约 1 小时提取 GnuPG 4096 位 RSA 密钥
   - 机理:不同运算(模乘/窗口)驱动元件(电容、线圈、风扇)发出超声波段噪声,谱能量随密钥相关运算分支变化
   - 流程:带通滤波/降采样 → FFT 特征 → 对每个密钥窗口假设做统计判决(似然比)→ 拼出指数
   - 关键约束:采样率必须覆盖目标频段(数十 kHz;普通音乐采样率不足会直接失败)
4. **打印机(Backes 2010)**:针式打印机逐字符击打噪声;频域特征对字符编码 + 语言模型解码
5. **判据**:键盘分类 top-1 显著高于 1/36 基线;密码分析以完整密钥输出或逐窗口判决边际(> 噪声 σ)为准

## 关键细节与常见坑

- **引用纠正**:Backes 打印机论文是 **USENIX Security 2010**(不是 2004),第五作者为 Pinkal(常被误写);Zhuang 期刊版为 **TISSEC 13(1), 2009**(常见 "TISSEC 8(3), 2005" 引用与 Crossref 记录不符),会议版为 CCS 2005
- 击键声学识别率对键盘型号敏感:换键盘 = 重新校准/微调
- 会议音轨经有损 codec,高频能量受损——复现要对齐 codec 条件再比较数字
- 密码字段随机、无语言结构:口令场景应输出候选排名而非单判决
- 麦克风指向性与房间混响主导信噪比;评估要报告录音几何与距离
- 声学密码分析的目标频段多在人耳听不见处——用"听不见"论证安全是错误的

## 参考实现与工具

- Keystroke-Datasets(https://github.com/JBFH-Dev/Keystroke-Datasets,MIT)——按键录音数据集,知识库 07 域验证
- CoAtNet 复现(https://github.com/MomirMilutinovic/keyboard-acoustic-side-channel-attack-coatnet)——04/07 域验证
- EchoCrypt(https://github.com/Botacin-s-Lab/EchoCrypt,USENIX WOOT'25)——噪声场景攻击 + LLM 纠错,04 域验证

## 已验证参考文献

- D. Asonov, R. Agrawal, "Keyboard Acoustic Emanations", IEEE S&P 2004, pp.3–11——键盘声学开山 [高]
- L. Zhuang, F. Zhou, J. D. Tygar, "Keyboard Acoustic Emanations Revisited", ACM CCS 2005, pp.373–382;期刊版 ACM TISSEC 13(1), 2009 [高]
- J. Harrison, E. Toreini, M. Mehrnezhad, "A Practical Deep Learning-Based Acoustic Side Channel Attack on Keyboards", IEEE EuroS&PW (SiLM'23), 2023(arXiv 2308.01074;CoAtNet 约 90% 精度,附公开数据集)[高]
- D. Genkin, A. Shamir, E. Tromer, "RSA Key Extraction via Low-Bandwidth Acoustic Cryptanalysis", CRYPTO 2014(LNCS 8616, pp.444–461;eprint 2013/857)——手机旁录音 1 小时提取 GnuPG 4096 位 RSA [高]
- M. Backes, M. Dürmuth, S. Gerling, M. Pinkal, C. Sporleder, "Acoustic Side-Channel Attacks on Printers", USENIX Security 2010 [高]
- Quattrone, Badr, "A Survey on Acoustic Side-Channel Attacks: An AI Perspective", MDPI J. Cybersecurity & Privacy 6(1), 2025 [中]

## 防御与缓解视角

- 键盘:静音键盘/薄膜化降低声学指纹;敏感输入配合软键盘随机布局或双因素
- 密码实现:风扇转速平稳化(固定 RPM)、运算负载均衡、声学耦合屏蔽
- 环境白噪声对信噪比的衰减有限,不能作为唯一对策
- 不要信任"音频 codec 已毁掉泄漏"的假设(Harrison 2023 的 Zoom 场景已证伪)

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;对他人键盘/设备/通话的任何录音需书面授权,且常涉窃听法律红线。
