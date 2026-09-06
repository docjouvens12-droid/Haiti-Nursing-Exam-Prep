'use client'

import {useEffect} from 'react'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

export default function AllSectionsSelectorFix(){
 useEffect(()=>{
  let cancelled=false
  let sections:string[]=['A','B','C','D']

  const load=async()=>{
   const [{data:students},{data:classes},{data:teachers}]=await Promise.all([
    supabase.from('school_students').select('section'),
    supabase.from('school_classes').select('section'),
    supabase.from('school_teachers').select('section')
   ])
   if(cancelled)return
   const discovered=[...(students||[]),...(classes||[]),...(teachers||[])]
    .map(x=>String(x.section||'').trim())
    .filter(Boolean)
   sections=[...new Set(['A','B','C','D',...discovered])].sort()
   apply()
  }

  const apply=()=>{
   document.querySelectorAll('label').forEach(labelNode=>{
    const label=labelNode as HTMLLabelElement
    if(!['Seksyon','Section'].includes((label.textContent||'').trim()))return
    const parent=label.parentElement
    if(!parent)return
    const select=parent.querySelector('select') as HTMLSelectElement|null
    if(!select)return

    const current=select.value
    const existing=new Set(Array.from(select.options).map(o=>o.value))
    sections.forEach(value=>{
     if(existing.has(value))return
     const option=document.createElement('option')
     option.value=value
     option.textContent=value
     select.appendChild(option)
    })
    if(current)select.value=current
   })
  }

  load()
  apply()
  const observer=new MutationObserver(()=>requestAnimationFrame(apply))
  observer.observe(document.body,{subtree:true,childList:true})
  return()=>{cancelled=true;observer.disconnect()}
 },[])
 return null
}
