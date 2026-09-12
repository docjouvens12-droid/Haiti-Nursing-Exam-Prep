'use client'

import { useEffect } from 'react'

export default function DriverCleanMenuOrder(){
  useEffect(()=>{
    if(!window.location.pathname.startsWith('/driver/dashboard-v2')) return

    const apply=()=>{
      const list=document.querySelector<HTMLElement>('.dcm-list')
      if(!list) return
      const rows=Array.from(list.querySelectorAll<HTMLButtonElement>(':scope > .dcm-row'))
      const appRow=rows.find(row=>row.textContent?.includes('Demande devenir chauffeur') || row.textContent?.includes('Demand devni chofè'))
      const vehicleRow=rows.find(row=>row.textContent?.includes('Véhicule') || row.textContent?.includes('Veyikil'))
      if(!appRow || !vehicleRow) return

      const appPanel=appRow.nextElementSibling instanceof HTMLElement && appRow.nextElementSibling.classList.contains('dcm-panel')
        ? appRow.nextElementSibling as HTMLElement
        : null
      const vehiclePanel=vehicleRow.nextElementSibling instanceof HTMLElement && vehicleRow.nextElementSibling.classList.contains('dcm-panel')
        ? vehicleRow.nextElementSibling as HTMLElement
        : null

      const anchor=vehiclePanel || vehicleRow
      if(anchor.nextElementSibling!==appRow){
        anchor.insertAdjacentElement('afterend',appRow)
        if(appPanel) appRow.insertAdjacentElement('afterend',appPanel)
      }
    }

    apply()
    const observer=new MutationObserver(apply)
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>observer.disconnect()
  },[])

  return null
}
