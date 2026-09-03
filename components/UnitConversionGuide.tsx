import { conversionGroups, workedConversions } from "@/lib/unit-conversions";
import styles from "./UnitConversionGuide.module.css";

export default function UnitConversionGuide() {
  return <section id="conversions" className={styles.guide} aria-labelledby="conversion-title">
    <h3 id="conversion-title">Guide des unités et conversions</h3>
    <p>Les unités utiles aux calculs infirmiers, des plus courantes aux repères moins fréquents. Ces exemples sont fictifs : ils ne constituent pas une prescription.</p>
    <nav aria-label="Familles de conversions"><ul>{conversionGroups.map(g => <li key={g.id}><a href={`#conversion-${g.id}`}>{g.title}</a></li>)}</ul></nav>
    {conversionGroups.map(group => <section id={`conversion-${group.id}`} className={styles.group} key={group.id}>
      <h4>{group.title}</h4>
      <div className={styles.tableWrap} role="region" aria-label={`Tableau : ${group.title}`} tabIndex={0}>
        <table><caption>{group.title} : équivalences et exemples</caption><thead><tr><th scope="col">Équivalence ou formule</th><th scope="col">Exemple corrigé</th></tr></thead><tbody>{group.rows.map(([rule, example]) => <tr key={rule}><th scope="row">{rule}</th><td>{example}</td></tr>)}</tbody></table>
      </div>
      <p className={styles.warning}>{group.note}</p>
    </section>)}
    <h3>Six exemples étape par étape</h3>
    {workedConversions.map(example => <article className={styles.worked} key={example.title}><h4>{example.title}</h4><ol>{example.steps.map(step => <li key={step}>{step}</li>)}</ol><p><strong>Résultat : {example.answer}</strong></p></article>)}
    <aside className={styles.warning}><h4>Avant toute administration</h4><ul><li>Ne pas convertir mg en mL sans concentration, ni gouttes en mL sans facteur connu.</li><li>Écrire 0,5 mg, jamais ,5 mg ; éviter les zéros finaux inutiles comme 5,0 mg.</li><li>Conserver la précision pendant le calcul ; arrondir seulement le résultat final selon le dispositif et le protocole.</li><li>Vérifier prescription, patient, voie, dose maximale, concentration et dispositif. Les unités d’insuline nécessitent un dispositif adapté à sa concentration.</li><li>Les électrolytes et médicaments à haut risque nécessitent les contrôles prévus par le protocole. Une conversion correcte ne valide pas la sécurité clinique de la dose.</li></ul></aside>
    <p>Références : <a href="https://www.ncbi.nlm.nih.gov/books/NBK593207/" target="_blank" rel="noopener noreferrer">Open RN — calculs infirmiers ↗</a>, <a href="https://www.nist.gov/pml/owm/metric-si-prefixes" target="_blank" rel="noopener noreferrer">NIST — préfixes métriques ↗</a>, <a href="https://medlineplus.gov/ency/article/002209.htm" target="_blank" rel="noopener noreferrer">MedlinePlus — mesure des médicaments liquides ↗</a>.</p>
  </section>;
}
