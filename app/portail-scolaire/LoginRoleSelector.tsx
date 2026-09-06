'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type LoginRole='direction'|'teacher'|'secretary'|'student'

export default function LoginRoleSelector(){
  const [mount,setMount]=useState<HTMLElement|null>(null)
  const [role,setRole]=useState<LoginRole>('direction')
  const [lang,setLang]=useState<'ht'|'fr'>('fr')

  useEffect(()=>{
    let raf=0
    let tries=0
    const findMount=()=>{
      const page=document.querySelector('.ps-page')
      const title=Array.from(page?.querySelectorAll('h2')||[]).find(x=>['Konekte','Connexion'].includes((x.textContent||'').trim()))
      const card=title?.closest('.card') as HTMLElement|null
      if(card){
        setLang((title?.textContent||'').trim()==='Konekte'?'ht':'fr')
        const muted=card.querySelector('p.muted') as HTMLElement|null
        let slot=card.querySelector('[data-school-role-selector]') as HTMLElement|null
        if(!slot){
          slot=document.createElement('div')
          slot.setAttribute('data-school-role-selector','true')
          slot.style.margin='14px 0'
          muted?.insertAdjacentElement('afterend',slot)
        }
        setMount(slot)
        return
      }
      if(tries++<60)raf=requestAnimationFrame(findMount)
    }
    findMount()
    return()=>{if(raf)cancelAnimationFrame(raf)}
  },[])

  useEffect(()=>{
    const onLanguage=(event:Event)=>{
      const select=(event.target as HTMLElement|null)?.closest?.('[data-global-language-menu] select') as HTMLSelectElement|null
      if(select)setLang(select.value==='ht'?'ht':'fr')
    }
    document.addEventListener('change',onLanguage,true)
    return()=>document.removeEventListener('change',onLanguage,true)
  },[])

  useEffect(()=>{
    if(!mount)return
    const card=mount.closest('.card') as HTMLElement|null
    if(!card)return
    const muted=card.querySelector('p.muted') as HTMLElement|null
    if(muted)muted.textContent=lang==='fr'
      ?'Choisissez votre espace, puis utilisez vos informations de connexion.'
      :'Chwazi espas ou, epi itilize enfòmasyon koneksyon ou.'

    const labels=Array.from(card.querySelectorAll('label')).filter(x=>!mount.contains(x))
    const firstLabel=labels[0] as HTMLElement|null
    if(firstLabel){
      const names=lang==='fr'
        ?{direction:'Adresse e-mail de la Direction',teacher:'Identifiant Enseignant',secretary:'Identifiant Secrétariat',student:'Identifiant Élève'}
        :{direction:'Adrès e-mail Direksyon',teacher:'ID aksè Ansenyan',secretary:'ID aksè Sekretè',student:'ID aksè Elèv'}
      firstLabel.textContent=names[role]
    }
  },[mount,role,lang])

  if(!mount)return null
  return createPortal(
    <div>
      <label style={{display:'block',fontWeight:800,marginBottom:7}}>{lang==='fr'?'Choisir votre espace':'Chwazi espas ou'}</label>
      <select
        value={role}
        onChange={e=>setRole(e.target.value as LoginRole)}
        style={{width:'100%',minHeight:48,border:'1px solid #cbd8e6',borderRadius:11,padding:'10px 12px',background:'#fff',color:'#14213d',fontWeight:700}}
      >
        <option value="direction">{lang==='fr'?'Direction':'Direksyon'}</option>
        <option value="teacher">{lang==='fr'?'Enseignant':'Ansenyan'}</option>
        <option value="secretary">{lang==='fr'?'Secrétariat':'Sekretè'}</option>
        <option value="student">{lang==='fr'?'Élève':'Elèv'}</option>
      </select>
    </div>,
    mount
  )
}
