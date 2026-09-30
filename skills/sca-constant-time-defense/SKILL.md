---
name: sca-constant-time-defense
description: "恒定时间(constant-time)编程与验证:消除秘密相关的分支、访存与索引,防御计时与缓存侧信道;工具链含 dudect 统计检测(Welch t)、ct-verif/binsec/rel/FaCT/CompCert-CT 形式化验证、BearSSL/libsecp256k1 工程范本。适用于密码库实现与审计、计时攻击修复、授权渗透测试的防御侧。不适用于普通性能优化。关键词: constant time, 恒定时间, timing-safe, dudect, ct-verif, FaCT, 侧信道防御, 计时攻击防御, cache attack 防御。"
---

# 恒定时间编程与验证(Constant-Time)

## 适用场景与不适用场景

**适用**:
- 实现/审计处理秘密的代码:比较函数(MAC/口令)、查表密码(AES T-table)、公钥运算(RSA/ECC 标量乘)
- 修复计时攻击(sca-remote-timing)与缓存攻击(sca-cache-prime-probe / sca-cache-flush-reload)的发现
- 持续保障:CI 里跑统计检测,发布前跑形式化验证

**不适用**:
- 普通性能优化("耗时稳定"不等于恒定时间——要求的是与秘密无关)
- 功耗/EM 信道防御 → 掩码(sca-masking-countermeasures)
- 非秘密数据的优化

## 前置条件与输入

- 待检代码(源码或二进制)与秘密标识(哪些输入是秘密)
- 运行环境(编译器/优化等级/目标 ISA)——CT 性质可能被编译器改变

## 方法学步骤

1. **编程规范(三禁)**:
   - 无秘密相关**分支**:if (secret_bit)、短路求值、switch
   - 无秘密相关**访存**:buf[secret]、查表 T[p ⊕ k]
   - 无秘密相关**索引/循环边界**:循环次数由秘密决定
   - 允许的模式:位运算、恒定轮转、掩码选择 x ^ (−b & (x ^ y));查表改全表遍历或 bitslice
2. **统计检测(dudect, DATE 2017)**:
   - 随机生成两类秘密输入(如匹配/不匹配前缀),测量执行时间
   - Welch t 检验比较两类分布;判据 **t > 10 报警**(非恒定时间)
   - 约 350 行 C 可嵌入;统计功效随样本数增长——"未报警"结论必须注明样本量与运行时长
   - 实测对照:恒定时间比较(crypto.timingSafeEqual)在 0–8 字节匹配前缀下平均耗时 0.16–0.42µs、极差 0.19µs、无单调趋势(信号比提前返回版本小 3 个数量级)
3. **形式化验证(按保障层次选用)**:
   - ct-verif(USENIX Security 2016):LLVM IR 级静态验证
   - binsec/rel(S&P 2020):二进制级关系符号执行——防"编译器引入违规"
   - FaCT(PLDI 2019):恒定时间 DSL,编译期保证
   - CompCert-CT(POPL 2020):证明经证明的编译器不破坏 CT
4. **工程范本对照**:
   - BearSSL "Constant-Time Crypto" 文档:秘密相关分支/访存清单与编译器陷阱的一手教材
   - libsecp256k1:恒定时间标量乘/签名实现(README 明确 constant-time signing)
   - bitsliced AES(Käsper-Schwabe, CHES 2009):CT AES-GCM 经典路线(现代 CPU 直接用 AES-NI)
5. **审计流程**:标秘密 → 静态扫描违规模式(分支/访存/索引)→ dudect 动态检测 → (高保障)形式化验证 → 在最终优化等级的二进制上复验
6. **判据与验收**:dudect 多轮(不同样本量)t < 10 且无趋势;形式化工具给出证明或反例;对照攻击 PoC(计时/缓存)失效

## 关键细节与常见坑

- **"看起来 CT"会被编译器改变**:优化器可能把分支变条件传送(救了你)或把掩码选择提升为分支(害了你)——验证必须在最终二进制上做(binsec/rel 的动机,CompCert-CT 的证明目标)
- 计时噪声大不等于安全:攻击者用中位数/大样本把噪声平均掉(见 timing_attack.js:v1 少样本均值失败、v2 中位数成功)
- 语言陷阱:C 的 `||`/`&&` 短路;运行时/JIT 的去优化;秘密控制流可能藏在库调用里
- 缓存视角:即使无分支,秘密相关访存仍泄漏(Prime+Probe/Flush+Reload)——表驱动实现必须改
- dudect 的"通过"是证据不是证明:长尾分布需要足够样本;报告要附样本量
- **引用纠正**:dudect 为 **DATE 2017**;FaCT 为 **PLDI 2019**(SecDev 2017 为前身);binsec/rel 为 **S&P 2020**;CompCert-CT 为 **POPL 2020**;ct-verif 为 **USENIX Security 2016**(作者含 Emmi)
- Käsper-Schwabe 为 CHES 2009(知识库仅书目级验证,置信度[中])

## 参考实现与工具

- `C:\Users\Administrator\.zcode\workspace\default\side-channel-research\reproductions\timing_attack.js`——防御对照锚点:crypto.timingSafeEqual 无计时信号(0–8 字节前缀下 0.16–0.42µs、极差 0.19µs、无单调趋势),与漏洞版(0.25ms/字节)形成 3 个数量级对照
- dudect(https://github.com/oreparaz/dudect)——统计检测,知识库 07 域验证
- FaCT(https://github.com/PLSysSec/FaCT)、binsec(https://github.com/binsec/binsec)——07 域验证
- ct-verif——论文已验证;原 GitHub 仓库 404,取码需另寻(知识库 05 域标注)
- BearSSL constant-time 文档(https://bearssl.org/constanttime.html)、libsecp256k1——05 域验证

## 已验证参考文献

- J. B. Almeida, M. Barbosa, G. Barthe, F. Dupressoir, M. Emmi, "Verifying Constant-Time Implementations", USENIX Security 2016, pp.53–70(ct-verif)[高]
- O. Reparaz, J. Balasch, I. Verbauwhede, "dude, is my code constant time?", DATE 2017(eprint 2016/1123)[高]
- S. Cauligi, G. Soeller 等 10 人, "FaCT: A DSL for Timing-Sensitive Computation", PLDI 2019, pp.174–189 [高]
- Daniel, Bardin, Rezk, binsec/rel, IEEE S&P 2020——二进制级关系符号执行 [高]
- G. Barthe 等 7 人, "Formal verification of a constant-time preserving C compiler"(CompCert-CT), POPL 2020 [高]
- E. Käsper, P. Schwabe, "Faster and Timing-Attack Resistant AES-GCM", CHES 2009——bitsliced CT AES [中]
- T. Pornin, BearSSL "Constant-Time Crypto" 文档;bitcoin-core libsecp256k1 README——CT 工程一手材料 [高]
- Brumley, "SoK: The Constant Time Model", WOOT 2026(eprint 2026/1242)——学术/工业界 CT 模型差异系统化 [高]

## 防御与缓解视角

本技能即防御技能。分层防御:恒定时间(消除秘密相关时序/访存)+ 掩码(功耗/EM)+ 系统隔离(核绑定/缓存分区)分别对应不同信道;验收以 dudect + 形式化 + 对照攻击三件套。

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;对真实系统的计时/缓存测量验证需书面授权。
