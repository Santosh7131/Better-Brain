# better-brain

**Give your AI a persistent, shared "second brain" — one vault, any assistant.**

`better-brain` scaffolds an Obsidian vault of Markdown notes with a freshness-aware memory
protocol, in a layout that fits how you work (10 persona presets), and wires your AI
assistants — **Claude Code, Codex, Cursor, Windsurf, Cline, or anything MCP-aware** — to read
and write that same brain. Stop re-explaining yourself to a blank slate every session.

It's plain Markdown. Obsidian is just a nice graph viewer; your AI reads the notes with or
without it.

> **Status:** pre-1.0, built in the open. Not on npm yet — install from source (below); the
> `npx better-brain …` one-liner lands when it's published.

## Quick start

```bash
git clone https://github.com/Santosh7131/Better-Brain
cd Better-Brain
node bin/cli.js init          # → npx better-brain init, once published
```

`init` picks a preset, scaffolds the vault, wires your AI, and sets up Obsidian — and it
**never overwrites anything you already have.**

Then, in any project you want to give memory:

```bash
node bin/cli.js connect --agents claude-code,cursor    # or --all
```

## Presets

Every preset shares the same protocol and the same anchors (`00-identity/`, `templates/`,
`99-inbox/`); only the numbered domains and note types differ.

| Preset | For |
|---|---|
| `generic` | The all-rounder (default) — projects / areas / knowledge / reference / people |
| `developer` | Repos, code patterns, systems, TILs, ADRs |
| `researcher` | Literature → concepts → experiments → writing |
| `creator` | Ideas → drafts → research → published → audience |
| `founder` | Strategy, product, GTM, customers, team |
| `student` | Courses, notes, assignments, exams |
| `freelancer` | Clients, projects, pipeline, finance, playbooks |
| `pm` | Discovery, feedback, roadmap, specs, market |
| `marketer` | Campaigns, content, channels, assets, analytics |
| `educator` | Courses, lessons, students, assessments |

```bash
node bin/cli.js presets                 # list them
node bin/cli.js init --preset developer # use one
```

## Connect any AI

`connect` writes a small, fenced connection block into the rule file each agent reads. Two
open standards plus a handful of native files cover almost everything:

| Agent | File it writes |
|---|---|
| Claude Code | `CLAUDE.md` |
| Codex (and OpenCode — shared standard) | `AGENTS.md` |
| Cursor | `.cursor/rules/better-brain.md` |
| Windsurf | `.windsurfrules` |
| Cline | `.clinerules` |
| **Anything MCP-aware** | the MCP server → `node bin/cli.js mcp` |

The MCP server exposes `list_notes`, `read_note`, `search_notes`, and `write_note`, so any
MCP client (Claude Desktop, Cursor, ChatGPT desktop…) can use the brain with no native file.

## The protocol (why it isn't just a notes folder)

`00-identity/memory-protocol.md` encodes the rules that keep a long-lived brain trustworthy:

- **Volatility.** Every note is `stable` or `volatile`. *A volatile fact is a hint about where
  to look, never a fact to assert* — sessions re-check it before repeating it.
- **Freshness dates.** `updated` bumps on every edit; `verified` only when facts were actually
  re-checked against reality.
- **The `public:` flag.** Notes are private by default; only `public: true` may feed anything
  the world sees. The gate that stops private material leaking.
- **Two-tier memory.** The vault holds cross-project knowledge; per-project detail stays in the
  AI client's own memory (e.g. Claude Code's `~/.claude/projects/<slug>/memory/`).

## Commands

| Command | What it does |
|---|---|
| `init` | Pick a preset, scaffold the vault, wire your AI, set up Obsidian |
| `presets` | List the available layouts |
| `connect [path]` | Wire a project to the brain (`--agents <list>` or `--all`) |
| `mcp` | Run the MCP server so any MCP-aware AI can use the brain |
| `doctor` | Check the brain, wiring, and Obsidian are in place |

Flags: `--preset <id>`, `--vault <path>`, `--name <name>`, `--agents <list>`, `--all`,
`-y/--yes`, `-h/--help`, `-v/--version`.

## Safety

- **Non-destructive** — template files are written only if absent; re-running is idempotent.
- **Off by default** — no project reads the brain until you `connect` it.
- **No secrets** — the protocol forbids tokens, keys, or passwords in the vault.
- **Reversible** — everything injected is fenced by `<!-- better-brain:start -->` /
  `<!-- better-brain:end -->` markers, so you can find and remove it by hand.

## Requirements

- **Node.js 18+.**
- **Obsidian** — optional; auto-installed on request, or from [obsidian.md](https://obsidian.md/download).
- The `mcp` command uses `@modelcontextprotocol/sdk` (a normal dependency, loaded only for that
  command); every other command is dependency-free.

## Development

```bash
npm install     # only needed for the MCP command / tests
npm test        # node:test — notes, adapters, and an MCP integration test
```

## Roadmap

A desktop-app installer (Electron) with preset cards and a custom-structure builder, and
optional toolkit modules layered on top.

## License

MIT.
