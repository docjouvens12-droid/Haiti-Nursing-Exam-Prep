'use client'

import { useEffect } from 'react'

export default function PassengerDashboardHardV2(){
  useEffect(()=>{
    const apply=()=>{
      const booking=document.querySelector<HTMLElement>('.booking-sheet')
      if(!booking) return

      document.body.classList.add('passenger-hard-v2')

      const greeting=document.querySelector<HTMLElement>('.greeting-row')
      if(greeting) greeting.style.setProperty('display','none','important')

      document.querySelectorAll<HTMLElement>('.ride-option').forEach((el)=>{
        const text=(el.textContent||'').toLowerCase()
        if(text.includes('comfort')||text.includes('plus d’espace')||text.includes("plus d'espace")||text.includes('plis espas')){
          el.style.setProperty('display','none','important')
        }
      })

      const brand=document.querySelector<HTMLElement>('.brand-chip strong')
      if(brand) brand.textContent='Taxi Haiti'
      const mark=document.querySelector<HTMLElement>('.brand-chip .brand-mark')
      if(mark) mark.textContent='🚕'

      const payment=document.querySelector<HTMLElement>('.payment-row strong')
      if(payment){
        const method=localStorage.getItem('taxi-payment-method')
        payment.textContent=method==='moncash'?'MonCash':method==='natcash'?'NatCash':'MonCash / NatCash'
      }
    }

    apply()
    const observer=new MutationObserver(apply)
    observer.observe(document.body,{childList:true,subtree:true,characterData:true})
    const timer=window.setInterval(apply,300)

    return()=>{
      observer.disconnect()
      window.clearInterval(timer)
      document.body.classList.remove('passenger-hard-v2')
    }
  },[])

  return <style>{`
    body.passenger-hard-v2 .greeting-row{display:none!important}
    body.passenger-hard-v2 .map-panel.real-map-panel{height:48dvh!important;min-height:350px!important}
    body.passenger-hard-v2 .booking-sheet{margin-top:-54px!important;padding-top:14px!important;border-radius:28px!important}
    body.passenger-hard-v2 .ride-list{grid-template-columns:1fr 1fr!important;gap:10px!important}
    body.passenger-hard-v2 .ride-option{min-height:92px!important}
    body.passenger-hard-v2 .payment-row{background:#f5faf8!important;border-color:#d9e9e3!important}
    body.passenger-hard-v2 .request-button{min-height:58px!important;border-radius:18px!important;background:#0F705A!important}
    body.passenger-hard-v2 .brand-chip{min-width:132px!important;justify-content:center!important}
    @media(max-width:420px){
      body.passenger-hard-v2 .map-panel.real-map-panel{height:46dvh!important;min-height:335px!important}
      body.passenger-hard-v2 .booking-sheet{margin-top:-48px!important}
    }
  `}</style>
}
