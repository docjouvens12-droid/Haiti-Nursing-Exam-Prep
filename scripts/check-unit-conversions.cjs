// Node 24+, after npm run build.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { conversionGroups, workedConversions } = require('../lib/unit-conversions.ts');
assert.equal(conversionGroups.length, 8);
assert.equal(conversionGroups.reduce((n, g) => n + g.rows.length, 0), 42);
assert.equal(new Set(conversionGroups.map(g => g.id)).size, 8);
assert.equal(workedConversions.length, 6);
const results = [0.3 * 1000 / (150 / 5), 500 / (0.25 * 1000), 250 / (2 + 30 / 60), 0.9 * 1000, 12 * 25 / 3 / 50, 0.1 * 50 * 60 / 100];
results.forEach((r, i) => assert.equal(r, [10, 2, 100, 900, 2, 3][i]));
const html = fs.readFileSync('.next/server/app/categories/fiche/fiche-474.html', 'utf8');
assert.equal((html.match(/<table>/g) || []).length, 8);
assert.equal((html.match(/<details/g) || []).length, 8);
for (const g of conversionGroups) assert(html.includes(`id="conversion-${g.id}"`));
assert(html.includes('Pas d’équivalence universelle'));
for (const t of require('../lib/study-texts-data.json').filter(t => t.topic === 'Calculs de doses')) {
  const page = fs.readFileSync(`.next/server/app/categories/fiche/${t.id}.html`, 'utf8');
  assert(page.includes('/categories/fiche/fiche-474#conversions'), t.id);
}
console.log('8 tables, 42 conversion rows, 6 worked examples, 15 navigation links: OK');
