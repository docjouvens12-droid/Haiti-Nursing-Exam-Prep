import Link from "next/link";
import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/admin";

const PAGE_SIZE = 25;

export default async function QuestionsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categorie?: string; page?: string }>;
}) {
  const { supabase } = await exigerAdmin();
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const categorie = (params.categorie ?? "").trim();
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("questions")
    .select("id,external_id,annee,categorie,sous_categorie,question,authenticite,langue,created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) query = query.or(`question.ilike.%${q.replaceAll(",", " ")}%,external_id.ilike.%${q.replaceAll(",", " ")}%`);
  if (categorie) query = query.eq("categorie", categorie);

  const { data: questions, count } = await query.range(from, to);
  const { data: categoriesRows } = await supabase.from("questions").select("categorie").order("categorie");
  const categories = [...new Set((categoriesRows ?? []).map((r) => r.categorie).filter(Boolean))];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function supprimerQuestion(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    const { supabase } = await exigerAdmin();
    await supabase.from("questions").delete().eq("id", id);
    revalidatePath("/admin/questions");
    revalidatePath("/admin");
  }

  function pageHref(n: number) {
    const s = new URLSearchParams();
    if (q) s.set("q", q);
    if (categorie) s.set("categorie", categorie);
    s.set("page", String(n));
    return `/admin/questions?${s.toString()}`;
  }

  return (
    <main className="container page">
      <div className="nav">
        <div><div className="logo">Gestion des questions</div><small className="muted">{total.toLocaleString("fr-FR")} question(s)</small></div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Link className="button" href="/admin/questions/nouvelle">Ajouter une question</Link>
          <Link href="/admin">Retour admin</Link>
        </div>
      </div>

      <div className="card" style={{margin:"24px 0"}}>
        <form method="get" style={{display:"grid",gridTemplateColumns:"2fr 1fr auto",gap:12,alignItems:"end"}}>
          <label>Recherche
            <input name="q" defaultValue={q} placeholder="Texte ou identifiant HT-NUR..." />
          </label>
          <label>Catégorie
            <select name="categorie" defaultValue={categorie}>
              <option value="">Toutes les catégories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <button className="button" type="submit">Filtrer</button>
        </form>
      </div>

      <div style={{display:"grid",gap:12}}>
        {(questions ?? []).map((item) => (
          <article className="card" key={item.id}>
            <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:240}}>
                <div className="muted" style={{fontSize:14}}>
                  {item.external_id ?? "Sans ID externe"} · {item.categorie}{item.sous_categorie ? ` / ${item.sous_categorie}` : ""}{item.annee ? ` · ${item.annee}` : ""}
                </div>
                <h2 style={{fontSize:"1.05rem",lineHeight:1.45,margin:"8px 0"}}>{item.question}</h2>
                <small className="muted">Authenticité : {item.authenticite ?? "reconstitue"} · Langue : {item.langue ?? "fr"}</small>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <Link className="button secondary" href={`/admin/questions/${item.id}`}>Modifier</Link>
                <form action={supprimerQuestion}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="button secondary">Supprimer</button>
                </form>
              </div>
            </div>
          </article>
        ))}
        {(questions ?? []).length === 0 && <div className="card"><p>Aucune question trouvée.</p></div>}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:24}}>
        <span className="muted">Page {page} sur {totalPages}</span>
        <div style={{display:"flex",gap:10}}>
          {page > 1 && <Link className="button secondary" href={pageHref(page - 1)}>Précédent</Link>}
          {page < totalPages && <Link className="button secondary" href={pageHref(page + 1)}>Suivant</Link>}
        </div>
      </div>
    </main>
  );
}
