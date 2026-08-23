// Renderer: talks to the engine only via window.brain (see preload.cjs).
// Builds the wizard from real preset/adapter data and runs the real install.
const $ = (id) => document.getElementById(id);
const el = (t, p = {}, ...kids) => { const n = document.createElement(t); Object.assign(n, p); for (const k of kids) n.append(k); return n; };

const ANCHORS_PRE = ['00-identity'];
const ANCHORS_POST = ['templates', '99-inbox'];
const STEPNAMES = ['Welcome', 'License', 'Layout', 'Location', 'Connect', 'Options', 'Install', 'Done'];
const LAST = 7;

let PRESETS = [], AGENTS = [], preset = null, i = 0;

async function boot() {
  PRESETS = await window.brain.presets();
  AGENTS = await window.brain.adapters();
  preset = (PRESETS.find((p) => p.default) || PRESETS[0]).id;

  const pbox = $('presets');
  PRESETS.forEach((p) => {
    const radio = el('input', { type: 'radio', name: 'preset', checked: p.id === preset });
    const opt = el('label', { className: 'opt' + (p.id === preset ? ' sel' : '') },
      radio, el('span', {}, el('b', { textContent: p.label }), el('span', { className: 'd', textContent: p.description })));
    opt.onclick = () => {
      preset = p.id;
      [...pbox.children].forEach((c) => c.classList.remove('sel'));
      opt.classList.add('sel'); radio.checked = true; drawTree(p.id);
    };
    pbox.appendChild(opt);
  });
  drawTree(preset);

  const abox = $('agents');
  AGENTS.forEach((a) => {
    const cb = el('input', { type: 'checkbox', value: a.id, checked: a.id === 'claude-code' });
    abox.appendChild(el('label', { className: 'opt' },
      cb, el('span', {}, el('b', { textContent: a.label + ' ' }), el('span', { className: 'd', textContent: '→ ' + a.file }))));
  });

  $('gh').addEventListener('change', (e) => $('gh-field').classList.toggle('on', e.target.checked));
  document.querySelectorAll('input[name=lic]').forEach((r) => r.addEventListener('change', render));
  render();
}

function drawRail(cur) {
  const r = $('rail'); r.textContent = '';
  STEPNAMES.forEach((nm, idx) => {
    const n = el('span', { className: 'n', textContent: idx < cur ? '✓' : String(idx + 1) });
    r.appendChild(el('li', { className: idx < cur ? 'done' : idx === cur ? 'cur' : '' }, n, el('span', { textContent: nm })));
  });
}

function drawTree(id) {
  const p = PRESETS.find((x) => x.id === id); const box = $('tree'); box.textContent = '';
  box.appendChild(el('div', { className: 'm', textContent: 'Second Brain/' }));
  const dirs = [...ANCHORS_PRE, ...p.domains, ...ANCHORS_POST];
  dirs.forEach((f, idx) => {
    box.appendChild(el('div', {},
      el('span', { className: 'm', textContent: idx === dirs.length - 1 ? '└─ ' : '├─ ' }),
      el('span', { className: 'f', textContent: f + '/' })));
  });
}

const pages = () => [...document.querySelectorAll('[data-page]')];
const nextLabel = (n) => (n === 5 ? 'Install' : n === LAST ? 'Finish' : 'Next');

function render() {
  pages().forEach((p, n) => p.classList.toggle('on', n === i));
  drawRail(i);
  $('back').disabled = i === 0 || i === 6 || i === LAST;
  $('next').textContent = nextLabel(i);
  $('next').disabled = (i === 1 && !$('lic-yes').checked) || i === 6;
  $('cancel').textContent = i === LAST ? 'Close' : 'Cancel';
}

async function doInstall() {
  const vault = $('vault').value.trim();
  if (!vault) { i = 3; render(); $('vault').focus(); return; }
  i = 6; render();
  $('pg-label').textContent = 'Creating your brain…';
  $('pg-fill').style.width = '100%';
  const agents = [...document.querySelectorAll('#agents input:checked')].map((c) => c.value);
  try {
    const r = await window.brain.install({ vault, name: $('uname').value.trim(), presetId: preset, agents });
    const list = $('fin-list'); list.textContent = '';
    list.appendChild(el('li', { textContent: `${r.filesWritten} files written to ${vault}` }));
    if (r.wired && r.wired.length) list.appendChild(el('li', { textContent: 'Connected: ' + r.wired.join(', ') }));
    list.appendChild(el('li', { textContent: 'Contract added to ' + r.contract }));
    $('fin-line').textContent = `Your ${r.preset} brain is ready.`;
    i = 7; render();
  } catch (e) {
    $('pg-label').textContent = 'Error: ' + ((e && e.message) ? e.message : e);
    $('pg-fill').style.width = '0';
  }
}

$('next').onclick = () => { if ($('next').disabled) return; if (i === 5) { doInstall(); return; } if (i < LAST) { i++; render(); } };
$('back').onclick = () => { if (i > 0) { i = (i === LAST ? 5 : i - 1); render(); } };
$('browse').onclick = async (e) => { e.preventDefault(); const d = await window.brain.pickFolder(); if (d) $('vault').value = d; };

boot();
