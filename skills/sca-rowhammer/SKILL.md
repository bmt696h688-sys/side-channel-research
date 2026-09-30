---
name: sca-rowhammer
description: "Rowhammer 攻击:高频激活 DRAM 相邻行导致电容扰动位翻转(Kim ISCA 2014),Rowhammer.js 实现浏览器远程触发,ECC/TRR 缓解被 ECCploit/TRRespass 推翻。适用于内存可靠性测试、气隙系统安全评估、授权渗透测试中的 DRAM 扰动验证。不适用于普通内存压力测试或性能优化。关键词: Rowhammer, DRAM, bit flip, 位翻转, disturbance errors, TRR, ECC, 故障注入, 侧信道, drammer。"
---

# Rowhammer(DRAM 扰动攻击)

## 适用场景与不适用场景

**适用**:
- 授权测试自有/目标机器的 DRAM 是否存在可触发的位翻转(采购验收、加固验证)
- 评估 ECC/TRR 缓解在具体内存条上的真实有效性
- 研究气隙/移动场景的远程触发可行性(浏览器、Android)

**不适用**:
- 普通内存压力/稳定性测试(目标不是扰动错误)
- 非授权设备的任何翻转尝试(翻转即损坏数据)
- CPU 缓存类侧信道

## 前置条件与输入

- 目标机器 DRAM 信息(DDR 代际、是否 ECC、是否 TRR)——dmidecode/厂商规格
- 测试工具:google/rowhammer-test(x86)、vusec/drammer(Android)
- 大块可锁定物理内存(理想为 2MB 大页,使虚拟连续映射的物理布局可计算)

## 方法学步骤

1. **原理确认**:反复激活(hammer)某行,其相邻 victim 行电容被反复充放电耦合扰动 → 位翻转。激活率越高、行距越近、温度越高越易翻转
2. **内存布局**:申请大页;不可得时用 pagemap(需权限)或逆向获取物理地址映射,找出同 bank 的相邻行
3. **hammer 循环**:
   - 选 aggressor 地址对(A1、A2),夹住 victim 行
   - 循环:读 A1 → 读 A2 →(必要时 clflush 保证真正访存而非缓存命中)重复数十万次
   - 校验 victim 区域读回,记录翻转地址与位模式
4. **统计**:对每对 aggressor 记录翻转数;翻转是概率性的——单次 0 翻转不等于免疫,需多地址对 × 多轮
5. **远程化(Rowhammer.js 范式, DIMVA 2016)**:
   - 浏览器无 clflush 时用 eviction set(见 sca-cache-prime-probe)制造重复访存
   - 证明无需本地代码执行即可触发翻转(故障攻击远程化)
6. **利用链(研究语境)**:翻转页表项/特权数据 → 提权(Drammer 在 Android 演示);仅限授权靶机
7. **缓解有效性验证**:
   - ECC 内存:ECCploit 场景——纠错行为本身成为可观测信道,且可被用于实现可靠翻转(推翻 "ECC=免疫")
   - TRR 内存:TRRespass 范式——多侧(many-sided)hammer 绕过 TRR 的行跟踪
8. **判据**:任意地址对在固定轮数内出现 ≥1 非零翻转即"存在 Rowhammer 暴露";报告必须给内存型号/代际/温度/翻转率

## 关键细节与常见坑

- **归属纠正**:Rowhammer.js 作者是 Gruss/Maurice/Mangard(TU Graz,DIMVA 2016),常被误归于 VUSec;VUSec 的 Drammer 是 Android 场景、正式发表 **CCS 2016**(常被误记为 USENIX)
- **ECCploit 是攻击名**:论文正式标题为 "Exploiting Correcting Codes..."(IEEE S&P 2019);ECC 的纠错延迟差被用作区分信道
- 翻转高度依赖内存条型号与代际:DDR4 早期敏感;TRR 引入后单侧 hammer 失效但多侧仍可能
- 温度影响显著;测试报告应记录热环境
- 大页不可得时,eviction/物理映射逆向是主要工程成本
- 翻转会永久损坏数据——只在可丢弃的测试页上执行;这是本技能与纯被动侧信道的最大区别

## 参考实现与工具

- google/rowhammer-test(https://github.com/google/rowhammer-test,已归档)——x86 位翻转检测,知识库 07 域验证
- vusec/drammer(https://github.com/vusec/drammer)——Android Rowhammer 测试(论文 CCS 2016),07 域验证
- Mastik(https://github.com/0xADE1A1DE/Mastik)——构建 eviction set 的缓存侧信道工具,07 域验证

## 已验证参考文献

- Y. Kim 等 9 人, "Flipping Bits in Memory Without Accessing Them", ISCA 2014, pp.361–372——Rowhammer 奠基与 DRAM 扰动错误系统刻画 [高]
- D. Gruss, C. Maurice, S. Mangard, "Rowhammer.js: A Remote Software-Induced Fault Attack in JavaScript", DIMVA 2016, pp.300–321 [高]
- L. Cojocar, K. Razavi, C. Giuffrida, H. Bos, "Exploiting Correcting Codes"(ECCploit;经订正全题为 "...On the Effectiveness of ECC Memory Against Rowhammer Attacks"), IEEE S&P 2019, pp.55–71 [高]
- Frigo 等, "TRRespass", IEEE S&P 2020(DOI 10.1109/sp40000.2020.00090)——多侧 hammer 绕过 TRR [高]
- Q. Ge, Y. Yarom, D. Cock, G. Heiser, "A survey of microarchitectural timing attacks and countermeasures on contemporary hardware", J. Cryptographic Engineering 8(1):1–27, 2018——DRAM 攻击面在防御 taxonomy 中的定位 [高]

## 防御与缓解视角

- ECC:降低可用性但被 ECCploit 证明非充分(纠错侧信道 + 可靠翻转)
- TRR:被 TRRespass 的多侧 hammer 绕过——采购验收要按最新攻击实测,不能只信厂商标称
- 软件缓解:限制攻击者获取大量物理连续内存的途径(大页配额、内存占用限制)
- 监控:ECC 纠错计数异常上升可作为检测信号

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;Rowhammer 会造成永久性数据损坏,对任何非自有设备的测试需书面授权。
