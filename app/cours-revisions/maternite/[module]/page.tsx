import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getModuleMaternite } from "@/lib/cours/maternite";
import { getComplementsMaternite } from "@/lib/cours/complements-maternite";
import { complementsTravailAccouchement } from "@/lib/cours/complements-travail-accouchement";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const rubriques = [["definition","Définition"],["physiopathologie","Physiopathologie"],["risques","Facteurs de risque"],["manifestations","Manifestations cliniques"],["examens","Examens diagnostiques"],["traitement","Traitement"],["soins","Prise en charge infirmière"],["complications","Complications"],["education","Éducation de la patiente et de la famille"],["points","Points clés à retenir"]] as const;

function Schema({slug}:{slug:string}){
 const schemas:Record<string,{titre:string;etapes:string[]}[]>={
  grossesse:[{titre:"Échanges materno-placento-fœtaux",etapes:["Circulation maternelle","Placenta : échanges O₂, nutriments et déchets","Circulation fœtale"]},{titre:"Surveillance prénatale",etapes:["Évaluer la mère","Suivre croissance et bien-être fœtal","Dépister → prévenir → éduquer"]}],
  "travail-accouchement":[{titre:"Progression du travail",etapes:["Contractions coordonnées","Effacement et dilatation cervicale","Descente et rotation","Naissance → délivrance"]},{titre:"Surveillance intrapartum",etapes:["État maternel","Contractions + progression","Rythme cardiaque fœtal","Réévaluation et intervention si anomalie"]}],
  postpartum:[{titre:"Hémostase après délivrance",etapes:["Naissance du placenta","Contraction du myomètre","Compression des vaisseaux placentaires","Diminution normale du saignement"]},{titre:"Surveillance postpartum",etapes:["Tonus et hauteur utérine","Lochies et pertes","Signes vitaux + vessie + douleur","Détecter hémorragie, infection, HTA, TEV"]}],
  "nouveau-ne":[{titre:"Transition à la vie extra-utérine",etapes:["Premières respirations","Expansion pulmonaire","Baisse résistance pulmonaire","Réorganisation de la circulation"]},{titre:"Priorités des premières heures",etapes:["Respiration","Thermorégulation","Glycémie et alimentation","Prévention infection + observation"]}]
 };
 return <section style={{background:"white",border:"1px solid #e4eaf3",borderRadius:18,padding:20,marginBottom:22}}><h2 style={{color:"#0b1f59",margin:"0 0 15px"}}>Schémas explicatifs</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14}}>{(schemas[slug]||[]).map(s=><div key={s.titre} style={{border:"1px solid #dbe6f5",borderRadius:16,padding:16,background:"#f8fbff"}}><h3 style={{color:"#1748b7",fontSize:16,margin:"0 0 12px"}}>{s.titre}</h3>{s.etapes.map((e,i)=><div key={e} style={{textAlign:"center"}}><div style={{padding:"9px 10px",borderRadius:12,background:"white",border:"1px solid #d7e3f4",fontWeight:700,fontSize:13,color:"#334155"}}>{e}</div>{i<s.etapes.length-1&&<div style={{fontSize:22,color:"#1748b7",lineHeight:1.2}}>↓</div>}</div>)}</div>)}</div></section>
}

export default async function Page({params}:{params:Promise<{module:string}>}){
 const supabase=await createClient(); const {data}=await supabase.auth.getClaims(); if(!data?.claims?.sub) redirect("/connexion");
 const {module:slug}=await params; const module=getModuleMaternite(slug); if(!module) notFound();
 const sujets=[...module.sujets,...getComplementsMaternite(slug),...(slug==="travail-accouchement"?complementsTravailAccouchement:[])];
 return <main style={{maxWidth:920,margin:"0 auto",padding:"26px 18px 90px"}}>
 <Link href="/cours-revisions" style={{color:"#2563eb",fontWeight:800,fontSize:14}}>← Cours & Révisions</Link>
 <header style={{margin:"18px 0 22px",background:"linear-gradient(135deg,#7c1649,#c0266d)",color:"white",borderRadius:22,padding:"28px 24px"}}><div style={{opacity:.82,fontSize:13,fontWeight:800}}>SANTÉ MATERNELLE, OBSTÉTRIQUE ET NÉONATALE</div><h1 style={{margin:"7px 0 8px",fontSize:34}}>{module.titre}</h1><p style={{margin:0,lineHeight:1.6,opacity:.92}}>Révision structurée, surveillance infirmière, urgences et éducation.</p></header>
 <section style={{background:"#fff1f6",border:"1px solid #f4c7da",borderRadius:18,padding:20,marginBottom:22}}><h2 style={{color:"#70143f",margin:"0 0 8px",fontSize:20}}>Objectifs du module</h2><p style={{margin:0,color:"#475569",lineHeight:1.7}}>{module.objectifs}</p></section>
 <section style={{background:"white",border:"1px solid #e4eaf3",borderRadius:18,padding:22,marginBottom:22}}><h2 style={{color:"#0b1f59",margin:"0 0 12px",fontSize:23}}>Bref rappel d’anatomie et de physiologie</h2>{module.rappel.map(t=><p key={t} style={{color:"#334155",lineHeight:1.72,margin:"0 0 10px"}}>{t}</p>)}</section><Schema slug={slug}/>
 <div style={{display:"grid",gap:18}}>{sujets.map((p,index)=><article key={p.nom} style={{background:"white",border:"1px solid #dfe6f0",borderRadius:19,overflow:"hidden",boxShadow:"0 6px 20px rgba(11,31,89,.05)"}}><div style={{background:"#70143f",color:"white",padding:"17px 20px"}}><div style={{fontSize:11,fontWeight:800,opacity:.72,letterSpacing:.8}}>THÈME {index+1}</div><h2 style={{margin:"4px 0 0",fontSize:22}}>{p.nom}</h2></div><div style={{padding:"8px 20px 18px"}}>{rubriques.map(([cle,label])=><section key={cle} style={{padding:"13px 0",borderBottom:cle==="points"?"none":"1px solid #edf1f6"}}><h3 style={{color:cle==="points"?"#137a4d":"#a61e59",fontSize:15,margin:"0 0 6px"}}>{label}</h3><p style={{color:"#334155",lineHeight:1.68,margin:0}}>{p[cle]}</p></section>)}<aside style={{background:"#fff1f6",border:"1px solid #f4c7da",borderRadius:14,padding:14,marginTop:8}}><strong style={{color:"#70143f"}}>Priorité infirmière</strong><p style={{margin:"6px 0 0",color:"#475569",lineHeight:1.65,fontSize:14}}>{p.priorite}</p></aside></div></article>)}</div>
 <section style={{background:"#f8fafc",border:"1px solid #dfe6f0",borderRadius:18,padding:20,marginTop:22}}><h2 style={{color:"#0b1f59",margin:"0 0 12px",fontSize:21}}>Références principales</h2><ol style={{margin:0,paddingLeft:20,display:"grid",gap:10}}>{module.references.map(r=><li key={r.href} style={{fontSize:13}}><a href={r.href} target="_blank" rel="noreferrer" style={{color:"#1748b7",fontWeight:700,textDecoration:"underline"}}>{r.label}</a></li>)}</ol></section>
 </main>
}
