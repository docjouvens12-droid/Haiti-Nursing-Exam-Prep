'use client'

import {useEffect} from 'react'

export default function LanguageMenuSelector(){
 useEffect(()=>{
  let initialized=false

  const apply=()=>{
   const panel=document.querySelector('.langPanel') as HTMLElement|null
   const page=document.querySelector('.ps-page') as HTMLElement|null
   if(!panel||!page)return

   const buttons=Array.from(panel.querySelectorAll('button.langChoice')) as HTMLButtonElement[]
   const htButton=buttons.find(b=>(b.textContent||'').includes('Kreyòl'))
   const frButton=buttons.find(b=>(b.textContent||'').includes('Français'))
   if(!htButton||!frButton)return

   htButton.style.display='none'
   frButton.style.display='none'
   panel.style.display='none'

   let wrap=document.querySelector('[data-global-language-menu]') as HTMLElement|null
   if(!wrap){
    wrap=document.createElement('div')
    wrap.setAttribute('data-global-language-menu','true')
    wrap.style.position='relative'
    wrap.style.zIndex='1'
    wrap.style.width='min(170px, calc(100vw - 32px))'
    wrap.style.margin='10px 16px 18px auto'
    wrap.style.padding='5px'
    wrap.style.borderRadius='12px'
    wrap.style.background='rgba(255,255,255,.97)'
    wrap.style.border='1px solid #d9e3ec'
    wrap.style.boxShadow='0 5px 16px rgba(20,33,61,.12)'
    wrap.style.pointerEvents='auto'

    const select=document.createElement('select')
    select.setAttribute('aria-label','Langue / Lang')
    select.style.width='100%'
    select.style.padding='8px 10px'
    select.style.borderRadius='9px'
    select.style.border='1px solid #cbd8e4'
    select.style.background='#fff'
    select.style.color='#0f4c81'
    select.style.fontWeight='800'
    select.style.fontSize='14px'
    select.innerHTML='<option value="fr">Français</option><option value="ht">Kreyòl</option>'
    select.addEventListener('change',()=>{
     if(select.value==='fr') frButton.click()
     else htButton.click()
    })
    wrap.appendChild(select)
   }

   if(wrap.parentElement!==page)page.insertBefore(wrap,page.firstChild)

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
  return()=>{
   observer.disconnect()
   document.querySelector('[data-global-language-menu]')?.remove()
  }
 },[])
 return null
}
