# Agent Harness Kit

**Build the Factory, Not Just the Software.**

**ソフトウェアを作るだけでなく、ソフトウェアを生み出す仕組みを作れ。**

自律型AIエージェント時代におけるソフトウェア工学の再定義。

本リポジトリは、検証可能で回復可能なSoftware Factoryと、その継続的な進化に関する研究成果を公開するものです。

> [English README](README.en.md) | [日本語論文](docs/paper.md) | [English Paper](docs/paper.en.md)

## なぜSoftware Factoryなのか

AIエージェントは、ソフトウェアを書く能力を大きく拡張する可能性を持っています。しかし、生成能力の向上は、品質保証能力の向上を意味しません。

必要なのは、AIを無条件に信じることではなく、その能力を引き出しながら、誤りを検出し、受け入れる変更を制御できる生産システムを設計することです。

そして、その生産システム自体が、開発経験を通じて改善されていくとしたら、私たちはどれほど大きなものを作れるようになるのでしょうか。

本研究は、そのための工学について論じます。

## Paper v2.0

**自律型AIエージェント時代におけるソフトウェア工学の再定義**

―― 個人の職人加速から、検証可能なSoftware Factoryへ

2026年11月 · @hamatz

- [日本語正本](docs/paper.md)
- [English translation](docs/paper.en.md)
- [実証資料 — Phase 74 Evidence Bundle](docs/phase74-evidence.tar.gz)

本論文はリファレンス実装の構築と事後分析に基づく、未査読の設計・実践論文です。

## 七つの設計原則

| Principle | 目的 |
|---|---|
| Canonical Path Engineering | 正しい経路を最も容易な経路にする |
| Intent-to-Contract Compilation | 人間の意図を検証可能な契約へ変換する |
| Evidence-Bound Execution | 検証した成果物と確定対象を結びつける |
| Verification of Verification | 検証機構自体を検証する |
| Recoverable Autonomy | 失敗しても安全に復旧できるようにする |
| Composable Autonomy | 自律的な作業主体を安全に統合する |
| Bounded Self-Improvement | 有限の予算と責任境界の中で改善する |

## Engineering Metabolism

**ソフトウェアを作るたびに、ソフトウェアを作る能力そのものを育てよ。**

Engineering Metabolism（工学的代謝）とは、開発経験を検証可能かつ持続的な生産能力へ変換する機構です。

Harness・Loop・Graphがある時点の生産工程を規定するのに対し、Engineering Metabolismは、その構造が時間とともにどう進化するかを規定します。

経験の記録、教訓の抽出、実行可能な制約への昇格、有効性の検証、不要となった規約の剪定を一つの改善機構として扱います。

## Reference Implementation — Auto Developer

[**Auto Developer**](https://github.com/hamatz/auto_developer)

本論文の設計原則を具体化するオープンソースのリファレンス実装です。

検証・独立査読・証跡の拘束、障害時の隔離と復旧、Spec Compiler、独立監査などを備えています。各原則の実装状況と残る課題は、論文第2.3節に記載しています。

実際にSoftware Factoryを構築・運用したい方は、Auto Developerのリポジトリを参照してください。

## Theory, Implementation, Evidence

本研究では、理論を実装し、その実装を実際の開発に利用することで得られた経験を、再び理論へ還元します。

成功だけでなく、失敗、査読による差し戻し、人間の介入、設計上の限界も研究対象とします。

公開する実証資料には、実行記録、検証・査読の証跡、隔離された変更、第三者による検証のためのスクリプトが含まれます。

## Repository Guide

| Path | 内容 |
|---|---|
| `docs/paper.md` | 論文v2.0 日本語正本 |
| `docs/paper.en.md` | 英語版 |
| `docs/phase74-evidence.tar.gz` | 実証資料 |
| `examples/compositor/` | 初期の検証機構の実証事例 |
| `scripts/` | 公開資料の検証 |

初期のスターターキットは、Auto Developerの登場に伴い現行配布から引退しました。[先行版のリポジトリ](https://github.com/hamatz/agent-harness-kit/tree/f335368d285e83f41bf1bb1738724b2e34827008)から引き続き参照できます。

## Research Status

本研究は進行中です。現時点では、提案した設計原則の一般的な優越性や、Engineering Metabolism全体の自動化・長期的効果を実証したものではありません。

今後の研究課題には、生産工程の形式検証、比較実験による評価、Engineering Metabolismの長期的な効果測定、複数のSoftware Factory間での知見の共有が含まれます。

## License

[Apache License 2.0](LICENSE)