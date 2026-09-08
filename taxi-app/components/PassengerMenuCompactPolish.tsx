'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PassengerMenuCompactPolish() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/passenger/dashboard') return

    const id = 'passenger-menu-compact-polish'
    document.getElementById(id)?.remove()
    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      .nav-drawer{
        width:min(58vw,238px)!important;
        max-height:calc(100dvh - 12px)!important;
        padding:10px 10px 12px!important;
        border-bottom-right-radius:20px!important;
        font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
      }
      .nav-drawer .drawer-head{padding:0 0 4px!important;margin:0 0 2px!important;min-height:34px!important}
      .nav-drawer .drawer-head>button{width:32px!important;height:32px!important;font-size:19px!important}
      .nav-drawer .drawer-user{margin:0 0 4px!important;padding:2px 0!important;min-height:42px!important}
      .nav-drawer .drawer-avatar{width:40px!important;height:40px!important;font-size:14px!important;font-weight:800!important}
      .nav-drawer .drawer-nav{gap:0!important}
      .nav-drawer .drawer-nav>button{
        min-height:38px!important;
        padding:7px 3px!important;
        border-radius:9px!important;
        font-size:12px!important;
        font-weight:750!important;
        line-height:1.15!important;
      }
      .nav-drawer .drawer-nav>button span{font-size:15px!important}
      .nav-drawer .drawer-nav>button b{font-size:14px!important;font-weight:750!important}
      .passenger-profile-details,.passenger-payment-details{padding:2px 5px 7px 30px!important}
      .passenger-profile-details p{margin:5px 0!important;font-size:11px!important;line-height:1.2!important}
      .passenger-profile-details span,.passenger-profile-details b{font-size:11px!important;font-weight:700!important}
      .passenger-pay-provider{margin:6px 0!important;padding:8px!important;border-radius:11px!important}
      .passenger-pay-head strong{font-size:12px!important;font-weight:750!important}
      .passenger-pay-form{gap:6px!important;margin-top:7px!important}
      .passenger-pay-form label{font-size:11px!important;font-weight:700!important}
      .passenger-pay-form input{padding:8px 9px!important;font-size:13px!important}
      .passenger-pay-note,.passenger-pay-status{font-size:10px!important}
      .passenger-pay-save{padding:8px 9px!important;font-size:11px!important}
      .nav-drawer .drawer-language{padding:7px 3px!important;margin:0!important}
      .nav-drawer .drawer-language small{font-size:10px!important;font-weight:700!important;margin-bottom:2px!important}
      .nav-drawer .drawer-language .language-trigger{padding:6px 7px!important;font-size:11px!important;font-weight:750!important}
      .nav-drawer .drawer-logout{min-height:38px!important;margin-top:5px!important;padding:8px 10px!important;font-size:12px!important;font-weight:750!important}
    `
    document.head.appendChild(style)
    return () => document.getElementById(id)?.remove()
  }, [pathname])

  return null
}
