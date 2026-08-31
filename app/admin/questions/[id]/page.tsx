import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { exigerAdmin } from "@/lib/admin";

export default async function ModifierQuestion({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await exigerAdmin();
  const { id } = await params;
  const { data: question } = await supabase.from("questions").select("*").eq("id", id).single();
  if (!question) notFound();

  async function enregistrer(formData: FormData) {
    "use server";
    const { supabase } = await exigerAdmin();
    const questionId = String(formData.get("id") ?? "");
    const authenticite = String(formData.get("authenticite") ?? "reconstitue");
    const source = String(formData.get("source") ?? "").trim();
    if (authenticite === "officiel_verifie" && !source) throw new Error("Une source officielle identifiable est obligatoire.");

    const payload = {
      external_id: String(formData.get("external_id") ?? "").trim() || null,
      annee: Number(formData.get("annee") || 0) || null,
      categorie: String(formData.get("categorie") ?? "").trim(),
      sous_categorie: String(formData.get("sous_categorie") ?? "").trim() || null,
      difficulte: String(formData.get("difficulte") ?? "").trim() || null,
      question: String(formData.get("question") ?? "").trim(),
      option_a: String(formData.get("option_a") ?? "").trim(),
      option_b: String(formData.get("option_b") ?? "").trim(),
      option_c: String(formData.get("option_c") ?? "").trim(),
      option_d: String(formData.get("option_d") ?? "").trim(),
      bonne_reponse: String(formData.get("bonne_reponse") ?? "A"),
      explication: String(formData.get("explication") ?? "").trim() || null,
      source: source || null,
      authenticite,
      langue: String(formData.get("langue") ?? "fr"),
    };

    const { error } = await supabase.from("questions").update(payload).eq("id", questionId);
    if (error) throw new Error(error.message);
    redirect("/admin/questions");
  }

  return (
    <main className="container page">
      <div className="nav"><div className="logo">Modifier la question</div><Link href="/admin/questions">Retour</Link></div>
      <form action={enregistrer} className="card" style={{maxWidth:900,margin:"28px auto",display:"grid",gap:16}}>
        <input type="hidden" name="id" value={question.id} />
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <label>ID externe<input name="external_id" defaultValue={question.external_id ?? ""} /></label>
          <label>Année<input name="annee" type="number" defaultValue={question.annee ?? ""} /></label>
          <label>Catégorie<input name="categorie" required defaultValue={question.categorie ?? ""} /></label>
          <label>Sous-catégorie<input name="sous_categorie" defaultValue={question.sous_categorie ?? ""} /></label>
          <label>Difficulté<select name="difficulte" defaultValue={question.difficulte ?? "Moyenne"}><option>Facile</option><option>Moyenne</option><option>Difficile</option></select></label>
          <label>Langue<select name="langue" defaultValue={question.langue ?? "fr"}><option value="fr">Français</option><option value="ht">Kreyòl</option></select></label>
        </div>
        <label>Question<textarea name="question" rows={4} required defaultValue={question.question ?? ""} /></label>
        <label>Option A<textarea name="option_a" rows={2} required defaultValue={question.option_a ?? ""} /></label>
        <label>Option B<textarea name="option_b" rows={2} required defaultValue={question.option_b ?? ""} /></label>
        <label>Option C<textarea name="option_c" rows={2} required defaultValue={question.option_c ?? ""} /></label>
        <label>Option D<textarea name="option_d" rows={2} required defaultValue={question.option_d ?? ""} /></label>
        <label>Bonne réponse<select name="bonne_reponse" defaultValue={question.bonne_reponse ?? "A"}><option>A</option><option>B</option><option>C</option><option>D</option></select></label>
        <label>Explication<textarea name="explication" rows={4} defaultValue={question.explication ?? ""} /></label>
        <label>Source<input name="source" defaultValue={question.source ?? ""} /></label>
        <label>Authenticité<select name="authenticite" defaultValue={question.authenticite ?? "reconstitue"}><option value="reconstitue">Reconstitué</option><option value="demonstration">Démonstration</option><option value="officiel_verifie">Officiel vérifié</option></select></label>
        <button className="button" type="submit">Enregistrer les modifications</button>
      </form>
    </main>
  );
}
