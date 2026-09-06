'use client'

import dynamic from 'next/dynamic'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

const TaxiMap = dynamic(() => import('../components/TaxiMap'), { ssr: false })

type Lang = 'fr' | 'ht'
type RideOption = { id: 'moto' | 'standard' | 'comfort'; name: string; detailFr: string; detailHt: string; eta: string }
type Point = { lat: number; lng: number }
type Quote = { distance_km: number; duration_min: number; fare_htg: number }
type SearchResult = { id: string; label: string; center: [number, number] }
type RouteGeometry = { type: 'LineString'; coordinates: number[][] }

const rideOptions: RideOption[] = [
  { id: 'moto', name: 'Moto', detailFr: '1 passager', detailHt: '1 pasaje', eta: '3 min' },
  { id: 'standard', name: 'Standard', detailFr: 'Jusqu’à 4 passagers', detailHt: 'Jiska 4 pasaje', eta: '5 min' },
  { id: 'comfort', name: 'Comfort', detailFr: 'Plus d’espace', detailHt: 'Plis espas', eta: '7 min' },
]

const copy = {
  fr: {
    tagline: 'Déplacez-vous facilement, en toute sécurité', welcome: 'BON RETOUR', createPassenger: 'CRÉER UN COMPTE PASSAGER',
    signInTitle: 'Connectez-vous pour commander un taxi', signUpTitle: 'Inscrivez-vous comme passager', fullName: 'Nom complet', email: 'E-mail', password: 'Mot de passe',
    wait: 'Veuillez patienter…', signIn: 'Se connecter', createAccount: 'Créer mon compte', noAccount: 'Pas encore de compte ? Créez-en un', haveAccount: 'Vous avez déjà un compte ? Connectez-vous',
    accountCreated: 'Compte créé. Vérifiez votre e-mail pour confirmer votre adresse, puis connectez-vous.', hello: 'Bonjour', where: 'Où allez-vous ?', drivers: 'Chauffeurs disponibles',
    pickup: 'Lieu de prise en charge', current: 'Ma position actuelle', testPosition: 'Port-au-Prince (position de test)', destination: 'Destination', destinationPlaceholder: 'Saisissez une adresse ou un lieu en Haïti',
    searchingAddress: 'Recherche des adresses…', chooseService: 'Choisissez le service', vehicles: 'Véhicules disponibles', chooseDestination: 'Choisissez une destination', payment: 'Paiement', cash: 'Espèces', change: 'Changer ›',
    searchingDriver: 'Nous cherchons un chauffeur pour vous…', trip: 'trajet', calculating: 'Calcul du prix…', sending: 'Envoi de la demande…', request: 'Commander', mapNote: 'Carte, recherche et itinéraire : Mapbox. Prix et création du trajet : Supabase.'
  },
  ht: {
    tagline: 'Deplase fasil, deplase an sekirite', welcome: 'BYENVINI ANKÒ', createPassenger: 'KREYE KONT PASAJE',
    signInTitle: 'Konekte pou mande taksi', signUpTitle: 'Enskri kòm pasaje', fullName: 'Non konplè', email: 'Imel', password: 'Modpas',
    wait: 'Tanpri tann…', signIn: 'Konekte', createAccount: 'Kreye kont mwen', noAccount: 'Ou poko gen kont? Kreye youn', haveAccount: 'Ou deja gen kont? Konekte',
    accountCreated: 'Kont lan kreye. Tcheke imel ou pou konfime adrès la, epi konekte.', hello: 'Bonjou', where: 'Ki kote ou prale?', drivers: 'Chofè disponib',
    pickup: 'Kote pou pran ou', current: 'Pozisyon aktyèl mwen', testPosition: 'Port-au-Prince (pozisyon tès)', destination: 'Destinasyon', destinationPlaceholder: 'Ekri yon adrès oswa yon kote an Ayiti',
    searchingAddress: 'N ap chèche adrès yo…', chooseService: 'Chwazi sèvis la', vehicles: 'Machin ki disponib', chooseDestination: 'Chwazi destinasyon', payment: 'Peman', cash: 'Lajan kach', change: 'Chanje ›',
    searchingDriver: 'N ap chèche yon chofè pou ou…', trip: 'trajè', calculating: 'N ap kalkile pri…', sending: 'N ap voye demann lan…', request: 'Mande', mapNote: 'Kat, rechèch ak routage: Mapbox. Pri ak kreyasyon trajè: Supabase.'
  }
}

function LanguageMenu({ lang, onChange }: { lang: Lang; onChange: (lang: Lang) => void }) {
  return <div className="language-switch" aria-label="Language selector">
    <button className={lang === 'fr' ? 'active' : ''} onClick={() => onChange('fr')}>FR</button>
    <button className={lang === 'ht' ? 'active' : ''} onClick={() => onChange('ht')}>KREYÒL</button>
  </div>
}

