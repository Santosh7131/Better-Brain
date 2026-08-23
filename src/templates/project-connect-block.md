## Shared brain: connected

This project is **connected** to the shared brain — a folder of Markdown notes shared by
every connected Claude Code session on this machine.

VAULT: `{{VAULT_PATH}}`

### Starting work here

Read `Brain.md`, then `00-identity/memory-protocol.md` (the contract), then whichever
notes touch what you're doing. `00-identity/about-me.md` is who the user is;
`00-identity/how-to-work-with-me.md` is how they want you to work.

### Write to the brain when something durable happens

Don't wait to be asked — do it as part of finishing the work, before reporting back.

| What happened | Where it goes |
|---|---|
| This project changed state — shipped, stalled, changed direction | `30-projects/<this-project>.md` (copy `30-projects/_status-template.md` if it doesn't exist) |
| A decision was made and the reasoning matters | `decision-log.md` |
| Learned something durable about the user or their preferences | `00-identity/about-me.md` or `how-to-work-with-me.md` |
| Hit an environment gotcha that will bite again | `40-reference/machine-and-toolchains.md` |
| This project became a tool other projects should reach for | `40-reference/capabilities.md` |

### Rules

- Write for a reader working in a *different* project who will never open this codebase.
- Correct facts in place — never append a contradiction. Bump `updated`; bump `verified`
  only when you actually re-checked against reality. No edit logs.
- Keep file paths, function names, and build gotchas **out** of the vault — those live in
  this project's own `~/.claude/projects/<slug>/memory/`. Point at it; never copy it.
- `volatility: volatile` notes are hints, not facts — verify before asserting.
- Never write secrets into the vault. `public: true` means a note may appear in something
  the world sees; default is `false`.
