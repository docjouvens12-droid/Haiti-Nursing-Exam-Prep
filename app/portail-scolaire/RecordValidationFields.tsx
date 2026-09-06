'use client'

import {useEffect} from 'react'

function clean(value:string){return value.replace(/\s+/g,' ').trim()}

export default function RecordValidationFields(){
 useEffect(()=>{
  const apply=()=>{
   document.querySelectorAll('.card').forEach(cardNode=>{
    const card=cardNode as HTMLElement
    const buttons=Array.from(card.querySelectorAll('button')) as HTMLButtonElement[]
    const actionButton=buttons.find(b=>/Telechaje Word|Télécharger Word|Enprime|Imprimer/i.test(clean(b.textContent||'')))
    if(!actionButton)return

    const isFrench=buttons.some(b=>/Télécharger Word|Imprimer/i.test(clean(b.textContent||'')))
    const ht=!isFrench

    const old=card.querySelector('[data-record-validation-fields]') as HTMLElement|null
    if(old){
      const title=old.querySelector('[data-validation-title]') as HTMLElement|null
      const signature=old.querySelector('[data-validation-signature]') as HTMLElement|null
      const stamp=old.querySelector('[data-validation-stamp]') as HTMLElement|null
      const date=old.querySelector('[data-validation-date]') as HTMLElement|null
      if(title)title.textContent=ht?'Validasyon dokiman':'Validation du document'
      if(signature)signature.textContent=ht?'Siyati Direksyon':'Signature de la Direction'
      if(stamp)stamp.textContent=ht?'Kachè lekòl la':'Cachet de l’école'
      if(date)date.textContent=ht?'Dat':'Date'
      return
    }

    const box=document.createElement('div')
    box.setAttribute('data-record-validation-fields','true')
    box.style.cssText='margin-top:20px;padding:16px;border:2px solid #9fb4c8;border-radius:14px;background:#f8fafc;grid-column:1/-1;width:100%;display:block;'
    box.innerHTML=`
      <div data-validation-title style="font-size:16px;font-weight:900;color:#0f4c81;margin-bottom:18px">${ht?'Validasyon dokiman':'Validation du document'}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px 26px">
        <div>
          <div style="height:52px"></div>
          <div data-validation-signature style="border-top:1px solid #374151;padding-top:7px;font-weight:800">${ht?'Siyati Direksyon':'Signature de la Direction'}</div>
        </div>
        <div>
          <div style="height:52px"></div>
          <div data-validation-stamp style="border-top:1px solid #374151;padding-top:7px;font-weight:800">${ht?'Kachè lekòl la':'Cachet de l’école'}</div>
        </div>
        <div style="grid-column:1/-1">
          <div style="height:28px"></div>
          <div data-validation-date style="border-top:1px solid #374151;padding-top:7px;font-weight:800">${ht?'Dat':'Date'}</div>
        </div>
      </div>`

    const actionWrap=actionButton.parentElement
    if(actionWrap&&actionWrap.parentElement){
      actionWrap.parentElement.insertBefore(box,actionWrap)
    }else{
      card.appendChild(box)
    }
   })
  }

  apply()
  const observer=new MutationObserver(()=>requestAnimationFrame(apply))
  observer.observe(document.body,{subtree:true,childList:true,characterData:true})
  const timer=window.setInterval(apply,700)
  window.addEventListener('focus',apply)
  return()=>{
    observer.disconnect()
    window.clearInterval(timer)
    window.removeEventListener('focus',apply)
  }
 },[])
 return null
}
