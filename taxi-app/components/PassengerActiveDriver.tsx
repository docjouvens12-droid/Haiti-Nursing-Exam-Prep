'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

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
  const [driver, setDriver] = useState<DriverSummary | null>(null)
  const [lang, setLang] = useState<'fr' | 'ht'>('fr')

  useEffect(() => {
    if (pathname !== '/') return
    const saved = window.localStorage.getItem('taxi-language')
    if (saved === 'ht' || saved === 'fr') setLang(saved)

    let active = true
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!active || !sessionData.session?.user) {
        if (active) setDriver(null)
        return
      }
      const { data, error } = await supabase.rpc('get_passenger_active_driver')
      if (!active) return
      if (error) {
        setDriver(null)
        return
      }
      const row = Array.isArray(data) ? data[0] : data
      setDriver((row ?? null) as DriverSummary | null)
    }

    void load()
    const timer = window.setInterval(() => void load(), 2500)
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void load(), 50)
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

  if (pathname !== '/' || !driver) return null

  const name = driver.driver_name?.trim() || (lang === 'ht' ? 'Chofè ou' : 'Votre chauffeur')
  const initial = name.charAt(0).toUpperCase()
  const rating = Number(driver.average_rating ?? 0).toFixed(1)
  const vehicle = [driver.vehicle_make, driver.vehicle_model].filter(Boolean).join(' ') || (lang === 'ht' ? 'Veyikil' : 'Véhicule')
  const status = driver.ride_status === 'accepted'
    ? (lang === 'ht' ? 'Chofè a aksepte trajè a' : 'Votre chauffeur a accepté')
    : driver.ride_status === 'driver_arriving'
      ? (lang === 'ht' ? 'Chofè a rive' : 'Votre chauffeur est arrivé')
      : (lang === 'ht' ? 'Trajè a ankou' : 'Trajet en cours')

  return <aside className="passenger-driver-card" aria-live="polite">
    <div className="driver-status">{status}</div>
    <div className="driver-main">
      <div className="driver-avatar">
        {driver.avatar_url ? <img src={driver.avatar_url} alt="" /> : <span>{initial}</span>}
      </div>
      <div className="driver-copy">
        <strong>{name}</strong>
        <span>⭐ {rating} / 5 · {driver.total_rides ?? 0} {lang === 'ht' ? 'trajè' : 'trajet'}</span>
      </div>
      <div className="vehicle-icon">{driver.vehicle_type === 'moto' ? '🏍️' : '🚕'}</div>
    </div>
    <div className="vehicle-line">
      <div><small>{lang === 'ht' ? 'Veyikil' : 'Véhicule'}</small><strong>{vehicle}</strong></div>
      <div className="plate"><small>{lang === 'ht' ? 'Plak' : 'Plaque'}</small><strong>{driver.plate_number || '—'}</strong></div>
    </div>
    <style jsx>{`
      .passenger-driver-card{position:fixed;left:50%;top:118px;transform:translateX(-50%);z-index:10050;width:min(calc(100vw - 24px),720px);background:#fff;border:2px solid #0f7b61;border-radius:22px;padding:15px 16px;box-shadow:0 18px 55px rgba(16,32,51,.28);font-family:Inter,system-ui,sans-serif;color:#102033}.driver-status{font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#0f7b61;margin-bottom:10px}.driver-main{display:flex;align-items:center;gap:12px}.driver-avatar{width:52px;height:52px;border-radius:50%;overflow:hidden;background:#e6f5ef;display:grid;place-items:center;color:#0f7b61;font-size:22px;font-weight:900;flex:0 0 auto}.driver-avatar img{width:100%;height:100%;object-fit:cover}.driver-copy{min-width:0;flex:1}.driver-copy strong,.driver-copy span{display:block}.driver-copy strong{font-size:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.driver-copy span{font-size:13px;color:#6e7e8e;margin-top:4px;font-weight:700}.vehicle-icon{font-size:30px}.vehicle-line{display:flex;justify-content:space-between;gap:20px;margin-top:12px;padding-top:11px;border-top:1px solid #edf1f3}.vehicle-line div{min-width:0}.vehicle-line small,.vehicle-line strong{display:block}.vehicle-line small{color:#8493a1;font-size:11px}.vehicle-line strong{font-size:14px;margin-top:2px}.plate{text-align:right}@media(max-width:600px){.passenger-driver-card{top:110px;padding:13px 14px}.driver-avatar{width:46px;height:46px}.driver-copy strong{font-size:16px}}
    `}</style>
  </aside>
}
