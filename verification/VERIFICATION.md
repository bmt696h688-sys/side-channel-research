# 真实性验证报告(VERIFICATION)

> 本文件是整个知识库的验证契约:说明"已验证"意味着什么、如何验证、验证到什么程度、以及哪些内容尚未验证。验证执行日:2026-09-30。

## 一、四层验证体系

| 层级 | 对象 | 方法 | 覆盖范围 |
|---|---|---|---|
| L1 来源级 | 每条外部资源 | 调研 agent 用 WebFetch 实访至少一个权威 URL(Crossref DOI 注册库、Springer/出版社页、IACR eprint、会议官网、NIST/EMVCo/kernel.org、作者主页、GitHub API),确认资源存在且标题/作者/年份/出处元数据一致 | 知识库全部 139 个条目 |
| L2 交叉级 | 高价值条目 | 第二个独立来源交叉核对元数据(多数条目达成) | 大部分"高"置信度条目 |
| L3 内容锚定 | 密码学组件 | 官方已知答案测试:AES-128 实现通过 FIPS-197 附录 C.1 与 NIST SP 800-38A F.1.1 向量(sca_common.js 加载时自动执行) | 全部复现实验 |
| L4 复现级 | 方法学主张 | 可重跑实验验证文献方法的有效性(确定性种子,结果逐位可复现) | CPA/计时攻击/TVLA+掩码 3 项 |

## 二、执行统计

- 6 个调研 agent 并行执行,合计 **约 500 次网页实访**(74+78+116+80+99+112 次工具调用),耗时 17–32 分钟/个
- 知识库合计 **139 个条目**(部分经典文献被多域共同引用,去重后约 110+ 独立资源)
- 置信度分布:**高 ≈ 126 条(91%),中/中高 ≈ 12 条,未验证已隔离 ≈ 15 条**
- 纠错:核实并纠正 **40+ 处常见引用错误**(含年份、venue 张冠李戴、作者名单错误、标题讹传)

## 三、影响本项目自身产出的纠错(诚实记录)

调研发现并修正了**我们自己初稿中的 4 处错误引用**——这正是"先调研验证、后落地引用"流程的价值证明:

1. CPA 论文作者初稿写作 "Brier, Clavier, Olivier, Walter" —— Crossref 两次独立查询确认**只有三位作者,Walter 不在其中**
2. TVLA 方法来源初稿引作 "Goodwill et al., CHES 2011" —— 实为 **NIST Non-Invasive Attack Testing Workshop 2011**(2011-09 奈良),不在 CHES 论文集
3. 计时攻击教学场景初稿写作 "Cryptopals Set 7 Challenge 31/32" —— 实为 **Set 4 Challenge 31/32**(实访 cryptopals.com 确认)
4. 复现实验 2 首次运行失败(少样本均值被 GC/调度离群停顿污染)—— 改用中位数统计后成功;完整迭代记录见 `../reproductions/README.md`,保留了失败的中间状态供审查

## 四、代表性纠错(引用本领域文献前必读)

完整清单见各领域 README 的"纠错"小节,最重要的几条:

- **Kelsey/Schneier/Wagner/Hall "Side Channel Cryptanalysis of Product Ciphers"**:正式出处为 **ESORICS 1998**(常被误引为 SAC 1998)
- **Cagli et al. 2017 CNN 论文**:发表于 **CHES 2017**(常被误引为 CRYPTO 2017)
- **Osvik/Shamir/Tromer**:CT-RSA 2006;方法名为 Evict+Time 与 Prime+Probe,"SyncSS" 一词在原文无出处
- **PortSmash**:正式论文 "Port Contention for Fun and Profit",IEEE S&P 2019(2018 年只是 PoC)
- **Loughry & Umphress**:ACM TISSEC 2002(常被误引为 USENIX 2002)
- **阈值实现**:最早为 Nikova-**Rechberger**-Rijmen,ICICS 2006
- **"Stealing Keys from PCs Using a Radio"**:四位作者(含 Pachmanov),CHES 2015

## 五、隔离区(未能验证的内容——不得作为事实引用)

以下内容在验证过程中**无法从权威来源确认**,已从"资源清单"主体剥离,集中在各域"存疑"小节:TELECOM Paris SCA MOOC、Hardware Hacking Handbook 出版社页细节、Kocher 1998 CRI 报告原始 PDF、dpacontest.org 历史内容、NACSIM 5000 的发布细节、Tosi 光子发射密码分析论文(该方向可验证的经典是 Schlösser CHES 2012)、Riscure Inspector、ISO/IEC 17825 与 Common Criteria 门户内容、Guri "IEEE COMST 综述"等。

**已知著录不一致(引用前需人工复核)**:ASCAD 论文存在两个著录——01 域 #13(Prouff 居首,"Study of Deep Learning Techniques...",eprint 2018/053)与 02 域 #21(Benadjila 居首,"Deep Learning for SCA...",JoCE 10(2):163–188, DOI 10.1007/s13389-019-00220-8)。两个条目各自经 eprint 页/Crossref 实访验证,但同一 DOI 下的标题与作者序在两来源间不一致(疑似同一工作的预印版与正式版)。引用时以 Crossref 正式版为准并注明两版本。

## 六、诚实的边界声明

1. **验证的是"来源真实性与元数据一致性",不是论文内容的正确性**。内容正确性只能通过同行评审记录(已尽量采用正式发表版本而非预印本)与复现(L4 层,已覆盖 3 项核心方法)来逼近
2. **网络环境限制**:dblp、Wikipedia、web.archive.org、部分出版社页(403/超时)在本环境不可达,agent 已改用 Crossref/OpenAlex/Semantic Scholar/官网直访等替代权威源;被隔离条目不受影响,如实标注
3. **时效性**:验证结论截至 2026-09-30;ASCAD 已归档只读、DPA Contest 官网已死等事实说明该生态变动较快,建议每季度复验关键条目
4. **复现实验为仿真泄漏模型**,未含真实硬件的毛刺/漂移/失配效应;方法学核心(区分器、假设检验、稳健统计)与真实场景同构,硬件路径见 ROADMAP

## 七、复验方法

- 任何条目:点击其 URL(优先 DOI)即可人工复核
- 批量复验:重新派出调研 agent(见各域 README 的 prompt 要求),或对 DOI 列表做脚本化 Crossref 查询
- 复现实验:`cd reproductions && node cpa_aes.js && node timing_attack.js && node tvla_masking.js`,确定性种子保证逐位一致
