'use client'

import { useMemo, useState } from 'react'

type RideOption = {
  id: 'moto' | 'standard' | 'comfort'
  name: string
  detail: string
  eta: string
  price: number
}

const rideOptions: RideOption[] = [
  { id: 'moto', name: 'Moto', detail: '1 pasaje', eta: '3 min', price: 250 },
  { id: 'standard', name: 'Standard', detail: 'Jiska 4 pasaje', eta: '5 min', price: 450 },
  { id: 'comfort', name: 'Comfort', detail: 'Plis espas', eta: '7 min', price: 650 },
]

export default function HomePage() {
  const [pickup, setPickup] = useState('Pozisyon aktyèl mwen')
  const [destination, setDestination] = useState('')
  const [selectedRide, setSelectedRide] = useState<RideOption['id']>('standard')
  const [requestState, setRequestState] = useState<'idle' | 'searching'>('idle')

  const ride = useMemo(
    () => rideOptions.find((option) => option.id === selectedRide) ?? rideOptions[1],
    [selectedRide]
  )

  const canRequest = destination.trim().length > 2

  function requestRide() {
    if (!canRequest) return
    setRequestState('searching')
  }

  return (
    <main className="shell">
      <section className="phone-frame">
        <div className="map-panel">
          <div className="map-grid" />
          <div className="topbar">
            <button className="round-button" aria-label="Louvri meni">☰</button>
            <div className="brand-chip">
              <span className="brand-mark">T</span>
              <div>
                <strong>Taxi Platform Haiti</strong>
                <small>Deplase fasil, deplase an sekirite</small>
              </div>
            </div>
            <button className="round-button" aria-label="Pwofil">👤</button>
          </div>

          <div className="map-label label-one">Delmas</div>
          <div className="map-label label-two">Pétion-Ville</div>
          <div className="map-label label-three">Port-au-Prince</div>
          <div className="road road-a" />
          <div className="road road-b" />
          <div className="road road-c" />
          <div className="location-dot"><span /></div>
          <div className="driver-marker driver-one">🚕</div>
          <div className="driver-marker driver-two">🚗</div>
          <div className="driver-marker driver-three">🏍️</div>
          <button className="locate-button" aria-label="Retounen sou pozisyon mwen">⌖</button>
        </div>

        <section className="booking-sheet">
          <div className="grabber" />
          <div className="greeting-row">
            <div>
              <p className="eyebrow">Bonjou 👋</p>
              <h1>Ki kote ou prale?</h1>
            </div>
            <span className="online-pill">Chofè disponib</span>
          </div>

          <div className="route-card">
            <div className="route-line">
              <span className="pickup-dot" />
              <div className="input-wrap">
                <label htmlFor="pickup">Kote pou pran ou</label>
                <input id="pickup" value={pickup} onChange={(e) => setPickup(e.target.value)} />
              </div>
            </div>
            <div className="connector" />
            <div className="route-line">
              <span className="destination-dot" />
              <div className="input-wrap">
                <label htmlFor="destination">Destinasyon</label>
                <input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Egzanp: Pétion-Ville, Champs de Mars..."
                />
              </div>
            </div>
          </div>

          <div className="quick-places">
            <button onClick={() => setDestination('Lakay')}>🏠 Lakay</button>
            <button onClick={() => setDestination('Travay')}>💼 Travay</button>
            <button onClick={() => setDestination('Aéroport International Toussaint Louverture')}>✈️ Ayewopò</button>
          </div>

          <div className="section-heading">
            <div>
              <p className="eyebrow">Chwazi sèvis la</p>
              <h2>Machin ki disponib</h2>
            </div>
            <span>Pri estimatif</span>
          </div>

          <div className="ride-list">
            {rideOptions.map((option) => (
              <button
                key={option.id}
                className={`ride-option ${selectedRide === option.id ? 'selected' : ''}`}
                onClick={() => setSelectedRide(option.id)}
              >
                <span className="ride-icon">{option.id === 'moto' ? '🏍️' : option.id === 'comfort' ? '🚙' : '🚕'}</span>
                <span className="ride-copy">
                  <strong>{option.name}</strong>
                  <small>{option.detail} · {option.eta}</small>
                </span>
                <strong className="ride-price">{option.price.toLocaleString('fr-FR')} HTG</strong>
              </button>
            ))}
          </div>

          <div className="payment-row">
            <div>
              <span className="payment-icon">💵</span>
              <div>
                <small>Peman</small>
                <strong>Lajan kach</strong>
              </div>
            </div>
            <button>Chanje ›</button>
          </div>

          {requestState === 'searching' ? (
            <div className="searching-card">
              <div className="spinner" />
              <div>
                <strong>N ap chèche yon chofè pou ou…</strong>
                <small>{ride.name} · anviwon {ride.eta}</small>
              </div>
              <button onClick={() => setRequestState('idle')}>Anile</button>
            </div>
          ) : (
            <button className="request-button" disabled={!canRequest} onClick={requestRide}>
              <span>Mande {ride.name}</span>
              <strong>{ride.price.toLocaleString('fr-FR')} HTG</strong>
            </button>
          )}

          <p className="fine-print">Pri final la ka varye selon distans, tan ak kondisyon trajè a.</p>
        </section>
      </section>
    </main>
  )
}
