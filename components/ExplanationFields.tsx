import { answerLetters, parseExplanation } from "@/lib/answer-explanation";

export default function ExplanationFields({ value }: { value?: string | null }) {
  const detail = parseExplanation(value);
  return <fieldset style={{ display: "grid", gap: 12, minWidth: 0 }}>
    <legend>Corrigé pédagogique</legend>
    <p>Vérifiez chaque justification avant de l’enregistrer. Expliquez pourquoi chaque option est correcte ou incorrecte dans ce cas. Laissez vide si le contenu reste à vérifier.</p>
    <label>Explication générale<textarea name="explication" rows={4} defaultValue={detail.general} /></label>
    {answerLetters.map(letter => <label key={letter}>Justification du choix {letter}<textarea name={`explication_${letter}`} rows={3} defaultValue={detail.options[letter] ?? ""} /></label>)}
    <label>À retenir<textarea name="explication_retenir" rows={2} defaultValue={detail.takeaway} /></label>
  </fieldset>;
}
