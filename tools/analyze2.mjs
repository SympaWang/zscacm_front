// 分析2:提取每个页面 chunk 的接口调用 + 主包路由表 + store 定义
import fs from 'fs';
import path from 'path';

const assetsDir = path.resolve('dist-reference/dist/assets');
const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));

function read(f) { return fs.readFileSync(path.join(assetsDir, f), 'utf8'); }

// ---- 每个页面 chunk:接口调用 ----
console.log('=== 页面 chunk 接口调用 ===');
for (const f of files) {
  if (f.startsWith('index-') && fs.statSync(path.join(assetsDir, f)).size > 500000) continue;
  const t = read(f);
  if (!/axios|url:|method:/.test(t) && !/\.(get|post)\("/.test(t)) continue;
  // url:变量+"path" 或 url:"path"
  const urls = new Set();
  const re = /url:\s*(?:[A-Za-z_$][\w$]*\s*\+\s*)?["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(t))) urls.add(m[1]);
  // axios 封装调用 .get("...") .post("...")
  const re2 = /\.(?:get|post|put|delete)\("([^"]+)"\)/g;
  while ((m = re2.exec(t))) urls.add(m[1]);
  // fetch("...")
  const re3 = /(?:axios|request|http)\s*\(\s*["']([^"']+)["']/g;
  while ((m = re3.exec(t))) urls.add(m[1]);
  if (urls.size) {
    console.log('\n[' + f + ']');
    for (const u of urls) console.log('   ' + u);
  }
}

// ---- 主包:路由表定义 ----
console.log('\n=== 主包路由表 ===');
const main = files.find(f => f.startsWith('index-') && fs.statSync(path.join(assetsDir, f)).size > 500000);
const mt = read(main);
// 找 routes:i9 附近;路由表定义通常在 createRouter 之前的变量
const idx = mt.indexOf('routes:');
if (idx > 0) {
  // 从 routes: 往前找 "const i9=[" 或类似定义
  const seg = mt.slice(0, idx);
  const defIdx = seg.lastIndexOf('=');
  console.log('routes 定义片段: ...' + seg.slice(defIdx - 20));
}
// 直接找每个 path 的完整路由条目: path:"/xxx",...component
const routes = new Map();
const reRoute = /path:"(\/[^"]*)",[^}]*?name:"?([^",}]+)"?/g;
let m;
while ((m = reRoute.exec(mt))) routes.set(m[1], m[2]);
console.log('path->name:');
for (const [p, n] of routes) console.log('  ' + p + '  =>  ' + n);

// ---- store 定义 ----
console.log('\n=== store 相关 ===');
for (const kw of ['createStore', 'state:', 'mutations:', 'Vuex', 'vuex']) {
  const i = mt.indexOf(kw);
  if (i >= 0) console.log(kw + ' @ ' + i + ': ...' + mt.slice(Math.max(0, i - 100), i + 150).replace(/\n/g, ' '));
}
