# 05 · 对抗措施与评估方法论(Countermeasures & Evaluation)

> 由调研 agent 于 2026-09-30 联网搜集,每条资源经约 80 次实访核验(Crossref、eprint、NIST/EMVCo 官网、USENIX、GitHub);置信度分级见每条标注。

## 方法地图

```
对策(让泄漏不可用)
├── 掩码 Masking(秘密拆成随机share, 代数可分解)
│   ├── ISW 探测模型基础(Ishai-Sahai-Wagner CRYPTO 2003)
│   ├── 软件高阶掩码(Rivain-Prouff CHES 2010)
│   ├── glitch问题(Mangard 2004/2005: 门级毛刺破坏一阶掩码)
│   └── 阈值实现 Threshold Implementations(Nikova-Rechberger-Rijmen 2006 → JoC 2011)
├── 隐藏 Hiding(降低信噪比)
│   ├── 随机延迟(Coron-Kizhvatov CHES 2009/2010)
│   ├── 操作shuffling(Veyrat-Charvillon ASIACRYPT 2012)
│   └── 双轨逻辑 WDDL(Tiri-Verbauwhede DATE 2004)
├── 恒定时间 Constant-Time(软件防御计时/缓存侧信道的核心)
│   ├── 编程规范: 无秘密相关分支/访存/索引
│   ├── 统计检测: dudect(Reparaz 2017, Welch t)
│   ├── 形式化验证: ct-verif / binsec/rel / CompCert-CT / FaCT DSL
│   └── 工程范本: BearSSL CT文档、libsecp256k1
└── 微架构防御: KPTI/retpoline/LFENCE(Spectre/Meltdown)、
    cache partitioning/页着色/禁SMT、ECC/TRR(Rowhammer, 但被ECCploit/TRRespass挑战)
评估(证明泄漏不存在/不充分)
├── TVLA/Welch t检验(Goodwill 2011 提出 → Schneider-Moradi 2015 系统化 → Standaert 2018 批判)
├── 攻击性评估(用最强已知攻击验证)
└── 标准化: FIPS 140-3 / NIST SP 800-140F / EMVCo / Common Criteria
```

**本域复现锚点**: `../../reproductions/tvla_masking.js`(TVLA 一阶+二阶检验完整复现;一阶掩码通过一阶检验、被二阶检出——正是本域文献预言的行为)。

## 领域综述

本方向三条主线:(1)算法/电路级对抗——掩码(probing 模型、高阶掩码、阈值实现)与隐藏类对策(随机延迟、shuffling、双轨逻辑);(2)恒定时间(CT)编程、验证工具与密码库工程实践;(3)微架构防御(Spectre/Meltdown 的 KPTI/retpoline、缓存隔离、Rowhammer 的 ECC/TRR 有效性检验)。评估方法论以 TVLA(Welch t 检验)为核心,已被 FIPS 140-3/CMVP、EMVCo 纳入标准化认证。核心发表阵地是 CHES/TCHES。

## 资源清单

