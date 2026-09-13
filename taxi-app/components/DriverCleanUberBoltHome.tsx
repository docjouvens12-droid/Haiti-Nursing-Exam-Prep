'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Map as MapboxMap, Marker as MapboxMarker } from 'mapbox-gl'

export type DriverMapRide={
  id:string
  status:'requested'|'accepted'|'driver_arriving'|'in_progress'
  pickup_address:string
  pickup_latitude:number
  pickup_longitude:number
  destination_address:string
  destination_latitude:number
  destination_longitude:number
}

type RouteInfo={distanceKm:number;durationMin:number;instruction:string;phase:'pickup'|'destination'}
type RouteResponse={routes?:Array<{distance:number;duration:number;geometry:{coordinates:[number,number][];type:'LineString'};legs?:Array<{steps?:Array<{maneuver?:{instruction?:string}}>}>}>}

function metersBetween(a:[number,number],b:[number,number]){
  const R=6371000, rad=(v:number)=>v*Math.PI/180
  const dLat=rad(b[1]-a[1]), dLon=rad(b[0]-a[0])
  const x=Math.sin(dLat/2)**2+Math.cos(rad(a[1]))*Math.cos(rad(b[1]))*Math.sin(dLon/2)**2
  return 2*R*Math.asin(Math.sqrt(x))
}

