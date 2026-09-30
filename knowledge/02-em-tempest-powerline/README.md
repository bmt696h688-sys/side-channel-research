# 02 · 电磁侧信道、TEMPEST 与电力线侧信道(EM / TEMPEST / Power-Line)

> 由调研 agent 于 2026-09-30 联网搜集,每条资源经权威来源实访验证(Crossref/OpenAlex/Semantic Scholar API、eprint.iacr.org、arXiv、USENIX 官网、GitHub、剑桥大学技术报告页、Cryptome);置信度分级见每条标注。

## 方法地图

```
TEMPEST/显示器重建线
├── van Eck phreaking(1985, 改装电视截获CRT)
├── Kuhn 系统研究(1998 Soft Tempest → 2002 CRT光学 → 2003 剑桥博士论文)
├── NSA解密标准(NACSIM 5000, 细节部分未验证)
└── Deep-TEMPEST(2024, 深度学习重建HDMI)
密码EM分析线
├── 智能卡近场探头(Gandolfi 2001 / Agrawal 2002)
├── 笔记本/手机EM+机壳电势(Genkin系列 2014-2016)
├── 复杂SoC(Longo 2015)
└── 深度学习轮廓攻击(Cagli 2017)
电力侧信道线
├── 机壳地电位(Genkin "Hands Off My Laptop" 2014)
├── 电池聚合功耗(PowerSpy 2015) / USB充电电流(2016) / 无线充电(2021)
├── 电源LED亮度(Nassi 2023/2024, 也见04域)
└── 电力线调制外泄(PowerHammer 2018, 气隙场景)
```

**本域复现锚点**: 本项目尚未做 EM 复现(需 SDR/探头硬件);统计方法学与 01 域同构,见 `../../reproductions/`。动手工具: TempestSDR(见下)。

## 领域综述

EM 侧信道研究有三条主线:其一为 **TEMPEST/显示器内容重建**,自 van Eck 1985 年证明普通电视可截获 CRT 辐射起,经 Kuhn 在剑桥的系统研究(EM+光学泄漏、抗泄漏字体)与 NSA 解密文献,到近年 Deep-TEMPEST 用深度学习重建 HDMI 图像;其二为**密码 EM 分析**,CHES 2001/2002 两篇奠基作证明近场探头可从智能卡提取密钥并建立泄漏分类学,2014–2016 年 Tromer 组把 EM/机壳电势攻击推进到笔记本与手机,深度学习轮廓攻击随后成为主流;其三为**电力侧信道**,涵盖机壳地电位、电池功耗、USB/无线充电电流乃至电源 LED 亮度等新型通道。

## 资源清单

