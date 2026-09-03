export const answerLetters = ["A", "B", "C", "D"] as const;
export type AnswerLetter = (typeof answerLetters)[number];
export type Explanation = { general: string; options: Partial<Record<AnswerLetter, string>>; takeaway: string };
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

// Versioned envelope in the existing text column; legacy explanations remain valid.
export function parseExplanation(value: string | null | undefined): Explanation {
  const fallback = { general: value ?? "", options: {}, takeaway: "" };
  if (!value) return fallback;
  try {
    const data = JSON.parse(value);
    if (data?.format !== "answer-explanation-v1") return fallback;
    return { general: text(data.general), takeaway: text(data.takeaway),
      options: Object.fromEntries(answerLetters.map(letter => [letter, text(data.options?.[letter])])) };
  } catch { return fallback; }
}

export function explanationFromForm(form: FormData): string | null {
  const general = text(form.get("explication"));
  const takeaway = text(form.get("explication_retenir"));
  const options = Object.fromEntries(answerLetters.map(letter => [letter, text(form.get(`explication_${letter}`))]));
  if (!takeaway && !Object.values(options).some(Boolean)) return general || null;
  return JSON.stringify({ format: "answer-explanation-v1", general, options, takeaway });
}
