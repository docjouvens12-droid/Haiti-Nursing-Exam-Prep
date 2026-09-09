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

      const routeCard=booking.querySelector<HTMLElement>('.route-card')
      if(routeCard && !booking.querySelector('.passenger-booking-head')){
        const ht=localStorage.getItem('taxi-language')==='ht'
        const head=document.createElement('div')
        head.className='passenger-booking-head'
        head.innerHTML=`<div><small>${ht?'NOUVO TRAJÈ':'NOUVEAU TRAJET'}</small><strong>${ht?'Ki kote ou prale?':'Où allez-vous ?'}</strong><span>${ht?'Chwazi kote pou pran ou ak destinasyon an':'Choisissez le départ et la destination'}</span></div><div class="passenger-booking-head-icon">📍</div>`
        routeCard.insertAdjacentElement('beforebegin',head)
      }

      const routeLines=booking.querySelectorAll<HTMLElement>('.route-card .route-line')
      routeLines.forEach((line,index)=>{
        line.classList.toggle('passenger-pickup-line',index===0)
        line.classList.toggle('passenger-destination-line',index===1)
      })

      document.querySelectorAll<HTMLElement>('.ride-option').forEach((el)=>{
        const text=(el.textContent||'').toLowerCase()
        if(text.includes('comfort')||text.includes('plus d’espace')||text.includes("plus d'espace")||text.includes('plis espas')){
          el.style.setProperty('display','none','important')
        }
      })

      const brand=document.querySelector<HTMLElement>('.brand-chip strong')
      if(brand && brand.textContent!=='Taxi Haiti') brand.textContent='Taxi Haiti'
      const mark=document.querySelector<HTMLElement>('.brand-chip .brand-mark')
      if(mark && mark.textContent!=='🚕') mark.textContent='🚕'

      const payment=document.querySelector<HTMLElement>('.payment-row strong')
      if(payment){
        const method=localStorage.getItem('taxi-payment-method')
        const next=method==='moncash'?'MonCash':method==='natcash'?'NatCash':'MonCash / NatCash'
        if(payment.textContent!==next) payment.textContent=next
      }
    }

    apply()
    const observer=new MutationObserver(apply)
    observer.observe(document.body,{childList:true,subtree:true})
    const timer=window.setInterval(apply,700)

    return()=>{
      observer.disconnect()
      window.clearInterval(timer)
      document.body.classList.remove('passenger-hard-v2')
    }
  },[])

  return <style>{`
    body.passenger-hard-v2{background:#eef3f1!important}
    body.passenger-hard-v2 .greeting-row{display:none!important}
    body.passenger-hard-v2 .map-panel.real-map-panel{height:43dvh!important;min-height:315px!important;max-height:430px!important}
    body.passenger-hard-v2 .topbar{top:14px!important;left:14px!important;right:14px!important}
    body.passenger-hard-v2 .round-button{box-shadow:0 8px 22px rgba(16,32,51,.12)!important;border:1px solid rgba(220,231,226,.95)!important}
    body.passenger-hard-v2 .brand-chip{min-width:126px!important;justify-content:center!important;box-shadow:0 8px 22px rgba(16,32,51,.10)!important;border:1px solid rgba(220,231,226,.92)!important}
    body.passenger-hard-v2 .booking-sheet{margin-top:-42px!important;padding:13px 15px calc(102px + env(safe-area-inset-bottom))!important;border-radius:28px 28px 0 0!important;box-shadow:0 -10px 34px rgba(16,32,51,.08)!important;background:#fff!important}
    body.passenger-hard-v2 .grabber{width:38px!important;height:4px!important;margin-bottom:10px!important;background:#d8e1dd!important}
    body.passenger-hard-v2 .passenger-booking-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 1px 11px;padding:2px 2px 0}
    body.passenger-hard-v2 .passenger-booking-head small{display:block;font-size:9px;font-weight:900;letter-spacing:.08em;color:#0f705a;margin-bottom:2px}
    body.passenger-hard-v2 .passenger-booking-head strong{display:block;font-size:20px;line-height:1.12;color:#13263a;font-weight:900}
    body.passenger-hard-v2 .passenger-booking-head span{display:block;margin-top:3px;font-size:10px;color:#75827d}
    body.passenger-hard-v2 .passenger-booking-head-icon{width:40px;height:40px;border-radius:13px;background:#eaf5f1;display:grid;place-items:center;font-size:18px;flex:0 0 auto}
    body.passenger-hard-v2 .route-card{margin-top:0!important;border-radius:19px!important;padding:4px 12px!important;border:1px solid #dfe9e5!important;box-shadow:0 7px 20px rgba(16,32,51,.05)!important;background:#fff!important;overflow:hidden!important}
    body.passenger-hard-v2 .route-line{position:relative!important;min-height:57px!important}
    body.passenger-hard-v2 .route-line:first-child{border-bottom:1px solid #edf2ef!important}
    body.passenger-hard-v2 .pickup-dot,body.passenger-hard-v2 .destination-dot{width:11px!important;height:11px!important;flex:0 0 11px!important;margin-right:12px!important;box-shadow:0 0 0 5px #f2f8f5!important}
    body.passenger-hard-v2 .pickup-dot{background:#0f705a!important}
    body.passenger-hard-v2 .destination-dot{background:#ef6a5b!important;box-shadow:0 0 0 5px #fff3f1!important}
    body.passenger-hard-v2 .connector{left:17px!important;top:48px!important;height:24px!important;border-left:2px dotted #c7d7d1!important}
    body.passenger-hard-v2 .input-wrap{padding:9px 0!important;min-width:0!important}
    body.passenger-hard-v2 .input-wrap label{font-size:8.5px!important;letter-spacing:.035em!important;text-transform:uppercase!important;color:#7a8882!important;font-weight:900!important}
    body.passenger-hard-v2 .input-wrap input{width:100%!important;font-size:13px!important;font-weight:760!important;color:#1b2d3d!important;line-height:1.3!important;padding:2px 0 1px!important;text-overflow:ellipsis!important}
    body.passenger-hard-v2 .passenger-destination-line .input-wrap input{color:#152638!important}
    body.passenger-hard-v2 .passenger-destination-line .input-wrap input::placeholder{color:#9aa5a0!important;font-weight:600!important}
    body.passenger-hard-v2 .search-results{margin-top:7px!important;border:1px solid #dfe9e5!important;border-radius:16px!important;overflow:hidden!important;background:#fff!important;box-shadow:0 10px 24px rgba(16,32,51,.08)!important;padding:4px!important}
    body.passenger-hard-v2 .search-results button{min-height:48px!important;padding:9px 10px!important;border-radius:12px!important;border:0!important;background:#fff!important;display:flex!important;align-items:center!important;gap:9px!important;text-align:left!important}
    body.passenger-hard-v2 .search-results button+button{border-top:1px solid #eef2f0!important}
    body.passenger-hard-v2 .search-results button span{width:30px!important;height:30px!important;border-radius:9px!important;background:#eef7f4!important;display:grid!important;place-items:center!important;flex:0 0 30px!important}
    body.passenger-hard-v2 .search-results button strong{font-size:10px!important;line-height:1.35!important;color:#30443d!important}
    body.passenger-hard-v2 .search-status{font-size:9px!important;padding:9px 10px!important;color:#73827c!important;font-weight:750!important}
    body.passenger-hard-v2 .section-heading{margin-top:13px!important;align-items:end!important}
    body.passenger-hard-v2 .section-heading h2{font-size:15px!important}
    body.passenger-hard-v2 .section-heading>span{font-size:9px!important;color:#718078!important}
    body.passenger-hard-v2 .ride-list{grid-template-columns:1fr 1fr!important;gap:9px!important;margin-top:8px!important}
    body.passenger-hard-v2 .ride-option{min-height:84px!important;padding:10px!important;border-radius:16px!important;display:grid!important;grid-template-columns:40px 1fr!important;grid-template-rows:auto auto!important;align-items:center!important;text-align:left!important;position:relative!important}
    body.passenger-hard-v2 .ride-option.selected{border-color:#75b7a4!important;background:#eff8f5!important;box-shadow:0 5px 16px rgba(15,112,90,.08)!important}
    body.passenger-hard-v2 .ride-icon{width:38px!important;height:38px!important;margin-right:7px!important}
    body.passenger-hard-v2 .ride-copy strong{font-size:12px!important}
    body.passenger-hard-v2 .ride-copy small{font-size:8.5px!important;line-height:1.25!important}
    body.passenger-hard-v2 .ride-price{grid-column:1 / -1!important;margin-top:6px!important;padding-top:6px!important;border-top:1px solid #edf1ef!important;font-size:11px!important;text-align:right!important;color:#0f705a!important}
    body.passenger-hard-v2 .payment-row{margin-top:10px!important;padding:10px 11px!important;border-radius:15px!important;background:#f5faf8!important;border:1px solid #d9e9e3!important}
    body.passenger-hard-v2 .payment-row button{font-size:10px!important;font-weight:850!important;color:#0f705a!important}
    body.passenger-hard-v2 .request-button{margin-top:10px!important;min-height:56px!important;border-radius:17px!important;background:#0F705A!important;box-shadow:0 10px 22px rgba(15,112,90,.18)!important;font-size:13px!important}
    body.passenger-hard-v2 .searching-card{border-radius:17px!important;min-height:56px!important}
    body.passenger-hard-v2 .fine-print{display:none!important}
    @media(max-width:420px){
      body.passenger-hard-v2 .map-panel.real-map-panel{height:41dvh!important;min-height:300px!important}
      body.passenger-hard-v2 .booking-sheet{margin-top:-38px!important}
      body.passenger-hard-v2 .passenger-booking-head strong{font-size:18px!important}
    }
  `}</style>
}
