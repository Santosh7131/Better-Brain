import readline from 'node:readline';

// When true (set by --yes), prompts resolve to their defaults without asking.
let autoYes = false;
export function setAutoYes(v) {
  autoYes = v;
}

function makeRl() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

export async function ask(question, def = '') {
  if (autoYes) return def;
  const rl = makeRl();
  try {
    const suffix = def ? ` (${def})` : '';
    const answer = await new Promise((res) => rl.question(`${question}${suffix} `, res));
    return answer.trim() || def;
  } finally {
    rl.close();
  }
}

export async function confirm(question, def = true) {
  if (autoYes) return def;
  const hint = def ? 'Y/n' : 'y/N';
  const rl = makeRl();
  try {
    const answer = await new Promise((res) => rl.question(`${question} (${hint}) `, res));
    const a = answer.trim().toLowerCase();
    if (!a) return def;
    return a === 'y' || a === 'yes';
  } finally {
    rl.close();
  }
}
