---
name: sca-trace-preprocessing
description: "侧信道轨迹预处理(功耗为主):拿到轨迹后的标准决策流程——异常剔除、对齐/重同步(重触发/互相关/弹性DTW)、去趋势与漂移校正、降噪(滤波/轨迹平均/条件平均/小波/EMD/SSA/自编码器)、时间-频率变换、POI选取与降维(方差/SNR/T检验/PCA/LDA/subspace)、压缩与重采样、高阶与深度学习预处理的特殊陷阱。适用于DPA/CPA/模板/ML攻击前与TVLA评估前的数据准备、原始轨迹质量诊断、跨数据集复现时的预处理重建。不适用于轨迹采集本身(sca-trace-acquisition)、具体区分器实现(sca-cpa/dpa/spa-attack)、读什么点即泄漏的建模(sca-template-attack/sca-ml-profiling)。关键词: trace preprocessing, 轨迹预处理, trace alignment, 对齐, desynchronization, 去同步, trace averaging, 轨迹平均, wavelet denoising, 小波去噪, PCA, POI, point of interest, resampling, 重采样, trace compression, 压缩, 侧信道。"
---

# 侧信道轨迹预处理(功耗为主)

## 适用场景与不适用场景

**适用**:
- 攻击/评估前的数据准备:DPA/CPA/SPA、模板攻击、ML 剖析攻击、TVLA 评估之前的数据处理
- 原始轨迹质量诊断:对齐差、噪声高、有漂移/趋势、离群轨迹、信噪比不明
- 跨数据集/跨设备复现:公开数据集(ASCAD 等)与自有轨迹混合,需重建等价预处理管线
- 黑盒目标无触发源,需要软件对齐与重同步

**不适用**:
- 采集环节本身(探头、采样率、触发设计)→ sca-trace-acquisition
- 区分器/攻击算法实现(CPA/LRA/MIA 等)→ sca-cpa-attack / sca-dpa-attack / sca-spa-analysis
- 泄漏模型与剖析建模 → sca-template-attack / sca-ml-profiling
- 泄漏判定本身 → sca-tvla-leakage-detection

## 核心原则

1. **先看后做**:先可视化均值轨迹、方差轨迹、单条轨迹叠加图与功率谱,再决定预处理;盲套管线是最常见的浪费。均值/方差/单条三张图即可定位 80% 的问题(对齐漂移看均值变宽、噪声看方差、趋势看单条基线)。
2. **每次只改一处,用同一攻击基准验证**:预处理的目标是降低 CPA 所需轨迹数(或提高 TVLA t 值/降低模板错误率),每一步与上一步对比,无改善即回退。
3. **泄漏信息守恒警惕**:预处理不创造泄漏,只会移动/放大/破坏它。一阶相关的 Pearson 计算对逐轨迹线性变换(尺度+偏移)不变,因此逐轨迹去均值/标准化对 CPA 安全;但它改变**点与点之间**的幅值比例关系,对高阶(中心化乘积类)与多数剖析攻击不安全——见"高阶陷阱"。
4. **预处理是有损编辑,保留原始数据**:所有管线从原始轨迹重建,不覆盖;记录每步参数,报告必须披露预处理,否则结果不可复现。

## 方法学步骤(拿到轨迹后的标准流程)

1. **完整性检查**:轨迹条数 × 样本点数、位宽、明文/密文元数据齐全;固定密钥自检(已知 key 的 CPA 应能恢复,否则先怀疑数据而非方法)。
2. **离群轨迹剔除**:逐轨迹统计均值/方差/极值,剔除饱和、断采、电源骤降、触发错采的轨迹(阈值取中位数 ± 5–6 倍 MAD);离群轨迹会污染平均类预处理与 TVLA,单条轨迹的异常也可能恰恰是泄漏,剔除标准要记录。
3. **对齐/重同步**(选一或级联,见场景矩阵):
   - 有触发:重触发,触发点后裁剪到统一窗口——对齐质量的根本在采集端,软件只做补救
   - 固定偏移抖动:与参考轨迹做互相关取峰值偏移,逐轨迹平移;亦可用绝对差和(SAD)模式匹配,ChipWhisperer 重触发即此类
   - 随机延迟/时钟抖动(逐周期漂移):互相关逐段对齐仍会"梳状"失效时,用弹性对齐(DTW 动态时间规整)——参考 Elastic Alignment(COSADE 2011);ChipWhisperer Wiki 的 Dynamic Time Warp 预处理模块、Jlsca 的 DTW 对齐是现成实现
   - 剖析攻击面对随机延迟:可不对齐,交给 CNN 数据增强(Cagli 等的 jitter 建模,sca-ml-profiling)