export default function DriverCleanUberBoltHome({previewRide=null}:{previewRide?:DriverMapRide|null}){
  const [todayTrips,setTodayTrips]=useState(0)
  const [todayEarnings,setTodayEarnings]=useState(0)
  const [rating,setRating]=useState(0)
  const [mapFailed,setMapFailed]=useState(false)
  const [activeRide,setActiveRide]=useState<DriverMapRide|null>(null)
  const [routeInfo,setRouteInfo]=useState<RouteInfo|null>(null)
  const [gpsStatus,setGpsStatus]=useState<'waiting'|'ok'|'error'>('waiting')
  const mapEl=useRef<HTMLDivElement|null>(null)
  const mapRef=useRef<MapboxMap|null>(null)
  const driverMarkerRef=useRef<MapboxMarker|null>(null)
  const pickupMarkerRef=useRef<MapboxMarker|null>(null)
  const destinationMarkerRef=useRef<MapboxMarker|null>(null)
  const watchRef=useRef<number|null>(null)
  const lastRoutePointRef=useRef<[number,number]|null>(null)
  const lastRouteAtRef=useRef(0)
  const rideRef=useRef<DriverMapRide|null>(null)
  const effectiveRide=activeRide ?? previewRide

  useEffect(()=>{rideRef.current=effectiveRide},[effectiveRide])

  useEffect(()=>{
    let cancelled=false
    const load=async()=>{
      const {data:auth}=await supabase.auth.getUser(); const user=auth.user
      if(!user||cancelled)return
      const start=new Date(); start.setHours(0,0,0,0)
      const [{data:driver},{data:rides},{data:mineRows}]=await Promise.all([
        supabase.from('driver_profiles').select('average_rating').eq('user_id',user.id).maybeSingle(),
        supabase.from('rides').select('id,final_fare_htg').eq('driver_id',user.id).eq('status','completed').gte('completed_at',start.toISOString()),
        supabase.from('rides').select('id,status,pickup_address,pickup_latitude,pickup_longitude,destination_address,destination_latitude,destination_longitude').eq('driver_id',user.id).in('status',['accepted','driver_arriving','in_progress']).order('requested_at',{ascending:false}).limit(1)
      ])
      if(cancelled)return
      setRating(Number(driver?.average_rating||0))
      const rows=rides||[]; setTodayTrips(rows.length)
      if(rows.length){
        const {data:payments}=await supabase.from('payments').select('ride_id,driver_net_htg').in('ride_id',rows.map(r=>r.id))
        const netByRide=new Map((payments||[]).map(p=>[p.ride_id,Number(p.driver_net_htg||0)]))
        setTodayEarnings(rows.reduce((sum,r)=>sum+(netByRide.get(r.id)??Number(r.final_fare_htg||0)*0.85),0))
      } else setTodayEarnings(0)
      setActiveRide((mineRows?.[0]||null) as DriverMapRide|null)
    }
    void load(); const timer=window.setInterval(()=>void load(),5000)
    return()=>{cancelled=true;window.clearInterval(timer)}
  },[])

  async function drawRoute(driverPoint:[number,number],ride:DriverMapRide,force=false){
    const map=mapRef.current, token=process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if(!map||!token)return
    const now=Date.now(), moved=lastRoutePointRef.current?metersBetween(lastRoutePointRef.current,driverPoint):Infinity
    if(!force&&moved<20&&now-lastRouteAtRef.current<5000)return
    lastRoutePointRef.current=driverPoint; lastRouteAtRef.current=now
    const phase:RouteInfo['phase']=ride.status==='in_progress'?'destination':'pickup'
    const end:[number,number]=phase==='pickup'?[Number(ride.pickup_longitude),Number(ride.pickup_latitude)]:[Number(ride.destination_longitude),Number(ride.destination_latitude)]
    if(!Number.isFinite(end[0])||!Number.isFinite(end[1]))return
    try{
      const url=`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${driverPoint[0]},${driverPoint[1]};${end[0]},${end[1]}?alternatives=false&geometries=geojson&overview=full&steps=true&language=fr&access_token=${encodeURIComponent(token)}`
      const response=await fetch(url,{cache:'no-store'}); if(!response.ok)throw new Error('route')
      const route=(await response.json() as RouteResponse).routes?.[0]; if(!route)return
      const geojson={type:'Feature' as const,properties:{},geometry:route.geometry}
      const source=map.getSource('driver-live-route') as {setData?:(data:unknown)=>void}|undefined
      if(source?.setData) source.setData(geojson)
      else if(map.isStyleLoaded()){
        map.addSource('driver-live-route',{type:'geojson',data:geojson})
        map.addLayer({id:'driver-live-route-line',type:'line',source:'driver-live-route',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#0F705A','line-width':7,'line-opacity':.92}})
      }
      const instruction=route.legs?.[0]?.steps?.find(step=>step.maneuver?.instruction)?.maneuver?.instruction||''
      setRouteInfo({distanceKm:route.distance/1000,durationMin:Math.max(1,Math.round(route.duration/60)),instruction,phase})
      const coords=route.geometry.coordinates
      if(coords.length>1){
        const mod=await import('mapbox-gl')
        const bounds=coords.reduce((b,c)=>b.extend(c),new mod.default.LngLatBounds(coords[0],coords[0]))
        map.fitBounds(bounds,{padding:{top:60,bottom:95,left:42,right:42},duration:550,maxZoom:16})
      }
    }catch{}
  }

  async function applyPosition(pos:GeolocationPosition){
    const map=mapRef.current, ride=rideRef.current
    if(!map)return
    setGpsStatus('ok')
    const point:[number,number]=[pos.coords.longitude,pos.coords.latitude]
    const mod=await import('mapbox-gl')
    if(!driverMarkerRef.current){
      const el=document.createElement('div');el.className='dcu-marker active';el.textContent='🚕'
      driverMarkerRef.current=new mod.default.Marker({element:el,rotationAlignment:'map'}).setLngLat(point).addTo(map)
    } else driverMarkerRef.current.setLngLat(point)
    const markerEl=driverMarkerRef.current.getElement(); markerEl.classList.add('active')
    const user=(await supabase.auth.getUser()).data.user
    if(user) void supabase.from('driver_locations').upsert({driver_id:user.id,latitude:pos.coords.latitude,longitude:pos.coords.longitude,heading:Number.isFinite(pos.coords.heading)?pos.coords.heading:null,speed_kph:Number.isFinite(pos.coords.speed)?Math.max(0,(pos.coords.speed||0)*3.6):null,updated_at:new Date().toISOString()},{onConflict:'driver_id'})
    if(ride){
      const pickup:[number,number]=[Number(ride.pickup_longitude),Number(ride.pickup_latitude)]
      const dest:[number,number]=[Number(ride.destination_longitude),Number(ride.destination_latitude)]
      if(Number.isFinite(pickup[0])&&Number.isFinite(pickup[1])){
        if(!pickupMarkerRef.current){const el=document.createElement('div');el.className='dcu-stop pickup';el.textContent='P';pickupMarkerRef.current=new mod.default.Marker({element:el}).setLngLat(pickup).addTo(map)} else pickupMarkerRef.current.setLngLat(pickup)
      }
      if(Number.isFinite(dest[0])&&Number.isFinite(dest[1])){
        if(!destinationMarkerRef.current){const el=document.createElement('div');el.className='dcu-stop destination';el.textContent='D';destinationMarkerRef.current=new mod.default.Marker({element:el}).setLngLat(dest).addTo(map)} else destinationMarkerRef.current.setLngLat(dest)
      }
      void drawRoute(point,ride,true)
    } else {
      setRouteInfo(null); pickupMarkerRef.current?.remove();pickupMarkerRef.current=null;destinationMarkerRef.current?.remove();destinationMarkerRef.current=null
      if(map.getLayer('driver-live-route-line'))map.removeLayer('driver-live-route-line')
      if(map.getSource('driver-live-route'))map.removeSource('driver-live-route')
      map.easeTo({center:point,zoom:14,duration:500})
    }
  }

  useEffect(()=>{
    if(!mapEl.current||mapRef.current)return
    const token=process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if(!token){setMapFailed(true);return}
    let cancelled=false
    ;(async()=>{
      try{
        const mod=await import('mapbox-gl'); if(cancelled||!mapEl.current)return
        mod.default.accessToken=token
        const map=new mod.default.Map({container:mapEl.current,style:'mapbox://styles/mapbox/streets-v12',center:[-72.6843,19.4475],zoom:13,attributionControl:false})
        map.addControl(new mod.default.NavigationControl({showCompass:false}),'bottom-right'); mapRef.current=map
        if(navigator.geolocation){
          watchRef.current=navigator.geolocation.watchPosition(pos=>void applyPosition(pos),()=>setGpsStatus('error'),{enableHighAccuracy:true,maximumAge:1500,timeout:15000})
        } else setGpsStatus('error')
      }catch{if(!cancelled)setMapFailed(true)}
    })()
    return()=>{cancelled=true;if(watchRef.current!==null&&navigator.geolocation)navigator.geolocation.clearWatch(watchRef.current);driverMarkerRef.current?.remove();pickupMarkerRef.current?.remove();destinationMarkerRef.current?.remove();mapRef.current?.remove();mapRef.current=null}
  },[])

  useEffect(()=>{
    if(!effectiveRide||!navigator.geolocation)return
    setGpsStatus('waiting')
    navigator.geolocation.getCurrentPosition(pos=>void applyPosition(pos),()=>setGpsStatus('error'),{enableHighAccuracy:true,maximumAge:0,timeout:12000})
  },[effectiveRide?.id,effectiveRide?.status])

  const ht=typeof window!=='undefined'&&localStorage.getItem('taxi-language')==='ht'
  return <>
    <style>{`
      .dcu-home{margin:16px 0 10px}.dcu-map-shell{height:310px;border-radius:26px;overflow:hidden;position:relative;background:#eaf1ef;border:1px solid #dce7e3;box-shadow:0 10px 28px rgba(16,32,51,.08)}.dcu-map{width:100%;height:100%}.dcu-map-label{position:absolute;left:14px;top:14px;z-index:5;background:rgba(255,255,255,.96);border-radius:999px;padding:9px 13px;font-size:12px;font-weight:900;color:#102033;box-shadow:0 4px 14px rgba(0,0,0,.08)}.dcu-map-fallback{height:100%;display:grid;place-items:center;text-align:center;padding:20px;color:#617281;font-weight:800}.dcu-route-card{position:absolute;left:12px;right:12px;bottom:12px;z-index:5;background:rgba(255,255,255,.97);border:1px solid #dfe9e5;border-radius:18px;padding:11px 13px;box-shadow:0 8px 22px rgba(16,32,51,.14)}.dcu-route-top{display:flex;justify-content:space-between;align-items:center;gap:8px}.dcu-route-top strong{font-size:12px;color:#102033}.dcu-route-top span{font-size:12px;font-weight:950;color:#0f705a}.dcu-route-card p{margin:5px 0 0;font-size:10px;color:#60716a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dcu-gps-error{color:#b54747!important}.dcu-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:11px}.dcu-stat{background:#fff;border:1px solid #e0e8e5;border-radius:18px;padding:13px 9px;min-width:0;box-shadow:0 5px 16px rgba(16,32,51,.04)}.dcu-stat small,.dcu-stat strong{display:block}.dcu-stat small{font-size:9px;color:#7d8b98;font-weight:800}.dcu-stat strong{margin-top:6px;font-size:14px;color:#102033}.dcu-marker{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:#fff;border:4px solid #0f8065;box-shadow:0 0 0 9px rgba(15,128,101,.15),0 6px 16px rgba(0,0,0,.24);font-size:23px;z-index:20;animation:dcuPulse 1.7s ease-in-out infinite}.dcu-stop{width:31px;height:31px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:11px;font-weight:1000;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.2)}.dcu-stop.pickup{background:#2563eb}.dcu-stop.destination{background:#ef4444}@keyframes dcuPulse{0%,100%{box-shadow:0 0 0 6px rgba(15,128,101,.12),0 6px 16px rgba(0,0,0,.24)}50%{box-shadow:0 0 0 13px rgba(15,128,101,.04),0 6px 16px rgba(0,0,0,.24)}}@media(max-width:560px){.dcu-map-shell{height:295px}.dcu-stat{padding:12px 8px}.dcu-stat strong{font-size:13px}}
    `}</style>
    <section className="dcu-home">
      <div className="dcu-map-shell">
        <div className={`dcu-map-label ${gpsStatus==='error'?'dcu-gps-error':''}`}>{effectiveRide?(ht?'📍 Chofè → Pasaje':'📍 Chauffeur → Passager'):(ht?'📍 Pozisyon ou':'📍 Votre position')}</div>
        {mapFailed?<div className="dcu-map-fallback">{ht?'Kat GPS la pa disponib pou kounye a.':'La carte GPS est indisponible pour le moment.'}</div>:<div ref={mapEl} className="dcu-map"/>}
        {routeInfo&&<div className="dcu-route-card"><div className="dcu-route-top"><strong>{routeInfo.phase==='pickup'?(ht?'Distans ak pasaje a':'Distance du passager'):(ht?'Rete pou destinasyon':'Reste à destination')}</strong><span>{routeInfo.distanceKm.toFixed(1)} km · {routeInfo.durationMin} min</span></div><p>{routeInfo.instruction||(ht?'Swiv wout la sou kat la.':'Suivez l’itinéraire affiché sur la carte.')}</p></div>}
      </div>
      <div className="dcu-stats"><div className="dcu-stat"><small>{ht?'Revni jodi a':'Revenus aujourd’hui'}</small><strong>💰 {Math.round(todayEarnings).toLocaleString('fr-HT')} HTG</strong></div><div className="dcu-stat"><small>{ht?'Trajè jodi a':'Trajets aujourd’hui'}</small><strong>🚕 {todayTrips}</strong></div><div className="dcu-stat"><small>{ht?'Evalyasyon':'Évaluation'}</small><strong>★ {rating.toFixed(1)}</strong></div></div>
    </section>
  </>
}
