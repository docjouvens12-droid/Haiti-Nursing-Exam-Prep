import Link from "next/link";
import { exigerAdmin } from "@/lib/admin";

export default async function ImportCSV() {
  await exigerAdmin();

  return (
    <main className="container page">
      <div className="nav">
        <div>
          <div className="logo">Importer un CSV</div>
          <small className="muted">Banque de questions Haiti Nursing Exam Prep</small>
        </div>
        <Link href="/admin">Retour à l’administration</Link>
      </div>

      <div className="card" style={{ maxWidth: 820, margin: "32px auto" }}>
        <h1>Importer les questions</h1>
        <p className="muted">
          La page d’import est maintenant disponible. Pour la banque complète de 5 000 questions et les examens reconstitués 2010–2023, utilisez le fichier CSV préparé pour Supabase.
        </p>

        <div style={{ marginTop: 24, padding: 20, border: "1px solid #dbe4f0", borderRadius: 16 }}>
          <h2>Import sécurisé</h2>
          <p>
            Les questions reconstituées doivent conserver la valeur <strong>reconstitue</strong> dans le champ d’authenticité. Ne marquez une question <strong>officiel_verifie</strong> que si son contenu a été vérifié à partir d’une source officielle identifiable.
          </p>
          <p className="muted">
            L’import massif sera effectué dans Supabase afin d’éviter les limites du navigateur mobile et les insertions partielles.
          </p>
        </div>

        <div style={{ marginTop: 24 }}>
          <Link className="button" href="/admin">Retour au panneau administrateur</Link>
        </div>
      </div>
    </main>
  );
}
