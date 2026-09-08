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
        max-height:calc(100dvh - 8px)!important;
        padding:7px 9px 8px!important;
        border-bottom-right-radius:18px!important;
        font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
      }
      .nav-drawer .drawer-head{padding:0!important;margin:0!important;min-height:30px!important}
      .nav-drawer .drawer-head>button{width:29px!important;height:29px!important;font-size:18px!important}
      .nav-drawer .drawer-user{margin:0!important;padding:0!important;min-height:36px!important}
      .nav-drawer .drawer-avatar{width:36px!important;height:36px!important;font-size:13px!important;font-weight:800!important}
      .nav-drawer .drawer-nav{display:grid!important;gap:0!important;margin:0!important;padding:0!important}
      .nav-drawer .drawer-nav>button{
        width:100%!important;
        min-height:36px!important;
        height:36px!important;
        margin:0!important;
        padding:5px 3px!important;
        border:0!important;
        border-radius:8px!important;
        background:transparent!important;
        color:#243747!important;
        font-family:inherit!important;
        font-size:12px!important;
        font-weight:750!important;
        line-height:1!important;
        box-shadow:none!important;
      }
      .nav-drawer .drawer-nav>button.active{background:#eef7f4!important;color:#243747!important}
      .nav-drawer .drawer-nav>button>*{color:#243747!important;font-family:inherit!important;font-weight:750!important}
      .nav-drawer .drawer-nav>button span{font-size:14px!important;line-height:1!important}
      .nav-drawer .drawer-nav>button b{font-size:12px!important;line-height:1!important;color:#243747!important}
      .nav-drawer .drawer-nav>button b:last-child{font-size:14px!important;font-weight:700!important;color:#243747!important}

      .passenger-profile-details,.passenger-payment-details{
        margin:0!important;
        padding:1px 2px 4px 24px!important;
        border-bottom:1px solid #edf0f2!important;
      }
      .passenger-profile-details p{margin:4px 0!important;font-size:10.5px!important;line-height:1.15!important}
      .passenger-profile-details span,.passenger-profile-details b{font-size:10.5px!important;font-weight:700!important}
      .passenger-pay-provider{margin:4px 0!important;padding:7px!important;border-radius:9px!important}
      .passenger-pay-head strong{font-size:11px!important;font-weight:750!important}
      .passenger-pay-form{gap:4px!important;margin-top:5px!important}
      .passenger-pay-form label{font-size:10.5px!important;font-weight:700!important}
      .passenger-pay-form input{padding:7px 8px!important;font-size:12px!important}
      .passenger-pay-note,.passenger-pay-status{font-size:9.5px!important}
      .passenger-pay-save{padding:7px 8px!important;font-size:10.5px!important}

      .passenger-rides-details,.passenger-help-details{
        display:none!important;
        width:100%!important;
        box-sizing:border-box!important;
        margin:0!important;
        padding:0 0 3px 0!important;
        border:0!important;
        background:transparent!important;
      }
      .passenger-rides-details.open,.passenger-help-details.open{display:grid!important;gap:3px!important}
      .passenger-rides-loading,.passenger-rides-empty{padding:4px 5px!important;margin:0!important;font-size:10px!important}
      .passenger-ride-card{padding:6px!important;margin:0!important;border-radius:8px!important}
      .passenger-ride-top{margin-bottom:2px!important}
      .passenger-ride-route{margin:1px 0!important;font-size:9.5px!important}
      .passenger-ride-price{margin-top:2px!important;font-size:10px!important}
      .passenger-help-item{width:100%!important;min-height:32px!important;margin:0!important;padding:5px 6px!important;border-radius:8px!important;background:#f7f9fa!important;color:#243747!important;font-family:inherit!important;font-size:10.5px!important;font-weight:750!important;line-height:1.1!important}
      .passenger-help-item b{font-size:10.5px!important;font-weight:750!important;color:#243747!important}
      .passenger-help-item span:first-child{font-size:13px!important}
      .passenger-help-item span:last-child{font-size:12px!important}
      .passenger-help-answer{margin:0!important;padding:5px 6px!important;font-size:9.5px!important;line-height:1.3!important}
      .passenger-help-contact{min-height:32px!important;padding:6px!important;margin:0!important;border-radius:8px!important;font-size:10.5px!important;font-weight:750!important}

      .nav-drawer .drawer-language{
        min-height:36px!important;
        margin:0!important;
        padding:4px 3px!important;
        border-top:1px solid #edf0f2!important;
        color:#243747!important;
        font-family:inherit!important;
      }
      .nav-drawer .drawer-language small,
      .nav-drawer .drawer-language>span,
      .nav-drawer .drawer-language b{
        font-size:12px!important;
        font-weight:750!important;
        color:#243747!important;
        line-height:1!important;
      }
      .nav-drawer .drawer-language small{margin:0 0 1px!important}
      .nav-drawer .drawer-language .language-trigger{padding:5px 6px!important;font-size:12px!important;font-weight:750!important;color:#243747!important}
      .passenger-lang-shell{height:32px!important;font-family:inherit!important}
      .passenger-lang-label{font-size:9.5px!important;font-weight:800!important}
      .nav-drawer .drawer-logout{
        width:100%!important;
        min-height:36px!important;
        height:36px!important;
        margin:2px 0 0!important;
        padding:6px 8px!important;
        border-radius:8px!important;
        font-family:inherit!important;
        font-size:12px!important;
        font-weight:750!important;
        line-height:1!important;
        color:#243747!important;
        background:transparent!important;
        border:0!important;
        box-shadow:none!important;
      }
    `
    document.head.appendChild(style)
    return () => document.getElementById(id)?.remove()
  }, [pathname])

  return null
}
