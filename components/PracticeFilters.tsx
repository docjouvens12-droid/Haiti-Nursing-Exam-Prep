"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { libelleCategorie } from "@/lib/categories";

type Status = { value: string; label: string };
type TopicRow = { categorie: string | null; sous_categorie: string | null };
type CorrectionMode = "immediate" | "fin";

type Props = {
  categories: string[];
  topicRows: TopicRow[];
  statuses: Status[];
  sessionSizes: readonly number[];
  annees: (number | null)[];
  initial: {
    categorie: string;
    sousCategorie: string;
    statut: string;
    nombre: number;
    chrono: boolean;
    annee: string;
    correction: CorrectionMode;
  };
};

export default function PracticeFilters({ categories, topicRows, statuses, sessionSizes, annees, initial }: Props) {
  const [categorie, setCategorie] = useState(initial.categorie);
  const [sousCategorie, setSousCategorie] = useState(initial.sousCategorie);
  const [correction, setCorrection] = useState<CorrectionMode>(initial.correction);

  const topics = useMemo(() => {
    if (!categorie) return [];
    return Array.from(new Set(
      topicRows
        .filter((row) => row.categorie === categorie)
        .map((row) => row.sous_categorie)
        .filter(Boolean) as string[]
    )).sort((a, b) => a.localeCompare(b, "fr"));
  }, [categorie, topicRows]);

  return (
    <form method="get" action="/pratique" className="practice-filter-form">
      <label>
        <span>Catégorie</span>
        <select
          name="categorie"
          value={categorie}
          onChange={(event) => {
            setCategorie(event.target.value);
            setSousCategorie("");
          }}
        >
          <option value="">Toutes les catégories du programme</option>
          {categories.map((c) => <option key={c} value={c}>{libelleCategorie(c)}</option>)}
        </select>
      </label>
      <label>
        <span>Thématique</span>
        <select
          name="sous_categorie"
          value={sousCategorie}
          onChange={(event) => setSousCategorie(event.target.value)}
          disabled={!categorie}
        >
          <option value="">{categorie ? "Toutes les thématiques" : "Choisissez d’abord une catégorie"}</option>
          {topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
        </select>
      </label>
      <label>
        <span>Type de questions</span>
        <select name="statut" defaultValue={initial.statut}>
          {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
      <label>
        <span>Nombre de questions</span>
        <select name="nombre" defaultValue={String(initial.nombre)}>
          {sessionSizes.map((size) => <option key={size} value={size}>{size} questions</option>)}
        </select>
      </label>

      <fieldset className="practice-correction-choice">
        <legend>Quand voulez-vous voir les résultats ?</legend>
        <input type="hidden" name="correction" value={correction} />
        <button
          type="button"
          className={correction === "immediate" ? "active" : ""}
          onClick={() => setCorrection("immediate")}
          aria-pressed={correction === "immediate"}
        >
          <span className="practice-choice-icon">✓</span>
          <span><strong>Après chaque question</strong><small>Voir immédiatement la bonne réponse et l’explication.</small></span>
        </button>
        <button
          type="button"
          className={correction === "fin" ? "active" : ""}
          onClick={() => setCorrection("fin")}
          aria-pressed={correction === "fin"}
        >
          <span className="practice-choice-icon">▣</span>
          <span><strong>À la fin de la série</strong><small>Répondre sans correction puis voir le score et le corrigé complet.</small></span>
        </button>
      </fieldset>

      <label>
        <span>Chronomètre</span>
        <select name="chrono" defaultValue={initial.chrono ? "oui" : "non"}>
          <option value="non">Sans chronomètre</option>
          <option value="oui">Avec chronomètre</option>
        </select>
      </label>
      <label>
        <span>Année</span>
        <select name="annee" defaultValue={initial.annee}>
          <option value="">Toutes les années</option>
          {annees.filter(Boolean).map((a) => <option key={a} value={String(a)}>{a}</option>)}
        </select>
      </label>
      <button className="practice-primary-action" type="submit">Démarrer la session</button>
      <Link className="practice-reset" href="/pratique">Réinitialiser</Link>
    </form>
  );
}
