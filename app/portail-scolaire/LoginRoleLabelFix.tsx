'use client'

import { useEffect } from 'react'

export default function LoginRoleLabelFix(){
  useEffect(()=>{
    const apply=()=>{
      const page=document.querySelector('.ps-page')
      if(!page)return
      const loginTitle=Array.from(page.querySelectorAll('h2')).find(x=>['Konekte','Connexion'].includes((x.textContent||'').trim()))
      if(!loginTitle)return
      const card=loginTitle.closest('.card') as HTMLElement|null
      if(!card)return

      const isFr=(loginTitle.textContent||'').trim()==='Connexion'
      const muted=card.querySelector('p.muted') as HTMLElement|null
      if(muted){
        muted.textContent=isFr
          ? 'Choisissez votre profil, puis utilisez votre identifiant d’accès et votre mot de passe. Direction : utilisez votre adresse e-mail.'
          : 'Chwazi pwofil ou, epi itilize ID aksè ou ak modpas ou. Direksyon: itilize adrès e-mail ou.'
      }

      if(!card.querySelector('[data-school-role-selector]')){
        const wrap=document.createElement('div')
        wrap.setAttribute('data-school-role-selector','true')
        wrap.style.display='grid'
        wrap.style.gridTemplateColumns='repeat(3,1fr)'
        wrap.style.gap='8px'
        wrap.style.margin='14px 0'

        const roles=isFr
          ? [['teacher','Enseignant'],['secretary','Secrétariat'],['student','Élève']]
          : [['teacher','Ansenyan'],['secretary','Sekretè'],['student','Elèv']]

        roles.forEach(([value,label],index)=>{
          const b=document.createElement('button')
          b.type='button'
          b.textContent=label
          b.dataset.role=value
          b.style.border='1px solid #cbd8e6'
          b.style.borderRadius='11px'
          b.style.padding='11px 8px'
          b.style.fontWeight='800'
          b.style.background=index===0?'#0f4c81':'#fff'
          b.style.color=index===0?'#fff':'#14213d'
          b.addEventListener('click',()=>{
            wrap.querySelectorAll('button').forEach(x=>{
              const btn=x as HTMLButtonElement
              btn.style.background='#fff';btn.style.color='#14213d'
            })
            b.style.background='#0f4c81';b.style.color='#fff'
            const labelEl=card.querySelector('label') as HTMLElement|null
            if(labelEl){
              const names:any=isFr
                ? {teacher:'Identifiant Enseignant',secretary:'Identifiant Secrétariat',student:'Identifiant Élève'}
                : {teacher:'ID aksè Ansenyan',secretary:'ID aksè Sekretè',student:'ID aksè Elèv'}
              labelEl.textContent=names[value]
            }
          })
          wrap.appendChild(b)
        })
        muted?.insertAdjacentElement('afterend',wrap)
      }

      const firstLabel=card.querySelector('label') as HTMLElement|null
      if(firstLabel && (firstLabel.textContent||'').includes('E-mail Direksyon')){
        firstLabel.textContent=isFr?'Identifiant d’accès':'ID aksè Ansenyan'
      }
    }

    apply()
    const observer=new MutationObserver(apply)
    observer.observe(document.body,{subtree:true,childList:true,characterData:true})
    return()=>observer.disconnect()
  },[])
  return null
}
