'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Lang = 'fr' | 'ht'
type RideStatus = 'requested' | 'accepted' | 'driver_arriving' | 'in_progress' | 'completed' | 'cancelled'

type Ride = {
  id: string
  status: RideStatus
  pickup_address: string
  destination_address: string
  estimated_distance_km: number | null
  estimated_duration_min: number | null
  estimated_fare_htg: number | null
  final_fare_htg: number | null
  requested_at: string
  passenger_id: string
  driver_id: string | null
  vehicle_id: string | null
  service_type: string | null
}

type Vehicle = {
  id: string
  vehicle_type: string | null
  make: string
  model: string
  plate_number: string
  is_active: boolean
}

const copy = {
  fr: {
    title: 'Espace chauffeur', subtitle: 'Gérez votre disponibilité et vos trajets', online: 'En ligne', offline: 'Hors ligne', goOnline: 'Passer en ligne', goOffline: 'Passer hors ligne', available: 'Demandes disponibles', activeRide: 'Trajet en cours', noRequests: 'Aucune demande disponible pour le moment.', waitingOnline: 'Passez en ligne pour recevoir les demandes.', pickup: 'Prise en charge', destination: 'Destination', fare: 'Prix estimé', distance: 'Distance', duration: 'Durée', accept: 'Accepter', arriving: 'Je suis arrivé', start: 'Commencer le trajet', complete: 'Terminer le trajet', refresh: 'Actualiser', logout: 'Se déconnecter', notDriver: 'Ce compte n’est pas un chauffeur approuvé.', loading: 'Chargement…', vehicle: 'Véhicule', gpsOn: 'Position GPS active', gpsOff: 'Position GPS indisponible', error: 'Une erreur est survenue.', completed: 'Trajet terminé.', accepted: 'Trajet accepté.', arrivingMsg: 'Statut mis à jour : chauffeur arrivé.', started: 'Trajet démarré.', onlineConfirmed: 'Vous êtes maintenant en ligne.', offlineConfirmed: 'Vous êtes maintenant hors ligne.', gpsPermission: 'Autorisez la localisation sur votre iPhone pour partager votre position.'
  },
  ht: {
    title: 'Espas chofè', subtitle: 'Jere disponiblite ou ak trajè ou yo', online: 'Sou liy', offline: 'Pa sou liy', goOnline: 'Mete m sou liy', goOffline: 'Retire m sou liy', available: 'Demann trajè ki disponib', activeRide: 'Trajè aktyèl', noRequests: 'Pa gen demann trajè pou kounye a.', waitingOnline: 'Mete tèt ou sou liy pou resevwa demann.', pickup: 'Kote pou pran pasaje a', destination: 'Destinasyon', fare: 'Pri estime', distance: 'Distans', duration: 'Dire', accept: 'Aksepte', arriving: 'Mwen rive', start: 'Kòmanse trajè a', complete: 'Fini trajè a', refresh: 'Rafrechi', logout: 'Dekonekte', notDriver: 'Kont sa a pa yon chofè ki apwouve.', loading: 'N ap chaje…', vehicle: 'Veyikil', gpsOn: 'Pozisyon GPS aktif', gpsOff: 'Pozisyon GPS pa disponib', error: 'Gen yon erè ki fèt.', completed: 'Trajè a fini.', accepted: 'Trajè a aksepte.', arrivingMsg: 'Estati a chanje: chofè a rive.', started: 'Trajè a kòmanse.', onlineConfirmed: 'Ou sou liy kounye a.', offlineConfirmed: 'Ou pa sou liy kounye a.', gpsPermission: 'Bay aplikasyon an pèmisyon Location sou iPhone pou pataje pozisyon ou.'
  }
}

