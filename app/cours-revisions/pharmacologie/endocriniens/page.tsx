import Link from 'next/link';
import {redirect,notFound} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import ModuleQuiz from '@/components/ModuleQuiz';

export const dynamic='force-dynamic';
export const revalidate=0;

type Section={id:string;section_key:string;title:string;content:string;display_order:number};
type QuizQuestion={id:string;question_order:number;question_type:string;question:string;option_a:string;option_b:string;option_c:string;option_d:string;correct_answer:string;explanation:string;option_rationales:Record<string,string>|null;learning_point:string};

export default async function Page(){
  const supabase=await createClient();
  const {data:auth}=await supabase.auth.getClaims();
  if(!auth?.claims?.sub)redirect('/connexion');

  const {data:module,error:moduleError}=await supabase.from('learning_modules').select('id,title,summary,estimated_minutes,learning_objectives').eq('slug','endocrinologie-diabete').eq('is_published',true).maybeSingle();
  if(moduleError||!module)notFound();

  const [{data:sections},{data:quiz}]=await Promise.all([
    supabase.from('learning_module_sections').select('id,section_key,title,content,display_order').eq('module_id',module.id).order('display_order'),
    supabase.from('learning_module_quiz_questions').select('id,question_order,question_type,question,option_a,option_b,option_c,option_d,correct_answer,explanation,option_rationales,learning_point').eq('module_id',module.id).order('question_order')
  ]);

  const objectives=Array.isArray(module.learning_objectives)?module.learning_objectives as string[]:[];

  return <main style={{maxWidth:940,margin:'0 auto',padding:'26px 18px 90px'}}>
    <Link href="/cours-revisions" style={{color:'#2563eb',fontWeight:800,fontSize:14}}>← Cours & Révisions</Link>
    <header style={{margin:'18px 0 22px',background:'linear-gradient(135deg,#78350f,#d97706)',color:'white',borderRadius:22,padding:'28px 24px'}}>
      <div style={{opacity:.84,fontSize:13,fontWeight:900,letterSpacing:1}}>PHARMACOLOGIE • ENDOCRINOLOGIE</div>
      <h1 style={{margin:'7px 0 8px',fontSize:34}}>{module.title}</h1>
      <p style={{margin:0,lineHeight:1.65,opacity:.95,maxWidth:780}}>{module.summary}</p>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:16}}><span style={{background:'rgba(255,255,255,.14)',padding:'7px 10px',borderRadius:999,fontSize:13,fontWeight:800}}>⏱️ {module.estimated_minutes} min</span><span style={{background:'rgba(255,255,255,.14)',padding:'7px 10px',borderRadius:999,fontSize:13,fontWeight:800}}>📘 {(sections??[]).length} sections</span><span style={{background:'rgba(255,255,255,.14)',padding:'7px 10px',borderRadius:999,fontSize:13,fontWeight:800}}>📝 {(quiz??[]).length} questions</span></div>
    </header>

    <section style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:18,padding:20,marginBottom:22}}>
      <h2 style={{color:'#92400e',margin:'0 0 10px',fontSize:21}}>Objectifs d’apprentissage</h2>
      <ul style={{margin:0,paddingLeft:21,color:'#334155',lineHeight:1.72}}>{objectives.map(o=><li key={o} style={{marginBottom:6}}>{o}</li>)}</ul>
    </section>

    <section style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:18,padding:20,marginBottom:22}}>
      <h2 style={{color:'#991b1b',margin:'0 0 8px',fontSize:20}}>Priorité de sécurité</h2>
      <p style={{margin:0,color:'#475569',lineHeight:1.72}}>Hypoglycémie sévère, altération de conscience, respiration de Kussmaul, vomissements persistants, déshydratation importante ou suspicion d’acidocétose nécessitent une prise en charge urgente. Chez une personne inconsciente, ne rien administrer par la bouche.</p>
    </section>

    <div style={{display:'grid',gap:14}}>{((sections??[]) as Section[]).map(section=><article key={section.id} style={{background:'white',border:'1px solid #e3e9ef',borderRadius:17,padding:'19px 20px',boxShadow:'0 5px 18px rgba(120,53,15,.04)'}}><h2 style={{fontSize:20,color:'#92400e',margin:'0 0 8px'}}>{section.title}</h2><p style={{margin:0,color:'#475569',lineHeight:1.72}}>{section.content}</p></article>)}</div>

    <ModuleQuiz questions={(quiz??[]) as QuizQuestion[]}/>

    <section style={{marginTop:22,background:'#f8fafc',border:'1px solid #dfe6f0',borderRadius:16,padding:18}}><h2 style={{fontSize:18,color:'#0b1f59',margin:'0 0 8px'}}>Références principales</h2><p style={{margin:0,color:'#64748b',lineHeight:1.65}}>Contenu pédagogique aligné sur les Standards of Care in Diabetes 2026 de l’American Diabetes Association, notamment pour l’insulinothérapie, l’hypoglycémie, le glucagon et les risques associés aux inhibiteurs SGLT2. Les protocoles locaux et prescriptions individuelles restent prioritaires.</p></section>
  </main>;
}
