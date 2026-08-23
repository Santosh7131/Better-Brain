// Renderer: talks to the engine only via window.brain (see preload.cjs).
// Functional scaffold — styling/UX is a later, render-and-review pass.
// DOM built with createElement/textContent (no innerHTML) to avoid injection.
const $ = (id) => document.getElementById(id);
let selectedPreset = null;

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  for (const c of children) node.append(c);
  return node;
}

async function boot() {
  const presets = await window.brain.presets();
  const box = $('presets');
  for (const p of presets) {
    const card = el(
      'div',
      { className: 'card' + (p.default ? ' sel' : '') },
      el('b', { textContent: p.label }),
      el('small', { textContent: p.domains.join(' · ') })
    );
    card.onclick = () => {
      selectedPreset = p.id;
      [...box.children].forEach((c) => c.classList.remove('sel'));
      card.classList.add('sel');
    };
    if (p.default) selectedPreset = p.id;
    box.appendChild(card);
  }

  const adapters = await window.brain.adapters();
  const ag = $('agents');
  for (const a of adapters) {
    const cb = el('input', { type: 'checkbox', value: a.id, checked: a.id === 'claude-code' });
    ag.appendChild(el('label', {}, cb, ' ' + a.label));
  }
}

$('browse-vault').onclick = async () => {
  const dir = await window.brain.pickFolder();
  if (dir) $('vault').value = dir;
};
$('browse-project').onclick = async () => {
  const dir = await window.brain.pickFolder();
  if (dir) $('project').value = dir;
};

$('install').onclick = async () => {
  const vault = $('vault').value.trim();
  if (!vault) return ($('install-out').textContent = 'Pick a vault location first.');
  $('install-out').textContent = 'Working…';
  try {
    const r = await window.brain.install({ vault, name: $('name').value.trim(), presetId: selectedPreset });
    $('install-out').textContent = `Created "${r.preset}" brain — ${r.filesWritten} files.\nWired contract: ${r.contract}`;
  } catch (e) {
    $('install-out').textContent = 'Error: ' + (e && e.message ? e.message : e);
  }
};

$('connect').onclick = async () => {
  const projectDir = $('project').value.trim();
  const vault = $('vault').value.trim();
  if (!projectDir || !vault) return ($('connect-out').textContent = 'Need both a project folder and the vault location.');
  const agents = [...document.querySelectorAll('#agents input:checked')].map((c) => c.value);
  if (!agents.length) return ($('connect-out').textContent = 'Pick at least one agent.');
  $('connect-out').textContent = 'Working…';
  try {
    const r = await window.brain.connectProject({ projectDir, vault, agents });
    $('connect-out').textContent = r.results
      .map((x) => `${x.label}: ${x.created ? 'created' : x.changed ? 'updated' : 'already connected'} (${x.file})`)
      .join('\n');
  } catch (e) {
    $('connect-out').textContent = 'Error: ' + (e && e.message ? e.message : e);
  }
};

boot();
