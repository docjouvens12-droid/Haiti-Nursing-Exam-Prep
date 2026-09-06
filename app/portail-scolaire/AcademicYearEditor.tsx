'use client'

import {useEffect,useMemo,useState} from 'react'
import {createPortal} from 'react-dom'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Student={id:string;name:string;level:string;section:string;year:string}

export default function AcademicYearEditor(){
 const [target,setTarget]=useState<HTMLElement|null>(null)
 const [lang,setLang]=useState<'ht'|'fr'>('fr')
 const [open,setOpen]=useState(false)
 const [students,setStudents]=useState<Student[]>([])
 const [studentId,setStudentId]=useState('')
 const [newYear,setNewYear]=useState('')
 const [message,setMessage]=useState('')
 const ht=lang==='ht'

 const load=async()=>{
  const {data:{session}}=await supabase.auth.getSession()
  const user=session?.user
  if(!user)return
  const {data:profile}=await supabase.from('school_profiles').select('role').eq('user_id',user.id).maybeSingle()
  if(profile?.role!=='direction'){setTarget(null);return}
  const {data}=await supabase.from('school_students').select('id,name,level,section,academic_year').order('name')
  setStudents((data||[]).map(x=>({id:x.id,name:x.name,level:x.level,section:x.section,year:x.academic_year||''})))
 }

 useEffect(()=>{
  load()
  const {data:l}=supabase.auth.onAuthStateChange(()=>load())
  return()=>l.subscription.unsubscribe()
 },[])

 useEffect(()=>{
  const current=document.querySelector('[data-global-language-menu] select') as HTMLSelectElement|null
  if(current)setLang(current.value==='ht'?'ht':'fr')
  const onLang=(e:Event)=>{
   const target=e.target as HTMLSelectElement|null
   if(!target?.closest?.('[data-global-language-menu]'))return
   setLang(target.value==='ht'?'ht':'fr')
  }
  document.addEventListener('change',onLang,true)
  return()=>document.removeEventListener('change',onLang,true)
 },[])

 useEffect(()=>{
  const attach=()=>{
   const directionHeading=Array.from(document.querySelectorAll('.ps-page h2')).find(h=>['Tablo bò pou Direksyon an','Tableau de bord de la Direction'].includes((h.textContent||'').trim()))
   if(!directionHeading){setTarget(null);return}

   const actionHeading=Array.from(document.querySelectorAll('.ps-page h3')).find(h=>['Aksyon rapid','Actions rapides'].includes((h.textContent||'').trim()))
   const actionCard=actionHeading?.closest('.card') as HTMLElement|null
   const menu=actionCard?.querySelector('.menu') as HTMLElement|null
   if(!menu){setTarget(null);return}

   let mount=menu.querySelector('[data-academic-year-editor]') as HTMLElement|null
   if(!mount){
    mount=document.createElement('div')
    mount.setAttribute('data-academic-year-editor','true')
    mount.style.display='contents'
    menu.appendChild(mount)
   }
   setTarget(mount)
  }
  attach()
  const o=new MutationObserver(()=>requestAnimationFrame(attach))
  o.observe(document.body,{subtree:true,childList:true})
  return()=>o.disconnect()
 },[])

 const student=useMemo(()=>students.find(s=>s.id===studentId)||null,[students,studentId])

 const chooseStudent=(id:string)=>{
  setStudentId(id)
  const s=students.find(x=>x.id===id)
  setNewYear(s?.year||'')
  setMessage('')
 }

 const save=async()=>{
  if(!student||!newYear.trim())return
  setMessage('')
  const {error}=await supabase.from('school_students').update({academic_year:newYear.trim()}).eq('id',student.id)
  if(error){setMessage(error.message);return}
  setStudents(list=>list.map(s=>s.id===student.id?{...s,year:newYear.trim()}:s))
  setMessage(ht?'Ane akademik la modifye avèk siksè.':'Année scolaire modifiée avec succès.')
 }

 if(!target)return null
 return createPortal(<>
  <button type="button" className="menuBtn" onClick={()=>setOpen(v=>!v)}>📅 {ht?'Modifye ane akademik':'Modifier l’année scolaire'}</button>
  {open&&<div className="card" style={{gridColumn:'1 / -1',marginTop:12}}>
   <h2>{ht?'Modifye ane akademik':'Modifier l’année scolaire'}</h2>
   <p className="muted">{ht?'Chwazi yon elèv epi modifye ane akademik li.':'Sélectionnez un élève puis modifiez son année scolaire.'}</p>
   <div className="grid2">
    <div><label>{ht?'Elèv':'Élève'}</label><select value={studentId} onChange={e=>chooseStudent(e.target.value)}><option value="">—</option>{students.map(s=><option key={s.id} value={s.id}>{s.name} — {s.level} {s.section}</option>)}</select></div>
    <div><label>{ht?'Ane akademik':'Année scolaire'}</label><input value={newYear} onChange={e=>setNewYear(e.target.value)} placeholder="2026–2027"/></div>
   </div>
   {student&&<div className="muted" style={{marginTop:10}}>{ht?'Klas':'Classe'}: {student.level} — {ht?'Seksyon':'Section'} {student.section}</div>}
   <button type="button" className="btn" style={{marginTop:12}} disabled={!student||!newYear.trim()} onClick={save}>{ht?'Anrejistre nouvo ane a':'Enregistrer la nouvelle année'}</button>
   {message&&<div className="notice" style={{marginTop:12}}>{message}</div>}
  </div>}
 </>,target)
}
