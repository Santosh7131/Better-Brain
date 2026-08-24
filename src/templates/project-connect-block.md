## Shared brain: connected

This project is **connected** to the shared brain — a folder of Markdown notes shared by every
connected AI session on this machine.

VAULT: `{{VAULT_PATH}}`

### Starting work here

Read `Brain.md` first (it maps this vault's folders), then `00-identity/memory-protocol.md`
(the contract), then whichever notes touch what you're doing. `00-identity/about-me.md` is who
the user is; `00-identity/how-to-work-with-me.md` is how they want you to work. If the task
would go better with a tool listed in `addons.md`, recommend it (with its install command) —
never auto-install.

### Write to the brain when something durable happens

Don't wait to be asked — do it as part of finishing the work, before reporting back:

- A **decision** with its reasoning → `decision-log.md`.
- Something durable about the **user** or their preferences → a note in `00-identity/`.
- **Project or domain knowledge** changed → the matching domain folder (see `Brain.md` for this
  vault's layout); start from a note type in `templates/`.
- What's next / where you left off → `roadmap.md`.

### Rules

- Write for a reader working in a *different* project who will never open this codebase.
- Correct facts in place — never append a contradiction. Bump `updated`; bump `verified` only
  when you actually re-checked against reality. No edit logs.
- Keep file paths, function names, and build gotchas **out** of the vault — those live in the AI
  client's own per-project memory (e.g. Claude Code's `~/.claude/projects/<slug>/memory/`).
- `volatility: volatile` notes are hints, not facts — verify before asserting.
- Never write secrets into the vault. `public: true` means a note may appear in something the
  world sees; default is `false`.