export default function DriverDashboardPage() {
  const [lang, setLang] = useState<Lang>('fr')
  const t = copy[lang]
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [online, setOnline] = useState(false)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [available, setAvailable] = useState<Ride[]>([])
  const [activeRide, setActiveRide] = useState<Ride | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [gpsActive, setGpsActive] = useState(false)
  const userIdRef = useRef<string | null>(null)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('taxi-language') as Lang | null
    if (saved === 'fr' || saved === 'ht') setLang(saved)
    void init()
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  async function init() {
    setBusy(true)
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      location.href = '/'
      return
    }
    userIdRef.current = auth.user.id

    const { data: driver } = await supabase.from('driver_profiles').select('status,is_online').eq('user_id', auth.user.id).maybeSingle()
    if (!driver || driver.status !== 'approved') {
      setAuthorized(false)
      setBusy(false)
      return
    }

    const { data: v } = await supabase.from('vehicles').select('id,vehicle_type,make,model,plate_number,is_active').eq('driver_id', auth.user.id).eq('is_active', true).order('created_at', { ascending: true }).limit(1).maybeSingle()
    setVehicle((v ?? null) as Vehicle | null)
    const currentOnline = Boolean(driver.is_online)
    setOnline(currentOnline)
    setAuthorized(true)
    if (currentOnline) startGpsWatch()
    await loadRides(auth.user.id, currentOnline)
    setBusy(false)
  }

  async function loadRides(userId = userIdRef.current, isOnline = online) {
    if (!userId) return
    const { data: mine } = await supabase.from('rides').select('*').eq('driver_id', userId).in('status', ['accepted','driver_arriving','in_progress']).order('requested_at', { ascending: false }).limit(1).maybeSingle()
    setActiveRide((mine ?? null) as Ride | null)

    if (!isOnline || mine) {
      setAvailable([])
      return
    }

    const { data: requests } = await supabase.from('rides').select('*').eq('status', 'requested').is('driver_id', null).order('requested_at', { ascending: true }).limit(20)
    setAvailable((requests ?? []) as Ride[])
  }

  function startGpsWatch() {
    if (!navigator.geolocation) {
      setGpsActive(false)
      setMessage(t.gpsPermission)
      return
    }
    if (watchIdRef.current !== null) return
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsActive(true)
        void supabase.rpc('update_driver_location', {
          p_latitude: pos.coords.latitude,
          p_longitude: pos.coords.longitude,
          p_heading: pos.coords.heading ?? null,
          p_speed_kph: pos.coords.speed == null ? null : pos.coords.speed * 3.6,
        })
      },
      () => {
        setGpsActive(false)
        setMessage(t.gpsPermission)
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    )
  }

  function stopGpsWatch() {
    if (watchIdRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current)
    watchIdRef.current = null
    setGpsActive(false)
  }

  async function toggleOnline() {
    if (busy) return
    const previous = online
    const requested = !previous
    setBusy(true)
    setMessage('')

    // Optimistic UI so iPhone gives immediate visual feedback.
    setOnline(requested)
    if (requested) startGpsWatch()
    else stopGpsWatch()

    const { error } = await supabase.rpc('set_driver_online', { p_online: requested })
    if (error) {
      setOnline(previous)
      if (previous) startGpsWatch()
      else stopGpsWatch()
      setMessage(error.message)
      setBusy(false)
      return
    }

    // Re-read the backend state so the screen always matches Supabase.
    const userId = userIdRef.current
    let confirmed = requested
    if (userId) {
      const { data: driver, error: refreshError } = await supabase
        .from('driver_profiles')
        .select('is_online')
        .eq('user_id', userId)
        .maybeSingle()
      if (!refreshError && driver) confirmed = Boolean(driver.is_online)
    }

    setOnline(confirmed)
    if (confirmed) startGpsWatch()
    else stopGpsWatch()
    setMessage(confirmed ? t.onlineConfirmed : t.offlineConfirmed)
    await loadRides(userIdRef.current, confirmed)
    setBusy(false)
  }

  async function rideAction(action: 'accept' | 'arriving' | 'start' | 'complete', ride: Ride) {
    if (!vehicle && action === 'accept') return
    setBusy(true); setMessage('')
    let error: any = null
    if (action === 'accept') ({ error } = await supabase.rpc('accept_ride', { p_ride_id: ride.id, p_vehicle_id: vehicle!.id }))
    if (action === 'arriving') ({ error } = await supabase.rpc('mark_driver_arriving', { p_ride_id: ride.id }))
    if (action === 'start') ({ error } = await supabase.rpc('start_ride', { p_ride_id: ride.id }))
    if (action === 'complete') ({ error } = await supabase.rpc('complete_ride', { p_ride_id: ride.id, p_final_fare_htg: ride.estimated_fare_htg ?? 0, p_payment_method: 'cash' }))

    if (error) setMessage(error.message)
    else {
      setMessage(action === 'accept' ? t.accepted : action === 'arriving' ? t.arrivingMsg : action === 'start' ? t.started : t.completed)
      await loadRides(userIdRef.current, online)
    }
    setBusy(false)
  }

  async function logout() {
    if (online) await supabase.rpc('set_driver_online', { p_online: false })
    stopGpsWatch()
    await supabase.auth.signOut()
    location.href = '/'
  }

  function changeLang(next: Lang) {
    setLang(next)
    localStorage.setItem('taxi-language', next)
  }

  const statusAction = useMemo(() => {
    if (!activeRide) return null
    if (activeRide.status === 'accepted') return { key: 'arriving' as const, label: t.arriving }
    if (activeRide.status === 'driver_arriving') return { key: 'start' as const, label: t.start }
    if (activeRide.status === 'in_progress') return { key: 'complete' as const, label: t.complete }
    return null
  }, [activeRide, t])

  if (authorized === null) return <main className="page"><section className="card"><p>{t.loading}</p></section></main>
  if (!authorized) return <main className="page"><section className="card"><h1>{t.title}</h1><div className="message error">{t.notDriver}</div><button className="primary" onClick={() => location.href='/driver'}>←</button></section></main>

  return <main className="page"><section className="card">
    <div className="topbar">
      <div className="brand"><span>T</span><div><strong>Taxi Platform Haiti</strong><small>{t.subtitle}</small></div></div>
      <div className="top-actions"><select value={lang} onChange={(e)=>changeLang(e.target.value as Lang)}><option value="fr">Français</option><option value="ht">Kreyòl</option></select><button className="logout" onClick={()=>void logout()}>{t.logout}</button></div>
    </div>

    <h1>{t.title}</h1>

    <div className="status-card">
      <div><span className={`dot ${online ? 'on' : ''}`}></span><strong>{online ? t.online : t.offline}</strong><small>{gpsActive ? t.gpsOn : t.gpsOff}</small></div>
      <button className={online ? 'offline-btn' : 'online-btn'} onClick={()=>void toggleOnline()} disabled={busy}>{online ? t.goOffline : t.goOnline}</button>
    </div>

    {vehicle && <div className="vehicle"><span>{vehicle.vehicle_type === 'moto' ? '🏍️' : '🚕'}</span><div><small>{t.vehicle}</small><strong>{vehicle.make} {vehicle.model} · {vehicle.plate_number}</strong></div></div>}
    {message && <div className="message">{message}</div>}

    {activeRide && <section className="section"><div className="section-title"><h2>{t.activeRide}</h2><span className="pill">{activeRide.status}</span></div><RideCard ride={activeRide} t={t} />{statusAction && <button className="primary action" disabled={busy} onClick={()=>void rideAction(statusAction.key, activeRide)}>{statusAction.label}</button>}</section>}

    {!activeRide && <section className="section"><div className="section-title"><h2>{t.available}</h2><button className="refresh" onClick={()=>void loadRides()} disabled={busy}>↻ {t.refresh}</button></div>{!online ? <div className="empty">{t.waitingOnline}</div> : available.length === 0 ? <div className="empty">{t.noRequests}</div> : <div className="rides">{available.map(r => <div className="ride-wrap" key={r.id}><RideCard ride={r} t={t}/><button className="primary" disabled={busy || !vehicle} onClick={()=>void rideAction('accept', r)}>{t.accept}</button></div>)}</div>}</section>}
  </section>

  <style jsx>{`
    .page{min-height:100vh;background:linear-gradient(160deg,#e5f1ed,#eef2f7 50%,#e7edf3);padding:22px;color:#102033;font-family:Inter,system-ui,sans-serif}.card{width:min(100%,760px);margin:auto;background:#fff;border-radius:28px;padding:22px;box-shadow:0 24px 70px rgba(18,36,61,.14)}.topbar{display:flex;justify-content:space-between;gap:12px;align-items:center}.brand{display:flex;align-items:center;gap:10px}.brand>span{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:#0f6f59;color:#fff;font-weight:900}.brand strong,.brand small{display:block}.brand small{color:#77879a;margin-top:2px}.top-actions{display:flex;gap:8px}.top-actions select,.logout{border:1px solid #dce4eb;border-radius:12px;background:#fff;padding:9px 11px}.logout{color:#9a3030;font-weight:850}.card h1{font-size:32px;margin:24px 0 18px}.status-card{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#f4f8f7;border-radius:18px;padding:16px;margin-bottom:12px}.status-card>div{display:grid;grid-template-columns:auto 1fr;column-gap:8px}.status-card small{grid-column:2;color:#78889a}.dot{width:12px;height:12px;border-radius:50%;background:#9aabba;margin-top:4px}.dot.on{background:#16a36f}.online-btn,.offline-btn,.primary,.refresh{border:0;border-radius:14px;padding:12px 16px;font-weight:900}.online-btn,.primary{background:#0f6f59;color:#fff}.offline-btn{background:#fff0f0;color:#a02d2d}.vehicle{display:flex;gap:10px;align-items:center;padding:13px 15px;border:1px solid #e0e7ed;border-radius:16px;margin-bottom:14px}.vehicle span{font-size:24px}.vehicle small,.vehicle strong{display:block}.vehicle small{color:#7a8998}.message{padding:12px 14px;border-radius:13px;background:#eef7f4;color:#115f4d;font-weight:750;margin-bottom:12px}.message.error{background:#fff0f0;color:#9b3030}.section{margin-top:20px}.section-title{display:flex;justify-content:space-between;align-items:center;gap:10px}.section h2{font-size:20px}.pill{font-size:11px;font-weight:900;background:#eef3f7;border-radius:999px;padding:7px 10px}.refresh{background:#102033;color:#fff}.empty{padding:28px;border:1px dashed #d4dee7;border-radius:18px;text-align:center;color:#7a8998}.rides{display:grid;gap:14px}.ride-wrap{border:1px solid #dfe6ed;border-radius:20px;padding:14px}.ride-wrap>.primary{width:100%;margin-top:12px}.action{width:100%;margin-top:12px}@media(max-width:600px){.page{padding:0}.card{min-height:100vh;border-radius:0;padding:18px 16px}.topbar{align-items:flex-start}.top-actions{flex-direction:column}.card h1{font-size:28px}.status-card{align-items:flex-start;flex-direction:column}.status-card button{width:100%}}
  `}</style>
  </main>
}

