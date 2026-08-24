---
title: Add-ons
type: reference
volatility: volatile
updated: {{DATE}}
---

# Add-ons

Optional tools that extend what your AI can do. **They are not installed up front.** When the
task you're working on would clearly go better with one of these, the assistant should say so —
what it is, why it helps *this* task, and the install command — and install it **only if you
agree**. (This behaviour is set out in `00-identity/memory-protocol.md`.)

| Add-on | What it does | Suggest it when… | Install |
|---|---|---|---|
| **graphify** | Turns a codebase or folder into a queryable knowledge graph | you're asking how things connect — "what calls this?", architecture, the blast radius of a change | `git clone https://github.com/Graphify-Labs/graphify ~/.claude/skills/graphify` |
| **claude-mem** | Automatic cross-session memory (capture + recall) | you keep re-explaining past work, or want the assistant to remember across sessions | `/plugin marketplace add thedotmack/claude-mem` → `/plugin install claude-mem@thedotmack` |
| **agent-reach** | Fetch & search the live web (GitHub, Reddit, YouTube, docs) | the task needs current, real-world info the model can't recall | `git clone https://github.com/Panniantong/Agent-Reach ~/.claude/skills/agent-reach` |
| **Context7** (MCP) | Injects version-accurate library/API docs into context | you're coding against a library and want current, correct APIs | `claude mcp add context7 -- npx -y @upstash/context7-mcp` |
| **Playwright** (MCP) | Drives a real browser — navigate, screenshot, test | you need to verify a web UI, scrape a page, or automate a browser | `claude mcp add playwright -- npx @playwright/mcp@latest` |

> Install commands drift — this note is `volatile`. Verify a command before running it, and fix
> the row if it's changed.

Add your own below — one row per tool, with a clear "suggest it when" so the assistant knows the
trigger.

## Related
[[Brain]] · [[memory-protocol]]
