'use client'

import {useEffect,useMemo,useState} from 'react'
import {createPortal} from 'react-dom'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Role='direction'|'secretary'|''
type AssessmentType='trimester'|'control'
type Student={id:string;name:string;level:string;section:string;year:string}
type Grade={studentId:string;subject:string;score:number;term:string}

function matchesSelection(term:string,type:AssessmentType,number:number){
 const value=(term||'').trim().toLowerCase()
 if(type==='trimester'){
  const terms=[
   ['1er trimestre','1e trimestre','trimestre 1','trimès 1'],
   ['2e trimestre','trimestre 2','trimès 2'],
   ['3e trimestre','trimestre 3','trimès 3']
  ][number-1]||[]
  return terms.some(x=>value===x)
 }
 return [`contrôle ${number}`,`controle ${number}`,`control ${number}`,`kontwòl ${number}`,`kontwol ${number}`].some(x=>value===x)
}

function average(rows:Grade[]){return rows.length?Math.round(rows.reduce((a,g)=>a+g.score,0)/rows.length):null}
function escapeHtml(value:string){return value.replace(/[&<>'\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'\"':'&quot;'}[c]||c))}

export default function RecordsPanel(){
 const [role,setRole]=useState<Role>('')
 const [lang,setLang]=useState<'ht'|'fr'>('ht')
 const [target,setTarget]=useState<HTMLElement|null>(null)
 const [open,setOpen]=useState(false)
 const [students,setStudents]=useState<Student[]>([])
 const [grades,setGrades]=useState<Grade[]>([])
 const [year,setYear]=useState('')
 const [level,setLevel]=useState('')
 const [section,setSection]=useState('')
 const [studentId,setStudentId]=useState('')
 const [type,setType]=useState<AssessmentType>('trimester')
 const ht=lang==='ht'

 useEffect(()=>{
  const load=async()=>{
   const {data:{session}}=await supabase.auth.getSession();const user=session?.user;if(!user)return
   const {data:p}=await supabase.from('school_profiles').select('role').eq('user_id',user.id).maybeSingle()
   const r=(p?.role==='direction'||p?.role==='secretary')?p.role:''
   setRole(r)
   if(!r)return
   const [sr,gr]=await Promise.all([
    supabase.from('school_students').select('id,name,level,section,academic_year').order('name'),
    supabase.from('school_grades').select('student_id,subject,score,term').eq('status','approved').eq('published',true)
   ])
   setStudents((sr.data||[]).map(x=>({id:x.id,name:x.name,level:x.level,section:x.section,year:x.academic_year})))
   setGrades((gr.data||[]).map(x=>({studentId:x.student_id,subject:x.subject||'',score:Number(x.score),term:x.term||''})))
  }
  load()
  const {data:l}=supabase.auth.onAuthStateChange(()=>load())
  return()=>l.subscription.unsubscribe()
 },[])

 useEffect(()=>{
  const onLang=(e:Event)=>{const b=(e.target as HTMLElement|null)?.closest?.('.langChoice') as HTMLButtonElement|null;if(b)setLang(b.textContent?.includes('Français')?'fr':'ht')}
  document.addEventListener('click',onLang,true);return()=>document.removeEventListener('click',onLang,true)
 },[])

 useEffect(()=>{
  const attach=()=>{
   document.querySelectorAll('button.menuBtn').forEach(b=>{
    const text=(b.textContent||'').trim()
    if(text.includes('Bilten final')||text.includes('Bulletin final')||text.includes('Mes relevés de notes')) b.textContent=`📑 ${ht?'Relve nòt mwen':'Mon relevé de notes'}`
   })
   document.querySelectorAll('.card h2').forEach(h=>{
    const text=(h.textContent||'').trim()
    if(text==='Bilten final'||text==='Bulletin final'||text==='Mes relevés de notes') h.textContent=ht?'Relve nòt mwen':'Mon relevé de notes'
   })

   if(!role){setTarget(null);return}
   const heading=Array.from(document.querySelectorAll('h2')).find(h=>role==='direction'
    ? ['Tablo bò pou Direksyon an','Tableau de bord de la Direction'].includes((h.textContent||'').trim())
    : ['Tablo bò pou Sekretarya a','Tableau de bord du Secrétariat'].includes((h.textContent||'').trim()))
   const card=heading?.closest('.card') as HTMLElement|null
   const menu=card?.querySelector('.menu') as HTMLElement|null
   if(!menu){setTarget(null);return}
   let mount=menu.querySelector('[data-records-panel-mount]') as HTMLElement|null
   if(!mount){mount=document.createElement('div');mount.setAttribute('data-records-panel-mount','true');mount.style.display='contents';menu.appendChild(mount)}
   setTarget(mount)
  }
  attach();const o=new MutationObserver(()=>requestAnimationFrame(attach));o.observe(document.body,{subtree:true,childList:true});return()=>o.disconnect()
 },[role,ht])

 const years=useMemo(()=>[...new Set(students.map(s=>s.year).filter(Boolean))].sort(),[students])
 const levels=useMemo(()=>[...new Set(students.filter(s=>!year||s.year===year).map(s=>s.level).filter(Boolean))].sort(),[students,year])
 const sections=useMemo(()=>[...new Set(students.filter(s=>(!year||s.year===year)&&(!level||s.level===level)).map(s=>s.section).filter(Boolean))].sort(),[students,year,level])
 const filteredStudents=useMemo(()=>students.filter(s=>(!year||s.year===year)&&(!level||s.level===level)&&(!section||s.section===section)),[students,year,level,section])
 const student=students.find(s=>s.id===studentId)||null
 const studentGrades=useMemo(()=>grades.filter(g=>g.studentId===studentId),[grades,studentId])
 const groups=useMemo(()=>{
  const count=type==='trimester'?3:4
  return Array.from({length:count},(_,i)=>i+1).map(number=>{const rows=studentGrades.filter(g=>matchesSelection(g.term,type,number));return {number,rows,avg:average(rows)}})
 },[studentGrades,type])
 const generalAverage=useMemo(()=>average(studentGrades),[studentGrades])

 const resetAfterYear=(v:string)=>{setYear(v);setLevel('');setSection('');setStudentId('')}
 const resetAfterLevel=(v:string)=>{setLevel(v);setSection('');setStudentId('')}
 const resetAfterSection=(v:string)=>{setSection(v);setStudentId('')}

 const html=()=>{
  const typeLabel=type==='trimester'?(ht?'Trimès':'Trimestre'):(ht?'Kontwòl':'Contrôle')
  const sectionsHtml=groups.map(g=>`<section><h3>${typeLabel} ${g.number} <span>${g.avg===null?'—':`${ht?'Mwayèn':'Moyenne'} ${g.avg}%`}</span></h3>${g.rows.length?`<table><tbody>${g.rows.map(r=>`<tr><td>${escapeHtml(r.subject)}</td><td>${r.score}%</td></tr>`).join('')}</tbody></table>`:`<p>${ht?'Pa gen nòt pibliye.':'Aucune note publiée.'}</p>`}</section>`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><title>${ht?'Relve nòt':'Relevé de notes'}</title><style>@page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;color:#182433;font-size:12px}.school{text-align:center;font-weight:700}h1{text-align:center;color:#0f4c81}.student{border:1px solid #ccd7e0;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:6px 18px}h3{background:#eef4f8;padding:8px;border:1px solid #d8e2ea;margin:12px 0 0;display:flex;justify-content:space-between}table{width:100%;border-collapse:collapse}td{border:1px solid #d8e2ea;padding:6px}td:last-child{text-align:right}.general{margin-top:16px;border-top:2px solid #0f4c81;padding-top:10px;display:flex;justify-content:space-between;font-size:16px;font-weight:700}</style></head><body><div class="school">PORTAIL SCOLAIRE HAÏTI</div><h1>${ht?'Relve nòt':'Relevé de notes'} — ${typeLabel}</h1><div class="student"><div><b>${ht?'Elèv':'Élève'}:</b> ${escapeHtml(student?.name||'—')}</div><div><b>${ht?'Ane akademik':'Année scolaire'}:</b> ${escapeHtml(student?.year||'—')}</div><div><b>${ht?'Klas / Nivo':'Classe / Niveau'}:</b> ${escapeHtml(student?.level||'—')}</div><div><b>${ht?'Seksyon':'Section'}:</b> ${escapeHtml(student?.section||'—')}</div></div>${sectionsHtml}<div class="general"><span>${ht?'Mwayèn jeneral':'Moyenne générale'}</span><span>${generalAverage===null?'—':generalAverage+'%'}</span></div></body></html>`
 }
 const download=()=>{if(!student)return;const blob=new Blob(['\ufeff',html()],{type:'application/msword;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`Releve-not-${student.name.replace(/[^a-zA-Z0-9À-ÿ_-]+/g,'-')}.doc`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 const print=()=>{if(!student)return;const w=window.open('','_blank');if(!w)return;w.document.write(html());w.document.close();w.focus();setTimeout(()=>w.print(),300)}

 if(!target)return null
 return createPortal(<>
  <button type="button" className="menuBtn" onClick={()=>setOpen(v=>!v)}>📑 {ht?'Relve nòt elèv yo':'Relevés de notes des élèves'}</button>
  {open&&<div className="card" style={{gridColumn:'1 / -1',marginTop:12}}>
   <h2>{ht?'Relve nòt elèv yo':'Relevés de notes des élèves'}</h2>
   <div className="grid2">
    <div><label>{ht?'Ane akademik':'Année scolaire'}</label><select value={year} onChange={e=>resetAfterYear(e.target.value)}><option value="">{ht?'Tout ane':'Toutes les années'}</option>{years.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
    <div><label>{ht?'Klas / Nivo':'Classe / Niveau'}</label><select value={level} onChange={e=>resetAfterLevel(e.target.value)}><option value="">{ht?'Tout klas':'Toutes les classes'}</option>{levels.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
    <div><label>{ht?'Seksyon':'Section'}</label><select value={section} onChange={e=>resetAfterSection(e.target.value)}><option value="">{ht?'Tout seksyon':'Toutes les sections'}</option>{sections.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
    <div><label>{ht?'Elèv':'Élève'}</label><select value={studentId} onChange={e=>setStudentId(e.target.value)}><option value="">—</option>{filteredStudents.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
    <div><label>{ht?'Kalite':'Type'}</label><select value={type} onChange={e=>setType(e.target.value as AssessmentType)}><option value="trimester">{ht?'Trimès':'Trimestre'}</option><option value="control">{ht?'Kontwòl':'Contrôle'}</option></select></div>
   </div>
   {student&&<><div style={{marginTop:14,border:'1px solid #dde6ef',borderRadius:12,padding:12,background:'#f8fafc',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><div><strong>{ht?'Elèv':'Élève'}:</strong> {student.name}</div><div><strong>{ht?'Ane akademik':'Année scolaire'}:</strong> {student.year}</div><div><strong>{ht?'Klas / Nivo':'Classe / Niveau'}:</strong> {student.level}</div><div><strong>{ht?'Seksyon':'Section'}:</strong> {student.section}</div></div><div style={{display:'grid',gap:12,marginTop:14}}>{groups.map(g=><div key={g.number} style={{border:'1px solid #dde6ef',borderRadius:12,padding:12}}><div style={{display:'flex',justifyContent:'space-between',gap:12}}><strong>{type==='trimester'?(ht?'Trimès':'Trimestre'):(ht?'Kontwòl':'Contrôle')} {g.number}</strong><strong>{g.avg===null?'—':`${ht?'Mwayèn':'Moyenne'} ${g.avg}%`}</strong></div>{g.rows.length?<table style={{marginTop:8}}><tbody>{g.rows.map((r,i)=><tr key={`${g.number}-${i}`}><td>{r.subject}</td><td className="score">{r.score}%</td></tr>)}</tbody></table>:<div className="muted" style={{marginTop:8}}>{ht?'Pa gen nòt pibliye.':'Aucune note publiée.'}</div>}</div>)}</div><div style={{display:'flex',justifyContent:'space-between',marginTop:14,paddingTop:12,borderTop:'2px solid #dde6ef'}}><strong>{ht?'Mwayèn jeneral':'Moyenne générale'}</strong><strong>{generalAverage===null?'—':generalAverage+'%'}</strong></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:16}}><button type="button" className="btn secondary" onClick={download}>⬇️ {ht?'Telechaje Word':'Télécharger Word'}</button><button type="button" className="btn" onClick={print}>🖨️ {ht?'Enprime':'Imprimer'}</button></div></>}
  </div>}
 </>,target)
}
