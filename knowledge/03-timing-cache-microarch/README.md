# 03 · 计时攻击、缓存侧信道与微架构攻击(Timing / Cache / Microarch)

> 由调研 agent 于 2026-09-30 联网搜集,每条资源经出版社/会议官网/eprint/GitHub/权威书目 API(Crossref、OpenAlex、Semantic Scholar)实访核实(约 50 次访问);置信度分级见每条标注。

## 方法地图

```
计时线
├── Kocher 1996(范式确立: 大样本统计 + 秘密相关执行时间)
├── Brumley-Boneh 2003(远程网络计时可行, OpenSSL RSA)
├── Bernstein 2005(AES T-table 缓存计时) / Percival 2005(超线程共享L1)
└── SMT端口竞争 PortSmash(2019)、TLB(TLBleed 2018)
缓存线
├── Prime+Probe / Evict+Time(Osvik-Shamir-Tromer, CT-RSA 2006)
├── Flush+Reload(Yarom-Falkner, USENIX Sec 2014, 需共享内存+clflush)
├── Prefetch侧信道(Gruss 2016, 绕SMAP/KASLR)
└── 应用于AES/RSA窗口/ECDSA nonce(Benger 2014: FL+格归约恢复ECDSA)
瞬态执行线(2018重构全领域)
├── Meltdown(Lipp 2018) / Spectre(Kocher 2019正式版)
└── 防御: KPTI/retpoline/LFENCE(见05域)
故障线(主动扰动,与被动侧信道相邻)
└── Rowhammer(Kim 2014) → Rowhammer.js(2016) → ECCploit(2019, 推翻ECC缓解假设)
防御与验证线
└── 恒定时间编程 + ct-verif/dudect/FaCT(详见05域)
```

**本域复现锚点**: `../../reproductions/timing_attack.js`(字节级计时攻击完整复现:8/8 字节+恒定时间对照)。

## 领域综述

本方向研究利用实现层物理泄露(执行时间、缓存/TLB 状态、分支预测器、SMT 执行端口、DRAM 扰动)恢复密码秘密。脉络:1996 年 Kocher 确立计时攻击范式;2003 年 Brumley/Boneh 证明网络远程可行;2005–2006 年 Percival、Bernstein、Osvik 等将攻击面扩展至共享缓存(Prime+Probe、Evict+Time);2014 年 FLUSH+RELOAD 大幅提升信噪比、Rowhammer 把故障注入带入软件;2018 年 Spectre/Meltdown 以瞬态执行重构全领域,同期 SMT 端口(PortSmash)、TLB(TLBleed)、prefetch 等信道涌现。防御以恒定时间编程为核心,辅以形式化验证(ct-verif、FaCT)与统计检测(dudect)。

## 资源清单

