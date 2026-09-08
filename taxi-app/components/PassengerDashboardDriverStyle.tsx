'use client'

import { useEffect } from 'react'

export default function PassengerDashboardDriverStyle() {
  useEffect(() => {
    if (window.location.pathname !== '/passenger/dashboard') return

    const id = 'passenger-dashboard-driver-style'
    document.getElementById(id)?.remove()
    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      body{background:linear-gradient(160deg,#e8f1ff,#eef2f7 45%,#e7edf3)!important}
      .shell{padding:22px!important;align-items:flex-start!important}
      .phone-frame{
        width:min(100%,520px)!important;
        min-height:calc(100vh - 44px)!important;
        border-radius:28px!important;
        box-shadow:0 24px 70px rgba(18,36,61,.15)!important;
        background:#fff!important;
      }
      .map-panel{
        height:38vh!important;
        min-height:300px!important;
        background:linear-gradient(155deg,#dbe9ff 0%,#edf3fb 48%,#e1e9f4 100%)!important;
      }
      .topbar{top:18px!important;left:16px!important;right:16px!important}
      .round-button{
        border-radius:13px!important;
        box-shadow:0 8px 24px rgba(19,39,64,.16)!important;
      }
      .brand-chip{
        display:flex!important;
        align-items:center!important;
        gap:10px!important;
        border-radius:16px!important;
        padding:9px 12px!important;
        background:rgba(255,255,255,.96)!important;
        box-shadow:0 8px 24px rgba(19,39,64,.14)!important;
      }
      .brand-mark{
        width:40px!important;
        height:40px!important;
        min-width:40px!important;
        display:grid!important;
        place-items:center!important;
        background:#1b70eb!important;
        color:#fff!important;
        border-radius:13px!important;
        font-size:15px!important;
        font-weight:900!important;
      }
      .brand-chip strong{
        display:block!important;
        font-size:13px!important;
        line-height:1.15!important;
        color:#102033!important;
        font-weight:900!important;
      }
      .brand-chip small{
        display:block!important;
        margin-top:2px!important;
        font-size:9.5px!important;
        line-height:1.15!important;
        color:#758596!important;
      }
      .booking-sheet{
        margin-top:-24px!important;
        border-radius:26px 26px 0 0!important;
        padding:14px 20px 28px!important;
        min-height:58vh!important;
      }
      .grabber{width:42px!important;background:#d9e1ea!important;margin-bottom:18px!important}
      .eyebrow{color:#1b70eb!important;font-size:10px!important;font-weight:850!important}
      .greeting-row h1{font-size:27px!important;color:#102033!important}
      .online-pill{background:#eaf2ff!important;color:#185fc2!important}
      .route-card{
        border-radius:16px!important;
        border:1px solid #dfe7f0!important;
        background:#fbfcfe!important;
        box-shadow:0 4px 16px rgba(18,36,61,.04)!important;
      }
      .pickup-dot{background:#1b70eb!important;border-color:#d9e8ff!important}
      .section-heading h2{font-size:17px!important;color:#102033!important}
      .ride-option{border-radius:15px!important}
      .ride-option.selected{
        border:2px solid #1b70eb!important;
        background:#f2f7ff!important;
        box-shadow:0 6px 18px rgba(27,112,235,.09)!important;
      }
      .payment-icon{background:#edf4ff!important}
      .payment-row button{color:#1b70eb!important}
      .request-button{
        border-radius:15px!important;
        background:#1b70eb!important;
        box-shadow:0 12px 28px rgba(27,112,235,.25)!important;
        padding:15px 16px!important;
      }
      .request-button:disabled{background:#b9c6d3!important;box-shadow:none!important}
      .searching-card{border-radius:15px!important;background:#102033!important}
      .search-results{border-radius:14px!important}
      .language-switch button.active{color:#1b70eb!important}
      .auth-switch{color:#1b70eb!important}
      .auth-form input:focus{border-color:#1b70eb!important;box-shadow:0 0 0 3px rgba(27,112,235,.10)!important}

      @media(max-width:600px){
        body{background:#fff!important}
        .shell{padding:0!important}
        .phone-frame{
          width:100%!important;
          min-height:100vh!important;
          border-radius:0!important;
          box-shadow:none!important;
        }
        .map-panel{height:39vh!important;min-height:310px!important}
        .booking-sheet{padding:13px 18px 112px!important}
        .brand-chip{padding:8px 10px!important;gap:8px!important}
        .brand-mark{width:36px!important;height:36px!important;min-width:36px!important}
        .brand-chip strong{font-size:12px!important}
        .brand-chip small{font-size:9px!important}
      }
    `
    document.head.appendChild(style)
    return () => document.getElementById(id)?.remove()
  }, [])

  return null
}
