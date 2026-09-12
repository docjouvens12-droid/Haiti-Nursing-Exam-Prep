'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Map as MapboxMap, Marker as MapboxMarker } from 'mapbox-gl'

export default function DriverCleanUberBoltHome(){
  const [todayTrips,setTodayTrips]=useState(0)
  const [todayEarnings,setTodayEarnings]=useState(0)
  const [rating,setRating]=useState(0)
  const [mapFailed,setMapFailed]=useState(false)
  const mapEl=useRef<HTMLDivElement|null>(null)
  const mapRef=useRef<MapboxMap|null>(null)
  const markerRef=useRef<MapboxMarker|null>(null)
  const watchRef=useRef<number|null>(null)

  useEffect(()=>{
    ;(async()=>{
      const {data:auth}=await supabase.auth.getUser()
      const user=auth.user
      if(!user)return
      const {data:driver}=await supabase.from('driver_profiles').select('average_rating').eq('user_id',user.id).maybeSingle()
      setRating(Number(driver?.average_rating||0))
      const start=new Date();start.setHours(0,0,0,0)
      const {data:rides}=await supabase.from('rides').select('id,final_fare_htg').eq('driver_id',user.id).eq('status','completed').gte('completed_at',start.toISOString())
      const rows=rides||[]
      setTodayTrips(rows.length)
      if(rows.length){
        const {data:payments}=await supabase.from('payments').select('ride_id,driver_net_htg').in('ride_id',rows.map(r=>r.id))
        const netByRide=new Map((payments||[]).map(p=>[p.ride_id,Number(p.driver_net_htg||0)]))
        setTodayEarnings(rows.reduce((sum,r)=>sum+(netByRide.get(r.id)??Number(r.final_fare_htg||0)*0.85),0))
      }
    })()
  },[])

  useEffect(()=>{
    if(!mapEl.current||mapRef.current)return
    const token=process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if(!token){setMapFailed(true);return}
    let cancelled=false
    ;(async()=>{
      try{
        const mod=await import('mapbox-gl')
        if(cancelled||!mapEl.current)return
        mod.default.accessToken=token
        const map=new mod.default.Map({container:mapEl.current,style:'mapbox://styles/mapbox/streets-v12',center:[-72.3364,18.5392],zoom:12,attributionControl:false})
        map.addControl(new mod.default.NavigationControl({showCompass:false}),'bottom-right')
        mapRef.current=map
        if(navigator.geolocation){
          watchRef.current=navigator.geolocation.watchPosition(pos=>{
            const point:[number,number]=[pos.coords.longitude,pos.coords.latitude]
            if(!markerRef.current){
              const el=document.createElement('div');el.className='dcu-marker';el.textContent='🚕'
              markerRef.current=new mod.default.Marker({element:el}).setLngLat(point).addTo(map)
            }else markerRef.current.setLngLat(point)
            map.easeTo({center:point,zoom:14,duration:700})
          },()=>{}, {enableHighAccuracy:true,maximumAge:10000,timeout:15000})
        }
      }catch{if(!cancelled)setMapFailed(true)}
    })()
    return()=>{
      cancelled=true
      if(watchRef.current!==null&&navigator.geolocation)navigator.geolocation.clearWatch(watchRef.current)
      markerRef.current?.remove();mapRef.current?.remove();mapRef.current=null
    }
  },[])

  const ht=typeof window!=='undefined'&&localStorage.getItem('taxi-language')==='ht'
  return <>
    <style>{`
      .dcu-home{margin:16px 0 10px}.dcu-map-shell{height:300px;border-radius:26px;overflow:hidden;position:relative;background:#eaf1ef;border:1px solid #dce7e3;box-shadow:0 10px 28px rgba(16,32,51,.08)}.dcu-map{width:100%;height:100%}.dcu-map-label{position:absolute;left:14px;top:14px;z-index:3;background:rgba(255,255,255,.96);backdrop-filter:blur(8px);border-radius:999px;padding:9px 13px;font-size:12px;font-weight:900;color:#102033;box-shadow:0 4px 14px rgba(0,0,0,.08);border:1px solid rgba(15,112,90,.12)}.dcu-map-fallback{height:100%;display:grid;place-items:center;text-align:center;padding:20px;color:#617281;font-weight:800}.dcu-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:11px}.dcu-stat{background:#fff;border:1px solid #e0e8e5;border-radius:18px;padding:13px 9px;min-width:0;box-shadow:0 5px 16px rgba(16,32,51,.04)}.dcu-stat small,.dcu-stat strong{display:block}.dcu-stat small{font-size:9px;color:#7d8b98;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dcu-stat strong{margin-top:6px;font-size:14px;color:#102033}.dcu-stat strong span{margin-right:3px}.dcu-marker{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#fff;border:3px solid #0f705a;box-shadow:0 5px 14px rgba(0,0,0,.2);font-size:21px}@media(max-width:560px){.dcu-map-shell{height:285px}.dcu-stat{padding:12px 8px}.dcu-stat strong{font-size:13px}}
    `}</style>
    <section className="dcu-home">
      <div className="dcu-map-shell">
        <div className="dcu-map-label">{ht?'📍 Pozisyon ou':'📍 Votre position'}</div>
        {mapFailed?<div className="dcu-map-fallback">{ht?'Kat GPS la pa disponib pou kounye a.':'La carte GPS est indisponible pour le moment.'}</div>:<div ref={mapEl} className="dcu-map"/>}
      </div>
      <div className="dcu-stats">
        <div className="dcu-stat"><small>{ht?'Revni jodi a':'Revenus aujourd’hui'}</small><strong><span>💰</span>{Math.round(todayEarnings).toLocaleString('fr-HT')} HTG</strong></div>
        <div className="dcu-stat"><small>{ht?'Trajè jodi a':'Trajets aujourd’hui'}</small><strong><span>🚕</span>{todayTrips}</strong></div>
        <div className="dcu-stat"><small>{ht?'Evalyasyon':'Évaluation'}</small><strong><span>★</span>{rating.toFixed(1)}</strong></div>
      </div>
    </section>
  </>
}
