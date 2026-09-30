---
name: sca-remote-timing
description: "远程/算法计时攻击:通过网络或本地测量执行时间,利用秘密相关的耗时差(提前返回比较、非盲化 RSA 窗口)恢复秘密;核心是统计计时方法论与稳健统计量(中位数/去极值均值)对抗离群停顿。适用于授权渗透测试、密码实现安全评估(Web 登录/MAC 比较/RSA 服务)。不适用于普通性能优化或无秘密依赖的常规计时问题。关键词: timing attack, 计时攻击, remote timing attack, 远程计时, 侧信道, constant time, 恒定时间, Kocher, Brumley Boneh。"
---

# 远程/算法计时攻击

## 适用场景与不适用场景

**适用**:
- 远程目标:网络可达的服务,响应时间依赖秘密(提前返回的字节比较、非盲化 RSA 解密/签名)
- 本地目标:进程内/同机计时
- 字节级前缀攻击:HMAC/MAC 比较、口令比较、模指数窗口

**不适用**:
- 耗时不依赖秘密的性能问题(普通优化)
- 已知恒定时间实现(crypto.timingSafeEqual 类)→ 转防御验证(sca-constant-time-defense)
- 微架构缓存计时(Prime+Probe/Flush+Reload)→ 对应缓存技能

## 前置条件与输入

- 可重复大量调用的目标接口(比较/签名原语),能记录每次耗时
- 秘密结构先验(逐字节比较、逐位/逐窗口)
- 时间源:进程内高精度计时或网络 RTT

## 方法学步骤

1. **建立泄漏假设**:T = base + δ·f(秘密前缀/位) + ε。先做单调性验证:构造已知前缀长度差异的输入,确认耗时差 δ 显著存在
2. **字节级前缀攻击(以比较函数为例)**:
   - 从位置 0 开始,固定已恢复前缀,枚举候选 c ∈ {0,…,255}
   - 每候选采样 k 次,计算稳健统计量
   - 取统计量最大者(匹配最深 → 工作量最大)为该字节;逐字节推进
3. **稳健统计量(方法学核心)**:
   - 首选**中位数**;备选去极值均值(trimmed mean,截去上下各 5–10%)
   - 本项目复现实测:信号 δ=0.25ms/字节、噪声 σ=0.05ms 时,**少样本均值(k=10)在位置 6/7 判错**——毫秒级 GC/调度停顿足以污染均值;**中位数(k=20)对 <50% 的离群样本完全免疫**,8/8 字节全部恢复
   - 这不是仿真假象:真实远程攻击同样要对抗网络抖动,文献对策正是大样本量+稳健统计
4. **样本量规划**:
   - 中位数判决要求最优/次优候选的边际 > 中位数标准误;复现中每位置边际 0.17–0.22ms,清晰对应 0.25ms 的单位信号(约 70–90% 信号保留)
   - 总量:8 字节 × 256 候选 × k 次 = 40,960 次测量(复现 36s 完成);网络场景按 RTT 与抖动分布放大 k
5. **网络特化(Brumley-Boneh 范式)**:
   - 大量独立请求测响应时间;控制连接复用、服务器缓存效应;丢弃超时/重传样本
   - RSA 场景:Montgomery 乘的额外约简与密钥相关 → 统计区分逐窗口/逐位
6. **判据与终止**:每位置统计量前两名的边际 ≥ 预设阈(如 ≥ 0.5δ̂);边际不足则加大 k,不得凭单次最大值判决

## 关键细节与常见坑

- **均值是脆弱的**:重尾噪声(网络抖动、GC、调度)会让少样本均值失败——这是文献与本项目复现共同的结论
- 复现中曾出现纯打印层单位 bug(ms 被再乘 1000,一度显示"边际 210ms",实际 0.21ms);报告计时数字前先做量纲 sanity check
- 攻击者与目标时钟不同步无妨——只比较同批次内的相对量
- 服务器热身/JIT 效应:先做若干不计入的请求
- 候选枚举顺序按频率优化(可打印 ASCII 优先)可以减少期望次数,但判决必须基于统计量
- 防御对照:恒定时间比较下平均耗时对前缀长度无单调趋势——复现实测 crypto.timingSafeEqual 在 0–8 字节前缀下 0.16–0.42µs、极差 0.19µs,比漏洞版信号小 3 个数量级

## 参考实现与工具

- `C:\Users\Administrator\.zcode\workspace\default\side-channel-research\reproductions\timing_attack.js`——完整复现,验证锚点:
  - 锚点 1:8/8 字节完全恢复(40,960 次测量,36s),每位置中位数边际 0.17–0.22ms 对应 0.25ms 单位信号
  - 锚点 2:v1 少样本均值失败(位置 6/7 错)→ v2 中位数(k=20)成功的方法学对照记录
  - 锚点 3:crypto.timingSafeEqual 无计时信号(0.16–0.42µs,无单调趋势)
- Cryptopals Set 4 Challenge 31/32(注意在 **Set 4**,常被误记为 Set 7)——HMAC 计时攻击练习,知识库 07 域验证
- dudect(Welch t 恒定时间检测,t>10 判据)——07 域验证,防御侧使用

## 已验证参考文献

- P. C. Kocher, "Timing Attacks on Implementations of Diffie-Hellman, RSA, DSS, and Other Systems", CRYPTO 1996(LNCS 1109, pp.104–113)——计时攻击范式奠基 [高]
- D. Brumley, D. Boneh, "Remote Timing Attacks are Practical", 12th USENIX Security Symposium, 2003(Best Paper)——OpenSSL RSA 远程计时攻击 [高]
- Q. Ge, Y. Yarom, D. Cock, G. Heiser, "A survey of microarchitectural timing attacks and countermeasures on contemporary hardware", J. Cryptographic Engineering 8(1):1–27, 2018 [高]
- O. Reparaz, J. Balasch, I. Verbauwhede, "dude, is my code constant time?", DATE 2017(eprint 2016/1123)——防御侧统计检测 [高]

## 防御与缓解视角

- 恒定时间原语:比较类用 timingSafeEqual 型实现;RSA/ECC 用盲化
- 持续检测:dudect 接入 CI(t>10 报警)
- 详见 sca-constant-time-defense

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;对远程真实目标发起计时测量需书面授权。
