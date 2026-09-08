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
        height:auto!important;
        min-height:0!important;
        max-height:calc(100dvh - 12px)!important;
        padding:8px 10px 10px!important;
        border-bottom-right-radius:20px!important;
        font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
      }
      .nav-drawer .drawer-head{padding:0!important;margin:0 0 1px!important;min-height:32px!important}
      .nav-drawer .drawer-head>button{width:30px!important;height:30px!important;font-size:18px!important}
      .nav-drawer .drawer-user{margin:0 0 2px!important;padding:1px 0!important;min-height:38px!important}
      .nav-drawer .drawer-avatar{width:38px!important;height:38px!important;font-size:14px!important;font-weight:800!important}
      .nav-drawer .drawer-nav{gap:0!important;margin:0!important;padding:0!important}
      .nav-drawer .drawer-nav>button{
        min-height:36px!important;
        height:auto!important;
        margin:0!important;
        padding:6px 3px!important;
        border-radius:9px!important;
        font-size:12px!important;
        font-weight:750!important;
        line-height:1.1!important;
      }
      .nav-drawer .drawer-nav>button[data-passenger-rides-ready="true"],
      .nav-drawer .drawer-nav>button[data-passenger-help-ready="true"]{
        min-height:34px!important;
        margin:0!important;
        padding:5px 3px!important;
      }
      .nav-drawer .drawer-nav>button span{font-size:15px!important}
      .nav-drawer .drawer-nav>button b{font-size:14px!important;font-weight:750!important}
      .passenger-profile-details,.passenger-payment-details{padding:2px 5px 6px 30px!important}
      .passenger-profile-details p{margin:5px 0!important;font-size:11px!important;line-height:1.2!important}
      .passenger-profile-details span,.passenger-profile-details b{font-size:11px!important;font-weight:700!important}
      .passenger-pay-provider{margin:5px 0!important;padding:8px!important;border-radius:11px!important}
      .passenger-pay-head strong{font-size:12px!important;font-weight:750!important}
      .passenger-pay-form{gap:5px!important;margin-top:6px!important}
      .passenger-pay-form label{font-size:11px!important;font-weight:700!important}
      .passenger-pay-form input{padding:8px 9px!important;font-size:13px!important}
      .passenger-pay-note,.passenger-pay-status{font-size:10px!important}
      .passenger-pay-save{padding:8px 9px!important;font-size:11px!important}
      .passenger-rides-details,.passenger-help-details{
        margin:0!important;
        padding:1px 3px 5px 28px!important;
        border-bottom:1px solid #e7ecef!important;
      }
      .passenger-rides-details.open{gap:4px!important}
      .passenger-help-details.open{gap:4px!important}
      .passenger-rides-loading,.passenger-rides-empty{padding:4px 2px!important;margin:0!important}
      .passenger-ride-card{padding:7px!important;margin:0!important;border-radius:9px!important}
      .passenger-ride-top{margin-bottom:3px!important}
      .passenger-ride-route{margin:1px 0!important}
      .passenger-ride-price{margin-top:3px!important}
      .passenger-help-item{padding:7px 7px!important;margin:0!important;border-radius:9px!important;min-height:34px!important}
      .passenger-help-answer{margin:0!important;padding:6px 8px!important}
      .passenger-help-contact{padding:7px 8px!important;margin:0!important}
      .nav-drawer .drawer-language{padding:6px 3px!important;margin:0!important}
      .nav-drawer .drawer-language small{font-size:10px!important;font-weight:700!important;margin-bottom:2px!important}
      .nav-drawer .drawer-language .language-trigger{padding:6px 7px!important;font-size:11px!important;font-weight:750!important}
      .nav-drawer .drawer-logout{min-height:36px!important;margin-top:3px!important;padding:7px 10px!important;font-size:12px!important;font-weight:750!important}
    `
    document.head.appendChild(style)
    return () => document.getElementById(id)?.remove()
  }, [pathname])

  return null
}
