---
name: sca-power-and-sensor-side-channels
description: "电力与传感器侧信道:机壳地电位(Genkin CHES 2014)、电池聚合功耗定位(PowerSpy)、USB 充电电流推断网页(Yang TIFS 2016)、无线充电(La Cour CCS 2021)、电源 LED 光强密钥提取(Nassi CCS 2023/S&P 2024)。适用于移动设备物理安全评估、位置/浏览隐私研究、授权渗透测试。不适用于普通电池优化或 LED 电路设计。关键词: power side-channel, 电力侧信道, 电池功耗, USB charging, 机壳电势, power LED, 传感器泄漏, 侧信道。"
---

# 电力与传感器侧信道

## 适用场景与不适用场景

**适用**:
- 评估设备的"外周电力"泄漏:电池功耗接口、USB/无线充电电流、机壳对地电位、电源 LED 亮度
- 两类目标:(a) 隐私推断——位置(PowerSpy)、浏览行为(USB/无线充电);(b) 密钥提取——机壳电势/电源 LED
- 授权渗透测试中的非侵入测量通道(不需开壳)

**不适用**:
- 芯片级功耗分析(串联电阻/电流探头)→ sca-trace-acquisition / sca-cpa-attack
- 普通电池续航优化、LED 驱动电路设计(无秘密依赖)
- 未授权对他人设备/充电设施的测量

## 前置条件与输入

- 按通道选择传感:机壳电势(导线+采集卡)、电池功耗(系统 API 聚合值)、USB 电流(充电监测)、无线充电(接收端电流)、LED(光电二极管/摄像头)
- 机器学习管线(分类场景)或信号处理管线(密钥提取场景)
- 目标先验:运算/行为与传感器读数的耦合关系

## 方法学步骤

1. **通道建模**:确认"秘密/行为 → 负载 → 传感器"链条:
   - 密码运算的窗口序列 → CPU 负载 → 供电电流波动 → 机壳电势/LED 光强
   - 用户行为(位置、网页)→ 射频/计算负载 → 电池聚合功耗/充电电流
2. **机壳地电位攻击(Genkin CHES 2014 范式)**:
   - 测量机壳对地电位(手触机壳、导线、以太网线等耦合方式)
   - 信号处理与 EM 攻击同构:窄带滤波/解调 → 窗口对齐 → 逐窗口判决 → 恢复 RSA 指数(演示 4096 位)
3. **电池聚合功耗(PowerSpy 范式)**:
   - 无需敏感权限读取电量聚合值;采样率低(秒级)但足够
   - 采集已知路线的功耗曲线 → 滑动窗统计特征(均值/方差/峰值)→ 训练分类器 → 位置推断
4. **USB 充电电流(Yang 2016 范式)**:充电设施监测电流;不同网页的加载负载产生可区分电流轨迹 → 网页指纹(复现口径 >90%)
5. **无线充电(La Cour 2021)**:接收端电流随手机负载调制;对 iPhone 11/Pixel 4 做网站指纹(>90%)
6. **电源 LED 密钥提取(Nassi 2023/2024 范式)**:
   - LED 光强与设备功耗近似线性;用光电二极管(CCS 2023)或普通摄像机(S&P 2024,16 米外)采样
   - 信号处理:去直流/归一化 → 与密码窗口序列相关判决 → ECDSA(256 位)/SIKE(378 位)密钥恢复
   - 前置研究:Glowworm(CCS 2021)证明同一物理通道可恢复设备播放的声音
7. **判据**:分类场景报 accuracy/top-k;密钥场景报完整恢复或逐窗口判决边际
8. **采样规划**:通道带宽决定可行性——电池 API 低带宽、LED/机壳高带宽;先测功率谱再定采样率

## 关键细节与常见坑

- 电池聚合数据粒度粗:特征工程(滑动窗统计)比模型复杂度更决定成败
- 充电电流含充电协议噪声(快充协商跳变)——需分段对齐
- LED 场景:自动曝光/帧率漂移会毁掉幅度标定——锁定曝光;卷帘快门造成行间时间差,需补偿
- 机壳电势攻击的"徒手"变体是人身接触测量——评估报告必须写清接触方式与可检测性
- 这些通道常被忽略是因为"不在默认威胁模型里":本技能的价值就是补全威胁模型
- 引用口径:Genkin "Get Your Hands Off My Laptop" 为 CHES 2014(LNCS 8739, pp.242–260),扩展版 J. Cryptogr. Eng. 5(2):95–112

## 参考实现与工具

- 本项目无专用复现(需传感硬件);密钥提取通道的统计判决核心与 `C:\Users\Administrator\.zcode\workspace\default\side-channel-research\reproductions\cpa_aes.js`(相关/似然区分器)、`timing_attack.js`(窗口级判决与稳健统计)同构
- 外周通道采集链多为自建(知识库 07 域的 ChipWhisperer 面向芯片级,不覆盖本场景)

## 已验证参考文献

- D. Genkin, I. Pipman, E. Tromer, "Get Your Hands Off My Laptop: Physical Side-Channel Key-Extraction Attacks on PCs", CHES 2014(LNCS 8739, pp.242–260);扩展版 J. Cryptogr. Eng. 5(2):95–112——机壳地电位提取 4096 位 RSA [高]
- Y. Michalevsky, A. Schulman, G. A. Veerapandian, D. Boneh, G. Nakibly, "PowerSpy: Location Tracking Using Mobile Device Power Analysis", USENIX Security 2015 [高]
- Q. Yang, P. Gasti, G. Zhou, A. Farajidavar, K. S. Balagani, "On Inferring Browsing Activity on Smartphones via USB Power Analysis Side-Channel", IEEE TIFS 12(5):1056–1066, 2016——公共 USB 充电站 >90% 网页识别 [高]
- A. S. La Cour, K. K. Afridi, G. E. Suh, "Wireless Charging Power Side-Channel Attacks", ACM CCS 2021, pp.651–665——iPhone 11/Pixel 4 网站指纹 >90% [高]
- B. Nassi 等 10 人(含 Genkin、Tromer、Elovici), "Optical Cryptanalysis: Recovering Cryptographic Keys from Power LED Light Fluctuations", ACM CCS 2023, pp.268–280(eprint 2023/1068)——光电二极管从 LED 光强恢复密钥 [高]
- B. Nassi 等, "Video-Based Cryptanalysis: Extracting Cryptographic Keys from Video Footage of a Device's Power LED", IEEE S&P 2024, pp.2422–2440(eprint 2023/923)——普通摄像机 16 米外恢复 256 位 ECDSA 与 378 位 SIKE [高]
- B. Nassi, Y. Pirutin, T. Galor, Y. Elovici, B. Zadov, "Glowworm Attack: Optical TEMPEST Sound Recovery via a Device's Power Indicator LED", ACM CCS 2021, pp.1900–1914 [高]
- M. Guri, B. Zadov, D. Bykhovsky, Y. Elovici, "PowerHammer: Exfiltrating Data from Air-Gapped Computers through Power Lines", arXiv 1804.04014, 2018——线路级 1000 bit/s 外泄 [高]

## 防御与缓解视角

- 供电整形:稳压/滤波/负载平滑,使外周传感器看不到运算负载
- LED:光强反馈平滑化;关键设备物理遮挡指示灯
- 系统层:限制应用读取聚合电量/充电状态的权限粒度;充电设施不向第三方暴露电流监测
- 威胁模型更新:把"外周电力/光学"纳入设备安全评估清单

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;对他人设备/充电设施的任何电力或光学测量需书面授权(位置推断还涉及隐私法规)。
