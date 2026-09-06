'use client'

import {useEffect,useMemo,useState} from 'react'
import {createPortal} from 'react-dom'
import {createClient} from '@supabase/supabase-js'
import {downloadAcademicDocx} from './wordDocx'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Role='direction'|'secretary'|''
type AssessmentType='trimester'|'control'
type Decision='pending'|'admitted'|'deferred'
type Student={id:string;name:string;level:string;section:string;year:string}
type Grade={studentId:string;subject:string;score:number;term:string}
type Subject={name:string;coefficient:number}
type School={school_name:string;address:string|null;phone:string|null;email:string|null}|null
type Rank={rank_position:number;cohort_size:number}|null

function norm(v:string){return (v||'').trim().toLowerCase()}
function matchesSelection(term:string,type:AssessmentType,number:number){
 const value=norm(term)
 if(type==='trimester'){
  const terms=[['1er trimestre','1e trimestre','trimestre 1','trimès 1'],['2e trimestre','trimestre 2','trimès 2'],['3e trimestre','trimestre 3','trimès 3']][number-1]||[]
  return terms.includes(value)
 }
 return [`contrôle ${number}`,`controle ${number}`,`control ${number}`,`kontwòl ${number}`,`kontwol ${number}`].includes(value)
}
function esc(v:string){return (v||'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[c]||c))}
function safe(v:string){return (v||'eleve').replace(/[^a-zA-Z0-9À-ÿ_-]+/g,'-')}
function format(n:number){return Number.isInteger(n)?String(n):n.toFixed(1)}
function decisionLabel(ht:boolean,d:Decision){if(d==='admitted')return 'Admis';if(d==='deferred')return ht?'Ajouné':'Ajourné';return ht?'An atant':'En attente'}

export default function RecordsPanel(){
 const [role,setRole]=useState<Role>('')
 const [lang,setLang]=useState<'ht'|'fr'>('ht')
 const [target,setTarget]=useState<HTMLElement|null>(null)
 const [open,setOpen]=useState(false)
 const [students,setStudents]=useState<Student[]>([])
 const [grades,setGrades]=useState<Grade[]>([])
 const [subjects,setSubjects]=useState<Subject[]>([])
 const [school,setSchool]=useState<School>(null)
 const [year,setYear]=useState('')
 const [level,setLevel]=useState('')
 const [section,setSection]=useState('')
 const [studentId,setStudentId]=useState('')
 const [type,setType]=useState<AssessmentType>('trimester')
 const [ranks,setRanks]=useState<Record<number,Rank>>({})
 const [decision,setDecision]=useState<Decision>('pending')
 const [decisionNote,setDecisionNote]=useState('')
 const [decisionMessage,setDecisionMessage]=useState('')
 const [editYearOpen,setEditYearOpen]=useState(false)
 const [editYear,setEditYear]=useState('')
 const [saveMessage,setSaveMessage]=useState('')
 const ht=lang==='ht'

 const load=async()=>{
  const {data:{session}}=await supabase.auth.getSession();const user=session?.user;if(!user)return
  const {data:p}=await supabase.from('school_profiles').select('role').eq('user_id',user.id).maybeSingle()
  const r=(p?.role==='direction'||p?.role==='secretary')?p.role:''
  setRole(r);if(!r)return
  const [sr,gr,mr,sc]=await Promise.all([
   supabase.from('school_students').select('id,name,level,section,academic_year').order('name'),
   supabase.from('school_grades').select('student_id,subject,score,term').eq('status','approved').eq('published',true),
   supabase.from('school_subjects').select('name,coefficient').order('name'),
   supabase.from('school_settings').select('school_name,address,phone,email').eq('id',1).maybeSingle()
  ])
  setStudents((sr.data||[]).map(x=>({id:x.id,name:x.name,level:x.level,section:x.section,year:x.academic_year})))
  setGrades((gr.data||[]).map(x=>({studentId:x.student_id,subject:x.subject||'',score:Number(x.score),term:x.term||''})))
  setSubjects((mr.data||[]).map(x=>({name:x.name,coefficient:Math.max(.01,Number(x.coefficient)||1)})))
  setSchool(sc.data||null)
 }

 useEffect(()=>{load();const {data:l}=supabase.auth.onAuthStateChange(()=>load());const refresh=()=>load();window.addEventListener('school-subject-coefficients-updated',refresh);return()=>{l.subscription.unsubscribe();window.removeEventListener('school-subject-coefficients-updated',refresh)}},[])
 useEffect(()=>{const onLang=(e:Event)=>{const s=(e.target as HTMLElement|null)?.closest?.('[data-global-language-menu] select') as HTMLSelectElement|null;if(s)setLang(s.value==='fr'?'fr':'ht')};document.addEventListener('change',onLang,true);return()=>document.removeEventListener('change',onLang,true)},[])

 useEffect(()=>{
  const attach=()=>{
   if(!role){setTarget(null);return}
   let menu:HTMLElement|null=null
   if(role==='direction'){
    const h=Array.from(document.querySelectorAll('.card h3')).find(x=>['Aksyon rapid','Actions rapides'].includes((x.textContent||'').trim()))
    menu=(h?.closest('.card')?.querySelector('.menu') as HTMLElement|null)||null
    setLang(document.querySelector<HTMLSelectElement>('[data-global-language-menu] select')?.value==='fr'||(h?.textContent||'').includes('Actions')?'fr':'ht')
   }else{
    const h=Array.from(document.querySelectorAll('h2')).find(x=>['Tablo bò pou Sekretarya a','Tableau de bord du Secrétariat'].includes((x.textContent||'').trim()))
    menu=(h?.closest('.card')?.querySelector('.menu') as HTMLElement|null)||null
    setLang(document.querySelector<HTMLSelectElement>('[data-global-language-menu] select')?.value==='fr'||(h?.textContent||'').includes('Tableau')?'fr':'ht')
   }
   if(!menu){setTarget(null);return}
   let mount=menu.querySelector('[data-records-panel-mount]') as HTMLElement|null
   if(!mount){mount=document.createElement('div');mount.setAttribute('data-records-panel-mount','true');mount.style.display='contents';menu.appendChild(mount)}
   setTarget(mount)
  }
  attach();const o=new MutationObserver(()=>requestAnimationFrame(attach));o.observe(document.body,{subtree:true,childList:true});return()=>o.disconnect()
 },[role])

 const years=useMemo(()=>[...new Set(students.map(s=>s.year).filter(Boolean))].sort(),[students])
 const levels=useMemo(()=>[...new Set(students.filter(s=>!year||s.year===year).map(s=>s.level).filter(Boolean))].sort(),[students,year])
 const sections=useMemo(()=>[...new Set(students.filter(s=>(!year||s.year===year)&&(!level||s.level===level)).map(s=>s.section).filter(Boolean))].sort(),[students,year,level])
 const filteredStudents=useMemo(()=>students.filter(s=>(!year||s.year===year)&&(!level||s.level===level)&&(!section||s.section===section)),[students,year,level,section])
 const student=students.find(s=>s.id===studentId)||null
 const studentGrades=useMemo(()=>grades.filter(g=>g.studentId===studentId),[grades,studentId])
 const coeff=(name:string)=>subjects.find(s=>norm(s.name)===norm(name))?.coefficient||1
 const subjectSummary=(rows:Grade[])=>{
  const names=[...new Set(rows.map(r=>r.subject).filter(Boolean))]
  return names.map(name=>{const list=rows.filter(r=>r.subject===name);const avg=list.reduce((a,r)=>a+r.score,0)/list.length;const coefficient=coeff(name);return {name,avg,coefficient,points:avg*coefficient}}).sort((a,b)=>a.name.localeCompare(b.name))
 }
 const groups=useMemo(()=>{
  const count=type==='trimester'?3:4
  return Array.from({length:count},(_,i)=>i+1).map(number=>{const rows=studentGrades.filter(g=>matchesSelection(g.term,type,number));const summary=subjectSummary(rows);const c=summary.reduce((a,r)=>a+r.coefficient,0);const weighted=c?summary.reduce((a,r)=>a+r.points,0)/c:null;return {number,rows,weighted}})
 },[studentGrades,type,subjects])
 const overall=useMemo(()=>{const selected=studentGrades.filter(g=>Array.from({length:type==='trimester'?3:4},(_,i)=>matchesSelection(g.term,type,i+1)).some(Boolean));const s=subjectSummary(selected);const c=s.reduce((a,r)=>a+r.coefficient,0);return c?s.reduce((a,r)=>a+r.points,0)/c:null},[studentGrades,type,subjects])

 useEffect(()=>{
  let active=true
  const run=async()=>{
   if(!studentId){setRanks({});return}
   const count=type==='trimester'?3:4;const out:Record<number,Rank>={}
   await Promise.all(Array.from({length:count},(_,i)=>i+1).map(async n=>{const {data}=await supabase.rpc('school_student_period_rank',{p_student_id:studentId,p_type:type,p_number:n});out[n]=data?.length?{rank_position:Number(data[0].rank_position),cohort_size:Number(data[0].cohort_size)}:null}))
   if(active)setRanks(out)
  }
  run();return()=>{active=false}
 },[studentId,type,grades,subjects])

 useEffect(()=>{
  let active=true
  const run=async()=>{
   if(!student){setDecision('pending');setDecisionNote('');return}
   const {data}=await supabase.from('school_student_decisions').select('decision,note').eq('student_id',student.id).eq('academic_year',student.year).maybeSingle()
   if(active){setDecision((data?.decision||'pending') as Decision);setDecisionNote((data?.note||'').trim());setDecisionMessage('')}
  }
  run();return()=>{active=false}
 },[student?.id,student?.year])

 const resetAfterYear=(v:string)=>{setYear(v);setLevel('');setSection('');setStudentId('');setEditYearOpen(false);setSaveMessage('')}
 const resetAfterLevel=(v:string)=>{setLevel(v);setSection('');setStudentId('');setEditYearOpen(false);setSaveMessage('')}
 const resetAfterSection=(v:string)=>{setSection(v);setStudentId('');setEditYearOpen(false);setSaveMessage('')}
 const chooseStudent=(id:string)=>{setStudentId(id);const s=students.find(x=>x.id===id);setEditYear(s?.year||'');setEditYearOpen(false);setSaveMessage('')}
 const saveAcademicYear=async()=>{if(!student||!editYear.trim())return;const newValue=editYear.trim();const {error}=await supabase.from('school_students').update({academic_year:newValue}).eq('id',student.id);if(error){setSaveMessage(error.message);return}setStudents(list=>list.map(s=>s.id===student.id?{...s,year:newValue}:s));setYear(newValue);setLevel(student.level);setSection(student.section);setSaveMessage(ht?'Ane akademik la modifye avèk siksè.':'Année scolaire modifiée avec succès.');setEditYearOpen(false)}
 const saveDecision=async()=>{if(role!=='direction'||!student)return;setDecisionMessage('');const {error}=await supabase.from('school_student_decisions').upsert({student_id:student.id,academic_year:student.year,decision,note:decisionNote.trim()||null,updated_at:new Date().toISOString()},{onConflict:'student_id,academic_year'});setDecisionMessage(error?(ht?'Erè pandan anrejistreman.':'Erreur lors de l’enregistrement.'):(ht?'✓ Anrejistre':'✓ Enregistré'));if(!error)window.dispatchEvent(new CustomEvent('school-final-decision-updated',{detail:{studentId:student.id,year:student.year}}))}

 const schoolName=school?.school_name||'Portail Scolaire Haïti'
 const contact=[school?.address,school?.phone,school?.email].filter(Boolean).join(' • ')
 const typeLabel=type==='trimester'?(ht?'Trimès':'Trimestre'):(ht?'Kontwòl':'Contrôle')
 const decisionText=decisionLabel(ht,decision)
 const rankText=(n:number)=>ranks[n]?`${ranks[n]!.rank_position}/${ranks[n]!.cohort_size}`:'—'

 const printHtml=()=>{
  const blocks=groups.map(g=>`<section><div class="period"><strong>${typeLabel} ${g.number}</strong><strong>${ht?'Ran':'Rang'}: ${rankText(g.number)} · ${ht?'Mwayèn':'Moyenne'}: ${g.weighted===null?'—':format(g.weighted)+'%'}</strong></div>${g.rows.length?`<table><thead><tr><th>${ht?'Matiyè':'Matière'}</th><th>${ht?'Nòt':'Note'}</th></tr></thead><tbody>${g.rows.map(r=>`<tr><td>${esc(r.subject)}</td><td>${format(r.score)}%</td></tr>`).join('')}</tbody></table>`:`<div class="empty">${ht?'Pa gen nòt pibliye.':'Aucune note publiée.'}</div>`}</section>`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#13213a;font-size:12px}.school{text-align:center;font-size:22px;font-weight:900;color:#0f4c81}.contact{text-align:center;color:#637083;font-size:10px;margin:4px 0 14px}h1{text-align:center}.info{border:1px solid #9fb4c8;padding:10px 12px;display:grid;grid-template-columns:1fr 1fr;gap:7px 18px}.period{display:flex;justify-content:space-between;background:#eaf2f8;border:1px solid #bdccda;padding:8px 10px;margin-top:11px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd7e1;padding:6px 8px}th{text-align:left;background:#f5f8fb}td:last-child{text-align:right}.general{margin-top:16px;border:2px solid #0f4c81;padding:10px 12px;display:flex;justify-content:space-between;font-size:16px;font-weight:900}.decision{margin-top:14px;border:1px solid #cbd7e1;padding:10px 12px}.validation{margin-top:28px;border:1px solid #9fb4c8;border-radius:10px;padding:14px}.validation-grid{display:grid;grid-template-columns:1fr 1fr;gap:26px}.line{padding-top:46px;border-bottom:1px solid #374151}.date{grid-column:1/-1}</style></head><body><div class="school">${esc(schoolName)}</div>${contact?`<div class="contact">${esc(contact)}</div>`:''}<h1>${ht?'RELVE NÒT':'RELEVÉ DE NOTES'} — ${typeLabel}</h1><div class="info"><div><b>${ht?'Elèv':'Élève'}:</b> ${esc(student?.name||'—')}</div><div><b>${ht?'ID Elèv':'ID Élève'}:</b> ${esc(student?.id||'—')}</div><div><b>${ht?'Ane akademik':'Année scolaire'}:</b> ${esc(student?.year||'—')}</div><div><b>${ht?'Klas / Nivo':'Classe / Niveau'}:</b> ${esc(student?.level||'—')}</div><div><b>${ht?'Seksyon':'Section'}:</b> ${esc(student?.section||'—')}</div><div><b>${ht?'Desizyon final':'Décision finale'}:</b> ${esc(decisionText)}</div></div>${blocks}<div class="general"><span>${ht?'Mwayèn jeneral pondérée':'Moyenne générale pondérée'}</span><span>${overall===null?'—':format(overall)+'%'}</span></div>${decisionNote?`<div class="decision"><b>${ht?'Nòt Direksyon':'Note de la Direction'}:</b> ${esc(decisionNote)}</div>`:''}<div class="validation"><b>${ht?'Validasyon dokiman':'Validation du document'}</b><div class="validation-grid"><div><div class="line"></div><b>${ht?'Siyati Direksyon':'Signature de la Direction'}</b></div><div><div class="line"></div><b>${ht?'Kachè lekòl la':'Cachet de l’école'}</b></div><div class="date"><div class="line"></div><b>${ht?'Dat':'Date'}</b></div></div></div></body></html>`
 }
 const download=async()=>{if(!student)return;const info:Array<[string,string]>=[[ht?'Elèv':'Élève',student.name],[ht?'ID Elèv':'ID Élève',student.id],[ht?'Ane akademik':'Année scolaire',student.year],[ht?'Klas / Nivo':'Classe / Niveau',student.level],[ht?'Seksyon':'Section',student.section],[ht?'Desizyon final':'Décision finale',decisionText]];if(decisionNote)info.push([ht?'Nòt Direksyon':'Note de la Direction',decisionNote]);const rows:string[][]=[];groups.forEach(g=>g.rows.forEach(r=>rows.push([`${typeLabel} ${g.number}`,r.subject,`${format(r.score)}%`,rankText(g.number)])));await downloadAcademicDocx({filename:`Releve-not-${safe(student.name)}.docx`,title:`${ht?'RELVE NÒT':'RELEVÉ DE NOTES'} — ${typeLabel.toUpperCase()}`,schoolName,contact,info,headers:[ht?'Peryòd':'Période',ht?'Matiyè':'Matière',ht?'Nòt':'Note',ht?'Ran':'Rang'],rows,generalLabel:ht?'Mwayèn jeneral pondérée':'Moyenne générale pondérée',generalValue:overall===null?'—':`${format(overall)}%`,validationTitle:ht?'Validasyon dokiman':'Validation du document',signatureLabel:ht?'Siyati Direksyon':'Signature de la Direction',stampLabel:ht?'Kachè lekòl la':'Cachet de l’école',dateLabel:ht?'Dat':'Date'})}
 const print=()=>{if(!student)return;const w=window.open('','_blank');if(!w)return;w.document.open();w.document.write(printHtml());w.document.close();w.focus();setTimeout(()=>w.print(),300)}

 if(!target)return null
 return createPortal(<>
  <button type="button" className="menuBtn" onClick={()=>setOpen(v=>!v)}>📑 {ht?'Relve nòt elèv yo':'Relevés de notes des élèves'}</button>
  {open&&<div className="card" data-native-records="true" style={{gridColumn:'1 / -1',marginTop:12}}>
   <h2>{ht?'Relve nòt elèv yo':'Relevés de notes des élèves'}</h2>
   <div className="grid2">
    <div><label>{ht?'Ane akademik':'Année scolaire'}</label><select value={year} onChange={e=>resetAfterYear(e.target.value)}><option value="">{ht?'Tout ane':'Toutes les années'}</option>{years.map(v=><option key={v}>{v}</option>)}</select></div>
    <div><label>{ht?'Klas / Nivo':'Classe / Niveau'}</label><select value={level} onChange={e=>resetAfterLevel(e.target.value)}><option value="">{ht?'Tout klas':'Toutes les classes'}</option>{levels.map(v=><option key={v}>{v}</option>)}</select></div>
    <div><label>{ht?'Seksyon':'Section'}</label><select value={section} onChange={e=>resetAfterSection(e.target.value)}><option value="">{ht?'Tout seksyon':'Toutes les sections'}</option>{sections.map(v=><option key={v}>{v}</option>)}</select></div>
    <div><label>{ht?'Elèv':'Élève'}</label><select value={studentId} onChange={e=>chooseStudent(e.target.value)}><option value="">—</option>{filteredStudents.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
    <div><label>{ht?'Kalite':'Type'}</label><select value={type} onChange={e=>setType(e.target.value as AssessmentType)}><option value="trimester">{ht?'Trimès':'Trimestre'}</option><option value="control">{ht?'Kontwòl':'Contrôle'}</option></select></div>
   </div>
   {student&&<>
    <div style={{marginTop:14,border:'1px solid #dde6ef',borderRadius:12,padding:12,background:'#f8fafc',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><div><strong>{ht?'Elèv':'Élève'}:</strong> {student.name}</div><div><strong>{ht?'ID Elèv':'ID Élève'}:</strong> {student.id}</div><div><strong>{ht?'Ane akademik':'Année scolaire'}:</strong> {student.year}</div><div><strong>{ht?'Klas / Nivo':'Classe / Niveau'}:</strong> {student.level}</div><div><strong>{ht?'Seksyon':'Section'}:</strong> {student.section}</div></div>
    <button type="button" className="btn secondary" style={{marginTop:10}} onClick={()=>{setEditYear(student.year);setEditYearOpen(v=>!v);setSaveMessage('')}}>✏️ {ht?'Modifye ane akademik':'Modifier l’année scolaire'}</button>
    {editYearOpen&&<div style={{marginTop:10,border:'1px solid #dde6ef',borderRadius:12,padding:12}}><label>{ht?'Nouvo ane akademik':'Nouvelle année scolaire'}</label><input value={editYear} onChange={e=>setEditYear(e.target.value)} placeholder="2027–2028"/><div className="row" style={{marginTop:10}}><button type="button" className="btn" onClick={saveAcademicYear}>{ht?'Anrejistre':'Enregistrer'}</button><button type="button" className="btn secondary" onClick={()=>setEditYearOpen(false)}>{ht?'Anile':'Annuler'}</button></div></div>}
    {saveMessage&&<div className="notice" style={{marginTop:10}}>{saveMessage}</div>}
    <div style={{display:'grid',gap:12,marginTop:14}}>{groups.map(g=><div key={g.number} style={{border:'1px solid #dde6ef',borderRadius:12,padding:12}}><div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><strong>{typeLabel} {g.number} <span style={{fontSize:12,color:'#637083',marginLeft:6}}>{ht?'Ran':'Rang'}: {rankText(g.number)}</span></strong><strong>{g.weighted===null?'—':`${ht?'Mwayèn pondérée':'Moyenne pondérée'} ${format(g.weighted)}%`}</strong></div>{g.rows.length?<table style={{marginTop:8}}><tbody>{g.rows.map((r,i)=><tr key={`${g.number}-${i}`}><td>{r.subject}</td><td className="score">{format(r.score)}%</td></tr>)}</tbody></table>:<div className="muted" style={{marginTop:8}}>{ht?'Pa gen nòt pibliye.':'Aucune note publiée.'}</div>}</div>)}</div>
    <div style={{display:'flex',justifyContent:'space-between',marginTop:14,paddingTop:12,borderTop:'2px solid #dde6ef'}}><strong>{ht?'Mwayèn jeneral pondérée':'Moyenne générale pondérée'}</strong><strong>{overall===null?'—':format(overall)+'%'}</strong></div>
    <div style={{marginTop:14,border:'2px solid #d8e2ea',borderRadius:14,padding:14}}>{role==='direction'?<><div style={{fontWeight:800,marginBottom:10}}>{ht?'Desizyon final':'Décision finale'}</div><label>{ht?'Estati':'Statut'}</label><select value={decision} onChange={e=>setDecision(e.target.value as Decision)}><option value="pending">{ht?'An atant':'En attente'}</option><option value="admitted">Admis</option><option value="deferred">{ht?'Ajouné':'Ajourné'}</option></select><label style={{marginTop:10}}>{ht?'Nòt Direksyon (opsyonèl)':'Note de la Direction (facultatif)'}</label><textarea rows={3} value={decisionNote} onChange={e=>setDecisionNote(e.target.value)} style={{width:'100%'}}/><button type="button" className="btn" style={{marginTop:10}} onClick={saveDecision}>{ht?'Anrejistre desizyon':'Enregistrer la décision'}</button>{decisionMessage&&<span style={{marginLeft:10}}>{decisionMessage}</span>}</>:<><div style={{display:'flex',justifyContent:'space-between',gap:12}}><strong>{ht?'Desizyon final':'Décision finale'}</strong><strong style={{color:'#0f4c81'}}>{decisionText}</strong></div>{decisionNote&&<div style={{marginTop:8,color:'#637083'}}>{decisionNote}</div>}</>}</div>
    <div data-native-validation="true" style={{marginTop:20,padding:16,border:'2px solid #9fb4c8',borderRadius:14,background:'#f8fafc'}}>
     <div style={{fontSize:16,fontWeight:900,color:'#0f4c81',marginBottom:18}}>{ht?'Validasyon dokiman':'Validation du document'}</div>
     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'22px 26px'}}>
      <div><div style={{height:52}}></div><div style={{borderTop:'1px solid #374151',paddingTop:7,fontWeight:800}}>{ht?'Siyati Direksyon':'Signature de la Direction'}</div></div>
      <div><div style={{height:52}}></div><div style={{borderTop:'1px solid #374151',paddingTop:7,fontWeight:800}}>{ht?'Kachè lekòl la':'Cachet de l’école'}</div></div>
      <div style={{gridColumn:'1 / -1'}}><div style={{height:28}}></div><div style={{borderTop:'1px solid #374151',paddingTop:7,fontWeight:800}}>{ht?'Dat':'Date'}</div></div>
     </div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:16}}><button type="button" className="btn secondary" onClick={download}>⬇️ {ht?'Telechaje Word':'Télécharger Word'}</button><button type="button" className="btn" onClick={print}>🖨️ {ht?'Enprime':'Imprimer'}</button></div>
   </>}
  </div>}
 </>,target)
}
