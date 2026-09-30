---
name: sca-cache-flush-reload
description: "Flush+Reload 缓存侧信道(Yarom-Falkner USENIX Security 2014):用 clflush 逐出与受害者共享的内存页中的行,再计时重访;单缓存行分辨率、低噪声,可恢复 RSA 窗口指数与 ECDSA nonce(配合格归约)。适用于共享库/页缓存场景的微架构安全评估与授权渗透测试。不适用于无共享内存或普通性能优化场景。关键词: Flush+Reload, clflush, cache side-channel, 缓存侧信道, 共享内存, RSA 窗口, ECDSA nonce, 侧信道, Mastik。"
---

# Flush+Reload 缓存侧信道

## 适用场景与不适用场景

**适用**:
- 与受害者**共享内存页**:动态链接的共享库(libc/libcrypto)、页缓存中的可执行文件、内存去重页或文件系统共享
- 需要单缓存行级分辨率与高信噪比的密钥恢复:GnuPG RSA 窗口指数、ECDSA nonce
- 评估页去重/共享库部署的泄漏风险

**不适用**:
- 无共享内存(跨沙箱/无共享页)→ Prime+Probe(sca-cache-prime-probe)
- 用户态无法 clflush 目标行(不可缓存/特权地址)
- 普通缓存性能优化

## 前置条件与输入

- 共享映射:目标二进制的代码/数据段地址(objdump/符号表定位感兴趣的函数与表)
- 高精度计时(rdtsc/invariant TSC);CPU 亲和性绑定
- 工具:Mastik 或 flush-reload-attacks(defuse)参考实现

## 方法学步骤

1. **定位监视行**:符号表找到目标函数的关键代码行(如 GnuPG 模乘中的平方/乘法分支)或查找表行;共享映射下虚拟地址与受害者一致
2. **攻击循环**(每个监视行独立执行):
   - flush:`clflush(addr)` 逐出该行
   - wait:等待受害者执行(同步:触发签名请求后自旋等待)
   - reload:计时访问 addr;耗时 < 命中阈值 = 受害者访问过(记 1),否则记 0
3. **阈值校准**:在同一机器上分别测缓存命中(几十 cycle)与 miss(几百 cycle)的访问时间分布,取分布间隙中点为判决阈值;每台机器、每次实验现场重新校准
4. **序列提取(RSA 窗口场景)**:
   - 平方与乘法对应不同代码行/访问模式 → 逐操作得到 0/1 序列
   - 基线:Yarom-Falkner 用单次 RSA 签名恢复 GnuPG RSA 密钥约 **96.7%** 的位;剩余位空间极小,可枚举
5. **ECDSA nonce 场景(Benger 等 2014)**:
   - Flush+Reload 泄漏 nonce(标量 k)窗口表示的少量位
   - 用格归约(lattice,Hidden Number Problem 建模)融合多次签名的泄漏位 → 恢复长期私钥
6. **噪声处理**:多轮多数投票;单轮时间戳超限即剔除(中断污染);预取器干扰用非时序访问模式规避
7. **判据**:泄漏位序列与密钥假设的一致性检验;密钥恢复报告写明恢复比例与剩余熵

## 关键细节与常见坑

- 前提是**页共享**:现代内核默认关闭 KSM/页去重(CVE 风险);共享库与页缓存仍是现实通道
- 阈值必须机器现场校准;频率漂移(P-state 切换)会移动阈值——固定频率或用 invariant TSC
- 用户态 flush 内核地址不可行(不可缓存/SMAP),内核目标需特权或另择通道
- 误报源:其他进程恰好访问同一共享行——用受害者同步窗口约束采集期
- Mastik 中还有 Flush+Flush 等变体,信噪比特性不同,按目标选择
- "恢复 96.7%"这类数字是特定实现(GnuPG、特定版本)的结果,不可直接外推到其他实现
- 引用口径:Yarom-Falkner 发表于 USENIX Security 2014;Benger 等为 CHES 2014(eprint 2014/161)

## 参考实现与工具

- Mastik(https://github.com/0xADE1A1DE/Mastik)——含 Flush+Reload/Flush+Flush/CacheBleed,知识库 07 域验证
- flush-reload-attacks(https://github.com/defuse/flush-reload-attacks)——参考实现与监视框架,07 域验证
- 离群轮剔除与中位数判决的方法学参照 `C:\Users\Administrator\.zcode\workspace\default\side-channel-research\reproductions\timing_attack.js`

## 已验证参考文献

- Y. Yarom, K. Falkner, "FLUSH+RELOAD: a High Resolution, Low Noise, L3 Cache Side-Channel Attack", USENIX Security 2014——单次签名恢复 GnuPG RSA 约 96.7% 密钥位 [高]
- N. Benger, J. van de Pol, N. Smart, Y. Yarom, "'Ooh Aah... Just a Little Bit': A Small Amount of Side Channel Can Go a Long Way", CHES 2014(eprint 2014/161)——F+R 泄漏 ECDSA nonce + 格归约恢复密钥 [高]
- Q. Ge, Y. Yarom, D. Cock, G. Heiser, "A survey of microarchitectural timing attacks and countermeasures on contemporary hardware", J. Cryptographic Engineering 8(1):1–27, 2018 [高]
- D. Gruss, C. Maurice, A. Fogh, M. Lipp, S. Mangard, "Prefetch Side-Channel Attacks: Bypassing SMAP and Kernel ASLR", ACM CCS 2016——相邻通道(共享页假设不可用时的替代路径)[高]

## 防御与缓解视角

- 消除秘密相关访存与分支:恒定时间实现(见 sca-constant-time-defense;libsecp256k1/BearSSL 为工程范本)
- 系统级:关闭页去重(KSM)、敏感负载核隔离
- 检测:审计部署中的共享映射;dudect 类统计检测接入 CI

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;对真实系统/他人进程的共享内存监视需书面授权。
