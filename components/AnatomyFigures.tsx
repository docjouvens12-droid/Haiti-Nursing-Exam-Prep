import type { ReactNode } from "react";
import styles from "./AnatomyFigures.module.css";

const book = "https://openstax.org/books/anatomy-and-physiology-2e/pages/";
type Panel = { title: string; labels: string[]; note: string; source: string; drawing: string };
export const anatomyPanels: Record<string, Panel[]> = {
  "fiche-121": [
    { title: "Le cœur : quatre cavités", drawing: "heart", labels: ["Oreillette droite : reçoit les veines caves.", "Ventricule droit : éjecte vers les poumons.", "Oreillette gauche : reçoit les veines pulmonaires.", "Ventricule gauche : éjecte vers l’aorte."], note: "Coupe schématique, non à l’échelle : la droite du patient est à gauche de l’image. Bleu = sang moins oxygéné ; rouge = sang plus oxygéné. Le sang n’est jamais bleu.", source: book + "19-1-heart-anatomy" },
    { title: "Le trajet du sang et les quatre valves", drawing: "circulation", labels: ["Veines caves → oreillette droite", "Valve tricuspide → ventricule droit", "Valve pulmonaire → artères pulmonaires", "Poumons : échanges d’oxygène et de CO₂", "Veines pulmonaires → oreillette gauche", "Valve mitrale → ventricule gauche", "Valve aortique → aorte → organes", "Retour par les veines vers les veines caves"], note: "Les artères quittent le cœur ; les veines y reviennent. La circulation pulmonaire va du cœur droit au cœur gauche via les poumons ; la circulation générale passe par les organes.", source: book + "19-1-heart-anatomy" },
    { title: "Un cycle cardiaque", drawing: "cycle", labels: ["Remplissage ventriculaire : valves tricuspide et mitrale ouvertes.", "Contraction : toutes les valves sont brièvement fermées.", "Éjection : valves pulmonaire et aortique ouvertes.", "Relaxation : toutes les valves sont brièvement fermées, puis le remplissage reprend."], note: "La systole ventriculaire comprend la contraction et l’éjection. La diastole comprend la relaxation et le remplissage. La contraction des oreillettes complète le remplissage.", source: book + "19-3-cardiac-cycle" },
  ],
  "fiche-140": [{ title: "L’appareil respiratoire", drawing: "lungs", labels: ["Trachée : conduit l’air vers les bronches.", "Bronches : distribuent l’air dans les poumons.", "Poumons : contiennent les bronchioles et les alvéoles.", "Diaphragme : sa contraction favorise l’inspiration.", "Alvéoles (agrandissement) : O₂ vers le sang, CO₂ vers l’air."], note: "Vue simplifiée. Les échanges gazeux se font à travers la paroi alvéolaire et celle des capillaires.", source: book + "22-1-organs-and-structures-of-the-respiratory-system" }],
  "fiche-157": [{ title: "Le système nerveux", drawing: "nerves", labels: ["Encéphale : traite les informations et participe aux commandes.", "Moelle épinière : transmet les messages et participe aux réflexes.", "Nerfs périphériques : relient le système central au corps."], note: "Encéphale et moelle forment le système nerveux central. Les nerfs périphériques transmettent notamment les informations sensitives et motrices.", source: book + "12-1-basic-structure-and-function-of-the-nervous-system" }],
  "fiche-174": [{ title: "Le trajet digestif", drawing: "gut", labels: ["Œsophage : transporte les aliments vers l’estomac.", "Estomac : mélange les aliments et commence la digestion des protéines.", "Foie : produit la bile ; vésicule : la stocke.", "Pancréas : fournit des enzymes digestives.", "Intestin grêle : principal lieu d’absorption des nutriments.", "Côlon, rectum et anus : récupération d’eau et évacuation des selles."], note: "Vue schématique : le foie et le pancréas sont des organes annexes ; les aliments ne les traversent pas.", source: book + "23-1-overview-of-the-digestive-system" }],
  "fiche-195": [{ title: "Quelques glandes endocrines majeures", drawing: "endocrine", labels: ["Hypothalamus et hypophyse : régulation de plusieurs axes hormonaux.", "Thyroïde : hormones intervenant dans le métabolisme.", "Surrénales : notamment cortisol, aldostérone et catécholamines.", "Pancréas endocrine : insuline et glucagon.", "Ovaires ou testicules : hormones sexuelles."], note: "Carte de repérage simplifiée et non exhaustive. Les glandes libèrent leurs hormones dans le sang ; leurs effets dépendent des récepteurs des cellules cibles.", source: book + "17-1-an-overview-of-the-endocrine-system" }],
  "fiche-210": [{ title: "Les voies urinaires", drawing: "kidneys", labels: ["Reins : filtrent le plasma et ajustent eau, électrolytes et équilibre acido-basique.", "Uretères : conduisent l’urine vers la vessie.", "Vessie : stocke l’urine.", "Urètre : permet l’évacuation de l’urine."], note: "Les néphrons, unités microscopiques du rein, associent filtration, réabsorption et sécrétion. Ne pas confondre uretère et urètre.", source: book + "25-3-gross-anatomy-of-the-kidney" }],
  "fiche-398": [{ title: "Organes reproducteurs internes féminins", drawing: "uterus", labels: ["Ovaires : produisent les ovocytes et des hormones.", "Trompes : trajet de l’ovocyte ; site habituel de fécondation.", "Utérus : lieu habituel d’implantation et de développement de la grossesse.", "Col utérin : partie basse de l’utérus.", "Vagin : conduit reliant le col à l’extérieur."], note: "Vue frontale simplifiée des organes internes féminins ; elle ne représente pas tout l’appareil reproducteur.", source: "https://openstax.org/books/medical-surgical-nursing/pages/20-1-brief-review-of-genitourinary-and-reproductive-anatomy-and-physiology" }],
  "fiche-009": [{ title: "L’insuline après un repas", drawing: "steps", labels: ["La glycémie augmente après l’absorption des glucides.", "Les cellules bêta du pancréas sécrètent de l’insuline.", "L’insuline favorise l’entrée du glucose dans le muscle et le tissu adipeux, et son stockage.", "La glycémie diminue ; la stimulation de la sécrétion d’insuline se réduit."], note: "Boucle simplifiée de régulation. L’insuline réduit aussi la production hépatique de glucose.", source: book + "17-9-the-endocrine-pancreas" }],
  "fiche-063": [{ title: "La fabrication des éléments du sang", drawing: "blood", labels: ["Moelle osseuse : cellules souches hématopoïétiques.", "Globules rouges : transport de l’oxygène par l’hémoglobine.", "Globules blancs : défense de l’organisme.", "Plaquettes : fragments cellulaires participant à l’hémostase."], note: "Arbre simplifié : les lignées et étapes intermédiaires ne sont pas toutes représentées. Le plasma est la partie liquide du sang.", source: book + "18-2-production-of-the-formed-elements" }],
  "fiche-331": [{ title: "Les échanges pendant la grossesse", drawing: "pregnancy", labels: ["Utérus : contient la grossesse.", "Placenta : interface d’échanges entre mère et fœtus.", "Cordon : une veine vers le fœtus, deux artères vers le placenta.", "Fœtus : reçoit oxygène et nutriments par le placenta."], note: "Schéma simplifié : les sangs maternel et fœtal ne se mélangent normalement pas directement. Les déchets et le CO₂ passent vers la circulation maternelle.", source: "https://www.ncbi.nlm.nih.gov/books/NBK539766/" }],
  "fiche-347": [{ title: "Les trois stades du travail", drawing: "steps", labels: ["Premier stade : contractions avec effacement et dilatation du col jusqu’à dilatation complète.", "Deuxième stade : de la dilatation complète à la naissance.", "Troisième stade : de la naissance à l’expulsion du placenta."], note: "La surveillance maternelle et néonatale se poursuit après la délivrance. Les durées varient ; ce schéma n’est pas un protocole de conduite du travail.", source: "https://www.ncbi.nlm.nih.gov/books/NBK615337/" }],
};

