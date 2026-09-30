---
name: sca-cache-prime-probe
description: "Prime+Probe 与 Evict+Time 缓存侧信道(Osvik-Shamir-Tromer CT-RSA 2006):攻击者填满缓存组后重访计时,从受害者(如 AES T-table)的缓存占用推断密钥;无需共享内存,可跨进程/沙箱/VM。适用于微架构侧信道研究、AES T-table 实现评估、授权渗透测试。不适用于普通缓存性能优化。关键词: Prime+Probe, Evict+Time, cache attack, 缓存侧信道, eviction set, AES T-table, 共享缓存, 侧信道, 微架构攻击。"
---

# Prime+Probe 与 Evict+Time 缓存侧信道

## 适用场景与不适用场景

**适用**:
- 与受害者共享 LLC(同核、SMT 或跨核/跨 VM),但**不共享内存页**——与 Flush+Reload 的关键区别
- 目标是访存模式依赖秘密的实现:AES T-table(索引依赖密钥⊕明文)、S-box 查表
- 评估沙箱/跨租户隔离是否挡得住缓存泄漏

**不适用**:
- 有共享页/共享库 → Flush+Reload(sca-cache-flush-reload)分辨率更高
- 纯算法计时(不涉缓存)→ sca-remote-timing
- 普通缓存性能优化与 profiling

## 前置条件与输入

- 与受害者同机;能绑定 CPU 核、高精度计时(rdtsc/invariant TSC)
- 工具:Mastik(Prime+Probe/Flush+Reload/Flush+Flush/CacheBleed)或自写
- 目标实现知识(AES 是否 T-table、表数量与布局)

## 方法学步骤

1. **Evict+Time(诊断性方法)**:
   - 测量受害者执行时间 → 用自己的数据填满目标缓存组(逐出)→ 再测量
   - 前后时间差指示受害者是否访问了被逐出的组:秘密相关 → 泄漏存在
2. **Prime+Probe(主攻击)**:
   - **构建 eviction set**:找映射到同一 LLC 组+同一 set index 的地址集合。大页(2MB)使虚拟→组映射可直接计算;无大页时用计时侧信道迭代构建(逐地址试探:加入后 prime-probe 延迟仍短则同组)
   - **攻击循环**:prime(顺序访问整个 eviction set 填满组)→ 等待/同步受害者一轮 → probe(重访 eviction set 逐行计时)
   - probe 中耗时长的行(miss)= 受害者用过的路 → 得到该组占用位图
3. **统计积累**:对同一秘密重复 prime-probe 数千轮,对每组的每路累计命中概率
4. **密钥恢复(AES T-table 场景)**:
   - T-table 索引 = p_i ⊕ k_i(首轮);固定明文时索引的组占用模式依赖 k_i
   - 对每个 k 假设计算期望占用模式,与实测位图做相关/似然 → 逐字节恢复
   - 历史基线:Osvik 等 65ms 内恢复 dm-crypt(AES)密钥
5. **判据**:假设间占用概率差异需超过轮间噪声(调度、预取);用多数投票/贝叶斯累计
6. **工程要点**:核绑定;规避预取器(非顺序访问模式、固定步长);剔除超长轮(时间戳过滤)

## 关键细节与常见坑

- **venue 纠正**:Osvik/Shamir/Tromer 为 **CT-RSA 2006**(LNCS 3860, pp.1–20);eprint 2005/271 是预印;期刊版 J. Cryptology 23(1), 2010。论文命名的方法为 **Evict+Time 与 Prime+Probe**;"SyncSS" 在 eprint、Springer 摘要及通行文献中均无出处,是讹传
- LLC 通常 16+ 路:eviction set 越大,噪声与单轮耗时越大;inclusive LLC 才能从用户态逐出他人/内核数据
- 预取器会自动拉回 miss 行造成假命中:链式访问/大步长规避
- 噪声主要来自调度与中断:每轮时间戳过滤,剔除超长轮
- 本方法无需 clflush、无需共享页——这是跨沙箱/VM 攻击面报告的依据;但威胁模型仍要求共享 LLC
- 与 Bernstein 2005 的关系:Bernstein 的 AES 远程计时是网络层观察聚合缓存效应,机理相邻但方法不同(该文为未经同行评审的技术报告,引用时注明)

## 参考实现与工具

- Mastik(https://github.com/0xADE1A1DE/Mastik,MATLAB/Octave,GPL-3.0)——微架构侧信道工具库,知识库 07 域验证
- 轮计时的稳健统计处理(离群轮剔除/中位数判决)可参照 `C:\Users\Administrator\.zcode\workspace\default\side-channel-research\reproductions\timing_attack.js` 的方法学对照(v1 均值失败、v2 中位数成功)

## 已验证参考文献

- D. A. Osvik, A. Shamir, E. Tromer, "Cache Attacks and Countermeasures: the Case of AES", CT-RSA 2006(LNCS 3860, pp.1–20;eprint 2005/271;期刊版 J. Cryptology 23(1), 2010)——Prime+Probe/Evict+Time 原始文献 [高]
- D. J. Bernstein, "Cache-timing attacks on AES", 技术报告, 2005(未经同行评审、从未正式发表)[中]
- C. Percival, "Cache missing for fun and profit", BSDCan 2005 演讲——超线程共享 L1 的 RSA 攻击 [高]
- Q. Ge, Y. Yarom, D. Cock, G. Heiser, "A survey of microarchitectural timing attacks and countermeasures on contemporary hardware", J. Cryptographic Engineering 8(1):1–27, 2018 [高]

## 防御与缓解视角

- 消除秘密相关访存:bitsliced AES(Käsper-Schwabe)或 AES-NI,见 sca-constant-time-defense
- 系统级:缓存分区(page coloring)、CAT、禁用 SMT/核隔离
- 评估:用 Mastik 跨配置测量泄漏带宽,验证对策有效性(Ge 等 2018 综述给出防御 taxonomy)

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;在共享硬件(云/服务器)上对他人负载做任何测量需书面授权。
