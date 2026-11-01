/**
 * examples/compositor/tests/demo.mjs
 * 5分で試せる実験。「AIの『直しました』」ではなく「機械が測った結果」で判断するとはどういうことかを、
 * 実際の失敗表示で見る。
 *
 *   1. 組版ツールの「縦組みのページ揃え」の処理をわざと止める（AIが別の修正のついでに壊した、という想定）
 *   2. 8通りの組版検査に掛けて、どの組み合わせが、何を期待して、何が観測されて落ちたかを表示する
 *   3. 壊していないツールに掛けて、全部通ることを確かめる
 *
 * 実行: npm run demo
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
const WORK = path.resolve('test-results', 'demo');
const BREAK = ['for(var i=0;i<4;i++){ alignPages(); placeFigures(); keepTogether(); }', '/* broken for the demo */'];

const say = (s = '') => console.log(s);
const run = (app) => spawnSync(process.execPath, [MATRIX, '--app', app, '--project', BOOK], { encoding: 'utf8' });

fs.mkdirSync(WORK, { recursive: true });
const source = fs.readFileSync(APP, 'utf8');
if (source.split(BREAK[0]).length !== 2) {
  console.error('[demo] 壊す場所がツールに見つからない。ツールが変わった可能性がある');
  process.exit(2);
}
const broken = path.join(WORK, 'compositor_broken.html');
fs.writeFileSync(broken, source.replace(BREAK[0], BREAK[1]));

say('== 1. 縦組みのページ揃えを止めた版を検査する ==');
say('   （AIが「修正しました」と言ってきた、という想定です。見た目では気づきにくい崩れです）');
say();
const bad = run(broken);
let shown = 0;
for (const line of (bad.stdout + bad.stderr).split('\n')) {
  // 違反が多いので、各組み合わせの最初の2件（1件につき3行）までを表示する
  if (/^(PASS|FAIL) /.test(line) || /^\[matrix\]/.test(line)) { say(line); shown = 0; continue; }
  if (/^\s+(\[layout\]|EXPECTED|SAW)/.test(line) && shown < 6) { say(line); shown++; }
}
say(`   → exit code ${bad.status}。CI の必須チェックなら、この変更はマージできません。`);
say();
say('== 2. 壊していないツールを検査する ==');
const good = run(APP);
for (const line of good.stdout.split('\n')) if (/^(PASS|FAIL) |^\[matrix\]/.test(line)) say(line);
say(`   → exit code ${good.status}`);
say();
say('判断の根拠は「AIがそう言ったから」でも「人間が5分眺めたから」でもなく、8通りを測った結果です。');
say(`書き出した本とスクリーンショットは ${path.relative(process.cwd(), path.resolve('test-results'))}/ にあります。`);
process.exit(bad.status === 1 && good.status === 0 ? 0 : 1);
