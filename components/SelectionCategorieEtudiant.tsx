"use client";

import { useRouter } from "next/navigation";

export default function SelectionCategorieEtudiant({
  categories,
  valeur,
}: {
  categories: { nom: string; total: number }[];
  valeur: string;
}) {
  const router = useRouter();

  return (
    <div className="field" style={{ marginBottom: 0, minWidth: 260 }}>
      <label>Choisir une catégorie</label>
      <select
        value={valeur}
        onChange={(e) => {
          const categorie = e.target.value;
          router.push(categorie ? `/questions-reelles?categorie=${encodeURIComponent(categorie)}` : "/questions-reelles");
        }}
      >
        <option value="">Toutes les catégories</option>
        {categories.map((c) => (
          <option key={c.nom} value={c.nom}>
            {c.nom} ({c.total})
          </option>
        ))}
      </select>
    </div>
  );
}