function Dot({ n, x, y }: { n: number; x: number; y: number }) {
  return <g><circle cx={x} cy={y} r="15" fill="#152744" stroke="white" strokeWidth="2"/><text x={x} y={y + 6} textAnchor="middle" fill="white" fontSize="18" fontWeight="700">{n}</text></g>;
}
function Shape({ kind }: { kind: string }) {
  switch (kind) {
    case "heart": return <>
      <path d="M80 100 C30 40 10 180 100 270 L230 350 C330 290 360 160 290 90 Q240 40 190 100 Q130 60 80 100Z" fill="#f9d8de" stroke="#a84a62" strokeWidth="5"/>
      <path d="M85 110 Q45 150 100 195 L175 195 L175 110Z M100 210 Q105 255 200 310 L175 210Z" fill="#bad9f5" stroke="#5087b3" strokeWidth="3"/>
      <path d="M205 110 L285 110 Q320 155 280 195 L205 195Z M205 210 L280 210 Q280 270 215 310Z" fill="#ef9ca9" stroke="#a84a62" strokeWidth="3"/>
      <path d="M190 100 L195 310" stroke="#a84a62" strokeWidth="8"/>
      <Dot n={1} x={120} y={150}/><Dot n={2} x={143} y={235}/><Dot n={3} x={250} y={150}/><Dot n={4} x={242} y={240}/>
      <text x="100" y="375" textAnchor="middle" fontSize="19" fill="#152744">Cœur droit</text><text x="280" y="375" textAnchor="middle" fontSize="19" fill="#152744">Cœur gauche</text>
    </>;
    case "lungs": return <>
      <path d="M200 20 V115 M200 115 L140 175 M200 115 L260 175" fill="none" stroke="#b28665" strokeWidth="18"/>
      <path d="M175 100 Q110 60 70 150 Q20 260 70 285 L175 280Z M225 100 Q290 60 330 150 Q380 260 330 285 L225 280Z" fill="#f4c8d3" stroke="#aa5971" strokeWidth="4"/>
      <path d="M200 115 L125 190 M150 160 L105 150 M130 185 L95 230 M200 115 L275 190 M250 160 L290 150 M275 190 L305 235" fill="none" stroke="#b28665" strokeWidth="9"/>
      <path d="M45 310 Q200 260 355 310" fill="none" stroke="#8463aa" strokeWidth="10"/>
      {[290,320,350].map(x=><circle key={x} cx={x} cy={360} r="18" fill="#f4c8d3" stroke="#aa5971" strokeWidth="2"/>)}
      <Dot n={1} x={200} y={60}/><Dot n={2} x={200} y={125}/><Dot n={3} x={100} y={250}/><Dot n={4} x={200} y={293}/><Dot n={5} x={320} y={360}/>
    </>;
    case "nerves": return <>
      <ellipse cx="200" cy="70" rx="60" ry="48" fill="#d6c7ef" stroke="#785ba0" strokeWidth="4"/>
      <path d="M180 35 Q155 70 185 98 M200 24 V110 M220 35 Q245 70 215 98" fill="none" stroke="#a18abe" strokeWidth="3"/>
      <path d="M200 118 V280" stroke="#785ba0" strokeWidth="12"/>
      {[145,175,205,235].map(y=><path key={y} d={`M200 ${y} L120 ${y+35} M200 ${y} L280 ${y+35}`} stroke="#b48a28" strokeWidth="4" fill="none"/>)}
      <path d="M200 275 L135 365 M200 275 L265 365" stroke="#b48a28" strokeWidth="5" fill="none"/>
      <Dot n={1} x={200} y={65}/><Dot n={2} x={200} y={195}/><Dot n={3} x={275} y={268}/>
    </>;
    case "gut": return <>
      <path d="M220 15 V105" stroke="#bc7b78" strokeWidth="14"/>
      <path d="M220 98 C290 55 325 115 290 158 Q265 194 200 164 L180 148" fill="#f5c3d0" stroke="#a84a62" strokeWidth="4"/>
      <path d="M65 95 Q125 50 208 98 L182 150 L60 142Z" fill="#ba7e5f" stroke="#82523a" strokeWidth="3"/>
      <ellipse cx="215" cy="186" rx="60" ry="12" fill="#e8c25f" stroke="#a48a34" strokeWidth="3"/>
      <path d="M110 320 V220 Q110 208 125 208 H288 V332 H220 V375" stroke="#b87b84" strokeWidth="19" fill="none" strokeLinejoin="round"/>
      <path d="M150 230 H258 Q280 248 252 252 H155 Q125 274 158 274 H255 Q280 297 250 297 H160 Q133 320 170 322 H210" fill="none" stroke="#e8b072" strokeWidth="13" strokeLinecap="round"/>
      <Dot n={1} x={220} y={45}/><Dot n={2} x={270} y={125}/><Dot n={3} x={118} y={110}/><Dot n={4} x={215} y={187}/><Dot n={5} x={198} y={275}/><Dot n={6} x={290} y={305}/>
    </>;
    case "kidneys": return <>
      <path d="M145 70 C45 35 35 200 132 194 Q174 180 140 153 Q110 133 147 109Z M255 70 C355 35 365 200 268 194 Q226 180 260 153 Q290 133 253 109Z" fill="#db9c9c" stroke="#9d565e" strokeWidth="4"/>
      <path d="M145 140 Q180 180 170 285 M255 140 Q220 180 230 285" fill="none" stroke="#c6a654" strokeWidth="8"/>
      <path d="M165 280 Q200 268 235 280 Q258 335 200 345 Q142 335 165 280Z" fill="#f3d8a1" stroke="#ac8d42" strokeWidth="4"/>
      <path d="M200 345 V383" stroke="#c6a654" strokeWidth="10"/>
      <Dot n={1} x={95} y={120}/><Dot n={2} x={170} y={225}/><Dot n={3} x={200} y={310}/><Dot n={4} x={200} y={369}/>
    </>;
    case "endocrine": return <>
      <circle cx="200" cy="53" r="40" fill="#eef1f7" stroke="#b8c5d7" strokeWidth="3"/>
      <path d="M173 95 L110 135 L85 260 L120 270 L145 180 L155 290 L140 385 H185 L200 305 L215 385 H260 L245 290 L255 180 L280 270 L315 260 L290 135 L227 95Z" fill="#eef1f7" stroke="#b8c5d7" strokeWidth="3"/>
      <ellipse cx="190" cy="117" rx="12" ry="20" fill="#e9b75d"/><ellipse cx="210" cy="117" rx="12" ry="20" fill="#e9b75d"/>
      <path d="M150 215 l15 -20 15 20 M220 215 l15 -20 15 20" fill="#c297d8"/>
      <ellipse cx="200" cy="245" rx="38" ry="10" fill="#e9b75d"/>
      <circle cx="180" cy="294" r="10" fill="#d991b3"/><circle cx="220" cy="294" r="10" fill="#d991b3"/>
      <Dot n={1} x={200} y={57}/><Dot n={2} x={200} y={118}/><Dot n={3} x={240} y={203}/><Dot n={4} x={200} y={245}/><Dot n={5} x={200} y={295}/>
    </>;
    case "uterus": return <>
      <path d="M155 145 Q200 120 245 145 Q258 205 217 256 L217 292 H183 V256 Q142 205 155 145Z" fill="#f2bfd0" stroke="#a85373" strokeWidth="5"/>
      <path d="M157 150 Q110 95 65 145 M243 150 Q290 95 335 145" fill="none" stroke="#a85373" strokeWidth="10"/>
      <ellipse cx="75" cy="167" rx="25" ry="17" fill="#ecd174" stroke="#a68b3d" strokeWidth="3"/><ellipse cx="325" cy="167" rx="25" ry="17" fill="#ecd174" stroke="#a68b3d" strokeWidth="3"/>
      <path d="M181 290 V370 H219 V290" fill="#f7dde6" stroke="#a85373" strokeWidth="4"/>
      <Dot n={1} x={75} y={167}/><Dot n={2} x={120} y={124}/><Dot n={3} x={200} y={190}/><Dot n={4} x={200} y={274}/><Dot n={5} x={200} y={332}/>
    </>;
    case "pregnancy": return <>
      <ellipse cx="200" cy="195" rx="140" ry="160" fill="#f8dce5" stroke="#aa617b" strokeWidth="8"/>
      <path d="M290 100 Q350 185 294 280" stroke="#9d5571" strokeWidth="25" fill="none"/>
      <circle cx="170" cy="145" r="37" fill="#ebbb91" stroke="#a77a58" strokeWidth="3"/>
      <path d="M185 185 Q245 190 222 260 Q175 300 140 260 Q115 230 155 220" fill="#ebbb91" stroke="#a77a58" strokeWidth="4"/>
      <path d="M200 225 Q285 245 275 175 L306 165" fill="none" stroke="#8462a8" strokeWidth="9"/>
      <Dot n={1} x={85} y={140}/><Dot n={2} x={313} y={195}/><Dot n={3} x={270} y={206}/><Dot n={4} x={170} y={145}/>
    </>;
    default: return null;
  }
}
function Frame({ title, children }: { title: string; children: ReactNode }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label={title} className={styles.svg} fontFamily="Arial, sans-serif"><title>{title}</title>{children}</svg>;
}
export default function AnatomyFigures({ id }: { id: string }) {
  const panels = anatomyPanels[id];
  if (!panels) return null;
  return <section className={styles.gallery} aria-label="Illustrations d’anatomie et de physiologie">
    <h2>Comprendre en images</h2>
    <p>Schémas pédagogiques simplifiés, avec légendes numérotées.</p>
    {panels.map(panel => <figure className={styles.figure} key={panel.title}>
      <figcaption>{panel.title}</figcaption>
      {["steps", "circulation", "cycle", "blood"].includes(panel.drawing)
        ? <ol className={`${styles.flow} ${panel.drawing === "blood" ? styles.branches : ""}`}>{panel.labels.map((label, i) => <li key={label}><span>{i + 1}</span>{label}</li>)}</ol>
        : <><Frame title={`${panel.title}. ${panel.labels.map((l, i) => `${i + 1} : ${l}`).join(" ")}`}><Shape kind={panel.drawing}/></Frame><ol className={styles.legend}>{panel.labels.map(label => <li key={label}>{label}</li>)}</ol></>}
      <p className={styles.note}>{panel.note}</p>
      <a href={panel.source} target="_blank" rel="noopener noreferrer">Référence pédagogique (nouvel onglet) ↗</a>
    </figure>)}
  </section>;
}