4. **偏置/趋势/漂移校正**:
   - 逐轨迹去均值(去 DC 偏置):安全且常有必要
   - 缓慢漂移(温度/供电):去线性趋势或高通;TVLA 场景先确认交替采集已消除组间漂移再动数据(sca-trace-acquisition 的纪律)
   - 趋势噪声对 DPA 有系统性负效应,专门研究见 ePrint 2013/102
5. **降噪**(按噪声类型选,见场景矩阵):
   - 宽带白噪声:轨迹平均(同输入重复采集取均值)或条件平均(按明文字节/密钥假设分组平均,Jlsca 内置)——平均 n 条等效降低 σ/√n,但平均**破坏高阶泄漏与操作间差异**,一阶攻击专用
   - 带外干扰:数字 FIR/IIR 带通或陷波(如滤工频与开关电源谐波);ChipWhisperer/Inspector 均有滤波预处理模块。滤波后泄漏点会变形(变矮变宽)而非消失
   - 非平稳噪声/尖峰:小波去噪(小波收缩),或经验模式分解 EMD 取前几个 IMF;单次测量盲源分离可用奇异谱分析 SSA
   - 数据充足时:自编码器降噪(TCHES 2020 "Remove Some Noise" 路线),剖析场景收益最大,注意训练/攻击集泄漏
6. **POI 选取与降维**:
   - 非剖析:方差峰值、均值差/互相关峰值、T 检验显著点(sca-tvla-leakage-detection)选窗;对全轨迹攻击只是慢,不选 POI 不算错
   - 剖析:PCA(全局协方差主成分)或 LDA(类间/类内比)投影,通常取前几个分量;PCA/NICA 思想源自 Peeters–Standaert–Quisquater(CHES 2006 期刊版),子空间模板见 CHES 2008;自动 POI 学习还有基于神经网络关键恢复遮挡的 OccPoIs(ePrint 2023/1055)
   - 降维在剖析中同时是"预处理+区分器",过度降维会合并掉高阶分量
7. **压缩/重采样**(数据量或采样率不匹配时):
   - 窗口压缩:按窗取 max/|max|/mean,Inspector 称 trace compression;对一阶 CPA 通常保泄,压缩比过大同样伤高阶
   - 降采样/抽取前先抗混叠低通,否则泄漏峰被混叠折叠
   - 采样率高于所需时,分频抽点可数倍提速且对齐容差变宽
8. **高阶与深度学习预处理**:
   - 高阶攻击:禁止跨点平均、逐轨迹标准化、窗口压缩等破坏跨点协方差结构的操作;只能做对齐、去均值、粗去噪
   - DL 剖析:ASCAD/Benadjila 系统实验过 scale/shift 归一化——对 CNN 常规做法是按训练集统计量统一归一化(非逐轨迹);随机 scale/shift 也是数据增强手段;轨迹对齐仍常有益,CNN 对中等抖动有天然容忍
9. **复验**:同一攻击基准跑预处理前后,记录轨迹数-成功率曲线;写报告时披露管线。

## 场景 → 方法决策矩阵

