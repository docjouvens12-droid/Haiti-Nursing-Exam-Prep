'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type RideOption = {
  id: 'moto' | 'standard' | 'comfort'
  name: string
  detail: string
  eta: string
}

type Place = { label: string; lat: number; lng: number }
type Quote = { distance_km: number; duration_min: number; fare_htg: number }

const rideOptions: RideOption[] = [
  { id: 'moto', name: 'Moto', detail: '1 pasaje', eta: '3 min' },
  { id: 'standard', name: 'Standard', detail: 'Jiska 4 pasaje', eta: '5 min' },
  { id: 'comfort', name: 'Comfort', detail: 'Plis espas', eta: '7 min' },
]

const places: Record<string, Place> = {
  lakay: { label: 'Lakay', lat: 18.5392, lng: -72.3364 },
  travay: { label: 'Pétion-Ville', lat: 18.5125, lng: -72.2853 },
  airport: { label: 'Aéroport International Toussaint Louverture', lat: 18.5801, lng: -72.2925 },
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [authBusy, setAuthBusy] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [pickup, setPickup] = useState('Pozisyon aktyèl mwen')
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [destination, setDestination] = useState('')
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedRide, setSelectedRide] = useState<RideOption['id']>('standard')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [requestState, setRequestState] = useState<'idle' | 'quoting' | 'requesting' | 'searching'>('idle')
  const [rideId, setRideId] = useState<string | null>(null)
  const [rideError, setRideError] = useState('')

  const ride = useMemo(
    () => rideOptions.find((option) => option.id === selectedRide) ?? rideOptions[1],
    [selectedRide]
  )

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickupCoords({ lat: position.coords.latitude, lng: position.coords.longitude })
        setPickup('Pozisyon aktyèl mwen')
      },
      () => {
        setPickupCoords({ lat: 18.5392, lng: -72.3364 })
        setPickup('Port-au-Prince (pozisyon tès)')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  useEffect(() => {
    if (!user || !pickupCoords || !destinationCoords) {
      setQuote(null)
      return
    }

    let cancelled = false
    setRequestState((state) => (state === 'searching' ? state : 'quoting'))
    setRideError('')

    supabase.rpc('quote_ride', {
      p_service_type: selectedRide,
      p_pickup_latitude: pickupCoords.lat,
      p_pickup_longitude: pickupCoords.lng,
      p_destination_latitude: destinationCoords.lat,
      p_destination_longitude: destinationCoords.lng,
    }).then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        setRideError(error.message)
        setQuote(null)
      } else {
        const row = Array.isArray(data) ? data[0] : data
        setQuote(row ? {
          distance_km: Number(row.distance_km),
          duration_min: Number(row.duration_min),
          fare_htg: Number(row.fare_htg),
        } : null)
      }
      setRequestState((state) => (state === 'searching' ? state : 'idle'))
    })

    return () => { cancelled = true }
  }, [user, pickupCoords, destinationCoords, selectedRide])

  async function submitAuth(event: FormEvent) {
    event.preventDefault()
    setAuthBusy(true)
    setAuthMessage('')

    if (authMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) setAuthMessage(error.message)
      else if (!data.session) setAuthMessage('Kont lan kreye. Tcheke imel ou pou konfime adrès la, epi konekte.')
      else setAuthMessage('Kont lan kreye avèk siksè.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setAuthMessage(error.message)
    }

    setAuthBusy(false)
  }

  function choosePlace(place: Place) {
    setDestination(place.label)
    setDestinationCoords({ lat: place.lat, lng: place.lng })
    setRideError('')
  }

  async function requestRide() {
    if (!user) {
      setRideError('Konekte anvan ou mande yon taksi.')
      return
    }
    if (!pickupCoords || !destinationCoords || !quote) {
      setRideError('Chwazi yon destinasyon ki disponib epi tann estimasyon pri a.')
      return
    }

    setRequestState('requesting')
    setRideError('')

    const { data, error } = await supabase.rpc('request_ride_v2', {
      p_service_type: selectedRide,
      p_pickup_address: pickup,
      p_pickup_latitude: pickupCoords.lat,
      p_pickup_longitude: pickupCoords.lng,
      p_destination_address: destination,
      p_destination_latitude: destinationCoords.lat,
      p_destination_longitude: destinationCoords.lng,
    })

    if (error) {
      setRideError(error.message)
      setRequestState('idle')
      return
    }

    setRideId(String(data))
    setRequestState('searching')
  }

  async function signOut() {
    await supabase.auth.signOut()
    setRideId(null)
    setRequestState('idle')
  }

  if (!user) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="auth-brand"><span className="brand-mark">T</span><div><strong>Taxi Platform Haiti</strong><small>Deplase fasil, deplase an sekirite</small></div></div>
          <p className="eyebrow">{authMode === 'signin' ? 'Byenvini ankò' : 'Kreye kont pasaje'}</p>
          <h1>{authMode === 'signin' ? 'Konekte pou mande taksi' : 'Enskri kòm pasaje'}</h1>
          <form onSubmit={submitAuth} className="auth-form">
            {authMode === 'signup' && <label>Non konplè<input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></label>}
            <label>Imel<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
            <label>Modpas<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'} /></label>
            {authMessage && <div className="auth-message">{authMessage}</div>}
            <button className="auth-submit" disabled={authBusy}>{authBusy ? 'Tanpri tann…' : authMode === 'signin' ? 'Konekte' : 'Kreye kont mwen'}</button>
          </form>
          <button className="auth-switch" onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setAuthMessage('') }}>
            {authMode === 'signin' ? 'Ou poko gen kont? Kreye youn' : 'Ou deja gen kont? Konekte'}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="shell">
      <section className="phone-frame">
        <div className="map-panel">
          <div className="map-grid" />
          <div className="topbar">
            <button className="round-button" aria-label="Louvri meni">☰</button>
            <div className="brand-chip"><span className="brand-mark">T</span><div><strong>Taxi Platform Haiti</strong><small>Deplase fasil, deplase an sekirite</small></div></div>
            <button className="round-button" aria-label="Dekonekte" onClick={signOut}>↪</button>
          </div>
          <div className="map-label label-one">Delmas</div><div className="map-label label-two">Pétion-Ville</div><div className="map-label label-three">Port-au-Prince</div>
          <div className="road road-a" /><div className="road road-b" /><div className="road road-c" />
          <div className="location-dot"><span /></div>
          <div className="driver-marker driver-one">🚕</div><div className="driver-marker driver-two">🚗</div><div className="driver-marker driver-three">🏍️</div>
          <button className="locate-button" aria-label="Retounen sou pozisyon mwen">⌖</button>
        </div>

        <section className="booking-sheet">
          <div className="grabber" />
          <div className="greeting-row"><div><p className="eyebrow">Bonjou {user.user_metadata?.full_name ? user.user_metadata.full_name.split(' ')[0] : ''} 👋</p><h1>Ki kote ou prale?</h1></div><span className="online-pill">Chofè disponib</span></div>

          <div className="route-card">
            <div className="route-line"><span className="pickup-dot" /><div className="input-wrap"><label>Kote pou pran ou</label><input value={pickup} readOnly /></div></div>
            <div className="connector" />
            <div className="route-line"><span className="destination-dot" /><div className="input-wrap"><label>Destinasyon</label><input value={destination} onChange={(e) => { setDestination(e.target.value); setDestinationCoords(null) }} placeholder="Chwazi yon kote rapid anba a" /></div></div>
          </div>

          <div className="quick-places">
            <button onClick={() => choosePlace(places.lakay)}>🏠 Lakay</button>
            <button onClick={() => choosePlace(places.travay)}>💼 Pétion-Ville</button>
            <button onClick={() => choosePlace(places.airport)}>✈️ Ayewopò</button>
          </div>

          <div className="section-heading"><div><p className="eyebrow">Chwazi sèvis la</p><h2>Machin ki disponib</h2></div><span>{quote ? `${quote.distance_km.toFixed(1)} km · ${quote.duration_min} min` : 'Pri kalkile nan Supabase'}</span></div>

          <div className="ride-list">
            {rideOptions.map((option) => (
              <button key={option.id} className={`ride-option ${selectedRide === option.id ? 'selected' : ''}`} onClick={() => setSelectedRide(option.id)} disabled={requestState === 'searching'}>
                <span className="ride-icon">{option.id === 'moto' ? '🏍️' : option.id === 'comfort' ? '🚙' : '🚕'}</span>
                <span className="ride-copy"><strong>{option.name}</strong><small>{option.detail} · {option.eta}</small></span>
                <strong className="ride-price">{selectedRide === option.id && quote ? `${quote.fare_htg.toLocaleString('fr-FR')} HTG` : '—'}</strong>
              </button>
            ))}
          </div>

          <div className="payment-row"><div><span className="payment-icon">💵</span><div><small>Peman</small><strong>Lajan kach</strong></div></div><button>Chanje ›</button></div>

          {rideError && <div className="ride-error">{rideError}</div>}

          {requestState === 'searching' ? (
            <div className="searching-card"><div className="spinner" /><div><strong>N ap chèche yon chofè pou ou…</strong><small>{ride.name} · trajè #{rideId?.slice(0, 8)}</small></div></div>
          ) : (
            <button className="request-button" disabled={!quote || requestState === 'quoting' || requestState === 'requesting'} onClick={requestRide}>
              <span>{requestState === 'quoting' ? 'N ap kalkile pri…' : requestState === 'requesting' ? 'N ap voye demann lan…' : `Mande ${ride.name}`}</span>
              <strong>{quote ? `${quote.fare_htg.toLocaleString('fr-FR')} HTG` : '—'}</strong>
            </button>
          )}

          <p className="fine-print">Estimasyon an kalkile sou backend Supabase la. Pwochen etap la ap konekte yon sèvis kat/routage pou adrès lib ak distans sou wout reyèl.</p>
        </section>
      </section>
    </main>
  )
}
