'use client'

import {useEffect,useState} from 'react'
import {createPortal} from 'react-dom'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

export default function InlineAcademicYearEdit(){
 const [target,setTarget]=useState<HTMLElement|null>(null)
 const [lang,setLang]=useState<'ht'|'fr'>('ht')
 const ht=lang==='ht'

 useEffect(()=>{
  const syncLang=(e:Event)=>{
   const b=(e.target as HTMLElement|null)?.closest?.('.langChoice') as HTMLButtonElement|null
   if(b)setLang((b.textContent||'').includes('Français')?'fr':'ht')
  }
  document.addEventListener('click',syncLang,true)
  return()=>document.removeEventListener('click',syncLang,true)
 },[])

 useEffect(()=>{
  const attach=()=>{
   const headings=Array.from(document.querySelectorAll('.card h2'))
   const heading=headings.find(h=>['Relve nòt elèv yo','Relevés de notes des élèves'].includes((h.textContent||'').trim()))
   const card=heading?.closest('.card') as HTMLElement|null
   if(!card){setTarget(null);return}
   const labels=Array.from(card.querySelectorAll('label'))
   const yearLabel=labels.find(l=>['Ane akademik','Année scolaire'].includes((l.textContent||'').trim()))
   const field=yearLabel?.parentElement as HTMLElement|null
   if(!field){setTarget(null);return}
   let mount=field.querySelector('[data-inline-year-edit]') as HTMLElement|null
   if(!mount){
    mount=document.createElement('div')
    mount.setAttribute('data-inline-year-edit','true')
    mount.style.marginTop='8px'
    field.appendChild(mount)
   }
   setTarget(mount)
   setLang((yearLabel?.textContent||'').includes('Année')?'fr':'ht')
  }
  attach()
  const observer=new MutationObserver(()=>requestAnimationFrame(attach))
  observer.observe(document.body,{subtree:true,childList:true})
  return()=>observer.disconnect()
 },[])

 const edit=async()=>{
  if(!target)return
  const card=target.closest('.card') as HTMLElement|null
  if(!card)return
  const labels=Array.from(card.querySelectorAll('label'))
  const studentLabel=labels.find(l=>['Elèv','Élève'].includes((l.textContent||'').trim()))
  const studentSelect=studentLabel?.parentElement?.querySelector('select') as HTMLSelectElement|null
  const studentId=studentSelect?.value||''
  if(!studentId){
   alert(ht?'Chwazi yon elèv anvan ou modifye ane akademik la.':'Sélectionnez un élève avant de modifier l’année scolaire.')
   return
  }
  const {data:student,error:readError}=await supabase.from('school_students').select('academic_year').eq('id',studentId).maybeSingle()
  if(readError){alert(readError.message);return}
  const current=student?.academic_year||''
  const next=prompt(ht?'Nouvo ane akademik':'Nouvelle année scolaire',current)
  if(next===null||!next.trim())return
  const {error}=await supabase.from('school_students').update({academic_year:next.trim()}).eq('id',studentId)
  if(error){alert(error.message);return}
  alert(ht?'Ane akademik la modifye avèk siksè.':'Année scolaire modifiée avec succès.')
  window.location.reload()
 }

 if(!target)return null
 return createPortal(<button type="button" className="btn secondary" onClick={edit} style={{width:'100%'}}>✏️ {ht?'Modifye ane akademik':'Modifier l’année scolaire'}</button>,target)
}
