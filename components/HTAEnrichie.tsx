"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const sections = [
  ["Définition", "L’hypertension artérielle (HTA) est une élévation persistante de la pression exercée par le sang sur la paroi des artères. Le diagnostic ne repose pas sur une valeur isolée : il nécessite des mesures fiables, répétées et interprétées selon les recommandations utilisées, l’âge, les comorbidités et le contexte clinique. L’HTA est souvent silencieuse, mais elle augmente progressivement le risque d’atteinte cardiovasculaire, cérébrale, rénale et rétinienne."],
  ["Physiopathologie", "La pression artérielle dépend principalement du débit cardiaque et des résistances vasculaires périphériques. Une activation excessive du système sympathique, du système rénine–angiotensine–aldostérone, une rétention hydrosodée, une dysfonction endothéliale ou une augmentation durable du tonus vasculaire peuvent maintenir la pression à un niveau élevé. Avec le temps, les artères deviennent plus rigides et se remodèlent. Le ventricule gauche doit alors travailler contre une postcharge accrue, ce qui peut provoquer une hypertrophie ventriculaire gauche puis contribuer à l’insuffisance cardiaque."],
  ["Facteurs de risque", "Les facteurs non modifiables comprennent notamment l’âge, les antécédents familiaux et certaines prédispositions individuelles. Les facteurs modifiables comprennent une alimentation trop riche en sodium, le surpoids ou l’obésité, la sédentarité, le tabagisme et une consommation excessive d’alcool. Le diabète, la maladie rénale chronique et l’apnée obstructive du sommeil sont fréquemment associés. Une HTA peut également être secondaire à une maladie rénale ou endocrinienne, ou à certains médicaments et substances."],
  ["Manifestations cliniques", "La majorité des patients ne ressentent aucun symptôme pendant longtemps, d’où l’importance du dépistage. Lorsque la pression est très élevée ou qu’une atteinte aiguë d’un organe apparaît, le patient peut présenter céphalées importantes, troubles visuels, confusion ou déficit neurologique, douleur thoracique, dyspnée, œdème pulmonaire ou diminution de la fonction rénale. Ces manifestations imposent une évaluation rapide."],
  ["Examens diagnostiques", "La première étape est une mesure correcte de la pression artérielle : patient au repos, brassard de taille appropriée, bras soutenu et mesures répétées. Une automesure à domicile ou une mesure ambulatoire sur 24 heures peut aider à confirmer l’HTA et à détecter un effet blouse blanche ou une HTA masquée. Le bilan peut comprendre créatinine et fonction rénale, sodium et potassium, glycémie ou HbA1c, bilan lipidique, analyse urinaire et ECG. Selon le contexte, d’autres examens recherchent une atteinte des organes cibles ou une cause secondaire."],
  ["Traitement", "La prise en charge associe des modifications du mode de vie et, lorsque cela est indiqué, un traitement pharmacologique. Les mesures comprennent réduction de l’excès de sodium, alimentation équilibrée, activité physique adaptée, contrôle du poids, arrêt du tabac et limitation de l’alcool. Les médicaments peuvent inclure diurétiques thiazidiques ou apparentés, inhibiteurs de l’enzyme de conversion, antagonistes des récepteurs de l’angiotensine, inhibiteurs calciques et, dans certaines indications, bêtabloquants ou autres agents. Le choix et les objectifs tensionnels sont individualisés."],
  ["Prise en charge infirmière", "Mesurer et documenter la pression avec une technique standardisée, comparer les tendances plutôt qu’une seule valeur et évaluer les symptômes associés. Surveiller fréquence cardiaque, état neurologique, douleur thoracique, respiration, perfusion et diurèse lorsqu’une complication est suspectée. Rechercher une hypotension orthostatique chez les patients à risque et surveiller les effets indésirables des antihypertenseurs. Vérifier l’adhésion thérapeutique sans jugement et identifier les obstacles pratiques : coût, oubli, effets secondaires ou compréhension insuffisante."],
  ["Complications", "Une HTA chronique mal contrôlée accélère l’athérosclérose et peut provoquer AVC ischémique ou hémorragique, maladie coronarienne et infarctus, hypertrophie ventriculaire gauche, insuffisance cardiaque, maladie artérielle périphérique, maladie rénale chronique et rétinopathie hypertensive. Une élévation sévère accompagnée d’une atteinte aiguë d’organe constitue une urgence hypertensive."],
  ["Éducation du patient", "Expliquer que l’absence de symptômes ne signifie pas que la pression est normale. Encourager la prise quotidienne des médicaments à l’heure prescrite et éviter tout arrêt brutal sans avis professionnel. Enseigner, lorsque cela fait partie du plan de soins, l’automesure tensionnelle et la tenue d’un relevé. Renforcer la diminution du sodium, l’activité régulière adaptée, le contrôle du poids, l’arrêt du tabac et le suivi des maladies associées. Le patient doit connaître les symptômes nécessitant une aide urgente : douleur thoracique, dyspnée importante, déficit neurologique, confusion ou trouble visuel aigu."],
  ["Points clés à retenir", "L’HTA est souvent asymptomatique : le dépistage et la qualité de la mesure sont essentiels. Une seule valeur élevée ne suffit généralement pas à définir une HTA chronique. L’infirmier joue un rôle majeur dans la surveillance des tendances tensionnelles, l’observance, la détection des effets indésirables et l’éducation. Une pression très élevée associée à des signes d’atteinte aiguë d’un organe doit faire rechercher une urgence hypertensive."]
] as const;

