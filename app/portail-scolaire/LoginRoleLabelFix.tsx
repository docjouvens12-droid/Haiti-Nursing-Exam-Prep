'use client'

import { useEffect } from 'react'

export default function LoginRoleLabelFix(){
  useEffect(()=>{
    let applying=false

    const apply=()=>{
      if(applying)return
      applying=true
      try{
        const page=document.querySelector('.ps-page')
        if(!page)return
        const loginTitle=Array.from(page.querySelectorAll('h2')).find(x=>['Konekte','Connexion'].includes((x.textContent||'').trim()))
        if(!loginTitle)return
        const card=loginTitle.closest('.card') as HTMLElement|null
        if(!card)return

        const isFr=(loginTitle.textContent||'').trim()==='Connexion'
        const muted=card.querySelector('p.muted') as HTMLElement|null
        const helper=isFr
          ? 'Choisissez votre profil. Direction utilise son adresse e-mail ; Enseignant, Secrétariat et Élève utilisent leur identifiant d’accès.'
          : 'Chwazi wòl ou. Direksyon itilize adrès e-mail li; Ansenyan, Sekretè ak Elèv itilize ID aksè yo.'
        if(muted && muted.textContent!==helper) muted.textContent=helper

        let wrap=card.querySelector('[data-school-role-selector]') as HTMLElement|null
        if(!wrap){
          wrap=document.createElement('div')
          wrap.setAttribute('data-school-role-selector','true')
          wrap.setAttribute('data-selected-role','direction')
          wrap.style.display='grid'
          wrap.style.gridTemplateColumns='repeat(2,1fr)'
          wrap.style.gap='8px'
          wrap.style.margin='14px 0'
          muted?.insertAdjacentElement('afterend',wrap)
        }

        const roles=isFr
          ? [['direction','Direction'],['teacher','Enseignant'],['secretary','Secrétariat'],['student','Élève']]
          : [['direction','Direksyon'],['teacher','Ansenyan'],['secretary','Sekretè'],['student','Elèv']]
        const validRoles=roles.map(([value])=>value)
        let selected=wrap.getAttribute('data-selected-role')||'direction'
        if(!validRoles.includes(selected)){
          selected='direction'
          wrap.setAttribute('data-selected-role',selected)
        }

        if(wrap.children.length!==4){
          wrap.replaceChildren()
          roles.forEach(([value])=>{
            const b=document.createElement('button')
            b.type='button'
            b.dataset.role=value
            b.style.border='1px solid #cbd8e6'
            b.style.borderRadius='11px'
            b.style.padding='11px 8px'
            b.style.fontWeight='800'
            b.addEventListener('click',()=>{
              wrap?.setAttribute('data-selected-role',value)
              apply()
            })
            wrap?.appendChild(b)
          })
        }

        Array.from(wrap.querySelectorAll('button')).forEach((node,index)=>{
          const b=node as HTMLButtonElement
          const [value,label]=roles[index]
          if(b.textContent!==label)b.textContent=label
          b.dataset.role=value
          const active=value===selected
          b.style.background=active?'#0f4c81':'#fff'
          b.style.color=active?'#fff':'#14213d'
        })

        const firstLabel=card.querySelector('label') as HTMLElement|null
        if(firstLabel){
          const names:any=isFr
            ? {direction:'Adresse e-mail de la Direction',teacher:'Identifiant Enseignant',secretary:'Identifiant Secrétariat',student:'Identifiant Élève'}
            : {direction:'Adrès e-mail Direksyon',teacher:'ID aksè Ansenyan',secretary:'ID aksè Sekretè',student:'ID aksè Elèv'}
          const wanted=names[selected]
          if(firstLabel.textContent!==wanted)firstLabel.textContent=wanted
        }
      } finally {
        applying=false
      }
    }

    apply()
    const observer=new MutationObserver(()=>requestAnimationFrame(apply))
    observer.observe(document.body,{subtree:true,childList:true,characterData:true})
    return()=>observer.disconnect()
  },[])
  return null
}
