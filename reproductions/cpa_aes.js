'use strict';
/*
 * 复现实验 1: AES-128 相关性功耗分析 (CPA, Correlation Power Analysis)
 *
 * 方法来源: Brier, Clavier, Olivier,
 *           "Correlation Power Analysis with a Leakage Model", CHES 2004
 *           (三位作者,经 Crossref DOI 核实;详见 ../knowledge/01-power-analysis/README.md)
 *
 * 场景设定(与 ChipWhisperer 官方 CPA 教程同型的仿真版本):
 *   - 目标设备: 纯软件 AES-128,泄漏模型 = 第一轮 SBox 输出的汉明重量 + 高斯噪声
 *   - 攻击者知识: 明文与完整功耗轨迹(20个采样点: 16个SBox泄漏点 + 4个纯噪声点),
 *     不知道密钥,不知道泄漏点位置(需要对每个假设扫全部点取最大相关)
 *   - 攻击: 逐密钥字节 × 256 个假设 × 全部采样点做 Pearson 相关,取 |r| 最大者为猜测
 *
 * 真实性锚定:
 *   - AES 实现通过 FIPS-197 附录C.1 与 NIST SP 800-38A 官方KAT(sca_common.js 加载时自动执行)
 *   - 目标密钥采用 NIST SP 800-38A 公开测试向量密钥 2b7e151628aed2a6abf7158809cf4f3c
 *   - 全部随机性来自固定种子的确定性PRNG,任何人重跑得到相同结果
 *
 * 运行:
 *   node cpa_aes.js           # 主演示 (N=300 条轨迹, 噪声σ=1.0)
 *   node cpa_aes.js --study   # 噪声 × 样本量鲁棒性研究 (20个配置)
 */
const { SBOX, POPCNT, expandKey, aesEncryptBlock, mulberry32, makeGauss, cpaAttack } = require('./sca_common');

const KEY = Buffer.from('2b7e151628aed2a6abf7158809cf4f3c', 'hex'); // 公开测试向量密钥(演示目标)
const N_POINTS = 20;

function genTraces(n, sigma, seed) {
  const rng = mulberry32(seed);
  const gauss = makeGauss(rng);
  const w = expandKey(KEY);
  const pts = [], traces = [];
  for (let i = 0; i < n; i++) {
    const pt = Uint8Array.from({ length: 16 }, () => Math.floor(rng() * 256));
    pts.push(pt);
    aesEncryptBlock(pt, w); // 每条轨迹对应一次真实完整的 AES-128 加密
    const tr = new Array(N_POINTS);
    for (let j = 0; j < 16; j++) tr[j] = POPCNT[SBOX[pt[j] ^ KEY[j]]] + gauss(0, sigma);
    for (let j = 16; j < N_POINTS; j++) tr[j] = gauss(0, sigma);
    traces.push(tr);
  }
  return { pts, traces };
}

function runOnce(n, sigma, seed) {
  const { pts, traces } = genTraces(n, sigma, seed);
  const { guess, rMaps } = cpaAttack(pts, traces, N_POINTS);
  return { guess, rMaps };
}

function fmt(buf) { return Buffer.from(buf).toString('hex'); }

function main() {
  const N = 300, SIGMA = 1.0, SEED = 20260930;
  console.log('=== 复现实验1: AES-128 CPA (N=' + N + ', σ=' + SIGMA + ') ===');
  console.log('目标密钥(公开测试向量): ' + fmt(KEY));
  const t0 = Date.now();
  const { guess, rMaps } = runOnce(N, SIGMA, SEED);
  const dt = (Date.now() - t0) / 1000;

  let ok = 0;
  console.log('\n字节 | 猜测 | 正确 | r(正确假设) | r(最优错误假设) | 边际   | 泄漏点');
  for (let j = 0; j < 16; j++) {
    const trueH = KEY[j];
    const rTrue = rMaps[j][trueH];
    let bestWrong = -1, bestWrongH = -1;
    for (let h = 0; h < 256; h++) if (h !== trueH && rMaps[j][h] > bestWrong) { bestWrong = rMaps[j][h]; bestWrongH = h; }
    const good = guess[j] === trueH;
    if (good) ok++;
    console.log(
      String(j).padStart(4) + ' | 0x' + guess[j].toString(16).padStart(2, '0') +
      ' | ' + (good ? ' ✓ ' : ' ✗ ') +
      ' | ' + rTrue.toFixed(4) + '      | ' + bestWrong.toFixed(4) + ' (0x' + bestWrongH.toString(16).padStart(2, '0') + ')' +
      ' | ' + (rTrue - bestWrong).toFixed(4) + ' | ' + j);
  }
  console.log('\n恢复密钥: ' + fmt(guess));
  console.log('真实密钥: ' + fmt(KEY));
  console.log('结果: ' + ok + '/16 字节正确' + (ok === 16 ? ' —— 完整 128 位密钥恢复成功' : ' —— 未完全恢复'));
  console.log('耗时 ' + dt.toFixed(1) + 's');
}

function study() {
  console.log('=== CPA 鲁棒性研究: 噪声σ × 轨迹数N (每配置独立种子) ===\n');
  const sigmas = [0, 0.5, 1.0, 2.0, 3.0];
  const ns = [50, 100, 300, 500];
  console.log('| σ \\ N | ' + ns.map(n => String(n).padStart(6)).join(' | ') + ' |');
  console.log('|' + '---|'.repeat(ns.length + 1));
  let fullRow = [];
  for (const sigma of sigmas) {
    const row = [];
    for (const n of ns) {
      const seed = 7000 + Math.round(sigma * 100) * 100 + n; // 配置决定种子,可复现
      const { guess } = runOnce(n, sigma, seed);
      const ok = guess.filter((g, j) => g === KEY[j]).length;
      row.push(ok + '/16');
      if (ok === 16) fullRow.push(`σ=${sigma},N=${n}`);
    }
    console.log('| ' + sigma + '  | ' + row.map(x => x.padStart(6)).join(' | ') + ' |');
  }
  console.log('\n完整恢复16字节的配置: ' + (fullRow.length ? fullRow.join('; ') : '无'));
  console.log('观察: σ=0 时极少轨迹即可恢复; σ 增大后正确假设的|r|下降(理论值 r≈sqrt(Var_HW/(Var_HW+σ²)),');
  console.log('Var_HW=2),需要的轨迹数随之上升——这就是"轨迹数 vs 噪声"的经典权衡。');
}

process.argv.includes('--study') ? study() : main();
