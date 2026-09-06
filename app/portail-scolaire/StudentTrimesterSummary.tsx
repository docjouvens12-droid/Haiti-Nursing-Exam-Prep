'use client'

import {useEffect,useMemo,useState} from 'react'
import {createPortal} from 'react-dom'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Grade={score:number;term:string;subject:string}
type StudentInfo={name:string;level:string;section:string;year:string}|null
type AssessmentType='trimester'|'control'
type SubjectSummary={subject:string;average:number;coefficient:number}

function matchesSelection(term:string,type:AssessmentType,number:number){
 const value=term.trim().toLowerCase()
 if(type==='trimester'){
  const legacy=[
   ['1er trimestre','1e trimestre','trimestre 1','trimès 1'],
   ['2e trimestre','trimestre 2','trimès 2'],
   ['3e trimestre','trimestre 3','trimès 3']
  ][number-1]||[]
  return legacy.some(x=>value===x)
 }
 return [`contrôle ${number}`,`controle ${number}`,`control ${number}`,`kontwòl ${number}`,`kontwol ${number}`].some(x=>value===x)
}

function subjectSummaries(rows:Grade[],coefficients:Record<string,number>):SubjectSummary[]{
 const bySubject=new Map<string,number[]>()
 rows.forEach(g=>{
  const key=g.subject||'—'
  const list=bySubject.get(key)||[]
  list.push(g.score)
  bySubject.set(key,list)
 })
 return Array.from(bySubject.entries()).map(([subject,scores])=>({
  subject,
  average:Math.round(scores.reduce((a,b)=>a+b,0)/scores.length),
  coefficient:Math.max(0.01,Number(coefficients[subject]??1)||1)
 })).sort((a,b)=>a.subject.localeCompare(b.subject))
}

function weightedAverage(rows:Grade[],coefficients:Record<string,number>){
 const subjects=subjectSummaries(rows,coefficients)
 if(!subjects.length)return null
 const totalWeight=subjects.reduce((a,s)=>a+s.coefficient,0)
 if(!totalWeight)return null
 return Math.round(subjects.reduce((a,s)=>a+s.average*s.coefficient,0)/totalWeight)
}

function rowsForType(rows:Grade[],type:AssessmentType){
 const count=type==='trimester'?3:4
 return rows.filter(g=>Array.from({length:count},(_,i)=>i+1).some(n=>matchesSelection(g.term,type,n)))
}

