# Agent Harness Kit

**Build the Factory, Not Just the Software.**

Redefining Software Engineering in the Age of Autonomous AI Agents.

This repository publishes research on the engineering of verifiable, recoverable, and continuously evolving software production systems — Software Factories.

> [日本語 README](README.md) | [English Paper](docs/paper.en.md) | [Japanese Paper](docs/paper.md)

## Why Software Factories?

AI agents have the potential to dramatically expand our ability to write software. Yet an increase in code generation capacity does not automatically translate into an increase in quality assurance capacity.

What we need is not unconditional trust in AI, but a production system that harnesses its capabilities while detecting errors and controlling which changes are accepted.

And if that production system could itself improve through the experience of building software, how much more could we create?

This research explores the engineering required to make that possible.

## Paper v2.0

**Redefining Software Engineering in the Age of Autonomous AI Agents**

*From AI-Assisted Craftsmanship to Verifiable Software Factories*

November 2026 · @hamatz

- [English translation](docs/paper.en.md)
- [Japanese original — canonical version](docs/paper.md)
- [Research evidence — Phase 74 Evidence Bundle](docs/phase74-evidence.tar.gz)

The paper is an independently published, non-peer-reviewed design and experience report based on the development of a reference implementation and retrospective analysis of its operation.

## Seven Engineering Principles

| Principle | Objective |
|---|---|
| **Canonical Path Engineering** | Make the right path the easiest path. |
| **Intent-to-Contract Compilation** | Transform human intent into verifiable engineering contracts. |
| **Evidence-Bound Execution** | Bind verification evidence to the exact artifact being accepted. |
| **Verification of Verification** | Verify the mechanisms that perform verification. |
| **Recoverable Autonomy** | Enable safe recovery when autonomous execution fails. |
| **Composable Autonomy** | Integrate autonomous work units within explicit responsibility boundaries. |
| **Bounded Self-Improvement** | Improve the production system within finite budgets and defined authority boundaries. |

These principles are intended to remain applicable across different models, agent tools, programming languages, and implementation architectures.

## Engineering Metabolism

**Build Software. Build the Ability to Build.**

Engineering Metabolism is the mechanism through which software development experience is transformed into verifiable and durable production capability.

While Harness, Loop, and Graph define the structure of a Software Factory at a given point in time, Engineering Metabolism defines how that structure evolves over time.

It encompasses five activities:

- **Capture** — Observe and record experience.
- **Distill** — Extract reusable engineering lessons.
- **Promote** — Translate lessons into tools, tests, types, and enforceable gates.
- **Validate** — Verify the effectiveness and side effects of improvements.
- **Prune** — Reassess and retire obsolete or redundant constraints.

The objective is not simply to give agents more knowledge. It is to turn experience into engineering capabilities that remain effective even when future agents have no memory of that experience.

Engineering Metabolism does not imply unrestricted self-improvement. Improvements themselves must remain subject to verification, authorization, budgets, and stopping conditions.

## Reference Implementation — Auto Developer

[**Auto Developer**](https://github.com/hamatz/auto_developer)

Auto Developer is the open-source reference implementation of the engineering principles presented in this paper.

Its capabilities include:

- Specification compilation through a Spec Compiler
- Separation of implementation, verification, and independent review
- Evidence-bound acceptance gates
- Failure quarantine and recovery
- Independent auditing and bounded improvement cycles
- Experimental multi-team execution

The implementation status and remaining limitations of each engineering principle are documented in Section 2.3 of the paper.

If you want to build and operate a Software Factory rather than simply study its design, start with the Auto Developer repository.

## Theory, Implementation, Evidence

Our research follows a continuous cycle: implement the theory, use the implementation in actual software development, and feed the resulting experience back into the theory.

Successes are not our only research subjects. Failures, rejected reviews, human interventions, and limitations of the production system are equally valuable.

The published evidence bundle contains execution records, verification and review evidence, quarantined changes, and scripts for checking the consistency of the published records.

The objective is to make the reported observations open to independent examination, rather than asking readers to accept them on trust alone.

## Repository Guide

| Path | Contents |
|---|---|
| [`docs/paper.md`](docs/paper.md) | Paper v2.0 — canonical Japanese version |
| [`docs/paper.en.md`](docs/paper.en.md) | English translation |
| [`docs/phase74-evidence.tar.gz`](docs/phase74-evidence.tar.gz) | Research evidence bundle |
| [`examples/compositor/`](examples/compositor/) | Early experiment in verification of verification |
| [`scripts/`](scripts/) | Validation scripts for published research materials |

### From Starter Kit to Research Repository

This project originally began as a paper accompanied by a starter kit for applying Harness Engineering practices manually.

With the emergence of Auto Developer as a dedicated reference implementation, the original starter kit has been retired from active distribution.

The original templates, prompts, and configuration examples remain available in the [historical version of this repository](https://github.com/hamatz/agent-harness-kit/tree/f335368d285e83f41bf1bb1738724b2e34827008).

The Compositor example is retained as an early practical demonstration of objective verification, deliberate defect injection, and regression prevention.

## Research Status

This is an ongoing research project.

The proposed framework does not yet establish the general superiority of its engineering principles over alternative approaches, nor does it demonstrate the full automation or long-term effectiveness of Engineering Metabolism.

Future research directions include:

- Formal verification of software production protocols
- Controlled experiments separating model improvements from factory improvements
- Longitudinal evaluation of Engineering Metabolism
- Safe composition and specialization of autonomous development teams
- Knowledge transfer and shared engineering capabilities across independent Software Factories

The long-term objective is to develop an engineering foundation for software production systems that are not only autonomous, but also verifiable, recoverable, and capable of governed evolution.

## License

[Apache License 2.0](LICENSE).

---

**Build the Factory, Not Just the Software.**

**Make the Right Path the Easiest Path.**

**Build Software. Build the Ability to Build.**