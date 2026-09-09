'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function DriverMenuShell(){
  const [open,setOpen]=useState(false)

  useEffect(()=>{
    if(window.location.pathname!=='/driver/dashboard') return

    const bind=()=>{
      const button=document.querySelector<HTMLButtonElement>('button.menuButton')
      if(!button || button.dataset.driverMenuShellBound==='true') return
      button.dataset.driverMenuShellBound='true'
      const handler=(e:Event)=>{
        e.preventDefault()
        e.stopPropagation()
        setOpen(true)
      }
      button.addEventListener('click',handler,true)
      button.addEventListener('touchend',handler,true)
    }

    bind()
    const observer=new MutationObserver(bind)
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>observer.disconnect()
  },[])

  useEffect(()=>{
    if(!open) return
    const old=document.body.style.overflow
    document.body.style.overflow='hidden'
    return()=>{document.body.style.overflow=old}
  },[open])

  if(!open) return null

  return createPortal(
    <div
      className="driver-menu-shell-overlay"
      onClick={()=>setOpen(false)}
      style={{position:'fixed',inset:0,zIndex:10000,background:'rgba(15,30,43,.45)'}}
    >
      <aside
        className="drawer driver-menu-shell-drawer"
        onClick={e=>e.stopPropagation()}
        style={{position:'absolute',left:0,top:0,bottom:0,width:'min(88vw,360px)',background:'#fff',padding:'18px',overflowY:'auto',WebkitOverflowScrolling:'touch'}}
      >
        <div className="drawerTop" style={{display:'flex',alignItems:'center',minHeight:44}}>
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={()=>setOpen(false)}
            style={{width:42,height:42,border:0,borderRadius:12,background:'#eef2f4',fontSize:25,lineHeight:1,cursor:'pointer'}}
          >×</button>
        </div>
        <div className="driver-menu-shell-anchor" />
      </aside>
    </div>,
    document.body,
  )
}
