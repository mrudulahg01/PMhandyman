import { mkdir, readFile, writeFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
const css = await readFile('styles.css', 'utf8');
const favicon = encodeURIComponent(await readFile('favicon.svg', 'utf8'));
const data = (await readFile('data.js', 'utf8')).replace(/^export /gm, '');
const app = (await readFile('app.js', 'utf8')).replace(/^import .*?;\n/, '');
// Always compile from the template so rebuilding cannot embed an older bundle.
// Inline assets and a classic script also work when opened with file://.
const html = (await readFile('index.template.html', 'utf8'))
  .replace('href="./favicon.svg"', `href="data:image/svg+xml,${favicon}"`)
  .replace('<link rel="stylesheet" href="./styles.css">', `<style>${css}</style>`)
  .replace('</body>', `<script>(()=>{\n${data}\n${app}\n})();</script></body>`);
for (const target of ['index.html', 'friction-radar.html', 'dist/index.html']) {
  await writeFile(target, html);
}
console.log('Built three offline-ready dashboard entry points: index.html, friction-radar.html, dist/index.html');
