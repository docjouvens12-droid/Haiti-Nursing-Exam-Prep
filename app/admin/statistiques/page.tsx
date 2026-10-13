import Link from "next/link";
import { exigerAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// Report is read-only: never delete duplicated questions because historical
// exam sessions, answer history and bank mappings reference their stable IDs.
export default async function StatistiquesAdmin() {
  const { supabase } = await exigerAdmin();
  const [{ count: totalQuestions }, { count: totalUsers }, { count: totalExams }] = await Promise.all([
    supabase.from("questions").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("exam_sessions").select("id", { count: "exact", head: true }).not("completed_at", "is", null),
  ]);

  const categories = new Map<string, number>();
  const duplicateIndex = new Map<string, { count: number; correctTexts: Set<string> }>();
  let errorText = "";
  const pageSize = 1000;
  for (let offset = 0; offset < (totalQuestions ?? 0); offset += pageSize) {
    const { data, error } = await supabase.from("questions")
      .select("categorie,question,bonne_reponse,option_a,option_b,option_c,option_d")
      .order("id").range(offset, offset + pageSize - 1);
    if (error) { errorText = "La lecture des questions a échoué. Réessayez."; break; }
    for (const q of data ?? []) {
      const category = q.categorie || "Non classée";
      categories.set(category, (categories.get(category) || 0) + 1);
      const stem = (q.question || "").trim().toLocaleLowerCase("fr").replace(/\s+/g, " ");
      if (!stem) continue;
      const answer = String(q.bonne_reponse === "A" ? q.option_a : q.bonne_reponse === "B" ? q.option_b : q.bonne_reponse === "C" ? q.option_c : q.option_d).trim().toLocaleLowerCase("fr").replace(/\s+/g, " ");
      const hit = duplicateIndex.get(stem) || { count: 0, correctTexts: new Set<string>() };
      hit.count++;
      hit.correctTexts.add(answer);
      duplicateIndex.set(stem, hit);
    }
    if ((data ?? []).length < pageSize) break;
  }
  const repeated = [...duplicateIndex.entries()].filter(([, value]) => value.count > 1);
  const conflicts = repeated.filter(([, value]) => value.correctTexts.size > 1);

  return (
    <main className="container page" style={{ maxWidth: 1050, paddingTop: 24, paddingBottom: 80 }}>
      <Link href="/admin">← Retour à l'administration</Link>
      <h1>Statistiques et qualité des questions</h1>
      <p className="muted">Rapport en lecture seule. Aucune réponse étudiant ni question n'est modifiée.</p>
      <div className="statgrid" style={{margin:"24px 0"}}>
        <div className="card stat"><span>Questions</span><strong>{totalQuestions ?? "—"}</strong></div>
        <div className="card stat"><span>Étudiants / comptes</span><strong>{totalUsers ?? "—"}</strong></div>
        <div className="card stat"><span>Examens terminés</span><strong>{totalExams ?? "—"}</strong></div>
      </div>
      {errorText && <p role="alert">{errorText}</p>}
      <section className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h2>Qualité des QCM</h2>
        <p><strong>{repeated.length}</strong> groupes de formulations répétées identifiées.</p>
        <p><strong>{conflicts.length}</strong> groupes où le texte de la réponse correcte diffère : revue pédagogique recommandée.</p>
        <p className="muted">Les répétitions peuvent venir de différentes années ou d'options dans un ordre différent. Ne supprimez pas les originaux sans audit des références.</p>
        {conflicts.slice(0, 10).map(([stem, value], index) => <div key={stem} style={{padding:"10px 0",borderTop:"1px solid #e5eaf1"}}>
          <strong>{index + 1}. {stem}</strong>
          <p className="muted">{value.count} versions · {value.correctTexts.size} formulations de bonne réponse</p>
        </div>)}
      </section>
      <section className="card" style={{ padding: 20 }}>
        <h2>Questions par domaine</h2>
        {[...categories.entries()].sort((a,b) => b[1]-a[1]).map(([category, n]) =>
          <div key={category} style={{display:"flex",justifyContent:"space-between",gap:12,padding:"10px 0",borderBottom:"1px solid #edf1f5"}}>
            <span>{category}</span><strong>{n}</strong>
          </div>)}
      </section>
    </main>
  );
}
