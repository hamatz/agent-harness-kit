# agent-harness-kit

**Redefining Software Engineering for the Age of Autonomous AI Agents** — a paper, and a starter kit you can use as-is.

When AI agents write your code, move the basis of trust from "how smart the model is" to "how strict the verification is". This repository collects the ideas behind that shift in a paper — the three layers of Harness, Loop and Graph, memoryless review, and a self-learning loop that promotes failures into regression immunity tests — together with templates and verification code that actually runs.

> 日本語版は [README.md](README.md) です。The Japanese versions of this README and of the paper are canonical; the English versions are translations.

## What's inside

| Path | Contents |
| --- | --- |
| [`docs/paper.en.md`](docs/paper.en.md) | The paper (English translation) |
| [`docs/paper.md`](docs/paper.md) | The paper (Japanese, canonical) |
| [`kit/`](kit/) | Templates to copy into your own repository |
| [`examples/compositor/`](examples/compositor/) | Compositor, the typesetting tool from the paper's case study, with its full set of checks |

The templates in `kit/` and the code in `examples/` are commented in Japanese.

## Try it in 5 minutes

See for yourself, in real failure output, what it means to decide based on "what the machine measured" rather than "the AI said it fixed it".

```sh
npm ci
npx playwright install --with-deps chromium
npm run demo
```

The demo deliberately breaks one part of the typesetting tool (imagine an AI breaking it in passing while fixing something else) and checks the book in 8 combinations: 4 page sizes × vertical and horizontal writing. Only the 4 broken combinations fail, each with what was expected and what was observed (EXPECTED / SAW). The unbroken tool passes all 8.

## What's in `kit/`

| File | Role |
| --- | --- |
| `AGENTS.md` | Instructions for the agent. Contains only an index of what the machine enforces, plus the residue of norms that cannot be mechanized |
| `SPEC.md` | Specification and invariants. A human always reads and approves it |
| `PLAN.md` | Progress of the work. State lives here, not in conversation logs |
| `PROMPTS.md` / `PROMPTS.en.md` | Example messages to give the agent at each stage, from brainstorming the idea to the first merge (with and without EGM) |
| `LESSONS.md` | A record of failures, down to where the fix was placed (Rung) and confirmation that the guard fires (Proof) |
| `tests/verify_ui.mjs` | A generic UI check. Judges browser errors (console errors, uncaught exceptions, failed loads) by exit code. For the correctness of the screen itself, add conditions your project can measure (for a typesetting example, see `examples/compositor/tests/verify_layout.mjs`) |
| `.github/workflows/verify.yml` | The required check that becomes a merge condition |
| `.github/CODEOWNERS` | Requires human approval for changes to tests, gates and the specification |
| `.env.example` / `.gitignore` | Templates for keeping real secrets out of the working area |

## Setting it up

Example messages to give the agent at each stage are in [`kit/PROMPTS.en.md`](kit/PROMPTS.en.md).

### Starting from a vague idea

These steps start from a state where not a single line of code exists yet. The key is to **put the walls up before letting the agent write the implementation**.