| # | 标题 | 作者 | 年份 | 出处 | URL | 内容与重要性 | 验证证据 | 置信度 |
|---|---|---|---|---|---|---|---|---|
| 1 | Private Circuits: Securing Hardware against Probing Attacks | Ishai, Sahai, Wagner | 2003 | CRYPTO 2003, LNCS 2729, pp.463-481 | https://doi.org/10.1007/978-3-540-45146-4_27 | 掩码安全模型奠基之作 | Crossref API 返回该 DOI,题目/作者/卷页一致,729 次引用 | 高 |
| 2 | Provably Secure Higher-Order Masking of AES | Rivain, Prouff | 2010 | CHES 2010, LNCS 6225 | https://doi.org/10.1007/978-3-642-15031-9_28 | 软件高阶掩码可证明安全的标准起点 | Crossref 返回一致 | 高 |
| 3 | A Testing Methodology for Side-Channel Resistance Validation | Goodwill, Jun, Jaffe, Rohatgi (Cryptography Research) | 2011 | **NIST NIAT Workshop 论文**(非 CHES) | https://csrc.nist.gov/events/2011/non-invasive-attack-testing-workshop | TVLA/fixed-vs-random t 检验起源 | NIST 事件页列出论文、四位作者、2011-09-26/27 日本奈良 | 高 |
| 4 | Leakage Assessment Methodology | Schneider, Moradi | 2015 | CHES 2015, LNCS 9293(扩展版 JCE 6(2), 2016) | https://eprint.iacr.org/2015/207 | 系统化 t 检验各 flavors 与非特定检验,给出高阶/多变量推广 | eprint 页+Crossref(DOI 10.1007/978-3-662-48324-4_25, pp.495-513)+Springer 页三源一致 | 高 |
| 5 | How (not) to Use Welch's T-test in Side-Channel Security Evaluations | Standaert | 2018 | CARDIS 2018 | https://eprint.iacr.org/2017/138 | 证明"通过 t 检验"可与真实安全脱钩,矩类评估的边界 | eprint 页(作者/年份/CARDIS) | 高 |
| 6 | Hardware Countermeasures against DPA – A Statistical Analysis of Their Effectiveness | Mangard | 2004 | CT-RSA 2004, LNCS 2964, pp.222-235 | https://doi.org/10.1007/978-3-540-24660-2_18 | 统计方法量化各类硬件对策效果 | Crossref+Springer 页(独著/卷页一致) | 高 |
| 7 | Side-Channel Leakage of Masked CMOS Gates | Mangard, Popp, Gammel | 2005 | CT-RSA 2005 | https://doi.org/10.1007/978-3-540-30574-3_24 | 实证 glitch 使门级掩码失效 | Crossref | 高 |
| 8 | Secure Hardware Implementation of Nonlinear Functions in the Presence of Glitches | Nikova, Rijmen, Schläffer | 2011 | J. Cryptology 24(2):292-321 | https://doi.org/10.1007/s00145-010-9085-7 | Threshold Implementations 抗 glitch 掩码 | Crossref DOI 记录 | 高 |
| 9 | An Efficient Method for Random Delay Generation in Embedded Software (CHES 2009) 与 Analysis and Improvement of the Random Delay Countermeasure of CHES 2009 (CHES 2010) | Coron, Kizhvatov | 2009/2010 | CHES | https://doi.org/10.1007/978-3-642-04138-9_12 (前篇) | 随机延迟对策提出与改进 | Crossref 两条记录 | 高 |
| 10 | A Logic Level Design Methodology for a Secure DPA Resistant ASIC or FPGA Implementation (WDDL) | Tiri, Verbauwhede | 2004 | DATE 2004 | https://doi.org/10.1109/date.2004.1268856 | 双轨逻辑经典 | Crossref,439 次引用 | 高 |
| 11 | Shuffling against Side-Channel Attacks: A Comprehensive Study with Cautionary Note | Veyrat-Charvillon, Medwed, Kerckhof, Standaert | 2012 | ASIACRYPT 2012 | https://doi.org/10.1007/978-3-642-34961-4_44 | shuffling 系统研究及警告 | Crossref | 高 |
| 12 | Power Analysis Attacks(教材) | Mangard, Oswald, Popp | 2007 | Springer 专著 | https://doi.org/10.1007/978-0-387-38162-6 | 本领域标准教科书 | Crossref DOI 记录(Springer US, 2007) | 高 |
| 13 | dude, is my code constant time? | Reparaz, Balasch, Verbauwhede | 2017 | DATE 2017 | https://github.com/oreparaz/dudect | CT 统计泄漏检测工具(论文 eprint 2016/1123) | GitHub README(作者/DATE 2017/t>10 判据) | 高 |
| 14 | Verifying Constant-Time Implementations (ct-verif) | Almeida, Barbosa, Barthe, Dupressoir, Emmi | 2016 | USENIX Security 2016, pp.53-70 | https://www.usenix.org/conference/usenixsecurity16/technical-sessions/presentation/almeida | LLVM 级 CT 形式化验证 | USENIX 论文页 | 高 |
| 15 | FaCT: A DSL for Timing-Sensitive Computation | Cauligi, Soeller 等 10 人 | 2019 | PLDI 2019(前身 SecDev 2017) | https://doi.org/10.1145/3314221.3314605 | CT 领域语言 | Crossref+GitHub(PLSysSec/FaCT) | 高 |
| 16 | binsec/rel | Daniel, Bardin, Rezk | 2020 | IEEE S&P 2020 | https://github.com/binsec/binsec | 二进制级关系符号执行 CT 验证 | Crossref+binsec.github.io | 高 |
| 17 | SoK: The Constant Time Model | Brumley | 2026 | WOOT 2026 | https://eprint.iacr.org/2026/1242 | 系统化学术/工业界 CT 模型差异并给出攻击方法论 | eprint 页(2026-06 提交,WOOT 2026) | 高 |
| 18 | CT 密码库实践: BearSSL "Constant-Time Crypto"、libsecp256k1 README | Pornin;bitcoin-core | 2018- | 官方文档/仓库 | https://bearssl.org/constanttime.html | CT 工程一手教材:秘密相关分支/访存、编译器陷阱 | 三站均访问;secp256k1 明确 "constant time…signing" | 高 |
| 19 | A Survey of Microarchitectural Timing Attacks and Countermeasures on Contemporary Hardware | Ge, Yarom, Cock, Heiser | 2016在线/2018刊 | J. Cryptographic Engineering 8(1):1-27 | https://doi.org/10.1007/s13389-016-0141-6 | 缓存隔离/partitioning/page coloring 等防御综述 | Crossref | 高 |
| 20 | Meltdown: Reading Kernel Memory from User Space | Lipp, Schwarz, Gruss 等 12 人 | 2018 | USENIX Security 2018, pp.973-990 | https://meltdownattack.com | KPTI(KAISER)的动机与部署 | 官网+USENIX 论文页 | 高 |
| 21 | Spectre Attacks: Exploiting Speculative Execution | Kocher, Horn 等 12 人 | 2019 | IEEE S&P 2019(CACM 2020 扩展版) | https://spectreattack.com | 推测执行攻击总纲,各缓解的参照系 | Crossref+官网 | 高 |
| 22 | Linux Kernel Hardware Vulnerabilities 文档 | kernel.org 社区 | 持续更新 | 官方文档 | https://kernel.org/doc/html/latest/admin-guide/hw-vuln/ | retpoline/LFENCE/IBRS/RSB 填充等工程化缓解的权威说明 | 已访问 index、spectre、l1tf 三页 | 高 |
| 23 | Flipping Bits in Memory Without Accessing Them (Rowhammer) | Kim, Daly 等 9 人 | 2014 | ISCA 2014 | https://doi.org/10.1109/isca.2014.6853210 | Rowhammer 发现 | Crossref(ISCA 版+SIGARCH CAN 版) | 高 |
| 24 | ECCploit(S&P 2019, DOI 10.1109/sp.2019.00089)与 TRRespass(S&P 2020, DOI 10.1109/sp40000.2020.00090) | Cojocar 等;Frigo 等 | 2019/2020 | IEEE S&P | https://vusec.net/projects/eccploit/ | 证明 ECC 与 TRR 均不足以抵御 Rowhammer | Crossref 两条+VUSec 项目页(含 CVE) | 高 |
| 25 | FIPS 140-3(2019)、NIST SP 800-140F(2020)、EMVCo Security Evaluation | NIST;EMVCo | 2019-2020 | 标准/认证 | https://csrc.nist.gov/pubs/fips/140-3/final | 标准化非侵入式评估:CMVP 批准测试度量;EMVCo 产品评估流程 | 三页均实际访问 | 高 |

