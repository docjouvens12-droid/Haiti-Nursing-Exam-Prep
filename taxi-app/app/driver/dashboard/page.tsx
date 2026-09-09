'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import DriverNavigationMap from '../../../components/DriverNavigationMap'

type Lang = 'fr' | 'ht'
type RideStatus = 'requested' | 'accepted' | 'driver_arriving' | 'in_progress' | 'completed' | 'cancelled'

type Ride = {
  id: string
  status: RideStatus
  pickup_address: string
  destination_address: string
  pickup_latitude: number | null
  pickup_longitude: number | null
  destination_latitude: number | null
  destination_longitude: number | null
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
  color: string | null
  plate_number: string
  is_active: boolean
}

const copy = {
  fr: {
    title: 'Espace chauffeur', subtitle: 'Gérez votre disponibilité et vos trajets', online: 'En ligne', offline: 'Hors ligne', goOnline: 'Passer en ligne', goOffline: 'Passer hors ligne', available: 'Demandes disponibles', activeRide: 'Trajet en cours', noRequests: 'Aucune demande disponible pour le moment.', waitingOnline: 'Passez en ligne pour recevoir les demandes.', pickup: 'Prise en charge', destination: 'Destination', fare: 'Prix estimé', distance: 'Distance', duration: 'Durée', service: 'Service', accept: 'Accepter', arriving: 'Je suis arrivé', start: 'Commencer le trajet', complete: 'Terminer le trajet', refresh: 'Actualiser', logout: 'Se déconnecter', notDriver: 'Ce compte n’est pas un chauffeur approuvé.', loading: 'Chargement…', vehicle: 'Véhicule', gpsOn: 'Position GPS active', gpsOff: 'Position GPS indisponible', completed: 'Trajet terminé.', accepted: 'Trajet accepté.', arrivingMsg: 'Statut mis à jour : chauffeur arrivé.', started: 'Trajet démarré.', onlineConfirmed: 'Vous êtes maintenant en ligne.', offlineConfirmed: 'Vous êtes maintenant hors ligne.', gpsPermission: 'Autorisez la localisation sur votre iPhone pour partager votre position.', rating: 'Note chauffeur', trips: 'trajet', personal: 'Informations personnelles', language: 'Langue', email: 'E-mail', phone: 'Téléphone', color: 'Couleur', plate: 'Plaque', model: 'Modèle'
  },
  ht: {
    title: 'Espas chofè', subtitle: 'Jere disponiblite ou ak trajè ou yo', online: 'Sou liy', offline: 'Pa sou liy', goOnline: 'Mete m sou liy', goOffline: 'Retire m sou liy', available: 'Demann trajè ki disponib', activeRide: 'Trajè aktyèl', noRequests: 'Pa gen demann trajè pou kounye a.', waitingOnline: 'Mete tèt ou sou liy pou resevwa demann.', pickup: 'Kote pou pran pasaje a', destination: 'Destinasyon', fare: 'Pri estime', distance: 'Distans', duration: 'Dire', service: 'Sèvis', accept: 'Aksepte', arriving: 'Mwen rive', start: 'Kòmanse trajè a', complete: 'Fini trajè a', refresh: 'Rafrechi', logout: 'Dekonekte', notDriver: 'Kont sa a pa yon chofè ki apwouve.', loading: 'N ap chaje…', vehicle: 'Veyikil', gpsOn: 'Pozisyon GPS aktif', gpsOff: 'Pozisyon GPS pa disponib', completed: 'Trajè a fini.', accepted: 'Trajè a aksepte.', arrivingMsg: 'Estati a chanje: chofè a rive.', started: 'Trajè a kòmanse.', onlineConfirmed: 'Ou sou liy kounye a.', offlineConfirmed: 'Ou pa sou liy kounye a.', gpsPermission: 'Bay aplikasyon an pèmisyon Location sou iPhone pou pataje pozisyon ou.', rating: 'Nòt chofè', trips: 'trajè', personal: 'Enfòmasyon pèsonèl', language: 'Lang', email: 'Imèl', phone: 'Telefòn', color: 'Koulè', plate: 'Plak', model: 'Modèl'
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
  const [averageRating, setAverageRating] = useState(0)
  const [totalRides, setTotalRides] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [driverEmail, setDriverEmail] = useState('')
  const [driverAvatar, setDriverAvatar] = useState('')
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

  useEffect(() => {
    if (authorized !== true) return
    const channel = supabase
      .channel(`driver-rides-${userIdRef.current ?? 'active'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => {
        void loadRides(userIdRef.current, online)
      })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [authorized, online])

  async function init() {
    setBusy(true)
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) { location.href = '/driver/login?test=haiti'; return }
    userIdRef.current = auth.user.id
    setDriverEmail(auth.user.email ?? '')

    const [{ data: driver }, { data: profile }] = await Promise.all([
      supabase.from('driver_profiles').select('status,is_online,average_rating,total_rides').eq('user_id', auth.user.id).maybeSingle(),
      supabase.from('profiles').select('full_name,phone,avatar_url').eq('id', auth.user.id).maybeSingle(),
    ])
    if (!driver || driver.status !== 'approved') { setAuthorized(false); setBusy(false); return }

    setDriverName(profile?.full_name ?? auth.user.user_metadata?.full_name ?? '')
    setDriverPhone(profile?.phone ?? '')
    setDriverAvatar(profile?.avatar_url ?? '')
    setAverageRating(Number(driver.average_rating ?? 0))
    setTotalRides(Number(driver.total_rides ?? 0))

    const { data: v } = await supabase.from('vehicles').select('id,vehicle_type,make,model,color,plate_number,is_active').eq('driver_id', auth.user.id).eq('is_active', true).order('created_at', { ascending: true }).limit(1).maybeSingle()
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
    if (!isOnline || mine) { setAvailable([]); return }
    const { data: requests } = await supabase.from('rides').select('*').eq('status', 'requested').is('driver_id', null).neq('passenger_id', userId).order('requested_at', { ascending: true }).limit(20)
    setAvailable((requests ?? []) as Ride[])
  }

  function startGpsWatch() {
    if (!navigator.geolocation) { setGpsActive(false); setMessage(t.gpsPermission); return }
    if (watchIdRef.current !== null) return
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsActive(true)
        void supabase.rpc('update_driver_location', { p_latitude: pos.coords.latitude, p_longitude: pos.coords.longitude, p_heading: pos.coords.heading ?? null, p_speed_kph: pos.coords.speed == null ? null : pos.coords.speed * 3.6 })
      },
      () => { setGpsActive(false); setMessage(t.gpsPermission) },
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
    setBusy(true); setMessage(''); setOnline(requested)
    if (requested) startGpsWatch(); else stopGpsWatch()
    const { error } = await supabase.rpc('set_driver_online', { p_online: requested })
    if (error) {
      setOnline(previous); if (previous) startGpsWatch(); else stopGpsWatch(); setMessage(error.message); setBusy(false); return
    }
    const userId = userIdRef.current
    let confirmed = requested
    if (userId) {
      const { data: driver } = await supabase.from('driver_profiles').select('is_online,average_rating,total_rides').eq('user_id', userId).maybeSingle()
      if (driver) { confirmed = Boolean(driver.is_online); setAverageRating(Number(driver.average_rating ?? 0)); setTotalRides(Number(driver.total_rides ?? 0)) }
    }
    setOnline(confirmed)
    if (confirmed) startGpsWatch(); else stopGpsWatch()
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
      if (action === 'complete' && userIdRef.current) {
        const { data: driver } = await supabase.from('driver_profiles').select('average_rating,total_rides').eq('user_id', userIdRef.current).maybeSingle()
        if (driver) { setAverageRating(Number(driver.average_rating ?? 0)); setTotalRides(Number(driver.total_rides ?? 0)) }
      }
      await loadRides(userIdRef.current, online)
    }
    setBusy(false)
  }

  async function logout() {
    if (online) await supabase.rpc('set_driver_online', { p_online: false })
    stopGpsWatch(); await supabase.auth.signOut(); location.href = '/driver/login?test=haiti'
  }

  function changeLang(next: Lang) { setLang(next); localStorage.setItem('taxi-language', next) }

  const statusAction = useMemo(() => {
    if (!activeRide) return null
    if (activeRide.status === 'accepted') return { key: 'arriving' as const, label: t.arriving }
    if (activeRide.status === 'driver_arriving') return { key: 'start' as const, label: t.start }
    if (activeRide.status === 'in_progress') return { key: 'complete' as const, label: t.complete }
    return null
  }, [activeRide, t])

  if (authorized === null) return <main className="page"><section className="card"><p>{t.loading}</p></section></main>
  if (!authorized) return <main className="page"><section className="card"><h1>{t.title}</h1><div className="message error">{t.notDriver}</div><button className="primary" onClick={() => location.href='/driver/login?test=haiti'}>← {t.logout}</button></section></main>

  const initials = (driverName || 'C').split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase()

  return <main className="page"><section className="card">
    <div className="topbar">
      <button className="menuButton" onClick={() => setMenuOpen(true)} aria-label="Menu">☰</button>
      <div className="brand"><span>T</span><div><strong>Taxi Platform Haiti</strong><small>{t.subtitle}</small></div></div>
    </div>

    <h1>{t.title}</h1>

    <div className="driver-rating-card">
      <div><span className="rating-star">★</span><div><small>{t.rating}</small><strong>{averageRating.toFixed(1)} / 5</strong></div></div>
      <span className="ride-count">{totalRides} {t.trips}{totalRides === 1 ? '' : 's'}</span>
    </div>

    <div className="online-card">
      <div><span className={online ? 'dot on' : 'dot'}></span><div><strong>{online ? t.online : t.offline}</strong><small>{gpsActive ? t.gpsOn : t.gpsOff}</small></div></div>
      <button className={online ? 'switch on' : 'switch'} onClick={toggleOnline} disabled={busy} aria-label={online ? t.goOffline : t.goOnline}><span></span></button>
    </div>

    {message && <div className="message">{message}</div>}

    {activeRide ? <div className="ride-card active">
      <div className="ride-head"><strong>{t.activeRide}</strong><span>{activeRide.service_type ?? 'standard'}</span></div>
      <p><b>{t.pickup}:</b> {activeRide.pickup_address}</p><p><b>{t.destination}:</b> {activeRide.destination_address}</p>
      <div className="stats"><span>{activeRide.estimated_distance_km ?? '-'} km</span><span>{activeRide.estimated_duration_min ?? '-'} min</span><span>{activeRide.estimated_fare_htg ?? '-'} HTG</span></div>
      {statusAction && <button className="primary" onClick={() => rideAction(statusAction.key, activeRide)} disabled={busy}>{statusAction.label}</button>}
    </div> : null}

    <div className="section-title"><h2>{t.available}</h2><button onClick={()=>loadRides()} disabled={busy}>{t.refresh}</button></div>
    {!online ? <div className="empty">{t.waitingOnline}</div> : available.length === 0 ? <div className="empty">{t.noRequests}</div> : available.map((ride) => <div className="ride-card" key={ride.id}>
      <div className="ride-head"><strong>{ride.pickup_address}</strong><span>{ride.service_type ?? 'standard'}</span></div>
      <p><b>{t.destination}:</b> {ride.destination_address}</p>
      <div className="stats"><span>{ride.estimated_distance_km ?? '-'} km</span><span>{ride.estimated_duration_min ?? '-'} min</span><span>{ride.estimated_fare_htg ?? '-'} HTG</span></div>
      <button className="primary" onClick={() => rideAction('accept', ride)} disabled={busy || !vehicle}>{t.accept}</button>
    </div>)}

    {menuOpen && <div className="overlay" onClick={()=>setMenuOpen(false)}><aside className="drawer" onClick={(e)=>e.stopPropagation()}>
      <div className="drawerTop"><button onClick={()=>setMenuOpen(false)}>×</button><strong>{t.title}</strong></div>
      <div className="profile"><div className="avatar">{driverAvatar ? <img src={driverAvatar} alt=""/> : initials}</div><div><strong>{driverName || 'Chauffeur'}</strong><span>{driverEmail}</span></div></div>
      <div className="menuSection"><h3>{t.personal}</h3>{driverPhone && <p>{t.phone}: {driverPhone}</p>}</div>
      {vehicle && <div className="menuSection"><h3>{t.vehicle}</h3><p>{vehicle.make} {vehicle.model}</p><p>{t.color}: {vehicle.color ?? '-'}</p><p>{t.plate}: {vehicle.plate_number}</p></div>}
      <div className="menuSection"><h3>{t.language}</h3><div className="langBtns"><button className={lang==='fr'?'active':''} onClick={()=>changeLang('fr')}>Français</button><button className={lang==='ht'?'active':''} onClick={()=>changeLang('ht')}>Kreyòl</button></div></div>
      <button className="logout" onClick={logout}>{t.logout}</button>
    </aside></div>}
  </section>
  <style jsx>{`
    .page{min-height:100vh;background:#f6f8fa;padding:16px;color:#102033;font-family:Inter,system-ui,sans-serif}.card{max-width:760px;margin:0 auto}.topbar{display:flex;align-items:center;gap:12px}.menuButton{width:48px;height:48px;border-radius:14px;border:1px solid #d9e1e7;background:#fff;font-size:22px}.brand{display:flex;gap:10px;align-items:center}.brand>span{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;background:#0f705a;color:#fff;font-weight:900}.brand strong,.brand small{display:block}.brand small{color:#8190a0;margin-top:2px}.card>h1{font-size:30px;margin:22px 0}.driver-rating-card,.online-card{background:#fff;border:1px solid #e3e8ed;border-radius:20px;padding:18px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center}.driver-rating-card>div,.online-card>div{display:flex;align-items:center;gap:12px}.rating-star{font-size:34px;color:#f4b000}.driver-rating-card small,.driver-rating-card strong,.online-card small,.online-card strong{display:block}.ride-count{padding:9px 14px;background:#f5f7f8;border-radius:999px;font-weight:800}.dot{width:13px;height:13px;border-radius:50%;background:#9aa6b2}.dot.on{background:#13a36b}.online-card small{color:#6d7d8d;margin-top:4px}.switch{width:70px;height:38px;border:0;border-radius:999px;background:#c9d2d8;padding:4px}.switch span{display:block;width:30px;height:30px;border-radius:50%;background:#fff}.switch.on{background:#58ad98}.switch.on span{margin-left:32px}.section-title{display:flex;justify-content:space-between;align-items:center;margin:24px 0 12px}.section-title h2{margin:0}.section-title button{border:0;border-radius:12px;padding:10px 14px;background:#102033;color:#fff;font-weight:800}.empty{border:1px dashed #bfd2cc;border-radius:18px;padding:24px;text-align:center;color:#697c75;background:#f9fffc}.ride-card{background:#fff;border:1px solid #dfe6eb;border-radius:18px;padding:18px;margin-bottom:14px}.ride-card.active{border-color:#0f705a}.ride-head{display:flex;justify-content:space-between;gap:12px}.ride-head span{font-size:12px;font-weight:800;color:#0f705a;text-transform:capitalize}.ride-card p{margin:10px 0;color:#506174}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.stats span{text-align:center;background:#f4f7f8;padding:10px 6px;border-radius:12px;font-weight:800}.primary{width:100%;border:0;border-radius:13px;background:#0f705a;color:#fff;padding:13px;font-weight:900}.message{padding:12px 14px;border-radius:13px;background:#eef8f4;color:#0f705a;font-weight:700;margin-bottom:14px}.message.error{background:#fff0f0;color:#9d2d2d}.overlay{position:fixed;inset:0;background:rgba(15,30,43,.45);z-index:50}.drawer{position:absolute;left:0;top:0;bottom:0;width:min(88vw,360px);background:#fff;padding:18px;overflow:auto}.drawerTop{display:flex;align-items:center;gap:12px}.drawerTop button{width:42px;height:42px;border:0;border-radius:12px;background:#eef2f4;font-size:25px}.profile{display:flex;gap:12px;align-items:center;padding:20px 0;border-bottom:1px solid #e5eaee}.avatar{width:58px;height:58px;border-radius:50%;background:#0f705a;color:#fff;display:grid;place-items:center;font-size:20px;font-weight:900;overflow:hidden}.avatar img{width:100%;height:100%;object-fit:cover}.profile strong,.profile span{display:block}.profile span{font-size:12px;color:#778697;margin-top:3px}.menuSection{padding:16px 0;border-bottom:1px solid #e5eaee}.menuSection h3{margin:0 0 10px;font-size:14px}.menuSection p{margin:6px 0;font-size:13px;color:#566778}.langBtns{display:flex;gap:8px}.langBtns button{border:1px solid #dbe3e8;background:#fff;border-radius:10px;padding:9px 12px}.langBtns button.active{background:#e9f6f1;border-color:#0f705a;color:#0f705a;font-weight:900}.logout{width:100%;margin-top:20px;border:0;border-radius:13px;background:#fff0f0;color:#a33;padding:13px;font-weight:900}@media(max-width:560px){.page{padding:12px}.card>h1{display:none}.topbar{margin-bottom:14px}.brand small{font-size:12px}.driver-rating-card,.online-card{padding:15px}.stats{grid-template-columns:1fr 1fr 1fr}}
  `}</style></main>
}
