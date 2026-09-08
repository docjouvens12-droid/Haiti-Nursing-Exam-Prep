'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PassengerMenuPolish() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/' && pathname !== '/passenger/dashboard') return
    const styleId = 'passenger-menu-iphone-polish'
    document.getElementById(styleId)?.remove()

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .nav-drawer{box-sizing:border-box;overflow-x:hidden;background:#fff}
      .nav-drawer .drawer-head{justify-content:flex-end}
      .nav-drawer .drawer-brand{display:none!important}
      .nav-drawer .drawer-user{border:0;box-shadow:none;background:transparent;justify-content:flex-start;padding-left:2px!important}
      .nav-drawer .drawer-user>div:last-child{display:none!important}
      .nav-drawer .drawer-avatar{margin:0}
      .nav-drawer .drawer-nav>button{min-height:46px;transition:background .15s ease,transform .15s ease}
      .nav-drawer .drawer-nav>button:active{transform:scale(.99)}
      .nav-drawer .drawer-language{border-top:1px solid #e7ecef;border-radius:0;background:#fff;margin:2px 0;padding:12px 2px}
      .nav-drawer .drawer-logout{min-height:46px;margin-top:12px;border:0;background:#fff0f0;color:#9a3030}
      @media(max-width:600px){
        .nav-drawer{width:min(62vw,255px)!important;height:auto!important;min-height:0!important;max-height:calc(100dvh - 18px)!important;overflow-y:auto!important;border-bottom-right-radius:24px!important;padding:16px 14px 18px!important;box-shadow:20px 0 60px rgba(0,0,0,.20)}
        .nav-drawer .drawer-head{padding:0 1px 8px;margin-bottom:2px}
        .nav-drawer .drawer-head>button{width:36px;height:36px;border-radius:11px;font-size:21px;flex:0 0 auto}
        .nav-drawer .drawer-user{margin:0 0 10px;padding:4px 2px!important}
        .nav-drawer .drawer-avatar{width:54px;height:54px;font-size:20px}
        .nav-drawer .drawer-nav{gap:2px}
        .nav-drawer .drawer-nav>button{grid-template-columns:25px minmax(0,1fr) 14px;min-height:42px;padding:9px 4px;border-radius:10px;font-size:12px;background:transparent}
        .nav-drawer .drawer-nav>button.active{background:#eaf6f2;color:#0f6f59}
        .nav-drawer .drawer-nav>button span{font-size:16px}
        .nav-drawer .drawer-nav>button b{font-size:15px}
        .nav-drawer .drawer-language{grid-template-columns:25px minmax(0,1fr);padding:11px 4px;margin:2px 0}
        .nav-drawer .drawer-language>span{font-size:16px}
        .nav-drawer .drawer-language small{font-size:9px;margin-bottom:4px}
        .nav-drawer .drawer-language .language-trigger{width:100%;text-align:left;box-shadow:none;padding:7px 8px;font-size:10px}
        .nav-drawer .drawer-language .language-options{min-width:145px}
        .nav-drawer .drawer-logout{padding:11px 12px;border-radius:12px;font-size:12px;margin-top:10px;width:100%}
      }
    `
    document.head.appendChild(style)

    const cleanPassengerMenu = () => {
      if (pathname !== '/passenger/dashboard') return
      const drawer = document.querySelector<HTMLElement>('.nav-drawer')
      if (!drawer) return
      drawer.querySelectorAll<HTMLButtonElement>('.drawer-nav > button').forEach((button) => {
        const text = (button.textContent || '').toLowerCase()
        if (text.includes('devenir chauffeur') || text.includes('vin chofè')) button.remove()
      })
    }

    cleanPassengerMenu()
    const observer = new MutationObserver(cleanPassengerMenu)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      document.getElementById(styleId)?.remove()
    }
  }, [pathname])

  return null
}
