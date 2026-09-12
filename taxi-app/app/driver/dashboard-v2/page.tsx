'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type RideStatus = 'requested' | 'accepted' | 'driver_arriving' | 'in_progress' | 'completed' | 'cancelled'
type Ride = {
  id: string
  status: RideStatus
  pickup_address: string
  destination_address: string
  estimated_distance_km: number | null
  estimated_duration_min: number | null
  estimated_fare_htg: number | null
  service_type: string | null
  driver_id: string | null
  passenger_id: string
}

type Vehicle = { id:string; make:string; model:string; plate_number:string; color:string|null }
type DashboardRow = {
  full_name:string|null
  status:string|null
  is_online:boolean|null
  average_rating:number|string|null
  total_rides:number|null
  vehicle_id:string|null
  vehicle_make:string|null
  vehicle_model:string|null
  vehicle_plate_number:string|null
  vehicle_color:string|null
}

type StoredSession = { access_token:string; user?:{ id?:string } }

function parseSession(raw:string|null):StoredSession|null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    const session = parsed?.currentSession ?? parsed?.session ?? parsed
    return session?.access_token ? session : null
  } catch { return null }
}

function readSession():StoredSession|null {
  if (typeof window === 'undefined') return null
  const direct = parseSession(localStorage.getItem('movi-session')) || parseSession(localStorage.getItem('taxi-auth-default'))
  if (direct) return direct
  for (let i=0;i<localStorage.length;i+=1) {
    const key = localStorage.key(i)
    if (!key) continue
    const found = parseSession(localStorage.getItem(key))
    if (found?.access_token) return found
  }
  return null
}

async function rpc<T=unknown>(name:string, body:Record<string,unknown>={}) {
  const { data, error } = await supabase.rpc(name, body)
  if (error) throw error
  return data as T
}