1. **Prepare the repository** — Copy the contents of `kit/` into a new repository, replace `@your-team` in `.github/CODEOWNERS` with yourself (or your team), and push.
2. **Give the agent its own credentials** — Have the agent work under a separate account or a GitHub App, without permission to change repository settings, rulesets or workflows. GitHub does not let you approve your own pull requests, so if the agent works under your account, code-owner approval stops meaning anything.
3. **Configure the first stage of the ruleset** — Block direct pushes to the default branch so that pull requests are required, and require code-owner review. Allow no one to bypass it (administrators included).
4. **Shape the idea** ([PROMPTS 1](kit/PROMPTS.en.md#1-shape-the-idea)) — With the [EGM plugin](https://github.com/google/elephant-goldfish-model), go through `egm-brainstorm` → `egm-draft` → `egm-review` → `egm-resolve`, and put the approved design document in `docs/designs/`. Without it, brainstorm with a design session that writes no code, write the result up as a design document, and have a different session review it.
5. **Derive the specification and acceptance tests** ([PROMPTS 2](kit/PROMPTS.en.md#2-derive-the-specification-and-acceptance-tests)) — Have the agent create `SPEC.md` and acceptance tests (all Red at this point) from the design document, and replace the commands in `verify.yml` with those for the chosen technology stack. A human reads `SPEC.md` and the tests before merging.
6. **Configure the second stage of the ruleset** — Once `verify` has passed, add it to the required status checks. The walls are now complete.
7. **Break the work down and run the cycle** ([PROMPTS 3–6](kit/PROMPTS.en.md#3-break-the-work-down)) — Split `PLAN.md` into steps, have a new session implement one step at a time, and have a different new session review only the diff. For defects, have the agent write a reproduction test before fixing.

### Adding it to an existing repository

1. Copy the contents of `kit/` to the root of the repository. If an `AGENTS.md` already exists, merge it into the Part 1 / Part 2 structure.
2. Write `SPEC.md` starting from the existing behavior you can't afford to break. With EGM, it is easier to first generate design documents for the existing code with `egm-bootstrap` and extract from them.
3. Replace the commands in `verify.yml` with your project's (CI will fail until you do). Trim Part 2 of `AGENTS.md` to fit your project (keep it within 20–30 lines).
4. As in steps 2, 3 and 6 above, separate the credentials and configure the ruleset. **Until you do, none of these files is a "wall".**
5. The first step: the next time you fix a defect, use [PROMPTS 6](kit/PROMPTS.en.md#6-fix-a-defect). Have the agent write a reproduction test before fixing, and watch it fail before letting it fix the defect.

### Checklist after setup

Placing the files enforces nothing. Only when all of the following hold do they become "walls" that neither AI nor humans can break through.

- [ ] The `verify` workflow succeeds on the default branch
- [ ] A ruleset makes `verify` a required status check
- [ ] A ruleset requires code-owner review
- [ ] No one is allowed to bypass the ruleset (administrators included)
- [ ] The agent works under a separate account or a GitHub App, not the human's
- [ ] The credentials the agent uses (tokens or GitHub Apps) have no permission to change repository settings, rulesets or workflows
- [ ] No real `.env` or keys exist in the agent's working environment (`.gitignore` only prevents accidental commits; it does not prevent reading)
- [ ] The first regression immunity test was added only after confirming it fails against a deliberately broken version

**Notes**
- gitleaks-action needs a free license key (`GITLEAKS_LICENSE`) for repositories owned by organization accounts. It is not needed for personal accounts.
- `AGENTS.md` is a common location read by many agent tools. For tools that read their own file names (`GEMINI.md`, `CLAUDE.md` and so on), have that file refer to `AGENTS.md`.

## What this kit guarantees, and what it doesn't

Provided the checklist above is satisfied:

**It guarantees that**
- No change that fails the required checks gets merged, whoever made it
- Changes to tests, gates and the specification need human approval
- The agent cannot read secrets that do not exist in its working environment
- In the typesetting example, figures and tables crossing page boundaries, broken chapter page breaks and subheadings stranded at the bottom of a page are detected across all 8 combinations of page size × writing direction (page breaks in print are not covered)

**It does not guarantee**
- The correctness of anything the tests don't measure. Errors in the specification itself, authorization loopholes, performance regressions, unknown attacks and so on can remain even when the tests pass
- The thoroughness of the tests themselves. Weak tests pass weakly (compensate with mutation testing and with checks against deliberately broken versions)
- Protection against people or agents with permission to change the settings
- Local pre-commit hooks and deny settings in agent tools are useful as early warnings, but they can be bypassed, so they are not walls

For areas where a mistake does serious damage — authentication, payments, data deletion and the like — the assumption is that a human reads the diff in addition to the tests (Section 1.2 of the paper).

## Relationship to the Elephant-Goldfish Model (EGM)

This kit covers a different stage from Google's [Elephant-Goldfish Model](https://github.com/google/elephant-goldfish-model) plugin, and is designed to be used alongside it.

| Stage | Covered by |
| --- | --- |
| Concept and design (brainstorming, drafting design documents, memoryless review, human approval, reporting drift between design documents and code) | **EGM** |
| From design to specification | Derive `SPEC.md` from the approved design document (`docs/designs/`) |
| Implementation and verification (walls around the working area, judgment by exit code, diff review, code-owner approval) | **This kit** |
| Learning and organization (promotion to regression immunity tests, evidence-based pruning, rollout across the organization) | **This kit** |

EGM's Goldfish review design documents (and the source code they refer to), not the diffs of changes. EGM also has no enforcement through tests or permissions, so the part that "measures whether it's fixed" is covered by this kit. See Section 3.5 of the paper for details.

## The verification code is itself verified

This repository's CI (`npm test`) builds deliberately broken versions of the typesetting tool every time, and confirms that the checks fail **only the combinations that correspond to the broken part**.

| Tool run | Vertical (4 page sizes) | Horizontal (4 page sizes) |
| --- | --- | --- |
| Compositor itself | 4/4 pass | 4/4 pass |
| Version with vertical page alignment disabled | 0/4 | 4/4 pass |
| Version with horizontal chapter page breaks removed | 4/4 pass | 0/4 |
| Version with code figures taller than a page | 4/4 pass | 0/4 |
| Version that does not push tables and subheadings to the next page (vertical) | 0/4 | 4/4 pass |
| Version that does not push tables and subheadings to the next page (horizontal) | 4/4 pass | 0/4 |

A check that fails everything and a check that looks at nothing are both caught here. The background is in Appendices 5 and 6 of the paper.

`npm test` also checks that the English translation of the paper has not drifted from the Japanese original: headings, tables, code, the skeletons of the diagrams, links and numbers must match.

## Compositor

[`examples/compositor/compositor.html`](examples/compositor/compositor.html) is a long-form writing and typesetting tool that works just by opening it in a browser (vertical and horizontal writing, A4/B5/A5/A6 page sizes, paged view in paper mode, footnotes, images, charts). Data is saved in the browser (IndexedDB) and can be exported as Markdown, one file per chapter, for management with git. The tool's interface is in Japanese. See [`examples/compositor/README.md`](examples/compositor/README.md) for details.

## License

[Apache License 2.0](LICENSE). The paper (`docs/`) is provided under the same license.

The paper refers to and cites the following.

- Google, *Elephant-Goldfish Model* (github.com/google/elephant-goldfish-model)
- m4lka ([@m4lkxx](https://x.com/m4lkxx)), *Harness, Loops, Graphs: What Each Layer Fixes and What It Breaks* — the Level 0–7 table in Chapter 4 translates and summarizes the stages from this article.
- Arcos ([@0xarcos](https://x.com/0xarcos)), *Harness Engineering: How to Build AI Agents That Never Make the Same Mistake Twice* — the "half-life of a fix" ladder and evidence-based pruning in Chapter 4, and the repeat-failure rate in Chapter 1, map this article's framework onto the paper's terminology.
- The LangChain, SWE-agent, OpenAI and Vercel figures cited in Chapters 4 and 6 have each been checked against their primary sources (listed at the end of the paper).
