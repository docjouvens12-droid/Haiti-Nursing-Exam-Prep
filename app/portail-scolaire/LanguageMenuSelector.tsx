'use client'

import {useEffect} from 'react'

export default function LanguageMenuSelector(){
 useEffect(()=>{
  let initialized=false

  const apply=()=>{
   const panel=document.querySelector('.langPanel') as HTMLElement|null
   if(!panel)return

   const buttons=Array.from(panel.querySelectorAll('button.langChoice')) as HTMLButtonElement[]
   const htButton=buttons.find(b=>(b.textContent||'').includes('Kreyòl'))
   const frButton=buttons.find(b=>(b.textContent||'').includes('Français'))
   if(!htButton||!frButton)return

   htButton.style.display='none'
   frButton.style.display='none'

   let wrap=panel.querySelector('[data-language-menu]') as HTMLElement|null
   if(!wrap){
    wrap=document.createElement('div')
    wrap.setAttribute('data-language-menu','true')
    wrap.style.width='100%'

    const select=document.createElement('select')
    select.setAttribute('aria-label','Langue / Lang')
    select.style.width='100%'
    select.style.padding='10px 12px'
    select.style.borderRadius='9px'
    select.style.border='1px solid rgba(255,255,255,.6)'
    select.style.background='#fff'
    select.style.color='#0f4c81'
    select.style.fontWeight='800'
    select.innerHTML='<option value="fr">Français</option><option value="ht">Kreyòl</option>'
    select.addEventListener('change',()=>{
     if(select.value==='fr') frButton.click()
     else htButton.click()
    })
    wrap.appendChild(select)
    panel.appendChild(wrap)
   }

   const select=wrap.querySelector('select') as HTMLSelectElement|null
   if(!select)return
   const frenchActive=frButton.classList.contains('active')
   select.value=frenchActive?'fr':'ht'

   if(!initialized){
    initialized=true
    select.value='fr'
    if(!frenchActive) frButton.click()
   }
  }

  apply()
  const observer=new MutationObserver(()=>requestAnimationFrame(apply))
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']})
  return()=>observer.disconnect()
 },[])
 return null
}
