'use strict';
/*
 * 复现实验 2: 字节级计时攻击 + 恒定时间防御对照
 *
 * 方法来源:
 *   - Kocher, "Timing Attacks on Implementations of Diffie-Hellman, RSA, DSS,
 *     and Other Systems", CRYPTO 1996 (统计计时攻击方法论开山之作)
 *   - Brumley & Boneh, "Remote Timing Attacks are Practical", USENIX Security 2003
 *   - 教学场景与 Cryptopals Set 4 Challenge 31/32 同型:
 *     对 MAC/标签做"提前返回"的逐字节比较,匹配前缀越长耗时越长 => 泄漏前缀长度
 *
 * 场景设定:
 *   - 漏洞函数: 每匹配 1 字节增加 0.25ms"处理耗时"(busy-wait 模拟,含高斯抖动 σ=0.05ms)
 *   - 攻击者: 只能提交猜测并测量总耗时,不知道密文内容
 *   - 攻击: 每个位置对 256 个候选各测 k=10 次取均值,均值最大者为该字节真实值
 *
 * 防御对照:
 *   - Node.js crypto.timingSafeEqual(恒定时间比较): 不同匹配前缀长度下耗时无系统性差异
 *
 * 运行: node timing_attack.js   (约 20-30 秒,攻击过程含真实耗时模拟)
 */
const crypto = require('crypto');
const { mulberry32, makeGauss, mean } = require('./sca_common');

const rng = mulberry32(0x5EEDCA11);
const gauss = makeGauss(rng);
const SECRET = Uint8Array.from({ length: 8 }, () => 1 + Math.floor(rng() * 255)); // 8字节随机"标签"(避开0x00)
const W = 0.25e-3;      // 每匹配一字节的额外耗时(秒)
const JITTER = 0.05e-3; // 计时抖动标准差(秒)
const K = 20;           // 每候选测量次数

function spin(seconds) {
  if (seconds <= 0) return;
  const t0 = performance.now();
  while (performance.now() - t0 < seconds * 1000) { /* busy-wait 模拟固定工作量 */ }
}

function median(a) {
  const s = Array.from(a).sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// 漏洞实现: 提前返回,耗时 ∝ 匹配前缀长度
function vulnerableCompare(guess) {
  let matched = 0;
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] !== SECRET[i]) break;
    matched++;
  }
  spin(W * matched + gauss(0, JITTER));
  return matched === SECRET.length;
}

function measure(fn, arg, k) {
  const ts = new Array(k);
  for (let i = 0; i < k; i++) {
    const t0 = performance.now();
    fn(arg);
    ts[i] = performance.now() - t0;
  }
  return ts;
}

function attack() {
  console.log('=== 复现实验2: 字节级计时攻击 ===');
  console.log('秘密长度 8 字节, 每字节匹配代价 ' + W * 1000 + ' ms, 抖动σ=' + JITTER * 1000 + ' ms, 每候选测 ' + K + ' 次取中位数');
  console.log('(方法学注: 首次尝试用少样本均值失败——毫秒级GC/调度停顿的离群值即可污染均值,');
  console.log(' 而单位信号仅0.25ms;改用中位数这一稳健统计量后对离群值免疫,详见 README.md 的迭代记录)');
  const known = [];
  let totalCalls = 0;
  const t0 = Date.now();
  const g = Buffer.alloc(SECRET.length); // 复用缓冲区,避免GC噪声
  for (let pos = 0; pos < SECRET.length; pos++) {
    const stats = new Float64Array(256);
    for (let i = 0; i < known.length; i++) g[i] = known[i];
    for (let cand = 0; cand < 256; cand++) {
      g.fill(0, pos + 1); // 候选之后的填充固定为0(SECRET已避开0x00,不影响)
      g[pos] = cand;
      stats[cand] = median(measure(vulnerableCompare, g, K));
      totalCalls += K;
    }
    let best = 0;
    for (let c = 1; c < 256; c++) if (stats[c] > stats[best]) best = c;
    const sorted = Array.from(stats).sort((a, b) => b - a);
    const marginMs = sorted[0] - sorted[1]; // performance.now() 本身单位就是ms
    known.push(best);
    console.log('位置 ' + pos + ': 恢复 0x' + best.toString(16).padStart(2, '0') +
      '  | 中位数最优/次优边际 ' + marginMs.toFixed(3) + ' ms (单位信号 ' + W * 1000 + ' ms)');
  }
  const recovered = Buffer.from(known);
  const secret = Buffer.from(SECRET);
  console.log('\n恢复: ' + recovered.toString('hex'));
  console.log('真实: ' + secret.toString('hex'));
  console.log('结果: ' + (recovered.equals(secret) ? '完全恢复 ✓' : '失败 ✗') +
    ' | 总测量次数 ' + totalCalls + ' | 耗时 ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
}

function ctControl() {
  console.log('\n=== 防御对照: crypto.timingSafeEqual(恒定时间) ===');
  const k = 500;
  const means = [];
  for (let matched = 0; matched <= SECRET.length; matched++) {
    const g = Buffer.from(SECRET);
    for (let i = matched; i < SECRET.length; i++) g[i] ^= 0x5a; // 只保持前 matched 字节一致
    const ts = measure((buf) => crypto.timingSafeEqual(buf, SECRET), g, k);
    means.push(mean(ts) * 1000); // µs
  }
  means.forEach((m, i) => console.log('  匹配前缀 ' + i + ' 字节: 平均 ' + m.toFixed(3) + ' µs'));
  const mx = Math.max(...means), mn = Math.min(...means);
  console.log('  极差(max-min) = ' + (mx - mn).toFixed(3) + ' µs');
  console.log('  → 耗时与匹配前缀长度无单调关系,无计时信号;对照漏洞版本每字节恒定泄漏 ' + W * 1000 + ' ms');
  console.log('  → 结论: 逐字节比较必须用恒定时间原语(比较全程做同样多的工作),而非"提前返回"');
}

attack();
ctControl();
