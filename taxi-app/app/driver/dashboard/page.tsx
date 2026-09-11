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

type DashboardRow = {
  full_name: string | null
  status: string | null
  is_online: boolean | null
  average_rating: number | string | null
  total_rides: number | null
  vehicle_id: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_plate_number: string | null
  vehicle_color: string | null
}

async function rpc<T = unknown>(name: string, body: Record<string, unknown> = {}) {
  const { data, error } = await supabase.rpc(name, body)
  if (error) throw error
  return data as T
}

export default function DriverDashboardPage() {
  const [authorized, setAuthorized] = useState(true)
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
  const accessTokenRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const session = data.session
        if (!session?.user?.id || !session.access_token) {
          window.location.replace('/movi-app-v2')
          return
        }
        if (cancelled) return
        userIdRef.current = session.user.id
        accessTokenRef.current = session.access_token
        await refreshDashboard(false)
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : 'Impossible d’ouvrir votre espace chauffeur.')
      }
    }

    void init()
    return () => { cancelled = true }
  }, [])

  async function getAccessToken() {
    if (accessTokenRef.current) return accessTokenRef.current
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token ?? null
    accessTokenRef.current = token
    if (data.session?.user?.id) userIdRef.current = data.session.user.id
    return token
  }

  async function loadRides(userId = userIdRef.current, isOnline = online) {
    if (!userId) return
    try {
      const { data: mineRows } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', userId)
        .in('status', ['accepted', 'driver_arriving', 'in_progress'])
        .order('requested_at', { ascending: false })
        .limit(1)

      const mine = (mineRows?.[0] as Ride | undefined) ?? null
      setActiveRide(mine)

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
      // Ride refresh failure must not blank the dashboard.
    }
  }

  async function refreshDashboard(showBusy = true) {
    if (showBusy) setBusy(true)
    setMessage('')
    try {
      const token = await getAccessToken()
      if (!token) {
        window.location.replace('/movi-app-v2')
        return
      }

      const response = await fetch('/api/driver/dashboard', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || `Erreur ${response.status}`)

      const raw = payload?.data
      const row: DashboardRow | undefined = Array.isArray(raw) ? raw[0] : raw
      if (!row || row.status !== 'approved') {
        setAuthorized(false)
        setMessage('Ce compte n’est pas un chauffeur approuvé.')
        return
      }

      setAuthorized(true)
      setName(row.full_name?.trim() || 'Chauffeur')
      setOnline(Boolean(row.is_online))
      setRating(Number(row.average_rating ?? 0))
      setTotalRides(Number(row.total_rides ?? 0))

      if (row.vehicle_id && row.vehicle_make && row.vehicle_model && row.vehicle_plate_number) {
        setVehicle({
          id: row.vehicle_id,
          make: row.vehicle_make,
          model: row.vehicle_model,
          plate_number: row.vehicle_plate_number,
          color: row.vehicle_color,
        })
      } else {
        setVehicle(null)
      }

      await loadRides(userIdRef.current, Boolean(row.is_online))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Impossible de charger le profil chauffeur.')
    } finally {
      if (showBusy) setBusy(false)
    }
  }

  async function toggleOnline() {
    if (busy) return
    setBusy(true)
    setMessage('')
    const next = !online
    try {
      await rpc('set_driver_online', { p_online: next })
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
      if (action === 'accept') await rpc('accept_ride', { p_ride_id: ride.id, p_vehicle_id: vehicle!.id })
      if (action === 'arriving') await rpc('mark_driver_arriving', { p_ride_id: ride.id })
      if (action === 'start') await rpc('start_ride', { p_ride_id: ride.id })
      if (action === 'complete') await rpc('complete_ride', { p_ride_id: ride.id, p_final_fare_htg: ride.estimated_fare_htg ?? 0, p_payment_method: 'cash' })
      await loadRides(userIdRef.current, online)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Impossible de mettre à jour le trajet.')
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    try {
      if (online) await rpc('set_driver_online', { p_online: false })
    } catch {}
    try { await supabase.auth.signOut() } catch {}
    try { window.localStorage.removeItem('taxi-auth-default') } catch {}
    window.location.replace('/movi-app-v2')
  }

  if (!authorized) {
    return <main className="page"><section className="card"><div className="logo">M</div><h1>Accès chauffeur</h1><p>{message || 'Ce compte n’est pas un chauffeur approuvé.'}</p><button className="primary" onClick={logout}>Retour à la connexion</button></section></main>
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

      <div className="welcome"><div><small>Bonjour</small><h1>{name}</h1></div><div className="rating">★ {rating.toFixed(2)} <small>{totalRides} trajets</small></div></div>

      <div className="statusCard">
        <div><span className={online ? 'dot on' : 'dot'}/><div><strong>{online ? 'En ligne' : 'Hors ligne'}</strong><small>{online ? 'Vous recevez les demandes' : 'Activez-vous pour recevoir des courses'}</small></div></div>
        <button className={online ? 'switch on' : 'switch'} onClick={toggleOnline} disabled={busy} aria-label={online ? 'Passer hors ligne' : 'Passer en ligne'}><span/></button>
      </div>

      {message && <div className="message">{message}</div>}

      {activeRide && <section className="ride active">
        <div className="rideHead"><strong>Trajet en cours</strong><span>{activeRide.service_type ?? 'standard'}</span></div>
        <p><b>Prise en charge:</b> {activeRide.pickup_address}</p>
        <p><b>Destination:</b> {activeRide.destination_address}</p>
        <div className="stats"><span>{activeRide.estimated_distance_km ?? '-'} km</span><span>{activeRide.estimated_duration_min ?? '-'} min</span><span>{activeRide.estimated_fare_htg ?? '-'} HTG</span></div>
        {nextAction && <button className="primary" disabled={busy} onClick={() => rideAction(nextAction.key, activeRide)}>{nextAction.label}</button>}
      </section>}

      <div className="sectionTitle"><div><small>COURSES</small><h2>Demandes disponibles</h2></div><button onClick={() => refreshDashboard(true)} disabled={busy}>{busy ? '...' : 'Actualiser'}</button></div>

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
  </main>
}
