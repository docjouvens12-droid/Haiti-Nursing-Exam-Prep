'use client'

import { useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type CompletedRide = {
  id: string
  driver_id: string | null
  pickup_address: string
  destination_address: string
  estimated_fare_htg: number | string | null
  final_fare_htg: number | string | null
  completed_at: string | null
}

const dismissedKey = (userId: string, rideId: string) => `taxi-dismissed-receipt:${userId}:${rideId}`

export default function PassengerRideCompletion() {
  const [user, setUser] = useState<User | null>(null)
  const [ride, setRide] = useState<CompletedRide | null>(null)
  const [hiddenRideId, setHiddenRideId] = useState<string | null>(null)
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [rated, setRated] = useState(false)

  const fare = useMemo(() => Number(ride?.final_fare_htg ?? ride?.estimated_fare_htg ?? 0), [ride])

  useEffect(() => {
    let active = true
    async function syncUser() {
      const { data } = await supabase.auth.getUser()
      if (active) setUser(data.user ?? null)
    }
    void syncUser()
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setRide(null)
      setHiddenRideId(null)
    })
    const authTimer = window.setInterval(() => void syncUser(), 5000)
    return () => {
      active = false
      window.clearInterval(authTimer)
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setRide(null)
      return
    }
    const currentUser = user
    let active = true

    async function getLatestCompleted(): Promise<CompletedRide | null> {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_latest_completed_ride')
      if (!rpcError) {
        const rpcRow = Array.isArray(rpcData) ? rpcData[0] : rpcData
        if (rpcRow) return rpcRow as CompletedRide
      }

      const { data: fallbackData } = await supabase
        .from('rides')
        .select('id,driver_id,pickup_address,destination_address,estimated_fare_htg,final_fare_htg,completed_at')
        .eq('passenger_id', currentUser.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      return (fallbackData as CompletedRide | null) ?? null
    }

    async function loadLatestCompleted() {
      const row = await getLatestCompleted()
      if (!active) return
      if (!row) {
        setRide(null)
        return
      }
      if (row.id === hiddenRideId) return
      if (window.localStorage.getItem(dismissedKey(currentUser.id, row.id)) === '1') {
        setRide((current) => current?.id === row.id ? null : current)
        return
      }

      const { data: existingRating } = await supabase
        .from('ratings')
        .select('id,stars')
        .eq('ride_id', row.id)
        .eq('rater_id', currentUser.id)
        .maybeSingle()
      if (!active) return
      if (existingRating) {
        window.localStorage.setItem(dismissedKey(currentUser.id, row.id), '1')
        setRide(null)
        return
      }

      setRide((current) => {
        if (current?.id !== row.id) {
          setRated(false)
          setStars(0)
          setComment('')
          setMessage('')
        }
        return row
      })
    }

    void loadLatestCompleted()
    const pollTimer = window.setInterval(() => void loadLatestCompleted(), 2500)
    const channel = supabase
      .channel(`passenger-completed-${currentUser.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rides',
        filter: `passenger_id=eq.${currentUser.id}`,
      }, (payload) => {
        if ((payload.new as any)?.status === 'completed') void loadLatestCompleted()
      })
      .subscribe()

    return () => {
      active = false
      window.clearInterval(pollTimer)
      supabase.removeChannel(channel)
    }
  }, [user, hiddenRideId])

  async function submitRating() {
    if (!user || !ride || !ride.driver_id || stars < 1 || stars > 5 || rated) return
    setBusy(true)
    setMessage('')
    const { error } = await supabase.from('ratings').insert({
      ride_id: ride.id,
      rater_id: user.id,
      rated_user_id: ride.driver_id,
      stars,
      comment: comment.trim() || null,
    })
    if (error) setMessage(error.message)
    else {
      setRated(true)
      window.localStorage.setItem(dismissedKey(user.id, ride.id), '1')
      setMessage('Merci ! Votre évaluation a été enregistrée.')
    }
    setBusy(false)
  }

  function closeReceipt() {
    if (!ride || !user) return
    window.localStorage.setItem(dismissedKey(user.id, ride.id), '1')
    setHiddenRideId(ride.id)
    setRide(null)
  }

  if (!user || !ride) return null

  return <div className="receiptBackdrop" role="dialog" aria-modal="true" aria-label="Trajet terminé">
    <section className="receiptCard">
      <div className="check">✓</div>
      <p className="eyebrow">TRAJET TERMINÉ</p>
      <h2>Merci d’avoir voyagé avec Taxi Platform Haiti</h2>

      <div className="route">
        <div><span>📍</span><small>Prise en charge</small><strong>{ride.pickup_address}</strong></div>
        <div><span>🏁</span><small>Destination</small><strong>{ride.destination_address}</strong></div>
      </div>

      <div className="summary">
        <div><small>Montant final</small><strong>{fare.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} HTG</strong></div>
        <div><small>Paiement</small><strong>💵 Espèces</strong></div>
      </div>

      <div className="ratingBox">
        <h3>{rated ? 'Évaluation envoyée' : 'Comment s’est passé votre trajet ?'}</h3>
        <div className="stars" aria-label="Évaluation sur cinq étoiles">
          {[1,2,3,4,5].map((n) => <button key={n} disabled={rated || busy} className={n <= stars ? 'selected' : ''} onClick={() => setStars(n)} aria-label={`${n} étoile${n > 1 ? 's' : ''}`}>★</button>)}
        </div>
        {!rated && <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ajouter un commentaire (facultatif)" maxLength={500} />}
        {message && <p className={rated ? 'success' : 'error'}>{message}</p>}
        {!rated && <button className="submit" disabled={busy || stars === 0} onClick={submitRating}>{busy ? 'Envoi…' : 'Envoyer mon évaluation'}</button>}
      </div>

      <button className="close" onClick={closeReceipt}>{rated ? 'Terminer' : 'Plus tard'}</button>
    </section>

    <style jsx>{`
      .receiptBackdrop{position:fixed;inset:0;z-index:2147483000;background:rgba(10,22,34,.55);display:flex;align-items:flex-end;justify-content:center;padding:18px;padding-bottom:calc(18px + env(safe-area-inset-bottom));backdrop-filter:blur(4px)}
      .receiptCard{width:min(100%,520px);max-height:88vh;overflow:auto;background:#fff;border-radius:28px;padding:22px;color:#102033;box-shadow:0 30px 90px rgba(0,0,0,.28);font-family:Inter,system-ui,sans-serif}
      .check{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:#e7f7f1;color:#0f7a62;font-size:30px;font-weight:900;margin:0 auto 10px}
      .eyebrow{text-align:center;margin:0;color:#0f7a62;font-size:12px;font-weight:900;letter-spacing:.12em}
      h2{text-align:center;margin:8px 0 18px;font-size:22px;line-height:1.16}
      .route{display:grid;gap:10px;border:1px solid #e2e8ee;border-radius:18px;padding:14px;background:#f9fbfc}
      .route div{display:grid;grid-template-columns:auto 1fr;column-gap:9px}.route span{grid-row:1/3;font-size:22px}.route small{color:#7b8998;font-size:11px}.route strong{font-size:14px;margin-top:2px}
      .summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.summary div{background:#102033;color:#fff;border-radius:16px;padding:13px}.summary small,.summary strong{display:block}.summary small{font-size:10px;color:#b9c7d4}.summary strong{margin-top:4px;font-size:15px}
      .ratingBox{margin-top:14px;border-radius:18px;background:#f5f8f7;padding:14px}.ratingBox h3{margin:0 0 10px;font-size:16px}.stars{display:flex;gap:5px}.stars button{border:0;background:transparent;color:#cbd3dc;font-size:34px;line-height:1;padding:2px;cursor:pointer}.stars button.selected{color:#f5b301}.stars button:disabled{cursor:default}
      textarea{width:100%;min-height:82px;resize:vertical;margin-top:10px;border:1px solid #dbe3e8;border-radius:13px;padding:11px;font:inherit;color:#102033;background:#fff}
      .submit,.close{width:100%;border:0;border-radius:14px;padding:13px 14px;font-weight:900;cursor:pointer}.submit{margin-top:10px;background:#0f7a62;color:#fff}.submit:disabled{opacity:.45;cursor:not-allowed}.close{margin-top:10px;background:#eef2f5;color:#304357}
      .success{color:#0c7659;font-weight:800}.error{color:#a22d2d;font-weight:800}
      @media(min-width:700px){.receiptBackdrop{align-items:center}.receiptCard{border-radius:30px}}
    `}</style>
  </div>
}
