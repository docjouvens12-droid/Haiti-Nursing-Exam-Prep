const assert = require('node:assert/strict');
const fs = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const exportsObject = {};
const js = stripTypeScriptTypes(fs.readFileSync('lib/answer-explanation.ts','utf8')).replace(/export /g, '') + '\nexports.parseExplanation = parseExplanation; exports.explanationFromForm = explanationFromForm;';
vm.runInNewContext(js, { exports: exportsObject });
const {parseExplanation, explanationFromForm} = exportsObject;
assert.equal(parseExplanation('Corrigé original').general, 'Corrigé original');
assert.equal(parseExplanation(null).general, '');
assert.equal(parseExplanation('{invalide').general, '{invalide');
assert.equal(parseExplanation('{"autre":true}').general, '{"autre":true}');
const form = new FormData();
form.set('explication','Général'); form.set('explication_B','Pourquoi B est incorrect'); form.set('explication_A','Pourquoi A est correct'); form.set('explication_retenir','Leçon');
const parsed = parseExplanation(explanationFromForm(form));
assert.equal(parsed.options.B,'Pourquoi B est incorrect'); assert.equal(parsed.options.A,'Pourquoi A est correct'); assert.equal(parsed.takeaway,'Leçon');
const legacy = new FormData(); legacy.set('explication','Ancien corrigé'); assert.equal(explanationFromForm(legacy),'Ancien corrigé');
assert.equal(explanationFromForm(new FormData()), null);
for (const path of ['components/QuestionInteractive.tsx','components/QuestionInteractiveAvancee.tsx']) {
  const source = fs.readFileSync(path,'utf8'); assert(source.includes('valide')); assert(source.includes('<AnswerExplanation question={q} selected={choix} />'));
}
assert(!fs.readFileSync('components/ExamenInteractif.tsx','utf8').includes('AnswerExplanation'));
const results = fs.readFileSync('app/resultats/[id]/page.tsx','utf8');
assert(results.includes('if (!session.completed_at)')); assert(results.includes('.eq("user_id", userId)'));
console.log('Explications : format historique, A–D, champ vide, données invalides et intégrations vérifiés.');