## 工具与数据集

| 名称 | 用途 | URL | 验证情况 |
|---|---|---|---|
| ChipWhisperer | 开源 SCA 采集硬件+分析工具链,动手评估首选 | https://github.com/newaetech/chipwhisperer | 已验证 |
| dudect | CT 运行时统计检测 | https://github.com/oreparaz/dudect | 已验证 |
| ct-verif | LLVM 级 CT 静态验证 | (见条目 14) | 论文页已验证;原 GitHub 仓库现 404,取码需另寻 |
| FaCT | CT DSL 编译器 | https://github.com/PLSysSec/FaCT | 已验证 |
| binsec(含 rel) | 二进制级形式化验证 | https://github.com/binsec/binsec | 已验证 |
| ASCAD | ANSSI 掩码 AES 能量迹数据集+深度学习基线 | https://github.com/ANSSI-FR/ASCAD | 已验证(2026-01 起只读归档) |

## 入门路径

1. **Mangard-Oswald-Popp (2007)**:建立对策与评估的全景词汇
2. **ISW (2003) → Rivain-Prouff (2010) → Nikova 等 (2011)**:掩码从安全模型到工程实现的主线
3. **Goodwill (2011) → Schneider-Moradi (2015) → Standaert (2018)**:TVLA 从提出、系统化到批判性使用的完整弧线
4. **BearSSL CT 页 → dudect → FaCT/binsec**:动手写、测、验证 CT 代码
5. **Ge 等综述+内核 hw-vuln 文档+Spectre/Meltdown 论文**,再用 ChipWhisperer+ASCAD 完成一次真实泄漏评估

## 纠错与存疑

**纠错(经核实与常见引用不符处):**
1. **Goodwill 等 TVLA 论文常被引作 "CHES 2011";实为 NIST Non-Invasive Attack Testing Workshop 2011 论文**(2011-09-26/27 奈良),不在 CHES 论文集
2. Schneider-Moradi:正式发表为 **CHES 2015** 而非 2016;作者仅两人(无 Güneysu);扩展版载 JCE 2016
3. ct-verif:USENIX Security 2016(非 EUROCRYPT 2017),作者含 Emmi
4. FaCT:主论文 **PLDI 2019**(非 CCS 2017),SecDev 2017 为早期版本;仓库为 PLSysSec/FaCT
5. binsec/rel:**S&P 2020**(非 2021)
6. ECCploit:S&P 2019,准确标题 "…ECC Memory Against Rowhammer Attacks",作者四人含 Razavi
7. Mangard 的 glitch 工作:准确出处为 **CT-RSA 2004**(独著)与 CT-RSA 2005(Mangard-Popp-Gammel),并非 CHES
8. 阈值实现最早为 Nikova-**Rechberger**-Rijmen(**ICICS 2006**,LNCS 4307);JoC 2011 版作者才是 Nikova-Rijmen-Schläffer
9. shuffling 论文合著者为 Medwed 与 Kerckhof(非 Gérard)

**存疑[未验证]:**
- ISO/IEC 17825:2016——iso.org 返回 403(相邻已验证锚点:SP 800-140F)
- Common Criteria(ISO/IEC 15408)门户 403/空内容
- Google 原帖 "Retpoline: A Branch Target Injection Mitigation"(Paul Turner)——cloud.google.com 超时;retpoline 技术内容已由 kernel.org 验证
- ELMO 泄漏建模工具(github.com/bristol-sca/ELMO)与 Jasmin 仓库多次超时
- fixed-vs-fixed t 检验变体原始出处——未能定论,引用时避免归名
