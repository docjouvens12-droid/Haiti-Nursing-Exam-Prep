'use client'

import {useEffect} from 'react'

function clean(value:string){return value.replace(/\s+/g,' ').trim()}

export default function RecordValidationFields(){
 useEffect(()=>{
  const apply=()=>{
   document.querySelectorAll('.card').forEach(cardNode=>{
    const card=cardNode as HTMLElement
    const title=clean(card.querySelector('h2')?.textContent||'')
    if(!(/Relve nòt/i.test(title)||/relev[eé]s? de notes/i.test(title)))return
    if(card.querySelector('[data-record-validation-fields]'))return

    const actions=Array.from(card.querySelectorAll('button')).find(b=>{
      const text=clean(b.textContent||'')
      return /Telechaje Word|Télécharger Word|Enprime|Imprimer/.test(text)
    })
    if(!actions)return

    const ht=!/relev[eé]/i.test(title)
    const box=document.createElement('div')
    box.setAttribute('data-record-validation-fields','true')
    box.style.marginTop='18px'
    box.style.padding='14px'
    box.style.border='1px solid #dde6ef'
    box.style.borderRadius='12px'
    box.style.background='#f8fafc'
    box.innerHTML=`
      <div style="font-weight:800;margin-bottom:14px">${ht?'Validasyon dokiman':'Validation du document'}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px 28px">
        <div><div style="height:42px"></div><div style="border-top:1px solid #6b7280;padding-top:6px;font-weight:700">${ht?'Siyati Direksyon':'Signature de la Direction'}</div></div>
        <div><div style="height:42px"></div><div style="border-top:1px solid #6b7280;padding-top:6px;font-weight:700">${ht?'Kachè lekòl la':'Cachet de l’école'}</div></div>
        <div style="grid-column:1 / -1"><div style="height:28px"></div><div style="border-top:1px solid #6b7280;padding-top:6px;font-weight:700">${ht?'Dat':'Date'}</div></div>
      </div>`
    const actionWrap=actions.parentElement
    actionWrap?.insertAdjacentElement('beforebegin',box)
   })
  }
  apply()
  const observer=new MutationObserver(()=>requestAnimationFrame(apply))
  observer.observe(document.body,{subtree:true,childList:true})
  return()=>observer.disconnect()
 },[])
 return null
}
