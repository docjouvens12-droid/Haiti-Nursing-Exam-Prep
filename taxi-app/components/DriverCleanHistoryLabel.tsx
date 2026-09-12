'use client'

import { useEffect } from 'react'

export default function DriverCleanHistoryLabel(){
  useEffect(()=>{
    if(!window.location.pathname.startsWith('/driver/dashboard-v2')) return

    const apply=()=>{
      const ht=localStorage.getItem('taxi-language')==='ht'
      const rows=Array.from(document.querySelectorAll<HTMLButtonElement>('.dcm-row'))
      const row=rows.find(el=>{
        const t=(el.textContent||'').toLowerCase()
        return t.includes('historique')||t.includes('istwa trajè')
      })
      const label=row?.querySelector<HTMLElement>('b')
      if(label) label.textContent=ht?'Istwa trajè yo':'Historique des trajets'
    }

    apply()
    const timer=window.setInterval(apply,250)
    return()=>window.clearInterval(timer)
  },[])

  return null
}
