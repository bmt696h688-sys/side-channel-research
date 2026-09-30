# 04 · 声学、光学、热与机械侧信道及气隙外泄(Acoustic / Optical / Thermal / Air-Gap)

> 由调研 agent 于 2026-09-30 联网搜集,每条资源经约 40 次 WebFetch 实访验证(ePrint、Crossref API、USENIX 官网、arXiv API、GitHub API、MIT/作者主页、Coursera);置信度分级见每条标注。

## 方法地图

```
声学线
├── 键盘声学(Asonov-Agrawal 2004 → Zhuang 2005/2009 → 深度学习 Harrison 2023)
├── 打印机声学(Backes 2010)
├── 声学密码分析(Genkin-Shamir-Tromer CRYPTO 2014: 手机录音提取RSA密钥)
└── 风扇/硬盘机械噪声(Fansmitter / DiskFiltration, 气隙外泄)
光学线
├── LED状态灯调制(Loughry-Umphress 2002 "Optical Tempest")
├── 屏幕漫反射(Kuhn 2002 CRT时域) / 屏幕墙面反射(Backes 2008)
├── 芯片近红外光子发射(Schlösser CHES 2012: 定位AES S-box晶体管活动)
├── 电源LED光强(Glowworm 2021 → 光学密钥提取 Nassi CCS 2023 → 视频版 S&P 2024)
└── 物体微振动恢复声音(Visual Microphone 2014 / Lamphone 2022)
热与机械线
├── 跨核热隐蔽信道(Masti 2015) / 邻机热通信(BitWhisper 2015)
├── 键盘余温(Thermanator 2019)
└── 气隙外泄分类学(Guri系列: 声/光/磁/热/振/电, Mind The Gap 2024综述)
```

**本域复现锚点**: 本域攻击依赖专用传感/光学设备,暂无本仓库复现;分类学与信号处理思想见上表。可动手资源: Keystroke-Datasets(公开按键录音)、Visual Microphone 代码(见下)。

## 领域综述

物理环境侧信道研究证明密码与敏感数据可经声、光、热、磁、机械振动等"非传统"媒介泄漏。声学线从键盘/打印机声学(2004–2010)发展到 Genkin/Shamir/Tromer 的声学密码分析(CRYPTO 2014,从风扇与电容噪声提取 RSA 密钥);光学线涵盖 LED 状态灯调制(Loughry & Umphress 2002)、屏幕反射(Kuhn 2002、Backes 2008)、芯片红外光子发射(Schlösser 等 CHES 2012)与近年 Nassi 等的电源 LED 光学/视频密码分析(CCS 2023、S&P 2024);热与机械线有跨核热隐蔽信道、键盘余温、风扇/硬盘噪声。Guri 等将其系统化为"气隙外泄"研究系列,深度学习又使键盘声学复活(EuroS&PW 2023)。

## 资源清单

### 声学侧信道

