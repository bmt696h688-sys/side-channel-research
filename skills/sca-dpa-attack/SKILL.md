---
name: sca-dpa-attack
description: "经典差分功耗分析(Differential Power Analysis/DPA, Kocher-Jaffe-Jun 1999):用选择函数按秘密相关中间值位把轨迹分组、做均值差分,以统计方式从噪声中提取密钥。适用于智能卡/嵌入式设备侧信道安全评估、授权渗透测试、密码实现安全研究。不适用于普通性能优化或无功耗测量数据的场景。关键词: DPA, differential power analysis, 差分功耗分析, selection function, 划分函数, 侧信道, 功耗分析。"
---

# 差分功耗分析(DPA)

## 适用场景与不适用场景

**适用**:
- 有批量功耗轨迹(数百至数千条)+ 已知明文/密文,目标为恢复密钥
- 复现 1999 年原始方法,或作为理解 CPA(sca-cpa-attack)的前置
- 掩码实现需要高阶推广时的思想起点(二阶 DPA)

**不适用**:
- 追求信息利用率与工程效率 → 直接用 CPA(sca-cpa-attack)
- 单轨迹可读 → SPA(sca-spa-analysis)
- 可在相似设备上 profiling → 模板/ML 攻击(sca-template-attack / sca-ml-profiling)
- 计时/缓存信道 → 对应技能

## 前置条件与输入

- N 条对齐的功耗轨迹 + 每条轨迹的已知输入(明文或密文)
- 目标算法结构知识,能写出中间值表达式
- 采集工程见 sca-trace-acquisition

## 方法学步骤

1. **选中间值**:取一个依赖已知输入与单字节密钥假设的中间值。AES 首选第一轮 SBox 输出:
   v = SBox(p_i ⊕ k_i),p_i 已知,k_i ∈ {0,…,255} 待猜
2. **定义选择(划分)函数**:取 v 的某一位 d(v) ∈ {0,1};位选择影响敏感度,常见取 LSB 或 MSB,可多试几位
3. **差分计算**:对每个密钥假设 k:
   - 按 d_k(v) 把 N 条轨迹分为两组 G₁/G₀
   - 逐时间点计算差分曲线:Δ_k(t) = mean_{i∈G₁} T_i(t) − mean_{i∈G₀} T_i(t)
4. **判别**:正确假设的 Δ_k(t) 在中间值被处理的时刻出现尖峰;错误假设的差分近似零均值噪声
   - 判据:尖峰幅值超过噪声包络,如 |Δ| > 4·σ_noise;σ_noise 可用错误假设差分曲线的标准差估计
5. **逐字节重复**至恢复完整密钥;用已知明密文对验证正确性
6. **样本量规划**:噪声 σ 越大所需 N 越多。单比特划分的信息量少于 CPA 的全字节汉明重量模型,同等条件下需要更多轨迹(定量参照 cpa_aes.js 的 σ×N 相变表:HW 泄漏下 σ=3.0 时 N=50 仅 6/16、N=300 才 16/16)

## 关键细节与常见坑

- 差分峰可能出现在中间值处理点之后(总线保持、流水线延迟)——不要只盯一个时间点
- 一阶 DPA 对掩码实现失效:掩码使单点一阶统计量与秘密独立;需要二阶/高阶组合统计(Messerges 2000 起的路线)
- DPA 与 CPA 的关系:CPA = 把"单比特划分 + 均值差"推广为"全字节 HW 模型 + Pearson 相关",两者都是非剖析区分器,CPA 信息效率更高、分组不均衡问题更少
- 分组不均衡(某假设下某组样本极少)会放大差分方差;可改用相关系数形式规避
- 明文已知选第一轮中间值,密文已知选最后一轮(如 SBox⁻¹(c_i ⊕ k_i))
- 引用口径:DPA 论文确为 CRYPTO 1999(LNCS 1666, pp.388–397),常见"1998"为误引

## 参考实现与工具

- `C:\Users\Administrator\.zcode\workspace\default\side-channel-research\reproductions\cpa_aes.js`——CPA 完整复现(验证锚点:N=300、σ=1.0 下 16/16 字节恢复,r≈0.79–0.85 与理论 √(2/3)≈0.816 吻合;σ×N 鲁棒性矩阵)。把其中的 Pearson 区分器替换为"单比特分组均值差"即得经典 DPA,数据管线完全复用
- ChipWhisperer(SCA101 动手课程)、SCALib、SideChannelMarvels/Daredevil——知识库 07 域验证

## 已验证参考文献

- P. Kocher, J. Jaffe, B. Jun, "Differential Power Analysis", CRYPTO 1999(LNCS 1666, pp.388–397)——DPA 奠基 [高]
- P. Kocher, J. Jaffe, B. Jun, P. Rohatgi, "Introduction to differential power analysis", Journal of Cryptographic Engineering 1(3), 2011 [高]
- T. S. Messerges, "Using Second-Order Power Analysis to Attack DPA Resistant Software", CHES 2000(LNCS, pp.238–251)——对掩码实现的高阶推广起点 [高]
- E. Brier, C. Clavier, F. Olivier, "Correlation Power Analysis with a Leakage Model", CHES 2004(LNCS, pp.16–29)——CPA 推广路线,见 sca-cpa-attack [高]
- S. Mangard, E. Oswald, T. Popp, Power Analysis Attacks: Revealing the Secrets of Smart Cards, Springer, 2007 [高]

## 防御与缓解视角

- 掩码使一阶统计量与秘密独立,直接破坏 DPA 的分组可分性(见 sca-masking-countermeasures)
- 隐藏类对策(随机延迟、shuffling、双轨逻辑)降低信噪比,推高所需轨迹数
- 评估不能只做"DPA 打不过":用 TVLA(sca-tvla-leakage-detection)系统性检测泄漏,再用最强攻击验证

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;对真实设备采集功耗并执行攻击需书面授权。
