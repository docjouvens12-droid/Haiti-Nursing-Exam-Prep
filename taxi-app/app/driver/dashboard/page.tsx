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
    title: 'Espace chauffeur', subtitle: 'Gérez votre disponibilité et vos trajets', online: 'En ligne', offline: 'Hors ligne', goOnline: 'Passer en ligne', goOffline: 'Passer hors ligne', available: 'Demandes disponibles', activeRide: 'Trajet en cours', noRequests: 'Aucune demande disponible pour le moment.', waitingOnline: 'Passez en ligne pour recevoir les demandes.', pickup: 'Prise en charge', destination: 'Destination', fare: 'Prix estimé', distance: 'Distance', duration: 'Durée', service: 'Service', accept: 'Accepter', reject: 'Refuser', arriving: 'Je suis arrivé', start: 'Commencer le trajet', complete: 'Terminer le trajet', refresh: 'Actualiser', logout: 'Se déconnecter', notDriver: 'Ce compte n’est pas un chauffeur approuvé.', loading: 'Chargement…', vehicle: 'Véhicule', gpsOn: 'Position GPS active', gpsOff: 'Position GPS indisponible', completed: 'Trajet terminé.', accepted: 'Trajet accepté.', rejected: 'Demande refusée.', arrivingMsg: 'Statut mis à jour : chauffeur arrivé.', started: 'Trajet démarré.', onlineConfirmed: 'Vous êtes maintenant en ligne.', offlineConfirmed: 'Vous êtes maintenant hors ligne.', gpsPermission: 'Autorisez la localisation sur votre iPhone pour partager votre position.', rating: 'Note chauffeur', trips: 'trajet', personal: 'Informations personnelles', language: 'Langue', email: 'E-mail', phone: 'Téléphone', color: 'Couleur', plate: 'Plaque', model: 'Modèle', decide: 'Temps pour répondre'
  },
  ht: {
    title: 'Espas chofè', subtitle: 'Jere disponiblite ou ak trajè ou yo', online: 'Sou liy', offline: 'Pa sou liy', goOnline: 'Mete m sou liy', goOffline: 'Retire m sou liy', available: 'Demann trajè ki disponib', activeRide: 'Trajè aktyèl', noRequests: 'Pa gen demann trajè pou kounye a.', waitingOnline: 'Mete tèt ou sou liy pou resevwa demann.', pickup: 'Kote pou pran pasaje a', destination: 'Destinasyon', fare: 'Pri estime', distance: 'Distans', duration: 'Dire', service: 'Sèvis', accept: 'Aksepte', reject: 'Rejte', arriving: 'Mwen rive', start: 'Kòmanse trajè a', complete: 'Fini trajè a', refresh: 'Rafrechi', logout: 'Dekonekte', notDriver: 'Kont sa a pa yon chofè ki apwouve.', loading: 'N ap chaje…', vehicle: 'Veyikil', gpsOn: 'Pozisyon GPS aktif', gpsOff: 'Pozisyon GPS pa disponib', completed: 'Trajè a fini.', accepted: 'Trajè a aksepte.', rejected: 'Demann nan rejte.', arrivingMsg: 'Estati a chanje: chofè a rive.', started: 'Trajè a kòmanse.', onlineConfirmed: 'Ou sou liy kounye a.', offlineConfirmed: 'Ou pa sou liy kounye a.', gpsPermission: 'Bay aplikasyon an pèmisyon Location sou iPhone pou pataje pozisyon ou.', rating: 'Nòt chofè', trips: 'trajè', personal: 'Enfòmasyon pèsonèl', language: 'Lang', email: 'Imèl', phone: 'Telefòn', color: 'Koulè', plate: 'Plak', model: 'Modèl', decide: 'Tan pou reponn'
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
    if (!auth.user) { location.href = '/'; return }
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
    const [{ data: requests }, { data: rejected }] = await Promise.all([
      supabase.from('rides').select('*').eq('status', 'requested').is('driver_id', null).order('requested_at', { ascending: true }).limit(30),
      supabase.from('driver_ride_rejections').select('ride_id').eq('driver_id', userId),
    ])
    const hidden = new Set((rejected ?? []).map((r: any) => String(r.ride_id)))
    setAvailable(((requests ?? []) as Ride[]).filter((r) => !hidden.has(r.id)).slice(0, 20))
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

  async function rejectRide(ride: Ride, reason: 'rejected' | 'timeout' = 'rejected') {
    const { error } = await supabase.rpc('reject_ride_request', { p_ride_id: ride.id, p_reason: reason })
    if (error) {
      if (reason === 'rejected') setMessage(error.message)
      return
    }
    if (reason === 'rejected') setMessage(t.rejected)
    await loadRides(userIdRef.current, online)
  }

  async function logout() {
    if (online) await supabase.rpc('set_driver_online', { p_online: false })
    stopGpsWatch(); await supabase.auth.signOut(); location.href = '/'
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
  if (!authorized) return <main className="page"><section className="card"><h1>{t.title}</h1><div className="message error">{t.notDriver}</div><button className="primary" onClick={() => location.href='/driver'}>←</button></section></main>

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

    <div className="status-card">
      <div><span className={`dot ${online ? 'on' : ''}`}></span><strong>{online ? t.online : t.offline}</strong><small>{gpsActive ? t.gpsOn : t.gpsOff}</small></div>
      <button className={online ? 'offline-btn' : 'online-btn'} onClick={()=>void toggleOnline()} disabled={busy}>{online ? t.goOffline : t.goOnline}</button>
    </div>

    {message && <div className="message">{message}</div>}

    {activeRide && <section className="section"><div className="section-title"><h2>{t.activeRide}</h2><span className="pill">{activeRide.status}</span></div><DriverNavigationMap ride={activeRide} lang={lang} /><RideCard ride={activeRide} t={t} />{statusAction && <button className="primary action" disabled={busy} onClick={()=>void rideAction(statusAction.key, activeRide)}>{statusAction.label}</button>}</section>}

    {!activeRide && <section className="section"><div className="section-title"><h2>{t.available}</h2><button className="refresh" onClick={()=>void loadRides()} disabled={busy}>↻ {t.refresh}</button></div>{!online ? <div className="empty">{t.waitingOnline}</div> : available.length === 0 ? <div className="empty">🔎 {t.noRequests}</div> : <div className="rides">{available.map(r => <RideOffer key={r.id} ride={r} t={t} busy={busy || !vehicle} onAccept={() => void rideAction('accept', r)} onReject={(reason) => void rejectRide(r, reason)} />)}</div>}</section>}
  </section>

  {menuOpen && <div className="menuBackdrop" onClick={() => setMenuOpen(false)}>
    <aside className="drawer" onClick={(e) => e.stopPropagation()}>
      <div className="drawerHead"><strong>{t.title}</strong><button onClick={() => setMenuOpen(false)}>×</button></div>
      <div className="profileBlock">
        <div className="avatar">{driverAvatar ? <img src={driverAvatar} alt="" /> : initials}</div>
        <div><strong>{driverName || 'Chauffeur'}</strong><span>{driverEmail || '—'}</span>{driverPhone && <span>{driverPhone}</span>}</div>
      </div>
      <div className="menuSection"><h3>{t.personal}</h3><p><span>{t.email}</span><b>{driverEmail || '—'}</b></p><p><span>{t.phone}</span><b>{driverPhone || '—'}</b></p></div>
      {vehicle && <div className="menuSection"><h3>{t.vehicle}</h3><p><span>{t.model}</span><b>{vehicle.make} {vehicle.model}</b></p><p><span>{t.color}</span><b>{vehicle.color || '—'}</b></p><p><span>{t.plate}</span><b>{vehicle.plate_number}</b></p></div>}
      <div className="menuSection"><h3>{t.language}</h3><div className="langButtons"><button className={lang==='fr'?'active':''} onClick={()=>changeLang('fr')}>Français</button><button className={lang==='ht'?'active':''} onClick={()=>changeLang('ht')}>Kreyòl</button></div></div>
      <button className="drawerLogout" onClick={()=>void logout()}>{t.logout}</button>
    </aside>
  </div>}

  <style jsx>{`
    .page{min-height:100vh;background:linear-gradient(160deg,#e5f1ed,#eef2f7 50%,#e7edf3);padding:22px;color:#102033;font-family:Inter,system-ui,sans-serif}.card{width:min(100%,760px);margin:auto;background:#fff;border-radius:28px;padding:22px;box-shadow:0 24px 70px rgba(18,36,61,.14)}.topbar{display:flex;gap:12px;align-items:center}.menuButton{width:44px;height:44px;border:1px solid #dce4eb;border-radius:14px;background:#fff;color:#0f6f59;font-size:22px;font-weight:900;flex:0 0 auto}.brand{display:flex;align-items:center;gap:10px}.brand>span{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:#0f6f59;color:#fff;font-weight:900}.brand strong,.brand small{display:block}.brand small{color:#77879a;margin-top:2px}.card h1{font-size:32px;margin:24px 0 18px}.driver-rating-card{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 16px;border:1px solid #f0dfad;background:#fffaf0;border-radius:18px;margin-bottom:12px}.driver-rating-card>div{display:flex;align-items:center;gap:10px}.driver-rating-card small,.driver-rating-card strong{display:block}.driver-rating-card small{color:#7a8998}.rating-star{font-size:30px;color:#f5b000}.ride-count{font-size:13px;font-weight:850;color:#6a7580;background:#fff;border:1px solid #eadfca;border-radius:999px;padding:8px 11px}.status-card{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#f4f8f7;border-radius:18px;padding:16px;margin-bottom:12px}.status-card>div{display:grid;grid-template-columns:auto 1fr;column-gap:8px}.status-card small{grid-column:2;color:#78889a}.dot{width:12px;height:12px;border-radius:50%;background:#9aabba;margin-top:4px}.dot.on{background:#16a36f}.online-btn,.offline-btn,.primary,.refresh{border:0;border-radius:14px;padding:12px 16px;font-weight:900}.online-btn,.primary{background:#0f6f59;color:#fff}.offline-btn{background:#fff0f0;color:#a02d2d}.message{padding:12px 14px;border-radius:13px;background:#eef7f4;color:#115f4d;font-weight:750;margin-bottom:12px}.message.error{background:#fff0f0;color:#9b3030}.section{margin-top:20px}.section-title{display:flex;justify-content:space-between;align-items:center;gap:10px}.section h2{font-size:20px}.pill{font-size:11px;font-weight:900;background:#eef3f7;border-radius:999px;padding:7px 10px}.refresh{background:#102033;color:#fff}.empty{padding:28px;border:1px dashed #d4dee7;border-radius:18px;text-align:center;color:#7a8998}.rides{display:grid;gap:14px}.action{width:100%;margin-top:12px}.menuBackdrop{position:fixed;inset:0;z-index:30000;background:rgba(10,22,34,.45);display:flex}.drawer{width:min(88vw,360px);height:100%;background:#fff;padding:20px 18px;overflow:auto;box-shadow:20px 0 60px rgba(0,0,0,.2)}.drawerHead{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}.drawerHead strong{font-size:20px}.drawerHead button{border:0;background:#eef2f5;width:38px;height:38px;border-radius:50%;font-size:24px}.profileBlock{display:flex;align-items:center;gap:12px;padding:14px;background:#f4f8f7;border-radius:18px}.avatar{width:54px;height:54px;border-radius:50%;background:#dff2eb;color:#0f6f59;display:grid;place-items:center;font-weight:900;overflow:hidden}.avatar img{width:100%;height:100%;object-fit:cover}.profileBlock strong,.profileBlock span{display:block}.profileBlock span{font-size:12px;color:#748496;margin-top:3px}.menuSection{padding:16px 2px;border-bottom:1px solid #e5eaee}.menuSection h3{margin:0 0 10px;font-size:14px;color:#0f6f59}.menuSection p{display:flex;justify-content:space-between;gap:12px;margin:8px 0;font-size:13px}.menuSection p span{color:#7a8998}.menuSection p b{text-align:right}.langButtons{display:grid;grid-template-columns:1fr 1fr;gap:8px}.langButtons button{border:1px solid #dce4eb;background:#fff;border-radius:12px;padding:10px;font-weight:800}.langButtons button.active{border-color:#0f6f59;background:#eaf6f2;color:#0f6f59}.drawerLogout{display:flex;width:100%;align-items:center;justify-content:center;border-radius:14px;padding:13px 14px;margin-top:12px;font-weight:900;box-sizing:border-box;border:0;background:#fff0f0;color:#9a3030}@media(max-width:600px){.page{padding:0}.card{min-height:100vh;border-radius:0;padding:18px 16px}.brand small{font-size:11px}.card h1{font-size:28px;margin-top:20px}.status-card{align-items:flex-start;flex-direction:column}.status-card button{width:100%}.driver-rating-card{align-items:flex-start}}
  `}</style>
  </main>
}

function RideOffer({ ride, t, busy, onAccept, onReject }: { ride: Ride; t: any; busy: boolean; onAccept: () => void; onReject: (reason: 'rejected' | 'timeout') => void }) {
  const [seconds, setSeconds] = useState(20)
  const finishedRef = useRef(false)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          if (!finishedRef.current) {
            finishedRef.current = true
            onReject('timeout')
          }
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [ride.id])

  function accept() {
    if (finishedRef.current) return
    finishedRef.current = true
    onAccept()
  }

  function reject() {
    if (finishedRef.current) return
    finishedRef.current = true
    onReject('rejected')
  }

  const pct = Math.max(0, Math.min(100, (seconds / 20) * 100))

  return <div className="offer-wrap">
    <div className="offer-top"><strong>{t.decide}</strong><span>{seconds}s</span></div>
    <div className="countdown"><i style={{ width: `${pct}%` }} /></div>
    <RideCard ride={ride} t={t} />
    <div className="offer-actions">
      <button className="reject" disabled={busy || seconds === 0} onClick={reject}>✕ {t.reject}</button>
      <button className="accept" disabled={busy || seconds === 0} onClick={accept}>✓ {t.accept}</button>
    </div>
    <style jsx>{`.offer-wrap{border:1px solid #dfe6ed;border-radius:20px;padding:14px;background:#fff;box-shadow:0 10px 28px rgba(14,38,55,.08)}.offer-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px}.offer-top strong{font-size:12px;color:#67798a}.offer-top span{font-size:18px;font-weight:900;color:#0f6f59}.countdown{height:6px;background:#edf1f4;border-radius:999px;overflow:hidden;margin-bottom:14px}.countdown i{display:block;height:100%;background:#0f6f59;transition:width 1s linear}.offer-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.offer-actions button{border:0;border-radius:14px;padding:13px 12px;font-weight:900;font-size:15px}.offer-actions button:disabled{opacity:.55}.reject{background:#fff0f0;color:#9f2f2f}.accept{background:#0f6f59;color:#fff}`}</style>
  </div>
}

