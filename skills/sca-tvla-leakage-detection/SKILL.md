---
name: sca-tvla-leakage-detection
description: "TVLA(Test Vector Leakage Assessment)泄漏检测:固定 vs 随机测试向量设计 + 逐点 Welch t 检验(|t|>4.5 报警),无需恢复密钥即可判定实现是否存在泄漏;含一阶盲区与高阶检验。适用于密码设备侧信道安全评估、认证测试(FIPS 140-3/EMVCo 语境)、掩码有效性验证。不适用于普通统计检验或非侧信道的质量测试。关键词: TVLA, leakage assessment, Welch t-test, 泄漏检测, 泄漏评估, fixed vs random, 侧信道, 掩码验证, 认证评估。"
---

# TVLA 泄漏检测(Leakage Assessment)

## 适用场景与不适用场景

**适用**:
- 快速判定"这个实现有没有泄漏"——不选密钥、不建泄漏模型(非特定检验)
- 认证/评估语境:FIPS 140-3(CMVP)与 EMVCo 均纳入非侵入式泄漏评估
- 掩码对策的有效性验证:一阶通过 + 二阶检出 = 一阶掩码的预期行为

**不适用**:
- 证明"安全":一阶通过 ≠ 安全(见"关键细节")
- 需要可利用性证据 → 配合 CPA/模板等攻击性评估
- 普通产品统计质检(测量不依赖秘密)

## 前置条件与输入

- 可重复执行目标实现的设备 + 采集链路(见 sca-trace-acquisition)
- 两组轨迹:固定组(同一测试向量重复)与随机组(每次随机输入),各 ≥ 1000 条
- 轨迹对齐(或后续用容忍失配的分窗检验)

## 方法学步骤

1. **fixed-vs-random 设计**:
   - 固定组:固定明文/密钥的同一向量重复执行 N₁ 次
   - 随机组:每次随机明文执行 N₂ 次
   - 用多个固定向量(如 3 个)分别与随机组配对,防止特定固定值恰好落在盲区
2. **逐点 Welch t 检验**(不假设两组方差相等):
   t(x) = (μ_fixed(x) − μ_random(x)) / √(s₁²(x)/n₁ + s₂²(x)/n₂)
3. **报警判据**:**|t| > 4.5**(对应约 10⁻⁵ 量级的单点 p 值;经验阈值,平衡灵敏度与误报)
   - 多重比较修正的思路:一条轨迹数千点,单点 4.5 在大点数下仍会有零星越界——看**成簇**报警与跨固定向量的复现性,而非单点
4. **多固定向量融合**:对 3 个固定向量分别算 t,取逐点 max|t| 再判阈值
5. **一阶掩码的验证**:掩码实现应使一阶 t 全点通过——复现实测:一阶掩码 0/20 点报警(|t| ≤ 2.4)
6. **高阶(二阶)检验**:一阶矩恒定不代表分布恒定,掩码泄漏藏在方差/联合矩里:
   - 二阶单变量做法:对每条轨迹先做中心化平方(或对两组分别做方差齐性检验),再对变换后的量逐点做 t 检验
   - 复现实测:一阶掩码的 SBox 点 **14/16 被二阶检验报警(|t| 最高 19.6)**——因为方差 = 8 − HW(x) 仍依赖秘密
7. **报告**:每组设计的报警点数/位置、阈值、N、σ;掩码实现必须同时给出一阶与高阶结论,并附攻击性验证(CPA/ML)

## 关键细节与常见坑

- **Goodwill 2011 出处纠正**:TVLA 起源论文是 **NIST Non-Invasive Attack Testing Workshop 2011**(2011-09-26/27,日本奈良;作者 Goodwill/Jun/Jaffe/Rohatgi,时在 Cryptography Research),**不是 CHES 2011**——高频引用错误
- **Schneider-Moradi 纠正**:正式发表为 **CHES 2015**(非 2016),作者仅两人(无 Güneysu);扩展版 J. Cryptogr. Eng. 6(2), 2016
- **通过 ≠ 安全**(Standaert 2018):t 检验通过可与真实可利用性脱钩;矩类评估只覆盖低阶统计量,评估必须补攻击性验证
- 轨迹失配会同时压低固定/随机差异造成**假阴性**;随机延迟对策产生系统性假阴性——先对齐或分窗
- 两组除输入外一切条件必须相同:交替采集防温度/供电漂移趋势被误判为泄漏
- 一阶盲区:单个固定向量可能恰好与随机组一阶矩重合 → 多固定向量是标配而非可选项

## 参考实现与工具

- `C:\Users\Administrator\.zcode\workspace\default\side-channel-research\reproductions\tvla_masking.js`——TVLA 完整复现,验证锚点:
  - 设定:fixed vs random 各 1000 条、σ=0.75、|t|>4.5、3 个固定向量取 max|t|
  - 未掩码实现:16/16 SBox 点一阶报警(|t| 19–71)
  - 一阶掩码(L = HW(SBox[p⊕k]⊕m) + HW(m)):一阶 **0/20 点报警(|t| ≤ 2.4)**、一阶 CPA 0/16 首位命中;二阶 **14/16 点报警(|t| 最高 19.6)**
  - 结论即"一阶掩码挡一阶不挡高阶"的定量演示
- ChipWhisperer(采集)、SCALib(含 leakage assessment 工具)——知识库 07 域验证

## 已验证参考文献

- G. Goodwill, B. Jun, J. Jaffe, P. Rohatgi, "A Testing Methodology for Side-Channel Resistance Validation", NIST Non-Invasive Attack Testing Workshop 2011(奈良;**非 CHES 2011**)——TVLA/fixed-vs-random 起源 [高]
- T. Schneider, M. Moradi, "Leakage Assessment Methodology", CHES 2015(LNCS 9293, pp.495–513;扩展版 J. Cryptogr. Eng. 6(2), 2016)——t 检验各 flavors 系统化与高阶推广 [高]
- F.-X. Standaert, "How (not) to Use Welch's T-test in Side-Channel Security Evaluations", CARDIS 2018(eprint 2017/138)——批判性使用边界 [高]
- NIST FIPS 140-3(2019)、NIST SP 800-140F(2020)、EMVCo Security Evaluation——标准化非侵入式评估框架 [高]

## 防御与缓解视角

- TVLA 是防御侧的"烟雾报警器":设计-实现-复测闭环的检测环节
- 掩码开发流程:每加一层 share,跑对应阶数的检验(一阶掩码 → 一阶+二阶都测)
- 认证语境:CMVP/EMVCo 对非侵入式评估有明确测试度量要求;TVLA 是通用工程实践入口

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;对真实设备进行泄漏检测需书面授权。
