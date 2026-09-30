---
name: sca-spectre-meltdown
description: "瞬态执行攻击(Spectre/Meltdown):推测执行越过分支或权限检查访问秘密,经微架构状态(缓存)残留,再用缓存计时侧信道读出;对应缓解为 KPTI/retpoline/LFENCE 等。适用于微架构安全研究、系统加固评估、授权渗透测试(补丁验证)。不适用于普通性能优化或推测执行性能分析。关键词: Spectre, Meltdown, transient execution, 瞬态执行, 推测执行, speculative execution, KPTI, retpoline, 微架构, 侧信道。"
---

# 瞬态执行攻击(Spectre / Meltdown)

## 适用场景与不适用场景

**适用**:
- 评估 CPU/OS/浏览器对瞬态执行泄漏的暴露度与缓解部署(KPTI/retpoline/LFENCE/IBRS 等)
- 授权渗透测试中的"补丁是否生效"验证(微码/内核/浏览器 mitigations 状态)
- 研究新的瞬态执行 gadget 与跨域边界(进程/VM/沙箱/内核)

**不适用**:
- 普通推测执行性能问题(无秘密越权访问)
- 纯缓存侧信道(无瞬态越权)→ sca-cache-prime-probe / sca-cache-flush-reload
- 对未授权系统的任何测试

## 前置条件与输入

- 目标系统信息:CPU 型号、微码版本、内核版本、浏览器/运行时
- PoC 工具集:crozone/SpectrePoC、turbo/KPTI-PoC-Collection、isec-tugraz/meltdown(知识库 07 域验证)
- 缓存计时原语(flush+reload 信道)用于读出瞬态结果

## 方法学步骤

1. **理解统一框架**(所有瞬态执行攻击的三段式):
   - 触发:让 CPU 推测执行一段本不应执行的路径(训练分支预测器 / 利用乱序执行越过权限检查)
   - 编码:瞬态窗口内访问秘密地址,并以秘密为索引触碰 array[secret · stride]
   - 读出:指令提交回滚,但微架构状态(缓存)残留 → 用缓存计时(Flush+Reload)逐字节读出 secret
   - 攻击 = 瞬态 gadget + 缓存侧信道读取,缺一不可——"侧信道"本体在第三段
2. **Meltdown(用户态读内核)**:
   - 乱序执行在权限检查完成前装入内核地址 → 值进入缓存
   - 影响:KPTI 部署前的大量 x86 微架构;缓解 = 内核页表隔离(KPTI/KAISER)
3. **Spectre v1(bounds-check bypass)**:
   - 训练分支预测器使越界检查为真 → 瞬态越界读
   - 缓解:LFENCE 等推测屏障 + 修补危险代码模式(数组边界等)
4. **Spectre v2(branch target injection)**:
   - 污染 BTB 使间接跳转瞬态跳入 gadget
   - 缓解:retpoline(软件)+ IBRS/RSB 填充(微码配合)
5. **PoC 复现流程(授权环境)**:
   - 选 PoC → 编译(注意对照禁用优化的影响,防 gadget 被编译器消除)→ 运行观察泄漏字节
   - 启用缓解(内核参数/微码)复跑,验证泄漏消失
6. **缓解核查清单**(以 kernel.org admin-guide/hw-vuln 为工程参照):
   - /sys/devices/system/cpu/vulnerabilities/* 各条目状态(spectre_v1/v2、meltdown、l1tf 等)
   - mitigation 状态与性能代价记录
7. **判据**:PoC 泄漏字节的多次运行命中率显著高于猜测基线(如 >90% vs 1/256);启用缓解后回落到基线

## 关键细节与常见坑

- **发表口径纠正**:Spectre 正式发表为 **IEEE S&P 2019**(2018 年 1 月经 arXiv/官网披露;另有 CACM 2020 版);Meltdown 为 **USENIX Security 2018**(pp.973–990)——引用勿写反或混为同年同会
- PoC 高度依赖微架构与编译器:打补丁机器上失败是常态,要区分"缓解生效"与"gadget 被编译器消除"
- 缓解有性能代价(KPTI 影响系统调用密集负载、retpoline 影响间接调用)——评估报告应写权衡
- 变体众多(v1/v2/v4/RSB/L1TF 等),以 kernel.org hw-vuln 目录为工程参照系,勿凭记忆断言某变体"已修复"
- 沙箱内(JS/WASM)历史 PoC 受计时精度与 CLFLUSH 可用性限制而持续演化,结论需按当前浏览器版本复核

## 参考实现与工具

- crozone/SpectrePoC、turbo/KPTI-PoC-Collection、isec-tugraz/meltdown(官方 PoC,归档)——知识库 07 域验证
- Mastik / flush-reload-attacks——侧信道读出原语,07 域验证
- kernel.org 硬件漏洞文档 https://kernel.org/doc/html/latest/admin-guide/hw-vuln/(知识库已验证 index/spectre/l1tf 页面)

## 已验证参考文献

- P. Kocher, J. Horn 等 12 人, "Spectre Attacks: Exploiting Speculative Execution", IEEE S&P 2019(2018-01 披露;另有 CACM 2020 扩展版)[高]
- M. Lipp, M. Schwarz, D. Gruss 等 12 人, "Meltdown: Reading Kernel Memory from User Space", USENIX Security 2018, pp.973–990 [高]
- Q. Ge, Y. Yarom, D. Cock, G. Heiser, "A survey of microarchitectural timing attacks and countermeasures on contemporary hardware", J. Cryptographic Engineering 8(1):1–27, 2018 [高]
- G. Hu, Z. He, R. B. Lee, "SoK: Hardware Defenses Against Speculative Execution Attacks", IEEE SEED 2021——硬件防御系统化 [中]
- Linux Kernel admin-guide: Hardware Vulnerabilities 文档(kernel.org,持续更新)[高]

## 防御与缓解视角

- 软件缓解:KPTI(页表隔离)、retpoline(v2)、LFENCE 序列化(v1)、RSB 填充、IBRS(微码配合)
- 算法层:减少可训练分支/间接跳转;关键数据不进入可被瞬态索引的数组
- 部署核查:hw-vuln sysfs 条目 + PoC 回归测试纳入变更流程
- 硬件防御趋势见 Hu 等 SEED 2021 SoK [中]

## 伦理与授权边界

仅用于授权安全测试、防御研究与教学;对任何非自有系统运行瞬态执行 PoC(含浏览器场景)需书面授权。
