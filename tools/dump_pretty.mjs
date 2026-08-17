// 将 dist 中所有业务页面 chunk 复制到 pretty/ 目录,便于逐页阅读还原
import fs from 'fs';
import path from 'path';
const assetsDir = path.resolve('dist-reference/dist/assets');
const outDir = path.resolve('dist-reference/pretty');
fs.mkdirSync(outDir, { recursive: true });
const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
for (const f of files) {
  fs.copyFileSync(path.join(assetsDir, f), path.join(outDir, f));
}
// 列出业务 chunk(排除大库文件)
const libs = ['myChart-b7fa96f8.js', 'discuss-150202b6.js', 'user-f3cf65c6.js'];
for (const f of files) {
  const sz = fs.statSync(path.join(assetsDir, f)).size;
  if (sz > 60000 && !libs.includes(f)) libs.push(f);
}
console.log('业务 chunk(需还原):');
for (const f of files) {
  if (libs.includes(f)) continue;
  console.log('  ' + f + '\t' + fs.statSync(path.join(assetsDir, f)).size);
}
console.log('\n库/大文件(跳过):');
for (const l of libs) console.log('  ' + l + '\t' + fs.statSync(path.join(assetsDir, l)).size);
