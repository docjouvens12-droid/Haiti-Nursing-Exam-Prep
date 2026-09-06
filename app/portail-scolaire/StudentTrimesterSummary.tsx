'use client'

import {useEffect,useMemo,useState} from 'react'
import {createPortal} from 'react-dom'
import {createClient} from '@supabase/supabase-js'
import {downloadAcademicDocx} from './wordDocx'
import SchoolInfoCard from './SchoolInfoCard'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type AssessmentType='trimester'|'control'
type Decision='pending'|'admitted'|'deferred'
type Grade={score:number;term:string;subject:string}
type StudentInfo={id:string;name:string;level:string;section:string;year:string}|null
type School={school_name:string;address:string|null;phone:string|null;email:string|null;logo_url:string|null}|null
type Rank={rank_position:number;cohort_size:number}|null
type SubjectSummary={subject:string;average:number;coefficient:number}

function norm(v:string){return (v||'').trim().toLowerCase()}
function matchesSelection(term:string,type:AssessmentType,number:number){
 const value=norm(term)
 if(type==='trimester'){
  const terms=[['1er trimestre','1e trimestre','trimestre 1','trimès 1'],['2e trimestre','trimestre 2','trimès 2'],['3e trimestre','trimestre 3','trimès 3']][number-1]||[]
  return terms.includes(value)
 }
 return [`contrôle ${number}`,`controle ${number}`,`control ${number}`,`kontwòl ${number}`,`kontwol ${number}`].includes(value)
}
function subjectSummaries(rows:Grade[],coefficients:Record<string,number>):SubjectSummary[]{
 const grouped=new Map<string,number[]>()
 rows.forEach(g=>{const key=g.subject||'—';const list=grouped.get(key)||[];list.push(g.score);grouped.set(key,list)})
 return Array.from(grouped.entries()).map(([subject,scores])=>({subject,average:scores.reduce((a,b)=>a+b,0)/scores.length,coefficient:Math.max(.01,Number(coefficients[subject]??1)||1)})).sort((a,b)=>a.subject.localeCompare(b.subject))
}
function weightedAverage(rows:Grade[],coefficients:Record<string,number>){
 const items=subjectSummaries(rows,coefficients);const total=items.reduce((a,s)=>a+s.coefficient,0)
 return total?items.reduce((a,s)=>a+s.average*s.coefficient,0)/total:null
}
function rowsForType(rows:Grade[],type:AssessmentType){const count=type==='trimester'?3:4;return rows.filter(g=>Array.from({length:count},(_,i)=>matchesSelection(g.term,type,i+1)).some(Boolean))}
function format(n:number){return Number.isInteger(n)?String(n):n.toFixed(1)}
function esc(v:string){return (v||'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[c]||c))}
function safe(v:string){return (v||'eleve').replace(/[^a-zA-Z0-9À-ÿ_-]+/g,'-')}
function decisionLabel(ht:boolean,d:Decision){if(d==='admitted')return 'Admis';if(d==='deferred')return ht?'Ajouné':'Ajourné';return ht?'An atant':'En attente'}

export default function StudentTrimesterSummary(){
 const [target,setTarget]=useState<HTMLElement|null>(null)
 const [finalTarget,setFinalTarget]=useState<HTMLElement|null>(null)
 const [lang,setLang]=useState<'ht'|'fr'>('fr')
 const [assessmentType,setAssessmentType]=useState<AssessmentType>('trimester')
 const [assessmentNumber,setAssessmentNumber]=useState(1)
 const [showFinal,setShowFinal]=useState(false)
 const [finalType,setFinalType]=useState<AssessmentType>('trimester')
 const [grades,setGrades]=useState<Grade[]>([])
 const [coefficients,setCoefficients]=useState<Record<string,number>>({})
 const [student,setStudent]=useState<StudentInfo>(null)
 const [school,setSchool]=useState<School>(null)
 const [decision,setDecision]=useState<Decision>('pending')
 const [decisionNote,setDecisionNote]=useState('')
 const [ranks,setRanks]=useState<Record<number,Rank>>({})
 const ht=lang==='ht'

 const load=async()=>{
  const {data:{session}}=await supabase.auth.getSession();const user=session?.user;if(!user)return
  const {data:profile}=await supabase.from('school_profiles').select('role,student_id').eq('user_id',user.id).maybeSingle()
  if(profile?.role!=='student'||!profile.student_id)return
  const [gr,sr,mr,sc]=await Promise.all([
   supabase.from('school_grades').select('score,term,subject').eq('student_id',profile.student_id).eq('status','approved').eq('published',true),
   supabase.from('school_students').select('id,name,level,section,academic_year').eq('id',profile.student_id).maybeSingle(),
   supabase.from('school_subjects').select('name,coefficient'),
   supabase.from('school_settings').select('school_name,address,phone,email,logo_url').eq('id',1).maybeSingle()
  ])
  setGrades((gr.data||[]).map(x=>({score:Number(x.score),term:x.term||'',subject:x.subject||''})))
  setCoefficients(Object.fromEntries((mr.data||[]).map(x=>[x.name,Math.max(.01,Number(x.coefficient)||1)])))
  setSchool(sc.data||null)
  if(sr.data){
   const info={id:sr.data.id,name:sr.data.name||'',level:sr.data.level||'',section:sr.data.section||'',year:sr.data.academic_year||''};setStudent(info)
   const {data:d}=await supabase.from('school_student_decisions').select('decision,note').eq('student_id',info.id).eq('academic_year',info.year).maybeSingle()
   setDecision((d?.decision||'pending') as Decision);setDecisionNote((d?.note||'').trim())
  }
 }

 useEffect(()=>{load();const refresh=()=>load();window.addEventListener('school-subject-coefficients-updated',refresh);window.addEventListener('school-final-decision-updated',refresh);window.addEventListener('school-settings-updated',refresh);return()=>{window.removeEventListener('school-subject-coefficients-updated',refresh);window.removeEventListener('school-final-decision-updated',refresh);window.removeEventListener('school-settings-updated',refresh)}},[])
 useEffect(()=>{const sync=()=>setLang(document.querySelector<HTMLSelectElement>('[data-global-language-menu] select')?.value==='ht'?'ht':'fr');sync();const onChange=(e:Event)=>{if((e.target as HTMLElement|null)?.closest?.('[data-global-language-menu]'))sync()};document.addEventListener('change',onChange,true);return()=>document.removeEventListener('change',onChange,true)},[])
 useEffect(()=>{
  const attach=()=>{
   const h=Array.from(document.querySelectorAll('.ps-page h2')).find(x=>['Tablo bò pou Elèv yo','Tableau de bord de l’Élève'].includes((x.textContent||'').trim()))
   const card=h?.closest('.card') as HTMLElement|null;if(!card){setTarget(null);setFinalTarget(null);return}
   let mount=card.querySelector('[data-student-term-mount]') as HTMLElement|null
   if(!mount){mount=document.createElement('div');mount.setAttribute('data-student-term-mount','true');const stats=card.querySelector('.stats');if(stats){const first=stats.querySelector('.stat:first-child') as HTMLElement|null;if(first)first.style.display='none';stats.parentElement?.insertBefore(mount,stats)}else card.appendChild(mount)}
   setTarget(mount)
   const menu=card.querySelector('.menu') as HTMLElement|null
   const bulletin=Array.from(menu?.querySelectorAll('button')||[]).find(b=>['Bilten mwen','Mon bulletin'].some(t=>(b.textContent||'').includes(t))) as HTMLButtonElement|undefined
   if(bulletin){let fm=menu?.querySelector('[data-student-final-report-mount]') as HTMLElement|null;if(!fm){fm=document.createElement('div');fm.setAttribute('data-student-final-report-mount','true');fm.style.display='contents';bulletin.insertAdjacentElement('afterend',fm)}setFinalTarget(fm)}
  }
  attach();const o=new MutationObserver(()=>requestAnimationFrame(attach));o.observe(document.body,{subtree:true,childList:true});return()=>o.disconnect()
 },[])
 useEffect(()=>{
  let active=true
  const run=async()=>{
   if(!student){setRanks({});return}
   const count=finalType==='trimester'?3:4;const out:Record<number,Rank>={}
   await Promise.all(Array.from({length:count},(_,i)=>i+1).map(async n=>{const {data}=await supabase.rpc('school_student_period_rank',{p_student_id:student.id,p_type:finalType,p_number:n});out[n]=data?.length?{rank_position:Number(data[0].rank_position),cohort_size:Number(data[0].cohort_size)}:null}))
   if(active)setRanks(out)
  }
  run();return()=>{active=false}
 },[student?.id,finalType,grades,coefficients])

 const selectedRows=useMemo(()=>grades.filter(g=>matchesSelection(g.term,assessmentType,assessmentNumber)),[grades,assessmentType,assessmentNumber])
 const selectedAverage=useMemo(()=>weightedAverage(selectedRows,coefficients),[selectedRows,coefficients])
 const typeAverage=useMemo(()=>weightedAverage(rowsForType(grades,assessmentType),coefficients),[grades,assessmentType,coefficients])
 const finalGeneralAverage=useMemo(()=>weightedAverage(rowsForType(grades,finalType),coefficients),[grades,finalType,coefficients])
 const finalGroups=useMemo(()=>Array.from({length:finalType==='trimester'?3:4},(_,i)=>i+1).map(number=>{const rows=grades.filter(g=>matchesSelection(g.term,finalType,number));return {number,rows,subjects:subjectSummaries(rows,coefficients),avg:weightedAverage(rows,coefficients)}}),[grades,finalType,coefficients])
 const rankText=(n:number)=>ranks[n]?`${ranks[n]!.rank_position}/${ranks[n]!.cohort_size}`:'—'
 const schoolName=school?.school_name||'Portail Scolaire Haïti'
 const contact=[school?.address,school?.phone,school?.email].filter(Boolean).join(' • ')
 const typeLabel=finalType==='trimester'?(ht?'Trimès':'Trimestre'):(ht?'Kontwòl':'Contrôle')
 const decisionText=decisionLabel(ht,decision)

 const printHtml=()=>{
  const sections=finalGroups.map(g=>`<section><div class="period"><strong>${typeLabel} ${g.number}</strong><strong>${ht?'Ran':'Rang'}: ${rankText(g.number)} · ${ht?'Mwayèn':'Moyenne'}: ${g.avg===null?'—':format(g.avg)+'%'}</strong></div>${g.subjects.length?`<table><thead><tr><th>${ht?'Matiyè':'Matière'}</th><th>${ht?'Koefisyan':'Coefficient'}</th><th>${ht?'Mwayèn':'Moyenne'}</th></tr></thead><tbody>${g.subjects.map(s=>`<tr><td>${esc(s.subject)}</td><td>${format(s.coefficient)}</td><td>${format(s.average)}%</td></tr>`).join('')}</tbody></table>`:`<div>${ht?'Pa gen nòt pibliye.':'Aucune note publiée.'}</div>`}</section>`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#13213a;font-size:12px}.school{text-align:center;font-size:22px;font-weight:900;color:#0f4c81}.contact{text-align:center;color:#637083;font-size:10px;margin:4px 0 14px}h1{text-align:center}.info{border:1px solid #9fb4c8;padding:10px 12px;display:grid;grid-template-columns:1fr 1fr;gap:7px 18px}.period{display:flex;justify-content:space-between;background:#eaf2f8;border:1px solid #bdccda;padding:8px 10px;margin-top:11px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd7e1;padding:6px 8px}th{text-align:left;background:#f5f8fb}td:nth-child(n+2){text-align:right}.general{margin-top:16px;border:2px solid #0f4c81;padding:10px 12px;display:flex;justify-content:space-between;font-size:16px;font-weight:900}.decision{margin-top:14px;border:1px solid #cbd7e1;padding:10px 12px}.validation{margin-top:28px;border:1px solid #9fb4c8;border-radius:10px;padding:14px}.validation-grid{display:grid;grid-template-columns:1fr 1fr;gap:26px}.line{padding-top:46px;border-bottom:1px solid #374151}.date{grid-column:1/-1}</style></head><body><div class="school">${esc(schoolName)}</div>${contact?`<div class="contact">${esc(contact)}</div>`:''}<h1>${ht?'RELVE NÒT MWEN':'MON RELEVÉ DE NOTES'} — ${typeLabel}</h1><div class="info"><div><b>${ht?'Elèv':'Élève'}:</b> ${esc(student?.name||'—')}</div><div><b>${ht?'ID Elèv':'ID Élève'}:</b> ${esc(student?.id||'—')}</div><div><b>${ht?'Ane akademik':'Année scolaire'}:</b> ${esc(student?.year||'—')}</div><div><b>${ht?'Klas / Nivo':'Classe / Niveau'}:</b> ${esc(student?.level||'—')}</div><div><b>${ht?'Seksyon':'Section'}:</b> ${esc(student?.section||'—')}</div><div><b>${ht?'Desizyon final':'Décision finale'}:</b> ${esc(decisionText)}</div></div>${sections}<div class="general"><span>${ht?'Mwayèn jeneral pondérée':'Moyenne générale pondérée'}</span><span>${finalGeneralAverage===null?'—':format(finalGeneralAverage)+'%'}</span></div>${decisionNote?`<div class="decision"><b>${ht?'Nòt Direksyon':'Note de la Direction'}:</b> ${esc(decisionNote)}</div>`:''}<div class="validation"><b>${ht?'Validasyon dokiman':'Validation du document'}</b><div class="validation-grid"><div><div class="line"></div><b>${ht?'Siyati Direksyon':'Signature de la Direction'}</b></div><div><div class="line"></div><b>${ht?'Kachè lekòl la':'Cachet de l’école'}</b></div><div class="date"><div class="line"></div><b>${ht?'Dat':'Date'}</b></div></div></div></body></html>`
 }
 const download=async()=>{
  if(!student)return
  const info:Array<[string,string]>=[[ht?'Elèv':'Élève',student.name],[ht?'ID Elèv':'ID Élève',student.id],[ht?'Ane akademik':'Année scolaire',student.year],[ht?'Klas / Nivo':'Classe / Niveau',student.level],[ht?'Seksyon':'Section',student.section],[ht?'Desizyon final':'Décision finale',decisionText]]
  if(decisionNote)info.push([ht?'Nòt Direksyon':'Note de la Direction',decisionNote])
  const rows:string[][]=[];finalGroups.forEach(g=>g.subjects.forEach(s=>rows.push([`${typeLabel} ${g.number}`,s.subject,format(s.coefficient),`${format(s.average)}%`,rankText(g.number)])))
  await downloadAcademicDocx({filename:`Releve-not-${safe(student.name)}.docx`,title:`${ht?'RELVE NÒT MWEN':'MON RELEVÉ DE NOTES'} — ${typeLabel.toUpperCase()}`,schoolName,contact,info,headers:[ht?'Peryòd':'Période',ht?'Matiyè':'Matière',ht?'Koefisyan':'Coefficient',ht?'Mwayèn':'Moyenne',ht?'Ran':'Rang'],rows,generalLabel:ht?'Mwayèn jeneral pondérée':'Moyenne générale pondérée',generalValue:finalGeneralAverage===null?'—':`${format(finalGeneralAverage)}%`,validationTitle:ht?'Validasyon dokiman':'Validation du document',signatureLabel:ht?'Siyati Direksyon':'Signature de la Direction',stampLabel:ht?'Kachè lekòl la':'Cachet de l’école',dateLabel:ht?'Dat':'Date'})
 }
 const print=()=>{if(!student)return;const w=window.open('','_blank');if(!w)return;w.document.open();w.document.write(printHtml());w.document.close();w.focus();setTimeout(()=>w.print(),300)}

 if(!target)return null
 const selectedLabel=assessmentType==='trimester'?`${ht?'Mwayèn Trimès':'Moyenne Trimestre'} ${assessmentNumber}`:`${ht?'Mwayèn Kontwòl':'Moyenne Contrôle'} ${assessmentNumber}`
 const generalLabel=assessmentType==='trimester'?(ht?'Mwayèn jeneral Trimès':'Moyenne générale des trimestres'):(ht?'Mwayèn jeneral Kontwòl':'Moyenne générale des contrôles')
 const summary=createPortal(<div style={{marginBottom:14}}><div style={{border:'1px solid #dde6ef',borderRadius:14,padding:14,background:'#f8fafc'}}><div style={{fontWeight:800,marginBottom:10}}>{ht?'Chwazi rezilta pou wè':'Choisir le résultat à afficher'}</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}><div><label>{ht?'Kalite':'Type'}</label><select value={assessmentType} onChange={e=>{setAssessmentType(e.target.value as AssessmentType);setAssessmentNumber(1)}}><option value="trimester">{ht?'Trimès':'Trimestre'}</option><option value="control">{ht?'Kontwòl':'Contrôle'}</option></select></div><div><label>{ht?'Nimewo':'Numéro'}</label><select value={assessmentNumber} onChange={e=>setAssessmentNumber(Number(e.target.value))}>{(assessmentType==='trimester'?[1,2,3]:[1,2,3,4]).map(n=><option key={n} value={n}>{n}</option>)}</select></div></div><div style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid #dde6ef',paddingTop:12}}><span style={{fontWeight:700}}>{selectedLabel}</span><strong style={{fontSize:24,color:'#0f4c81'}}>{selectedAverage===null?'—':format(selectedAverage)+'%'}</strong></div></div><div style={{marginTop:10,border:'1px solid #dde6ef',borderRadius:14,padding:14,background:'#fff',display:'flex',justifyContent:'space-between',gap:12}}><strong>{generalLabel}</strong><strong style={{fontSize:24,color:'#0f4c81'}}>{typeAverage===null?'—':format(typeAverage)+'%'}</strong></div></div>,target)
 const finalReport=finalTarget?createPortal(<><button className="menuBtn" type="button" onClick={()=>setShowFinal(v=>!v)}>📑 {ht?'Relve nòt mwen':'Mon relevé de notes'}</button>{showFinal&&<div className="card" data-native-student-record="true" style={{marginTop:12,gridColumn:'1 / -1'}}><SchoolInfoCard school={school} ht={ht}/><h2>{ht?'Relve nòt mwen':'Mon relevé de notes'}</h2><div style={{border:'1px solid #dde6ef',borderRadius:12,padding:12,background:'#f8fafc',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}><div><strong>{ht?'Elèv':'Élève'}:</strong> {student?.name||'—'}</div><div><strong>{ht?'ID Elèv':'ID Élève'}:</strong> {student?.id||'—'}</div><div><strong>{ht?'Ane akademik':'Année scolaire'}:</strong> {student?.year||'—'}</div><div><strong>{ht?'Klas / Nivo':'Classe / Niveau'}:</strong> {student?.level||'—'}</div><div><strong>{ht?'Seksyon':'Section'}:</strong> {student?.section||'—'}</div><div><strong>{ht?'Desizyon final':'Décision finale'}:</strong> {decisionText}</div></div><div style={{marginBottom:14}}><label>{ht?'Kalite':'Type'}</label><select value={finalType} onChange={e=>setFinalType(e.target.value as AssessmentType)}><option value="trimester">{ht?'Trimès':'Trimestre'}</option><option value="control">{ht?'Kontwòl':'Contrôle'}</option></select></div><div style={{display:'grid',gap:12}}>{finalGroups.map(g=><div key={g.number} style={{border:'1px solid #dde6ef',borderRadius:12,padding:12}}><div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><strong>{typeLabel} {g.number} <span style={{fontSize:12,color:'#637083',marginLeft:6}}>{ht?'Ran':'Rang'}: {rankText(g.number)}</span></strong><strong>{g.avg===null?'—':`${ht?'Mwayèn pondérée':'Moyenne pondérée'} ${format(g.avg)}%`}</strong></div>{g.subjects.length?<table style={{marginTop:8}}><thead><tr><th>{ht?'Matiyè':'Matière'}</th><th>{ht?'Koefisyan':'Coefficient'}</th><th>{ht?'Mwayèn':'Moyenne'}</th></tr></thead><tbody>{g.subjects.map(s=><tr key={s.subject}><td>{s.subject}</td><td>{format(s.coefficient)}</td><td className="score">{format(s.average)}%</td></tr>)}</tbody></table>:<div className="muted" style={{marginTop:8}}>{ht?'Pa gen nòt pibliye.':'Aucune note publiée.'}</div>}</div>)}</div><div style={{display:'flex',justifyContent:'space-between',marginTop:14,paddingTop:12,borderTop:'2px solid #dde6ef'}}><strong>{ht?'Mwayèn jeneral pondérée':'Moyenne générale pondérée'}</strong><strong>{finalGeneralAverage===null?'—':format(finalGeneralAverage)+'%'}</strong></div><div style={{marginTop:14,border:'2px solid #d8e2ea',borderRadius:14,padding:14}}><div style={{display:'flex',justifyContent:'space-between',gap:12}}><strong>{ht?'Desizyon final':'Décision finale'}</strong><strong style={{color:'#0f4c81'}}>{decisionText}</strong></div>{decisionNote&&<div style={{marginTop:8,color:'#637083'}}>{decisionNote}</div>}</div><div data-native-validation="true" style={{marginTop:16,border:'2px solid #9fb4c8',borderRadius:14,padding:16,background:'#f8fbfd'}}><h3 style={{marginTop:0,color:'#0f4c81'}}>{ht?'Validasyon dokiman':'Validation du document'}</h3><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:22}}><div><div style={{height:52,borderBottom:'1px solid #374151'}}></div><strong>{ht?'Siyati Direksyon':'Signature de la Direction'}</strong></div><div><div style={{height:52,borderBottom:'1px solid #374151'}}></div><strong>{ht?'Kachè lekòl la':'Cachet de l’école'}</strong></div><div style={{gridColumn:'1 / -1'}}><div style={{height:52,borderBottom:'1px solid #374151'}}></div><strong>{ht?'Dat':'Date'}</strong></div></div></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:16}}><button type="button" className="btn secondary" onClick={download}>⬇️ {ht?'Telechaje Word':'Télécharger Word'}</button><button type="button" className="btn" onClick={print}>🖨️ {ht?'Enprime':'Imprimer'}</button></div></div>}</>,finalTarget):null
 return <>{summary}{finalReport}</>
}