| # | 标题 | 作者 | 年份 | 出处 | URL | 内容与重要性 | 验证证据 | 置信度 |
|---|---|---|---|---|---|---|---|---|
| 1 | Timing Attacks on Implementations of Diffie-Hellman, RSA, DSS, and Other Systems | P. C. Kocher | 1996 | CRYPTO '96, LNCS 1109, pp.104–113 | https://doi.org/10.1007/3-540-68697-5_9 | 计时攻击奠基之作 | Crossref 核实题录/作者/页码 | 高 |
| 2 | Remote Timing Attacks are Practical | D. Brumley, D. Boneh | 2003 | 12th USENIX Security Symposium(Best Paper) | https://www.usenix.org/legacy/events/sec03/tech.html | 首次网络远程计时攻击 OpenSSL RSA | USENIX '03 议程页确认条目与 Best Paper 标记;Boneh 主页交叉核对 | 高 |
| 3 | Cache-timing attacks on AES | D. J. Bernstein | 2005 | 技术报告(从未正式发表) | https://cr.yp.to/antiforgery/cachetiming-20050414.pdf | AES 远程缓存计时全密钥恢复,推动恒定时间 AES | Semantic Scholar 核实(2005,无 venue);cr.yp.to 本网络不可达 | 中 |
| 4 | Cache missing for fun and profit | C. Percival | 2005 | BSDCan '05 演讲 | https://daemonology.net/papers/ | 超线程共享 L1 攻击 RSA | 作者论文页确认 "presented at BSDCan '05, May 2005" 及 10 月修订版 | 高 |
| 5 | Cache Attacks and Countermeasures: the Case of AES | D. A. Osvik, A. Shamir, E. Tromer | 2006 | CT-RSA 2006, LNCS 3860, pp.1–20 | https://eprint.iacr.org/2005/271 | 提出 Prime+Probe 与 Evict+Time,65ms 恢复 dm-crypt 密钥;期刊版 JoC 23(1) 2010 | eprint+Springer 章节+Crossref(DOI 10.1007/11605805_1)三重核对 | 高 |
| 6 | Predicting Secret Keys Via Branch Prediction | O. Acıçımez, Ç. K. Koç, J.-P. Seifert | 2007 | CT-RSA 2007, LNCS, pp.225–242 | https://doi.org/10.1007/11967668_15 | 分支预测侧信道经典 | Crossref 核实含作者拼写(Acıçımez) | 高 |
| 7 | FLUSH+RELOAD: a High Resolution, Low Noise, L3 Cache Side-Channel Attack | Y. Yarom, K. Falkner | 2014 | USENIX Security 2014 | https://www.usenix.org/conference/usenixsecurity14/technical-sessions/presentation/yarom | 利用 clflush+共享页的高分辨率攻击,单次签名恢复 GnuPG RSA 约 96.7% 密钥位 | USENIX 页面确认全部元数据 | 高 |
| 8 | Flipping Bits in Memory Without Accessing Them(Rowhammer) | Y. Kim 等 9 人 | 2014 | ISCA 2014, pp.361–372 | https://doi.org/10.1109/isca.2014.6853210 | Rowhammer 奠基、系统刻画 DRAM 扰动错误 | OpenAlex 核实(IEEE/ACM 双记录) | 高 |
| 9 | "Ooh Aah... Just a Little Bit": A Small Amount of Side Channel Can Go a Long Way | N. Benger, J. van de Pol, N. Smart, Y. Yarom | 2014 | CHES 2014 | https://eprint.iacr.org/2014/161 | FLUSH+RELOAD 泄露 ECDSA nonce+格归约恢复密钥 | eprint 页确认 CHES 2014 | 高 |
| 10 | Meltdown: Reading Kernel Memory from User Space | M. Lipp, M. Schwarz, D. Gruss 等 12 人 | 2018 | USENIX Security 2018 | https://www.usenix.org/conference/usenixsecurity18/presentation/lipp | 越过特权检查读内核内存,催生 KPTI | USENIX 页面确认完整作者表 | 高 |
| 11 | Spectre Attacks: Exploiting Speculative Execution | P. Kocher, J. Horn 等 12 人 | 2019(2018 年 1 月披露) | IEEE S&P 2019 | https://doi.org/10.1109/SP.2019.00002 | 推测执行侧信道通用框架 | Crossref(S&P 2019)+spectreattack.com 交叉验证;另有 CACM 2020 版 | 高 |
| 12 | Port Contention for Fun and Profit(PortSmash, CVE-2018-5407) | A. C. Aldaya, B. B. Brumley, S. ul Hassan, C. P. García, N. Tuveri | 2019 | IEEE S&P 2019, pp.870–887 | https://eprint.iacr.org/2018/1060 | SMT 执行端口竞争计时攻击,恢复 OpenSSL P-384 ECDSA 密钥 | eprint+Crossref+GitHub PoC 三源核对 | 高 |
| 13 | Translation Leak-aside Buffer(TLBleed) | B. Gras, K. Razavi, H. Bos, C. Giuffrida | 2018 | USENIX Security 2018, pp.955–972 | https://www.usenix.org/conference/usenixsecurity18/presentation/gras | TLB 侧信道代表作,绕过缓存防御恢复 EdDSA,促使 OpenBSD 默认关 HT | USENIX+OpenAlex+VUSec 页核对;另有 Black Hat USA 2018 报告 | 高 |
| 14 | Prefetch Side-Channel Attacks: Bypassing SMAP and Kernel ASLR | D. Gruss, C. Maurice, A. Fogh, M. Lipp, S. Mangard | 2016 | ACM CCS 2016 | https://doi.org/10.1145/2976749.2978356 | prefetch 时序泄露绕过 SMAP/KASLR | Crossref 核实 | 高 |
| 15 | Rowhammer.js: A Remote Software-Induced Fault Attack in JavaScript | D. Gruss, C. Maurice, S. Mangard | 2016 | DIMVA 2016, pp.300–321 | https://doi.org/10.1007/978-3-319-40667-1_15 | 浏览器内触发 Rowhammer,故障攻击远程化 | Crossref 核实 | 高 |
| 16 | Exploiting Correcting Codes(ECCploit) | L. Cojocar, K. Razavi, C. Giuffrida, H. Bos | 2019 | IEEE S&P 2019, pp.55–71 | https://doi.org/10.1109/sp.2019.00089 | 证明 ECC 纠错行为本身成为信道,推翻"ECC 缓解 Rowhammer"假设 | Crossref 核实 | 高 |
| 17 | A survey of microarchitectural timing attacks and countermeasures on contemporary hardware | Q. Ge, Y. Yarom, D. Cock, G. Heiser | 2018 | J. Cryptographic Engineering 8(1):1–27 | https://doi.org/10.1007/s13389-016-0141-6 | 本方向最系统综述(攻击面+防御 taxonomy) | Crossref 核实;注意刊名非 Computers & Security | 高 |
| 18 | Microarchitectural Attacks and Countermeasures(书章) | O. Acıçmez, Ç. K. Koç | 2009 | Cryptographic Engineering, Springer, pp.475–504 | https://doi.org/10.1007/978-0-387-71817-0_18 | 前 Spectre 时代权威早期综述 | Crossref 核实 | 高 |
| 19 | SoK: Hardware Defenses Against Speculative Execution Attacks | G. Hu, Z. He, R. B. Lee | 2021 | IEEE SEED 2021 | https://doi.org/10.1109/seed51797.2021.00023 | 近年瞬态执行硬件防御系统化 | Crossref 核实 | 中 |
| 20 | Verifying Constant-Time Implementations(ct-verif) | J. B. Almeida, M. Barbosa, G. Barthe, F. Dupressoir, M. Emmi | 2016 | USENIX Security 2016, pp.53–70 | https://www.usenix.org/conference/usenixsecurity16/technical-sessions/presentation/almeida | 恒定时间性形式化静态验证 | USENIX 页核实 | 高 |
| 21 | Faster and Timing-Attack Resistant AES-GCM | E. Käsper, P. Schwabe | 2009 | CHES 2009, LNCS | https://doi.org/10.1007/978-3-642-04138-9_1 | 恒定时间 bitsliced AES 原始文献 | OpenAlex 书目核实(未访问出版社页) | 中 |
| 22 | dude, is my code constant time? | O. Reparaz, J. Balasch, I. Verbauwhede | 2017 | DATE 2017;eprint 2016/1123 | https://github.com/oreparaz/dudect | Welch t 检验恒定时间统计检测,约 350 行可嵌入 | GitHub README 核实 | 高 |
| 23 | FaCT: A DSL for Timing-Sensitive Computation | S. Cauligi, G. Soeller 等 10 人 | 2019 | PLDI 2019, pp.174–189 | https://doi.org/10.1145/3314221.3314605 | 恒定时间 DSL,编译期保证 | Crossref 核实 | 高 |
| 24 | Formal verification of a constant-time preserving C compiler | G. Barthe 等 7 人 | 2020 | POPL 2020 (PACMPL 4) | https://doi.org/10.1145/3371075 | CompCert-CT:证明编译优化不破坏恒定时间 | Crossref 核实 | 高 |

