# Compositor

ブラウザで開くだけで使える、長編の執筆・組版ツールです。論文 [`docs/paper.md`](../../docs/paper.md) の第1.4節の事例に登場するツールそのものです。

## できること

- 章ごとに書く（前付・本編・後付、章立て／草稿／完成の状態管理）
- 本文は Markdown。脚注（`^[...]` と `[^label]`）、画像（大きさ・回り込み・別丁・天）、コード図版、図表（JSON から12種類）
- 縦組み・横組み、判型 A4／B5／A5／A6
- 「紙面に合わせる」仕上げでは、判型どおりの紙面をページ送りで読める（印刷にも対応）
- 1枚の HTML として本を書き出す
- 章ごとの Markdown（`book.json`・`chapters/*.md`・`images/`）を zip で書き出し／読み込み。git で管理できる

## 使い方

`compositor.html` をブラウザで開く。データはそのブラウザの IndexedDB に保存されます。バックアップはヘッダーの書き出しボタンから取ってください。

編集画面の見た目と Markdown の処理に、次の CDN を読み込みます：Tailwind CSS（`@tailwindcss/browser`）、marked、Lucide。書き出した本は Google Fonts を読み込みます。

## 検査

| ファイル | 役割 |
| --- | --- |
| `book/` | 検査用の本（プロジェクト書き出しの形式） |
| `tests/verify_layout.mjs` | 書き出した本1冊を検査する。ブラウザのエラーに加えて、紙面モードの「図版がページの境目をまたがない」「章がページの頭から始まる」を、縦組み・横組みそれぞれの測り方で判定する |
| `tests/verify_matrix.mjs` | 本を判型4種×組方向2種の8通りで書き出し、それぞれを `verify_layout.mjs` に掛ける。書き出しはツール自身の処理に任せ、テスト側で組版を再実装しない |
| `tests/selftest.mjs` | ツールをわざと壊した版を作り、検査が壊した箇所の組み合わせだけを落とすことを確かめる（`npm test`） |
| `tests/demo.mjs` | 壊した版と壊していない版を検査して、失敗の表示を見る（`npm run demo`） |

検査の結果（書き出した本と、組み合わせごとのスクリーンショット）は `test-results/` に残ります。

自分の本で検査するには、ツールの「プロジェクト書き出し」で zip を作って展開し、そのフォルダを指定します。

```sh
node examples/compositor/tests/verify_matrix.mjs \
  --app examples/compositor/compositor.html \
  --project path/to/your-book
```
