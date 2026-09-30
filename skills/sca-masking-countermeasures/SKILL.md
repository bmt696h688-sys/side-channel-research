---
name: sca-masking-countermeasures
description: "掩码(masking)对策:把秘密拆成随机 share 使任意 d 阶探针独立于秘密(ISW 探测模型 CRYPTO 2003),软件高阶掩码(Rivain-Prouff CHES 2010),glitch 问题与阈值实现(Nikova 等)。含一阶掩码挡一阶不挡高阶的实测验证。适用于密码实现防御设计、侧信道加固评估、芯片安全工程。不适用于普通软件混淆或计时防御(见 sca-constant-time-defense)。关键词: masking, 掩码, ISW, probing model, threshold implementation, 阈值实现, higher-order masking, 高阶掩码, DPA 对策, 侧信道防御。"
---

# 掩码对策(Masking)

## 适用场景与不适用场景

**适用**:
- 为对称/公钥实现设计可证明的功耗/EM 泄漏对抗(软件与硬件)
- 评估既有掩码实现的阶数有效性(TVLA 一阶+高阶交叉验证)
- 理解并演示"一阶掩码挡一阶、挡不住高阶"的工程含义

**不适用**:
- 计时/缓存信道的对策(掩码不解决访存与时序模式)→ sca-constant-time-defense
- 混淆/反逆向需求(掩码不是混淆)
- 普通软件加固

## 前置条件与输入

- 目标算法(AES/ECC/…的软件或 HDL 实现)
- 威胁模型:攻击者可观测的探针数 d(决定掩码阶数)
- 高质量随机源(每份 share 独立、无重用)
- 验证手段:TVLA(sca-tvla-leakage-detection)+ 攻击性评估(CPA/ML)

## 方法学步骤

1. **安全模型(ISW 探测模型)**:
   - 秘密 x 拆为 d+1 份随机 share:x = x₀ ⊕ x₁ ⊕ … ⊕ x_d(布尔掩码;运算域另有算术掩码)
   - 安全性定义:任意 ≤ d 个 share 的联合分布与 x 独立 → d 阶掩码抗 d 阶攻击
2. **线性运算免费**:掩码下 XOR/移位/线性层逐 share 进行,无额外成本
3. **非线性运算(ISW 乘法)**:
   - 两个掩码秘密相乘产生交叉项 x_i·y_j——用新鲜随机 z_ij 掩蔽交叉项并 refresh
   - 软件高阶掩码 AES(Rivain-Prouff 2010):SBox 经域变换(幂链/乘法电路)分解为掩码友好的形式,复杂度 O(d²)
4. **实现与刷新**:
   - 每次(或每轮)运算后对 share 重新随机化(refresh),防止 share 间相关性累积
   - 随机数消耗随阶数快速增长——随机源质量与吞吐是常见失效点
5. **硬件 glitch 问题**:
   - 门级信号不同步跳变(glitch)使单门输出瞬态依赖多个 share → 一阶掩码在 CMOS 门上被实测攻破(Mangard CT-RSA 2004/2005)
   - 对策:**阈值实现 TI**(Nikova-Rechberger-Rijmen ICICS 2006;期刊版 Nikova-Rijmen-Schläffer, JoC 2011):
     - 秘密拆 n = 2d+1 份;非线性函数分解为分量函数,须满足三性质:
     - correctness(分量重组还原函数)、non-completeness(任一分量不依赖全部 share)、uniformity(输出 share 分布均匀)
     - non-completeness 保证即使 glitch 也不泄露
6. **验证(必须做,不能只信证明)**:
   - 一阶 TVLA:掩码后一阶统计应全点通过——复现实测:一阶掩码 0/20 点报警(|t| ≤ 2.4),一阶 CPA 0/16 首位命中
   - 高阶检验:二阶(方差/中心积)应报警——复现实测:**14/16 SBox 点二阶报警(|t| 最高 19.6)**,因为方差 = 8 − HW(x) 仍依赖秘密
   - 掩码后 E[HW(x⊕m)+HW(m)] 与 x 无关(一阶矩恒定)→ 一阶检验通过与一阶 CPA 失效,复现了 ISW 掩码的安全证明预期