| # | 标题 | 作者 | 年份 | 出处 | URL | 内容与重要性 | 验证证据 | 置信度 |
|---|---|---|---|---|---|---|---|---|
| 1 | Electromagnetic Radiation from Video Display Units: An Eavesdropping Risk? | Wim van Eck | 1985 | Computers & Security 4(4):269–286 | https://doi.org/10.1016/0167-4048(85)90046-X | van Eck phreaking 开山之作:改装电视即可远距重建 CRT 屏幕内容 | Crossref 确认题名(含问号)/作者/卷期页码;Semantic Scholar 同题录 | 高 |
| 2 | Electromagnetic Analysis: Concrete Results | K. Gandolfi, C. Mourtel, F. Olivier | 2001 | CHES 2001 (LNCS 2162, pp.251–261) | https://doi.org/10.1007/3-540-44709-1_21 | 首次给出智能卡密码实现的 EM 分析具体实验,EM-SCA 奠基作(被引 705) | Crossref:题名/三作者/页码/CHES 2001 容器均符 | 高 |
| 3 | The EM Side-Channel(s) | D. Agrawal, B. Archambeault, J.R. Rao, P. Rohatgi | 2002 | CHES 2002 (LNCS 2523, pp.29–45) | https://doi.org/10.1007/3-540-36400-5_4 | 系统化 EM 泄漏分类(近/远场、多种调制)与评估方法学 | Crossref:四作者/页码/CHES 2002 容器 | 高 |
| 4 | Soft Tempest: Hidden Data Transmission Using Electromagnetic Emanations | M.G. Kuhn, R.J. Anderson | 1998 | Information Hiding (LNCS 1525, pp.124–142) | https://doi.org/10.1007/3-540-49380-8_10 | "软TEMPEST":抗泄漏字体滤波,并演示经 EM 辐射的隐蔽数据传输 | Kuhn 主页题录(LNCS 1525)+Crossref 双重确认 | 高 |
| 5 | Optical Time-Domain Eavesdropping Risks of CRT Displays | M.G. Kuhn | 2002 | IEEE S&P 2002, pp.3–18 | https://doi.org/10.1109/SECPRI.2002.1004358 | 从 CRT 漫反射光的高频时域变化重建文本,非 RF 泄漏通道经典 | Kuhn 主页+Crossref(venue 为 IEEE S&P) | 高 |
| 6 | Compromising Emanations: Eavesdropping Risks of Computer Displays(博士论文/UCAM-CL-TR-577) | M.G. Kuhn | 2003 | University of Cambridge 技术报告 | https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-577.html | 对 CRT/LCD 的 EM 与光学泄漏最系统的公开研究:定时参数估计、"radio-character recognition"、防护字体 | 剑桥报告页:题名/作者/2003-12/DOI 10.48456/tr-577 | 高 |
| 7 | NACSIM 5000: TEMPEST Fundamentals | NSA(解密文件) | 1982(常见说法) | 解密官方标准 | https://cryptome.org/nacsim-5000.htm | NSA 解密的 TEMPEST 基础文献,理解官方辐射安全体系的原始材料 | Cryptome 镜像页真实存在、题为 "NACSIM 5000 Tempest Fundamentals";签发年份/机构未能从权威页核实 | 中 |
| 8 | Stealing Keys from PCs Using a Radio: Cheap Electromagnetic Attacks on Windowed Exponentiation | D. Genkin, L. Pachmanov, I. Pipman, E. Tromer | 2015 | CHES 2015 (LNCS 9293, pp.207–228) | https://eprint.iacr.org/2015/170 | 用 SDR(口袋大小 "PITA" 设备)秒级提取笔记本 GnuPG 的 RSA/ElGamal 密钥,EM 攻击低成本化标志 | eprint(2015/170,四作者)+Crossref(CHES 2015,pp.207–228) | 高 |
| 9 | Get Your Hands Off My Laptop: Physical Side-Channel Key-Extraction Attacks on PCs | D. Genkin, I. Pipman, E. Tromer | 2014/2015 | CHES 2014 (LNCS 8739, pp.242–260);扩展版 J. Cryptogr. Eng. 5(2):95–112 | https://eprint.iacr.org/2014/626 | 经机壳地电位波动(徒手/导线/以太网线)提取 4096 位 RSA 密钥——电力/地线侧信道代表 | eprint 注明 "Published in CHES 2014";Crossref 给出 LNCS 与 JCEN 两条题录 | 高 |
| 10 | ECDH Key-Extraction via Low-Bandwidth Electromagnetic Attacks on PCs | Genkin, Pachmanov, Pipman, Tromer | 2016 | CT-RSA 2016 (LNCS 9610, pp.219–235) | https://doi.org/10.1007/978-3-319-29485-8_13 | 磁探头/USB 线路上的低带宽 EM 信号恢复 ECDH 密钥 | Crossref:CT-RSA 2016 容器、页码 | 高 |
| 11 | ECDSA Key Extraction from Mobile Devices via Nonintrusive Physical Side Channels | Genkin, Pachmanov, Pipman, Tromer, Yarom | 2016 | ACM CCS 2016, pp.1626–1638 | https://eprint.iacr.org/2016/230 | 用磁探头或手机 USB 线(数百 kHz 带宽)提取 iOS/Android 设备 ECDSA 签名密钥,手机 EM 攻击代表作 | OpenAlex(CCS 2016+DOI)+eprint(2016/230)双源 | 高 |
| 12 | SoC It to EM: ElectroMagnetic Side-Channel Attacks on a Complex System-on-Chip | J. Longo, E. De Mulder, D. Page, M. Tunstall | 2015 | CHES 2015 (LNCS 9293, pp.620–640) | https://doi.org/10.1007/978-3-662-48324-4_31 | 在带缓存层次的复杂 SoC 上演示 EM 密钥提取,标志 EM-SCA 从 8 位 MCU 走向复杂 SoC/IoT 级目标 | Crossref:CHES 2015 容器、页码、四作者 | 高 |
| 13 | A Survey of Electromagnetic Side-Channel Attacks... | A. Sayakkara, N.-A. Le-Khac, M. Scanlon | 2019 | Digital Investigation 29:43–54 | https://arxiv.org/abs/1903.07703 | EM-SCA 技术综述+数字取证视角,快速掌握领域版图的入口 | arXiv 页(注明刊于 Digital Investigation, DOI 10.1016/j.diin.2019.03.002)+OpenAlex | 高 |
| 14 | PowerSpy: Location Tracking Using Mobile Device Power Analysis | Michalevsky, Schulman, Veerapandian, Boneh, Nakibly | 2015 | USENIX Security 2015 | https://www.usenix.org/conference/usenixsecurity15/technical-sessions/presentation/michalevsky | Android 聚合功耗数据(无需权限)经机器学习推断用户位置——电池/电力侧信道经典 | USENIX 官方页:题名/五作者/2015 | 高 |
| 15 | On Inferring Browsing Activity on Smartphones via USB Power Analysis Side-Channel | Q. Yang, P. Gasti, G. Zhou, A. Farajidavar, K.S. Balagani | 2016 | IEEE TIFS 12(5):1056–1066 | https://doi.org/10.1109/TIFS.2016.2639446 | 公共 USB 充电站仅凭电流曲线即可 >90% 识别所访问网页 | OpenAlex 题录(卷期页码/DOI/被引 84) | 高 |
| 16 | Wireless Charging Power Side-Channel Attacks | A.S. La Cour, K.K. Afridi, G.E. Suh | 2021 | ACM CCS 2021, pp.651–665 | https://doi.org/10.1145/3460120.3484733 | 经无线充电电流对 iPhone 11/Pixel 4 做网站指纹(>90%) | OpenAlex 题录(CCS 2021+DOI) | 高 |
| 17 | Video-Based Cryptanalysis(电源LED视频密钥提取) | B. Nassi 等 7 人 | 2024 | IEEE S&P 2024, pp.2422–2440 | https://doi.org/10.1109/SP54263.2024.00163 | 普通摄像机拍摄设备电源 LED 亮度波动即恢复 256 位 ECDSA(16 米外)与 378 位 SIKE 密钥 | OpenAlex 题录(S&P 2024/七作者/页码) | 高 |
| 18 | Deep-TEMPEST: Using Deep Learning to Eavesdrop on HDMI from its Unintended Electromagnetic Emanations | S. Fernández, E. Martínez, G. Varela, P. Musé, F. Larroca | 2024 | arXiv 2407.09717(投 LADC'24) | https://arxiv.org/abs/2407.09717 | 深度学习把 HDMI 的 EM 辐射重建为屏幕图像,字符错误率较既有方案改善逾 60 个百分点;开源 GNU Radio 流程与数据集 | arXiv API:题名/五作者/2024-07 | 高 |
| 19 | PowerHammer: Exfiltrating Data from Air-Gapped Computers through Power Lines | M. Guri, B. Zadov, D. Bykhovsky, Y. Elovici | 2018 | arXiv 1804.04014 | https://arxiv.org/abs/1804.04014 | 恶意软件调制 CPU 功耗经电力线外传数据(线路级 1000 bit/s) | arXiv 页:题名/四作者/2018 | 高 |
| 20 | Power Analysis Attacks(教材) | S. Mangard, E. Oswald, T. Popp | 2007 | Springer 专著 | https://doi.org/10.1007/978-0-387-38162-6 | SCA 最系统教材(OpenAlex 被引 1573),EM 分析的功耗分析基础 | OpenAlex 图书记录(Springer 2007)+Crossref 引文记录 | 高 |
| 21 | Deep Learning for SCA and Introduction to ASCAD Database | R. Benadjila, E. Prouff, R. Strullu, E. Cagli, C. Dumas | 2020 | J. Cryptogr. Eng. 10(2):163–188 | https://doi.org/10.1007/s13389-019-00220-8 | 深度学习 SCA 方法学+ASCAD 基准数据集正式论文 | Crossref 题录(刊名/卷期/页码)+GitHub 仓库 | 高 |

## 工具与数据集

| 名称 | 用途 | URL | 验证情况 |
|---|---|---|---|
| ChipWhisperer | 开源 SCA 完整工具链:采集板+目标板硬件设计、固件、Python 采集与分析 | https://github.com/newaetech/chipwhisperer | 已访问:GPL、含原理图/固件/软件,~1.6k 星 |
| ChipWhisperer Jupyter 教程 | 动手实验教程(功耗/EM 采集与攻击实战) | https://github.com/newaetech/chipwhisperer-jupyter | 主仓库 README 明确提及;直连多次超时,属间接验证 |
| TempestSDR | 用 SDR 实时重建显示器内容(van Eck 攻击现代实现),自动估计分辨率/刷新率 | https://github.com/martinmarinov/TempestSDR | 已访问:GPL-3.0、~1.6k 星、支持 SDRplay/ExtIO/UHD/离线文件 |
| ASCAD 数据集 | 掩码 AES 的功耗(Icc)迹线基准 | https://github.com/ANSSI-FR/ASCAD | 已访问:**注意是功耗而非 EM 迹线**;2026-01 起只读归档 |
| SideChannelMarvels(Daredevil 等) | CPA/DFA/白盒攻击工具集 | https://github.com/SideChannelMarvels | 已访问:15 个仓库,Daredevil 支持(高阶)CPA |

## 入门路径

1. **Kuhn 博士论文(UCAM-CL-TR-577)+其 IEEE S&P 2002 论文**:免费、可读性最高,一次建立"信息辐射安全"(EM+光学+TEMPEST)完整图景
2. **Sayakkara 2019 综述**:用一篇文献快速定位现代 EM-SCA 技术与文献网络
3. **Mangard 教材+Gandolfi/Agrawal 两篇 CHES 奠基作**:掌握探头测量、泄漏建模、DPA/CPA 等经典方法论
4. **ChipWhisperer 套件+Jupyter 教程**:数百美元即可动手复现功耗/EM 攻击
5. **Genkin CHES 2015 + Deep-TEMPEST(2024)**:对现代 PC 的密钥提取与对显示器的 AI 内容重建两个前沿方向

## 纠错与存疑

**纠错(经核实与常见说法不符处):**
- "Stealing Keys from PCs Using a Radio" 完整作者为四人(含 **Lev Pachmanov**);正式发表 venue 确为 **CHES 2015**(LNCS 9293, pp.207–228);其 eprint 页(2015/170)至今标注 "Preprint",易被误认为未正式发表
- Genkin 组 ECDH 论文正确题名是 "…Attacks on **PCs**"、venue 为 **CT-RSA 2016**(常被误作 CHES 2016 或 "…on Laptops");手机 ECDSA 论文才是 CCS 2016——两者常被混引
- Kuhn 的 CRT 窃听论文 venue 为 **IEEE S&P 2002**(pp.3–18),不是 USENIX
- van Eck 论文确切题名以问号结尾("…An Eavesdropping Risk?"),刊于 Computers & Security 4(4):269–286, 1985
- Gandolfi(CHES 2001)与 Agrawal(CHES 2002)两条线索经核实无误

**存疑(未能实际核实,已隔离):**
- **NACSIM 5000**:Cryptome 镜像真实存在(已实际访问),但"1982 年由 NSA 发布"等细节未能从权威页核实——引用时请注明[细节未验证]
- **DPA Contest v4/v4.2** EM 迹线:官网现为域名停放页,内容无法核实;建议以 ASCAD 为替代基准
- chipwhisperer-jupyter 教程仓库直连持续超时,仅经主仓库 README 间接确认
