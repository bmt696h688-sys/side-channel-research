---
name: sca-tempest-video-reconstruction
description: "TEMPEST/显示器内容重建:截获显示器的电磁辐射(van Eck 1985)或光学时域反射(Kuhn)重建屏幕内容;现代实现有 TempestSDR(SDR 实时重建)与 Deep-TEMPEST 2024(深度学习重建 HDMI)。适用于红队物理安全评估、涉密环境验收、TEMPEST 防御研究。不适用于密码密钥提取(见 sca-em-emanation)或普通图像处理。关键词: TEMPEST, van Eck, 显示器重建, video display eavesdropping, TempestSDR, HDMI, compromising emanations, 电磁泄漏, 侧信道。"
---

# TEMPEST 与显示器内容重建

## 适用场景与不适用场景

**适用**:
- 评估显示器/CRT/HDMI 链路的 compromising emanations 风险
- 红队/物理安全评估:授权范围内测试相邻房间/楼宇的截获可行性
- 防御研究:屏蔽、滤波、TEMPEST 字体、接口选择的效果验证

**不适用**:
- 从设备提取密码密钥(EM 分析)→ sca-em-emanation
- 普通图像处理/视频质量分析(无泄漏语义)
- 未授权对他人显示器的任何截获——法律红线

## 前置条件与输入

- 接收链:SDR(带宽匹配目标视频信号)+ 定向天线;TempestSDR 支持 SDRplay/ExtIO/UHD/离线 IQ 文件
- 目标参数未知时的估计流程(行频/帧频/分辨率)——TempestSDR 支持自动估计
- 显示器类型先验(CRT 模拟 vs LCD/HDMI 数字)决定难度与方案

## 方法学步骤

1. **原理**:显示器按行/帧扫描,像素亮度调制视频电流 → 辐射;接收机与目标行/场同步后逐像素累积即可重建图像。CRT 模拟信号泄漏最直接;LCD/HDMI 因串行化与 HDCP 加密更难,但 Deep-TEMPEST 证明仍可行
2. **van Eck 范式(1985 最小可行实现)**:改装电视接收机,锁定目标行频/帧频,微调同步即可在接收机屏幕上看到目标内容
3. **参数估计与同步(Kuhn 系统化方法)**:
   - 从辐射谱估计行频(行谐波间隔)与帧频
   - 行对齐误差导致图像撕裂——需要亚像素级相位校准
   - Kuhn 的 "radio-character recognition":即使无图像级重建,字符的行/列笔画特征也可被识别
4. **TempestSDR 实操路径**:
   - SDR 接入 → 频谱定位目标(像素时钟谐波)→ 内置自动估计得到分辨率/刷新率 → 调整对齐获得实时重建画面
   - 支持离线 IQ 回放,便于事后分析
5. **光学时域通道(Kuhn S&P 2002)**:CRT 荧光余辉的时域高频变化经墙面/物体漫反射后,可用光电设备重建文本——与 RF 通道互补,说明"只做电磁屏蔽"不充分
6. **Deep-TEMPEST(2024)**:
   - 对 HDMI 辐射用 CNN 做端到端字符级重建,字符错误率较既有非 DL 方案改善逾 60 个百分点
   - 开源 GNU Radio 流程与数据集,可作为评估基准
7. **判据**:重建图像的字符可读率/字符错误率(CER);红队报告应给出"距离-带宽-可读性"三元组
8. **NACSIM 5000**:NSA 解密的 TEMPEST 基础文献(Cryptome 镜像可得),用于理解官方辐射安全体系——签发年份等细节未能从权威页核实,引用必须注明[细节未验证]

## 关键细节与常见坑

- **Kuhn 论文 venue 纠正**:CRT 光学窃听论文为 **IEEE S&P 2002**(pp.3–18),不是 USENIX
- **van Eck 题名**以问号结尾:"Electromagnetic Radiation from Video Display Units: An Eavesdropping Risk?",Computers & Security 4(4):269–286, 1985
- 数字接口(LCD/DVI/HDMI)的串行化与扰码使朴素重建失效——不能用 CRT 结论断言现代显示器;反之 Deep-TEMPEST 说明"数字=安全"也错
- 重建质量对天线极化/方位极敏感;建筑金属结构产生多径
- Soft Tempest(Kuhn-Anderson 1998)展示了另一面:抗泄漏字体滤波 + 经 EM 的隐蔽数据传输——防御(字体)与攻击(隐蔽信道)同源
- 法律:多数司法辖区截获他人显示辐射属违法,仅限授权测试

## 参考实现与工具

- TempestSDR(https://github.com/martinmarinov/TempestSDR,GPL-3.0)——SDR 实时重建,自动估计分辨率/刷新率,支持 SDRplay/ExtIO/UHD/离线文件;知识库 07 域验证
- Deep-TEMPEST 开源 GNU Radio 流程与数据集(见论文 arXiv 2407.09717)
- Kuhn 博士论文(UCAM-CL-TR-577,剑桥官网免费)含参数估计方法与防护字体资料

## 已验证参考文献

- W. van Eck, "Electromagnetic Radiation from Video Display Units: An Eavesdropping Risk?", Computers & Security 4(4):269–286, 1985 [高]
- M. G. Kuhn, R. J. Anderson, "Soft Tempest: Hidden Data Transmission Using Electromagnetic Emanations", Information Hiding 1998(LNCS 1525, pp.124–142)——抗泄漏字体 + 隐蔽 EM 传输 [高]
- M. G. Kuhn, "Optical Time-Domain Eavesdropping Risks of CRT Displays", IEEE S&P 2002, pp.3–18 [高]
- M. G. Kuhn, "Compromising Emanations: Eavesdropping Risks of Computer Displays"(博士论文), University of Cambridge 技术报告 UCAM-CL-TR-577, 2003——CRT/LCD 的 EM+光学泄漏最系统公开研究 [高]
- S. Fernández, E. Martínez, G. Varela, P. Musé, F. Larroca, "Deep-TEMPEST: Using Deep Learning to Eavesdrop on HDMI from its Unintended Electromagnetic Emanations", arXiv 2407.09717, 2024(投 LADC'24)[高]
- NACSIM 5000: TEMPEST Fundamentals, NSA 解密文件(常见标注 1982)——Cryptome 镜像真实存在;签发细节[细节未验证][中]

## 防御与缓解视角

- 区域控制:红/黑隔离、屏蔽室、电源与信号线滤波
- 设备级:低泄漏显示器(TEMPEST 认证)、泄漏抑制电路
- 软件级:抗泄漏字体(Soft Tempest 思路)降低字符可分性
- 验收:用 TempestSDR/Deep-TEMPEST 类工具做红队回归,而非仅规格符合性检查

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;截获任何非自有显示器的辐射或反射光属违法行为,需书面授权(且常需法律顾问介入)。
