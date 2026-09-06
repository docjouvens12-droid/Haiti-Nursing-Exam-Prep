'use client'

import {useEffect,useMemo,useState} from 'react'
import {createPortal} from 'react-dom'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Grade={score:number;term:string;subject:string}
type StudentInfo={name:string;level:string;section:string;year:string}|null
type AssessmentType='trimester'|'control'

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
 const controlTerms=[`contrôle ${number}`,`controle ${number}`,`control ${number}`,`kontwòl ${number}`,`kontwol ${number}`]
 return controlTerms.some(x=>value===x)
}

function average(rows:Grade[]){
 return rows.length?Math.round(rows.reduce((a,g)=>a+g.score,0)/rows.length):null
}

function escapeHtml(value:string){
 return value.replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[char]||char))
}

export default function StudentTrimesterSummary(){
 const [target,setTarget]=useState<HTMLElement|null>(null)
 const [finalTarget,setFinalTarget]=useState<HTMLElement|null>(null)
 const [lang,setLang]=useState<'ht'|'fr'>('ht')
 const [assessmentType,setAssessmentType]=useState<AssessmentType>('trimester')
 const [assessmentNumber,setAssessmentNumber]=useState(1)
 const [showFinal,setShowFinal]=useState(false)
 const [finalType,setFinalType]=useState<AssessmentType>('trimester')
 const [grades,setGrades]=useState<Grade[]>([])
 const [student,setStudent]=useState<StudentInfo>(null)

 useEffect(()=>{
  let cancelled=false
  const load=async()=>{
   const {data:{session}}=await supabase.auth.getSession()
   const user=session?.user
   if(!user)return
   const {data:profile}=await supabase.from('school_profiles').select('role,student_id').eq('user_id',user.id).maybeSingle()
   if(cancelled||profile?.role!=='student'||!profile.student_id)return
   const [gradesResult,studentResult]=await Promise.all([
    supabase.from('school_grades').select('score,term,subject').eq('student_id',profile.student_id).eq('status','approved').eq('published',true),
    supabase.from('school_students').select('name,level,section,academic_year').eq('id',profile.student_id).maybeSingle()
   ])
   if(cancelled)return
   setGrades((gradesResult.data||[]).map(x=>({score:Number(x.score),term:x.term,subject:x.subject||''})))
   if(studentResult.data)setStudent({name:studentResult.data.name||'',level:studentResult.data.level||'',section:studentResult.data.section||'',year:studentResult.data.academic_year||''})
  }
  load()
  return()=>{cancelled=true}
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
    mount=document.createElement('div')
    mount.setAttribute('data-student-term-mount','true')
    const stats=card.querySelector('.stats')
    if(stats){
     const first=stats.querySelector('.stat:first-child') as HTMLElement|null
     if(first)first.style.display='none'
     stats.parentElement?.insertBefore(mount,stats)
    }else card.appendChild(mount)
   }
   setTarget(mount)

   const menu=card.querySelector('.menu') as HTMLElement|null
   const buttons=menu?Array.from(menu.querySelectorAll('button')):[]
   const bulletin=buttons.find(b=>['Bilten mwen','Mon bulletin'].some(t=>(b.textContent||'').includes(t))) as HTMLButtonElement|undefined
   if(bulletin){
    let finalMount=menu?.querySelector('[data-student-final-report-mount]') as HTMLElement|null
    if(!finalMount){
     finalMount=document.createElement('div')
     finalMount.setAttribute('data-student-final-report-mount','true')
     finalMount.style.display='contents'
     bulletin.insertAdjacentElement('afterend',finalMount)
    }
    setFinalTarget(finalMount)
   }
  }
  attach()
  const observer=new MutationObserver(()=>requestAnimationFrame(attach))
  observer.observe(document.body,{subtree:true,childList:true})
  return()=>observer.disconnect()
 },[])

 const selectedAverage=useMemo(()=>average(grades.filter(g=>matchesSelection(g.term,assessmentType,assessmentNumber))),[grades,assessmentType,assessmentNumber])
 const generalAverage=useMemo(()=>average(grades),[grades])
 const finalGroups=useMemo(()=>{
  const count=finalType==='trimester'?3:4
  return Array.from({length:count},(_,i)=>i+1).map(number=>{
   const rows=grades.filter(g=>matchesSelection(g.term,finalType,number))
   return {number,rows,avg:average(rows)}
  })
 },[grades,finalType])

 if(!target)return null
 const ht=lang==='ht'
 const selectedLabel=assessmentType==='trimester'
  ? `${ht?'Mwayèn Trimès':'Moyenne Trimestre'} ${assessmentNumber}`
  : `${ht?'Mwayèn Kontwòl':'Moyenne Contrôle'} ${assessmentNumber}`

 const finalReportHtml=()=>{
  const typeLabel=finalType==='trimester'?(ht?'Trimès':'Trimestre'):(ht?'Kontwòl':'Contrôle')
  const sections=finalGroups.map(group=>{
   const rows=group.rows.length
    ? `<table><thead><tr><th>${ht?'Matiyè':'Matière'}</th><th>${ht?'Nòt':'Note'}</th></tr></thead><tbody>${group.rows.map(g=>`<tr><td>${escapeHtml(g.subject)}</td><td>${g.score}%</td></tr>`).join('')}</tbody></table>`
    : `<p class="empty">${ht?'Pa gen nòt pibliye.':'Aucune note publiée.'}</p>`
   return `<section><div class="section-title"><strong>${typeLabel} ${group.number}</strong><strong>${group.avg===null?'—':`${ht?'Mwayèn':'Moyenne'}: ${group.avg}%`}</strong></div>${rows}</section>`
  }).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><title>${ht?'Bilten final':'Bulletin final'}</title><style>@page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;color:#182433;margin:0;font-size:12px}h1{text-align:center;color:#0f4c81;margin:0 0 4px;font-size:22px}.school{text-align:center;font-weight:700;margin-bottom:14px}.student{border:1px solid #cfd9e3;padding:9px 12px;margin-bottom:12px;display:grid;grid-template-columns:1fr 1fr;gap:5px 18px}.section-title{display:flex;justify-content:space-between;background:#eef4f8;padding:7px 9px;border:1px solid #d8e2ea;margin-top:9px}table{width:100%;border-collapse:collapse;margin-top:0}th,td{border:1px solid #d8e2ea;padding:5px 7px;text-align:left}th:last-child,td:last-child{text-align:right;width:22%}.empty{border:1px solid #d8e2ea;border-top:0;padding:7px;margin:0;color:#667}.general{margin-top:14px;border-top:2px solid #0f4c81;padding-top:9px;display:flex;justify-content:space-between;font-size:16px;font-weight:700}.footer{text-align:center;margin-top:16px;color:#667;font-size:10px}</style></head><body><div class="school">PORTAIL SCOLAIRE HAÏTI</div><h1>${ht?'Bilten final':'Bulletin final'} — ${typeLabel}</h1><div class="student"><div><strong>${ht?'Elèv':'Élève'}:</strong> ${escapeHtml(student?.name||'—')}</div><div><strong>${ht?'Ane akademik':'Année scolaire'}:</strong> ${escapeHtml(student?.year||'—')}</div><div><strong>${ht?'Klas':'Classe'}:</strong> ${escapeHtml(student?.level||'—')}</div><div><strong>${ht?'Seksyon':'Section'}:</strong> ${escapeHtml(student?.section||'—')}</div></div>${sections}<div class="general"><span>${ht?'Mwayèn jeneral':'Moyenne générale'}</span><span>${generalAverage===null?'—':generalAverage+'%'}</span></div><div class="footer">${ht?'Dokiman pwodwi pa Portail Scolaire Haïti':'Document généré par Portail Scolaire Haïti'}</div></body></html>`
 }

 const downloadWord=()=>{
  const html=finalReportHtml()
  const blob=new Blob(['\ufeff',html],{type:'application/msword;charset=utf-8'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a')
  const safeName=(student?.name||'eleve').replace(/[^a-zA-Z0-9À-ÿ_-]+/g,'-')
  a.href=url
  a.download=`Bilten-final-${safeName}-${finalType==='trimester'?'trimes':'kontwol'}.doc`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
 }

 const printFinalReport=()=>{
  const win=window.open('','_blank')
  if(!win)return
  win.document.open()
  win.document.write(finalReportHtml())
  win.document.close()
  win.focus()
  setTimeout(()=>win.print(),300)
 }

 const summary=createPortal(
  <div style={{marginBottom:14}}>
   <div style={{border:'1px solid #dde6ef',borderRadius:14,padding:14,background:'#f8fafc'}}>
    <div style={{fontWeight:800,marginBottom:10}}>{ht?'Chwazi rezilta pou wè':'Choisir le résultat à afficher'}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
     <div>
      <label>{ht?'Kalite':'Type'}</label>
      <select value={assessmentType} onChange={e=>setAssessmentType(e.target.value as AssessmentType)}>
       <option value="trimester">{ht?'Trimès':'Trimestre'}</option>
       <option value="control">{ht?'Kontwòl':'Contrôle'}</option>
      </select>
     </div>
     <div>
      <label>{ht?'Nimewo':'Numéro'}</label>
      <select value={assessmentNumber} onChange={e=>setAssessmentNumber(Number(e.target.value))}>
       {(assessmentType==='trimester'?[1,2,3]:[1,2,3,4]).map(n=><option key={n} value={n}>{n}</option>)}
      </select>
     </div>
    </div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,borderTop:'1px solid #dde6ef',paddingTop:12}}>
     <span style={{fontWeight:700}}>{selectedLabel}</span>
     <strong style={{fontSize:24,color:'#0f4c81'}}>{selectedAverage===null?'—':selectedAverage+'%'}</strong>
    </div>
   </div>
   <div style={{marginTop:10,border:'1px solid #dde6ef',borderRadius:14,padding:14,background:'#fff',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
    <strong>{ht?'Mwayèn jeneral':'Moyenne générale'}</strong>
    <strong style={{fontSize:24,color:'#0f4c81'}}>{generalAverage===null?'—':generalAverage+'%'}</strong>
   </div>
  </div>,target
 )

 const finalReport=finalTarget?createPortal(<>
  <button className="menuBtn" type="button" onClick={()=>setShowFinal(v=>!v)}>📑 {ht?'Bilten final':'Bulletin final'}</button>
  {showFinal&&<div className="card" style={{marginTop:12,gridColumn:'1 / -1'}}>
   <h2>{ht?'Bilten final':'Bulletin final'}</h2>
   <div style={{marginBottom:14}}>
    <label>{ht?'Kalite':'Type'}</label>
    <select value={finalType} onChange={e=>setFinalType(e.target.value as AssessmentType)}>
     <option value="trimester">{ht?'Trimès':'Trimestre'}</option>
     <option value="control">{ht?'Kontwòl':'Contrôle'}</option>
    </select>
   </div>

   <div style={{display:'grid',gap:14}}>{finalGroups.map(group=><div key={`${finalType}-${group.number}`} style={{border:'1px solid #dde6ef',borderRadius:12,padding:12,background:'#fff'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:10}}>
     <strong>{finalType==='trimester'?(ht?'Trimès':'Trimestre'):(ht?'Kontwòl':'Contrôle')} {group.number}</strong>
     <strong style={{color:'#0f4c81'}}>{group.avg===null?'—':`${ht?'Mwayèn':'Moyenne'} ${group.avg}%`}</strong>
    </div>
    {group.rows.length===0?<div className="muted">{ht?'Pa gen nòt pibliye.':'Aucune note publiée.'}</div>:<table><tbody>{group.rows.map((g,index)=><tr key={`${group.number}-${g.subject}-${index}`}><td>{g.subject}</td><td className="score">{g.score}%</td></tr>)}</tbody></table>}
   </div>)}</div>

   <div style={{marginTop:14,paddingTop:12,borderTop:'2px solid #dde6ef',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
    <strong>{ht?'Mwayèn jeneral':'Moyenne générale'}</strong>
    <strong style={{fontSize:24,color:'#0f4c81'}}>{generalAverage===null?'—':generalAverage+'%'}</strong>
   </div>

   <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:16}}>
    <button type="button" className="btn secondary" onClick={downloadWord}>⬇️ {ht?'Telechaje Word':'Télécharger Word'}</button>
    <button type="button" className="btn" onClick={printFinalReport}>🖨️ {ht?'Enprime':'Imprimer'}</button>
   </div>
  </div>}
 </>,finalTarget):null

 return <>{summary}{finalReport}</>
}