| # | 标题 | 作者 | 年份 | 出处 | URL | 内容与重要性 | 验证证据 | 置信度 |
|---|---|---|---|---|---|---|---|---|
| 1 | RSA Key Extraction via Low-Bandwidth Acoustic Cryptanalysis | D. Genkin, A. Shamir, E. Tromer | 2014 | CRYPTO (LNCS 8616, pp.444–461) | https://eprint.iacr.org/2013/857 | 声学密码分析里程碑:手机置于笔记本旁,1 小时内提取 GnuPG 4096-bit RSA 密钥 | ePrint 2013/857(标题/作者一致)+ Crossref Springer 记录(DOI 10.1007/978-3-662-44371-2_25) | 高 |
| 2 | Keyboard Acoustic Emanations | D. Asonov, R. Agrawal | 2004 | IEEE S&P, pp.3–11 | https://doi.org/10.1109/SECPRI.2004.1301311 | 键盘声学 emanations 开山之作(神经网络的按键识别) | Crossref 记录确认 venue/年/页码 | 高 |
| 3 | Keyboard Acoustic Emanations Revisited | Li Zhuang, Feng Zhou, J.D. Tygar | 2005(会议)/2009(期刊) | ACM CCS 2005 + ACM TISSEC 13(1) | https://doi.org/10.1145/1102120.1102169 | 无需预训练语言模型,从 10 分钟录音校准后恢复按键内容 | Crossref 两条记录:CCS'05 pp.373–382 与 TISSEC 13(1) pp.1–26 | 高 |
| 4 | A Practical Deep Learning-Based Acoustic Side Channel Attack on Keyboards | J. Harrison, E. Toreini, M. Mehrnezhad | 2023 | IEEE EuroS&PW (SiLM'23) | https://arxiv.org/abs/2308.01074 | CoAtNet 按手机录音/Zoom 音频分类按键(约 90% 精度),附公开数据集 | arXiv API 确认 ID、comment 注明 EuroS&PW 2023、DOI 10.1109/EuroSPW59978.2023.00034 | 高 |
| 5 | Acoustic Side-Channel Attacks on Printers | M. Backes, M. Dürmuth, S. Gerling, M. Pinkal, C. Sporleder | 2010 | USENIX Security '10 | https://www.usenix.org/legacy/events/sec10/tech/full_papers/Backes.pdf | 针式打印机噪声重建所打英文文本 | USENIX Sec'10 议程页确认+论文 PDF 可访问 | 高 |

### 光学侧信道

| # | 标题 | 作者 | 年份 | 出处 | URL | 内容与重要性 | 验证证据 | 置信度 |
|---|---|---|---|---|---|---|---|---|
| 6 | Information Leakage from Optical Emanations | J. Loughry, D. A. Umphress | 2002 | ACM TISSEC 5(3):262–289 | https://doi.org/10.1145/545186.545189 | LED 状态灯随数据调制闪烁的 "Optical Tempest" 经典 | Crossref 确认期刊/卷期/页码(**非 USENIX**) | 高 |
| 7 | Optical Time-Domain Eavesdropping Risks of CRT Displays | M. G. Kuhn | 2002 | IEEE S&P, pp.3–18 | https://doi.org/10.1109/SECPRI.2002.1004358 | 从 CRT 时域反射光重建屏幕内容 | Crossref 确认 S&P 2002 | 高 |
| 8 | Compromising Reflections – or – How to Read LCD Monitors around the Corner | M. Backes, M. Dürmuth, D. Unruh | 2008 | IEEE S&P, pp.158–169 | https://doi.org/10.1109/SP.2008.25 | 望远镜+信号处理从墙面反射读取 LCD 内容;续作 Tempest in a Teapot (S&P'09) | Crossref 确认 | 高 |
| 9 | Simple Photonic Emission Analysis of AES | A. Schlösser, D. Nedospasov, J. Krämer, S. Orlic, J.-P. Seifert | 2012 | CHES (LNCS, pp.41–57);期刊版 JCEN 3(1), 2013 | https://doi.org/10.1007/978-3-642-33027-8_3 | 近红外光子发射定位晶体管级 AES S-box 活动、逐位恢复密钥 | Crossref 两条记录(CHES 2012 + JCEN 2013) | 高 |
| 10 | Lamphone: Passive Sound Recovery from a Desk Lamp's Light Bulb Vibrations | B. Nassi, Y. Pirutin, R. Swisa, Y. Elovici, B. Zadov, A. Shamir | 2022 | USENIX Security, pp.4401–4417 | https://www.usenix.org/conference/usenixsecurity22/presentation/nassi | 望远镜+光电传感器从灯泡振动被动恢复房间语音 | USENIX'22 页面(含 PDF/幻灯片/视频)+作者主页双源确认 | 高 |
| 11 | Glowworm Attack: Optical TEMPEST Sound Recovery via a Device's Power Indicator LED | B. Nassi, Y. Pirutin, T. Galor, Y. Elovici, B. Zadov | 2021 | ACM CCS, pp.1900–1914 | https://doi.org/10.1145/3460120.3484775 | 从设备电源 LED 闪烁恢复其播放的声音 | Crossref + 作者主页确认 | 高 |
| 12 | Optical Cryptanalysis: Recovering Cryptographic Keys from Power LED Light Fluctuations | B. Nassi 等 10 人(含 Genkin、Tromer、Elovici) | 2023 | ACM CCS, pp.268–280 | https://eprint.iacr.org/2023/1068 | 光电二极管从电源 LED 光强波动恢复密钥——"电源 LED 提取密钥"代表作 | ePrint 2023/1068 + Crossref CCS'23 双源 | 高 |
| 13 | Video-Based Cryptanalysis: Extracting Cryptographic Keys from Video Footage of a Device's Power LED | B. Nassi 等 | 2024 | IEEE S&P, pp.2422–2440 | https://eprint.iacr.org/2023/923 | 普通手机摄像头即可完成条目 12 的攻击(获 2023 Pwnie 最佳密码攻击奖,据作者主页) | ePrint 2023/923 + Crossref S&P'24 双源 | 高 |
| 14 | The Visual Microphone: Passive Recovery of Sound from Video | A. Davis, M. Rubinstein, N. Wadhwa, G. Mysore, F. Durand, W. T. Freeman | 2014 | ACM SIGGRAPH / TOG 33(4) | https://people.csail.mit.edu/mrub/VisualMic/ | 高速视频分析薯片袋等物体微振动恢复声音;含代码、视频、TED 演讲 | MIT CSAIL 项目页确认全部元数据 | 高 |

### 热与机械侧信道

| # | 标题 | 作者 | 年份 | 出处 | URL | 内容与重要性 | 验证证据 | 置信度 |
|---|---|---|---|---|---|---|---|---|
| 15 | Thermal Covert Channels on Multi-core Platforms | Masti, Rai, Ranganathan, Müller, Thiele, Capkun (ETH Zürich) | 2015 | USENIX Security | https://www.usenix.org/conference/usenixsecurity15/technical-sessions/presentation/masti | 跨核热隐蔽信道绕过强隔离(12.5 bps) | USENIX'15 演讲页确认标题/六作者/摘要 | 高 |
| 16 | BitWhisper: Covert Signaling Channel between Air-Gapped Computers Using Thermal Manipulations | Guri, Monitz, Mirski, Elovici | 2015 | IEEE CSF, pp.276–289 | https://doi.org/10.1109/CSF.2015.26 | 两台邻近气隙计算机经机箱热量双向通信 | Crossref + arXiv 1503.07919 双源 | 高 |
| 17 | Thermanator: Thermal Residue-Based Post Factum Attacks on Keyboard Data Entry | T. Kaczmarek, E. Ozturk, G. Tsudik (UC Irvine) | 2019 | ACM AsiaCCS, pp.586–593 | https://doi.org/10.1145/3321705.3329846 | 热成像读取键盘手指余温,事后恢复口令 | Crossref 确认 | 高 |
| 18 | Fansmitter: Acoustic data exfiltration from air-gapped computers via fans noise | Guri, Solewicz, Elovici | 2020(预印本 2016) | Computers & Security 91:101721 | https://doi.org/10.1016/j.cose.2020.101721 | 无扬声器气隙计算机以风扇噪声外泄数据 | Crossref + arXiv 1606.05915 | 高 |
| 19 | DiskFiltration(Acoustic Data Exfiltration via Covert Hard-Drive Noise) | Guri, Solewicz, Daidakulov, Elovici | 2017 | ESORICS (LNCS, pp.98–115) | https://doi.org/10.1007/978-3-319-66399-9_6 | 硬盘寻道机械噪声隐蔽信道 | Crossref + arXiv 1608.03431 | 高 |

### 气隙外泄系列(Guri 等,BGU)

| # | 标题 | 作者 | 年份 | 出处 | URL | 内容与重要性 | 验证证据 | 置信度 |
|---|---|---|---|---|---|---|---|---|
| 20 | LED-it-GO: Leaking (A Lot of) Data from Air-Gapped Computers via the (Small) Hard Drive LED | Guri, Zadov, Elovici | 2017 | DIMVA (LNCS, pp.161–184) | https://doi.org/10.1007/978-3-319-60876-1_8 | 硬盘 LED 高速光学调制(同组还有 xLED, EISIC 2018) | Crossref + arXiv 1702.06715 | 高 |
| 21 | aIR-Jumper: Covert air-gap exfiltration/infiltration via security cameras & infrared (IR) | Guri, Bykhovsky | 2019 | Computers & Security 82:15–29 | https://doi.org/10.1016/j.cose.2018.11.004 | 借安防摄像头 IR LED 建立双向气隙光信道 | Crossref + arXiv 1709.05742 | 高 |
| 22 | ODINI | Guri, Zadov, Elovici | 2020 | IEEE TIFS 15:1190–1203 | https://doi.org/10.1109/TIFS.2019.2938404 | 磁场穿透法拉第笼外泄 | Crossref + arXiv 1802.02700 | 高 |
| 23 | MAGNETO | M. Guri(独作) | 2021 | Future Generation Computer Systems 115:115–125 | https://doi.org/10.1016/j.future.2020.08.045 | CPU 生成磁场与附近智能手机通信 | Crossref + arXiv 1802.02317 | 高 |
| 24 | Mind The Gap: Can Air-Gaps Keep Your Private Data Secure? | M. Guri | 2024 | arXiv(综述性论文) | https://arxiv.org/abs/2409.04190 | 气隙安全全景:事件、攻击模型、外泄技术与防御 | arXiv 页面确认(2024-09-06,未见期刊记录) | 中 |
| 附 | A Survey on Acoustic Side-Channel Attacks: An AI Perspective | Quattrone & Badr | 2025 | MDPI J. Cybersecurity & Privacy 6(1) | https://doi.org/10.3390/jcp6010006 | 近年键盘声学+AI 综述 | Crossref 确认 | 中 |

## 工具与数据集

| 名称 | 用途 | URL | 验证情况 |
|---|---|---|---|
| JBFH-Dev/Keystroke-Datasets | Harrison 等 2023 论文官方按键录音数据集(手机/Zoom) | https://github.com/JBFH-Dev/Keystroke-Datasets | GitHub API 确认(MIT,描述与论文对应) |
| keyboard-acoustic-side-channel-attack-coatnet | 上述论文 CoAtNet 复现 | https://github.com/MomirMilutinovic/keyboard-acoustic-side-channel-attack-coatnet | GitHub API 确认 |
| Botacin-s-Lab/EchoCrypt | 噪声键盘声学攻击+LLM 纠错(USENIX WOOT'25) | https://github.com/Botacin-s-Lab/EchoCrypt | GitHub API 确认 |
| Visual Microphone 代码(MATLAB)+演示 | 高速视频恢复声音复现 | https://people.csail.mit.edu/mrub/VisualMic/ | MIT 页面确认可下载 |
| arXiv Guri 作者检索 | 气隙系列一站式索引(38 篇: SATAn、AIR-FI、ETHERLED、BRIGHTNESS、MOSQUITO、POWER-SUPPLaY、CTRL-ALT-LED 等) | https://arxiv.org/search/?searchtype=author&query=Mordechai+Guri | 经 arXiv API 作者查询逐条确认标题/日期 |

## 入门路径

1. **Loughry & Umphress (2002)**——问题定义最直观的"光泄漏"入门,建立"指示灯即信道"的思维
2. **Asonov/Agrawal (2004) → Zhuang 等 (2005/2009) → Harrison 等 (2023)**——键盘声学三代演进;读完即可用 Keystroke-Datasets 数据集和 CoAtNet 代码动手复现
3. **Genkin/Shamir/Tromer (CRYPTO 2014)**——理解物理噪声如何泄漏密码运算内部状态(频域特征+GnuPG 模乘窗口)
4. **Guri "Mind The Gap" (2024) + Fansmitter/DiskFiltration/LED-it-GO/BitWhisper**——建立气隙外泄的通道分类学(声/光/磁/热/振/电)
5. **Nassi 等 CCS'23 + S&P'24**——前沿光学密码分析;配合 USENIX'22/BHUSA'23 演讲视频理解工程细节

## 纠错与存疑

**纠错(经核实与常见说法不符处):**
- (a) Loughry & Umphress **不是 USENIX 2002**,而是 ACM TISSEC 5(3), 2002
- (b) Backes 打印机论文**不是 USENIX 2004**(该年议程无此文),而是 **USENIX Security 2010**,第五作者为 **Pinkal**(常被误写为 "Manoj Pinkas")
- (c) Zhuang 等期刊版为 **TISSEC 13(1), 2009**(常见 "TISSEC 8(3), 2005" 引用与 Crossref 记录不符)
- (d) Fansmitter 常引 2016 为 arXiv 预印本,正式版为 C&S vol.91, 2020
- (e) MAGNETO 期刊版为 Guri 独作,与 2018 年预印本不同
- (f) Lamphone 正式版标题已改为 "...from a Desk Lamp's Light Bulb Vibrations"(USENIX Sec'22),作者新增 Raz Swisa 与 Adi Shamir

**存疑(未能实际核实,已隔离):**
- **Tosi 等光子发射密码分析**——Crossref 作者查询未见其针对密码芯片的光发射侧信道论文;该方向已核实的经典是 Schlösser 等 CHES 2012(条目 9);Tosi 的 ISTFA/失效分析系列建议人工核对论文集
- **"Guri 气隙综述(IEEE COMST)"或 Guri 专著**——Crossref/arXiv 均未找到,可用综述性资源为 Mind The Gap (arXiv 2024) 与 MDPI 2025 声学综述
- Tromer 声学项目页 404、Guri 的 BGU 主页超时,相关论文元数据已经 ePrint/Crossref/USENIX 独立核实
