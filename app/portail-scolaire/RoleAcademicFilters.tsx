'use client'

import {useEffect,useMemo,useState} from 'react'
import {createPortal} from 'react-dom'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')
const SCHOOL_LEVELS=['7e Année Fondamentale','8e Année Fondamentale','9e Année Fondamentale','NS I','NS II','NS III','NS IV']
const SECTION_OPTIONS=['A','B','C','D']

type Student={id:string;name:string;level:string;section:string;year:string}
type Teacher={id:string;name:string;classes:string;section:string}
type Role='teacher'|'secretary'|''

function normalizeLevel(value:string){
 const v=value.trim().toLowerCase()
 if(v==='8 année fondamentale'||v==='8e année fondamentale')return '8e Année Fondamentale'
 if(v==='7 année fondamentale'||v==='7e année fondamentale')return '7e Année Fondamentale'
 if(v==='9 année fondamentale'||v==='9e année fondamentale')return '9e Année Fondamentale'
 return value
}

function nearbyAcademicYears(){
 const now=new Date()
 const y=now.getFullYear()
 const start=now.getMonth()>=6?y:y-1
 return Array.from({length:5},(_,i)=>{
  const a=start+2-i
  return `${a}–${a+1}`
 })
}

export default function RoleAcademicFilters(){
 const [host,setHost]=useState<HTMLElement|null>(null)
 const [role,setRole]=useState<Role>('')
 const [lang,setLang]=useState<'ht'|'fr'>('fr')
 const [students,setStudents]=useState<Student[]>([])
 const [teacher,setTeacher]=useState<Teacher|null>(null)
 const [year,setYear]=useState('')
 const [level,setLevel]=useState('')
 const [section,setSection]=useState('')
 const [search,setSearch]=useState('')
 const ht=lang==='ht'

 const load=async()=>{
  const {data:{user}}=await supabase.auth.getUser()
  if(!user){setRole('');setTeacher(null);return}
  const pr=await supabase.from('school_profiles').select('role,teacher_id').eq('user_id',user.id).maybeSingle()
  const r=(pr.data?.role==='teacher'||pr.data?.role==='secretary')?pr.data.role as Role:''
  setRole(r)
  if(!r)return
  const sr=await supabase.from('school_students').select('id,name,level,section,academic_year').order('name')
  if(!sr.error){
   const mapped=(sr.data||[]).map((x:any)=>({id:x.id,name:x.name,level:normalizeLevel(x.level||''),section:x.section||'',year:x.academic_year||''}))
   setStudents(mapped)
   if(!year){
    const current=nearbyAcademicYears()[2]
    const ys=[...new Set(mapped.map(x=>x.year).filter(Boolean))]
    setYear(ys.includes(current)?current:(ys.sort().reverse()[0]||current))
   }
  }
  if(r==='teacher'&&pr.data?.teacher_id){
   const tr=await supabase.from('school_teachers').select('id,name,classes,section').eq('id',pr.data.teacher_id).maybeSingle()
   if(tr.data){
    const t={id:tr.data.id,name:tr.data.name,classes:normalizeLevel(tr.data.classes||''),section:tr.data.section||''}
    setTeacher(t);setLevel(t.classes);setSection(t.section)
   }
  }else{
   setTeacher(null);setLevel('');setSection('')
  }
 }

 useEffect(()=>{
  load()
  const {data:authListener}=supabase.auth.onAuthStateChange(()=>{
   setHost(null);setRole('');setTeacher(null);setLevel('');setSection('');setSearch('');setYear('')
   setTimeout(()=>load(),0)
  })
  const findHost=()=>{
   const sec=document.querySelector<HTMLElement>('.secretary-dashboard .card')
   if(sec){setRole('secretary');setHost(sec);return}
   const cards=Array.from(document.querySelectorAll<HTMLElement>('.ps-page section.card'))
   const teacherCard=cards.find(c=>{
    const h=(c.querySelector('h2')?.textContent||'').toLowerCase()
    return h.includes('tablo bò pou ansenyan')||h.includes("tableau de bord de l’enseignant")||h.includes("tableau de bord de l'enseignant")
   })||null
   if(teacherCard)setRole('teacher')
   setHost(teacherCard)
  }
  findHost()
  const observer=new MutationObserver(findHost);observer.observe(document.body,{childList:true,subtree:true})
  const onLang=(e:Event)=>{const el=e.target as HTMLSelectElement;if(el.closest?.('[data-global-language-menu]'))setLang(el.value==='ht'?'ht':'fr')}
  const selector=document.querySelector<HTMLSelectElement>('[data-global-language-menu] select');if(selector)setLang(selector.value==='ht'?'ht':'fr')
  document.addEventListener('change',onLang,true)
  return()=>{observer.disconnect();document.removeEventListener('change',onLang,true);authListener.subscription.unsubscribe()}
 },[])

 const years=useMemo(()=>{
  const saved=students.map(s=>s.year).filter(Boolean)
  return [...new Set([...nearbyAcademicYears(),...saved])].sort().reverse()
 },[students])
 const levels=useMemo(()=>[...SCHOOL_LEVELS,...[...new Set(students.map(s=>normalizeLevel(s.level)).filter(Boolean))].filter(x=>!SCHOOL_LEVELS.includes(x))],[students])
 const sections=useMemo(()=>[...new Set([...SECTION_OPTIONS,...students.filter(s=>!level||s.level===level).map(s=>s.section).filter(Boolean)])].sort(),[students,level])
 const filtered=useMemo(()=>students.filter(s=>
  (!year||s.year===year)&&
  (!level||s.level===level)&&
  (!section||s.section===section)&&
  (!search||`${s.id} ${s.name}`.toLowerCase().includes(search.toLowerCase()))
 ),[students,year,level,section,search])

 if(!host||!role)return null
 const teacherMode=role==='teacher'
 return createPortal(<div className="roleAcademicFilters">
  <style>{`
   .roleAcademicFilters{margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb}
   .rafGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
   .rafGrid label{display:block;font-size:12px;font-weight:800;color:#4b5563;margin-bottom:5px}
   .rafGrid select,.roleAcademicFilters input{width:100%;box-sizing:border-box}
   .rafGrid input[readonly]{background:#f5f7fa;color:#4b5563}
   .rafBadges{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
   .rafBadge{background:#eef6ff;border:1px solid #cfe4fa;border-radius:999px;padding:6px 10px;color:#0f4c81;font-size:12px;font-weight:800}
   .rafList{margin-top:10px;max-height:220px;overflow:auto;border:1px solid #e5e7eb;border-radius:12px}
   .rafStudent{padding:9px 11px;border-bottom:1px solid #eef2f7;font-size:13px}.rafStudent:last-child{border-bottom:0}
   @media(max-width:720px){.rafGrid{grid-template-columns:1fr}}
  `}</style>
  <h3 style={{margin:'0 0 8px'}}>{teacherMode?(ht?'Elèv klas mwen pa ane akademik':'Élèves de ma classe par année académique'):(ht?'Jere elèv pa ane, klas ak seksyon':'Gérer les élèves par année, classe et section')}</h3>
  <div className="rafGrid">
   <div><label>{ht?'Ane akademik':'Année académique'}</label><select value={year} onChange={e=>setYear(e.target.value)}>{years.map(y=><option key={y} value={y}>{y}</option>)}</select></div>
   <div><label>{ht?'Klas / Nivo':'Classe / Niveau'}</label>{teacherMode?<input value={teacher?.classes||level} readOnly aria-readonly="true"/>:<select value={level} onChange={e=>{setLevel(e.target.value);setSection('')}}><option value="">{ht?'Tout klas':'Toutes les classes'}</option>{levels.map(x=><option key={x} value={x}>{x}</option>)}</select>}</div>
   <div><label>{ht?'Seksyon':'Section'}</label>{teacherMode?<input value={teacher?.section||section} readOnly aria-readonly="true"/>:<select value={section} onChange={e=>setSection(e.target.value)}><option value="">{ht?'Tout seksyon':'Toutes les sections'}</option>{sections.map(x=><option key={x} value={x}>{x}</option>)}</select>}</div>
  </div>
  {!teacherMode&&<input style={{marginTop:10}} value={search} onChange={e=>setSearch(e.target.value)} placeholder={ht?'Chèche pa non oswa ID elèv':'Rechercher par nom ou identifiant'}/>} 
  <div className="rafBadges"><span className="rafBadge">{year||'—'}</span>{level&&<span className="rafBadge">{level}</span>}{section&&<span className="rafBadge">{ht?'Seksyon':'Section'} {section}</span>}<span className="rafBadge">{filtered.length} {ht?'elèv':'élève(s)'}</span></div>
  <div className="rafList">{filtered.length===0?<div className="rafStudent">{ht?'Pa gen elèv pou seleksyon sa a.':'Aucun élève pour cette sélection.'}</div>:filtered.map(s=><div className="rafStudent" key={s.id}><b>{s.name}</b> <span className="muted">— {s.id} · {s.year} · {s.level} · {ht?'Seksyon':'Section'} {s.section}</span></div>)}</div>
 </div>,host)
}
