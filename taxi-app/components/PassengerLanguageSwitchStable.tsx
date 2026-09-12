'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Lang = 'fr' | 'ht'

export default function PassengerLanguageSwitchStable(){
  const [target,setTarget]=useState<HTMLElement|null>(null)
  const [lang,setLang]=useState<Lang>('fr')

  useEffect(()=>{
    const sync=()=>{
      const el=document.querySelector<HTMLElement>('.shell .nav-drawer .drawer-language')
      if(!el){setTarget(null);return}
      el.classList.add('passenger-language-switch-host')
      setLang(localStorage.getItem('taxi-language')==='ht'?'ht':'fr')
      setTarget(el)
    }
    sync()
    const onClick=()=>window.setTimeout(sync,20)
    document.addEventListener('click',onClick,true)
    return()=>document.removeEventListener('click',onClick,true)
  },[])

  function toggle(){
    const next:Lang=lang==='fr'?'ht':'fr'
    localStorage.setItem('taxi-language',next)
    setLang(next)
    window.location.reload()
  }

  if(!target||!document.contains(target))return null
  const ht=lang==='ht'

  return createPortal(<>
    <style>{`
      .passenger-language-switch-host>span,.passenger-language-switch-host>div{display:none!important}
      .pls-row{width:100%;display:flex;align-items:center;gap:10px}
      .pls-icon{width:32px;height:32px;border-radius:10px;background:#eef5f3;display:grid;place-items:center;font-size:16px;flex:0 0 auto}
      .pls-copy{min-width:0;flex:1}.pls-copy b{display:block;font-size:13px;color:#10243a;line-height:1.15}.pls-copy small{display:block;margin-top:2px;font-size:9px;color:#7b8984}
      .pls-switch{width:46px;height:27px;border:0;border-radius:999px;background:#dbe5e1;padding:3px;display:flex;align-items:center;justify-content:flex-start;transition:.18s ease;flex:0 0 auto}
      .pls-switch.on{background:#0f8a68;justify-content:flex-end}.pls-switch i{display:block;width:21px;height:21px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(15,36,58,.18)}
    `}</style>
    <div className="pls-row">
      <span className="pls-icon">🌐</span>
      <span className="pls-copy"><b>{ht?'Lang':'Langue'}</b><small>{ht?'Kreyòl':'Français'}</small></span>
      <button type="button" className={`pls-switch ${ht?'on':''}`} onClick={toggle} aria-label={ht?'Chanje pou Français':'Passer en Kreyòl'}><i /></button>
    </div>
  </>,target)
}
