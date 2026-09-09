'use client'

import { useEffect } from 'react'

export default function DriverDrawerHeaderPolish(){
  useEffect(()=>{
    if(window.location.pathname!=='/driver/dashboard') return

    const styleId='driver-drawer-header-polish'
    if(!document.getElementById(styleId)){
      const style=document.createElement('style')
      style.id=styleId
      style.textContent=`
        .drawer .drawerTitle,
        .drawer .drawer-title,
        .drawer .drawerHeaderTitle,
        .drawer .drawer-header-title,
        .drawer .drawerHeadTitle,
        .drawer .drawer-head-title,
        .drawer .drawerBrand,
        .drawer .drawer-brand,
        .drawer .driverMenuTitle,
        .drawer .driver-menu-title {
          display:none !important;
        }
        .drawer .drawerUser strong,
        .drawer .drawerUser small,
        .drawer .drawer-user strong,
        .drawer .drawer-user small,
        .drawer .driverIdentity strong,
        .drawer .driverIdentity small,
        .drawer .driver-identity strong,
        .drawer .driver-identity small {
          display:none !important;
        }
        .drawer .drawerUser,
        .drawer .drawer-user {
          justify-content:flex-start !important;
        }
      `
      document.head.appendChild(style)
    }

    const apply=()=>{
      const drawer=document.querySelector<HTMLElement>('.drawer')
      if(!drawer) return

      const all=Array.from(drawer.querySelectorAll<HTMLElement>('h1,h2,h3,strong,small,p,span,div'))
      all.forEach(el=>{
        const text=(el.textContent||'').trim().toLowerCase()
        if(text==='espace chauffeur'||text==='espas chofè'){
          el.style.display='none'
        }
      })

      const userBlocks=Array.from(drawer.querySelectorAll<HTMLElement>('.drawerUser,.drawer-user,.driverIdentity,.driver-identity'))
      userBlocks.forEach(block=>{
        block.querySelectorAll<HTMLElement>('strong,small').forEach(el=>el.style.display='none')
      })
    }

    apply()
    const observer=new MutationObserver(apply)
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>observer.disconnect()
  },[])

  return null
}
