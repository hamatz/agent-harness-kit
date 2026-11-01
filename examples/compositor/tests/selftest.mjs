/**
 * examples/compositor/tests/selftest.mjs
 * 検査そのものの検査（Red-First）。
 *
 * 組版ツールをわざと壊した版を作り、verify_matrix.mjs が
 *   - 壊していないツールでは 8通りすべて合格し、
 *   - 壊した箇所に対応する組み合わせ「だけ」を落とす
 * ことを確かめる。何でも落とす検査も、何も見ていない検査も、ここで弾かれる。
 *
 * このリポジトリの CI はこれを実行する。実行: npm test
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EXAMPLE = path.resolve(HERE, '..');
const APP = path.join(EXAMPLE, 'compositor.html');
const BOOK = path.join(EXAMPLE, 'book');
const MATRIX = path.join(HERE, 'verify_matrix.mjs');
const VERIFY = path.join(HERE, 'verify_layout.mjs');
const WORK = path.resolve('test-results', 'selftest');

const ALL = ['A4', 'B5', 'A5', 'A6'].flatMap((s) => ['vertical', 'horizontal'].map((d) => `${s}_${d}`));
const only = (dir) => ALL.filter((n) => n.endsWith('_' + dir));

// 壊し方は、ツールのソースの「ある1か所」を書き換えて作る。
// 書き換え先が見つからなければ、ツールの方が変わったということなので、その場で止める。
const CASES = [
  { name: 'ツールそのもの', patch: null, expectFail: [] },
  {
    name: '縦組みのページ揃えと図版の運搬を止めた版',
    patch: ['for(var i=0;i<4;i++){ alignPages(); placeFigures(); keepTogether(); }', '/* disabled by selftest */'],
    expectFail: only('vertical'),
  },
  {
    name: '横組みの章の改ページを外した版',
    patch: ['html.paper-mode:not(.vertical) section.movement{ break-before:column; }', ''],
    expectFail: only('horizontal'),
  },
  {
    name: 'コード図版を横組みのページより高くした版',
    // ADDON_CSS の末尾（テンプレート文字列の閉じ）に1行足す
    patch: ['\n`;\n\nconst DB_NAME', '\n  html.paper-mode:not(.vertical) .reel .code pre{ padding-top:calc(var(--page-run) * .7) }\n`;\n\nconst DB_NAME'],
    expectFail: only('horizontal'),
  },
  {
    name: '縦組みで表と小見出しを次のページへ送らない版',
    patch: ['alignPages(); placeFigures(); keepTogether(); }', 'alignPages(); placeFigures(); }'],
    expectFail: only('vertical'),
  },
  {
    name: '横組みで表と小見出しを次のページへ送らない版',
    // BOOK_CSS は JSON 文字列として埋め込まれているので、改行は \\n のまま探す
    patch: ['  html.paper-mode:not(.vertical) .prose table{ break-inside:avoid; }\\n  html.paper-mode:not(.vertical) .prose h3,html.paper-mode:not(.vertical) .prose h4{ break-after:avoid; }\\n', ''],
    expectFail: only('horizontal'),
  },
];

fs.mkdirSync(WORK, { recursive: true });
const source = fs.readFileSync(APP, 'utf8');
let bad = 0;

for (const [i, c] of CASES.entries()) {
  let app = APP;
  if (c.patch) {
    const [from, to] = c.patch;
    if (source.split(from).length !== 2) {
      console.error(`[selftest] 「${c.name}」の書き換え先がツールに1か所だけ見つからない: ${JSON.stringify(from)}`);
      process.exit(2);
    }
    app = path.join(WORK, `app_${i}.html`);
    fs.writeFileSync(app, source.replace(from, to));
  }
  const r = spawnSync(process.execPath, [MATRIX, '--app', app, '--project', BOOK, '--verify', VERIFY], { encoding: 'utf8' });
  const out = r.stdout + r.stderr;
  const failed = ALL.filter((n) => new RegExp('^FAIL ' + n + '$', 'm').test(out));
  const passed = ALL.filter((n) => new RegExp('^PASS ' + n + '$', 'm').test(out));
  const want = new Set(c.expectFail);
  const ok = passed.length + failed.length === ALL.length &&
             failed.length === want.size && failed.every((n) => want.has(n)) &&
             r.status === (want.size ? 1 : 0);
  console.log(`${ok ? 'OK  ' : 'NG  '} ${c.name}: 不合格 ${failed.length}/${ALL.length}（期待 ${want.size}） exit=${r.status}`);
  if (!ok) {
    bad++;
    console.error('  EXPECTED 不合格: ' + (c.expectFail.join(', ') || 'なし'));
    console.error('  SAW      不合格: ' + (failed.join(', ') || 'なし') + (passed.length + failed.length < ALL.length ? '（判定できなかった組み合わせあり）' : ''));
    console.error(out.split('\n').filter((l) => /FATAL|Error|EXPECTED|SAW/.test(l)).slice(0, 12).map((l) => '  ' + l).join('\n'));
  }
}
console.log(bad ? `[selftest] ${bad} 件が期待と違う` : '[selftest] 検査は、壊した箇所だけを正しく落とした');
process.exit(bad ? 1 : 0);