7. **评估闭环**:掩码阶数 d → 对应阶 TVLA + 强攻击(模板/ML)→ 报告所需轨迹数上升曲线;要挡二阶需二阶掩码(3 shares)

## 关键细节与常见坑

- **引用纠正**:Mangard 的 glitch 工作为 **CT-RSA 2004(独著)**与 **CT-RSA 2005(与 Popp、Gammel)**,并非 CHES
- **阈值实现两篇**:最早是 Nikova-**Rechberger**-Rijmen,**ICICS 2006**(LNCS 4307);JoC 2011 版作者才是 Nikova-Rijmen-Schläffer——引用勿混淆
- 证明安全 ≠ 实现安全:编译器优化、share 存储复用、随机数重用都会静默破坏安全性
- 高阶掩码的工程瓶颈是随机数吞吐与 O(d²) 乘法开销——真实产品多止步一/二阶,并用隐藏对策补足
- 掩码与恒定时间**正交**:掩码防功耗/EM,恒定时间防计时/缓存;两者都要
- 一阶掩码后别再用一阶 CPA"验证安全"——必须上高阶 TVLA(见 tvla_masking.js 的对照结果)

## 参考实现与工具

- `C:\Users\Administrator\.zcode\workspace\default\side-channel-research\reproductions\tvla_masking.js`——一阶布尔掩码 + TVLA 一阶/二阶完整复现,验证锚点:
  - 掩码构造:L = HW(SBox[p⊕k]⊕m) + HW(m)(x 拆两 share)
  - 未掩码:16/16 SBox 点一阶报警(|t| 19–71),CPA 16/16
  - 一阶掩码:一阶 **0/20 点报警(|t| ≤ 2.4)**、一阶 CPA 0/16;**二阶 14/16 点报警(|t| 最高 19.6)**
  - 结论:一阶掩码挡一阶不挡高阶——正是文献预言行为的定量复现
- ChipWhisperer(真机上跑掩码+TVLA)、SCALib(高阶攻击工具)——知识库 07 域验证

## 已验证参考文献

- Y. Ishai, A. Sahai, D. Wagner, "Private Circuits: Securing Hardware against Probing Attacks", CRYPTO 2003(LNCS 2729, pp.463–481)——探测模型与掩码安全奠基 [高]
- M. Rivain, E. Prouff, "Provably Secure Higher-Order Masking of AES", CHES 2010(LNCS 6225)——软件高阶掩码标准起点 [高]
- S. Mangard, "Hardware Countermeasures against DPA – A Statistical Analysis of Their Effectiveness", CT-RSA 2004(LNCS 2964, pp.222–235)[高]
- S. Mangard, T. Popp, B. Gammel, "Side-Channel Leakage of Masked CMOS Gates", CT-RSA 2005——glitch 使门级掩码失效的实证 [高]
- S. Nikova, V. Rechberger, V. Rijmen, 阈值实现, ICICS 2006(LNCS 4307)——TI 最早文献 [高]
- S. Nikova, V. Rijmen, M. Schläffer, "Secure Hardware Implementation of Nonlinear Functions in the Presence of Glitches", J. Cryptology 24(2):292–321, 2011 [高]
- T. S. Messerges, "Using Second-Order Power Analysis to Attack DPA Resistant Software", CHES 2000(LNCS, pp.238–251)——对掩码的高阶攻击起点 [高]

## 防御与缓解视角

- 本技能即防御技能。互补对策(降低信噪比):随机延迟(Coron-Kizhvatov CHES 2009/2010)、操作 shuffling(Veyrat-Charvillon/Medwed/Kerckhof/Standaert, ASIACRYPT 2012)、双轨逻辑 WDDL(Tiri-Verbauwhede, DATE 2004)
- 组合原则:掩码(阶数)+ 恒定时间 + 隐藏,分别对应功耗/计时/信噪比三个维度
- 认证语境:掩码有效性以 TVLA(CMVP/EMVCo 认可的非侵入式评估)与攻击性评估共同背书

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;对真实设备的掩码验证需书面授权。
