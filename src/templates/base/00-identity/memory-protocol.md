---
title: Memory protocol
type: identity
volatility: stable
updated: {{DATE}}
---

# Memory protocol

How every connected Claude Code session reads and updates this brain. The whole point is
that **a fact in here is only as good as its freshness**, so freshness is tracked
explicitly rather than hoped for.

## Frontmatter every note carries

```yaml
---
title: Human-readable name
type: identity | work | learning | project | reference | decision
status: active | paused | done | superseded     # for projects/work
volatility: stable | volatile                    # see below — this is the important one
public: true | false                             # may this appear in something the world sees?
updated: YYYY-MM-DD                              # last time the note was edited
verified: YYYY-MM-DD                             # last time its facts were checked against reality
---
```

## Volatility — the anti-staleness rule

Every fact is one of two kinds, and they are trusted differently.

**`volatility: stable`** — things that don't drift on their own. Your name, your
education, your preferences, why a past decision was made. Safe to rely on.

**`volatility: volatile`** — things the world changes without telling this vault. Repo
state, file paths, deployed URLs, package versions, counts, "current" status, whether
something is still installed, what a live API returns.

> **A volatile fact is a hint about where to look, never a fact to assert.**
> Re-check it before acting on it or repeating it. If it's gone stale, fix the note in
> the same breath.

This is the failure mode the whole protocol exists to prevent: a note says "project in
progress" or quotes a number, months pass, and a session writes it confidently into
something public.

## Who a note is written for

A vault note is read by a session working in a **different** project, with no access to
the codebase being described. So it has to stand on its own: what the project is, why it
exists, what state it's actually in, and any constraint that affects other people's work.
Several paragraphs, not a one-liner. The test: if a reader couldn't describe the project
to a stranger from the note alone, it isn't finished.

The corollary is that implementation detail does **not** belong here. File paths, function
and class names, hyperparameters, build gotchas — all of that lives in the project's own
`~/.claude/projects/<slug>/memory/`, which loads automatically when working in that
directory. Point at it; never copy it. A note that reads like source-code commentary is
useless to the audience it's for, and goes stale the moment the code moves.

## Writing rules

1. **Edit in place. Never append a contradiction.** If a fact changed, change that line.
   Two notes disagreeing is worse than no note.
2. **Bump `updated`** on every edit; **bump `verified`** only when you actually re-checked
   the facts against reality.
3. **No edit logs.** Don't keep a running list of your changes to a note — that's
   bookkeeping, and it grows forever without being read. If a change needs explaining,
   explain it in the body, or put the reasoning in [[decision-log]].
4. **Mark superseded facts** rather than silently deleting them when the reasoning still
   matters: `status: superseded` plus a line pointing at what replaced it. A dead end
   already explored is worth keeping so nobody retries it.
5. **Link generously** with `[[wikilinks]]`. A link to a note that doesn't exist yet is
   fine — it marks something worth writing.

## When to update

At the end of any substantive piece of work, before reporting back:
- Did you learn a durable fact about the user or their setup? → update [[about-me]] or
  [[how-to-work-with-me]].
- Did you make a decision with a reason? → add to [[decision-log]].
- Did project state change? → update that project's own note in `30-projects/` (create it
  from `_status-template` if it doesn't exist yet). One note per project.
- Did something bite that would bite again? → [[machine-and-toolchains]].

## Two conventions that make cross-project work possible

**1. The `public:` flag.** Any note describing a project carries `public: true | false`.
`true` means a session may use it in something the world sees — a GitHub profile README,
say. `false` is the default. A session building public output reads only `public: true`
notes. This is the gate that stops private material leaking into a profile.

**2. Capabilities live in [[capabilities]].** When a project becomes a *tool* other
projects should reach for — a generator, a pipeline, a scraper — add an entry there
saying what it's for, how to ask for it, and any house rules. Do **not** copy the
project's own docs into the vault; point at them. A session in an unrelated folder has no
other way to discover the capability exists.

Note there is **no session-to-session calling** — one Claude Code session cannot invoke
another. Cross-project work happens because the tools are machine-wide and the house rules
are written down. See [[capabilities]].

## What not to store

- Secrets: tokens, API keys, passwords. Ever.
- Anything private you would never want to appear in a published file.
- Things the code or git history already records — the repo is the source of truth for
  the repo. Point at it; don't copy it.
- Conversational trivia that only mattered for one session.

## Maintenance

Run a consolidation pass now and then — say monthly, or when notes start feeling crowded.
It should: find notes contradicting each other, find `volatile` notes whose `verified`
date is old, merge duplicates, create files for `[[links]]` that don't exist yet, delete
what turned out to be wrong, and strip any leftover bookkeeping sections.

Do it **on request, with the changes shown to you** — not silently on a schedule. An agent
quietly pruning a knowledge base with nobody reading the diff is how notes disappear.

## Related

[[about-me]] · [[how-to-work-with-me]] · [[Brain]]