function RideCard({ ride, t }: { ride: Ride; t: any }) {
  const serviceLabel = ride.service_type === 'moto' ? 'Moto' : ride.service_type === 'comfort' ? 'Comfort' : 'Standard'
  return <article className="ride-card">
    <div className="row"><span>📍</span><div><small>{t.pickup}</small><strong>{ride.pickup_address}</strong></div></div>
    <div className="row"><span>🏁</span><div><small>{t.destination}</small><strong>{ride.destination_address}</strong></div></div>
    <div className="metrics">
      <div><small>{t.distance}</small><strong>{ride.estimated_distance_km != null ? `${Number(ride.estimated_distance_km).toFixed(1)} km` : '—'}</strong></div>
      <div><small>{t.duration}</small><strong>{ride.estimated_duration_min != null ? `${ride.estimated_duration_min} min` : '—'}</strong></div>
      <div><small>{t.fare}</small><strong>{ride.estimated_fare_htg != null ? `${Math.round(Number(ride.estimated_fare_htg))} HTG` : '—'}</strong></div>
      <div><small>{t.service}</small><strong>{serviceLabel}</strong></div>
    </div>
    <style jsx>{`.ride-card{display:grid;gap:12px}.row{display:flex;gap:10px;align-items:flex-start}.row>span{font-size:20px}.row small,.row strong{display:block}.row small,.metrics small{color:#7a8998;font-size:11px}.row strong{margin-top:2px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.metrics>div{background:#f6f8fa;border-radius:13px;padding:10px}.metrics small,.metrics strong{display:block}.metrics strong{margin-top:3px;font-size:13px}@media(max-width:620px){.metrics{grid-template-columns:1fr 1fr}}`}</style>
  </article>
}