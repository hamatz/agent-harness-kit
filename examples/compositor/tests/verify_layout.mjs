/**
 * examples/compositor/tests/verify_layout.mjs
 * 組版（紙面モード）の検証ゲート。合否は「見た目」ではなく、測れる条件で決める。
 * 汎用のブラウザエラー検査（kit/tests/verify_ui.mjs）に、Compositor の紙面の不変条件を足したもの。
 *   1. ブラウザのエラーが 0 件（コンソール・未捕捉例外・読み込み失敗）
 *   2. 紙面モードのとき、組版の不変条件を満たす
 *      - どの図版・コード図版もページの境目をまたがない
 *      - 本編の章はページの頭から始まる
 * スクリーンショットは人間が原因を探すための補助で、合否には使わない。
 *
 * 準備: npm install -D playwright && npx playwright install chromium
 * 実行: node examples/compositor/tests/verify_layout.mjs <書き出したHTMLのパス>
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = process.argv[2] || 'http://localhost:3000';
const target = /^https?:\/\//.test(arg) ? arg : pathToFileURL(path.resolve(arg)).href;
const OUT_DIR = path.resolve('test-results');
// スクリーンショットは入力ごとに別の名前で残す（8通りを続けて検査しても上書きしない）
const name = (/^https?:\/\//.test(arg) ? arg.replace(/^https?:\/\//, '') : path.basename(arg, path.extname(arg)))
  .replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 80) || 'page';
const SHOT = path.join(OUT_DIR, name + '.png');
const TOL = 1; // px。丸め誤差の許容幅
// CI でネットワークに出られない場合、Web フォントの取得失敗はエラーに数えない
const IGNORE = [/fonts\.(googleapis|gstatic)\.com/];
const ignored = (url) => IGNORE.some((re) => re.test(url));

fs.mkdirSync(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
// 紙が縮小表示されない大きさにしておく
const page = await browser.newPage({ viewport: { width: 1600, height: 1400 } });

const errors = [];
page.on('console', (m) => {
  // 読み込み失敗はコンソールにも出るが、URL は location() にしか入っていない
  if (m.type() === 'error' && !ignored(m.location().url || '')) errors.push('console: ' + m.text());
});
page.on('pageerror', (e) => errors.push('uncaught: ' + e.message));
page.on('requestfailed', (r) => { if (!ignored(r.url())) errors.push('request failed: ' + r.url()); });
page.on('response', (r) => { if (r.status() >= 400 && !ignored(r.url())) errors.push('HTTP ' + r.status() + ': ' + r.url()); });

let failures = [];
try {
  const res = await page.goto(target, { waitUntil: 'load', timeout: 15000 });
  if (res && res.status() >= 400) throw new Error('HTTP ' + res.status());
  // ページ送りの組版処理はフォント読み込み後にやり直されるので、それを待つ
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.screenshot({ path: SHOT, fullPage: true });

  failures = await page.evaluate((TOL) => {
    const out = [];
    const stage = document.querySelector('.stage');
    const flow = document.querySelector('.flow');
    const reel = document.querySelector('.reel');
    // 紙面モードでなければ組版の検査はしない
    if (!stage || !flow || !reel || !reel.firstElementChild) return out;
    const vert = document.documentElement.classList.contains('vertical');
    const m = (stage.style.transform || '').match(/scale\(([\d.]+)\)/);
    const z = m ? parseFloat(m[1]) : 1;
    const w = flow.getBoundingClientRect().width / z; // 1ページの幅
    const ref = reel.firstElementChild.getBoundingClientRect();
    // 本文の先頭から見た位置。縦組みは右から左へ進む
    const startOf = (el) => {
      const b = el.getBoundingClientRect();
      return (vert ? ref.right - b.right : b.left - ref.left) / z;
    };
    const pageOf = (x) => Math.floor((x + TOL) / w) + 1;
    const inPage = (x) => ((x % w) + w) % w;
    const label = (el) => {
      const t = el.querySelector('figcaption, .bar');
      return ((t && t.textContent) || el.className || el.tagName).trim().slice(0, 40);
    };

    const figures = [...reel.querySelectorAll('figure, .code')].filter((el) =>
      !el.closest('.footnotes, .outline') &&
      !(el.parentElement && el.parentElement.closest('figure, .code'))); // 入れ子は外側だけ
    const chapters = reel.querySelectorAll('section.movement:not(.frontmatter)');
    const chapterName = (el) => { const h = el.querySelector('h2'); return (h && h.textContent) || el.id; };

    if (vert) {
      // 縦組み：ページは右から左へ並ぶ。位置は「本文の先頭からの横の距離」で測る
      for (const el of figures) {
        const s = startOf(el);
        const wid = el.getBoundingClientRect().width / z;
        const rem = inPage(s);
        if (rem + wid > w + TOL) {
          out.push({
            rule: '図版がページの境目をまたがない',
            what: label(el),
            expected: 'ページ内の位置 + 幅 <= ' + w.toFixed(0) + 'px',
            saw: rem.toFixed(1) + ' + ' + wid.toFixed(1) + ' = ' + (rem + wid).toFixed(1) +
                 'px（' + pageOf(s) + 'ページ目から' + pageOf(s + wid) + 'ページ目へ）',
          });
        }
      }
      for (const el of chapters) {
        const s = startOf(el);
        const rem = inPage(s);
        if (rem > TOL && rem < w - TOL) {
          out.push({
            rule: '章はページの頭から始まる',
            what: chapterName(el),
            expected: 'ページ内の開始位置 0px',
            saw: rem.toFixed(1) + 'px（' + pageOf(s) + 'ページ目の途中）',
          });
        }
      }
    } else {
      // 横組み：1ページ＝段組みの1段。どの要素も段の左端から始まるので、横の位置では判定できない。
      // 「ページの頭」は段の上端、「ページをまたぐ」は箱が複数の段に分かれていること
      const fr = flow.getBoundingClientRect();
      const pageNo = (r) => Math.floor(((r.left - ref.left) / z + TOL) / w) + 1;
      for (const el of figures) {
        const rects = [...el.getClientRects()].filter((r) => r.width && r.height);
        const r0 = rects[0];
        if (!r0) continue;
        const last = rects[rects.length - 1];
        const over = (last.bottom - fr.bottom) / z;
        if (rects.length > 1 || over > TOL) {
          out.push({
            rule: '図版がページの境目をまたがない',
            what: label(el),
            expected: '1つのページ（段）に収まる',
            saw: rects.length > 1
              ? rects.length + 'つの段に分割（' + pageNo(r0) + 'ページ目から' + pageNo(last) + 'ページ目へ）'
              : 'ページの下端を ' + over.toFixed(1) + 'px 超過（' + pageNo(r0) + 'ページ目）',
          });
        }
      }
      // 章見出しには自前の上余白があるので、上端ぴったりにはならない。
      // 「前の章の文字が1行でも入る隙間があるか」を、本文の行送りを物差しにして判定する
      const adv = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--line-adv')) || 20;
      for (const el of chapters) {
        const r0 = [...el.getClientRects()].find((r) => r.width && r.height);
        if (!r0) continue;
        const top = (r0.top - fr.top) / z;
        if (top >= adv - TOL) {
          out.push({
            rule: '章はページの頭から始まる',
            what: chapterName(el),
            expected: 'ページ上端からの位置 < 1行（' + adv + 'px）',
            saw: top.toFixed(1) + 'px（' + pageNo(r0) + 'ページ目の途中）',
          });
        }
      }
    }
    return out;
  }, TOL);
} catch (e) {
  console.error('[verify FATAL] ' + e.message);
  await browser.close();
  process.exit(1);
}
await browser.close();

// 失敗は EXPECTED と SAW の対で出す。エージェントがそのまま修正の手がかりにできるように
for (const e of errors) console.error('[browser] ' + e);
for (const f of failures) {
  console.error('[layout] ' + f.rule + ' — ' + f.what);
  console.error('  EXPECTED: ' + f.expected);
  console.error('  SAW:      ' + f.saw);
}
if (errors.length || failures.length) {
  console.error('[verify FAILED] browser errors: ' + errors.length + ', layout violations: ' + failures.length);
  process.exit(1);
}
console.log('[verify PASSED] 0 errors, 0 layout violations. 補助のスクリーンショット: ' + SHOT);
process.exit(0);
