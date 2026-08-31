"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FiltreQuestionsAdmin({
  categories,
  categorieInitiale,
  rechercheInitiale,
}: {
  categories: string[];
  categorieInitiale: string;
  rechercheInitiale: string;
}) {
  const router = useRouter();
  const [recherche, setRecherche] = useState(rechercheInitiale);

  function naviguer(categorie: string, rechercheTexte = recherche) {
    const params = new URLSearchParams();
    if (rechercheTexte.trim()) params.set("q", rechercheTexte.trim());
    if (categorie) params.set("categorie", categorie);
    const suffixe = params.toString();
    router.push(suffixe ? `/admin/questions?${suffixe}` : "/admin/questions");
  }

  return (
    <div className="card" style={{ margin: "24px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(180px,1fr)", gap: 12, alignItems: "end" }}>
        <label>
          Recherche
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                naviguer(categorieInitiale, recherche);
              }
            }}
            placeholder="Texte ou identifiant HT-NUR..."
          />
        </label>
        <label>
          Catégorie
          <select
            defaultValue={categorieInitiale}
            onChange={(e) => naviguer(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="muted" style={{ margin: "10px 0 0" }}>
        Le regroupement se met à jour automatiquement dès que vous choisissez une catégorie.
      </p>
    </div>
  );
}
