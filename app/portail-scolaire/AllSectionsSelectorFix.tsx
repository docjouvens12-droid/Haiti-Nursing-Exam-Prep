'use client'

import {useEffect} from 'react'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

export default function AllSectionsSelectorFix(){
 useEffect(()=>{
  let cancelled=false
  let sections:string[]=[]

  const load=async()=>{
   const {data}=await supabase.from('school_students').select('section')
   if(cancelled)return
   sections=[...new Set((data||[]).map(x=>String(x.section||'').trim()).filter(Boolean))].sort()
   apply()
  }

  const apply=()=>{
   if(!sections.length)return
   document.querySelectorAll('.card').forEach(card=>{
    const heading=(card.querySelector('h2')?.textContent||'').trim()
    if(!(/Relve nòt elèv yo/i.test(heading)||/Relevés de notes des élèves/i.test(heading)))return
    const labels=Array.from(card.querySelectorAll('label'))
    const label=labels.find(l=>['Seksyon','Section'].includes((l.textContent||'').trim()))
    const select=label?.parentElement?.querySelector('select') as HTMLSelectElement|null
    if(!select)return
    const current=select.value
    const first=select.options[0]
    const firstText=first?.textContent||'Tout seksyon'
    const existing=new Set(Array.from(select.options).map(o=>o.value))
    sections.forEach(value=>{
     if(existing.has(value))return
     const option=document.createElement('option')
     option.value=value
     option.textContent=value
     select.appendChild(option)
    })
    if(current)select.value=current
    if(select.options[0])select.options[0].textContent=firstText
   })
  }

  load()
  const observer=new MutationObserver(()=>requestAnimationFrame(apply))
  observer.observe(document.body,{subtree:true,childList:true})
  return()=>{cancelled=true;observer.disconnect()}
 },[])
 return null
}
