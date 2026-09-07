'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PassengerMenuPolish() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/') return
    const styleId = 'passenger-menu-iphone-polish'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .nav-drawer{box-sizing:border-box;overflow-x:hidden}
      .nav-drawer .drawer-user{border:1px solid #e3ece8;box-shadow:0 6px 18px rgba(16,32,51,.05)}
      .nav-drawer .drawer-nav>button{min-height:46px;transition:background .15s ease,transform .15s ease}
      .nav-drawer .drawer-nav>button:active{transform:scale(.99)}
      .nav-drawer .drawer-language{border-radius:14px;background:#f7f9fa;margin:4px 0;padding:10px}
      .nav-drawer .drawer-logout{min-height:46px;margin-top:auto;border:1px solid #f0dada}
      @media(max-width:600px){
        .nav-drawer{width:min(88vw,340px);padding:14px 12px calc(14px + env(safe-area-inset-bottom));}
        .nav-drawer .drawer-head{padding:0 1px 12px;margin-bottom:10px}
        .nav-drawer .drawer-brand{gap:8px;min-width:0}
        .nav-drawer .drawer-brand .brand-mark{width:36px;height:36px;border-radius:11px;font-size:16px;flex:0 0 auto}
        .nav-drawer .drawer-brand>div{min-width:0}
        .nav-drawer .drawer-brand strong{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .nav-drawer .drawer-brand small{font-size:9px}
        .nav-drawer .drawer-head>button{width:36px;height:36px;border-radius:11px;font-size:21px;flex:0 0 auto}
        .nav-drawer .drawer-user{margin:4px 0 12px;padding:11px;border-radius:15px;gap:10px}
        .nav-drawer .drawer-avatar{width:46px;height:46px;font-size:17px}
        .nav-drawer .drawer-user>div:last-child{min-width:0;flex:1}
        .nav-drawer .drawer-user strong{font-size:13px;max-width:100%}
        .nav-drawer .drawer-user small{font-size:10px;max-width:100%}
        .nav-drawer .drawer-nav{gap:4px}
        .nav-drawer .drawer-nav>button{grid-template-columns:28px minmax(0,1fr) 16px;min-height:44px;padding:10px 9px;border-radius:12px;font-size:12px}
        .nav-drawer .drawer-nav>button span{font-size:16px}
        .nav-drawer .drawer-nav>button b{font-size:15px}
        .nav-drawer .drawer-language{grid-template-columns:28px minmax(0,1fr);padding:9px;margin:3px 0}
        .nav-drawer .drawer-language>span{font-size:16px}
        .nav-drawer .drawer-language small{font-size:9px;margin-bottom:4px}
        .nav-drawer .drawer-language .language-trigger{width:100%;text-align:left;box-shadow:none;padding:8px 9px;font-size:10px}
        .nav-drawer .drawer-language .language-options{min-width:145px}
        .nav-drawer .drawer-logout{padding:11px 12px;border-radius:12px;font-size:12px;margin-top:10px}
      }
    `
    document.head.appendChild(style)
    return () => document.getElementById(styleId)?.remove()
  }, [pathname])

  return null
}
