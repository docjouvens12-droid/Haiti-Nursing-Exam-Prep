'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import DriverMobileNavigationMap from '../../../components/DriverMobileNavigationMap'

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
  const [liveDistanceKm, setLiveDistanceKm] = useState<number | null>(null)
  const [liveEtaMin, setLiveEtaMin] = useState<number | null>(null)

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
      window.location.assign('https://taxi-platform-haiti.vercel.app/driver/dashboard?from=navigation')
      return
    }

    setRide(data as Ride)
    setLiveDistanceKm(null)
    setLiveEtaMin(null)
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
      window.location.assign('https://taxi-platform-haiti.vercel.app/driver/dashboard?ride=completed')
      return
    }

    await loadRide()
    setBusy(false)
  }

  if (loading || !ride) {
    return <main className="loading"><strong>{lang === 'fr' ? 'Ouverture du GPS…' : 'GPS ap louvri…'}</strong><style jsx>{`.loading{min-height:100vh;display:grid;place-items:center;background:#eef3f6;font-family:Inter,system-ui,sans-serif;color:#102033}`}</style></main>
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

  const distanceLabel = liveDistanceKm == null
    ? (lang === 'fr' ? 'Distance GPS…' : 'Distans GPS…')
    : `${liveDistanceKm.toFixed(1)} km`
  const etaLabel = liveEtaMin == null
    ? (lang === 'fr' ? 'ETA en direct…' : 'ETA an dirèk…')
    : `${liveEtaMin} min`

  return <main className="page">
    <section className="shell">
      <div className="tripHeader">
        <small>{heading}</small>
        <h1>{address}</h1>
        <div className="metrics">
          <span><b>{distanceLabel}</b><em>{lang === 'fr' ? 'Distance' : 'Distans'}</em></span>
          <span><b>{etaLabel}</b><em>ETA</em></span>
        </div>
      </div>

      <div className="mapWrap">
        <DriverMobileNavigationMap
          ride={ride}
          lang={lang}
          onMetricsChange={({ distanceKm, etaMin }) => {
            setLiveDistanceKm(distanceKm)
            setLiveEtaMin(etaMin)
          }}
        />
      </div>

      {message && <div className="message">{message}</div>}

      <button className="actionButton" onClick={() => void advanceRide()} disabled={busy}>
        {busy ? (lang === 'fr' ? 'Mise à jour…' : 'N ap mete ajou…') : actionLabel}
      </button>
    </section>

    <style jsx>{`
      .page{min-height:100vh;background:#eef3f6;padding:12px 12px 104px;font-family:Inter,system-ui,sans-serif;color:#102033;overflow-x:hidden}
      .shell{display:block!important;max-width:760px;margin:0 auto;width:100%;min-width:0;overflow:visible}
      .tripHeader{display:block;width:100%;box-sizing:border-box;background:#102033;color:#fff;border-radius:18px;padding:14px;margin-bottom:10px;box-shadow:0 10px 28px rgba(16,32,51,.12)}
      .tripHeader small{display:block;opacity:.72;font-weight:900;letter-spacing:.06em;font-size:10px}
      .tripHeader h1{margin:5px 0 0;font-size:21px;line-height:1.2;overflow-wrap:anywhere}
      .metrics{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px}
      .metrics span{display:flex;flex-direction:column;background:#1c3148;border-radius:13px;padding:9px 10px;min-width:0}
      .metrics b{font-size:15px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .metrics em{font-style:normal;font-size:10px;opacity:.68;margin-top:3px;font-weight:700}
      .mapWrap{display:block;width:100%;min-width:0;max-width:100%;overflow:hidden;border-radius:18px}
      .message{display:block;width:100%;box-sizing:border-box;background:#fff1f1;color:#a12626;border-radius:13px;padding:11px 12px;margin-top:10px;font-weight:750;font-size:13px}
      .actionButton{display:block;width:100%;height:auto;box-sizing:border-box;margin-top:12px;border:0;border-radius:15px;padding:15px 16px;background:#0d7b61;color:#fff;font-size:16px;font-weight:900;box-shadow:0 8px 20px rgba(13,123,97,.2)}
      .actionButton:disabled{opacity:.62}
      @media(max-width:600px){
        .page{padding:10px 10px 92px}
        .shell{display:block!important;width:100%;max-width:100%}
        .tripHeader{border-radius:16px;padding:12px;margin-bottom:8px}
        .tripHeader h1{font-size:18px;line-height:1.18}
        .metrics{gap:7px;margin-top:9px}
        .metrics span{padding:8px 9px;border-radius:12px}
        .metrics b{font-size:14px}
        .actionButton{margin-top:10px;border-radius:14px;padding:14px 15px;font-size:15px;position:sticky;bottom:10px;z-index:20}
      }
    `}</style>
  </main>
}
