"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const figureStyle = { margin: 0, border: "1px solid #dfe8f4", borderRadius: 18, padding: 16, background: "#f9fbff" };
const captionStyle = { color: "#64748b", fontSize: 14, lineHeight: 1.6, marginTop: 12 };

export default function CardiovascularAnatomyDiagrams() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("h2"));
    const anatomyHeading = headings.find((node) => node.textContent?.toLowerCase().includes("bref rappel d’anatomie et de physiologie"));
    const anatomySection = anatomyHeading?.closest("section") as HTMLElement | null;
    if (anatomySection) setTarget(anatomySection);

    const structureNode = Array.from(document.querySelectorAll("strong")).find((node) => node.textContent?.toLowerCase().includes("structure utilisée pour chaque pathologie"));
    const structureSection = structureNode?.closest("section") as HTMLElement | null;
    if (structureSection) structureSection.remove();
  }, []);

  if (!target) return null;

  return createPortal(
    <div style={{ marginTop: 24, display: "grid", gap: 18 }}>
      <div style={{ borderTop: "1px solid #e7edf5", paddingTop: 20 }}>
        <h3 style={{ margin: "0 0 7px", color: "#0b1f59", fontSize: 20 }}>Schémas explicatifs</h3>
        <p style={{ margin: 0, color: "#64748b", lineHeight: 1.65, fontSize: 15 }}>
          Visualisez les structures essentielles du cœur, le trajet complet du sang et le système électrique qui coordonne chaque battement.
        </p>
      </div>

      <figure style={figureStyle}>
        <svg viewBox="0 0 640 520" role="img" aria-label="Anatomie simplifiée du cœur avec quatre cavités, quatre valves et gros vaisseaux" style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <marker id="b" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#2563eb" /></marker>
            <marker id="r" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#dc2626" /></marker>
          </defs>
          <text x="320" y="28" textAnchor="middle" fontSize="21" fontWeight="700" fill="#0b1f59">Anatomie fonctionnelle du cœur</text>
          <text x="320" y="52" textAnchor="middle" fontSize="14" fill="#64748b">4 cavités • 4 valves • principaux vaisseaux</text>

          <rect x="110" y="125" width="170" height="92" rx="25" fill="#dbeafe" stroke="#2563eb" strokeWidth="3" />
          <rect x="110" y="300" width="170" height="105" rx="25" fill="#bfdbfe" stroke="#2563eb" strokeWidth="3" />
          <rect x="360" y="125" width="170" height="92" rx="25" fill="#fee2e2" stroke="#dc2626" strokeWidth="3" />
          <rect x="360" y="300" width="170" height="105" rx="25" fill="#fecaca" stroke="#dc2626" strokeWidth="3" />
          <text x="195" y="169" textAnchor="middle" fontSize="17" fontWeight="700" fill="#1e3a8a">Oreillette droite</text>
          <text x="195" y="351" textAnchor="middle" fontSize="17" fontWeight="700" fill="#1e3a8a">Ventricule droit</text>
          <text x="445" y="169" textAnchor="middle" fontSize="17" fontWeight="700" fill="#991b1b">Oreillette gauche</text>
          <text x="445" y="351" textAnchor="middle" fontSize="17" fontWeight="700" fill="#991b1b">Ventricule gauche</text>

          <path d="M55 80 L55 170 L108 170" fill="none" stroke="#2563eb" strokeWidth="5" markerEnd="url(#b)" />
          <text x="26" y="73" fontSize="14" fontWeight="700" fill="#1e3a8a">Veine cave supérieure</text>
          <path d="M55 465 L55 188 L108 188" fill="none" stroke="#2563eb" strokeWidth="5" markerEnd="url(#b)" />
          <text x="26" y="488" fontSize="14" fontWeight="700" fill="#1e3a8a">Veine cave inférieure</text>

          <line x1="195" y1="217" x2="195" y2="296" stroke="#2563eb" strokeWidth="5" markerEnd="url(#b)" />
          <text x="208" y="260" fontSize="14" fontWeight="700" fill="#334155">Valve tricuspide</text>
          <path d="M195 405 C195 455 295 455 295 100 C295 80 250 80 240 80" fill="none" stroke="#2563eb" strokeWidth="5" markerEnd="url(#b)" />
          <text x="205" y="450" fontSize="14" fontWeight="700" fill="#334155">Valve pulmonaire</text>
          <text x="205" y="100" fontSize="14" fontWeight="700" fill="#1e3a8a">Artère pulmonaire → poumons</text>

          <path d="M400 80 C350 80 340 110 375 135" fill="none" stroke="#dc2626" strokeWidth="5" markerEnd="url(#r)" />
          <text x="365" y="75" fontSize="14" fontWeight="700" fill="#991b1b">Veines pulmonaires</text>
          <text x="365" y="96" fontSize="13" fill="#64748b">poumons → cœur</text>
          <line x1="445" y1="217" x2="445" y2="296" stroke="#dc2626" strokeWidth="5" markerEnd="url(#r)" />
          <text x="458" y="260" fontSize="14" fontWeight="700" fill="#334155">Valve mitrale</text>
          <path d="M445 405 C445 455 575 455 575 110 C575 80 535 70 515 70" fill="none" stroke="#dc2626" strokeWidth="5" markerEnd="url(#r)" />
          <text x="465" y="450" fontSize="14" fontWeight="700" fill="#334155">Valve aortique</text>
          <text x="505" y="60" fontSize="15" fontWeight="700" fill="#991b1b">Aorte → organisme</text>
        </svg>
        <figcaption style={captionStyle}>Le sang veineux entre dans le cœur droit par les veines caves, traverse la valve tricuspide puis la valve pulmonaire vers les poumons. Le sang oxygéné revient par les veines pulmonaires, traverse la valve mitrale puis la valve aortique avant d’être distribué par l’aorte.</figcaption>
      </figure>

      <figure style={figureStyle}>
        <svg viewBox="0 0 640 380" role="img" aria-label="Trajet du sang dans les circulations pulmonaire et systémique" style={{ width: "100%", height: "auto", display: "block" }}>
          <defs><marker id="flow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#475569" /></marker></defs>
          <text x="320" y="28" textAnchor="middle" fontSize="21" fontWeight="700" fill="#0b1f59">Trajet du sang : double circulation</text>
          <g fontSize="15" fontWeight="700" textAnchor="middle">
            <rect x="40" y="90" width="150" height="62" rx="22" fill="#e2e8f0" stroke="#94a3b8"/><text x="115" y="127" fill="#334155">Tissus</text>
            <rect x="245" y="90" width="150" height="62" rx="22" fill="#dbeafe" stroke="#2563eb"/><text x="320" y="127" fill="#1e3a8a">Cœur droit</text>
            <rect x="450" y="90" width="150" height="62" rx="22" fill="#dcfce7" stroke="#16a34a"/><text x="525" y="127" fill="#166534">Poumons</text>
            <rect x="450" y="245" width="150" height="62" rx="22" fill="#fee2e2" stroke="#dc2626"/><text x="525" y="282" fill="#991b1b">Cœur gauche</text>
            <rect x="40" y="245" width="150" height="62" rx="22" fill="#e2e8f0" stroke="#94a3b8"/><text x="115" y="282" fill="#334155">Tissus</text>
          </g>
          <line x1="190" y1="121" x2="240" y2="121" stroke="#475569" strokeWidth="4" markerEnd="url(#flow)"/>
          <line x1="395" y1="121" x2="445" y2="121" stroke="#475569" strokeWidth="4" markerEnd="url(#flow)"/>
          <line x1="525" y1="152" x2="525" y2="240" stroke="#475569" strokeWidth="4" markerEnd="url(#flow)"/>
          <line x1="450" y1="276" x2="195" y2="276" stroke="#475569" strokeWidth="4" markerEnd="url(#flow)"/>
          <path d="M115 245 C115 205 115 190 115 157" fill="none" stroke="#475569" strokeWidth="4" markerEnd="url(#flow)"/>
          <text x="320" y="183" textAnchor="middle" fontSize="14" fill="#1e3a8a">Circulation pulmonaire : cœur droit → poumons → cœur gauche</text>
          <text x="320" y="335" textAnchor="middle" fontSize="14" fill="#991b1b">Circulation systémique : cœur gauche → tissus → cœur droit</text>
        </svg>
        <figcaption style={captionStyle}>Les deux circulations fonctionnent en série : le circuit pulmonaire assure les échanges gazeux, tandis que le circuit systémique apporte oxygène et nutriments aux organes puis ramène le sang veineux au cœur.</figcaption>
      </figure>

      <figure style={figureStyle}>
        <svg viewBox="0 0 640 500" role="img" aria-label="Système de conduction électrique du cœur" style={{ width: "100%", height: "auto", display: "block" }}>
          <defs><marker id="electric" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#7c3aed" /></marker></defs>
          <text x="320" y="28" textAnchor="middle" fontSize="21" fontWeight="700" fill="#0b1f59">Conduction électrique cardiaque</text>
          <path d="M320 100 C235 40 115 95 135 220 C150 330 245 420 320 458 C395 420 490 330 505 220 C525 95 405 40 320 100Z" fill="#fff7ed" stroke="#94a3b8" strokeWidth="2"/>
          <circle cx="230" cy="135" r="16" fill="#facc15" stroke="#a16207" strokeWidth="2"/>
          <text x="115" y="128" fontSize="15" fontWeight="700" fill="#334155">1. Nœud sinusal (SA)</text>
          <path d="M242 147 C275 160 295 175 310 205" fill="none" stroke="#7c3aed" strokeWidth="5" markerEnd="url(#electric)"/>
          <circle cx="320" cy="220" r="15" fill="#fdba74" stroke="#c2410c" strokeWidth="2"/>
          <text x="345" y="225" fontSize="15" fontWeight="700" fill="#334155">2. Nœud AV</text>
          <line x1="320" y1="237" x2="320" y2="290" stroke="#7c3aed" strokeWidth="5" markerEnd="url(#electric)"/>
          <text x="340" y="275" fontSize="15" fontWeight="700" fill="#334155">3. Faisceau de His</text>
          <path d="M320 290 L260 350" fill="none" stroke="#7c3aed" strokeWidth="5" markerEnd="url(#electric)"/>
          <path d="M320 290 L380 350" fill="none" stroke="#7c3aed" strokeWidth="5" markerEnd="url(#electric)"/>
          <text x="320" y="382" textAnchor="middle" fontSize="15" fontWeight="700" fill="#334155">4. Branches droite et gauche</text>
          <path d="M260 350 C230 390 225 420 245 440" fill="none" stroke="#7c3aed" strokeWidth="4" markerEnd="url(#electric)"/>
          <path d="M380 350 C410 390 415 420 395 440" fill="none" stroke="#7c3aed" strokeWidth="4" markerEnd="url(#electric)"/>
          <text x="320" y="478" textAnchor="middle" fontSize="15" fontWeight="700" fill="#334155">5. Fibres de Purkinje → contraction ventriculaire coordonnée</text>
        </svg>
        <figcaption style={captionStyle}>Le nœud sinusal initie normalement l’impulsion. Celle-ci se propage dans les oreillettes, ralentit brièvement au nœud AV, puis descend par le faisceau de His, ses branches et les fibres de Purkinje pour synchroniser la contraction ventriculaire.</figcaption>
      </figure>
    </div>,
    target
  );
}
