'use client'

import {useEffect,useMemo,useState} from 'react'
import {createPortal} from 'react-dom'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Grade={score:number;term:string;subject:string}
type Student={name:string;level:string;section:string;year:string}|null
type Subject={name:string;coefficient:number}

function norm(v:string){return (v||'').trim().toLowerCase()}
function isTrimester(term:string,n:number){
 const v=norm(term)
 const aliases=[
  ['1er trimestre','1e trimestre','trimestre 1','trimès 1'],
  ['2e trimestre','trimestre 2','trimès 2'],
  ['3e trimestre','trimestre 3','trimès 3']
 ][n-1]||[]
 return aliases.includes(v)
}
function esc(v:string){return v.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[c]||c))}

export default function StudentWeightedBulletin(){
 const [target,setTarget]=useState<HTMLElement|null>(null)
 const [open,setOpen]=useState(false)
 const [lang,setLang]=useState<'ht'|'fr'>('ht')
 const [trimester,setTrimester]=useState(1)
 const [grades,setGrades]=useState<Grade[]>([])
 const [subjects,setSubjects]=useState<Subject[]>([])
 const [student,setStudent]=useState<Student>(null)

 useEffect(()=>{
  let cancelled=false
  const load=async()=>{
   const {data:{session}}=await supabase.auth.getSession();const user=session?.user;if(!user)return
   const {data:p}=await supabase.from('school_profiles').select('role,student_id').eq('user_id',user.id).maybeSingle()
   if(cancelled||p?.role!=='student'||!p.student_id)return
   const [gr,sr,mr]=await Promise.all([
    supabase.from('school_grades').select('score,term,subject').eq('student_id',p.student_id).eq('status','approved').eq('published',true),
    supabase.from('school_students').select('name,level,section,academic_year').eq('id',p.student_id).maybeSingle(),
    supabase.from('school_subjects').select('name,coefficient').order('name')
   ])
   if(cancelled)return
   setGrades((gr.data||[]).map(x=>({score:Number(x.score),term:x.term||'',subject:x.subject||''})))
   setSubjects((mr.data||[]).map(x=>({name:x.name,coefficient:Math.max(0.01,Number(x.coefficient)||1)})))
   if(sr.data)setStudent({name:sr.data.name||'',level:sr.data.level||'',section:sr.data.section||'',year:sr.data.academic_year||''})
  }
  load();return()=>{cancelled=true}
 },[])

 useEffect(()=>{
  const onLang=(e:Event)=>{
   const el=e.target as HTMLElement|null
   const select=el?.closest?.('select[data-language-menu]') as HTMLSelectElement|null
   if(select)setLang(select.value==='fr'?'fr':'ht')
   const b=el?.closest?.('.langChoice') as HTMLButtonElement|null
   if(b)setLang((b.textContent||'').includes('Français')?'fr':'ht')
  }
  document.addEventListener('change',onLang,true);document.addEventListener('click',onLang,true)
  return()=>{document.removeEventListener('change',onLang,true);document.removeEventListener('click',onLang,true)}
 },[])

 useEffect(()=>{
  const attach=()=>{
   const heading=Array.from(document.querySelectorAll('.ps-page h2')).find(h=>['Tablo bò pou Elèv yo','Tableau de bord de l’Élève'].includes((h.textContent||'').trim()))
   const card=heading?.closest('.card') as HTMLElement|null
   if(!card){setTarget(null);return}
   setLang((heading?.textContent||'').includes('Tableau')?'fr':'ht')
   const menu=card.querySelector('.menu') as HTMLElement|null;if(!menu){setTarget(null);return}
   const old=Array.from(menu.querySelectorAll('button')).find(b=>['Bilten mwen','Mon bulletin'].some(t=>(b.textContent||'').includes(t))) as HTMLButtonElement|undefined
   if(!old){setTarget(null);return}
   old.style.display='none'
   let mount=menu.querySelector('[data-weighted-bulletin-mount]') as HTMLElement|null
   if(!mount){mount=document.createElement('div');mount.setAttribute('data-weighted-bulletin-mount','true');mount.style.display='contents';old.insertAdjacentElement('afterend',mount)}
   setTarget(mount)
  }
  attach();const o=new MutationObserver(()=>requestAnimationFrame(attach));o.observe(document.body,{subtree:true,childList:true});return()=>o.disconnect()
 },[])

 const rows=useMemo(()=>{
  const period=grades.filter(g=>isTrimester(g.term,trimester))
  const names=[...new Set(period.map(g=>g.subject).filter(Boolean))]
  return names.map(name=>{
   const items=period.filter(g=>g.subject===name)
   const avg=items.reduce((a,g)=>a+g.score,0)/items.length
   const coefficient=subjects.find(s=>norm(s.name)===norm(name))?.coefficient||1
   return {name,avg,coefficient,points:avg*coefficient}
  }).sort((a,b)=>a.name.localeCompare(b.name))
 },[grades,subjects,trimester])

 const weighted=useMemo(()=>{
  const totalCoeff=rows.reduce((a,r)=>a+r.coefficient,0)
  return totalCoeff?rows.reduce((a,r)=>a+r.points,0)/totalCoeff:null
 },[rows])

 if(!target)return null
 const ht=lang==='ht'
 const format=(n:number)=>Number.isInteger(n)?String(n):n.toFixed(1)
 const html=()=>`<!doctype html><html><head><meta charset="utf-8"><title>${ht?'Bilten mwen':'Mon bulletin'}</title><style>@page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;color:#182433;font-size:12px}.school{text-align:center;font-weight:800;color:#0f4c81;margin-bottom:8px}h1{text-align:center}.info{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;border:1px solid #d8e2ea;padding:10px;margin-bottom:14px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #d8e2ea;padding:7px}th{background:#eef4f8}td:nth-child(n+2),th:nth-child(n+2){text-align:right}.general{margin-top:14px;border-top:2px solid #0f4c81;padding-top:10px;display:flex;justify-content:space-between;font-size:16px;font-weight:800}</style></head><body><div class="school">PORTAIL SCOLAIRE HAÏTI</div><h1>${ht?'Bilten — Trimès':'Bulletin — Trimestre'} ${trimester}</h1><div class="info"><div><b>${ht?'Elèv':'Élève'}:</b> ${esc(student?.name||'—')}</div><div><b>${ht?'Ane akademik':'Année scolaire'}:</b> ${esc(student?.year||'—')}</div><div><b>${ht?'Klas / Nivo':'Classe / Niveau'}:</b> ${esc(student?.level||'—')}</div><div><b>${ht?'Seksyon':'Section'}:</b> ${esc(student?.section||'—')}</div></div><table><thead><tr><th>${ht?'Matiyè':'Matière'}</th><th>${ht?'Koefisyan':'Coefficient'}</th><th>${ht?'Mwayèn':'Moyenne'}</th><th>${ht?'Pwen pondéré':'Points pondérés'}</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.name)}</td><td>${format(r.coefficient)}</td><td>${format(r.avg)}%</td><td>${format(r.points)}</td></tr>`).join('')}</tbody></table><div class="general"><span>${ht?'Mwayèn jeneral pondérée':'Moyenne générale pondérée'}</span><span>${weighted===null?'—':format(weighted)+'%'}</span></div></body></html>`
 const download=()=>{const blob=new Blob(['\ufeff',html()],{type:'application/msword;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`Bulletin-${(student?.name||'eleve').replace(/[^a-zA-Z0-9À-ÿ_-]+/g,'-')}-T${trimester}.doc`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 const print=()=>{const w=window.open('','_blank');if(!w)return;w.document.write(html());w.document.close();w.focus();setTimeout(()=>w.print(),300)}

 return createPortal(<><button type="button" className="menuBtn" onClick={()=>setOpen(v=>!v)}>📄 {ht?'Bilten mwen':'Mon bulletin'}</button>{open&&<div className="card" style={{marginTop:12,gridColumn:'1 / -1'}}><h2>{ht?'Bilten mwen':'Mon bulletin'}</h2><div style={{marginBottom:14}}><label>{ht?'Trimès':'Trimestre'}</label><select value={trimester} onChange={e=>setTrimester(Number(e.target.value))}>{[1,2,3].map(n=><option key={n} value={n}>{n}</option>)}</select></div><div style={{border:'1px solid #dde6ef',borderRadius:12,padding:12,background:'#f8fafc',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}><div><strong>{ht?'Elèv':'Élève'}:</strong> {student?.name||'—'}</div><div><strong>{ht?'Ane akademik':'Année scolaire'}:</strong> {student?.year||'—'}</div><div><strong>{ht?'Klas / Nivo':'Classe / Niveau'}:</strong> {student?.level||'—'}</div><div><strong>{ht?'Seksyon':'Section'}:</strong> {student?.section||'—'}</div></div>{rows.length===0?<div className="muted">{ht?'Pa gen nòt pibliye pou trimès sa a.':'Aucune note publiée pour ce trimestre.'}</div>:<><div style={{overflowX:'auto'}}><table><thead><tr><th>{ht?'Matiyè':'Matière'}</th><th>{ht?'Koefisyan':'Coefficient'}</th><th>{ht?'Mwayèn':'Moyenne'}</th><th>{ht?'Pwen pondéré':'Points pondérés'}</th></tr></thead><tbody>{rows.map(r=><tr key={r.name}><td>{r.name}</td><td className="score">{format(r.coefficient)}</td><td className="score">{format(r.avg)}%</td><td className="score">{format(r.points)}</td></tr>)}</tbody></table></div><div style={{marginTop:14,paddingTop:12,borderTop:'2px solid #dde6ef',display:'flex',justifyContent:'space-between',gap:12}}><strong>{ht?'Mwayèn jeneral pondérée':'Moyenne générale pondérée'}</strong><strong style={{fontSize:24,color:'#0f4c81'}}>{weighted===null?'—':format(weighted)+'%'}</strong></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:16}}><button type="button" className="btn secondary" onClick={download}>⬇️ Word</button><button type="button" className="btn" onClick={print}>🖨️ {ht?'Enprime':'Imprimer'}</button></div></>}</div>}</>,target)
}
