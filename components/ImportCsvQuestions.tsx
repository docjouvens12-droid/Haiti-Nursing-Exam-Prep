"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const COLONNES = [
  "external_id","annee","categorie","sous_categorie","question","option_a","option_b","option_c","option_d","bonne_reponse","explication","source","authenticite","langue","difficulte","exam_session","numero_question"
] as const;

type Ligne = Record<(typeof COLONNES)[number], string>;
type QuestionInsert = {
  external_id: string;
  annee: number | null;
  categorie: string;
  sous_categorie: string | null;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  bonne_reponse: "A" | "B" | "C" | "D";
  explication: string | null;
  source: string | null;
  authenticite: "reconstitue" | "officiel_verifie" | "demonstration";
  langue: string;
  difficulte: string | null;
  exam_session: string | null;
  numero_question: number | null;
};

function parserCsv(texte: string): string[][] {
  const lignes: string[][] = [];
  let ligne: string[] = [];
  let champ = "";
  let dansGuillemets = false;

  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (c === '"') {
      if (dansGuillemets && texte[i + 1] === '"') { champ += '"'; i++; }
      else dansGuillemets = !dansGuillemets;
    } else if (c === "," && !dansGuillemets) {
      ligne.push(champ); champ = "";
    } else if ((c === "\n" || c === "\r") && !dansGuillemets) {
      if (c === "\r" && texte[i + 1] === "\n") i++;
      ligne.push(champ); champ = "";
      if (ligne.some(v => v.trim() !== "")) lignes.push(ligne);
      ligne = [];
    } else champ += c;
  }
  ligne.push(champ);
  if (ligne.some(v => v.trim() !== "")) lignes.push(ligne);
  return lignes;
}

