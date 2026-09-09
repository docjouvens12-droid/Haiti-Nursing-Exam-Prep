'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function DriverMenuTapRecovery(){
  const [rect,setRect]=useState<DOMRect|null>(null)
  const [visible,setVisible]=useState(false)

  useEffect(()=>{
    if(window.location.pathname!=='/driver/dashboard') return

    const sync=()=>{
      const button=document.querySelector<HTMLButtonElement>('button.menuButton')
      if(!button){setVisible(false);return}
      const r=button.getBoundingClientRect()
      setRect(r)
      const drawer=document.querySelector<HTMLElement>('.drawer')
      const drawerVisible=!!drawer && drawer.getClientRects().length>0 && getComputedStyle(drawer).visibility!=='hidden' && getComputedStyle(drawer).display!=='none'
      setVisible(!drawerVisible)
    }

    sync()
    const timer=window.setInterval(sync,500)
    window.addEventListener('resize',sync)
    window.addEventListener('orientationchange',sync)
    return()=>{window.clearInterval(timer);window.removeEventListener('resize',sync);window.removeEventListener('orientationchange',sync)}
  },[])

  if(!visible||!rect)return null

  return createPortal(
    <button
      type="button"
      aria-label="Menu"
      onClick={(e)=>{
        e.preventDefault()
        e.stopPropagation()
        const original=document.querySelector<HTMLButtonElement>('button.menuButton')
        original?.click()
        window.setTimeout(()=>setVisible(false),50)
      }}
      style={{
        position:'fixed',left:rect.left-6,top:rect.top-6,width:rect.width+12,height:rect.height+12,
        zIndex:2147483647,background:'transparent',border:0,padding:0,margin:0,cursor:'pointer',touchAction:'manipulation'
      }}
    />,
    document.body,
  )
}
