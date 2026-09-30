# 07 · 工具、数据集与动手资源生态(跨域综合)

> 综合自 6 个领域调研 agent 的工具章节(2026-09-30),全部经 GitHub API / 官网实访验证;商业工具与不可达项单独标注。

## 采集硬件

| 工具 | 用途 | 验证 | 备注 |
|---|---|---|---|
| ChipWhisperer(Lite/Nano/Pro/Husky) | 功耗/EM 采集+故障注入一体化开源平台(NewAE) | ✅ 实访 | 入门首选,数百美元级;SCA101 课程 26 课 |
| SDR(通用软件无线电)+ TempestSDR | 显示器 EM 辐射重建(van Eck 现代实现) | ✅ 实访 | GPL-3.0,支持 SDRplay/ExtIO/UHD/离线文件 |
| 近场 EM 探头 | 芯片级 EM 分析 | (文献方法) | 见 02 域 Gandolfi/Agrawal 方法论 |

## 分析软件库

| 工具 | 语言/许可 | 用途 | 验证 |
|---|---|---|---|
| SCALib (SIMPLE-Crypto) | Python / AGPL-3.0 | 研究级:SNR/模板/随机模型/ML;JOSS 2023 论文 | ✅ |
| lascar (Ledger-Donjon) | Python / LGPL | 通用 SCA 分析(正主仓库 Ledger-Donjon,LedgerHQ 仅为镜像) | ✅ |
| scared + estraces (eshard) | Python | SCA 攻击库+大数据集管理 | ✅ |
| Jlsca (Keysight, 原 Riscure) | Julia | SCA 工具包 | ✅ |
| Mastik | MATLAB/Octave | 微架构侧信道:Prime+Probe/Flush+Reload/Flush+Flush/CacheBleed | ✅ |
| SideChannelMarvels (Daredevil 等) | 多语言 | CPA(含高阶)/DFA/白盒攻击工具集 | ✅ |
| flush-reload-attacks (defuse) | C | FLUSH+RELOAD 参考实现 | ✅ |

## 恒定时间验证工具(防御)

| 工具 | 用途 | 验证 |
|---|---|---|
| dudect | 运行时统计检测(Welch t,~350 行可嵌入) | ✅ |
| FaCT (PLSysSec) | 恒定时间 DSL,编译期保证 | ✅ |
| binsec/rel | 二进制级关系符号执行验证 | ✅ |
| ct-verif | LLVM 级静态验证(原仓库 404,需另寻代码) | 论文✅/仓库✗ |

## PoC 集合(计时/缓存/Rowhammer/Spectre)

| 仓库 | 内容 | 验证 |
|---|---|---|
| crozone/SpectrePoC、turbo/KPTI-PoC-Collection | Spectre/Meltdown PoC | ✅ |
| isec-tugraz/meltdown | Meltdown 官方 PoC(归档) | ✅ |
| google/rowhammer-test、vusec/drammer | Rowhammer 位翻转检测(Android: Drammer, CCS 2016) | ✅ |
| bbbrumley/PortSmash | SMT 端口竞争 PoC(CVE-2018-5407) | ✅ |

## 公开数据集

| 数据集 | 内容 | 验证 |
|---|---|---|
| ASCAD (ANSSI) | 掩码 AES 功耗迹线(ATmega8515/STM32)+DL 训练脚本;**2026-01 起只读归档** | ✅ |
| DPA Contest v1-v4.2 | 历史 SCA 竞赛(DES/AES RSM);**官网已死(域名停放)**,仅论文层可验证 | 部分 |
| CHES 2016 CTF 轨迹 | 26 题公开轨迹(镜像 colinoflynn/ches2016ctf),配套多框架解法 | ✅ |
| Keystroke-Datasets (JBFH-Dev) | 按键录音(手机/Zoom),2023 键盘声学论文官方数据 | ✅ |
| Visual Microphone (MIT CSAIL) | 高速视频恢复声音:MATLAB 代码+演示 | ✅ |

## 教学与练习

| 资源 | 内容 | 验证 |
|---|---|---|
| ChipWhisperer SCA101 / Jupyter 教程 | 26 课功耗分析 + 动手实验 | ✅ |
| Cryptopals Set 4 #31-32 | HMAC 计时攻击(仿真)——**注意在 Set 4,常被误记为 Set 7** | ✅ |
| Coursera: Hardware Security (Maryland, Gang Qu) | 模块 4:侧信道攻击与对策 | ✅ |
| Coursera: Cryptography I (Stanford, Boneh) | 含 MAC 计时攻击讲座 | ✅ |
| 本项目 reproductions/ | CPA/计时/TVLA 三个零依赖可复跑实验(Node.js) | ✅ 自建 |

## 商业工具(未验证区)

| 工具 | 状态 |
|---|---|
| Riscure Inspector | 官网 403 反爬,**[未验证]** |
