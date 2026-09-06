'use client'

import {useEffect,useState} from 'react'
import {createPortal} from 'react-dom'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Subject={id:number;name:string;coefficient:number}

export default function SubjectCoefficientEditor(){
 const [target,setTarget]=useState<HTMLElement|null>(null)
 const [subjects,setSubjects]=useState<Subject[]>([])
 const [lang,setLang]=useState<'ht'|'fr'>('fr')
 const [saving,setSaving]=useState<number|null>(null)
 const [message,setMessage]=useState('')

 const load=async()=>{
  const {data:{session}}=await supabase.auth.getSession()
  if(!session?.user){setTarget(null);return}
  const {data:profile}=await supabase.from('school_profiles').select('role').eq('user_id',session.user.id).maybeSingle()
  if(profile?.role!=='direction'){setTarget(null);return}
  const {data}=await supabase.from('school_subjects').select('id,name,coefficient').order('id')
  setSubjects((data||[]).map(x=>({id:Number(x.id),name:x.name,coefficient:Number(x.coefficient||1)})))
 }

 useEffect(()=>{load()},[])

 useEffect(()=>{
  const attach=()=>{
   const cards=Array.from(document.querySelectorAll('.ps-page .card')) as HTMLElement[]
   const card=cards.find(c=>{
    const text=(c.textContent||'').replace(/\s+/g,' ').trim()
    return /Matières|Matyè/i.test(text) && subjects.some(s=>text.includes(s.name))
   })
   if(!card){setTarget(null);return}
   setLang(/Matières|Modifier|Supprimer/i.test(card.textContent||'')?'fr':'ht')
   let mount=card.querySelector('[data-subject-coefficient-mount]') as HTMLElement|null
   if(!mount){
    mount=document.createElement('div')
    mount.setAttribute('data-subject-coefficient-mount','true')
    mount.style.marginTop='18px'
    card.appendChild(mount)
   }
   setTarget(mount)
  }
  attach()
  const o=new MutationObserver(()=>requestAnimationFrame(attach))
  o.observe(document.body,{subtree:true,childList:true})
  return()=>o.disconnect()
 },[subjects])

 const save=async(subject:Subject,value:number)=>{
  if(!Number.isFinite(value)||value<=0)return
  setSaving(subject.id);setMessage('')
  const {error}=await supabase.from('school_subjects').update({coefficient:value}).eq('id',subject.id)
  if(error)setMessage(error.message)
  else{
   setSubjects(xs=>xs.map(x=>x.id===subject.id?{...x,coefficient:value}:x))
   setMessage(lang==='fr'?'Coefficient enregistré.':'Koefisyan an anrejistre.')
   window.dispatchEvent(new Event('school-subject-coefficients-updated'))
  }
  setSaving(null)
 }

 if(!target)return null
 const fr=lang==='fr'
 return createPortal(
  <div style={{borderTop:'1px solid #dde6ef',paddingTop:16}}>
   <div style={{fontWeight:900,fontSize:18,marginBottom:5}}>{fr?'Coefficients des matières':'Koefisyan matyè yo'}</div>
   <div style={{color:'#617080',fontSize:13,marginBottom:12}}>{fr?'Le coefficient 1 conserve le même poids pour toutes les matières.':'Koefisyan 1 bay tout matyè menm pwa.'}</div>
   <div style={{display:'grid',gap:9}}>
    {subjects.map(s=><CoefficientRow key={s.id} subject={s} saving={saving===s.id} fr={fr} onSave={save}/>) }
   </div>
   {message&&<div style={{marginTop:10,fontWeight:700,color:'#0f4c81'}}>{message}</div>}
  </div>,target)
}

function CoefficientRow({subject,saving,fr,onSave}:{subject:Subject;saving:boolean;fr:boolean;onSave:(s:Subject,v:number)=>void}){
 const [value,setValue]=useState(String(subject.coefficient))
 useEffect(()=>setValue(String(subject.coefficient)),[subject.coefficient])
 return <div style={{display:'grid',gridTemplateColumns:'1fr 84px 92px',gap:8,alignItems:'center'}}>
  <div style={{fontWeight:700}}>{subject.name}</div>
  <input aria-label={`${fr?'Coefficient':'Koefisyan'} ${subject.name}`} type="number" min="0.1" step="0.1" value={value} onChange={e=>setValue(e.target.value)} style={{width:'100%'}} />
  <button type="button" className="btn secondary" disabled={saving} onClick={()=>onSave(subject,Number(value))}>{saving?'…':fr?'Enregistrer':'Anrejistre'}</button>
 </div>
}