| 症状/场景 | 首选预处理 | 次选/备选 | 禁忌 |
|---|---|---|---|
| 触发不稳但可用 | 重触发+窗口裁剪 | 触发后过采样互相关 | — |
| 无触发(黑盒) | 能量包络粗对齐+互相关精对齐 | 弹性 DTW 对齐 | — |
| 固定/准固定抖动 | 互相关(或 SAD)逐轨迹平移 | 模板匹配对齐 | — |
| 随机延迟(指令级) | 割弃对齐,用弹性 DTW 或 CNN 增强 | 分段互相关 | 硬性平移对齐(梳状失效) |
| 时钟抖动(周期内漂移) | 重采样到均匀相位 | 弹性 DTW;高抖动设备专门管线(2025 论文) | 忽视漂移直接平均 |
| 宽带噪声大、轨迹充足 | 轨迹平均/条件平均 | 自编码器降噪(剖析) | 高阶攻击用平均 |
| 带外干扰(工频/开关谐波) | FIR/IIR 带通或陷波 | 小波去噪 | 无抗混叠直接抽点 |
| 非平稳/尖峰噪声 | 小波收缩 | EMD 取低阶 IMF;SSA | — |
| 慢漂移/趋势 | 去线性趋势/高通 | 分段采集重组 | TVLA 用非交替组 |
| DC 偏置/量程不准 | 逐轨迹去均值 | 重标定(回到采集端) | — |
| 数据量爆炸 | 窗口压缩(max/mean)+POI 窗 | 降采样(先抗混叠) | 高阶场景窗口压缩 |
| 剖析点数过多 | PCA/LDA 投影 | SNR/T 检验选 POI;自编码器(Autoencoder Assist) | 盲目全轨迹输入 MLP |
| DL 剖析 | 训练集统计量归一化 | 随机 scale/shift 增强、去噪自编码器预处理 | 逐轨迹各自标准化 |
| 高阶(DPA 二阶/掩码) | 仅对齐+去均值+保守去噪 | 提高轨迹数硬抗 | 平均、跨点压缩、逐轨迹标准化 |

## 关键细节与常见坑

- **Pearson 相关对逐轨迹仿射变换不变**是 CPA 敢于随便去均值/去量纲的原因;但欧氏距离类区分器(模板、最小二乘)不具备该不变性——同一预处理换区分器后要重估
- 平均类操作把"操作 A 与操作 B 的差异"一起平均掉:平均后一阶 CPA 变好、SPA 变差是正常现象,不是数据坏了
- 互相关对齐的参考轨迹选"均值轨迹"而非单条(单条含噪声会产生偏移误差);对齐窗口只含稳定特征,把泄漏特征放参考里会造成"自证对齐"
- 弹性 DTW 对齐可能把不同指令的样本"拉"到一起,产生伪相关;半径参数宁小勿大,对齐后必须复验攻击
- 滤波器相位:FIR 线性相位(零相位滤波用 filtfilt 式双向)避免引入样本间相位畸变;IIR 的非线性相位会移位泄漏峰
- 剔除离群轨迹后明文分布可能不再均匀,导致攻击假设欠约束——剔除时同步记录明文覆盖
- 公开数据集的预处理不可见:ASCAD 等发布的是已采集原始级轨迹,但论文复现里作者管线常有 undisclosed 步骤;跨库对比前先用其固定向量自检
- 预处理会改变 TVLA 判定的点集:报告泄漏位置时必须注明"预处理后位置",与原始位置不可混写

## 参考实现与工具

