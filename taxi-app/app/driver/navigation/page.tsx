'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import DriverAutoNavigationMap from '../../../components/DriverAutoNavigationMap'

type RideStatus = 'accepted' | 'driver_arriving' | 'in_progress'

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
}

export default function DriverNavigationPage() {
  const [ride, setRide] = useState<Ride | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [lang, setLang] = useState<'fr' | 'ht'>('fr')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('taxi-language')
    if (saved === 'ht' || saved === 'fr') setLang(saved)
    void loadRide()
  }, [])

  async function loadRide() {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      location.replace('/')
      return
    }

    const { data, error } = await supabase
      .from('rides')
      .select('id,status,pickup_address,destination_address,pickup_latitude,pickup_longitude,destination_latitude,destination_longitude,estimated_distance_km,estimated_duration_min,estimated_fare_htg')
      .eq('driver_id', auth.user.id)
      .in('status', ['accepted', 'driver_arriving', 'in_progress'])
      .order('requested_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      location.replace('/driver/dashboard')
      return
    }

    setRide(data as Ride)
    setLoading(false)
  }

  async function advanceRide() {
    if (!ride || busy) return
    setBusy(true)
    setMessage('')

    let error: any = null
    if (ride.status === 'accepted') {
      ;({ error } = await supabase.rpc('mark_driver_arriving', { p_ride_id: ride.id }))
    } else if (ride.status === 'driver_arriving') {
      ;({ error } = await supabase.rpc('start_ride', { p_ride_id: ride.id }))
    } else {
      ;({ error } = await supabase.rpc('complete_ride', {
        p_ride_id: ride.id,
        p_final_fare_htg: ride.estimated_fare_htg ?? 0,
        p_payment_method: 'cash',
      }))
    }

    if (error) {
      setMessage(error.message)
      setBusy(false)
      return
    }

    if (ride.status === 'in_progress') {
      location.replace('/driver/dashboard')
      return
    }

    await loadRide()
    setBusy(false)
  }

  if (loading || !ride) {
    return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#eef3f6',fontFamily:'Inter,system-ui,sans-serif',color:'#102033'}}><strong>{lang === 'fr' ? 'Ouverture du GPS…' : 'GPS ap louvri…'}</strong></main>
  }

  const goingToPassenger = ride.status !== 'in_progress'
  const heading = goingToPassenger
    ? (lang === 'fr' ? 'VERS LE PASSAGER' : 'ALE KOTE PASAJE A')
    : (lang === 'fr' ? 'TRAJET EN COURS' : 'TRAJÈ AP FÈT')
  const address = goingToPassenger ? ride.pickup_address : ride.destination_address
  const actionLabel = ride.status === 'accepted'
    ? (lang === 'fr' ? 'Je suis arrivé' : 'Mwen rive')
    : ride.status === 'driver_arriving'
      ? (lang === 'fr' ? 'Commencer le trajet' : 'Kòmanse trajè a')
      : (lang === 'fr' ? 'Terminer le trajet' : 'Fini trajè a')

  return <main style={{minHeight:'100vh',background:'#eef3f6',padding:'16px 12px 110px',fontFamily:'Inter,system-ui,sans-serif',color:'#102033'}}>
    <section style={{maxWidth:760,margin:'0 auto'}}>
      <div style={{background:'#102033',color:'#fff',borderRadius:20,padding:'16px',marginBottom:12}}>
        <small style={{display:'block',opacity:.72,fontWeight:800,letterSpacing:'.06em'}}>{heading}</small>
        <h1 style={{margin:'6px 0 2px',fontSize:24}}>{address}</h1>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:10}}>
          <span style={{background:'#1c3148',borderRadius:999,padding:'8px 10px',fontWeight:800}}>{goingToPassenger ? (lang === 'fr' ? 'GPS vers le client' : 'GPS pou kliyan an') : (ride.estimated_distance_km == null ? '—' : `${Number(ride.estimated_distance_km).toFixed(1)} km`)}</span>
          <span style={{background:'#1c3148',borderRadius:999,padding:'8px 10px',fontWeight:800}}>{goingToPassenger ? (lang === 'fr' ? 'Distance et ETA en direct' : 'Distans ak ETA an dirèk') : `⏱ ${ride.estimated_duration_min == null ? '—' : `${Math.round(Number(ride.estimated_duration_min))} min`}`}</span>
        </div>
      </div>

      <DriverAutoNavigationMap ride={ride} lang={lang} />

      {message && <div style={{background:'#fff1f1',color:'#a12626',borderRadius:14,padding:12,marginTop:12,fontWeight:700}}>{message}</div>}

      <button onClick={() => void advanceRide()} disabled={busy} style={{width:'100%',marginTop:14,border:0,borderRadius:16,padding:'16px',background:'#0d7b61',color:'#fff',fontSize:17,fontWeight:900}}>
        {busy ? (lang === 'fr' ? 'Mise à jour…' : 'N ap mete ajou…') : actionLabel}
      </button>
    </section>
  </main>
}

// deployment trigger: accepted-ride GPS flow
