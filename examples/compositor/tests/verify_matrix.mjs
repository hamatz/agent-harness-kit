/**
 * tests/verify_matrix.mjs
 * 本を判型4種 × 組方向2種の8通りで書き出し、それぞれを verify_layout.mjs に掛ける。
 * 1通りでも落ちれば Exit 1。人間が5分の目視で見切れない組み合わせを、機械に全部見させる。
 *
 * 書き出しはツールそのもの（Compositor の HTML）にやらせる。組版の処理を
 * テスト側で再実装すると、テストとツールがずれて「テストは通るのに本は崩れる」になるため。
 *
 * 準備: npm install -D playwright marked@18.0.7 && npx playwright install chromium
 * 実行: node tests/verify_matrix.mjs --app compositor.html --project book/ [--verify tests/verify_layout.mjs]
 *   --project は Compositor の「プロジェクト書き出し」で作ったフォルダ
 *   （book.json・chapters/*.md・images/）
 */
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith('--') ? a.concat([[v.slice(2), all[i + 1]]]) : a), []));
if (!args.app || !args.project) {
  console.error('使い方: node tests/verify_matrix.mjs --app <compositor.html> --project <プロジェクトのフォルダ>');
  process.exit(2);
}
const SIZES = ['A4', 'B5', 'A5', 'A6'];
const DIRS = ['vertical', 'horizontal'];
const OUT = path.resolve('test-results', 'books');
// 検査本体。既定は同じフォルダの verify_layout.mjs（--verify で別の場所を指定できる）
const VERIFY = path.resolve(args.verify || path.join(path.dirname(fileURLToPath(import.meta.url)), 'verify_layout.mjs'));
// 外部CDNに頼らず、版を固定したローカルの marked を使う（CIで結果が揺れないように）
// （marked は lib/ 以下を exports で公開していないので、package.json の場所から辿る）
const MARKED = path.join(path.dirname(createRequire(import.meta.url).resolve('marked/package.json')), 'lib', 'marked.umd.js');

// プロジェクトのフォルダを { "相対パス": 中身 } に読み込む。画像はバイト列のまま渡す
function readProject(dir) {
  const files = {};
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== '.git') walk(p); continue; }
      const rel = path.relative(dir, p).split(path.sep).join('/');
      files[rel] = rel.startsWith('images/') ? [...fs.readFileSync(p)] : fs.readFileSync(p, 'utf8');
    }
  };
  walk(dir);
  return files;
}

fs.mkdirSync(OUT, { recursive: true });
const project = readProject(path.resolve(args.project));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.route('**/*', (r) => {
  const u = r.request().url();
  if (u.startsWith('file:')) return r.continue();
  if (u.includes('/marked')) return r.fulfill({ path: MARKED, contentType: 'text/javascript' });
  if (u.includes('lucide')) return r.fulfill({ body: 'window.lucide={createIcons(){}}', contentType: 'text/javascript' });
  return r.fulfill({ body: '', contentType: 'text/javascript' }); // 編集画面の見た目用（Tailwind など）は書き出しに不要
});
await page.goto(pathToFileURL(path.resolve(args.app)).href, { waitUntil: 'load' });

const built = [];
for (const size of SIZES) {
  for (const dir of DIRS) {
    const html = await page.evaluate(({ project, size, dir }) => {
      const files = {};
      for (const k in project) files[k] = Array.isArray(project[k]) ? new Uint8Array(project[k]) : project[k];
      const book = filesToBook(files, 'book');
      book.paperSize = size; book.direction = dir; book.viewMode = 'paper';
      return buildBookHtml(book);
    }, { project, size, dir });
    const file = path.join(OUT, `${size}_${dir}.html`);
    fs.writeFileSync(file, html);
    built.push(file);
  }
}
await browser.close();

let failed = 0;
for (const file of built) {
  const r = spawnSync(process.execPath, [VERIFY, file], { encoding: 'utf8' });
  const name = path.basename(file, '.html');
  if (r.status === 0) { console.log('PASS ' + name); continue; }
  failed++;
  console.log('FAIL ' + name);
  // 違反の中身（EXPECTED / SAW）をそのまま流す。合否の表示は順番が崩れないよう、すべて標準出力に出す
  for (const line of (r.stdout + r.stderr).split('\n')) if (/^\[(layout|browser)\]|^  (EXPECTED|SAW)/.test(line)) console.log('  ' + line);
}
console.log(`[matrix] ${built.length - failed} / ${built.length} passed`);
process.exit(failed ? 1 : 0);
