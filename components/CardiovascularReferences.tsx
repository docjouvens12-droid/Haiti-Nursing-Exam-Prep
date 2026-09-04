const references = [
  {
    label: "ACC/AHA/ACEP/NAEMSP/SCAI — 2025 Guideline for the Management of Patients With Acute Coronary Syndromes",
    href: "https://professional.heart.org/en/guidelines-statements/2025-accahaacepnaemspscai-guideline-for-the-management-of-patients-with-acutecir0000000000001309",
  },
  {
    label: "AHA/ACC/HFSA — 2022 Guideline for the Management of Heart Failure",
    href: "https://professional.heart.org/en/guidelines-statements/2022-ahaacchfsa-guideline-for-the-management-of-heart-failure-a-report-of-thecir0000000000001063",
  },
  {
    label: "ACC/AHA/ACCP/HRS — 2023 Guideline for the Diagnosis and Management of Atrial Fibrillation",
    href: "https://professional.heart.org/en/guidelines-statements/2023-accahaaccphrs-guideline-for-the-diagnosis-and-management-of-atrialcir0000000000001193",
  },
  {
    label: "ACC/AHA — 2020 Guideline for the Management of Patients With Valvular Heart Disease",
    href: "https://professional.heart.org/en/guidelines-statements/2020-accaha-guideline-for-the-management-of-patients-with-valvular-heartcir0000000000000923",
  },
  {
    label: "ESC — 2023 Guidelines for the Management of Endocarditis",
    href: "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/endocarditis/",
  },
  {
    label: "ACC/AHA Multisociety — 2024 Guideline for the Management of Lower Extremity Peripheral Artery Disease",
    href: "https://professional.heart.org/en/science-news/2024-guideline-for-the-management-of-lower-extremity-peripheral-artery-disease",
  },
  {
    label: "ACC/AHA — 2022 Guideline for the Diagnosis and Management of Aortic Disease",
    href: "https://professional.heart.org/en/guidelines-statements/2022-accaha-guideline-for-the-diagnosis-and-management-of-aortic-disease-acir0000000000001106",
  },
  {
    label: "ESC — 2021 Guidelines on Cardiovascular Disease Prevention in Clinical Practice",
    href: "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/cvd-prevention/",
  },
] as const;

export default function CardiovascularReferences() {
  return (
    <section
      aria-labelledby="references-cardiovasculaires"
      style={{
        maxWidth: 920,
        margin: "0 auto 96px",
        padding: "0 18px",
      }}
    >
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #dfe6f0",
          borderRadius: 18,
          padding: "20px 20px 18px",
        }}
      >
        <h2
          id="references-cardiovasculaires"
          style={{ color: "#0b1f59", margin: "0 0 14px", fontSize: 21 }}
        >
          Références principales
        </h2>

        <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 10 }}>
          {references.map((reference) => (
            <li key={reference.href} style={{ color: "#334155", lineHeight: 1.55, fontSize: 13 }}>
              <a
                href={reference.href}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#1748b7", fontWeight: 700, textDecoration: "underline" }}
              >
                {reference.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
