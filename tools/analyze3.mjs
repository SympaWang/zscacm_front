// 分析3:提取主包路由表 path -> chunk 映射
import fs from 'fs';
import path from 'path';
const assetsDir = path.resolve('dist-reference/dist/assets');
const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
const main = files.find(f => f.startsWith('index-') && fs.statSync(path.join(assetsDir, f)).size > 500000);
const mt = fs.readFileSync(path.join(assetsDir, main), 'utf8');

// 定位路由表:找 path:"/" 起,到 createRouter 结束
const start = mt.indexOf('path:"/",');
const end = mt.indexOf('l9({history:');
console.log('start=' + start + ' end=' + end);
if (start > 0 && end > start) {
  const seg = mt.slice(start, end);
  // 逐条提取 {path:"/x",...component:()=>import("./chunk")}
  const re = /path:"(\/[^"]*)",([\s\S]*?)component:\(\)=>\w+\(\(\)=>import\("\.\/([^"]+\.js)"\)/g;
  let m;
  console.log('--- 路由 -> chunk ---');
  while ((m = re.exec(seg))) console.log(m[1] + '  =>  ' + m[3]);
  // 也打印原始片段便于核对
  console.log('\n--- 路由表原始片段(前2500字符) ---');
  console.log(seg.slice(0, 2500));
}
