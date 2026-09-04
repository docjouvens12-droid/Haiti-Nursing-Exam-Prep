import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {getModuleComm} from "@/lib/cours/sante-communautaire";
import {getComplementComm} from "@/lib/cours/complements-sante-communautaire";

export const dynamic="force-dynamic";
export const revalidate=0;

const rubriques=[["definition","Définition"],["principes","Principes et mécanismes"],["evaluation","Évaluation communautaire"],["interventions","Interventions infirmières"],["surveillance","Surveillance et suivi"],["prevention","Prévention"],["education","Éducation et communication"],["complications","Risques et complications"],["points","Points clés à retenir"]] as const;

const vigilances:Record<string,string>={
  prevention:"Priorité : repérer les groupes à risque, intervenir en prévention primaire avant la maladie, organiser le dépistage lorsque pertinent et orienter rapidement toute personne présentant un signe d’alarme.",
  epidemiologie:"Priorité : toute augmentation inhabituelle de cas, maladie à déclaration obligatoire ou regroupement spatio-temporel suspect doit être documenté et signalé selon le système local de surveillance.",
  famille:"Priorité : lors d’une visite à domicile, évaluer d’abord sécurité, besoins essentiels, adhésion thérapeutique, capacité de l’aidant et signes nécessitant une orientation urgente.",
  education:"Priorité : adapter le message au niveau de compréhension, vérifier la compréhension par reformulation et corriger les fausses croyances sans culpabiliser la personne ou la communauté.",
  infectieuses:"Priorité : identifier précocement le mode de transmission, appliquer les mesures de prévention adaptées, protéger les contacts vulnérables et signaler rapidement toute suspicion de flambée.",
  vaccination:"Priorité : respecter la chaîne du froid, vérifier indications et contre-indications réelles, ne pas utiliser un vaccin compromis et savoir reconnaître une anaphylaxie après vaccination.",
  "vih-ist":"Priorité : confidentialité, consentement, réduction de la transmission, dépistage approprié des partenaires selon les règles locales et orientation rapide en cas d’exposition ou de signes d’infection sévère.",
  tuberculose:"Priorité : toux persistante ou suspicion de tuberculose contagieuse impose mesures de prévention respiratoire, évaluation rapide, recherche des contacts et soutien de l’observance thérapeutique.",
  nutrition:"Priorité : reconnaître rapidement malnutrition aiguë, déshydratation, perte pondérale importante, œdèmes nutritionnels ou incapacité à s’alimenter et orienter selon la gravité.",
  chroniques:"Priorité : rechercher les signes de décompensation aiguë d’hypertension, diabète, maladie respiratoire ou cardiaque avant de poursuivre l’éducation communautaire de routine.",
  catastrophes:"Priorité : en situation de catastrophe, appliquer triage, sécurité de la scène, besoins vitaux, eau/assainissement, prévention des épidémies et protection des populations vulnérables avant les interventions non urgentes."
};

function Vigilance({slug}:{slug:string}){const texte=vigilances[slug];if(!texte)return null;return <section style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:18,padding:20,marginBottom:22}}><h2 style={{color:"#9a3412",margin:"0 0 8px",fontSize:20}}>Vigilance clinique et santé publique</h2><p style={{color:"#475569",lineHeight:1.7,margin:0}}>{texte}</p></section>}

export default async function Page({params}:{params:Promise<{module:string}>}){
  const supabase=await createClient();
  const {data}=await supabase.auth.getClaims();
  if(!data?.claims?.sub)redirect("/connexion");
  const {module:slug}=await params;
  const module=getModuleComm(slug)??getComplementComm(slug);
  if(!module)notFound();
  return <main style={{maxWidth:920,margin:"0 auto",padding:"26px 18px 90px"}}>
    <Link href="/cours-revisions" style={{color:"#2563eb",fontWeight:800}}>← Cours & Révisions</Link>
    <header style={{margin:"18px 0 22px",background:"linear-gradient(135deg,#065f46,#10b981)",color:"white",borderRadius:22,padding:"28px 24px"}}>
      <div style={{fontSize:13,fontWeight:800,opacity:.82}}>SANTÉ COMMUNAUTAIRE ET SANTÉ PUBLIQUE</div>
      <h1 style={{fontSize:34,margin:"7px 0"}}>{module.titre}</h1>
      <p style={{lineHeight:1.6,margin:0}}>Prévention, surveillance, éducation, familles et interventions au niveau de la communauté.</p>
    </header>
    <section style={{background:"#ecfdf5",border:"1px solid #a7f3d0",borderRadius:18,padding:20,marginBottom:22}}>
      <h2 style={{color:"#047857",margin:"0 0 8px"}}>Objectifs du module</h2>
      <p style={{color:"#475569",lineHeight:1.7,margin:0}}>{module.objectifs}</p>
    </section>
    <section style={{background:"white",border:"1px solid #e5e7eb",borderRadius:18,padding:20,marginBottom:22}}>
      <h2 style={{color:"#0b1f59"}}>Bref rappel</h2>
      {module.rappel.map(r=><p key={r} style={{color:"#475569",lineHeight:1.7}}>{r}</p>)}
    </section>
    <Vigilance slug={slug}/>
    <div style={{display:"grid",gap:18}}>{module.sujets.map((p,i)=><article key={p.nom} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:19,overflow:"hidden"}}>
      <div style={{background:"#047857",color:"white",padding:"17px 20px"}}><div style={{fontSize:11,fontWeight:800,opacity:.75}}>THÈME {i+1}</div><h2 style={{margin:"4px 0 0"}}>{p.nom}</h2></div>
      <div style={{padding:"8px 20px 18px"}}>{rubriques.map(([k,l])=><section key={k} style={{padding:"13px 0",borderBottom:k==="points"?"none":"1px solid #edf1f6"}}><h3 style={{color:k==="points"?"#137a4d":"#047857",fontSize:15,margin:"0 0 6px"}}>{l}</h3><p style={{color:"#334155",lineHeight:1.68,margin:0}}>{p[k]}</p></section>)}<aside style={{background:"#ecfdf5",border:"1px solid #a7f3d0",borderRadius:14,padding:14}}><strong style={{color:"#047857"}}>Priorité infirmière</strong><p style={{color:"#475569",lineHeight:1.65,margin:"6px 0 0"}}>{p.priorite}</p></aside></div>
    </article>)}</div>
  </main>;
}
