'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

type Filter='today'|'7d'|'30d'|'all'
type Ride={id:string;pickup_address:string|null;destination_address:string|null;final_fare_htg:number|null;completed_at:string|null;status:string|null}

export default function DriverCleanHistoryPolish(){
  const [target,setTarget]=useState<HTMLElement|null>(null)
  const [rides,setRides]=useState<Ride[]>([])
  const [filter,setFilter]=useState<Filter>('30d')
  const [ht,setHt]=useState(false)

  useEffect(()=>{
    if(!location.pathname.startsWith('/driver/dashboard-v2')) return
    setHt(localStorage.getItem('taxi-language')==='ht')

    const locate=()=>{
      const rows=Array.from(document.querySelectorAll<HTMLButtonElement>('.dcm-row'))
      const row=rows.find(el=>{
        const t=(el.textContent||'').toLowerCase()
        return t.includes('historique')||t.includes('istwa trajè')
      })
      const panel=row?.nextElementSibling as HTMLElement|null
      if(panel?.classList.contains('dcm-panel')){
        panel.classList.add('driver-clean-history-polish')
        Array.from(panel.children).forEach(el=>{
          const node=el as HTMLElement
          if(!node.classList.contains('driver-clean-history-root')) node.style.display='none'
        })
        let mount=panel.querySelector<HTMLElement>('.driver-clean-history-root')
        if(!mount){
          mount=document.createElement('div')
          mount.className='driver-clean-history-root'
          panel.appendChild(mount)
        }
        setTarget(mount)
      } else setTarget(null)
    }

    locate()
    const timer=window.setInterval(locate,250)
    return()=>window.clearInterval(timer)
  },[])

  useEffect(()=>{
    if(!target) return
    void (async()=>{
      const {data:s}=await supabase.auth.getSession()
      const user=s.session?.user
      if(!user) return
      const {data}=await supabase.from('rides').select('id,pickup_address,destination_address,final_fare_htg,completed_at,status').eq('driver_id',user.id).eq('status','completed').order('completed_at',{ascending:false}).limit(100)
      setRides((data||[]) as Ride[])
    })()
  },[target])

  const filtered=useMemo(()=>{
    if(filter==='all') return rides
    const now=new Date()
    const cutoff=new Date(now)
    if(filter==='today') cutoff.setHours(0,0,0,0)
    if(filter==='7d') cutoff.setDate(now.getDate()-7)
    if(filter==='30d') cutoff.setDate(now.getDate()-30)
    return rides.filter(r=>r.completed_at&&new Date(r.completed_at)>=cutoff)
  },[rides,filter])

  const total=filtered.reduce((sum,r)=>sum+Number(r.final_fare_htg||0),0)
  if(!target) return null

  return createPortal(<div className="dch-wrap">
    <style>{`
      .driver-clean-history-polish{background:#f8faf9!important;border-radius:18px!important;padding:12px!important}
      .dch-wrap{display:grid;gap:10px;color:#102033}
      .dch-summary{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .dch-stat{background:linear-gradient(145deg,#0f705a,#155f51);color:#fff;border-radius:16px;padding:13px;box-shadow:0 8px 18px rgba(15,112,90,.13)}
      .dch-stat span{display:block;font-size:9px;opacity:.82;font-weight:800;text-transform:uppercase;letter-spacing:.04em}
      .dch-stat strong{display:block;margin-top:4px;font-size:16px}
      .dch-filters{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;background:#eef3f1;padding:4px;border-radius:13px}
      .dch-filters button{border:0;background:transparent;border-radius:10px;padding:8px 4px;font-size:9px;font-weight:900;color:#718078}
      .dch-filters button.active{background:#fff;color:#0f705a;box-shadow:0 3px 8px rgba(16,32,51,.07)}
      .dch-list{display:grid;gap:8px;max-height:390px;overflow:auto;padding-right:1px;-webkit-overflow-scrolling:touch}
      .dch-trip{background:#fff;border:1px solid #e4ebe8;border-radius:15px;padding:11px}
      .dch-trip-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
      .dch-trip-head strong{font-size:10px;color:#52645d}
      .dch-badge{font-size:8px;font-weight:900;background:#e8f6f1;color:#0f705a;border-radius:999px;padding:5px 7px}
      .dch-route{display:grid;gap:6px;font-size:10px;color:#40534c}
      .dch-route div{display:flex;gap:6px;align-items:flex-start}
      .dch-fare{margin-top:9px;padding-top:8px;border-top:1px solid #edf1ef;display:flex;justify-content:space-between;align-items:center}
      .dch-fare span{font-size:9px;color:#7b8983}.dch-fare strong{font-size:13px;color:#102033}
      .dch-empty{padding:22px 12px;text-align:center;color:#73827b;font-size:11px;background:#fff;border:1px dashed #d5dfdb;border-radius:14px}
    `}</style>
    <div className="dch-summary">
      <div className="dch-stat"><span>{ht?'Trajè':'Trajets'}</span><strong>{filtered.length}</strong></div>
      <div className="dch-stat"><span>Total</span><strong>{total.toLocaleString('fr-HT')} HTG</strong></div>
    </div>
    <div className="dch-filters">
      {([['today',ht?'Jodi a':'Aujourd’hui'],['7d',ht?'7 jou':'7 jours'],['30d',ht?'30 jou':'30 jours'],['all',ht?'Tout':'Tout']] as [Filter,string][]).map(([key,label])=><button key={key} className={filter===key?'active':''} onClick={()=>setFilter(key)}>{label}</button>)}
    </div>
    <div className="dch-list">
      {filtered.length===0?<div className="dch-empty">{ht?'Pa gen trajè nan peryòd sa a.':'Aucun trajet pour cette période.'}</div>:filtered.map(r=><div className="dch-trip" key={r.id}>
        <div className="dch-trip-head"><strong>{r.completed_at?new Date(r.completed_at).toLocaleString(ht?'fr-HT':'fr-FR'):'—'}</strong><span className="dch-badge">{ht?'Konplete':'Terminé'}</span></div>
        <div className="dch-route"><div><span>📍</span><span>{r.pickup_address||'—'}</span></div><div><span>🏁</span><span>{r.destination_address||'—'}</span></div></div>
        <div className="dch-fare"><span>{ht?'Montan trajè':'Montant du trajet'}</span><strong>{Number(r.final_fare_htg||0).toLocaleString('fr-HT')} HTG</strong></div>
      </div>)}
    </div>
  </div>,target)
}
