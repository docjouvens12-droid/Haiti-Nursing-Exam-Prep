'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Map as MapboxMap, Marker as MapboxMarker } from 'mapbox-gl'

type ActiveRide={
  id:string
  status:'accepted'|'driver_arriving'|'in_progress'
  pickup_address:string
  pickup_latitude:number
  pickup_longitude:number
  destination_address:string
  destination_latitude:number
  destination_longitude:number
}

type RouteInfo={distanceKm:number;durationMin:number;instruction:string;phase:'pickup'|'destination'}

type RouteResponse={routes?:Array<{distance:number;duration:number;geometry:{coordinates:[number,number][];type:'LineString'};legs?:Array<{steps?:Array<{maneuver?:{instruction?:string}}>}>>}>}

function metersBetween(a:[number,number],b:[number,number]){
  const R=6371000
  const rad=(v:number)=>v*Math.PI/180
  const dLat=rad(b[1]-a[1]);const dLon=rad(b[0]-a[0])
  const x=Math.sin(dLat/2)**2+Math.cos(rad(a[1]))*Math.cos(rad(b[1]))*Math.sin(dLon/2)**2
  return 2*R*Math.asin(Math.sqrt(x))
}

export default function DriverCleanUberBoltHome(){
  const [todayTrips,setTodayTrips]=useState(0)
  const [todayEarnings,setTodayEarnings]=useState(0)
  const [rating,setRating]=useState(0)
  const [mapFailed,setMapFailed]=useState(false)
  const [activeRide,setActiveRide]=useState<ActiveRide|null>(null)
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
  const activeRideRef=useRef<ActiveRide|null>(null)

  useEffect(()=>{activeRideRef.current=activeRide},[activeRide])

  useEffect(()=>{
    let cancelled=false
    const load=async()=>{
      const {data:auth}=await supabase.auth.getUser()
      const user=auth.user
      if(!user||cancelled)return
      const start=new Date();start.setHours(0,0,0,0)
      const [{data:driver},{data:rides},{data:mineRows}]=await Promise.all([
        supabase.from('driver_profiles').select('average_rating').eq('user_id',user.id).maybeSingle(),
        supabase.from('rides').select('id,final_fare_htg').eq('driver_id',user.id).eq('status','completed').gte('completed_at',start.toISOString()),
        supabase.from('rides').select('id,status,pickup_address,pickup_latitude,pickup_longitude,destination_address,destination_latitude,destination_longitude').eq('driver_id',user.id).in('status',['accepted','driver_arriving','in_progress']).order('requested_at',{ascending:false}).limit(1)
      ])
      if(cancelled)return
      setRating(Number(driver?.average_rating||0))
      const rows=rides||[]
      setTodayTrips(rows.length)
      if(rows.length){
        const {data:payments}=await supabase.from('payments').select('ride_id,driver_net_htg').in('ride_id',rows.map(r=>r.id))
        const netByRide=new Map((payments||[]).map(p=>[p.ride_id,Number(p.driver_net_htg||0)]))
        setTodayEarnings(rows.reduce((sum,r)=>sum+(netByRide.get(r.id)??Number(r.final_fare_htg||0)*0.85),0))
      }else setTodayEarnings(0)
      setActiveRide((mineRows?.[0]||null) as ActiveRide|null)
    }
    void load()
    const timer=window.setInterval(()=>void load(),5000)
    return()=>{cancelled=true;window.clearInterval(timer)}
  },[])

  async function drawRoute(driverPoint:[number,number],ride:ActiveRide,force=false){
    const map=mapRef.current
    const token=process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if(!map||!token)return
    const now=Date.now()
    const moved=lastRoutePointRef.current?metersBetween(lastRoutePointRef.current,driverPoint):Infinity
    if(!force&&moved<45&&now-lastRouteAtRef.current<12000)return
    lastRoutePointRef.current=driverPoint
    lastRouteAtRef.current=now

    const phase:RouteInfo['phase']=ride.status==='in_progress'?'destination':'pickup'
    const end:[number,number]=phase==='pickup'
      ? [Number(ride.pickup_longitude),Number(ride.pickup_latitude)]
      : [Number(ride.destination_longitude),Number(ride.destination_latitude)]

    try{
      const url=`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${driverPoint[0]},${driverPoint[1]};${end[0]},${end[1]}?alternatives=false&geometries=geojson&overview=full&steps=true&language=fr&access_token=${encodeURIComponent(token)}`
      const response=await fetch(url,{cache:'no-store'})
      if(!response.ok)throw new Error('route')
      const data=await response.json() as RouteResponse
      const route=data.routes?.[0]
      if(!route)return
      const geojson={type:'Feature' as const,properties:{},geometry:route.geometry}
      const source=map.getSource('driver-live-route') as {setData?:(data:unknown)=>void}|undefined
      if(source?.setData) source.setData(geojson)
      else if(map.isStyleLoaded()){
        map.addSource('driver-live-route',{type:'geojson',data:geojson})
        map.addLayer({id:'driver-live-route-line',type:'line',source:'driver-live-route',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#0F705A','line-width':7,'line-opacity':.9}})
      }
      const instruction=route.legs?.[0]?.steps?.find(step=>step.maneuver?.instruction)?.maneuver?.instruction||''
      setRouteInfo({distanceKm:route.distance/1000,durationMin:Math.max(1,Math.round(route.duration/60)),instruction,phase})
      const coords=route.geometry.coordinates
      if(coords.length>1){
        const mod=await import('mapbox-gl')
        const bounds=coords.reduce((b,c)=>b.extend(c),new mod.default.LngLatBounds(coords[0],coords[0]))
        map.fitBounds(bounds,{padding:{top:70,bottom:90,left:45,right:45},duration:700,maxZoom:16})
      }
    }catch{}
  }

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
          watchRef.current=navigator.geolocation.watchPosition(async pos=>{
            setGpsStatus('ok')
            const point:[number,number]=[pos.coords.longitude,pos.coords.latitude]
            if(!driverMarkerRef.current){
              const el=document.createElement('div');el.className='dcu-marker';el.textContent='🚕'
              driverMarkerRef.current=new mod.default.Marker({element:el,rotationAlignment:'map'}).setLngLat(point).addTo(map)
            }else driverMarkerRef.current.setLngLat(point)

            const user=(await supabase.auth.getUser()).data.user
            if(user){
              void supabase.from('driver_locations').upsert({driver_id:user.id,latitude:pos.coords.latitude,longitude:pos.coords.longitude,heading:Number.isFinite(pos.coords.heading)?pos.coords.heading:null,speed_kph:Number.isFinite(pos.coords.speed)?Math.max(0,(pos.coords.speed||0)*3.6):null,updated_at:new Date().toISOString()},{onConflict:'driver_id'})
            }

            const ride=activeRideRef.current
            if(ride){
              const pickup:[number,number]=[Number(ride.pickup_longitude),Number(ride.pickup_latitude)]
              const dest:[number,number]=[Number(ride.destination_longitude),Number(ride.destination_latitude)]
              if(!pickupMarkerRef.current){
                const el=document.createElement('div');el.className='dcu-stop pickup';el.textContent='P'
                pickupMarkerRef.current=new mod.default.Marker({element:el}).setLngLat(pickup).addTo(map)
              }else pickupMarkerRef.current.setLngLat(pickup)
              if(!destinationMarkerRef.current){
                const el=document.createElement('div');el.className='dcu-stop destination';el.textContent='D'
                destinationMarkerRef.current=new mod.default.Marker({element:el}).setLngLat(dest).addTo(map)
              }else destinationMarkerRef.current.setLngLat(dest)
              void drawRoute(point,ride)
            }else{
              setRouteInfo(null)
              pickupMarkerRef.current?.remove();pickupMarkerRef.current=null
              destinationMarkerRef.current?.remove();destinationMarkerRef.current=null
              if(map.getLayer('driver-live-route-line'))map.removeLayer('driver-live-route-line')
              if(map.getSource('driver-live-route'))map.removeSource('driver-live-route')
              map.easeTo({center:point,zoom:14,duration:700})
            }
          },()=>setGpsStatus('error'),{enableHighAccuracy:true,maximumAge:3000,timeout:15000})
        }else setGpsStatus('error')
      }catch{if(!cancelled)setMapFailed(true)}
    })()
    return()=>{
      cancelled=true
      if(watchRef.current!==null&&navigator.geolocation)navigator.geolocation.clearWatch(watchRef.current)
      driverMarkerRef.current?.remove();pickupMarkerRef.current?.remove();destinationMarkerRef.current?.remove();mapRef.current?.remove();mapRef.current=null
    }
  },[])

  useEffect(()=>{
    const ride=activeRide
    const marker=driverMarkerRef.current
    if(!ride||!marker)return
    const p=marker.getLngLat()
    void drawRoute([p.lng,p.lat],ride,true)
  },[activeRide?.id,activeRide?.status])

  const ht=typeof window!=='undefined'&&localStorage.getItem('taxi-language')==='ht'
  return <>
    <style>{`
      .dcu-home{margin:16px 0 10px}.dcu-map-shell{height:310px;border-radius:26px;overflow:hidden;position:relative;background:#eaf1ef;border:1px solid #dce7e3;box-shadow:0 10px 28px rgba(16,32,51,.08)}.dcu-map{width:100%;height:100%}.dcu-map-label{position:absolute;left:14px;top:14px;z-index:3;background:rgba(255,255,255,.96);backdrop-filter:blur(8px);border-radius:999px;padding:9px 13px;font-size:12px;font-weight:900;color:#102033;box-shadow:0 4px 14px rgba(0,0,0,.08);border:1px solid rgba(15,112,90,.12)}.dcu-map-fallback{height:100%;display:grid;place-items:center;text-align:center;padding:20px;color:#617281;font-weight:800}.dcu-route-card{position:absolute;left:12px;right:12px;bottom:12px;z-index:3;background:rgba(255,255,255,.97);backdrop-filter:blur(8px);border:1px solid #dfe9e5;border-radius:18px;padding:11px 13px;box-shadow:0 8px 22px rgba(16,32,51,.14)}.dcu-route-top{display:flex;justify-content:space-between;align-items:center;gap:8px}.dcu-route-top strong{font-size:12px;color:#102033}.dcu-route-top span{font-size:11px;font-weight:900;color:#0f705a}.dcu-route-card p{margin:5px 0 0;font-size:10px;color:#60716a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dcu-gps-error{color:#b54747!important}.dcu-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:11px}.dcu-stat{background:#fff;border:1px solid #e0e8e5;border-radius:18px;padding:13px 9px;min-width:0;box-shadow:0 5px 16px rgba(16,32,51,.04)}.dcu-stat small,.dcu-stat strong{display:block}.dcu-stat small{font-size:9px;color:#7d8b98;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dcu-stat strong{margin-top:6px;font-size:14px;color:#102033}.dcu-stat strong span{margin-right:3px}.dcu-marker{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#fff;border:3px solid #0f705a;box-shadow:0 5px 14px rgba(0,0,0,.2);font-size:21px}.dcu-stop{width:31px;height:31px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:11px;font-weight:1000;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.2)}.dcu-stop.pickup{background:#102033}.dcu-stop.destination{background:#0f705a}@media(max-width:560px){.dcu-map-shell{height:295px}.dcu-stat{padding:12px 8px}.dcu-stat strong{font-size:13px}}
    `}</style>
    <section className="dcu-home">
      <div className="dcu-map-shell">
        <div className={`dcu-map-label ${gpsStatus==='error'?'dcu-gps-error':''}`}>{gpsStatus==='error'?(ht?'⚠️ GPS pa disponib':'⚠️ GPS indisponible'):(ht?'📍 Pozisyon ou':'📍 Votre position')}</div>
        {mapFailed?<div className="dcu-map-fallback">{ht?'Kat GPS la pa disponib pou kounye a.':'La carte GPS est indisponible pour le moment.'}</div>:<div ref={mapEl} className="dcu-map"/>}
        {routeInfo&&<div className="dcu-route-card"><div className="dcu-route-top"><strong>{routeInfo.phase==='pickup'?(ht?'Ale pran pasaje a':'Vers le passager'):(ht?'Ale nan destinasyon':'Vers la destination')}</strong><span>{routeInfo.distanceKm.toFixed(1)} km · {routeInfo.durationMin} min</span></div><p>{routeInfo.instruction||(ht?'Swiv wout ki make sou kat la.':'Suivez l’itinéraire affiché sur la carte.')}</p></div>}
      </div>
      <div className="dcu-stats"><div className="dcu-stat"><small>{ht?'Revni jodi a':'Revenus aujourd’hui'}</small><strong><span>💰</span>{Math.round(todayEarnings).toLocaleString('fr-HT')} HTG</strong></div><div className="dcu-stat"><small>{ht?'Trajè jodi a':'Trajets aujourd’hui'}</small><strong><span>🚕</span>{todayTrips}</strong></div><div className="dcu-stat"><small>{ht?'Evalyasyon':'Évaluation'}</small><strong><span>★</span>{rating.toFixed(1)}</strong></div></div>
    </section>
  </>
}
