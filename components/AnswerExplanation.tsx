import { answerLetters, parseExplanation, type AnswerLetter } from "@/lib/answer-explanation";

type Question = {
  bonne_reponse: string;
  explication: string | null;
  option_a?: string; option_b?: string; option_c?: string; option_d?: string;
};
export default function AnswerExplanation({ question, selected }: { question: Question; selected?: string | null }) {
  const detail = parseExplanation(question.explication);
  const option = (letter: string) => {
    const key = `option_${letter.toLowerCase()}` as "option_a" | "option_b" | "option_c" | "option_d";
    return `${letter}${question[key] ? ` — ${question[key]}` : ""}`;
  };
  const validChoice = answerLetters.includes(selected as AnswerLetter);
  const incorrect = validChoice && selected !== question.bonne_reponse;
  return <div style={{ display: "grid", gap: 12, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
    {selected !== undefined && <p><strong>Votre réponse : </strong>{validChoice ? option(selected!) : "Aucune réponse"}</p>}
    {incorrect && <div><strong>Pourquoi ce choix est incorrect</strong><p>{detail.options[selected as AnswerLetter] || "L’explication spécifique à ce choix n’est pas encore renseignée. Consultez le corrigé général ci-dessous."}</p></div>}
    <div><strong>Bonne réponse : {option(question.bonne_reponse)}</strong>
      <p>{detail.options[question.bonne_reponse as AnswerLetter] || detail.general || "Le corrigé explicatif n’est pas encore renseigné."}</p>
    </div>
    {detail.general && detail.options[question.bonne_reponse as AnswerLetter] && <div><strong>Corrigé général</strong><p>{detail.general}</p></div>}
    {detail.takeaway && <div><strong>À retenir</strong><p>{detail.takeaway}</p></div>}
  </div>;
}
