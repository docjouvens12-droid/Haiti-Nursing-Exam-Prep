'use client'

import { useEffect } from 'react'

export default function LoginRoleLabelFix(){
  useEffect(()=>{
    const fix=()=>{
      document.querySelectorAll('.ps-page p.muted').forEach((node)=>{
        const text=(node.textContent||'').trim()
        if(text.startsWith('Ansenyan:')){
          node.textContent='Ansenyan oswa Sekretè: itilize ID aksè oswa nimewo badge lekòl la. Direksyon: ou ka itilize adresse e-mail ou.'
        }else if(text.startsWith('Enseignant :')){
          node.textContent='Enseignant ou Secrétariat : utilisez votre identifiant d’accès ou numéro de badge. Direction : vous pouvez utiliser votre adresse e-mail.'
        }
      })
    }
    fix()
    const observer=new MutationObserver(fix)
    observer.observe(document.body,{subtree:true,childList:true,characterData:true})
    return()=>observer.disconnect()
  },[])
  return null
}
