'use client'

import {useEffect,useState} from 'react'
import {createClient,type User} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Student={id:string;name:string;level:string;section:string;academic_year:string}
type SchoolClass={id:number;name:string;section:string}

export default function SecretaryEnhancements(){
 const [user,setUser]=useState<User|null>(null)
 const [isSecretary,setIsSecretary]=useState(false)
 const [lang,setLang]=useState<'ht'|'fr'>('ht')
 const [students,setStudents]=useState<Student[]>([])
 const [classes,setClasses]=useState<SchoolClass[]>([])
 const [studentId,setStudentId]=useState('')
 const [classId,setClassId]=useState('')
 const [year,setYear]=useState('2026–2027')
 const [message,setMessage]=useState('')
 const ht=lang==='ht'

 const load=async(u:User)=>{
  const pr=await supabase.from('school_profiles').select('role').eq('user_id',u.id).maybeSingle()
  const secretary=pr.data?.role==='secretary'
  setIsSecretary(secretary)
  if(!secretary)return
  const [sr,cr]=await Promise.all([
   supabase.from('school_students').select('id,name,level,section,academic_year').order('name'),
   supabase.from('school_classes').select('id,name,section').order('id')
  ])
  if(!sr.error)setStudents(sr.data||[])
  if(!cr.error)setClasses(cr.data||[])
 }

 useEffect(()=>{
  supabase.auth.getSession().then(({data})=>{const u=data.session?.user||null;setUser(u);if(u)load(u)})
  const {data:l}=supabase.auth.onAuthStateChange((_e,s)=>{const u=s?.user||null;setUser(u);setIsSecretary(false);if(u)load(u)})
  return()=>l.subscription.unsubscribe()
 },[])

 useEffect(()=>{
  const sync=(e:Event)=>{
   const target=e.target as HTMLElement|null
   const button=target?.closest?.('.langChoice') as HTMLButtonElement|null
   if(!button)return
   const next=button.textContent?.includes('Français')?'fr':'ht'
   setLang(next)
   setTimeout(()=>{
    const root=document.querySelector('.secretary-dashboard')
    if(!root)return
    const buttons=Array.from(root.querySelectorAll('button')) as HTMLButtonElement[]
    const wanted=buttons.find(b=>b.textContent?.trim()===(next==='fr'?'Français':'Kreyòl'))
    wanted?.click()
   },0)
  }
  document.addEventListener('click',sync,true)
  return()=>document.removeEventListener('click',sync,true)
 },[])

 const chooseStudent=(id:string)=>{
  setStudentId(id);setMessage('')
  const s=students.find(x=>x.id===id)
  if(!s)return
  setYear(s.academic_year||'2026–2027')
  const c=classes.find(x=>x.name===s.level&&x.section===s.section)
  setClassId(c?String(c.id):'')
 }

 const save=async()=>{
  if(!isSecretary||!studentId||!classId)return
  const c=classes.find(x=>String(x.id)===classId)
  if(!c)return
  const {error}=await supabase.from('school_students').update({level:c.name,section:c.section,academic_year:year.trim()}).eq('id',studentId)
  if(error){setMessage(error.message);return}
  setStudents(prev=>prev.map(s=>s.id===studentId?{...s,level:c.name,section:c.section,academic_year:year.trim()}:s))
  setMessage(ht?'Chanjman yo anrejistre.':'Modifications enregistrées.')
 }

 if(!user||!isSecretary)return null
 return <section className="card secretary-academic-manager" style={{maxWidth:1000,margin:'14px auto'}}>
  <h3>{ht?'Chanje klas ak ane akademik':'Modifier la classe et l’année académique'}</h3>
  <p className="muted">{ht?'Sekretè a ka mete elèv la nan yon lòt klas/seksyon epi chanje ane akademik li.':'Le Secrétariat peut changer la classe/section de l’élève ainsi que son année académique.'}</p>
  <div className="grid2">
   <div><label>{ht?'Elèv':'Élève'}</label><select value={studentId} onChange={e=>chooseStudent(e.target.value)}><option value="">—</option>{students.map(s=><option key={s.id} value={s.id}>{s.name} — {s.level} {s.section}</option>)}</select></div>
   <div><label>{ht?'Klas / Seksyon':'Classe / Section'}</label><select value={classId} onChange={e=>setClassId(e.target.value)} disabled={!studentId}><option value="">—</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name} — {ht?'Seksyon':'Section'} {c.section}</option>)}</select></div>
   <div><label>{ht?'Ane akademik':'Année académique'}</label><input value={year} onChange={e=>setYear(e.target.value)} disabled={!studentId}/></div>
  </div>
  <button className="btn" style={{marginTop:12}} onClick={save} disabled={!studentId||!classId}>{ht?'Anrejistre chanjman':'Enregistrer les modifications'}</button>
  {message&&<div className="notice" style={{marginTop:12}}>{message}</div>}
 </section>
}
