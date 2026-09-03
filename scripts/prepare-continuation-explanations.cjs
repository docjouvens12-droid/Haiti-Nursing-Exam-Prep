#!/usr/bin/env node
// Offline validation and guarded SQL generation; never connects to a database.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const dir = path.join(__dirname, '../docs/answer-explanation-batches/2026-09-03-continuation');
const originals = [0,1000,2000,3000,4000,5000,6000].flatMap(n => JSON.parse(fs.readFileSync(path.join(dir, 'originals-'+n+'.json'), 'utf8')));
const rules = JSON.parse(fs.readFileSync(path.join(dir, 'rules.json'), 'utf8'));
const updates = [];
for (const r of originals) {
  const matches = rules.filter(s => s.explanations.includes(r.explication));
  assert(matches.length <= 1, 'Ambiguous rule '+r.id);
  if (!matches.length) continue;
  const s = matches[0], options = {};
  for (const l of ['A','B','C','D']) {
    options[l] = s.map[r['option_'+l.toLowerCase()]];
    assert.equal(typeof options[l], 'string', 'Missing rationale '+r.id+' '+l);
    assert(options[l].trim().length > 15);
  }
  assert.equal(options[r.bonne_reponse], s.map[s.correct], 'Key mismatch '+r.id);
  assert.equal(Object.values(options).filter(v => v === s.map[s.correct]).length, 1);
  updates.push({...r, new_explication: JSON.stringify({format:'answer-explanation-v1',general:r.explication,options,takeaway:s.takeaway,references:s.references,batch:'2026-09-03-continuation'})});
}
assert.equal(new Set(updates.map(r=>r.id)).size, updates.length);
assert.equal(updates.length, 6008);
if (process.argv[2] === '--sql') {
  const offset = Number(process.argv[3]), limit = Number(process.argv[4] || 250);
  assert(Number.isSafeInteger(offset) && offset >= 0 && Number.isSafeInteger(limit) && limit > 0 && limit <= 500);
  const rows = updates.slice(offset, offset+limit);
  assert(rows.length > 0);
  const literal = JSON.stringify(rows).replaceAll("'", "''");
  console.log(`DO $batch$
DECLARE changed integer;
BEGIN
UPDATE public.questions q SET explication = b.new_explication
FROM jsonb_to_recordset('${literal}'::jsonb) AS b(id uuid,question text,option_a text,option_b text,option_c text,option_d text,bonne_reponse text,explication text,new_explication text)
WHERE q.id=b.id AND q.question IS NOT DISTINCT FROM b.question
AND q.option_a IS NOT DISTINCT FROM b.option_a AND q.option_b IS NOT DISTINCT FROM b.option_b
AND q.option_c IS NOT DISTINCT FROM b.option_c AND q.option_d IS NOT DISTINCT FROM b.option_d
AND q.bonne_reponse IS NOT DISTINCT FROM b.bonne_reponse
AND q.explication IS NOT DISTINCT FROM b.explication;
GET DIAGNOSTICS changed = ROW_COUNT;
IF changed <> ${rows.length} THEN RAISE EXCEPTION 'Concurrent change: expected %, got %', ${rows.length}, changed; END IF;
END $batch$;`);
} else {
 console.log(JSON.stringify({originals: originals.length, ready:updates.length, deferred:originals.length-updates.length, uniqueIDs:true, optionMapping:true, keysPreserved:true}));
}
