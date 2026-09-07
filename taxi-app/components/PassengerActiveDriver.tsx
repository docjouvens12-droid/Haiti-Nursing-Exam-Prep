'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

type RideSummary = {
  id: string
  status: 'accepted' | 'driver_arriving' | 'in_progress'
  pickup_address: string
  destination_address: string
  estimated_distance_km: number | string | null
  estimated_duration_min: number | null
  estimated_fare_htg: number | string | null
}

type DriverSummary = {
  ride_id: string
  ride_status: 'accepted' | 'driver_arriving' | 'in_progress'
  driver_id: string
  driver_name: string | null
  avatar_url: string | null
  average_rating: number | null
  total_rides: number | null
  vehicle_id: string | null
  vehicle_type: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_color: string | null
  plate_number: string | null
}

export default function PassengerActiveDriver() {
  const pathname = usePathname()
  const [ride, setRide] = useState<RideSummary | null>(null)
  const [driver, setDriver] = useState<DriverSummary | null>(null)
  const [email, setEmail] = useState('')
  const [lang, setLang] = useState<'fr' | 'ht'>('fr')

  useEffect(() => {
    if (pathname !== '/') return
    const saved = window.localStorage.getItem('taxi-language')
    if (saved === 'ht' || saved === 'fr') setLang(saved)

    let active = true

    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!active) return
      if (!user) {
        setEmail('')
        setRide(null)
        setDriver(null)
        return
      }

      setEmail(user.email ?? '')

      const { data: rideData, error: rideError } = await supabase
        .from('rides')
        .select('id,status,pickup_address,destination_address,estimated_distance_km,estimated_duration_min,estimated_fare_htg')
        .eq('passenger_id', user.id)
        .in('status', ['accepted', 'driver_arriving', 'in_progress'])
        .order('requested_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!active) return
      if (rideError || !rideData) {
        setRide(null)
        setDriver(null)
        return
      }

      setRide(rideData as RideSummary)

      const { data: driverData } = await supabase.rpc('get_passenger_active_driver')
      if (!active) return
      const row = Array.isArray(driverData) ? driverData[0] : driverData
      setDriver((row ?? null) as DriverSummary | null)
    }

    void load()
    const timer = window.setInterval(() => void load(), 2000)
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void load(), 80)
    })
    const onStorage = () => {
      const next = window.localStorage.getItem('taxi-language')
      if (next === 'ht' || next === 'fr') setLang(next)
    }
    window.addEventListener('storage', onStorage)

    return () => {
      active = false
      window.clearInterval(timer)
      authListener.subscription.unsubscribe()
      window.removeEventListener('storage', onStorage)
    }
  }, [pathname])

  if (pathname !== '/' || !ride) return null

  const status = ride.status === 'accepted'
    ? (lang === 'ht' ? 'Chofè a aksepte trajè a' : 'Votre chauffeur a accepté')
    : ride.status === 'driver_arriving'
      ? (lang === 'ht' ? 'Chofè a rive' : 'Votre chauffeur est arrivé')
      : (lang === 'ht' ? 'Trajè a ankou' : 'Trajet en cours')

  const name = driver?.driver_name?.trim() || (lang === 'ht' ? 'Chofè ou' : 'Votre chauffeur')
  const initial = name.charAt(0).toUpperCase()
  const rating = Number(driver?.average_rating ?? 0).toFixed(1)
  const vehicle = [driver?.vehicle_make, driver?.vehicle_model].filter(Boolean).join(' ') || (lang === 'ht' ? 'Veyikil' : 'Véhicule')
  const distance = ride.estimated_distance_km == null ? '—' : `${Number(ride.estimated_distance_km).toFixed(1)} km`
  const eta = ride.estimated_duration_min == null ? '—' : `${Math.round(Number(ride.estimated_duration_min))} min`
  const fare = ride.estimated_fare_htg == null ? '—' : `${Number(ride.estimated_fare_htg).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} HTG`

  return <aside className="active-ride-panel" aria-live="polite">
    <div className="account-line">{lang === 'ht' ? 'Kont kliyan' : 'Compte client'}: <strong>{email || '—'}</strong></div>
    <div className="status">{status}</div>

    <div className="driver-main">
      <div className="avatar">
        {driver?.avatar_url ? <img src={driver.avatar_url} alt="" /> : <span>{initial}</span>}
      </div>
      <div className="driver-copy">
        <strong>{name}</strong>
        <span>{driver ? `⭐ ${rating} / 5 · ${driver.total_rides ?? 0} ${lang === 'ht' ? 'trajè' : 'trajet'}` : (lang === 'ht' ? 'N ap chaje enfòmasyon chofè a…' : 'Chargement des informations du chauffeur…')}</span>
      </div>
      <div className="vehicle-icon">{driver?.vehicle_type === 'moto' ? '🏍️' : '🚕'}</div>
    </div>

    <div className="vehicle-line">
      <div><small>{lang === 'ht' ? 'Veyikil' : 'Véhicule'}</small><strong>{vehicle}</strong></div>
      <div className="plate"><small>{lang === 'ht' ? 'Plak' : 'Plaque'}</small><strong>{driver?.plate_number || '—'}</strong></div>
    </div>

    <div className="ride-box">
      <div><small>{lang === 'ht' ? 'Pran kliyan' : 'Prise en charge'}</small><strong>{ride.pickup_address}</strong></div>
      <div><small>{lang === 'ht' ? 'Destinasyon' : 'Destination'}</small><strong>{ride.destination_address}</strong></div>
      <div className="metrics"><span>{distance}</span><span>⏱ {eta}</span><span>💵 {fare}</span></div>
    </div>

    <style jsx>{`
      .active-ride-panel{position:fixed;left:50%;bottom:84px;transform:translateX(-50%);z-index:12050;width:min(calc(100vw - 20px),720px);max-height:58vh;overflow:auto;background:#fff;border:2px solid #0f7b61;border-radius:22px;padding:14px 15px;box-shadow:0 18px 60px rgba(16,32,51,.32);font-family:Inter,system-ui,sans-serif;color:#102033}
      .account-line{font-size:11px;color:#6c7c8c;margin-bottom:7px;overflow-wrap:anywhere}.account-line strong{color:#102033}
      .status{font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#0f7b61;margin-bottom:10px}
      .driver-main{display:flex;align-items:center;gap:12px}.avatar{width:48px;height:48px;border-radius:50%;overflow:hidden;background:#e6f5ef;display:grid;place-items:center;color:#0f7b61;font-size:21px;font-weight:900;flex:0 0 auto}.avatar img{width:100%;height:100%;object-fit:cover}.driver-copy{min-width:0;flex:1}.driver-copy strong,.driver-copy span{display:block}.driver-copy strong{font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.driver-copy span{font-size:12px;color:#6e7e8e;margin-top:3px;font-weight:700}.vehicle-icon{font-size:28px}
      .vehicle-line{display:flex;justify-content:space-between;gap:20px;margin-top:10px;padding-top:10px;border-top:1px solid #edf1f3}.vehicle-line small,.vehicle-line strong{display:block}.vehicle-line small,.ride-box small{color:#8493a1;font-size:10px}.vehicle-line strong{font-size:13px;margin-top:2px}.plate{text-align:right}
      .ride-box{margin-top:10px;padding:11px 12px;border-radius:15px;background:#f5f8fa;display:grid;gap:8px}.ride-box strong{display:block;font-size:13px;margin-top:2px}.metrics{display:flex;gap:7px;flex-wrap:wrap;margin-top:2px}.metrics span{background:#102033;color:#fff;border-radius:999px;padding:6px 8px;font-size:11px;font-weight:800}
      @media(max-width:600px){.active-ride-panel{bottom:78px;max-height:54vh;padding:12px 13px}.driver-copy strong{font-size:15px}}
    `}</style>
  </aside>
}
