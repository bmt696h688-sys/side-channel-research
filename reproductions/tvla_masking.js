'use strict';
/*
 * 复现实验 3: TVLA 泄漏检测 (Welch t 检验) + 一阶布尔掩码有效性验证
 *
 * 方法来源:
 *   - Goodwill, Jun, Jaffe, Rohatgi, "A Testing Methodology for Side-Channel
 *     Resistance Validation", NIST Non-Invasive Attack Testing Workshop 2011
 *     (TVLA / fixed-vs-random 方法;注意:常被误引为 CHES 2011,经核实不在CHES论文集)
 *   - 一阶布尔掩码思想: Ishai, Sahai, Wagner, CRYPTO 2003 (ISW)
 *     (两文出处元数据见 ../knowledge/05-countermeasures-evaluation/README.md 验证标注)
 *
 * 设计:
 *   1. 泄漏检测: 固定明文组 vs 随机明文组,每个采样点做 Welch t 检验,|t| > 4.5 报警
 *      (阈值4.5对应约99.999%置信,是TVLA工程惯例)
 *   2. 对照实现A "leaky":  泄漏 = HW(SBox[p^k])          → 应被一阶TVLA检出
 *      对照实现B "masked": 泄漏 = HW(SBox[p^k]^m) + HW(m) → 一阶TVLA应通过
 *      (x 拆成两份share: x = (x^m) XOR m,模拟软件掩码实现的两份寄存器活动)
 *   3. 用3个不同固定明文向量重复(工程实践: 多固定向量降低一阶矩恰好相同导致的漏报)
 *   4. 攻击性验证: 对 masked 轨迹跑一阶CPA → 真实密钥假设的排名应接近均匀随机
 *   5. 二阶统计量检验: 对 masked 轨迹做"中心化平方值"的 t 检验(方差差异检验)
 *      → 理论预期: 掩码后方差 = 8 - HW(x)/... 仍依赖 HW(x),二阶泄漏残留(高阶攻击面),
 *        这正是真实一阶掩码实现"一阶安全但非高阶安全"的体现
 *
 * 运行: node tvla_masking.js
 */
const { SBOX, POPCNT, expandKey, aesEncryptBlock, mulberry32, makeGauss, welchT, cpaAttack, mean, variance } = require('./sca_common');

const KEY = Buffer.from('2b7e151628aed2a6abf7158809cf4f3c', 'hex'); // 公开测试向量密钥
const N = 1000;        // 每组轨迹数
const SIGMA = 0.75;    // 测量噪声标准差
const T_THRESHOLD = 4.5;
const N_POINTS = 20;   // 16个SBox点 + 4个纯噪声点

function genGroup(impl, pts, sigma, rng) {
  const gauss = makeGauss(rng);
  const w = expandKey(KEY);
  const traces = [];
  for (const pt of pts) {
    aesEncryptBlock(pt, w); // 每条轨迹对应真实完整加密
    const tr = new Array(N_POINTS);
    for (let j = 0; j < 16; j++) {
      const x = SBOX[pt[j] ^ KEY[j]];
      let v;
      if (impl === 'leaky') {
        v = POPCNT[x];
      } else {
        const m = Math.floor(rng() * 256); // 每字节每条轨迹独立随机掩码
        v = POPCNT[x ^ m] + POPCNT[m];
      }
      tr[j] = v + gauss(0, sigma);
    }
    for (let j = 16; j < N_POINTS; j++) tr[j] = gauss(0, sigma);
    traces.push(tr);
  }
  return traces;
}

function randomPts(n, rng) {
  return Array.from({ length: n }, () => Uint8Array.from({ length: 16 }, () => Math.floor(rng() * 256)));
}
function fixedPts(n, vec) {
  return Array.from({ length: n }, () => Uint8Array.from(vec));
}
function colAt(traces, t) { return traces.map(tr => tr[t]); }

// 单个固定向量下逐点 t 值
function pointT(impl, fixedVec, seed) {
  const rng = mulberry32(seed);
  const A = genGroup(impl, fixedPts(N, fixedVec), SIGMA, rng);
  const B = genGroup(impl, randomPts(N, rng), SIGMA, rng);
  const tvals = [];
  for (let t = 0; t < N_POINTS; t++) tvals.push(welchT(colAt(A, t), colAt(B, t)));
  return tvals;
}

// 二阶(方差)检验: 组内中心化后取平方,再做 Welch t
function pointT2(impl, fixedVec, seed) {
  const rng = mulberry32(seed);
  const A = genGroup(impl, fixedPts(N, fixedVec), SIGMA, rng);
  const B = genGroup(impl, randomPts(N, rng), SIGMA, rng);
  const sq = (traces) => {
    const out = [];
    for (let t = 0; t < N_POINTS; t++) {
      const col = colAt(traces, t);
      const m = mean(col);
      out.push(col.map(v => (v - m) * (v - m)));
    }
    return out;
  };
  const sA = sq(A), sB = sq(B);
  const tvals = [];
  for (let t = 0; t < N_POINTS; t++) tvals.push(welchT(sA[t], sB[t]));
  return tvals;
}

