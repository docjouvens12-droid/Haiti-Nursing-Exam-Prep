type Diagramme = { titre: string; etapes: string[]; note?: string };

const diagrammes: Record<string, Diagramme[]> = {
  respiratoire: [
    { titre: "Trajet de l’air", etapes: ["Nez / bouche", "Pharynx et larynx", "Trachée", "Bronches et bronchioles", "Alvéoles"] },
    { titre: "Échanges gazeux alvéolaires", etapes: ["Air alvéolaire riche en O₂", "Diffusion de l’O₂ vers les capillaires", "Sang oxygéné vers le cœur gauche", "CO₂ du sang vers les alvéoles", "Expiration du CO₂"], note: "La qualité des échanges dépend à la fois de la ventilation et de la perfusion pulmonaire." },
  ],
  neurologie: [
    { titre: "Organisation du système nerveux", etapes: ["Encéphale", "Moelle épinière", "Nerfs périphériques", "Muscles, organes et récepteurs"] },
    { titre: "Voie fonctionnelle simplifiée", etapes: ["Stimulus sensoriel", "Message afférent vers le SNC", "Intégration cérébrale ou médullaire", "Message efférent", "Réponse motrice ou autonome"], note: "Les fonctions neurologiques dépendent d’une perfusion cérébrale et d’une oxygénation adéquates." },
  ],
  "gastro-intestinal": [
    { titre: "Trajet digestif", etapes: ["Bouche", "Œsophage", "Estomac", "Intestin grêle", "Côlon", "Rectum et anus"] },
    { titre: "Digestion et absorption", etapes: ["Foie : production de bile", "Vésicule : stockage de la bile", "Pancréas : enzymes digestives", "Duodénum : mélange des sécrétions", "Intestin grêle : absorption des nutriments"], note: "Le foie, la vésicule biliaire et le pancréas sont des organes annexes : les aliments ne les traversent pas." },
  ],
  renal: [
    { titre: "Voies urinaires", etapes: ["Reins", "Uretères", "Vessie", "Urètre", "Élimination de l’urine"] },
    { titre: "Formation de l’urine dans le néphron", etapes: ["Filtration glomérulaire", "Réabsorption tubulaire", "Sécrétion tubulaire", "Concentration dans le tube collecteur", "Urine finale"], note: "Les reins participent aussi à l’équilibre hydro-électrolytique, acido-basique et à la régulation de la pression artérielle." },
  ],
  endocrinologie: [
    { titre: "Axes hormonaux", etapes: ["Hypothalamus", "Hypophyse", "Glande endocrine cible", "Hormone périphérique", "Organe cible"] },
    { titre: "Exemple : régulation de la glycémie", etapes: ["Glycémie augmente", "Pancréas sécrète de l’insuline", "Entrée et stockage du glucose", "Glycémie diminue", "Rétrocontrôle"], note: "Les systèmes endocriniens fonctionnent souvent par boucles de rétrocontrôle qui stabilisent l’environnement interne." },
  ],
  hematologie: [
    { titre: "Hématopoïèse", etapes: ["Moelle osseuse", "Cellules souches hématopoïétiques", "Globules rouges", "Globules blancs", "Plaquettes"] },
    { titre: "Hémostase simplifiée", etapes: ["Lésion vasculaire", "Vasoconstriction", "Adhésion et agrégation plaquettaire", "Cascade de coagulation", "Caillot de fibrine"], note: "Les globules rouges transportent surtout l’oxygène, les leucocytes participent à la défense et les plaquettes à l’hémostase." },
  ],
};

export default function SystemAnatomyDiagrams({ systeme }: { systeme: string }) {
  const items = diagrammes[systeme];
  if (!items?.length) return null;

  return (
    <section style={{ margin: "0 0 22px" }}>
      <h2 style={{ color: "#0b1f59", margin: "0 0 12px", fontSize: 23 }}>Schémas explicatifs</h2>
      <div style={{ display: "grid", gap: 14 }}>
        {items.map((diagramme) => (
          <figure key={diagramme.titre} style={{ margin: 0, background: "#f8fbff", border: "1px solid #cddced", borderRadius: 18, padding: "18px 16px" }}>
            <figcaption style={{ color: "#0b1f59", fontSize: 17, fontWeight: 800, marginBottom: 14 }}>{diagramme.titre}</figcaption>
            <div style={{ display: "grid", gap: 9 }}>
              {diagramme.etapes.map((etape, index) => (
                <div key={etape}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "white", border: "1px solid #d9e4f2", borderRadius: 13, padding: "11px 12px", color: "#334155", fontWeight: 700, lineHeight: 1.45 }}>
                    <span style={{ flex: "0 0 28px", width: 28, height: 28, borderRadius: 999, display: "grid", placeItems: "center", background: "#0b1f59", color: "white", fontSize: 13 }}>{index + 1}</span>
                    <span>{etape}</span>
                  </div>
                  {index < diagramme.etapes.length - 1 && <div aria-hidden="true" style={{ textAlign: "center", color: "#315b91", fontSize: 22, lineHeight: 1 }}>↓</div>}
                </div>
              ))}
            </div>
            {diagramme.note && <p style={{ margin: "14px 0 0", color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>{diagramme.note}</p>}
          </figure>
        ))}
      </div>
    </section>
  );
}