function escapeHtml(value:string){return value.replace(/[&<>'\"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'\"':'&quot;'}[char]||char))}

export default function StudentTrimesterSummary(){
 const [target,setTarget]=useState<HTMLElement|null>(null)
 const [finalTarget,setFinalTarget]=useState<HTMLElement|null>(null)
 const [lang,setLang]=useState<'ht'|'fr'>('ht')
 const [assessmentType,setAssessmentType]=useState<AssessmentType>('trimester')
 const [assessmentNumber,setAssessmentNumber]=useState(1)
 const [showFinal,setShowFinal]=useState(false)
 const [finalType,setFinalType]=useState<AssessmentType>('trimester')
 const [grades,setGrades]=useState<Grade[]>([])
 const [coefficients,setCoefficients]=useState<Record<string,number>>({})
 const [student,setStudent]=useState<StudentInfo>(null)

 useEffect(()=>{
  let cancelled=false
  const load=async()=>{
   const {data:{session}}=await supabase.auth.getSession();const user=session?.user;if(!user)return
   const {data:profile}=await supabase.from('school_profiles').select('role,student_id').eq('user_id',user.id).maybeSingle()
   if(cancelled||profile?.role!=='student'||!profile.student_id)return
   const [gradesResult,studentResult,subjectsResult]=await Promise.all([
    supabase.from('school_grades').select('score,term,subject').eq('student_id',profile.student_id).eq('status','approved').eq('published',true),
    supabase.from('school_students').select('name,level,section,academic_year').eq('id',profile.student_id).maybeSingle(),
    supabase.from('school_subjects').select('name,coefficient')
   ])
   if(cancelled)return
   setGrades((gradesResult.data||[]).map(x=>({score:Number(x.score),term:x.term,subject:x.subject||''})))
   setCoefficients(Object.fromEntries((subjectsResult.data||[]).map(x=>[x.name,Math.max(0.01,Number(x.coefficient)||1)])))
   if(studentResult.data)setStudent({name:studentResult.data.name||'',level:studentResult.data.level||'',section:studentResult.data.section||'',year:studentResult.data.academic_year||''})
  }
  load()
  const onCoefficients=()=>load()
  window.addEventListener('school-subject-coefficients-updated',onCoefficients)
  return()=>{cancelled=true;window.removeEventListener('school-subject-coefficients-updated',onCoefficients)}
 },[])

 useEffect(()=>{
  const onLang=(e:Event)=>{const b=(e.target as HTMLElement|null)?.closest?.('.langChoice') as HTMLButtonElement|null;if(b)setLang((b.textContent||'').includes('Français')?'fr':'ht')}
  document.addEventListener('click',onLang,true);return()=>document.removeEventListener('click',onLang,true)
 },[])

 useEffect(()=>{
  const attach=()=>{
   const headings=Array.from(document.querySelectorAll('.ps-page h2'))
   const h=headings.find(x=>['Tablo bò pou Elèv yo','Tableau de bord de l’Élève'].includes((x.textContent||'').trim()))
   const card=h?.closest('.card') as HTMLElement|null
   if(!card){setTarget(null);setFinalTarget(null);return}
   setLang((h?.textContent||'').includes('Tableau')?'fr':'ht')
   let mount=card.querySelector('[data-student-term-mount]') as HTMLElement|null
   if(!mount){
    mount=document.createElement('div');mount.setAttribute('data-student-term-mount','true')
    const stats=card.querySelector('.stats')
    if(stats){const first=stats.querySelector('.stat:first-child') as HTMLElement|null;if(first)first.style.display='none';stats.parentElement?.insertBefore(mount,stats)}
    else card.appendChild(mount)
   }
   setTarget(mount)
   const menu=card.querySelector('.menu') as HTMLElement|null
   const buttons=menu?Array.from(menu.querySelectorAll('button')):[]
   const bulletin=buttons.find(b=>['Bilten mwen','Mon bulletin'].some(t=>(b.textContent||'').includes(t))) as HTMLButtonElement|undefined
   if(bulletin){
    let finalMount=menu?.querySelector('[data-student-final-report-mount]') as HTMLElement|null
    if(!finalMount){finalMount=document.createElement('div');finalMount.setAttribute('data-student-final-report-mount','true');finalMount.style.display='contents';bulletin.insertAdjacentElement('afterend',finalMount)}
    setFinalTarget(finalMount)
   }
  }
  attach();const observer=new MutationObserver(()=>requestAnimationFrame(attach));observer.observe(document.body,{subtree:true,childList:true});return()=>observer.disconnect()
 },[])

 const selectedRows=useMemo(()=>grades.filter(g=>matchesSelection(g.term,assessmentType,assessmentNumber)),[grades,assessmentType,assessmentNumber])
 const selectedAverage=useMemo(()=>weightedAverage(selectedRows,coefficients),[selectedRows,coefficients])
 const typeAverage=useMemo(()=>weightedAverage(rowsForType(grades,assessmentType),coefficients),[grades,assessmentType,coefficients])
 const finalGeneralAverage=useMemo(()=>weightedAverage(rowsForType(grades,finalType),coefficients),[grades,finalType,coefficients])
 const finalGroups=useMemo(()=>{
  const count=finalType==='trimester'?3:4
  return Array.from({length:count},(_,i)=>i+1).map(number=>{
   const rows=grades.filter(g=>matchesSelection(g.term,finalType,number))
   return {number,rows,subjects:subjectSummaries(rows,coefficients),avg:weightedAverage(rows,coefficients)}
  })
 },[grades,finalType,coefficients])

 if(!target)return null
 const ht=lang==='ht'
 const selectedLabel=assessmentType==='trimester'?`${ht?'Mwayèn Trimès':'Moyenne Trimestre'} ${assessmentNumber}`:`${ht?'Mwayèn Kontwòl':'Moyenne Contrôle'} ${assessmentNumber}`
 const generalLabel=assessmentType==='trimester'?(ht?'Mwayèn jeneral Trimès':'Moyenne générale des trimestres'):(ht?'Mwayèn jeneral Kontwòl':'Moyenne générale des contrôles')

 const finalReportHtml=()=>{
  const typeLabel=finalType==='trimester'?(ht?'Trimès':'Trimestre'):(ht?'Kontwòl':'Contrôle')
  const sections=finalGroups.map(group=>{
   const rows=group.subjects.length?`<table><thead><tr><th>${ht?'Matiyè':'Matière'}</th><th>${ht?'Koefisyan':'Coefficient'}</th><th>${ht?'Mwayèn':'Moyenne'}</th></tr></thead><tbody>${group.subjects.map(s=>`<tr><td>${escapeHtml(s.subject)}</td><td>${s.coefficient}</td><td>${s.average}%</td></tr>`).join('')}</tbody></table>`:`<p class="empty">${ht?'Pa gen nòt pibliye.':'Aucune note publiée.'}</p>`
   return `<section><div class="section-title"><strong>${typeLabel} ${group.number}</strong><strong>${group.avg===null?'—':`${ht?'Mwayèn pondérée':'Moyenne pondérée'}: ${group.avg}%`}</strong></div>${rows}</section>`
  }).join('')
  const title=ht?'Relve nòt mwen':'Mon relevé de notes'
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>@page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;color:#182433;margin:0;font-size:12px}h1{text-align:center;color:#0f4c81;margin:0 0 4px;font-size:22px}.school{text-align:center;font-weight:700;margin-bottom:14px}.student{border:1px solid #cfd9e3;padding:9px 12px;margin-bottom:12px;display:grid;grid-template-columns:1fr 1fr;gap:5px 18px}.section-title{display:flex;justify-content:space-between;background:#eef4f8;padding:7px 9px;border:1px solid #d8e2ea;margin-top:9px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #d8e2ea;padding:5px 7px;text-align:left}th:nth-child(2),td:nth-child(2),th:last-child,td:last-child{text-align:right}.general{margin-top:14px;border-top:2px solid #0f4c81;padding-top:9px;display:flex;justify-content:space-between;font-size:16px;font-weight:700}</style></head><body><div class="school">PORTAIL SCOLAIRE HAÏTI</div><h1>${title} — ${typeLabel}</h1><div class="student"><div><strong>${ht?'Elèv':'Élève'}:</strong> ${escapeHtml(student?.name||'—')}</div><div><strong>${ht?'Ane akademik':'Année scolaire'}:</strong> ${escapeHtml(student?.year||'—')}</div><div><strong>${ht?'Klas / Nivo':'Classe / Niveau'}:</strong> ${escapeHtml(student?.level||'—')}</div><div><strong>${ht?'Seksyon':'Section'}:</strong> ${escapeHtml(student?.section||'—')}</div></div>${sections}<div class="general"><span>${ht?'Mwayèn jeneral pondérée':'Moyenne générale pondérée'}</span><span>${finalGeneralAverage===null?'—':finalGeneralAverage+'%'}</span></div></body></html>`
 }

 const downloadWord=()=>{const blob=new Blob(['\ufeff',finalReportHtml()],{type:'application/msword;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');const safeName=(student?.name||'eleve').replace(/[^a-zA-Z0-9À-ÿ_-]+/g,'-');a.href=url;a.download=`Releve-not-${safeName}-${finalType==='trimester'?'trimes':'kontwol'}.doc`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 const printFinalReport=()=>{const win=window.open('','_blank');if(!win)return;win.document.open();win.document.write(finalReportHtml());win.document.close();win.focus();setTimeout(()=>win.print(),300)}

 const summary=createPortal(<div style={{marginBottom:14}}>
  <div style={{border:'1px solid #dde6ef',borderRadius:14,padding:14,background:'#f8fafc'}}>
   <div style={{fontWeight:800,marginBottom:10}}>{ht?'Chwazi rezilta pou wè':'Choisir le résultat à afficher'}</div>
   <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
    <div><label>{ht?'Kalite':'Type'}</label><select value={assessmentType} onChange={e=>{setAssessmentType(e.target.value as AssessmentType);setAssessmentNumber(1)}}><option value="trimester">{ht?'Trimès':'Trimestre'}</option><option value="control">{ht?'Kontwòl':'Contrôle'}</option></select></div>
    <div><label>{ht?'Nimewo':'Numéro'}</label><select value={assessmentNumber} onChange={e=>setAssessmentNumber(Number(e.target.value))}>{(assessmentType==='trimester'?[1,2,3]:[1,2,3,4]).map(n=><option key={n} value={n}>{n}</option>)}</select></div>
   </div>
   <div style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid #dde6ef',paddingTop:12}}><span style={{fontWeight:700}}>{selectedLabel}</span><strong style={{fontSize:24,color:'#0f4c81'}}>{selectedAverage===null?'—':selectedAverage+'%'}</strong></div>
  </div>
  <div style={{marginTop:10,border:'1px solid #dde6ef',borderRadius:14,padding:14,background:'#fff',display:'flex',justifyContent:'space-between',gap:12}}><strong>{generalLabel}</strong><strong style={{fontSize:24,color:'#0f4c81'}}>{typeAverage===null?'—':typeAverage+'%'}</strong></div>
 </div>,target)

 const finalReport=finalTarget?createPortal(<>
  <button className="menuBtn" type="button" onClick={()=>setShowFinal(v=>!v)}>📑 {ht?'Relve nòt mwen':'Mon relevé de notes'}</button>
  {showFinal&&<div className="card" style={{marginTop:12,gridColumn:'1 / -1'}}>
   <h2>{ht?'Relve nòt mwen':'Mon relevé de notes'}</h2>
   <div style={{border:'1px solid #dde6ef',borderRadius:12,padding:12,background:'#f8fafc',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}><div><strong>{ht?'Elèv':'Élève'}:</strong> {student?.name||'—'}</div><div><strong>{ht?'Ane akademik':'Année scolaire'}:</strong> {student?.year||'—'}</div><div><strong>{ht?'Klas / Nivo':'Classe / Niveau'}:</strong> {student?.level||'—'}</div><div><strong>{ht?'Seksyon':'Section'}:</strong> {student?.section||'—'}</div></div>
   <div style={{marginBottom:14}}><label>{ht?'Kalite':'Type'}</label><select value={finalType} onChange={e=>setFinalType(e.target.value as AssessmentType)}><option value="trimester">{ht?'Trimès':'Trimestre'}</option><option value="control">{ht?'Kontwòl':'Contrôle'}</option></select></div>
   <div style={{display:'grid',gap:14}}>{finalGroups.map(group=><div key={`${finalType}-${group.number}`} style={{border:'1px solid #dde6ef',borderRadius:12,padding:12}}>
    <div style={{display:'flex',justifyContent:'space-between',marginBottom:10,gap:10}}><strong>{finalType==='trimester'?(ht?'Trimès':'Trimestre'):(ht?'Kontwòl':'Contrôle')} {group.number}</strong><strong>{group.avg===null?'—':`${ht?'Mwayèn pondérée':'Moyenne pondérée'} ${group.avg}%`}</strong></div>
    {group.subjects.length===0?<div className="muted">{ht?'Pa gen nòt pibliye.':'Aucune note publiée.'}</div>:<table><thead><tr><th>{ht?'Matiyè':'Matière'}</th><th>{ht?'Koef.':'Coef.'}</th><th>{ht?'Mwayèn':'Moyenne'}</th></tr></thead><tbody>{group.subjects.map(s=><tr key={`${group.number}-${s.subject}`}><td>{s.subject}</td><td className="score">{s.coefficient}</td><td className="score">{s.average}%</td></tr>)}</tbody></table>}
   </div>)}</div>
   <div style={{marginTop:14,paddingTop:12,borderTop:'2px solid #dde6ef',display:'flex',justifyContent:'space-between',gap:12}}><strong>{ht?'Mwayèn jeneral pondérée':'Moyenne générale pondérée'}</strong><strong style={{fontSize:24,color:'#0f4c81'}}>{finalGeneralAverage===null?'—':finalGeneralAverage+'%'}</strong></div>
   <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:16}}><button type="button" className="btn secondary" onClick={downloadWord}>⬇️ {ht?'Telechaje Word':'Télécharger Word'}</button><button type="button" className="btn" onClick={printFinalReport}>🖨️ {ht?'Enprime':'Imprimer'}</button></div>
  </div>}
 </>,finalTarget):null

 return <>{summary}{finalReport}</>
}
