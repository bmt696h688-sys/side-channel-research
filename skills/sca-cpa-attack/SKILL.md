---
name: sca-cpa-attack
description: "相关性功耗分析(Correlation Power Analysis/CPA, Brier-Clavier-Olivier CHES 2004):汉明重量/汉明距离泄漏模型 + Pearson 相关区分器,逐字节枚举密钥假设,是工程默认的非剖析功耗攻击。适用于智能卡/嵌入式/SoC 侧信道评估、授权渗透测试、密码实现安全研究。不适用于普通性能优化或计时/缓存问题。关键词: CPA, correlation power analysis, 相关性功耗分析, Hamming weight, 汉明重量, leakage model, 泄漏模型, 侧信道, 功耗分析。"
---

# 相关性功耗分析(CPA)

## 适用场景与不适用场景

**适用**:
- 批量对齐功耗轨迹 + 已知明文(或密文),无 profiling 设备,想恢复密钥——非剖析攻击的工程默认
- 泄漏可近似为汉明重量(寄存器/预充电总线)或汉明距离(总线翻转)
- 攻击性评估:TVLA 报警后验证泄漏可利用性

**不适用**:
- 一阶掩码实现的一阶 CPA(会失败;复现实测 0/16 首位命中)→ 高阶/ML 方法
- 泄漏严重非线性/多变量耦合 → 考虑 MIA(免模型)或模板/ML 攻击
- 单轨迹可读 → SPA;计时信道 → sca-remote-timing

## 前置条件与输入

- N 条对齐轨迹(时间点集 T)+ 每条轨迹的已知输入字节
- 中间值选择:AES 首轮 v = SBox(p_i ⊕ k_i)(或末轮 SBox⁻¹(c_i ⊕ k_i))
- 泄漏模型:HW(x) = Σ_j x_j(8 位值期望 4、方差 2);总线翻转场景用 HD(x, x') = HW(x ⊕ x')

## 方法学步骤

1. **建假设矩阵**:对每个密钥字节位置 i、每个假设 k ∈ {0,…,255}、每条轨迹 j:
   H[k][j] = HW(SBox(p_i^(j) ⊕ k))
2. **逐点 Pearson 相关**:对每个时间点 t、每个假设 k:
   r_k(t) = Σ_j (H − H̄)(T_t^(j) − T̄_t) / √(Σ_j (H − H̄)² · Σ_j (T_t^(j) − T̄_t)²)
3. **密钥判决**:取 ρ_k = max_t |r_k(t)|,argmax_k ρ_k 即该字节密钥;16 个字节逐一(或并行)处理
4. **判据与边际**:正确假设应显著高于次优——复现实测:正确 r ≈ 0.79–0.85、最优错误假设 r ≈ 0.21–0.29,边际 ≥ 0.52,排除偶然;边际过小意味着样本不足或模型失配,应加 N 或换模型
5. **轨迹数与噪声的关系**(核心公式):HW 泄漏下正确假设的期望相关
   ρ ≈ √(Var_model / (Var_model + σ²)),其中 Var_model = 2
   - σ=1.0 时 ρ ≈ √(2/3) ≈ 0.816(实测 0.80–0.85,吻合)
   - σ=3.0 时 ρ ≈ √(2/11) ≈ 0.43——噪声越大所需 N 越多,呈相变:复现中 σ=3.0 时 N=50 仅 6/16,N=300 才 16/16
6. **泄漏点搜索**:点数少时直接全点枚举(256 假设 × T 点 × N 轨迹;复现 20 点 0.1s);点数大时先用 SNR/方差分析或 t 检验(TVLA 思路)定位兴趣窗口再枚举

## 关键细节与常见坑

- **作者纠正**:CPA 论文仅 Brier、Clavier、Olivier 三位作者(CHES 2004, LNCS, pp.16–29),常见引用误加 Colin Walter——经 Crossref 两次独立核实不存在
- HW vs HD 取决于硬件(总线是否预充电、寄存器复用);不确定时两个模型都跑,取相关高者
- 相关峰可能为负(反相放大环节)——用 |r| 判决
- 对掩码实现,一阶 CPA 排名如随机(tvla_masking.js 实测 0/16 首位命中)——此时不要硬加 N,换高阶统计或 ML 剖析
- 相变意味着"差一点样本"会从全对跳到几乎全错:报告结果时给 σ×N 敏感性矩阵,而非单点数字
- 明文字节在 256 个值上要覆盖均匀,否则部分假设欠约束
- 轨迹失配(触发抖动)会同时稀释所有假设的相关——先解决对齐再谈攻击

## 参考实现与工具

- `C:\Users\Administrator\.zcode\workspace\default\side-channel-research\reproductions\cpa_aes.js`——CPA 完整复现:
  - 验证锚点 1:N=300、σ=1.0 下 16/16 字节完整恢复 128 位密钥,正确假设 r≈0.79–0.85,与理论 √(2/3)≈0.816 定量吻合
  - 验证锚点 2:σ×N 鲁棒性矩阵(σ=0–3.0 × N=50–500),呈现噪声-轨迹数相变
  - 设定:20 采样点(16 个 SBox HW 泄漏点 + 4 纯噪声点)、固定种子确定性 PRNG、FIPS-197/SP 800-38A 已知答案测试锚定 AES 实现
- 分析库(知识库 07 域验证):SCALib、lascar、scared、Jlsca、SideChannelMarvels/Daredevil(含高阶 CPA);硬件采集 ChipWhisperer(SCA101)

## 已验证参考文献

- E. Brier, C. Clavier, F. Olivier, "Correlation Power Analysis with a Leakage Model", CHES 2004(LNCS, pp.16–29)——CPA 与 HW/HD 泄漏模型原始文献(仅此三位作者)[高]
- S. Mangard, E. Oswald, T. Popp, Power Analysis Attacks: Revealing the Secrets of Smart Cards, Springer, 2007 [高]
- B. Gierlichs, L. Batina, P. Tuyls, B. Preneel, "Mutual Information Analysis", CHES 2008(LNCS, pp.426–442)——免泄漏模型的替代区分器(注意拼写 Gierlichs)[高]
- P. Kocher, J. Jaffe, B. Jun, "Differential Power Analysis", CRYPTO 1999(LNCS 1666, pp.388–397)——CPA 的方法学前身 [高]

## 防御与缓解视角

- 掩码使一阶相关消失(见 sca-masking-countermeasures 与 tvla_masking.js 实测对照)
- 隐藏对策(随机延迟/shuffling)通过时间失配降低逐点相关;CNN 数据增强可对抗(见 sca-ml-profiling)
- 评估建议 CPA 与 TVLA 交叉验证:TVLA 非特定、CPA 特定,两者结论矛盾时优先排查实现细节与对齐

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;对真实设备采集功耗并执行攻击需书面授权。
