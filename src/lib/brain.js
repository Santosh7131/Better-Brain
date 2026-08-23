import { anchors } from './presets.js';

// Generate Brain.md (the index note) for a given preset. The domain table is
// built from the preset's domains plus the shared anchors.
export function renderBrain(preset, tokens = {}) {
  const date = tokens.DATE || '';
  const A = anchors();
  const descOf = (dir, fallback) => {
    const a = A.find((x) => x.dir === dir);
    return a ? a.desc : fallback;
  };

  const rows = [['00-identity/', descOf('00-identity', 'who you are, how the AI works with you, the protocol')]];
  for (const d of preset.domains) rows.push([d.dir + '/', d.desc]);
  rows.push(['templates/', descOf('templates', 'one starter note per type')]);
  rows.push(['99-inbox/', descOf('99-inbox', 'unfiled capture')]);

  const L = [
    '---',
    'title: Brain',
    'type: index',
    'volatility: stable',
    'preset: ' + preset.id,
    'updated: ' + date,
    '---',
    '',
    '# Brain',
    '',
    'Shared memory for every connected AI session on this machine. Plain Markdown — readable by',
    'you, writable by any connected session, viewable as a graph in Obsidian. This vault uses the',
    '**' + preset.label + '** layout.',
    '',
    '## Start here',
    '',
    '- [[about-me]] — who you are. Facts, background, contacts.',
    '- [[how-to-work-with-me]] — how the AI should behave. Rules and taste.',
    '- [[memory-protocol]] — **how sessions read and update this brain, and how staleness is handled.**',
    '- [[who-can-write-here]] — which projects are connected. Default is off, everywhere.',
    '',
    '## Domains',
    '',
    '| Folder | What lives there |',
    '| --- | --- |',
  ];
  for (const [dir, d] of rows) L.push('| `' + dir + '` | ' + d + ' |');
  L.push('');
  L.push('`decision-log.md` and `roadmap.md` sit at the root next to this file.');
  L.push('');
  L.push('## Maps');
  L.push('');
  L.push('- [[decision-log]] — dated decisions with rationale');
  L.push("- [[roadmap]] — what's next / where we left off");
  L.push('');
  L.push('## How this fits together');
  L.push('');
  L.push("Per-project detail stays in each project's own AI memory (e.g. Claude Code's");
  L.push('`~/.claude/projects/<slug>/memory/`), which loads automatically in that directory. This');
  L.push("vault holds what those can't share: your identity, cross-cutting decisions, and an index.");
  L.push('');
  return L.join('\n');
}

// A short "where were we / what's next" note, shared across presets.
export function renderRoadmap(tokens = {}) {
  return [
    '---',
    'title: Roadmap',
    'type: index',
    'volatility: volatile',
    'updated: ' + (tokens.DATE || ''),
    '---',
    '',
    '# Roadmap',
    '',
    'What\'s next and where you left off — the note a session reads to answer "where were we?".',
    'Keep it short: current priorities and the immediate next steps.',
    '',
    '## Now',
    '',
    '- ',
    '',
    '## Next',
    '',
    '- ',
    '',
    '## Related',
    '',
    '[[Brain]] · [[decision-log]]',
    '',
  ].join('\n');
}

// A starter template for one note type (goes in templates/<type>.md).
export function renderNoteTemplate(type, tokens = {}) {
  const date = tokens.DATE || '';
  return [
    '---',
    'title: "<' + type + ' title>"',
    'type: ' + type,
    'volatility: volatile',
    'public: false',
    'updated: ' + date,
    'verified: ' + date,
    '---',
    '',
    '# <' + type + ' title>',
    '',
    '> Starter template for a `' + type + '` note. Copy it, rename the file, and fill it in',
    '> (then delete this line). Write it so a session in a different project could still follow it.',
    '',
  ].join('\n');
}
