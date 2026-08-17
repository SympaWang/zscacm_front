// 用法: node tools/show.mjs <chunk文件名> [起始段]
// 将压缩 JS 分段输出(每段 ~1800 字符),便于阅读
import fs from 'fs';
import path from 'path';
const f = process.argv[2];
const from = parseInt(process.argv[3] || '0', 10);
const t = fs.readFileSync(path.resolve('dist-reference/pretty', f), 'utf8');
const segLen = 1800;
let i = from * segLen;
let n = 0;
while (i < t.length) {
  console.log('--- 段' + (from + n) + ' ---');
  console.log(t.slice(i, i + segLen));
  i += segLen;
  n++;
  if (n >= 12) break;
}