## 工具与数据集

| 名称 | 用途 | URL | 验证情况 |
|---|---|---|---|
| Mastik | 微架构侧信道工具库(Prime+Probe/Flush+Reload/Flush+Flush/CacheBleed) | https://github.com/0xADE1A1DE/Mastik | 已验证(GitHub API+README,GPL-3.0) |
| flush-reload-attacks | FLUSH+RELOAD 参考实现 | https://github.com/defuse/flush-reload-attacks | 已验证(GitHub 搜索 API) |
| isec-tugraz/meltdown | Meltdown 官方 PoC(4169 星,归档) | https://github.com/isec-tugraz/meltdown | 已验证(原 IAIK 组织已更名) |
| crozone/SpectrePoC、turbo/KPTI-PoC-Collection | Spectre/Meltdown PoC 集 | https://github.com/crozone/SpectrePoC | 已验证 |
| google/rowhammer-test | DRAM Rowhammer 位翻转检测(归档) | https://github.com/google/rowhammer-test | 已验证 |
| vusec/drammer | Android Rowhammer 测试(论文为 CCS 2016) | https://github.com/vusec/drammer | 已验证(GitHub API+Crossref) |
| bbbrumley/PortSmash | PortSmash PoC(Apache-2.0) | https://github.com/bbbrumley/PortSmash | 已验证(README+CVE) |
| dudect | 恒定时间检测 | https://github.com/oreparaz/dudect | 已验证 |