export default function DriverDashboardV2Page() {
  const [authorized,setAuthorized] = useState(true)
  const [busy,setBusy] = useState(false)
  const [online,setOnline] = useState(false)
  const [message,setMessage] = useState('')
  const [name,setName] = useState('Chauffeur')
  const [rating,setRating] = useState(0)
  const [totalRides,setTotalRides] = useState(0)
  const [vehicle,setVehicle] = useState<Vehicle|null>(null)
  const [activeRide,setActiveRide] = useState<Ride|null>(null)
  const [available,setAvailable] = useState<Ride[]>([])
  const userIdRef = useRef<string|null>(null)
  const tokenRef = useRef<string|null>(null)

  useEffect(() => {
    const session = readSession()
    if (!session?.access_token) {
      setMessage('Session chauffeur introuvable. Déconnectez-vous puis reconnectez-vous.')
      return
    }
    tokenRef.current = session.access_token
    userIdRef.current = session.user?.id ?? null
    void refreshDashboard(false)
  }, [])

  function token() {
    if (tokenRef.current) return tokenRef.current
    const session = readSession()
    tokenRef.current = session?.access_token ?? null
    if (session?.user?.id) userIdRef.current = session.user.id
    return tokenRef.current
  }

  async function loadRides(userId=userIdRef.current,isOnline=online) {
    if (!userId) return
    try {
      const { data: mineRows } = await supabase.from('rides').select('*').eq('driver_id',userId).in('status',['accepted','driver_arriving','in_progress']).order('requested_at',{ascending:false}).limit(1)
      const mine = (mineRows?.[0] as Ride|undefined) ?? null
      setActiveRide(mine)
      if (!isOnline || mine) { setAvailable([]); return }
      const { data: requests } = await supabase.from('rides').select('*').eq('status','requested').is('driver_id',null).neq('passenger_id',userId).order('requested_at',{ascending:true}).limit(20)
      setAvailable((requests ?? []) as Ride[])
    } catch {}
  }

  async function refreshDashboard(showBusy=true) {
    if (showBusy) setBusy(true)
    setMessage('')
    try {
      const access = token()
      if (!access) throw new Error('Session chauffeur introuvable.')
      const response = await fetch('/api/driver/dashboard',{ headers:{Authorization:`Bearer ${access}`}, cache:'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || `Erreur ${response.status}`)
      const raw = payload?.driver ?? payload?.data
      const row:DashboardRow|undefined = Array.isArray(raw) ? raw[0] : raw
      if (!row || row.status !== 'approved') {
        setAuthorized(false)
        throw new Error('Ce compte n’est pas un chauffeur approuvé.')
      }
      setAuthorized(true)
      setName(row.full_name?.trim() || 'Chauffeur')
      setOnline(Boolean(row.is_online))
      setRating(Number(row.average_rating ?? 0))
      setTotalRides(Number(row.total_rides ?? 0))
      if (row.vehicle_id && row.vehicle_make && row.vehicle_model && row.vehicle_plate_number) {
        setVehicle({ id:row.vehicle_id, make:row.vehicle_make, model:row.vehicle_model, plate_number:row.vehicle_plate_number, color:row.vehicle_color })
      } else setVehicle(null)
      await loadRides(userIdRef.current,Boolean(row.is_online))
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Impossible de charger votre espace chauffeur.')
    } finally { if (showBusy) setBusy(false) }
  }

  async function toggleOnline() {
    if (busy) return
    setBusy(true); setMessage('')
    const next = !online
    try {
      await rpc('set_driver_online',{p_online:next})
      setOnline(next)
      setMessage(next ? 'Vous êtes maintenant en ligne.' : 'Vous êtes maintenant hors ligne.')
      await loadRides(userIdRef.current,next)
    } catch(e) { setMessage(e instanceof Error ? e.message : 'Impossible de modifier votre disponibilité.') }
    finally { setBusy(false) }
  }

  async function rideAction(action:'accept'|'arriving'|'start'|'complete',ride:Ride) {
    if (busy) return
    if (action==='accept' && !vehicle) { setMessage('Aucun véhicule actif n’est associé à ce compte.'); return }
    setBusy(true); setMessage('')
    try {
      if (action==='accept') await rpc('accept_ride',{p_ride_id:ride.id,p_vehicle_id:vehicle!.id})
      if (action==='arriving') await rpc('mark_driver_arriving',{p_ride_id:ride.id})
      if (action==='start') await rpc('start_ride',{p_ride_id:ride.id})
      if (action==='complete') await rpc('complete_ride',{p_ride_id:ride.id,p_final_fare_htg:ride.estimated_fare_htg ?? 0,p_payment_method:'cash'})
      await refreshDashboard(false)
    } catch(e) { setMessage(e instanceof Error ? e.message : 'Impossible de mettre à jour le trajet.') }
    finally { setBusy(false) }
  }

  const nextAction = activeRide?.status==='accepted'
    ? {key:'arriving' as const,label:'Je suis arrivé'}
    : activeRide?.status==='driver_arriving'
      ? {key:'start' as const,label:'Commencer le trajet'}
      : activeRide?.status==='in_progress'
        ? {key:'complete' as const,label:'Terminer le trajet'}
        : null

  if (!authorized) return <main className="drv2-page"><div className="drv2-shell"><div className="drv2-access"><div className="drv2-logo">M</div><h1>Accès chauffeur</h1><p>{message || 'Ce compte n’est pas un chauffeur approuvé.'}</p></div></div></main>

  return <main className="drv2-page">
    <div className="drv2-shell">
      <header className="drv2-topbar">
        <button className="menu drv2-menu" aria-label="Menu">☰</button>
        <div className="drv2-brand"><div className="drv2-logo">M</div><div><strong>MOVI</strong><span>Espace chauffeur</span></div></div>
        <div className="drv2-rating"><strong>★ {rating.toFixed(2)}</strong><span>{totalRides} trajets</span></div>
      </header>

      <section className="drv2-hero">
        <div><span className="drv2-kicker">BONJOUR</span><h1>{name}</h1></div>
        <div className={online ? 'drv2-pill online' : 'drv2-pill'}><span className="drv2-pulse"/>{online ? 'En ligne' : 'Hors ligne'}</div>
      </section>

      <section className="drv2-status-card">
        <div className="drv2-status-copy"><strong>{online ? 'Prêt à conduire' : 'Vous êtes hors ligne'}</strong><span>{online ? 'Les nouvelles demandes peuvent apparaître maintenant.' : 'Activez-vous pour recevoir des courses.'}</span></div>
        <button className={online ? 'drv2-switch on' : 'drv2-switch'} onClick={toggleOnline} disabled={busy} aria-label={online?'Passer hors ligne':'Passer en ligne'}><span/></button>
      </section>

      {vehicle && <section className="drv2-vehicle-strip"><span>🚙</span><div><small>VÉHICULE ACTIF</small><strong>{vehicle.make} {vehicle.model}</strong><em>{vehicle.plate_number}</em></div></section>}
      {message && <div className="drv2-message">{message}</div>}

      {activeRide && <section className="drv2-active-card">
        <div className="drv2-section-label">TRAJET EN COURS</div>
        <h2>{activeRide.destination_address}</h2>
        <p><b>Départ</b><span>{activeRide.pickup_address}</span></p>
        <div className="drv2-stats"><span>{activeRide.estimated_distance_km ?? '—'} km</span><span>{activeRide.estimated_duration_min ?? '—'} min</span><span>{activeRide.estimated_fare_htg ?? '—'} HTG</span></div>
        {nextAction && <button className="drv2-primary" disabled={busy} onClick={()=>rideAction(nextAction.key,activeRide)}>{nextAction.label}</button>}
      </section>}

      <section className="drv2-requests">
        <div className="drv2-section-head"><div><span className="drv2-kicker">COURSES</span><h2>Demandes disponibles</h2></div><button className="drv2-refresh" onClick={()=>refreshDashboard(true)} disabled={busy}>{busy?'...':'Actualiser'}</button></div>
        {!online ? <div className="drv2-empty"><span>🚘</span><strong>Passez en ligne</strong><p>Activez votre disponibilité pour recevoir les demandes proches de vous.</p></div>
          : available.length===0 ? <div className="drv2-empty"><span>🧭</span><strong>Aucune demande pour le moment</strong><p>Les nouvelles courses apparaîtront ici automatiquement.</p></div>
          : <div className="drv2-list">{available.map(ride=><article className="drv2-ride" key={ride.id}>
              <div className="drv2-ride-top"><div><small>DÉPART</small><strong>{ride.pickup_address}</strong></div><span>{ride.service_type ?? 'standard'}</span></div>
              <div className="drv2-route-line"/>
              <div className="drv2-destination"><small>DESTINATION</small><strong>{ride.destination_address}</strong></div>
              <div className="drv2-stats"><span>{ride.estimated_distance_km ?? '—'} km</span><span>{ride.estimated_duration_min ?? '—'} min</span><span>{ride.estimated_fare_htg ?? '—'} HTG</span></div>
              <button className="drv2-primary" disabled={busy || !vehicle} onClick={()=>rideAction('accept',ride)}>Accepter la course</button>
            </article>)}</div>}
      </section>
    </div>
  </main>
}
