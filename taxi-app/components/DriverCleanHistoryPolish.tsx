'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

type DateFilter='today'|'7d'|'30d'|'all'
type StatusFilter='all'|'completed'|'cancelled'
type Ride=Record<string,unknown> & {
  id:string
  pickup_address?:string|null
  destination_address?:string|null
  final_fare_htg?:number|null
  completed_at?:string|null
  created_at?:string|null
  status?:string|null
}

export default function DriverCleanHistoryPolish(){
  const [target,setTarget]=useState<HTMLElement|null>(null)
  const [rides,setRides]=useState<Ride[]>([])
  const [dateFilter,setDateFilter]=useState<DateFilter>('30d')
  const [statusFilter,setStatusFilter]=useState<StatusFilter>('all')
  const [query,setQuery]=useState('')
  const [selected,setSelected]=useState<string|null>(null)
  const [loading,setLoading]=useState(false)
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

  async function loadRides(){
    setLoading(true)
    try{
      const {data:s}=await supabase.auth.getSession()
      const user=s.session?.user
      if(!user) return
      const {data}=await supabase.from('rides').select('*').eq('driver_id',user.id).order('created_at',{ascending:false}).limit(100)
      setRides((data||[]) as Ride[])
    } finally { setLoading(false) }
  }

  useEffect(()=>{ if(target) void loadRides() },[target])

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase()
    const now=new Date()
    const cutoff=new Date(now)
    if(dateFilter==='today') cutoff.setHours(0,0,0,0)
    if(dateFilter==='7d') cutoff.setDate(now.getDate()-7)
    if(dateFilter==='30d') cutoff.setDate(now.getDate()-30)

    return rides.filter(r=>{
      const rawStatus=String(r.status||'').toLowerCase()
      const statusOk=statusFilter==='all'
        || (statusFilter==='completed' && ['completed','complete','finished'].includes(rawStatus))
        || (statusFilter==='cancelled' && ['cancelled','canceled','cancelled_by_driver','cancelled_by_passenger'].includes(rawStatus))
      if(!statusOk) return false

      if(dateFilter!=='all'){
        const rawDate=String(r.completed_at||r.created_at||'')
        if(!rawDate || new Date(rawDate)<cutoff) return false
      }

      if(q){
        const hay=`${r.pickup_address||''} ${r.destination_address||''}`.toLowerCase()
        if(!hay.includes(q)) return false
      }
      return true
    })
  },[rides,dateFilter,statusFilter,query])

  const getDate=(r:Ride)=>String(r.completed_at||r.created_at||'')
  const getFare=(r:Ride)=>Number(r.final_fare_htg ?? r['fare_htg'] ?? r['estimated_fare_htg'] ?? 0)
  const getDistance=(r:Ride)=>Number(r['distance_km'] ?? r['trip_distance_km'] ?? r['route_distance_km'] ?? 0)
  const total=filtered.reduce((sum,r)=>sum+getFare(r),0)

  const statusLabel=(status:unknown)=>{
    const s=String(status||'').toLowerCase()
    if(['completed','complete','finished'].includes(s)) return ht?'Konplete':'Terminé'
    if(['cancelled','canceled','cancelled_by_driver','cancelled_by_passenger'].includes(s)) return ht?'Anile':'Annulé'
    if(['accepted','assigned'].includes(s)) return ht?'Aksepte':'Accepté'
    if(['in_progress','started'].includes(s)) return ht?'An kou':'En cours'
    return status ? String(status) : '—'
  }

  if(!target) return null

  return createPortal(<div className="dch-wrap">
    <style>{`
      .driver-clean-history-polish{background:#f8faf9!important;border-radius:18px!important;padding:12px!important}
      .dch-wrap{display:grid;gap:10px;color:#102033}
      .dch-summary{display:grid;grid-template-columns:1fr 1fr;gap:8px}.dch-stat{background:linear-gradient(145deg,#0f705a,#155f51);color:#fff;border-radius:16px;padding:13px;box-shadow:0 8px 18px rgba(15,112,90,.13)}.dch-stat span{display:block;font-size:9px;opacity:.82;font-weight:800;text-transform:uppercase}.dch-stat strong{display:block;margin-top:4px;font-size:16px}
      .dch-searchbar{display:grid;grid-template-columns:1fr auto;gap:6px}.dch-searchbar input{min-width:0;border:1px solid #dce6e2;background:#fff;border-radius:12px;padding:10px 11px;font-size:11px;color:#102033}.dch-refresh{border:0;border-radius:12px;background:#edf5f2;color:#0f705a;font-weight:900;padding:0 11px}
      .dch-status,.dch-dates{display:grid;gap:5px;background:#eef3f1;padding:4px;border-radius:13px}.dch-status{grid-template-columns:repeat(3,1fr)}.dch-dates{grid-template-columns:repeat(4,1fr)}.dch-status button,.dch-dates button{border:0;background:transparent;border-radius:10px;padding:8px 4px;font-size:9px;font-weight:900;color:#718078}.dch-status button.active,.dch-dates button.active{background:#fff;color:#0f705a;box-shadow:0 3px 8px rgba(16,32,51,.07)}
      .dch-list{display:grid;gap:8px;max-height:420px;overflow:auto;padding-right:1px;-webkit-overflow-scrolling:touch}.dch-trip{width:100%;text-align:left;background:#fff;border:1px solid #e4ebe8;border-radius:15px;padding:11px;color:#102033}.dch-trip-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.dch-trip-head strong{font-size:10px;color:#52645d}.dch-badge{font-size:8px;font-weight:900;background:#e8f6f1;color:#0f705a;border-radius:999px;padding:5px 7px}.dch-route{display:grid;gap:6px;font-size:10px;color:#40534c}.dch-route div{display:flex;gap:6px;align-items:flex-start}.dch-fare{margin-top:9px;padding-top:8px;border-top:1px solid #edf1ef;display:flex;justify-content:space-between;align-items:center}.dch-fare span{font-size:9px;color:#7b8983}.dch-fare strong{font-size:13px;color:#102033}.dch-more{margin-top:9px;padding:9px;background:#f6f9f8;border-radius:11px;display:grid;gap:5px;font-size:9px;color:#5d6c66}.dch-empty{padding:22px 12px;text-align:center;color:#73827b;font-size:11px;background:#fff;border:1px dashed #d5dfdb;border-radius:14px}.dch-loading{text-align:center;font-size:10px;color:#718078;padding:8px}
    `}</style>

    <div className="dch-summary">
      <div className="dch-stat"><span>{ht?'Trajè':'Trajets'}</span><strong>{filtered.length}</strong></div>
      <div className="dch-stat"><span>Total</span><strong>{total.toLocaleString('fr-HT')} HTG</strong></div>
    </div>

    <div className="dch-searchbar">
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={ht?'Chèche depa oswa destinasyon':'Rechercher départ ou destination'}/>
      <button className="dch-refresh" onClick={()=>void loadRides()} aria-label={ht?'Rafrechi':'Rafraîchir'}>↻</button>
    </div>

    <div className="dch-status">
      <button className={statusFilter==='all'?'active':''} onClick={()=>setStatusFilter('all')}>{ht?'Tout':'Tous'}</button>
      <button className={statusFilter==='completed'?'active':''} onClick={()=>setStatusFilter('completed')}>{ht?'Konplete':'Terminés'}</button>
      <button className={statusFilter==='cancelled'?'active':''} onClick={()=>setStatusFilter('cancelled')}>{ht?'Anile':'Annulés'}</button>
    </div>

    <div className="dch-dates">
      {([['today',ht?'Jodi a':'Aujourd’hui'],['7d',ht?'7 jou':'7 jours'],['30d',ht?'30 jou':'30 jours'],['all',ht?'Tout':'Tout']] as [DateFilter,string][]).map(([key,label])=><button key={key} className={dateFilter===key?'active':''} onClick={()=>setDateFilter(key)}>{label}</button>)}
    </div>

    {loading&&<div className="dch-loading">{ht?'Chajman...':'Chargement...'}</div>}
    <div className="dch-list">
      {!loading&&filtered.length===0?<div className="dch-empty">{ht?'Pa gen trajè ki koresponn ak filtè sa yo.':'Aucun trajet ne correspond à ces filtres.'}</div>:filtered.map(r=>{
        const distance=getDistance(r)
        const opened=selected===r.id
        return <button type="button" className="dch-trip" key={r.id} onClick={()=>setSelected(opened?null:r.id)}>
          <div className="dch-trip-head"><strong>{getDate(r)?new Date(getDate(r)).toLocaleString(ht?'fr-HT':'fr-FR'):'—'}</strong><span className="dch-badge">{statusLabel(r.status)}</span></div>
          <div className="dch-route"><div><span>📍</span><span>{r.pickup_address||'—'}</span></div><div><span>🏁</span><span>{r.destination_address||'—'}</span></div></div>
          <div className="dch-fare"><span>{ht?'Montan':'Montant'}</span><strong>{getFare(r).toLocaleString('fr-HT')} HTG</strong></div>
          {opened&&<div className="dch-more">
            <div><b>{ht?'Estati':'Statut'}:</b> {statusLabel(r.status)}</div>
            <div><b>{ht?'Dat ak lè':'Date et heure'}:</b> {getDate(r)?new Date(getDate(r)).toLocaleString(ht?'fr-HT':'fr-FR'):'—'}</div>
            {distance>0&&<div><b>{ht?'Distans':'Distance'}:</b> {distance.toFixed(1)} km</div>}
            <div><b>{ht?'Kòd trajè':'ID trajet'}:</b> {r.id}</div>
          </div>}
        </button>
      })}
    </div>
  </div>,target)
}
