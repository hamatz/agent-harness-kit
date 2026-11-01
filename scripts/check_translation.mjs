/**
 * scripts/check_translation.mjs
 * 論文の英語版（docs/paper.en.md）が、正本の日本語版（docs/paper.md）とずれていないかを確かめる。
 * 訳文の良し悪しは機械では測れないので、ずれたら必ず形に現れるものだけを比べる。
 *   1. 見出しの並び（レベルの列）が同じ
 *   2. 表の数と、表ごとの行数が同じ
 *   3. コード（Mermaid 以外）が一字一句同じ。リポジトリのファイルをそのまま載せているため
 *   4. Mermaid 図は、ラベルを除いた骨格（ノードと矢印）が同じ。ラベルだけは訳す
 *   5. 外部リンクの URL が同じ
 *   6. 本文中の小数（52.8%、v1.20.3、第2.2節など）が同じ集合
 * 日本語版を直したのに英語版を直し忘れると、多くの場合どれかで落ちる。
 *
 * 実行: node scripts/check_translation.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ja = fs.readFileSync(path.join(ROOT, 'docs/paper.md'), 'utf8');
const en = fs.readFileSync(path.join(ROOT, 'docs/paper.en.md'), 'utf8');

const FENCE = /^```[^\n]*\n[\s\S]*?^```[ \t]*$/gm;
const codes = (s) => s.match(FENCE) || [];
const prose = (s) => s.replace(FENCE, '');
const headings = (s) => prose(s).split('\n').filter((l) => /^#{1,6} /.test(l)).map((l) => l.match(/^#+/)[0].length);
const tables = (s) => {
  const out = [];
  let n = 0;
  for (const l of prose(s).split('\n')) {
    if (l.startsWith('|')) n++;
    else if (n) { out.push(n); n = 0; }
  }
  if (n) out.push(n);
  return out;
};
const skeleton = (m) => m.replace(/"[^"]*"/g, '""').replace(/\[\([^)]*\)\]/g, '[()]');
const urls = (s) => [...new Set((s.match(/https?:\/\/[^\s)>\]]+/g) || []))].sort();
const decimals = (s) => [...new Set(prose(s).replace(/https?:\/\/\S+/g, '').match(/\d+(?:\.\d+)+/g) || [])].sort();

const failures = [];
const same = (rule, a, b) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A !== B) failures.push({ rule, expected: A, saw: B });
};

same('見出しの並び', headings(ja), headings(en));
same('表の行数', tables(ja), tables(en));
const cj = codes(ja), ce = codes(en);
same('コードの数', cj.length, ce.length);
cj.forEach((c, i) => {
  const e = ce[i] || '';
  const head = c.split('\n')[0];
  if (head === '```mermaid') {
    if (skeleton(c) !== skeleton(e)) failures.push({ rule: `Mermaid 図 ${i + 1} の骨格`, expected: skeleton(c).slice(0, 200), saw: skeleton(e).slice(0, 200) });
  } else if (c !== e) {
    failures.push({ rule: `コード ${i + 1}（${head}）が一字一句同じ`, expected: c.split('\n')[1] || '', saw: e.split('\n')[1] || '' });
  }
});
same('外部リンク', urls(ja), urls(en));
same('本文中の小数', decimals(ja), decimals(en));

for (const f of failures) {
  console.error('[translation] ' + f.rule);
  console.error('  EXPECTED (ja): ' + f.expected);
  console.error('  SAW      (en): ' + f.saw);
}
if (failures.length) {
  console.error(`[translation FAILED] ${failures.length} 件。docs/paper.md に合わせて docs/paper.en.md を直す`);
  process.exit(1);
}
console.log(`[translation PASSED] 見出し ${headings(ja).length}、表 ${tables(ja).length}、コード ${cj.length}、リンク ${urls(ja).length} が一致`);
