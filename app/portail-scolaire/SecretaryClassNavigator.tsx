'use client'

import {useEffect,useState} from 'react'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Student={id:string;name:string;level:string;section:string;academic_year:string}

export default function SecretaryClassNavigator(){
 const [open,setOpen]=useState<{name:string;section:string}|null>(null)
 const [students,setStudents]=useState<Student[]>([])
 const [lang,setLang]=useState<'ht'|'fr'>('ht')

 useEffect(()=>{
  const syncLang=(e:Event)=>{
   const b=(e.target as HTMLElement|null)?.closest?.('.langChoice') as HTMLButtonElement|null
   if(!b)return
   setLang(b.textContent?.includes('Français')?'fr':'ht')
  }
  document.addEventListener('click',syncLang,true)
  return()=>document.removeEventListener('click',syncLang,true)
 },[])

 useEffect(()=>{
  const onClick=async(e:Event)=>{
   const root=document.querySelector('.secretary-dashboard')
   if(!root)return
   const card=(e.target as HTMLElement|null)?.closest?.('.secretary-dashboard .teacherCard') as HTMLElement|null
   if(!card)return
   const classesHeading=card.closest('.card')?.querySelector('h3')?.textContent?.trim()||''
   if(classesHeading!=='Klas & seksyon'&&classesHeading!=='Classes & sections')return
   const name=card.querySelector('b')?.textContent?.trim()||''
   const sectionText=card.querySelector('.muted')?.textContent?.trim()||''
   const section=sectionText.replace(/^Seksyon\s*/i,'').replace(/^Section\s*/i,'').trim()
   if(!name||!section)return
   const {data,error}=await supabase.from('school_students').select('id,name,level,section,academic_year').eq('level',name).eq('section',section).order('name')
   if(error)return
   setStudents((data||[]) as Student[])
   setOpen({name,section})
  }
  document.addEventListener('click',onClick,true)
  return()=>document.removeEventListener('click',onClick,true)
 },[])

 if(!open)return null
 const ht=lang==='ht'
 return <div role="dialog" aria-modal="true" style={{position:'fixed',inset:0,zIndex:10000,background:'rgba(15,23,42,.45)',display:'flex',alignItems:'flex-end',justifyContent:'center',padding:12}} onClick={()=>setOpen(null)}>
  <section className="card" style={{width:'100%',maxWidth:700,maxHeight:'78vh',overflow:'auto',margin:0}} onClick={e=>e.stopPropagation()}>
   <div className="row" style={{justifyContent:'space-between',alignItems:'center'}}>
    <div><h3 style={{margin:'0 0 4px'}}>{open.name}</h3><div className="muted">{ht?'Seksyon':'Section'} {open.section}</div></div>
    <button type="button" className="btn secondary" onClick={()=>setOpen(null)}>✕ {ht?'Fèmen':'Fermer'}</button>
   </div>
   <div style={{marginTop:14}}>
    {students.length===0?<div className="notice">{ht?'Pa gen elèv nan klas sa a pou kounye a.':'Aucun élève dans cette classe pour le moment.'}</div>:<table><tbody>{students.map(s=><tr key={s.id}><td>{s.id}</td><td><b>{s.name}</b></td><td>{s.academic_year}</td></tr>)}</tbody></table>}
   </div>
  </section>
 </div>
}
