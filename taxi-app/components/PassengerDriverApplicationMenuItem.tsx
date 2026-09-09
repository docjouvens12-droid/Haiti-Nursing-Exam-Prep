'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

type DriverStatus = 'pending' | 'approved' | 'suspended' | 'rejected' | 'cancelled' | null

export default function PassengerDriverApplicationMenuItem() {
  const [target, setTarget] = useState<Element | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState<DriverStatus>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [lang, setLang] = useState<'fr' | 'ht'>('fr')

  useEffect(() => {
    const sync = () => {
      const drawer = document.querySelector('.nav-drawer')
      const nav = drawer?.querySelector('.drawer-nav') as HTMLElement | null
      if (!drawer || !nav) { setTarget(null); return }

      setLang(localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr')
      let row = nav.querySelector('.passenger-driver-application-row') as HTMLButtonElement | null
      if (!row) {
        row = document.createElement('button')
        row.type = 'button'
        row.className = 'passenger-driver-application-row'
        const profile = Array.from(nav.querySelectorAll<HTMLButtonElement>(':scope > button')).find((button) => {
          const text = (button.textContent || '').toLowerCase()
          return text.includes('profil') || text.includes('pwofil')
        })
        if (profile) profile.insertAdjacentElement('afterend', row)
        else nav.appendChild(row)
      }

      const currentLang = localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
      row.innerHTML = `<span>🚗</span><span>${currentLang === 'ht' ? 'Vin chofè' : 'Devenir chauffeur'}</span><b>›</b>`
      row.onclick = (event) => {
        event.preventDefault()
        event.stopPropagation()
        setExpanded((value) => !value)
        setMessage('')
      }

      let mount = drawer.querySelector('.passenger-driver-application-target') as HTMLElement | null
      if (!mount) {
        mount = document.createElement('div')
        mount.className = 'passenger-driver-application-target'
        row.insertAdjacentElement('afterend', mount)
      }
      setTarget(mount)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!target || !expanded) return
    void loadStatus()
  }, [target, expanded])

  async function loadStatus() {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return
    const { data: driver } = await supabase.from('driver_profiles').select('status').eq('user_id', data.user.id).maybeSingle()
    setStatus((driver?.status as DriverStatus) || null)
  }

  async function cancelApplication() {
    if (status !== 'pending' || busy) return
    const confirmed = window.confirm(lang === 'ht' ? 'Anile demann pou vin chofè a?' : 'Annuler votre demande pour devenir chauffeur ?')
    if (!confirmed) return
    setBusy(true)
    setMessage('')
    const { error } = await supabase.rpc('cancel_driver_application')
    setBusy(false)
    if (error) { setMessage(error.message); return }
    setStatus('cancelled')
    setMessage(lang === 'ht' ? 'Demann lan anile ✓' : 'Demande annulée ✓')
  }

  if (!target || !expanded) return null

  const ht = lang === 'ht'
  const statusText = status === 'pending'
    ? (ht ? 'Demann lan an attente' : 'Demande en attente')
    : status === 'approved'
      ? (ht ? 'Chofè apwouve ✓' : 'Chauffeur approuvé ✓')
      : status === 'suspended'
        ? (ht ? 'Kont chofè sispann' : 'Compte chauffeur suspendu')
        : status === 'rejected'
          ? (ht ? 'Demann lan refize' : 'Demande refusée')
          : status === 'cancelled'
            ? (ht ? 'Demann lan anile' : 'Demande annulée')
            : (ht ? 'Ou poko voye yon demann.' : 'Vous n’avez pas encore envoyé de demande.')

  return createPortal(
    <section className="drawer-profile-inline">
      <div className="drawer-profile-inline-head">
        <strong>{ht ? 'Vin chofè' : 'Devenir chauffeur'}</strong>
        <button type="button" onClick={() => setExpanded(false)}>{ht ? 'Fèmen' : 'Fermer'}</button>
      </div>
      <div className="drawer-profile-saved">
        {message && <div className="drawer-profile-message success">{message}</div>}
        <div><span>{ht ? 'Estati' : 'Statut'}</span><strong>{statusText}</strong></div>
        {status === 'pending' ? (
          <button type="button" className="drawer-profile-edit" onClick={() => void cancelApplication()} disabled={busy} style={{ background: '#fff0f0', color: '#a83232' }}>
            {busy ? (ht ? 'Ap anile…' : 'Annulation…') : (ht ? 'Anile demann lan' : 'Annuler la demande')}
          </button>
        ) : status !== 'approved' && status !== 'suspended' ? (
          <button type="button" className="drawer-profile-edit" onClick={() => { window.location.href = '/driver' }}>
            {ht ? 'Voye demann pou vin chofè' : 'Envoyer ma demande chauffeur'}
          </button>
        ) : null}
      </div>
    </section>,
    target,
  )
}