本方向无公认公开数据集(领域惯例为用 Mastik/flush-reload 自采 trace)。

## 入门路径

1. **Coursera Cryptography I**(D. Boneh, Stanford,含 "Timing attacks on MAC verification" 讲座,已验证课程页)——先补密码学基础
2. **Ge et al. 2018 综述**——建立"攻击面-信道-防御"全景图
3. 时间线三部曲: **Kocher '96 → Brumley/Boneh '03 → Osvik '06**(辅以 Percival/Bernstein)——计时→远程→缓存的攻击面扩张
4. **FLUSH+RELOAD + Mastik 动手复现**,再读 Benger '14、PortSmash 看完整密钥恢复流程
5. **Spectre/Meltdown + ECCploit** 理解瞬态执行与故障攻击,最后转向防御线(ct-verif/dudect/FaCT/Käsper-Schwabe)

## 纠错与存疑

**纠错(经核实):**
1. **PortSmash**: 2018 年仅发布 PoC(CVE-2018-5407);正式论文改题为 "Port Contention for Fun and Profit",**IEEE S&P 2019**(非 2018 年会议);eprint 编号为 2018/1060
2. **Osvik/Shamir/Tromer** venue 为 **CT-RSA 2006**(LNCS 3860),eprint 2005/271 是预印;论文命名的方法为 **Evict+Time 与 Prime+Probe**,"SyncSS" 在 eprint、Springer 摘要及通行文献中均无出处,应为讹传
3. 分支预测作者正确拼写为 **Onur Acıçımez**(ASCII: Aciicmez)
4. **"ECCploit" 是攻击名**,论文正式标题为 "Exploiting Correcting Codes..."(IEEE S&P 2019)
5. **Spectre** 2018 年 1 月经 arXiv/官网披露,正式发表为 **IEEE S&P 2019**;Meltdown 确为 USENIX Security 2018
6. **Rowhammer.js** 作者是 Gruss/Maurice/Mangard(TU Graz, DIMVA 2016),常被误归于 VUSec;VUSec 的 **Drammer 实为 CCS 2016**(常被误记为 USENIX)
7. **Bernstein 2005** 确为未经同行评审的技术报告,从未正式发表
8. **TLBleed** 正式论文题为 "Translation Leak-aside Buffer"(USENIX Security 2018),与攻击名不同
9. FaCT 实为 **PLDI 2019**(常误记为 S&P);dudect 实为 DATE 2017;Barthe 恒定时间编译器验证实为 **POPL 2020**

**存疑(未能实际核实,已隔离):**
- Bernstein 报告 cr.yp.to 本网络不可达,元数据经 Semantic Scholar 核实,建议人工复核 PDF 日期(通行引用 2005-04-14)
- Käsper/Schwabe 仅书目级验证
- 未找到 2020 年后顶会级本方向综述,Ge 2018 仍是最佳起点
- Gullasch 等 "Cache Games"(S&P 2011)、Liu 等 LLC 攻击(USENIX 2015)等经典因篇幅未纳入且未验证,如需可补验