function entierOuNull(v: string) {
  if (!v.trim()) return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

function convertir(l: Ligne): QuestionInsert {
  return {
    external_id: l.external_id.trim(),
    annee: entierOuNull(l.annee),
    categorie: l.categorie.trim(),
    sous_categorie: l.sous_categorie.trim() || null,
    question: l.question.trim(),
    option_a: l.option_a.trim(), option_b: l.option_b.trim(), option_c: l.option_c.trim(), option_d: l.option_d.trim(),
    bonne_reponse: l.bonne_reponse.trim().toUpperCase() as QuestionInsert["bonne_reponse"],
    explication: l.explication.trim() || null,
    source: l.source.trim() || null,
    authenticite: (l.authenticite.trim() || "reconstitue") as QuestionInsert["authenticite"],
    langue: l.langue.trim() || "fr",
    difficulte: l.difficulte.trim() || null,
    exam_session: l.exam_session.trim() || null,
    numero_question: entierOuNull(l.numero_question),
  };
}

export default function ImportCsvQuestions() {
  const [fichier, setFichier] = useState("");
  const [questions, setQuestions] = useState<QuestionInsert[]>([]);
  const [erreursValidation, setErreursValidation] = useState<string[]>([]);
  const [enCours, setEnCours] = useState(false);
  const [progression, setProgression] = useState(0);
  const [importe, setImporte] = useState(0);
  const [ignores, setIgnores] = useState(0);
  const [erreursImport, setErreursImport] = useState<string[]>([]);

  const apercu = useMemo(() => questions.slice(0, 5), [questions]);

  async function choisirFichier(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFichier(file.name); setQuestions([]); setErreursValidation([]); setProgression(0); setImporte(0); setIgnores(0); setErreursImport([]);

    const matrice = parserCsv((await file.text()).replace(/^\uFEFF/, ""));
    if (matrice.length < 2) return setErreursValidation(["Le fichier CSV est vide ou invalide."]);
    const entetes = matrice[0].map(v => v.trim());
    const manquantes = COLONNES.filter(c => !entetes.includes(c));
    if (manquantes.length) return setErreursValidation([`Colonnes manquantes : ${manquantes.join(", ")}`]);

    const index = Object.fromEntries(entetes.map((h, i) => [h, i]));
    const ids = new Set<string>();
    const valides: QuestionInsert[] = [];
    const erreurs: string[] = [];

    matrice.slice(1).forEach((r, n) => {
      const l = Object.fromEntries(COLONNES.map(c => [c, r[index[c]] ?? ""])) as Ligne;
      const q = convertir(l);
      const num = n + 2;
      if (!q.external_id || !q.categorie || !q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d) erreurs.push(`Ligne ${num} : champ obligatoire manquant.`);
      else if (!["A","B","C","D"].includes(q.bonne_reponse)) erreurs.push(`Ligne ${num} : bonne_reponse doit être A, B, C ou D.`);
      else if (!["reconstitue","officiel_verifie","demonstration"].includes(q.authenticite)) erreurs.push(`Ligne ${num} : authenticite invalide.`);
      else if (ids.has(q.external_id)) erreurs.push(`Ligne ${num} : external_id dupliqué (${q.external_id}).`);
      else { ids.add(q.external_id); valides.push(q); }
    });

    setQuestions(valides);
    setErreursValidation(erreurs.slice(0, 50));
  }

  async function importer() {
    if (!questions.length || erreursValidation.length) return;
    setEnCours(true); setProgression(0); setImporte(0); setIgnores(0); setErreursImport([]);
    const supabase = createClient();
    const lot = 100;
    let totalImporte = 0, totalIgnores = 0;
    const erreurs: string[] = [];

    for (let i = 0; i < questions.length; i += lot) {
      const bloc = questions.slice(i, i + lot);
      const ids = bloc.map(q => q.external_id);
      const { data: existantes, error: errLecture } = await supabase.from("questions").select("external_id").in("external_id", ids);
      if (errLecture) { erreurs.push(`Lot ${i / lot + 1} : ${errLecture.message}`); setProgression(Math.min(100, Math.round(((i + bloc.length) / questions.length) * 100))); continue; }
      const deja = new Set((existantes ?? []).map(x => x.external_id));
      const nouvelles = bloc.filter(q => !deja.has(q.external_id));
      totalIgnores += bloc.length - nouvelles.length;
      if (nouvelles.length) {
        const { error } = await supabase.from("questions").insert(nouvelles);
        if (error) erreurs.push(`Lot ${i / lot + 1} : ${error.message}`);
        else totalImporte += nouvelles.length;
      }
      setImporte(totalImporte); setIgnores(totalIgnores);
      setProgression(Math.min(100, Math.round(((i + bloc.length) / questions.length) * 100)));
    }
    setErreursImport(erreurs);
    setEnCours(false);
  }

  return (
    <div className="card" style={{maxWidth:900, margin:"28px auto"}}>
      <h1>Importer les questions</h1>
      <p className="muted">Sélectionnez le fichier CSV préparé. Il sera vérifié avant tout envoi à Supabase.</p>
      <label className="button" style={{display:"inline-block", cursor:"pointer", marginTop:12}}>
        Choisir le fichier CSV
        <input type="file" accept=".csv,text/csv" onChange={choisirFichier} style={{display:"none"}} />
      </label>
      {fichier && <p><strong>Fichier :</strong> {fichier}</p>}

      {erreursValidation.length > 0 && <div style={{marginTop:18, padding:16, border:"1px solid #ef4444", borderRadius:14}}><strong>Import bloqué — {erreursValidation.length} erreur(s)</strong>{erreursValidation.map((e,i)=><div key={i} className="muted">{e}</div>)}</div>}

      {questions.length > 0 && !erreursValidation.length && <>
        <div className="statgrid" style={{marginTop:20}}><div className="card stat"><span>Questions détectées</span><strong>{questions.length}</strong></div><div className="card stat"><span>Examens reconstitués</span><strong>{questions.filter(q=>q.annee && q.exam_session).length}</strong></div><div className="card stat"><span>Statut</span><strong>Prêt</strong></div></div>
        <h2 style={{marginTop:24}}>Aperçu</h2>
        <div style={{overflowX:"auto"}}><table style={{width:"100%", borderCollapse:"collapse"}}><thead><tr><th align="left">ID</th><th align="left">Catégorie</th><th align="left">Question</th><th align="left">Réponse</th></tr></thead><tbody>{apercu.map(q=><tr key={q.external_id}><td style={{padding:"10px 6px"}}>{q.external_id}</td><td>{q.categorie}</td><td>{q.question.slice(0,90)}{q.question.length>90?"…":""}</td><td>{q.bonne_reponse}</td></tr>)}</tbody></table></div>
        <button className="button" onClick={importer} disabled={enCours} style={{marginTop:22}}>{enCours ? `Import en cours… ${progression}%` : `Importer ${questions.length} questions`}</button>
      </>}

      {(enCours || progression > 0) && <div style={{marginTop:20}}><div style={{height:12, background:"#e5e7eb", borderRadius:999, overflow:"hidden"}}><div style={{height:"100%", width:`${progression}%`, background:"#3f46f5"}} /></div><p><strong>{progression}%</strong> — {importe} importées, {ignores} déjà présentes.</p></div>}
      {!enCours && progression === 100 && <div style={{marginTop:18, padding:16, border:"1px solid #22c55e", borderRadius:14}}><strong>Import terminé.</strong><div>{importe} question(s) ajoutée(s), {ignores} doublon(s) ignoré(s), {erreursImport.length} lot(s) en erreur.</div></div>}
      {erreursImport.length > 0 && <div style={{marginTop:14, padding:16, border:"1px solid #ef4444", borderRadius:14}}>{erreursImport.map((e,i)=><div key={i}>{e}</div>)}</div>}
    </div>
  );
}
