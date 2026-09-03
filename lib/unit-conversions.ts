// Educational reference, not an automatic dosing calculator.
export const conversionGroups = [
  { id: "masses", title: "Masses", note: "Vers une unité plus petite, multiplier ; vers une unité plus grande, diviser. µg et mcg désignent le microgramme. Écrire « microgrammes » en cas de risque de confusion.", rows: [
    ["1 kg = 1 000 g", "2,5 kg × 1 000 = 2 500 g"],
    ["1 hg = 100 g ; 1 dag = 10 g", "2 hg = 200 g ; 3 dag = 30 g"],
    ["1 g = 10 dg = 100 cg = 1 000 mg", "0,75 g × 1 000 = 750 mg"],
    ["1 dg = 100 mg ; 1 cg = 10 mg", "2 cg × 10 = 20 mg"],
    ["1 mg = 1 000 microgrammes", "125 microgrammes ÷ 1 000 = 0,125 mg"],
    ["1 microgramme = 1 000 ng", "0,5 microgramme × 1 000 = 500 ng"],
    ["1 ng = 1 000 pg", "2 ng × 1 000 = 2 000 pg"],
  ] },
  { id: "volumes", title: "Volumes", note: "L = litre ; mL = millilitre ; µL = microlitre. Préférer mL à l’ancienne abréviation cc. Un volume en mL ne renseigne pas, à lui seul, sur la dose en mg.", rows: [
    ["1 kL = 1 000 L ; 1 hL = 100 L ; 1 daL = 10 L", "0,2 hL = 20 L"],
    ["1 L = 10 dL = 100 cL = 1 000 mL", "0,75 L × 1 000 = 750 mL"],
    ["1 dL = 100 mL", "2,5 dL × 100 = 250 mL"],
    ["1 cL = 10 mL", "15 cL × 10 = 150 mL"],
    ["1 mL = 1 000 µL", "250 µL ÷ 1 000 = 0,25 mL"],
    ["1 cm³ = 1 mL ; 1 dm³ = 1 L", "5 cm³ = 5 mL"],
  ] },
  { id: "temps", title: "Temps et durée", note: "Convertir toute la durée dans la même unité avant de calculer un débit. 1 h 30 min n’est pas 1,30 h.", rows: [
    ["1 minute = 60 secondes", "90 secondes ÷ 60 = 1,5 minute"],
    ["1 heure = 60 minutes = 3 600 secondes", "1 h 30 min = 90 min = 1,5 h"],
    ["1 jour = 24 heures", "48 h ÷ 24 = 2 jours"],
  ] },
  { id: "poids-taille", title: "Poids et taille du patient", note: "Utiliser un poids récent mesuré en kg lorsque possible. Le facteur 2,2 est une approximation scolaire, pas une égalité exacte. La surface corporelle ne se déduit pas d’une simple conversion de poids.", rows: [
    ["1 lb = 0,45359237 kg (exact)", "150 lb × 0,45359237 ≈ 68,04 kg"],
    ["1 kg ≈ 2,2 lb (approximation)", "154 lb ÷ 2,2 ≈ 70 kg"],
    ["1 oz de masse ≈ 28,35 g", "2 oz de masse ≈ 56,70 g"],
    ["1 m = 100 cm ; 1 cm = 10 mm", "165 cm ÷ 100 = 1,65 m"],
    ["1 pouce = 2,54 cm (exact)", "60 pouces × 2,54 = 152,4 cm"],
    ["1 m² = 10 000 cm²", "0,5 m² = 5 000 cm²"],
  ] },
  { id: "concentrations", title: "Concentrations et pourcentages", note: "Toujours identifier le type de pourcentage : masse/volume (m/v), masse/masse (m/m) ou volume/volume (v/v). La conversion 1 % = 10 mg/mL n’est valable que pour un pourcentage m/v.", rows: [
    ["1 g/L = 1 mg/mL", "2 g/L = 2 mg/mL"],
    ["1 mg/mL = 1 000 microgrammes/mL", "0,2 mg/mL = 200 microgrammes/mL"],
    ["1 mg/dL = 10 mg/L", "80 mg/dL × 10 = 800 mg/L"],
    ["1 % m/v = 1 g/100 mL = 10 mg/mL", "2 % m/v = 20 mg/mL"],
    ["1 % m/m = 1 g/100 g", "Crème à 2 % m/m : 2 g dans 100 g de produit"],
    ["1 % v/v = 1 mL/100 mL de solution finale", "70 % v/v : 70 mL de constituant pour 100 mL finaux"],
  ] },
  { id: "debits", title: "Débits et doses selon le poids", note: "Le facteur gouttes/mL dépend de la tubulure. Les mg/kg/jour et les mg/kg/prise sont différents : la fréquence doit être connue.", rows: [
    ["mL/h ÷ 60 = mL/min", "120 mL/h ÷ 60 = 2 mL/min"],
    ["mL/min × 60 = mL/h", "0,5 mL/min × 60 = 30 mL/h"],
    ["mg/h × 1 000 ÷ 60 = microgrammes/min", "3 mg/h = 50 microgrammes/min"],
    ["gouttes/min = mL/h × facteur de tubulure ÷ 60", "90 mL/h avec 20 gouttes/mL : 30 gouttes/min"],
    ["mg/kg/jour × kg = mg/jour", "15 mg/kg/jour × 20 kg = 300 mg/jour"],
    ["microgrammes/kg/min × kg × 60 = microgrammes/h", "0,1 × 50 × 60 = 300 microgrammes/h"],
  ] },
  { id: "unites-electrolytes", title: "Unités internationales, moles et électrolytes", note: "Pas d’équivalence universelle entre unités internationales et mg : elle dépend de la substance. Pour mmol ↔ mg, connaître la masse molaire et l’espèce chimique exacte ; pour mEq ↔ mmol, connaître la charge de l’ion. Ne jamais improviser une préparation d’électrolytes.", rows: [
    ["1 mol = 1 000 mmol ; 1 mmol = 1 000 µmol", "0,5 mmol = 500 µmol"],
    ["mEq = mmol × valeur absolue de la charge de l’ion", "2 mmol de Ca²⁺ × 2 = 4 mEq de Ca²⁺"],
    ["Pour Na⁺ ou K⁺ : 1 mmol = 1 mEq", "5 mmol de K⁺ = 5 mEq de K⁺"],
    ["mg = mmol × masse molaire en g/mol", "Exercice : 2 mmol d’une substance de masse molaire 50 g/mol = 100 mg"],
    ["mL = unités prescrites ÷ concentration en unités/mL", "Exercice : 10 unités ÷ 100 unités/mL = 0,1 mL"],
  ] },
  { id: "domestiques", title: "Anciennes mesures et mesures domestiques", note: "Repères de lecture uniquement : administrer un liquide oral avec un dispositif gradué en mL, jamais avec une cuillère de cuisine. Ne pas confondre oz (masse) et fl oz (volume). Les volumes américains et impériaux diffèrent.", rows: [
    ["Repère usuel : 1 cuillère à café = 5 mL", "2 cuillères à café, dans ce repère, correspondent à 10 mL"],
    ["Repère usuel : 1 cuillère à soupe = 15 mL", "1 cuillère à soupe correspond à 3 cuillères à café"],
    ["1 fl oz américaine ≈ 29,57 mL", "2 fl oz américaines ≈ 59,15 mL ; souvent arrondies à 60 mL en exercice"],
  ] },
];
export const workedConversions = [
  { title: "De grammes à un volume", steps: ["Prescription fictive : 0,3 g ; solution à 150 mg dans 5 mL.", "Convertir : 0,3 × 1 000 = 300 mg.", "Concentration : 150 ÷ 5 = 30 mg/mL.", "Volume : 300 ÷ 30 = 10 mL."], answer: "10 mL" },
  { title: "De microgrammes à un nombre de comprimés", steps: ["Exercice : 500 microgrammes demandés ; 0,25 mg par comprimé.", "0,25 mg × 1 000 = 250 microgrammes par comprimé.", "500 ÷ 250 = 2 comprimés."], answer: "2 comprimés" },
  { title: "D’une durée mixte à un débit", steps: ["Exercice : 250 mL sur 2 h 30 min.", "Durée : 2 + 30/60 = 2,5 h.", "Débit : 250 ÷ 2,5 = 100 mL/h."], answer: "100 mL/h" },
  { title: "Du pourcentage m/v à la quantité", steps: ["Exercice : solution à 0,9 % m/v ; volume de 100 mL.", "0,9 g/100 mL = 900 mg/100 mL = 9 mg/mL.", "Quantité dans 100 mL : 9 × 100 = 900 mg."], answer: "900 mg de soluté" },
  { title: "D’une dose quotidienne à la dose par prise", steps: ["Prescription fictive : 12 mg/kg/jour en 3 prises ; poids 25 kg.", "Dose par jour : 12 × 25 = 300 mg/jour.", "Dose par prise : 300 ÷ 3 = 100 mg.", "Avec 50 mg/mL : 100 ÷ 50 = 2 mL par prise."], answer: "2 mL par prise dans cet exercice" },
  { title: "D’un débit massique au réglage de pompe", steps: ["Exercice fictif : 0,1 microgramme/kg/min ; 50 kg ; 100 microgrammes/mL.", "Dose par minute : 0,1 × 50 = 5 microgrammes/min.", "Dose par heure : 5 × 60 = 300 microgrammes/h.", "Débit volumique : 300 ÷ 100 = 3 mL/h."], answer: "3 mL/h" },
];
export const conversionReadingText = [...conversionGroups.flatMap(g => [g.title, g.note, ...g.rows.flat()]), ...workedConversions.flatMap(e => [e.title, ...e.steps, e.answer])].join(" ");