export default function HTAEnrichie() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const findSection = () => {
      const heading = Array.from(document.querySelectorAll<HTMLElement>("h1,h2,h3,h4")).find((node) =>
        node.textContent?.toLowerCase().includes("hypertension artérielle")
      );
      if (!heading) return false;
      const section = heading.closest("section") as HTMLElement | null;
      if (!section) return false;

      let host = document.getElementById("hta-enrichie-host");
      if (!host) {
        host = document.createElement("div");
        host.id = "hta-enrichie-host";
        const headerContainer = heading.parentElement;
        if (headerContainer && headerContainer !== section) {
          let sibling = headerContainer.nextElementSibling;
          while (sibling) {
            const next = sibling.nextElementSibling;
            sibling.remove();
            sibling = next;
          }
          headerContainer.insertAdjacentElement("afterend", host);
        } else {
          Array.from(section.children).forEach((child) => {
            if (child !== heading && !child.contains(heading)) child.remove();
          });
          section.appendChild(host);
        }
      }
      setTarget(host);
      return true;
    };

    if (findSection()) return;
    const timer = window.setTimeout(findSection, 250);
    return () => window.clearTimeout(timer);
  }, []);

  if (!target) return null;

  return createPortal(
    <div style={{ display: "grid", gap: 20, padding: "22px 32px 30px" }}>
      {sections.map(([title, text]) => (
        <div key={title} style={{ borderBottom: title === "Points clés à retenir" ? "none" : "1px solid #e7edf5", paddingBottom: title === "Points clés à retenir" ? 0 : 18 }}>
          <h3 style={{ margin: "0 0 8px", color: "#1554a3", fontSize: 18 }}>{title}</h3>
          <p style={{ margin: 0, color: "#374151", lineHeight: 1.72, fontSize: 16 }}>{text}</p>
        </div>
      ))}
      <div style={{ background: "#eef6ff", border: "1px solid #cfe3fb", borderRadius: 14, padding: 16 }}>
        <strong style={{ color: "#0b1f59", fontSize: 16 }}>Priorité infirmière</strong>
        <p style={{ margin: "7px 0 0", color: "#475569", lineHeight: 1.65, fontSize: 15 }}>Devant une pression très élevée, évaluer immédiatement le patient et rechercher des signes d’atteinte aiguë d’organe. La gravité dépend du contexte clinique et de l’atteinte d’organe, pas uniquement du chiffre affiché sur le tensiomètre.</p>
      </div>
    </div>,
    target
  );
}