function RideCard({ ride, t }: { ride: Ride; t: any }) {
  return <article className="ride-card">
    <div className="row"><span>📍</span><div><small>{t.pickup}</small><strong>{ride.pickup_address}</strong></div></div>
    <div className="row"><span>🏁</span><div><small>{t.destination}</small><strong>{ride.destination_address}</strong></div></div>
    <div className="metrics"><div><small>{t.distance}</small><strong>{ride.estimated_distance_km != null ? `${Number(ride.estimated_distance_km).toFixed(1)} km` : '—'}</strong></div><div><small>{t.duration}</small><strong>{ride.estimated_duration_min != null ? `${ride.estimated_duration_min} min` : '—'}</strong></div><div><small>{t.fare}</small><strong>{ride.estimated_fare_htg != null ? `${Math.round(Number(ride.estimated_fare_htg))} HTG` : '—'}</strong></div></div>
    <style jsx>{`.ride-card{display:grid;gap:12px}.row{display:flex;gap:10px;align-items:flex-start}.row>span{font-size:20px}.row small,.row strong{display:block}.row small,.metrics small{color:#7a8998;font-size:11px}.row strong{margin-top:2px}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.metrics>div{background:#f6f8fa;border-radius:13px;padding:10px}.metrics small,.metrics strong{display:block}.metrics strong{margin-top:3px;font-size:13px}@media(max-width:520px){.metrics{grid-template-columns:1fr 1fr}.metrics>div:last-child{grid-column:1/-1}}`}</style>
  </article>
}