- **ChipWhisperer** 预处理模块链(https://github.com/newaetech/chipwhisperer):SAD 重触发、数字滤波器、Dynamic Time Warp(配 Trace Cache 缓存 DTW 结果,Wiki 有专页)——工程管线参考实现
- **Jlsca**(https://github.com/Keysight/Jlsca,Julia):条件平均、条件按位样本归约(白盒)、FFT 卷积对齐、DTW 对齐、增量式相关统计——大规模轨迹预处理+攻击一体
- **Riscure Inspector**(商业):对齐(模式匹配)、滤波、trace compression、轨迹统计;模块说明见官方 inspector-modules PDF(免费注册获取)
- **SCALib / lascar / scared+estraces / Daredevil**:预处理与剖析衔接的常用开源库(Daredevil 以 split-sample 二进制输入配合条件平均管线)
- 公开数据集:ASCAD(功耗迹线,2026-01 起归档只读;自带固定密钥向量可作管线自检)

## 已验证参考文献

以下条目 2026-10-20 经 OpenAlex/IACR ePrint 对原文核实(标题/年份/DOI):

- C. Clavier, J.-S. Coron, N. Dabbous, "Differential Power Analysis in the Presence of Hardware Countermeasures", CHES 2000, DOI 10.1007/3-540-44499-8_20——错位引起"梳状效应"的原始分析,对齐必要性的经典论证 [高]
- J. G. J. van Woudenberg et al., "Improving Differential Power Analysis by Elastic Alignment", COSADE 2011, DOI 10.1007/978-3-642-19074-2_8——DTW 弹性对齐原始文献,148 引;ChipWhisperer DTW 模块即引此 [高]
- E. Peeters, F.-X. Standaert, J.-J. Quisquater, "Power and electromagnetic analysis: Improved model, consequences and comparisons", Integration, the VLSI Journal 40(1), 2006, DOI 10.1016/j.vlsi.2005.12.013——全局 PCA 与 ICA 用于功耗/EM 泄漏提取的源头之一 [高]
- C. Archambeau, E. Peeters, F.-X. Standaert, J.-J. Quisquater, "Using Subspace-Based Template Attacks to Compare and Combine Power and Electromagnetic Information Leakages", CHES 2008, DOI 10.1007/978-3-540-85053-3_26——子空间(PCA)剖析攻击 [高]
- E. Prouff, R. Strullu, R. Benadjila, E. Cagli, C. Dumas, "Deep learning for side-channel analysis and introduction to ASCAD database", J. Cryptographic Engineering, 2019/2020, DOI 10.1007/s13389-019-00220-8——DL 剖析中归一化与预处理的基准讨论 [高]
- R. Benadjila et al., "A Comprehensive Study of Deep Learning for Side-Channel Analysis", TCHES 2020(1), DOI 10.46586/tches.v2020.i1.348-375——scale/shift 与随机重缩放预处理对 CNN/MLP 的系统实验 [高]
- B. Hettwer, S. Gehrer, T. Güneysu, "Remove Some Noise: On Pre-processing of Side-channel Measurements with Autoencoders", TCHES 2020(4), DOI 10.46586/tches.v2020.i4.389-415——自编码器降噪 [高]
- F. Ganji, S. Tajik(方向)"Non-Profiled Deep Learning-Based Side-Channel Preprocessing With Autoencoders", IEEE Access 9, 2021, DOI 10.1109/access.2021.3072653——非剖析自编码器预处理 [中](作者序列未逐字核实)
- "Enhancing Time-Frequency Analysis with Zero-Mean Preprocessing", Sensors 22(7):2477, 2022, DOI 10.3390/s22072477——去均值对时频分析的作用,EM/功耗均适用 [高]
- "Enhancing non-profiled side-channel attacks by time-frequency analysis", Cybersecurity 6, 2023, DOI 10.1186/s42400-023-00149-w——STFT 进区分器前 [高]
- "A Highly Effective Data Preprocessing in Side-Channel Attack Using Empirical Mode Decomposition", 2019, DOI 10.1155/2019/6124165——EMD 预处理 [高]
- "Blind Source Separation from Single Measurements using Singular Spectrum Analysis", IACR ePrint 2016/314——SSA 单测量盲源分离 [高]
- "On the Negative Effects of Trend Noise and Its Applications in Side-Channel Cryptanalysis", IACR ePrint 2013/102——趋势噪声的负效应 [高]
- "OccPoIs: Points of Interest based on Neural Network's Key Recovery in Side-Channel Analysis through Occlusion", IACR ePrint 2023/1055——神经网络引导的 POI 选取 [高]
- "Autoencoder Assist: An Efficient Profiling Attack on High-dimensional Datasets", IACR ePrint 2021/1418——高维数据自编码器降维剖析 [高]
- L. Gao et al.(方向)"Power Side-Channel Attack Analysis: A Review of 20 Years of Study for the Layman", Cryptography 4(2):15, 2020, DOI 10.3390/cryptography4020015——含预处理章节的入门综述 [中](作者未逐字核实)
- S. Mangard, E. Oswald, T. Popp, Power Analysis Attacks, Springer 2007——噪声建模与所需轨迹数公式的原始出处(与 sca-cpa-attack 共用) [高]

**待核实/边界外**(引用前需再查):2025 年"Power trace preprocessing for side-channel analysis of device with high clock jitter"(OpenAlex 检得、无 DOI,疑似期刊预印,引用前对原文);ePrint 2025/857(DTW+SPA 分类)与 2025/1876 未逐条核;Riscure Inspector 具体模块参数以官方手册为准,本文仅述功能。

## 防御与缓解视角

- 预处理改善的每一项都是攻击者成本:评估报告应报告"原始轨迹 + 披露的预处理管线"下所需轨迹数,防御方据此评估余量
- 随机延迟/时钟抖动对策的价值恰在对齐成本(弹性 DTW 计算量大、参数敏感);防御评估应假设攻击者有最优对齐
- 平均化一阶攻击失效 ≠ 高阶安全:报告一阶指标时注明预处理,防止"高阶可攻击"被误读为"一阶安全"

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;预处理方法本身无侵入,但对真实设备数据的获取须来自合法授权的采集(见 sca-trace-acquisition 授权边界)。
