# SCA 技能库清单(第一批,19 个)

> **本目录 = 技能源文件(canonical)**: `sca-<name>/SKILL.md` 共 19 个,随仓库版本化。
> **安装位置(运行副本)**: `C:\Users\Administrator\.zcode\workspace\default\.agents\skills\`(ZCode 标准发现路径);安装方式 = 把技能目录复制过去。
> 所有技能的参考文献均来自本知识库的已验证条目,并内嵌各域"纠错"警告。创建:2026-09-30。

## 使用方式

- **自动触发**: 描述侧信道相关问题时,`sca-router` 会先被触发做场景路由,再加载具体技能
- **手动调用**: `/skill sca-cpa-attack <你的问题>`
- 每个技能包含:适用场景 → 前置条件 → 方法学步骤(含公式与阈值)→ 常见坑 → 参考实现 → 已验证文献(带置信度)→ 防御视角 → 伦理边界

## 技能清单

| # | 技能 | 覆盖 | 参考实现 |
|---|---|---|---|
| 1 | sca-router | 总入口:判别+路由到其余 18 个 | reproductions/ 全部 |
| 2 | sca-spa-analysis | 简单功耗分析(轨迹目测) | — |
| 3 | sca-dpa-attack | 经典差分功耗分析(Kocher 划分+均值差) | cpa_aes.js |
| 4 | sca-cpa-attack | 相关性功耗分析(HW/HD 模型+Pearson) | cpa_aes.js |
| 5 | sca-template-attack | 模板攻击(高斯剖析+极大似然) | — |
| 6 | sca-ml-profiling | ML/深度学习剖析(CNN/ASCAD) | — |
| 7 | sca-tvla-leakage-detection | TVLA 泄漏检测(Welch t,一阶/高阶) | tvla_masking.js |
| 8 | sca-em-emanation | 电磁侧信道(近场/远场/机壳电势) | — |
| 9 | sca-remote-timing | 远程/算法计时攻击(稳健统计量) | timing_attack.js |
| 10 | sca-cache-prime-probe | Prime+Probe / Evict+Time | — |
| 11 | sca-cache-flush-reload | Flush+Reload(clflush+共享页) | — |
| 12 | sca-spectre-meltdown | 瞬态执行攻击类与缓解 | — |
| 13 | sca-rowhammer | Rowhammer 与 ECC/TRR 边界 | — |
| 14 | sca-acoustic-side-channel | 键盘/打印机/密码运算声学 | — |
| 15 | sca-tempest-video-reconstruction | TEMPEST/显示器内容重建 | — |
| 16 | sca-power-and-sensor-side-channels | 电力线/USB/无线充电/电源LED | — |
| 17 | sca-masking-countermeasures | 掩码对策(ISW/高阶/阈值实现) | tvla_masking.js |
| 18 | sca-constant-time-defense | 恒定时间编程与验证(dudect/ct-verif/FaCT) | timing_attack.js 防御对照 |
| 19 | sca-trace-acquisition | 功耗/EM 轨迹采集工程 | — |

## 扩充计划

第二批 +14(见 [../ROADMAP.md](../ROADMAP.md)):Evict+Time、prefetch、TLB、分支预测、SMT 端口、ECDSA nonce+格、RSA 窗口、近场 EM、电源 LED、电力线/USB、屏幕反射、热、气隙分类学、shuffling/隐藏。目标 40+。

## 维护纪律

- 新增/修改技能只能引用知识库已验证条目;引用前查对应域 README 的"纠错"小节
- 涉及实测数字的表述必须与 `reproductions/` 的可重跑输出一致
- 技能不用时可删除对应目录,或移出 `.agents/skills/`
