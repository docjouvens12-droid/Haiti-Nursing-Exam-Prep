"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function CardiovascularAnatomyDiagrams() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("h2"));
    const anatomyHeading = headings.find((node) =>
      node.textContent?.toLowerCase().includes("bref rappel d’anatomie et de physiologie")
    );
    const anatomySection = anatomyHeading?.closest("section") as HTMLElement | null;
    if (anatomySection) setTarget(anatomySection);

    const structureNode = Array.from(document.querySelectorAll("strong")).find((node) =>
      node.textContent?.toLowerCase().includes("structure utilisée pour chaque pathologie")
    );
    const structureSection = structureNode?.closest("section") as HTMLElement | null;
    if (structureSection) structureSection.remove();
  }, []);

  if (!target) return null;

  return createPortal(
    <div style={{ marginTop: 22, display: "grid", gap: 16 }}>
      <div style={{ borderTop: "1px solid #e7edf5", paddingTop: 18 }}>
        <h3 style={{ margin: "0 0 6px", color: "#0b1f59", fontSize: 18 }}>Schémas explicatifs</h3>
        <p style={{ margin: "0 0 16px", color: "#64748b", lineHeight: 1.6, fontSize: 14 }}>
          Ces schémas résument le trajet du sang, les quatre cavités cardiaques et la conduction électrique normale.
        </p>
      </div>

      <figure style={{ margin: 0, border: "1px solid #dfe8f4", borderRadius: 16, padding: 14, background: "#f9fbff" }}>
        <svg viewBox="0 0 760 360" role="img" aria-label="Schéma simplifié des cavités et valves du cœur" style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#2563eb" /></marker>
            <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#dc2626" /></marker>
          </defs>
          <text x="380" y="26" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0b1f59">Cavités cardiaques et sens du flux sanguin</text>

          <rect x="120" y="72" width="170" height="92" rx="24" fill="#dbeafe" stroke="#2563eb" strokeWidth="3" />
          <rect x="120" y="205" width="170" height="92" rx="24" fill="#bfdbfe" stroke="#2563eb" strokeWidth="3" />
          <rect x="470" y="72" width="170" height="92" rx="24" fill="#fee2e2" stroke="#dc2626" strokeWidth="3" />
          <rect x="470" y="205" width="170" height="92" rx="24" fill="#fecaca" stroke="#dc2626" strokeWidth="3" />

          <text x="205" y="112" textAnchor="middle" fontSize="17" fontWeight="700" fill="#1e3a8a">Oreillette droite</text>
          <text x="205" y="245" textAnchor="middle" fontSize="17" fontWeight="700" fill="#1e3a8a">Ventricule droit</text>
          <text x="555" y="112" textAnchor="middle" fontSize="17" fontWeight="700" fill="#991b1b">Oreillette gauche</text>
          <text x="555" y="245" textAnchor="middle" fontSize="17" fontWeight="700" fill="#991b1b">Ventricule gauche</text>

          <line x1="205" y1="164" x2="205" y2="205" stroke="#2563eb" strokeWidth="5" markerEnd="url(#arrowBlue)" />
          <text x="222" y="190" fontSize="13" fill="#334155">Tricuspide</text>
          <line x1="555" y1="164" x2="555" y2="205" stroke="#dc2626" strokeWidth="5" markerEnd="url(#arrowRed)" />
          <text x="572" y="190" fontSize="13" fill="#334155">Mitrale</text>

          <path d="M120 118 C48 118 48 244 120 244" fill="none" stroke="#2563eb" strokeWidth="5" markerEnd="url(#arrowBlue)" />
          <text x="28" y="176" fontSize="13" fill="#334155">Veines caves</text>
          <text x="28" y="194" fontSize="13" fill="#334155">→ cœur droit</text>

          <path d="M290 252 C365 330 425 330 470 252" fill="none" stroke="#2563eb" strokeWidth="5" markerEnd="url(#arrowBlue)" />
          <text x="380" y="342" textAnchor="middle" fontSize="13" fill="#334155">Valve pulmonaire → poumons</text>

          <path d="M470 116 C405 44 352 44 290 116" fill="none" stroke="#dc2626" strokeWidth="5" markerEnd="url(#arrowRed)" />
          <text x="380" y="58" textAnchor="middle" fontSize="13" fill="#334155">Poumons → oreillette gauche</text>

          <path d="M640 252 C715 252 715 118 640 118" fill="none" stroke="#dc2626" strokeWidth="5" markerEnd="url(#arrowRed)" />
          <text x="650" y="176" fontSize="13" fill="#334155">Valve aortique</text>
          <text x="650" y="194" fontSize="13" fill="#334155">→ organisme</text>
        </svg>
        <figcaption style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5, marginTop: 8 }}>
          Le cœur droit reçoit le sang pauvre en oxygène et l’envoie aux poumons. Le cœur gauche reçoit le sang oxygéné et l’éjecte vers l’organisme.
        </figcaption>
      </figure>

      <figure style={{ margin: 0, border: "1px solid #dfe8f4", borderRadius: 16, padding: 14, background: "#f9fbff" }}>
        <svg viewBox="0 0 760 250" role="img" aria-label="Schéma de la circulation pulmonaire et systémique" style={{ width: "100%", height: "auto", display: "block" }}>
          <defs><marker id="arrowFlow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#475569" /></marker></defs>
          <text x="380" y="26" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0b1f59">Double circulation</text>
          {[
            [65,"Tissus", "#e2e8f0"], [235,"Cœur droit", "#dbeafe"], [405,"Poumons", "#dcfce7"], [575,"Cœur gauche", "#fee2e2"], [705,"Tissus", "#e2e8f0"]
          ].map(([x,label,fill]) => <g key={String(label)+x}><circle cx={Number(x)} cy="125" r="48" fill={String(fill)} stroke="#94a3b8" strokeWidth="2"/><text x={Number(x)} y="131" textAnchor="middle" fontSize="15" fontWeight="700" fill="#334155">{String(label)}</text></g>)}
          <line x1="113" y1="125" x2="184" y2="125" stroke="#475569" strokeWidth="4" markerEnd="url(#arrowFlow)" />
          <line x1="283" y1="125" x2="354" y2="125" stroke="#475569" strokeWidth="4" markerEnd="url(#arrowFlow)" />
          <line x1="453" y1="125" x2="524" y2="125" stroke="#475569" strokeWidth="4" markerEnd="url(#arrowFlow)" />
          <line x1="623" y1="125" x2="654" y2="125" stroke="#475569" strokeWidth="4" markerEnd="url(#arrowFlow)" />
          <text x="320" y="203" textAnchor="middle" fontSize="13" fill="#475569">Circulation pulmonaire</text>
          <text x="615" y="203" textAnchor="middle" fontSize="13" fill="#475569">Circulation systémique</text>
        </svg>
        <figcaption style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5, marginTop: 8 }}>
          La circulation pulmonaire oxygène le sang dans les poumons. La circulation systémique distribue ensuite l’oxygène et les nutriments aux tissus.
        </figcaption>
      </figure>

      <figure style={{ margin: 0, border: "1px solid #dfe8f4", borderRadius: 16, padding: 14, background: "#f9fbff" }}>
        <svg viewBox="0 0 760 270" role="img" aria-label="Schéma du système de conduction électrique cardiaque" style={{ width: "100%", height: "auto", display: "block" }}>
          <defs><marker id="arrowElectric" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#7c3aed" /></marker></defs>
          <text x="380" y="26" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0b1f59">Conduction électrique normale</text>
          <ellipse cx="380" cy="145" rx="180" ry="92" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="320" cy="88" r="15" fill="#facc15" stroke="#a16207" strokeWidth="2" />
          <text x="245" y="75" fontSize="14" fontWeight="700" fill="#334155">Nœud sinusal</text>
          <circle cx="380" cy="135" r="13" fill="#fdba74" stroke="#c2410c" strokeWidth="2" />
          <text x="400" y="139" fontSize="14" fontWeight="700" fill="#334155">Nœud AV</text>
          <line x1="330" y1="101" x2="369" y2="126" stroke="#7c3aed" strokeWidth="4" markerEnd="url(#arrowElectric)" />
          <line x1="380" y1="148" x2="380" y2="188" stroke="#7c3aed" strokeWidth="4" markerEnd="url(#arrowElectric)" />
          <path d="M380 188 L330 222" fill="none" stroke="#7c3aed" strokeWidth="4" markerEnd="url(#arrowElectric)" />
          <path d="M380 188 L430 222" fill="none" stroke="#7c3aed" strokeWidth="4" markerEnd="url(#arrowElectric)" />
          <text x="395" y="181" fontSize="13" fill="#334155">Faisceau de His</text>
          <text x="380" y="252" textAnchor="middle" fontSize="13" fill="#334155">Branches droite/gauche → réseau de Purkinje → contraction ventriculaire</text>
        </svg>
        <figcaption style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5, marginTop: 8 }}>
          L’impulsion naît normalement au nœud sinusal, atteint le nœud auriculo-ventriculaire puis descend dans le système His-Purkinje afin de coordonner la contraction ventriculaire.
        </figcaption>
      </figure>
    </div>,
    target
  );
}
