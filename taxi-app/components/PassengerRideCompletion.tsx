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
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => authListener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) { setRide(null); return }
    const currentUser = user
    let active = true

    async function loadLatestCompleted() {
      const { data, error } = await supabase.rpc('get_my_latest_completed_ride')
      const row = Array.isArray(data) ? data[0] : data

      if (!active || error || !row || row.id === hiddenRideId) return
      if (window.localStorage.getItem(dismissedKey(currentUser.id, row.id)) === '1') {
        setRide(null)
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

      setRated(false)
      setStars(0)
      setComment('')
      setMessage('')
      setRide(row as CompletedRide)
    }

    loadLatestCompleted()

    const channel = supabase
      .channel(`passenger-completed-${currentUser.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rides',
        filter: `passenger_id=eq.${currentUser.id}`,
      }, (payload) => {
        if ((payload.new as any)?.status === 'completed') loadLatestCompleted()
      })
      .subscribe()

    return () => {
      active = false
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

  return <div className="ride-completion-backdrop" role="dialog" aria-modal="true" aria-label="Trajet terminé">
    <section className="ride-completion-card">
      <div className="ride-completion-check">✓</div>
      <p className="ride-completion-eyebrow">TRAJET TERMINÉ</p>
      <h2>Merci d’avoir voyagé avec Taxi Platform Haiti</h2>

      <div className="ride-receipt-route">
        <div><span>📍</span><small>Prise en charge</small><strong>{ride.pickup_address}</strong></div>
        <div><span>🏁</span><small>Destination</small><strong>{ride.destination_address}</strong></div>
      </div>

      <div className="ride-receipt-summary">
        <div><small>Montant final</small><strong>{fare.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} HTG</strong></div>
        <div><small>Paiement</small><strong>💵 Espèces</strong></div>
      </div>

      <div className="ride-rating-box">
        <h3>{rated ? 'Évaluation envoyée' : 'Comment s’est passé votre trajet ?'}</h3>
        <div className="ride-stars" aria-label="Évaluation sur cinq étoiles">
          {[1,2,3,4,5].map((n) => <button key={n} disabled={rated || busy} className={n <= stars ? 'selected' : ''} onClick={() => setStars(n)} aria-label={`${n} étoile${n > 1 ? 's' : ''}`}>★</button>)}
        </div>
        {!rated && <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ajouter un commentaire (facultatif)" maxLength={500} />}
        {message && <p className={rated ? 'ride-rating-success' : 'ride-rating-error'}>{message}</p>}
        {!rated && <button className="ride-rating-submit" disabled={busy || stars === 0} onClick={submitRating}>{busy ? 'Envoi…' : 'Envoyer mon évaluation'}</button>}
      </div>

      <button className="ride-receipt-close" onClick={closeReceipt}>{rated ? 'Terminer' : 'Plus tard'}</button>
    </section>
  </div>
}