export default function HomePage() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const [lang, setLang] = useState<Lang>('fr')
  const t = copy[lang]
  const [user, setUser] = useState<User | null>(null)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [authBusy, setAuthBusy] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pickup, setPickup] = useState(t.current)
  const [pickupCoords, setPickupCoords] = useState<Point | null>(null)
  const [destination, setDestination] = useState('')
  const [destinationCoords, setDestinationCoords] = useState<Point | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchBusy, setSearchBusy] = useState(false)
  const [routeGeometry, setRouteGeometry] = useState<RouteGeometry | null>(null)
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null)
  const [routeDurationMin, setRouteDurationMin] = useState<number | null>(null)
  const [selectedRide, setSelectedRide] = useState<RideOption['id']>('standard')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [requestState, setRequestState] = useState<'idle' | 'quoting' | 'requesting' | 'searching'>('idle')
  const [rideId, setRideId] = useState<string | null>(null)
  const [rideError, setRideError] = useState('')

  const ride = useMemo(() => rideOptions.find((o) => o.id === selectedRide) ?? rideOptions[1], [selectedRide])

  useEffect(() => {
    const saved = window.localStorage.getItem('taxi-language') as Lang | null
    if (saved === 'fr' || saved === 'ht') setLang(saved)
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => listener.subscription.unsubscribe()
  }, [])

  function changeLanguage(next: Lang) {
    setLang(next)
    window.localStorage.setItem('taxi-language', next)
    setPickup((current) => current === copy.fr.current || current === copy.ht.current ? copy[next].current : current)
  }

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (p) => setPickupCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => { setPickupCoords({ lat: 18.5392, lng: -72.3364 }); setPickup(copy[lang].testPosition) },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [lang])

  useEffect(() => {
    if (!token || destination.trim().length < 3 || destinationCoords) { setSearchResults([]); return }
    const timer = window.setTimeout(async () => {
      setSearchBusy(true)
      try {
        const proximity = pickupCoords ? `&proximity=${pickupCoords.lng},${pickupCoords.lat}` : ''
        const language = lang === 'fr' ? 'fr' : 'fr'
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?country=ht&autocomplete=true&limit=5&language=${language}${proximity}&access_token=${encodeURIComponent(token)}`
        const response = await fetch(url)
        const json = await response.json()
        setSearchResults((json.features ?? []).map((f: any) => ({ id: f.id, label: f.place_name, center: f.center })))
      } catch { setSearchResults([]) } finally { setSearchBusy(false) }
    }, 350)
    return () => window.clearTimeout(timer)
  }, [destination, destinationCoords, pickupCoords, token, lang])

  useEffect(() => {
    if (!token || !pickupCoords || !destinationCoords) { setRouteGeometry(null); setRouteDistanceKm(null); setRouteDurationMin(null); return }
    let cancelled = false
    ;(async () => {
      try {
        const coords = `${pickupCoords.lng},${pickupCoords.lat};${destinationCoords.lng},${destinationCoords.lat}`
        const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?overview=full&geometries=geojson&steps=false&access_token=${encodeURIComponent(token)}`)
        const json = await response.json(); const route = json.routes?.[0]
        if (!route || cancelled) return
        setRouteGeometry(route.geometry); setRouteDistanceKm(route.distance / 1000); setRouteDurationMin(Math.max(1, Math.round(route.duration / 60)))
      } catch { if (!cancelled) { setRouteGeometry(null); setRouteDistanceKm(null); setRouteDurationMin(null) } }
    })()
    return () => { cancelled = true }
  }, [pickupCoords, destinationCoords, token])

  useEffect(() => {
    if (!user || !pickupCoords || !destinationCoords) { setQuote(null); return }
    let cancelled = false
    setRequestState((s) => s === 'searching' ? s : 'quoting')
    supabase.rpc('quote_ride', { p_service_type: selectedRide, p_pickup_latitude: pickupCoords.lat, p_pickup_longitude: pickupCoords.lng, p_destination_latitude: destinationCoords.lat, p_destination_longitude: destinationCoords.lng })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setRideError(error.message); setQuote(null) }
        else { const row = Array.isArray(data) ? data[0] : data; setQuote(row ? { distance_km: Number(row.distance_km), duration_min: Number(row.duration_min), fare_htg: Number(row.fare_htg) } : null) }
        setRequestState((s) => s === 'searching' ? s : 'idle')
      })
    return () => { cancelled = true }
  }, [user, pickupCoords, destinationCoords, selectedRide])

  async function submitAuth(e: FormEvent) {
    e.preventDefault(); setAuthBusy(true); setAuthMessage('')
    if (authMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
      if (error) setAuthMessage(error.message); else if (!data.session) setAuthMessage(t.accountCreated)
    } else { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setAuthMessage(error.message) }
    setAuthBusy(false)
  }

  function chooseSearchResult(result: SearchResult) { setDestination(result.label); setDestinationCoords({ lng: result.center[0], lat: result.center[1] }); setSearchResults([]); setRideError('') }

  async function requestRide() {
    if (!user || !pickupCoords || !destinationCoords || !quote) return
    setRequestState('requesting'); setRideError('')
    const { data, error } = await supabase.rpc('request_ride_v2', { p_service_type: selectedRide, p_pickup_address: pickup, p_pickup_latitude: pickupCoords.lat, p_pickup_longitude: pickupCoords.lng, p_destination_address: destination, p_destination_latitude: destinationCoords.lat, p_destination_longitude: destinationCoords.lng })
    if (error) { setRideError(error.message); setRequestState('idle'); return }
    setRideId(String(data)); setRequestState('searching')
  }

  if (!user) return <main className="auth-shell"><section className="auth-card">
    <div className="auth-language-row"><LanguageMenu lang={lang} onChange={changeLanguage} /></div>
    <div className="auth-brand"><span className="brand-mark">T</span><div><strong>Taxi Platform Haiti</strong><small>{t.tagline}</small></div></div>
    <p className="eyebrow">{authMode === 'signin' ? t.welcome : t.createPassenger}</p>
    <h1>{authMode === 'signin' ? t.signInTitle : t.signUpTitle}</h1>
    <form onSubmit={submitAuth} className="auth-form">
      {authMode === 'signup' && <label>{t.fullName}<input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></label>}
      <label>{t.email}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>{t.password}<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required /></label>
      {authMessage && <div className="auth-message">{authMessage}</div>}
      <button className="auth-submit" disabled={authBusy}>{authBusy ? t.wait : authMode === 'signin' ? t.signIn : t.createAccount}</button>
    </form>
    <button className="auth-switch" onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}>{authMode === 'signin' ? t.noAccount : t.haveAccount}</button>
  </section></main>

  return <main className="shell"><section className="phone-frame">
    <div className="map-panel real-map-panel"><TaxiMap pickup={pickupCoords} destination={destinationCoords} routeGeometry={routeGeometry} />
      <div className="topbar"><button className="round-button">☰</button><div className="brand-chip"><span className="brand-mark">T</span><div><strong>Taxi Platform Haiti</strong><small>{t.tagline}</small></div></div><div className="top-actions"><LanguageMenu lang={lang} onChange={changeLanguage} /><button className="round-button" onClick={() => supabase.auth.signOut()}>↪</button></div></div>
    </div>
    <section className="booking-sheet"><div className="grabber" />
      <div className="greeting-row"><div><p className="eyebrow">{t.hello} {user.user_metadata?.full_name?.split(' ')[0] ?? ''} 👋</p><h1>{t.where}</h1></div><span className="online-pill">{t.drivers}</span></div>
      <div className="route-card"><div className="route-line"><span className="pickup-dot" /><div className="input-wrap"><label>{t.pickup}</label><input value={pickup} readOnly /></div></div><div className="connector" /><div className="route-line"><span className="destination-dot" /><div className="input-wrap"><label>{t.destination}</label><input value={destination} onChange={(e) => { setDestination(e.target.value); setDestinationCoords(null) }} placeholder={t.destinationPlaceholder} /></div></div></div>
      {(searchBusy || searchResults.length > 0) && <div className="search-results">{searchBusy && <div className="search-status">{t.searchingAddress}</div>}{searchResults.map((r) => <button key={r.id} onClick={() => chooseSearchResult(r)}><span>📍</span><strong>{r.label}</strong></button>)}</div>}
      <div className="section-heading"><div><p className="eyebrow">{t.chooseService}</p><h2>{t.vehicles}</h2></div><span>{routeDistanceKm && routeDurationMin ? `${routeDistanceKm.toFixed(1)} km · ${routeDurationMin} min` : quote ? `${quote.distance_km.toFixed(1)} km · ${quote.duration_min} min` : t.chooseDestination}</span></div>
      <div className="ride-list">{rideOptions.map((option) => <button key={option.id} className={`ride-option ${selectedRide === option.id ? 'selected' : ''}`} onClick={() => setSelectedRide(option.id)}><span className="ride-icon">{option.id === 'moto' ? '🏍️' : option.id === 'comfort' ? '🚙' : '🚕'}</span><span className="ride-copy"><strong>{option.name}</strong><small>{lang === 'fr' ? option.detailFr : option.detailHt} · {option.eta}</small></span><strong className="ride-price">{selectedRide === option.id && quote ? `${quote.fare_htg.toLocaleString('fr-FR')} HTG` : '—'}</strong></button>)}</div>
      <div className="payment-row"><div><span className="payment-icon">💵</span><div><small>{t.payment}</small><strong>{t.cash}</strong></div></div><button>{t.change}</button></div>
      {rideError && <div className="ride-error">{rideError}</div>}
      {requestState === 'searching' ? <div className="searching-card"><div className="spinner" /><div><strong>{t.searchingDriver}</strong><small>{ride.name} · {t.trip} #{rideId?.slice(0, 8)}</small></div></div> : <button className="request-button" disabled={!quote || requestState === 'quoting' || requestState === 'requesting'} onClick={requestRide}><span>{requestState === 'quoting' ? t.calculating : requestState === 'requesting' ? t.sending : `${t.request} ${ride.name}`}</span><strong>{quote ? `${quote.fare_htg.toLocaleString('fr-FR')} HTG` : '—'}</strong></button>}
      <p className="fine-print">{t.mapNote}</p>
    </section>
  </section></main>
}
