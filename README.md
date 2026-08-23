# better-brain

**Give Claude Code a persistent, shared "second brain" — in one command.**

Every Claude Code session starts from nothing. `better-brain` sets up a small Obsidian
vault of Markdown notes — your identity, your decisions, your hard-won environment facts —
and wires Claude Code so that every *connected* project on your machine reads and writes
that same brain. Stop re-explaining yourself to a blank slate each session.

It's just Markdown. Obsidian is an optional (nice) graph viewer; Claude reads the notes
with or without it.

```bash
npx better-brain init
```

That's the whole install. No clone, no config file.

---

## What it sets up

`init` does three things, and **never overwrites anything you already have**:

1. **Scaffolds a vault** — an Obsidian-ready folder with a proven structure and a
   *memory protocol* that teaches Claude how to keep notes fresh instead of stale.
2. **Wires Claude Code** — adds a small, fenced block to your machine-wide
   `~/.claude/CLAUDE.md` describing the brain and the rule that it's **off by default**.
3. **Handles Obsidian** — detects it, or offers to install it (winget / Homebrew /
   Flatpak / Snap), falling back to the download link.

Then, in any project you want to give memory:

```bash
npx better-brain connect
```

This adds a connection block to that project's `CLAUDE.md`. From then on, Claude Code
sessions in that project read and write the shared brain.

---

## The vault

```
Second Brain/
├─ Brain.md                     # the index — every session reads this first
├─ decision-log.md              # dated decisions + the reasoning behind them
├─ 00-identity/
│  ├─ about-me.md               # who you are (fill in)
│  ├─ how-to-work-with-me.md    # how Claude should behave (fill in)
│  ├─ memory-protocol.md        # the contract: how notes are read & kept fresh
│  └─ who-can-write-here.md     # which projects are connected (off by default)
├─ 10-work/                     # job / client work
├─ 20-learning/                 # what you're studying
├─ 30-projects/                 # one note per project (+ _status-template.md)
├─ 40-reference/
│  ├─ capabilities.md           # tools other projects can reach for
│  └─ machine-and-toolchains.md # environment facts that bite
└─ 99-inbox/                    # unfiled dumps
```

## The protocol (why this isn't just a notes folder)

The heart of `better-brain` is `memory-protocol.md`, which encodes a few rules that keep a
long-lived knowledge base trustworthy:

- **Volatility.** Every note is `stable` (your name, past decisions) or `volatile` (repo
  state, URLs, "current" status). *A volatile fact is a hint about where to look, never a
  fact to assert* — sessions re-check it before repeating it.
- **Freshness dates.** `updated` bumps on every edit; `verified` bumps only when facts
  were actually re-checked against reality.
- **The `public:` flag.** Notes are private by default; only `public: true` notes may feed
  anything the world sees (like a GitHub profile). This is the gate that stops private
  material from leaking.
- **Two-tier memory.** The vault holds cross-project knowledge; per-project implementation
  detail stays in Claude Code's own `~/.claude/projects/<slug>/memory/`. The vault points
  at it, never copies it.

## Commands

| Command | What it does |
|---|---|
| `npx better-brain init` | Scaffold the vault, wire Claude Code, set up Obsidian |
| `npx better-brain connect [path]` | Connect a project (default: current directory) to the brain |
| `npx better-brain doctor` | Check that the brain, the wiring, and Obsidian are all in place |

Flags: `--vault <path>`, `--name <name>`, `-y/--yes` (accept defaults), `-h/--help`,
`-v/--version`.

## Safety

- **Non-destructive.** Template files are only written if absent; your edits are never
  clobbered. Re-running is always safe and idempotent.
- **Off by default.** No project reads the brain until you explicitly `connect` it.
- **No secrets.** The protocol forbids storing tokens, keys, or passwords in the vault.
- **Reversible.** Everything `better-brain` injects is wrapped in
  `<!-- better-brain:start -->` / `<!-- better-brain:end -->` markers, so you can find and
  remove it by hand.

## Requirements

- **Node.js 18+** (you already have it if you use Claude Code).
- **Obsidian** — optional; auto-installed on request, or grab it at
  [obsidian.md](https://obsidian.md/download). The vault works as plain Markdown without it.

## Roadmap

v1 sets up the brain itself. Planned modules (opt-in) layer your wider toolkit on top —
graph/knowledge tooling, memory search, MCP servers, and frontend skills — so a fresh
machine can be brought all the way up with the same one command.

## License

MIT.
