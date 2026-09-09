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
        .drawer .driver-identity small,
        .drawer .drawerProfile strong,
        .drawer .drawerProfile small,
        .drawer .drawer-profile strong,
        .drawer .drawer-profile small {
          display:none !important;
        }
        .drawer .drawerUser,
        .drawer .drawer-user,
        .drawer .driverIdentity,
        .drawer .driver-identity,
        .drawer .drawerProfile,
        .drawer .drawer-profile {
          justify-content:flex-start !important;
        }
      `
      document.head.appendChild(style)
    }

    const hideIdentityText=(drawer:HTMLElement)=>{
      const candidates=Array.from(drawer.querySelectorAll<HTMLElement>('strong,small,p,span,div'))
      candidates.forEach(el=>{
        if(el.closest('.driver-final-menu-root')) return
        const text=(el.textContent||'').trim()
        const lower=text.toLowerCase()
        const looksLikeEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)
        const isDriverTitle=lower==='espace chauffeur'||lower==='espas chofè'
        if(isDriverTitle||looksLikeEmail){
          el.style.display='none'
          return
        }
        if(lower==='jouvens') el.style.display='none'
      })

      const topBlocks=Array.from(drawer.children).slice(0,4) as HTMLElement[]
      topBlocks.forEach(block=>{
        if(block.classList.contains('driver-final-menu-root')) return
        const email=Array.from(block.querySelectorAll<HTMLElement>('small,p,span,strong,div')).find(el=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((el.textContent||'').trim()))
        if(email){
          block.querySelectorAll<HTMLElement>('strong,small,p').forEach(el=>el.style.display='none')
        }
      })
    }

    const apply=()=>{
      const drawer=document.querySelector<HTMLElement>('.drawer')
      if(!drawer) return
      hideIdentityText(drawer)
    }

    apply()
    const observer=new MutationObserver(apply)
    observer.observe(document.body,{childList:true,subtree:true,characterData:true})
    return()=>observer.disconnect()
  },[])

  return null
}
