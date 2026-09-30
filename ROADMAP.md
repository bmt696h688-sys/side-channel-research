# 路线图:从 18 个技能到 40+,从仿真到体系化

> 本文件规划项目的后续阶段。第一批成果(2026-09-30):知识库 139 条验证条目、3 个复现实验、18 个技能。

## 一、技能库扩充计划(18 → 45)

### 第一批(已完成,19 个,安装于 <工作区>/.agents/skills/)

覆盖:路由入口、功耗(SPA/DPA/CPA/Template/ML)、TVLA、EM、计时、缓存(Prime+Probe、Flush+Reload)、Spectre 类、Rowhammer、声学、TEMPEST、电力与传感器、掩码、恒定时间、轨迹采集工程。清单见 [skills/README.md](skills/README.md)。

### 第二批(计划 +14,基于已验证文献即可写)

| 技能 | 依据(已验证) |
|---|---|
| sca-evict-time | Osvik CT-RSA 2006(03域#5) |
| sca-prefetch-side-channel | Gruss CCS 2016(03域#14) |
| sca-tlb-attacks | TLBleed USENIX 2018(03域#13) |
| sca-branch-prediction | Acıçımez CT-RSA 2007(03域#6) |
| sca-smt-port-contention | PortSmash S&P 2019(03域#12) |
| sca-ecdsa-nonce-lattice | Benger CHES 2014(03域#9,侧信道+格归约组合攻击) |
| sca-rsa-window-attacks | Kocher 1996 / Brumley-Boneh 2003 / Genkin 系列(02/03域) |
| sca-em-nearfield-probing | Gandolfi 2001 / Agrawal 2002(02域) |
| sca-power-led-cryptanalysis | Nassi CCS 2023 / S&P 2024(02/04域) |
| sca-powerline-usb-charging | Yang TIFS 2016 / La Cour CCS 2021(02域) |
| sca-optical-screen-reflection | Backes S&P 2008 / Kuhn S&P 2002(04域) |
| sca-thermal-channels | Masti USENIX 2015 / BitWhisper / Thermanator(04域) |
| sca-airgap-exfiltration-taxonomy | Guri 系列 + Mind The Gap 2024(04域) |
| sca-shuffling-hiding | Veyrat-Charvillon ASIACRYPT 2012 / Coron-Kizhvatov(05域) |

### 第三批(计划 +13,需补充调研后写)

stochastic attacks(Schindler 已验证,可提前)、MIA(Gierlichs 已验证,可提前)、高阶攻击与掩码组合、阈值实现工程化(Nikova 已验证)、FIPS 140-3/EMVCo 评估流程操作、ChipWhisperer 实操全流程、ASCAD 深度学习实操、白盒密码侧信道(SideChannelMarvels 生态)、格+侧信道组合攻击方法论、气隙防御核查清单、SCA 报告撰写与证据链规范、CTF 快速攻击手册、硬件故障注入入门(与侧信道的边界)。

## 二、复现实验扩充计划

| 优先级 | 实验 | 依赖 | 说明 |
|---|---|---|---|
| P0 | Template Attack(高斯模板+对角协方差) | 纯 Node,可立即 | 剖析攻击范式补全(01域#4) |
| P0 | MIA(互信息区分器) | 纯 Node | 与 CPA 对比泄漏模型鲁棒性(01域#6) |
| P0 | 二阶 CPA(中心积组合函数)攻击掩码实现 | 基于 tvla_masking.js 扩展 | 验证"二阶泄漏可利用"(复现实验3已证明其存在) |
| P1 | dudect 式恒定时间检测工具(自实现) | 纯 Node | 防御侧工具(05域#13) |
| P1 | 随机延迟 countermeasure + 攻击有效性对比 | 纯 Node | 隐藏类对策定量评估(05域#9) |
| P2 | Flush+Reload / Prime+Probe | Linux + 共享内存/clflush | 需 Linux 环境,Windows 不可行 |
| P2 | ChipWhisperer 真实硬件 CPA | 硬件采购 | 数百美元级,SCA101 课程路径 |
| P3 | ASCAD 数据集 + CNN 剖析攻击 | Python/PyTorch | 真实功耗迹线+深度学习(需 Python 环境) |

## 三、持续调研计划

- 每季度复验知识库关键条目(URL/DOI 存活性,生态变动如 ASCAD 归档)
- 补充调研缺口:2020 年后微架构综述(03域存疑)、DPA Contest 历史存档、ISO/IEC 17825 与 Common Criteria 细节(05域存疑)、ELMO/Jasmin 工具(05域存疑)
- 跟踪:TCHES 新刊、eprint 新预印本、USENIX/S&P/CCS/NDSS 每届 SCA 论文
- Gullasch "Cache Games"(S&P 2011)、Liu LLC 攻击(USENIX 2015)等未验证经典补验(03域存疑)

## 四、验证纪律(不变)

所有新增内容必须走四层验证(见 verification/VERIFICATION.md);未验证内容只能进隔离区;技能文件只引用已验证文献与已复现代码。
