// Run after npm run build. Checks coverage and preserves the existing eight rubrics.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const data = require('../lib/study-texts-data.json');
let illustrated = 0;
for (const fiche of data) {
  const html = fs.readFileSync(`.next/server/app/categories/fiche/${fiche.id}.html`, 'utf8');
  assert.equal((html.match(/<details/g) || []).length, 8, fiche.id);
  if (/anatom|physiolog/i.test(fiche.subtopic)) {
    assert(html.includes('Comprendre en images'), fiche.id);
    assert(html.indexOf('Comprendre en images') < html.indexOf('<details'), fiche.id);
    assert(html.includes('Référence pédagogique'), fiche.id);
    illustrated++;
  }
  if (fiche.topic === 'Calculs de doses') assert(html.includes('Exemple de calcul corrigé'), fiche.id);
}
assert.equal(illustrated, 11);
const heart = fs.readFileSync('.next/server/app/categories/fiche/fiche-121.html', 'utf8');
for (const label of ['Le cœur : quatre cavités', 'Le trajet du sang et les quatre valves', 'Un cycle cardiaque']) assert(heart.includes(label));
console.log(`${illustrated} anatomy/physiology pages illustrated; ${data.length} eight-section pages checked.`);
