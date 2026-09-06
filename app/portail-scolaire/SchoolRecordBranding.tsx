'use client'

import {useEffect} from 'react'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

function clean(value:string){return value.replace(/\s+/g,' ').trim()}
function safe(value:any){return String(value||'—').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[c]||c))}

export default function SchoolRecordBranding(){
 useEffect(()=>{
  let settings:any=null

  const currentFrench=()=>{
   const menu=document.querySelector('[data-language-menu] select') as HTMLSelectElement|null
   if(menu)return menu.value==='fr'
   const frButton=Array.from(document.querySelectorAll('button.langChoice')).find(b=>(b.textContent||'').includes('Français')) as HTMLButtonElement|undefined
   if(frButton)return frButton.classList.contains('active')
   const frenchHeading=Array.from(document.querySelectorAll('.card h2')).some(h=>/Relevé|Relevés|Tableau de bord|Mes notes|Mon bulletin/i.test(clean(h.textContent||'')))
   return frenchHeading
  }

  const load=async()=>{
   const {data}=await supabase.from('school_settings').select('school_name,address,phone,email,logo_url').eq('id',1).maybeSingle()
   settings=data
   apply()
  }

  const renderCard=(box:HTMLElement,fr:boolean)=>{
   const title=fr?'Informations de l’école':'Enfòmasyon lekòl'
   const labels=fr
    ?{name:'Nom de l’école',phone:'Téléphone',address:'Adresse',email:'E-mail',logo:'Logo de l’école'}
    :{name:'Non lekòl la',phone:'Telefòn',address:'Adrès',email:'E-mail',logo:'Logo lekòl la'}
   const logo=settings?.logo_url
    ?`<img src="${safe(settings.logo_url)}" alt="Logo" style="max-width:120px;max-height:100px;object-fit:contain;display:block;margin-top:8px"/>`
    :'<div style="color:#6b7280;margin-top:8px">—</div>'
   box.innerHTML=`
    <div style="font-size:30px;font-weight:900;color:#14213d;margin-bottom:20px">${title}</div>
    <div style="display:grid;gap:14px">
      <div><div style="font-weight:800;margin-bottom:6px">${labels.name}</div><div style="border:1px solid #d9e3ec;border-radius:12px;padding:13px 14px;background:#fff;font-size:17px">${safe(settings?.school_name||'Portail Scolaire Haïti')}</div></div>
      <div><div style="font-weight:800;margin-bottom:6px">${labels.phone}</div><div style="border:1px solid #d9e3ec;border-radius:12px;padding:13px 14px;background:#fff;font-size:17px">${safe(settings?.phone)}</div></div>
      <div><div style="font-weight:800;margin-bottom:6px">${labels.address}</div><div style="border:1px solid #d9e3ec;border-radius:12px;padding:13px 14px;background:#fff;font-size:17px">${safe(settings?.address)}</div></div>
      <div><div style="font-weight:800;margin-bottom:6px">${labels.email}</div><div style="border:1px solid #d9e3ec;border-radius:12px;padding:13px 14px;background:#fff;font-size:17px">${safe(settings?.email)}</div></div>
      <div><div style="font-weight:800;margin-bottom:6px">${labels.logo}</div><div style="border:1px solid #d9e3ec;border-radius:12px;padding:13px 14px;background:#fff">${logo}</div></div>
    </div>`
  }

  const apply=()=>{
   if(!settings)return
   const fr=currentFrench()

   document.querySelectorAll('[data-school-branding]').forEach(node=>{
    const parent=(node as HTMLElement).closest('.card') as HTMLElement|null
    const heading=clean(parent?.querySelector('h2')?.textContent||'')
    const isRecordTitle=['Relve nòt elèv yo','Relevés de notes des élèves','Relve nòt mwen','Mon relevé de notes'].includes(heading)
    if(!isRecordTitle)node.remove()
   })

   document.querySelectorAll('.card').forEach(node=>{
    const card=node as HTMLElement
    const headingElement=card.querySelector('h2')
    const heading=clean(headingElement?.textContent||'')
    const isRecordTitle=['Relve nòt elèv yo','Relevés de notes des élèves','Relve nòt mwen','Mon relevé de notes'].includes(heading)
    if(!isRecordTitle||!headingElement)return

    let box=card.querySelector('[data-school-branding="record"]') as HTMLElement|null
    if(!box){
     box=document.createElement('div')
     box.setAttribute('data-school-branding','record')
     box.style.cssText='border:1px solid #dde6ef;border-radius:18px;padding:22px;margin-bottom:24px;background:#fff;box-shadow:0 8px 24px rgba(20,33,61,.05)'
     headingElement.insertAdjacentElement('beforebegin',box)
    }
    renderCard(box,fr)
   })
  }

  load()
  const onUpdated=()=>load()
  const onLanguageChange=(e:Event)=>{
   const target=e.target as HTMLElement|null
   if(target?.matches?.('[data-language-menu] select')||target?.closest?.('.langChoice')) requestAnimationFrame(apply)
  }
  window.addEventListener('school-settings-updated',onUpdated)
  document.addEventListener('change',onLanguageChange,true)
  document.addEventListener('click',onLanguageChange,true)
  const o=new MutationObserver(()=>requestAnimationFrame(apply))
  o.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']})
  return()=>{
   window.removeEventListener('school-settings-updated',onUpdated)
   document.removeEventListener('change',onLanguageChange,true)
   document.removeEventListener('click',onLanguageChange,true)
   o.disconnect()
  }
 },[])
 return null
}
