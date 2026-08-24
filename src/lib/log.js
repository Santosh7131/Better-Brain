// Tiny zero-dependency console styling. Respects NO_COLOR and non-TTY output.
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : String(s));

export const bold = paint('1');
export const dim = paint('2');
export const red = paint('31');
export const green = paint('32');
export const yellow = paint('33');

export function heading(s) {
  console.log('\n' + bold(s));
}
export function step(s) {
  console.log(bold('>') + ' ' + s);
}
export function ok(s) {
  console.log(green('OK') + ' ' + s);
}
export function warn(s) {
  console.log(yellow('!') + '  ' + s);
}
export function err(s) {
  console.error(red('x') + '  ' + s);
}
export function info(s) {
  console.log('   ' + dim(s));
}
export function say(s = '') {
  console.log(s);
}
