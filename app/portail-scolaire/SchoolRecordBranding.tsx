'use client'

import {useEffect} from 'react'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

export default function SchoolRecordBranding(){
 useEffect(()=>{
  let settings:any=null
  const load=async()=>{
   const {data}=await supabase.from('school_settings').select('school_name,address,phone,email,logo_url').eq('id',1).maybeSingle()
   settings=data
   apply()
  }
  const apply=()=>{
   if(!settings)return
   document.querySelectorAll('.card').forEach(node=>{
    const card=node as HTMLElement
    const hasRecordActions=Array.from(card.querySelectorAll('button')).some(b=>/Telechaje Word|Télécharger Word|Enprime|Imprimer/.test((b.textContent||'').replace(/\s+/g,' ')))
    if(!hasRecordActions)return
    let header=card.querySelector('[data-school-record-branding]') as HTMLElement|null
    if(!header){header=document.createElement('div');header.setAttribute('data-school-record-branding','true');header.style.cssText='text-align:center;border-bottom:2px solid #d5e0ea;padding:4px 8px 16px;margin-bottom:18px';const h2=card.querySelector('h2');h2?.insertAdjacentElement('beforebegin',header)}
    const logo=settings.logo_url?`<img src="${settings.logo_url}" alt="Logo" style="max-width:82px;max-height:82px;object-fit:contain;margin-bottom:8px"/>`:''
    const contact=[settings.address,settings.phone,settings.email].filter(Boolean).join(' • ')
    header.innerHTML=`${logo}<div style="font-size:22px;font-weight:900;color:#0f4c81">${settings.school_name||'Portail Scolaire Haïti'}</div>${contact?`<div style="margin-top:5px;color:#617080;font-size:13px">${contact}</div>`:''}`
   })
  }
  load()
  const onUpdated=()=>load()
  window.addEventListener('school-settings-updated',onUpdated)
  const o=new MutationObserver(()=>requestAnimationFrame(apply));o.observe(document.body,{subtree:true,childList:true})
  return()=>{window.removeEventListener('school-settings-updated',onUpdated);o.disconnect()}
 },[])
 return null
}
