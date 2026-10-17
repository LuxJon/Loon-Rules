import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const check = process.argv.includes('--check');
const raw = 'https://raw.githubusercontent.com/LuxJon/Loon-Rules/main/Subscriptions/';
const plugins = [
  ['节点检测整合', '节点检测整合.lpx', 'node-diagnostics.lpx', 'node-diagnostics'],
  ['哔哩哔哩竖屏优化', '哔哩哔哩竖屏优化.lpx', 'bilibili.lpx', 'bilibili'],
  ['豆瓣去开屏广告', '豆瓣去开屏广告.plugin', 'douban.plugin', 'douban'],
  ['西窗烛会员解锁', '西窗烛会员解锁.plugin', 'xichuangzhu.plugin', 'xichuangzhu'],
  ['QQ音乐启动动画屏蔽', 'QQ音乐启动动画屏蔽.plugin', 'qqmusic.plugin', 'qqmusic'],
];
let mismatches = 0;
function emit(relative, content) {
  const file = path.join(root, relative);
  const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content);
  if (check) {
    if (!fs.existsSync(file) || !fs.readFileSync(file).equals(bytes)) {
      console.error('Out of sync: ' + relative);
      mismatches++;
    }
  } else {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  }
}
for (const [directory, source, destination, slug] of plugins) {
  const base = path.join(root, 'Plugins', directory);
  emit('Subscriptions/' + destination, fs.readFileSync(path.join(base, source)));
  emit('Subscriptions/icons/' + slug + '.png', fs.readFileSync(path.join(base, 'icon.png')));
}
emit('Subscriptions/scripts/node-diagnostics.js', fs.readFileSync(path.join(root, 'Plugins/节点检测整合/节点检测.js')));
emit('Subscriptions/README.md', `# 英文订阅地址

中文文件位于 [Plugins](../Plugins/)，本目录提供内容相同的固定英文订阅副本。

| 插件 | 订阅 |
| --- | --- |
${plugins.map(([name, , file]) => `| ${name} | [${file}](${raw}${file}) |`).join('\n')}

西窗烛原第三方脚本目前返回 404，收录状态见对应中文说明。

本目录由 <code>node scripts/sync-subscriptions.mjs</code> 生成，使用 <code>node scripts/sync-subscriptions.mjs --check</code> 检查与中文文件是否一致。
`);
if (mismatches) process.exitCode = 1;
else console.log(check ? 'English subscriptions match Chinese source files.' : 'Generated English subscriptions, icons and node script.');