function main() {
  // 3 个固定明文向量: 全零 + 2个种子随机向量
  const r = mulberry32(42);
  const fixedVecs = [
    new Uint8Array(16),
    Uint8Array.from({ length: 16 }, () => Math.floor(r() * 256)),
    Uint8Array.from({ length: 16 }, () => Math.floor(r() * 256)),
  ];

  console.log('=== 复现实验3: TVLA (N=' + N + '/组, σ=' + SIGMA + ', |t|>' + T_THRESHOLD + ' 报警, 3个固定向量取max|t|) ===\n');
  const maxT = { leaky: new Array(N_POINTS).fill(0), masked: new Array(N_POINTS).fill(0) };
  const maxT2 = { masked: new Array(N_POINTS).fill(0) };
  for (let v = 0; v < fixedVecs.length; v++) {
    const tl = pointT('leaky', fixedVecs[v], 100 + v);
    const tm = pointT('masked', fixedVecs[v], 200 + v);
    const t2m = pointT2('masked', fixedVecs[v], 300 + v);
    for (let t = 0; t < N_POINTS; t++) {
      maxT.leaky[t] = Math.max(maxT.leaky[t], Math.abs(tl[t]));
      maxT.masked[t] = Math.max(maxT.masked[t], Math.abs(tm[t]));
      maxT2.masked[t] = Math.max(maxT2.masked[t], Math.abs(t2m[t]));
    }
  }
  console.log('点 | max|t| 一阶(未掩码) | max|t| 一阶(掩码) | max|t| 二阶(掩码) | 判定');
  let leakDet = 0, maskDet1 = 0, maskDet2 = 0;
  for (let t = 0; t < N_POINTS; t++) {
    const d1 = maxT.leaky[t] > T_THRESHOLD, d2 = maxT.masked[t] > T_THRESHOLD, d3 = maxT2.masked[t] > T_THRESHOLD;
    if (d1) leakDet++; if (d2) maskDet1++; if (d3) maskDet2++;
    const tag = (t < 16 ? 'SBox' + t : '噪声' + t);
    console.log(String(t).padStart(2) + ' ' + tag.padEnd(6) + ' | ' +
      maxT.leaky[t].toFixed(1).padStart(10) + '      | ' +
      maxT.masked[t].toFixed(1).padStart(10) + '      | ' +
      maxT2.masked[t].toFixed(1).padStart(10) + '    | ' +
      (d1 ? '未掩码泄漏' : '-') + (d2 ? ' 掩码一阶泄漏!' : '') + (d3 ? ' 掩码二阶泄漏' : ''));
  }
  console.log('\n小结:');
  console.log('  未掩码实现: ' + leakDet + '/20 点一阶报警 (16个SBox点中' + Math.min(leakDet, 16) + '个被检出;');
  console.log('              个别SBox点若固定向量的HW恰等于随机组均值4,一阶矩无差异→TVLA盲区,见下)');
  console.log('  掩码实现:   一阶报警 ' + maskDet1 + '/20 点(预期0,一阶掩码通过一阶检验)');
  console.log('  掩码实现:   二阶报警 ' + maskDet2 + '/20 点(预期>0:HW(x^m)+HW(m)的方差依赖HW(x),高阶泄漏残留)');

  // 攻击性验证: 对掩码轨迹跑一阶CPA,真实密钥排名应接近随机
  console.log('\n=== 攻击性验证: 对掩码实现跑一阶CPA (N=500) ===');
  // 明文与轨迹用同一个种子流生成,保证明文数组与轨迹一一对应
  const rng2 = mulberry32(999);
  const pts2 = randomPts(500, rng2);
  const aligned = genGroup('masked', pts2, SIGMA, rng2);
  const { rMaps: rMaps2 } = cpaAttack(pts2, aligned, N_POINTS);
  let rankZero = 0;
  const ranks = [];
  for (let j = 0; j < 16; j++) {
    const trueH = KEY[j];
    const sorted = Array.from(rMaps2[j]).sort((a, b) => b - a);
    const rank = sorted.indexOf(rMaps2[j][trueH]);
    if (rank === 0) rankZero++;
    ranks.push(rank);
  }
  console.log('真实密钥逐字节排名(0=CPA最优猜测, 255=最差, 随机期望中位数≈128):');
  console.log('  ' + ranks.join(', '));
  console.log('排名为0的字节数: ' + rankZero + '/16 (随机期望≈0.06) → ' +
    (rankZero <= 2 ? '一阶CPA对掩码实现失效 ✓(掩码有效)' : '出现异常多的首位命中,需检查!'));
}

main();
