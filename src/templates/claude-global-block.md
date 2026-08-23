## Shared brain (better-brain)

A shared "second brain" lives on this machine — a folder of Markdown notes that every
*connected* Claude Code session reads and writes.

VAULT: `{{VAULT_PATH}}`

**Default is OFF.** Do **not** read or write the vault unless the current project's own
`CLAUDE.md` explicitly says it is connected. Most projects are not. Silence means not
connected. (Run `npx better-brain connect` inside a project to connect it.)

When a project *is* connected:

- Read `Brain.md` first, then `00-identity/memory-protocol.md` — the protocol is the
  contract for how to read and write these notes. Then read whichever notes touch what
  you're working on.
- Write to the brain as part of finishing substantive work, not only when asked: a
  decision with a reason → `decision-log.md`; a durable fact about the user →
  `00-identity/`; project state changed → that project's note in `30-projects/`; an
  environment gotcha → `40-reference/machine-and-toolchains.md`.
- Notes marked `volatility: volatile` are hints about where to look, **not** facts to
  assert — verify before repeating them, and fix the note if it's stale.

Boundaries: never write secrets, tokens, or API keys into the vault. A note's `public:`
flag gates whether its content may appear in anything the world sees; default is `false`.
