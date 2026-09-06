'use client'

import {useEffect,useMemo,useState} from 'react'
import {createPortal} from 'react-dom'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')
const STORAGE_KEY='ps-academic-year'

function academicYears(){
 const now=new Date()
 const y=now.getFullYear()
 const start=now.getMonth()>=6?y:y-1
 return Array.from({length:7},(_,i)=>{
  const a=start+2-i
  return `${a}–${a+1}`
 })
}

export default function GlobalAcademicYearSelector(){
 const [host,setHost]=useState<HTMLElement|null>(null)
 const [visible,setVisible]=useState(false)
 const [lang,setLang]=useState<'ht'|'fr'>('fr')
 const [savedYears,setSavedYears]=useState<string[]>([])
 const [year,setYear]=useState('')
 const ht=lang==='ht'

 useEffect(()=>{
  const attach=()=>{
   const langMenu=document.querySelector<HTMLElement>('[data-global-language-menu="true"]')
   if(!langMenu){setHost(null);return}
   let mount=document.querySelector<HTMLElement>('[data-global-academic-year-mount="true"]')
   if(!mount){
    mount=document.createElement('div')
    mount.setAttribute('data-global-academic-year-mount','true')
    langMenu.insertAdjacentElement('afterend',mount)
   }
   setHost(mount)
  }
  attach()
  const observer=new MutationObserver(()=>requestAnimationFrame(attach))
  observer.observe(document.body,{childList:true,subtree:true})
  return()=>observer.disconnect()
 },[])

 useEffect(()=>{
  let active=true
  const load=async()=>{
   const {data:{user}}=await supabase.auth.getUser()
   if(!active||!user){setVisible(false);return}
   const {data:profile}=await supabase.from('school_profiles').select('role,must_change_password').eq('user_id',user.id).maybeSingle()
   const ok=['direction','teacher','secretary','student'].includes(profile?.role||'')&&!profile?.must_change_password
   if(!active)return
   setVisible(ok)
   if(!ok)return
   const {data}=await supabase.from('school_students').select('academic_year')
   const years=[...new Set((data||[]).map((x:any)=>x.academic_year).filter(Boolean))] as string[]
   setSavedYears(years)
   const stored=window.localStorage.getItem(STORAGE_KEY)||''
   const current=academicYears()[2]
   const initial=stored||years.sort().reverse()[0]||current
   setYear(initial)
   window.dispatchEvent(new CustomEvent('school-academic-year-change',{detail:{year:initial}}))
  }
  load()
  const {data:listener}=supabase.auth.onAuthStateChange(()=>setTimeout(load,0))
  return()=>{active=false;listener.subscription.unsubscribe()}
 },[])

 useEffect(()=>{
  const sync=()=>setLang(document.querySelector<HTMLSelectElement>('[data-global-language-menu] select')?.value==='ht'?'ht':'fr')
  sync()
  const onChange=(e:Event)=>{if((e.target as HTMLElement|null)?.closest?.('[data-global-language-menu]'))sync()}
  document.addEventListener('change',onChange,true)
  return()=>document.removeEventListener('change',onChange,true)
 },[])

 const years=useMemo(()=>[...new Set([...academicYears(),...savedYears,year].filter(Boolean))].sort().reverse(),[savedYears,year])
 const change=(value:string)=>{
  setYear(value)
  window.localStorage.setItem(STORAGE_KEY,value)
  window.dispatchEvent(new CustomEvent('school-academic-year-change',{detail:{year:value}}))
 }

 if(!host||!visible)return null
 return createPortal(<div className="globalAcademicYear" data-global-academic-year="true">
  <label htmlFor="globalAcademicYearSelect">{ht?'Ane akademik':'Année académique'}</label>
  <select id="globalAcademicYearSelect" value={year} onChange={e=>change(e.target.value)}>
   {years.map(y=><option key={y} value={y}>{y}</option>)}
  </select>
  <style>{`
   .globalAcademicYear{max-width:1000px;margin:0 auto 12px;padding:0 16px;display:flex;align-items:center;justify-content:flex-end;gap:9px;box-sizing:border-box}
   .globalAcademicYear label{font-size:12px;font-weight:800;color:#4b5563;white-space:nowrap}
   .globalAcademicYear select{width:auto;min-width:150px;max-width:210px;padding:8px 34px 8px 10px;border:1px solid #d7e0e8;border-radius:10px;background:#fff;font-weight:700;color:#13213a}
   @media(max-width:720px){.globalAcademicYear{justify-content:space-between;padding:0 16px;margin-bottom:12px}.globalAcademicYear select{min-width:155px}}
  `}</style>
 </div>,host)
}
