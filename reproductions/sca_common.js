'use strict';
/*
 * sca_common.js — 侧信道复现实验共享库
 *
 * 内容:
 *   - AES-128 加密实现(纯JS),加载时自动运行 FIPS-197 附录C.1 与 NIST SP 800-38A F.1.1
 *     两个官方已知答案测试(KAT),任何脚本 require 本模块即获得"密码学正确性已锚定"的保证
 *   - SBox、汉明重量查表(POPCNT)
 *   - Pearson 相关性(带预计算和的高效形式)、Welch t 检验
 *   - 确定性伪随机数(mulberry32)+ Box-Muller 高斯噪声,保证实验完全可复现
 */

// ---------- SBox 程序化构造(FIPS-197 定义: GF(2^8)乘法逆元 + 仿射变换) ----------
function rotl8(b, r) { return ((b << r) | (b >>> (8 - r))) & 0xff; }

function buildSbox() {
  const sbox = new Uint8Array(256);
  let p = 1, q = 1;
  do {
    // p *= 3 (3 是 GF(2^8)/0x11B 的生成元)
    p = (p ^ ((p << 1) & 0xff) ^ ((p & 0x80) ? 0x1b : 0)) & 0xff;
    // q /= 3 (上述乘法的逆运算)
    q ^= (q << 1) & 0xff;
    q ^= (q << 2) & 0xff;
    q ^= (q << 4) & 0xff;
    if (q & 0x80) q ^= 0x09;
    const x = q ^ rotl8(q, 1) ^ rotl8(q, 2) ^ rotl8(q, 3) ^ rotl8(q, 4);
    sbox[p] = (x ^ 0x63) & 0xff;
  } while (p !== 1);
  sbox[0] = 0x63;
  return sbox;
}
const SBOX = buildSbox();

const POPCNT = new Uint8Array(256);
for (let i = 1; i < 256; i++) POPCNT[i] = POPCNT[i >> 1] + (i & 1);

// ---------- AES-128 ----------
const RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

function xtime(a) { a <<= 1; return (a & 0x100) ? ((a ^ 0x1b) & 0xff) : a; }

// key: 长度16的类数组 -> 44个4字节字
function expandKey(key) {
  const w = [];
  for (let i = 0; i < 4; i++) w.push([key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]]);
  for (let i = 4; i < 44; i++) {
    let t = w[i - 1].slice();
    if (i % 4 === 0) {
      t = [SBOX[t[1]], SBOX[t[2]], SBOX[t[3]], SBOX[t[0]]]; // RotWord + SubWord
      t[0] ^= RCON[i / 4 - 1];
    }
    w.push([w[i - 4][0] ^ t[0], w[i - 4][1] ^ t[1], w[i - 4][2] ^ t[2], w[i - 4][3] ^ t[3]]);
  }
  return w;
}

// block: 长度16的类数组, w: expandKey 输出 -> 返回16字节数组
function aesEncryptBlock(block, w) {
  let s = Array.from(block, Number);
  const ark = (r) => { for (let c = 0; c < 4; c++) for (let j = 0; j < 4; j++) s[4 * c + j] ^= w[4 * r + c][j]; };
  const shiftRows = () => {
    const t = s.slice();
    for (let r = 1; r < 4; r++) for (let c = 0; c < 4; c++) t[4 * c + r] = s[4 * ((c + r) % 4) + r];
    return t;
  };
  const mixColumns = () => {
    for (let c = 0; c < 4; c++) {
      const a = [s[4 * c], s[4 * c + 1], s[4 * c + 2], s[4 * c + 3]];
      s[4 * c]     = xtime(a[0]) ^ xtime(a[1]) ^ a[1] ^ a[2] ^ a[3];
      s[4 * c + 1] = a[0] ^ xtime(a[1]) ^ xtime(a[2]) ^ a[2] ^ a[3];
      s[4 * c + 2] = a[0] ^ a[1] ^ xtime(a[2]) ^ xtime(a[3]) ^ a[3];
      s[4 * c + 3] = xtime(a[0]) ^ a[0] ^ a[1] ^ a[2] ^ xtime(a[3]);
    }
  };
  ark(0);
  for (let r = 1; r < 10; r++) {
    s = s.map(b => SBOX[b]);
    s = shiftRows();
    mixColumns();
    ark(r);
  }
  s = s.map(b => SBOX[b]);
  s = shiftRows();
  ark(10);
  return s;
}

