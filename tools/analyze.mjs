// 分析 zscacm 前端 dist:提取路由表、store、接口调用、页面 chunk 信息
import fs from 'fs';
import path from 'path';

const assetsDir = path.resolve('dist-reference/dist/assets');
const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));

function read(f) { return fs.readFileSync(path.join(assetsDir, f), 'utf8'); }

const main = files.find(f => f.startsWith('index-') && fs.statSync(path.join(assetsDir, f)).size > 500000);
console.log('=== MAIN BUNDLE: ' + main + ' ===\n');
const mainText = read(main);

// 1) 所有形如 path:"..." / path:'...' 的字符串(路由候选)
const routePaths = new Set();
const re1 = /path:["'](\/[\w/\-:]*?)["']/g;
let m;
while ((m = re1.exec(mainText))) routePaths.add(m[1]);
console.log('--- path:"..." 候选 ---');
console.log([...routePaths].join('\n'));

// 2) createRouter / history 调用
const reHist = /createRouter\(|createWebHistory\(|createWebHashHistory\(|history:/g;
let h;
console.log('\n--- router 相关调用位置 ---');
while ((h = reHist.exec(mainText))) {
  const s = Math.max(0, h.index - 120);
  console.log('...' + mainText.slice(s, h.index + 60).replace(/\n/g, ' ') + '...');
}

// 3) store mutations (setXxx 提交)
const muts = new Set();
const reMut = /commit\("(set\w+)"\)/g;
while ((m = reMut.exec(mainText))) muts.add(m[1]);
console.log('\n--- store mutations ---');
console.log([...muts].join(', '));

// 4) API 基址
const reBase = /const\s+\w+=["'](https?:\/\/[^"']+)["']/g;
console.log('\n--- API base URLs ---');
while ((m = reBase.exec(mainText))) console.log(m[1]);

// 5) 每个 chunk 的接口调用(形如 url:y+"xxx" 或 y+"xxx")
console.log('\n=== 各页面 chunk 的接口调用 ===');
for (const f of files) {
  if (f === main) continue;
  const t = read(f);
  const urls = new Set();
  const re2 = /(?:url:|y\+|baseURL:)\s*["']?([a-zA-Z0-9_/\-]+)["']?/g;
  while ((m = re2.exec(t))) {
    const v = m[1];
    if (/^[a-zA-Z]+$/.test(v)) continue; // 变量名
    urls.add(v);
  }
  // axios 方法调用: .get("xxx") .post("xxx")
  const re3 = /\.(get|post|put|delete)\(["']([^"']+)["']/g;
  while ((m = re3.exec(t))) urls.add(m[1] + ' ' + m[2]);
  if (urls.size) {
    console.log('\n[' + f + ']');
    for (const u of urls) console.log('   ' + u);
  }
}

// 6) 页面 chunk 大小
console.log('\n=== chunk 大小 ===');
for (const f of files) console.log(f + '\t' + fs.statSync(path.join(assetsDir, f)).size);
