'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

type RideStatus = 'requested' | 'accepted' | 'driver_arriving' | 'in_progress' | 'completed' | 'cancelled'

type RideRow = {
  id: string
  status: RideStatus
  driver_id: string | null
  pickup_address: string
  destination_address: string
  service_type: 'moto' | 'standard' | 'comfort'
  estimated_fare_htg: number | null
  final_fare_htg: number | null
  requested_at: string
  accepted_at: string | null
  started_at: string | null
  completed_at: string | null
  cancelled_at: string | null
}

const terminalFreshMs = 10 * 60 * 1000

export default function PassengerRideStatusFlow() {
  const [ride, setRide] = useState<RideRow | null>(null)
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [ht, setHt] = useState(false)

  useEffect(() => {
    const findTarget = () => setTarget(document.querySelector<HTMLElement>('.shell .booking-sheet'))
    findTarget()
    const timer = window.setInterval(findTarget, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let alive = true

    const syncLang = () => setHt(window.localStorage.getItem('taxi-language') === 'ht')
    syncLang()

    async function loadRide() {
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth.user?.id
      if (!alive || !userId) {
        if (alive) setRide(null)
        return
      }

      const { data, error } = await supabase
        .from('rides')
        .select('id,status,driver_id,pickup_address,destination_address,service_type,estimated_fare_htg,final_fare_htg,requested_at,accepted_at,started_at,completed_at,cancelled_at')
        .eq('passenger_id', userId)
        .order('requested_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!alive || error || !data) {
        if (alive) setRide(null)
        return
      }

      const row = data as RideRow
      const dismissed = window.localStorage.getItem('movi-dismissed-terminal-ride')
      if ((row.status === 'completed' || row.status === 'cancelled') && dismissed === row.id) {
        setRide(null)
        return
      }

      if (row.status === 'completed' || row.status === 'cancelled') {
        const terminalAt = row.status === 'completed' ? row.completed_at : row.cancelled_at
        if (!terminalAt || Date.now() - new Date(terminalAt).getTime() > terminalFreshMs) {
          setRide(null)
          return
        }
      }

      setRide(row)
    }

    void loadRide()
    const timer = window.setInterval(() => void loadRide(), 1200)
    window.addEventListener('storage', syncLang)

    return () => {
      alive = false
      window.clearInterval(timer)
      window.removeEventListener('storage', syncLang)
    }
  }, [])

  const active = ride && ride.status !== 'requested'

  useEffect(() => {
    const sheet = document.querySelector<HTMLElement>('.shell .booking-sheet')
    if (!sheet) return
    if (active) sheet.classList.add('movi-passenger-ride-active')
    else sheet.classList.remove('movi-passenger-ride-active')
    return () => sheet.classList.remove('movi-passenger-ride-active')
  }, [active])

  if (!ride || ride.status === 'requested' || !target || !document.contains(target)) return null

  const status = ride.status
  const stage = status === 'accepted' ? 1 : status === 'driver_arriving' ? 2 : status === 'in_progress' ? 3 : 4
  const isTerminal = status === 'completed' || status === 'cancelled'
  const driverArrived = status === 'driver_arriving'

  const title = status === 'accepted'
    ? (ht ? 'Chofè a aksepte kous la' : 'Le chauffeur a accepté la course')
    : driverArrived
      ? (ht ? 'Chofè a rive' : 'Votre chauffeur est arrivé')
      : status === 'in_progress'
        ? (ht ? 'Trajè a kòmanse' : 'La course a commencé')
        : status === 'completed'
          ? (ht ? 'Trajè a fini' : 'Course terminée')
          : (ht ? 'Trajè a anile' : 'Course annulée')

  const subtitle = status === 'accepted'
    ? (ht ? 'Gade kat la pou pozisyon chofè a parapò ak ou.' : 'Suivez la carte pour voir le chauffeur par rapport à vous.')
    : driverArrived
      ? (ht ? 'Chofè a rive nan kote pou pran ou. Tanpri pare pou monte.' : 'Le chauffeur est arrivé à votre point de prise en charge. Veuillez vous préparer à monter.')
      : status === 'in_progress'
        ? (ht ? 'Kounye a w ap suiv chofè a sou wout pou destinasyon an.' : 'Vous suivez maintenant le chauffeur vers votre destination.')
        : status === 'completed'
          ? (ht ? 'Mèsi paske ou te itilize MOVI.' : 'Merci d’avoir utilisé MOVI.')
          : (ht ? 'Kous sa a pa aktif ankò.' : 'Cette course n’est plus active.')

  const dismissTerminal = () => {
    window.localStorage.setItem('movi-dismissed-terminal-ride', ride.id)
    setRide(null)
    window.setTimeout(() => window.location.reload(), 80)
  }

  return createPortal(
    <div className={`movi-passenger-flow-card ${isTerminal ? 'terminal' : ''} ${driverArrived ? 'arrived' : ''}`} aria-live="polite">
      <style>{`
        .movi-passenger-ride-active .searching-card{display:none!important}
        .movi-passenger-flow-card{margin:12px 0 4px;padding:14px;border-radius:20px;background:#f7fbf9;border:1px solid #dbeae4;box-shadow:0 10px 28px rgba(15,112,90,.08);font-family:Inter,system-ui,sans-serif}
        .movi-passenger-flow-card.arrived{background:#effaf5;border-color:#bfe4d4;box-shadow:0 12px 30px rgba(15,128,101,.13)}
        .movi-passenger-flow-card.terminal{background:#fff}
        .movi-passenger-flow-head{display:flex;align-items:flex-start;gap:11px}
        .movi-passenger-flow-icon{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:#e6f5ef;font-size:21px;flex:0 0 auto}.movi-passenger-flow-card.arrived .movi-passenger-flow-icon{background:#0f8065;color:#fff}
        .movi-passenger-flow-copy{min-width:0;flex:1}.movi-passenger-flow-copy strong{display:block;color:#10243a;font-size:15px;line-height:1.25;font-weight:900}.movi-passenger-flow-card.arrived .movi-passenger-flow-copy strong{font-size:17px;color:#0f6d58}.movi-passenger-flow-copy small{display:block;color:#6d7e77;font-size:11px;line-height:1.45;margin-top:4px}.movi-passenger-flow-card.arrived .movi-passenger-flow-copy small{color:#4f6f64;font-size:12px}
        .movi-passenger-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:13px 0 10px}.movi-passenger-step{height:5px;border-radius:999px;background:#dfe8e4}.movi-passenger-step.done{background:#0f8065}.movi-passenger-step.cancelled{background:#ef6a5b}
        .movi-passenger-route{padding:10px 11px;border-radius:14px;background:#fff;border:1px solid #e4ece8;display:grid;gap:5px}.movi-passenger-route span{font-size:10px;color:#64756e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.movi-passenger-route b{color:#0f8065;margin-right:5px}
        .movi-passenger-terminal-button{width:100%;margin-top:11px;border:0;border-radius:14px;background:#0f8065;color:#fff;padding:12px 14px;font-size:13px;font-weight:900}
      `}</style>
      <div className="movi-passenger-flow-head">
        <span className="movi-passenger-flow-icon">{status === 'completed' ? '✅' : status === 'cancelled' ? '✕' : driverArrived ? '📍' : '🚕'}</span>
        <div className="movi-passenger-flow-copy"><strong>{title}</strong><small>{subtitle}</small></div>
      </div>
      <div className="movi-passenger-steps" aria-hidden="true">
        {[1,2,3,4].map(step => <span key={step} className={`movi-passenger-step ${status === 'cancelled' ? 'cancelled' : step <= stage ? 'done' : ''}`} />)}
      </div>
      <div className="movi-passenger-route">
        <span><b>●</b>{ride.pickup_address}</span>
        <span><b>◆</b>{ride.destination_address}</span>
      </div>
      {isTerminal && <button type="button" className="movi-passenger-terminal-button" onClick={dismissTerminal}>{ht ? 'Mande yon nouvo kous' : 'Commander une nouvelle course'}</button>}
    </div>,
    target,
  )
}
