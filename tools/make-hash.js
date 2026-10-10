/* Generează hash-ul SHA-256 pentru un răspuns, ca să-l poți pune în script.js.
 *
 * Folosire:
 *   node tools/make-hash.js "pantaloni" "pantalonii"
 *
 * Afișează linia de hash-uri pe care o lipești în câmpul `answers` al ghicitorii.
 * Normalizarea trebuie să fie IDENTICĂ cu cea din script.js.
 */
const crypto = require('crypto');

function normalize(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/,/g, '.')
    .replace(/[^a-z0-9.]/g, '');
}

const inputs = process.argv.slice(2);

if (!inputs.length) {
  console.error('Dă-mi cel puțin un răspuns, ex: node tools/make-hash.js "minge" "mingea"');
  process.exit(1);
}

const normalized = [...new Set(inputs.map(normalize))].filter(Boolean);

if (!normalized.length) {
  console.error('Răspunsurile date devin goale după normalizare (doar simboluri?).');
  process.exit(1);
}

const hashes = normalized.map((n) =>
  crypto.createHash('sha256').update(n, 'utf8').digest('hex')
);

console.log('\nRăspunsuri normalizate: ' + normalized.join(' | '));
console.log('\nLipește asta ca `answers` în script.js:\n');
console.log('answers: [');
console.log(hashes.map((h) => "  '" + h + "'").join(',\n'));
console.log(']');
console.log('');
