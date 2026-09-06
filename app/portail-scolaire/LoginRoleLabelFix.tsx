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
          ? 'Choisissez votre espace, puis utilisez vos informations de connexion.'
          : 'Chwazi espas ou, epi itilize enfòmasyon koneksyon ou.'
        if(muted && muted.textContent!==helper) muted.textContent=helper

        let wrap=card.querySelector('[data-school-role-selector]') as HTMLElement|null
        if(!wrap){
          wrap=document.createElement('div')
          wrap.setAttribute('data-school-role-selector','true')
          wrap.setAttribute('data-selected-role','direction')
          wrap.style.margin='14px 0'
          muted?.insertAdjacentElement('afterend',wrap)
        }

        const roles=isFr
          ? [['direction','Direction'],['teacher','Enseignant'],['secretary','Secrétariat'],['student','Élève']]
          : [['direction','Direksyon'],['teacher','Ansenyan'],['secretary','Sekretè'],['student','Elèv']]
        const validRoles=roles.map(([value])=>value)
        let selected=wrap.getAttribute('data-selected-role')||'direction'
        if(!validRoles.includes(selected))selected='direction'
        wrap.setAttribute('data-selected-role',selected)

        let label=wrap.querySelector('label') as HTMLLabelElement|null
        let select=wrap.querySelector('select') as HTMLSelectElement|null
        if(!label||!select){
          wrap.replaceChildren()
          label=document.createElement('label')
          label.style.display='block'
          label.style.fontWeight='800'
          label.style.marginBottom='7px'
          select=document.createElement('select')
          select.style.width='100%'
          select.style.minHeight='48px'
          select.style.border='1px solid #cbd8e6'
          select.style.borderRadius='11px'
          select.style.padding='10px 12px'
          select.style.background='#fff'
          select.style.color='#14213d'
          select.style.fontWeight='700'
          select.addEventListener('change',()=>{
            wrap?.setAttribute('data-selected-role',select?.value||'direction')
            apply()
          })
          wrap.append(label,select)
        }

        const labelText=isFr?'Choisir votre espace':'Chwazi espas ou'
        if(label.textContent!==labelText)label.textContent=labelText

        const currentOptions=Array.from(select.options).map(o=>`${o.value}:${o.textContent}`).join('|')
        const wantedOptions=roles.map(([value,text])=>`${value}:${text}`).join('|')
        if(currentOptions!==wantedOptions){
          select.replaceChildren()
          roles.forEach(([value,text])=>{
            const option=document.createElement('option')
            option.value=value
            option.textContent=text
            select?.appendChild(option)
          })
        }
        select.value=selected

        const labels=Array.from(card.querySelectorAll('label'))
        const firstLabel=labels.find(x=>x!==label) as HTMLElement|null
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
