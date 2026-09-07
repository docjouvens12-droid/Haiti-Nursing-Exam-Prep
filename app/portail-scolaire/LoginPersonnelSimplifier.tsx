'use client'

import { useEffect } from 'react'

export default function LoginPersonnelSimplifier(){
  useEffect(()=>{
    let raf=0
    let tries=0

    const apply=()=>{
      const page=document.querySelector('.ps-page')
      const title=Array.from(page?.querySelectorAll('h2')||[]).find(el=>['Connexion','Konekte'].includes((el.textContent||'').trim()))
      const card=title?.closest('.card') as HTMLElement|null

      if(!card){
        if(tries++<120) raf=requestAnimationFrame(apply)
        return
      }

      const isHt=(title?.textContent||'').trim()==='Konekte'
      const muted=card.querySelector('p.muted') as HTMLElement|null
      if(muted) muted.textContent=isHt
        ?'Antre idantifyan pèsonèl ou ak modpas ou.'
        :'Entrez votre identifiant du personnel et votre mot de passe.'

      const selects=Array.from(card.querySelectorAll('select'))
      for(const select of selects){
        const wrapper=select.parentElement as HTMLElement|null
        if(wrapper && !wrapper.closest('[data-global-language-menu]')) wrapper.style.display='none'
      }

      const identifier=card.querySelector('input[name="identifier"]') as HTMLInputElement|null
      if(identifier){
        identifier.type='text'
        identifier.setAttribute('autocomplete','username')
        identifier.setAttribute('inputmode','text')
        const wrapper=identifier.parentElement
        const label=wrapper?.querySelector('label') as HTMLElement|null
        if(label) label.textContent=isHt?'Idantifyan pèsonèl':'Identifiant du personnel'
      }
    }

    apply()

    const observer=new MutationObserver(()=>apply())
    observer.observe(document.body,{subtree:true,childList:true})

    const languageHandler=()=>requestAnimationFrame(apply)
    document.addEventListener('change',languageHandler,true)

    return()=>{
      if(raf) cancelAnimationFrame(raf)
      observer.disconnect()
      document.removeEventListener('change',languageHandler,true)
    }
  },[])

  return null
}
