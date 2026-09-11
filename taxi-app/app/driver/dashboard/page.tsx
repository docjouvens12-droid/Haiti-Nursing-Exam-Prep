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

type Vehicle = {
  id: string
  make: string
  model: string
  plate_number: string
  color: string | null
}

export default function DriverDashboardPage() {
  const [ready, setReady] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [busy, setBusy] = useState(false)
  const [online, setOnline] = useState(false)
  const [message, setMessage] = useState('')
  const [name, setName] = useState('Chauffeur')
  const [rating, setRating] = useState(0)
  const [totalRides, setTotalRides] = useState(0)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [activeRide, setActiveRide] = useState<Ride | null>(null)
  const [available, setAvailable] = useState<Ride[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const userIdRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData.session?.user
        if (!user) {
          window.location.replace('/movi-app-v2')
          return
        }

        userIdRef.current = user.id

        const { data: driver, error: driverError } = await supabase
          .from('driver_profiles')
          .select('status,is_online,average_rating,total_rides')
          .eq('user_id', user.id)
          .maybeSingle()

        if (cancelled) return
        if (driverError || !driver || driver.status !== 'approved') {
          setAuthorized(false)
          setMessage(driverError?.message || 'Ce compte n’est pas un chauffeur approuvé.')
          setReady(true)
          return
        }

        // Unlock the dashboard immediately after driver approval is confirmed.
        setAuthorized(true)
        setOnline(Boolean(driver.is_online))
        setRating(Number(driver.average_rating ?? 0))
        setTotalRides(Number(driver.total_rides ?? 0))
        setReady(true)

        // Secondary data must never block the dashboard.
        void Promise.allSettled([
          supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle().then(({ data }) => {
            if (!cancelled && data?.full_name) setName(data.full_name)
          }),
          supabase.from('vehicles').select('id,make,model,plate_number,color').eq('driver_id', user.id).eq('is_active', true).limit(1).maybeSingle().then(({ data }) => {
            if (!cancelled) setVehicle((data ?? null) as Vehicle | null)
          }),
          loadRides(user.id, Boolean(driver.is_online)),
        ])
      } catch (error) {
        if (cancelled) return
        setAuthorized(false)
        setReady(true)
        setMessage(error instanceof Error ? error.message : 'Erreur de connexion. Réessayez.')
      }
    }

    void init()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!authorized) return
    const channel = supabase
      .channel(`movi-driver-${userIdRef.current ?? 'active'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => {
        void loadRides(userIdRef.current, online)
      })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [authorized, online])

  async function loadRides(userId = userIdRef.current, isOnline = online) {
    if (!userId) return
    try {
      const { data: mine } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', userId)
        .in('status', ['accepted', 'driver_arriving', 'in_progress'])
        .order('requested_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setActiveRide((mine ?? null) as Ride | null)
      if (!isOnline || mine) {
        setAvailable([])
        return
      }

      const { data: requests } = await supabase
        .from('rides')
        .select('*')
        .eq('status', 'requested')
        .is('driver_id', null)
        .neq('passenger_id', userId)
        .order('requested_at', { ascending: true })
        .limit(20)

      setAvailable((requests ?? []) as Ride[])
    } catch {
      // Ride refresh failure must not blank the driver dashboard.
    }
  }

  async function toggleOnline() {
    if (busy) return
    setBusy(true)
    setMessage('')
    const next = !online
    try {
      const { error } = await supabase.rpc('set_driver_online', { p_online: next })
      if (error) throw error
      setOnline(next)
      setMessage(next ? 'Vous êtes maintenant en ligne.' : 'Vous êtes maintenant hors ligne.')
      await loadRides(userIdRef.current, next)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Impossible de modifier votre disponibilité.')
    } finally {
      setBusy(false)
    }
  }

  async function rideAction(action: 'accept' | 'arriving' | 'start' | 'complete', ride: Ride) {
    if (busy) return
    if (action === 'accept' && !vehicle) {
      setMessage('Aucun véhicule actif n’est associé à ce compte.')
      return
    }

    setBusy(true)
    setMessage('')
    try {
      let error: any = null
      if (action === 'accept') ({ error } = await supabase.rpc('accept_ride', { p_ride_id: ride.id, p_vehicle_id: vehicle!.id }))
      if (action === 'arriving') ({ error } = await supabase.rpc('mark_driver_arriving', { p_ride_id: ride.id }))
      if (action === 'start') ({ error } = await supabase.rpc('start_ride', { p_ride_id: ride.id }))
      if (action === 'complete') ({ error } = await supabase.rpc('complete_ride', { p_ride_id: ride.id, p_final_fare_htg: ride.estimated_fare_htg ?? 0, p_payment_method: 'cash' }))
      if (error) throw error
      await loadRides(userIdRef.current, online)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Impossible de mettre à jour le trajet.')
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    try {
      if (online) await supabase.rpc('set_driver_online', { p_online: false })
    } catch {}
    await supabase.auth.signOut()
    window.location.replace('/movi-app-v2')
  }

  if (!ready) {
    return <main className="loading"><div className="loader"/><strong>MOVI</strong><span>Ouverture de votre espace chauffeur…</span><style jsx>{styles}</style></main>
  }

  if (!authorized) {
    return <main className="page"><section className="card"><div className="logo">M</div><h1>Accès chauffeur</h1><p>{message || 'Ce compte n’est pas un chauffeur approuvé.'}</p><button className="primary" onClick={logout}>Retour à la connexion</button></section><style jsx>{styles}</style></main>
  }

  const nextAction = activeRide?.status === 'accepted'
    ? { key: 'arriving' as const, label: 'Je suis arrivé' }
    : activeRide?.status === 'driver_arriving'
      ? { key: 'start' as const, label: 'Commencer le trajet' }
      : activeRide?.status === 'in_progress'
        ? { key: 'complete' as const, label: 'Terminer le trajet' }
        : null

  return <main className="page">
    <section className="card">
      <header className="header">
        <button className="menu" onClick={() => setMenuOpen(true)}>☰</button>
        <div className="brand"><span>M</span><div><strong>MOVI</strong><small>Espace chauffeur</small></div></div>
      </header>

      <div className="welcome"><div><small>Bonjour</small><h1>{name}</h1></div><div className="rating">★ {rating.toFixed(1)} <small>{totalRides} trajets</small></div></div>

      <div className="statusCard">
        <div><span className={online ? 'dot on' : 'dot'}/><div><strong>{online ? 'En ligne' : 'Hors ligne'}</strong><small>{online ? 'Vous recevez les demandes' : 'Activez-vous pour recevoir des courses'}</small></div></div>
        <button className={online ? 'switch on' : 'switch'} onClick={toggleOnline} disabled={busy}><span/></button>
      </div>

      {message && <div className="message">{message}</div>}

      {activeRide && <section className="ride active">
        <div className="rideHead"><strong>Trajet en cours</strong><span>{activeRide.service_type ?? 'standard'}</span></div>
        <p><b>Prise en charge:</b> {activeRide.pickup_address}</p>
        <p><b>Destination:</b> {activeRide.destination_address}</p>
        <div className="stats"><span>{activeRide.estimated_distance_km ?? '-'} km</span><span>{activeRide.estimated_duration_min ?? '-'} min</span><span>{activeRide.estimated_fare_htg ?? '-'} HTG</span></div>
        {nextAction && <button className="primary" disabled={busy} onClick={() => rideAction(nextAction.key, activeRide)}>{nextAction.label}</button>}
      </section>}

      <div className="sectionTitle"><div><small>COURSES</small><h2>Demandes disponibles</h2></div><button onClick={() => loadRides()} disabled={busy}>Actualiser</button></div>

      {!online ? <div className="empty">Passez en ligne pour recevoir les demandes.</div>
        : available.length === 0 ? <div className="empty">Aucune demande disponible pour le moment.</div>
        : available.map(ride => <section className="ride" key={ride.id}>
          <div className="rideHead"><strong>{ride.pickup_address}</strong><span>{ride.service_type ?? 'standard'}</span></div>
          <p><b>Destination:</b> {ride.destination_address}</p>
          <div className="stats"><span>{ride.estimated_distance_km ?? '-'} km</span><span>{ride.estimated_duration_min ?? '-'} min</span><span>{ride.estimated_fare_htg ?? '-'} HTG</span></div>
          <button className="primary" disabled={busy || !vehicle} onClick={() => rideAction('accept', ride)}>Accepter</button>
        </section>)}

      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)}><aside onClick={e => e.stopPropagation()}><button className="close" onClick={() => setMenuOpen(false)}>×</button><div className="avatar">{name.slice(0,1).toUpperCase()}</div><h2>{name}</h2>{vehicle && <div className="vehicle"><small>VÉHICULE</small><strong>{vehicle.make} {vehicle.model}</strong><span>{vehicle.plate_number}</span></div>}<button className="logout" onClick={logout}>Se déconnecter</button></aside></div>}
    </section>
    <style jsx>{styles}</style>
  </main>
}

const styles = `
  .loading,.page{min-height:100vh;background:#f4f8f6;color:#10253a;font-family:Inter,system-ui,-apple-system,sans-serif}.loading{display:grid;place-items:center;align-content:center;gap:10px}.loader{width:44px;height:44px;border:4px solid #cfe6df;border-top-color:#0f7b63;border-radius:50%;animation:spin .8s linear infinite}.loading strong{font-size:28px}.loading span{color:#6b7c78}@keyframes spin{to{transform:rotate(360deg)}}
  .page{padding:18px 14px 40px}.card{max-width:720px;margin:0 auto}.header{display:flex;align-items:center;gap:12px;margin-bottom:24px}.menu{width:48px;height:48px;border:0;border-radius:16px;background:#fff;box-shadow:0 8px 24px #0b4d3b14;font-size:22px}.brand{display:flex;align-items:center;gap:10px}.brand>span,.logo{width:50px;height:50px;border-radius:16px;background:linear-gradient(145deg,#18a97b,#08745d);color:#fff;display:grid;place-items:center;font-size:24px;font-weight:900}.brand strong,.brand small{display:block}.brand strong{font-size:21px}.brand small{color:#73827e}.welcome{display:flex;justify-content:space-between;align-items:end;margin:10px 0 18px}.welcome small{color:#74847f}.welcome h1{margin:2px 0 0;font-size:28px}.rating{background:#fff;border-radius:16px;padding:12px 14px;font-weight:900}.rating small{display:block;font-size:11px;margin-top:3px}.statusCard{background:#fff;border:1px solid #dce9e4;border-radius:22px;padding:18px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 12px 30px #0f705a0d}.statusCard>div{display:flex;align-items:center;gap:12px}.statusCard strong,.statusCard small{display:block}.statusCard small{color:#7a8985;margin-top:4px}.dot{width:14px;height:14px;border-radius:50%;background:#aab4b1}.dot.on{background:#12a274;box-shadow:0 0 0 6px #12a27419}.switch{width:66px;height:38px;border:0;border-radius:999px;padding:4px;background:#ccd4d1}.switch span{display:block;width:30px;height:30px;border-radius:50%;background:#fff;transition:.2s}.switch.on{background:#18a97b}.switch.on span{transform:translateX(28px)}.message{margin:14px 0;padding:12px 14px;border-radius:14px;background:#eaf6f2;color:#0f705a;font-weight:700}.sectionTitle{display:flex;justify-content:space-between;align-items:end;margin:28px 0 12px}.sectionTitle small{font-size:11px;letter-spacing:.15em;color:#0f7b63;font-weight:900}.sectionTitle h2{margin:3px 0 0;font-size:21px}.sectionTitle button{border:0;border-radius:12px;background:#10253a;color:#fff;padding:9px 12px;font-weight:800}.empty{padding:24px;border:1px dashed #b9cec7;border-radius:18px;text-align:center;color:#6c7b77;background:#fbfdfc}.ride{background:#fff;border:1px solid #dfe9e5;border-radius:20px;padding:17px;margin-bottom:13px}.ride.active{border-color:#19a67a;box-shadow:0 10px 30px #0f705a12}.rideHead{display:flex;justify-content:space-between;gap:12px}.rideHead span{font-size:12px;text-transform:capitalize;color:#0f7b63;font-weight:900}.ride p{color:#52635f}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.stats span{background:#f2f6f4;border-radius:12px;padding:10px 5px;text-align:center;font-weight:800}.primary{width:100%;border:0;border-radius:14px;background:linear-gradient(135deg,#18a97b,#08745d);color:#fff;padding:14px;font-size:16px;font-weight:900}.overlay{position:fixed;inset:0;background:#0b2d2566;z-index:100}.overlay aside{position:absolute;left:0;top:0;bottom:0;width:min(84vw,340px);background:#fff;padding:24px;box-shadow:10px 0 40px #0002}.close{float:right;width:42px;height:42px;border:0;border-radius:14px;background:#edf4f1;font-size:26px}.avatar{width:72px;height:72px;border-radius:22px;background:#0f7b63;color:#fff;display:grid;place-items:center;font-size:28px;font-weight:900;margin-top:60px}.vehicle{display:grid;gap:5px;padding:18px 0;border-top:1px solid #e4ece9;border-bottom:1px solid #e4ece9}.vehicle small{color:#70807b}.logout{width:100%;margin-top:22px;border:1px solid #f0caca;background:#fff6f6;color:#a73838;border-radius:14px;padding:13px;font-weight:900}
`