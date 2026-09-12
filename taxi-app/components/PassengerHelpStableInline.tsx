'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function PassengerHelpStableInline(){
  const [target,setTarget]=useState<HTMLElement|null>(null)
  const [open,setOpen]=useState(false)

  useEffect(()=>{
    const onClick=(event:MouseEvent)=>{
      const button=(event.target as HTMLElement|null)?.closest<HTMLButtonElement>('.shell .nav-drawer .drawer-nav > button')
      if(!button)return
      const text=(button.textContent||'').toLowerCase()
      if(!text.includes('aide')&&!text.includes('èd')&&!text.includes('ed'))return

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      let mount=button.nextElementSibling as HTMLElement|null
      if(!mount||!mount.classList.contains('passenger-help-inline-target')){
        mount=document.createElement('div')
        mount.className='passenger-help-inline-target'
        button.insertAdjacentElement('afterend',mount)
      }
      setTarget(mount)
      setOpen(v=>!v)
    }

    document.addEventListener('click',onClick,true)
    return()=>document.removeEventListener('click',onClick,true)
  },[])

  if(!target||!open||!document.contains(target))return null
  const ht=localStorage.getItem('taxi-language')==='ht'

  const items=ht ? [
    ['🚕','Pwoblèm ak yon trajè','Rapòte yon pwoblèm sou yon trajè oswa yon chofè.'],
    ['💳','Peman','Jwenn èd pou MonCash, NatCash oswa yon peman.'],
    ['👤','Kont ak pwofil','Jwenn èd pou kont, telefòn, imel oswa pwofil.'],
    ['🛡️','Sekirite','Rapòte yon pwoblèm sekirite oswa yon sitiyasyon ijan.'],
  ] : [
    ['🚕','Problème avec un trajet','Signalez un problème concernant un trajet ou un chauffeur.'],
    ['💳','Paiement','Obtenez de l’aide pour MonCash, NatCash ou un paiement.'],
    ['👤','Compte et profil','Aide concernant votre compte, téléphone, e-mail ou profil.'],
    ['🛡️','Sécurité','Signalez un problème de sécurité ou une situation urgente.'],
  ]

  return createPortal(
    <section className="phs-wrap">
      <style>{`
        .phs-wrap{margin:6px 0 10px;padding:12px;border:1px solid #dfe8e4;border-radius:17px;background:#f8faf9}
        .phs-head{display:flex;align-items:center;gap:9px;margin-bottom:10px}.phs-head>span{width:34px;height:34px;border-radius:11px;background:#eef5f3;display:grid;place-items:center;font-size:17px}
        .phs-head div{flex:1}.phs-head strong{display:block;font-size:13px;color:#10243a}.phs-head small{display:block;margin-top:2px;font-size:9px;color:#7b8984}.phs-close{border:0;border-radius:10px;background:#edf5f2;padding:7px 9px;font-size:9px;font-weight:900;color:#0f705a}
        .phs-list{display:grid;gap:7px}.phs-item{width:100%;border:1px solid #e0e8e5;border-radius:13px;background:#fff;padding:10px;display:grid;grid-template-columns:34px 1fr 14px;align-items:center;gap:8px;text-align:left;color:#10243a}
        .phs-item>span:first-child{font-size:17px}.phs-item b{display:block;font-size:11px}.phs-item small{display:block;margin-top:2px;font-size:9px;line-height:1.25;color:#7b8984}.phs-item>span:last-child{font-size:18px;color:#9aaba5}
      `}</style>
      <div className="phs-head">
        <span>❓</span>
        <div><strong>{ht?'Èd':'Aide'}</strong><small>{ht?'Kijan nou ka ede w?':'Comment pouvons-nous vous aider ?'}</small></div>
        <button type="button" className="phs-close" onClick={()=>setOpen(false)}>{ht?'Fèmen':'Fermer'}</button>
      </div>
      <div className="phs-list">
        {items.map(([icon,title,desc])=><button type="button" className="phs-item" key={title}><span>{icon}</span><span><b>{title}</b><small>{desc}</small></span><span>›</span></button>)}
      </div>
    </section>,target
  )
}