// ---------- 已知答案测试(KAT): 模块加载即执行 ----------
(function selfTest() {
  if (SBOX[0] !== 0x63 || SBOX[1] !== 0x7c || SBOX[0x53] !== 0xed) throw new Error('SBox 抽查失败');
  // FIPS-197 附录 C.1
  const k1 = Uint8Array.from({ length: 16 }, (_, i) => i);
  const pt1 = Uint8Array.from({ length: 16 }, (_, i) => (i * 0x11) & 0xff);
  const ct1 = Buffer.from(aesEncryptBlock(pt1, expandKey(k1)));
  if (!ct1.equals(Buffer.from('69c4e0d86a7b0430d8cdb78070b4c55a', 'hex'))) {
    throw new Error('FIPS-197 C.1 KAT 失败: ' + ct1.toString('hex'));
  }
  // NIST SP 800-38A F.1.1 (ECB-AES128 第一块)
  const k2 = Buffer.from('2b7e151628aed2a6abf7158809cf4f3c', 'hex');
  const pt2 = Buffer.from('6bc1bee22e409f96e93d7e117393172a', 'hex');
  const ct2 = Buffer.from(aesEncryptBlock(pt2, expandKey(k2)));
  if (!ct2.equals(Buffer.from('3ad77bb40d7a3660a89ecaf32466ef97', 'hex'))) {
    throw new Error('NIST SP 800-38A KAT 失败: ' + ct2.toString('hex'));
  }
})();

// ---------- 统计工具 ----------
function corrFromSums(n, sumX, sumX2, sumY, sumY2, sumXY) {
  const sxx = sumX2 - sumX * sumX / n;
  const syy = sumY2 - sumY * sumY / n;
  const sxy = sumXY - sumX * sumY / n;
  if (sxx <= 0 || syy <= 0) return 0;
  return sxy / Math.sqrt(sxx * syy);
}

function mean(a) { let s = 0; for (const v of a) s += v; return s / a.length; }
function variance(a) { const m = mean(a); let s = 0; for (const v of a) s += (v - m) * (v - m); return s / (a.length - 1); }
function welchT(a, b) {
  const se = Math.sqrt(variance(a) / a.length + variance(b) / b.length);
  return (mean(a) - mean(b)) / se;
}

// ---------- 确定性随机数 ----------
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeGauss(rng) {
  return function (mu, sigma) {
    if (sigma <= 0) return mu;
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}

// ---------- CPA 攻击核心 ----------
// 对16个密钥字节逐一做256假设×全部采样点的Pearson相关性枚举。
// 返回 guess(逐字节最优假设)与 rMaps(每字节256个假设各自的全点最大|r|)
function cpaAttack(pts, traces, nPoints) {
  const n = pts.length;
  const cols = [], colS = [], colS2 = [];
  for (let t = 0; t < nPoints; t++) {
    const col = new Float64Array(n);
    let s = 0, s2 = 0;
    for (let i = 0; i < n; i++) { const v = traces[i][t]; col[i] = v; s += v; s2 += v * v; }
    cols.push(col); colS.push(s); colS2.push(s2);
  }
  const guess = [], rMaps = [];
  for (let j = 0; j < 16; j++) {
    const rBest = new Float64Array(256);
    for (let h = 0; h < 256; h++) {
      const model = new Uint8Array(n);
      let sm = 0, sm2 = 0;
      for (let i = 0; i < n; i++) {
        const v = POPCNT[SBOX[pts[i][j] ^ h]];
        model[i] = v; sm += v; sm2 += v * v;
      }
      for (let t = 0; t < nPoints; t++) {
        const col = cols[t];
        let sxy = 0;
        for (let i = 0; i < n; i++) sxy += model[i] * col[i];
        const r = Math.abs(corrFromSums(n, sm, sm2, colS[t], colS2[t], sxy));
        if (r > rBest[h]) rBest[h] = r;
      }
    }
    let bestH = 0;
    for (let h = 1; h < 256; h++) if (rBest[h] > rBest[bestH]) bestH = h;
    guess.push(bestH);
    rMaps.push(rBest);
  }
  return { guess, rMaps };
}

module.exports = {
  SBOX, POPCNT, expandKey, aesEncryptBlock,
  corrFromSums, mean, variance, welchT,
  mulberry32, makeGauss, cpaAttack,
};
