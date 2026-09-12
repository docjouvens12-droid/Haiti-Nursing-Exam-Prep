'use client'

import { useEffect } from 'react'

export default function DriverCleanEarningsPolish(){
  useEffect(()=>{
    if(!window.location.pathname.startsWith('/driver/dashboard-v2')) return

    const styleId='driver-clean-earnings-polish-style'
    if(!document.getElementById(styleId)){
      const style=document.createElement('style')
      style.id=styleId
      style.textContent=`
        .dcm-earnings-polish{background:#f8faf9!important;border-radius:18px!important;padding:12px!important}
        .dcm-earnings-summary{background:linear-gradient(145deg,#102033,#173246);color:#fff;border-radius:18px;padding:14px;margin-bottom:12px;box-shadow:0 8px 20px rgba(16,32,51,.16)}
        .dcm-earnings-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
        .dcm-earnings-left{display:flex;align-items:center;gap:10px}.dcm-earnings-icon{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:rgba(255,255,255,.12);font-size:20px}
        .dcm-earnings-summary strong{display:block;font-size:14px}.dcm-earnings-summary small{display:block;margin-top:3px;font-size:10px;opacity:.78}.dcm-earnings-net{font-size:19px!important;font-weight:950!important;color:#fff!important;text-align:right!important}
        .dcm-earnings-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.dcm-earnings-card{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:9px 7px;text-align:center}.dcm-earnings-card span{display:block;font-size:8px;opacity:.76;text-transform:uppercase;font-weight:850}.dcm-earnings-card b{display:block;font-size:11px;margin-top:4px;color:#fff}
        .dcm-earnings-label{margin:12px 2px 7px;font-size:10px;font-weight:900;letter-spacing:.05em;text-transform:uppercase;color:#708078}
        .dcm-earnings-polish>p{background:#fff;border:1px solid #e5ebe8;border-radius:12px;padding:10px 11px;margin:7px 0!important;align-items:center}.dcm-earnings-polish>p span{font-size:10px!important}.dcm-earnings-polish>p b{font-size:11px!important}
        .dcm-earnings-polish>p:nth-of-type(2){border-color:#f3dfad;background:#fffbef}.dcm-earnings-polish>p:nth-of-type(2) b{color:#9a6a00!important}.dcm-earnings-polish>p:nth-of-type(3){border-color:#cfe8df;background:#eef8f4}.dcm-earnings-polish>p:nth-of-type(3) b{color:#0f705a!important;font-size:13px!important}
      `
      document.head.appendChild(style)
    }

    const parseAmount=(text:string)=>{
      const cleaned=text.replace(/[^0-9.,-]/g,'').replace(/,/g,'')
      const n=Number(cleaned)
      return Number.isFinite(n)?n:0
    }
    const fmt=(n:number)=>`${Math.round(n).toLocaleString('fr-HT')} HTG`

    const apply=()=>{
      const rows=Array.from(document.querySelectorAll<HTMLElement>('.dcm-row'))
      const row=rows.find(el=>{
        const text=(el.textContent||'').toLowerCase()
        return text.includes('revni')||text.includes('revenus')
      })
      const panel=row?.nextElementSibling as HTMLElement|null
      if(!panel?.classList.contains('dcm-panel')) return
      panel.classList.add('dcm-earnings-polish')
      const detailRows=Array.from(panel.querySelectorAll<HTMLElement>(':scope > p'))
      if(detailRows.length<3) return
      const gross=parseAmount(detailRows[0].textContent||'')
      const fee=parseAmount(detailRows[1].textContent||'')
      const net=parseAmount(detailRows[2].textContent||'')
      const trips=parseAmount(detailRows[3]?.textContent||'')
      const ht=localStorage.getItem('taxi-language')==='ht'

      let summary=panel.querySelector<HTMLElement>('.dcm-earnings-summary')
      if(!summary){
        summary=document.createElement('div')
        summary.className='dcm-earnings-summary'
        panel.insertBefore(summary,panel.firstChild)
      }
      summary.innerHTML=`
        <div class="dcm-earnings-top">
          <div class="dcm-earnings-left"><div class="dcm-earnings-icon">💰</div><div><strong>${ht?'Revni chofè':'Revenus chauffeur'}</strong><small>${ht?'Rezime aktivite ou':'Résumé de votre activité'}</small></div></div>
          <b class="dcm-earnings-net">${fmt(net)}</b>
        </div>
        <div class="dcm-earnings-cards">
          <div class="dcm-earnings-card"><span>${ht?'Brit':'Brut'}</span><b>${fmt(gross)}</b></div>
          <div class="dcm-earnings-card"><span>${ht?'Platfòm 15%':'Plateforme 15%'}</span><b>${fmt(fee)}</b></div>
          <div class="dcm-earnings-card"><span>${ht?'Trajè':'Trajets'}</span><b>${Math.round(trips)}</b></div>
        </div>`

      if(!panel.querySelector('.dcm-earnings-label')){
        const label=document.createElement('div')
        label.className='dcm-earnings-label'
        label.textContent=ht?'Detay revni':'Détail des revenus'
        summary.insertAdjacentElement('afterend',label)
      }
    }

    const onClick=()=>window.setTimeout(apply,50)
    document.addEventListener('click',onClick,true)
    const timer=window.setInterval(apply,500)
    apply()
    return()=>{document.removeEventListener('click',onClick,true);window.clearInterval(timer)}
  },[])
  return null
}
