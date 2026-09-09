'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

export default function PassengerProfileDetails() {
  const [target, setTarget] = useState<Element | null>(null)
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const syncTarget = () => {
      const panels = Array.from(document.querySelectorAll('.account-panel .panel-body'))
      const profile = panels.find((el) => {
        const h2 = el.querySelector('h2')?.textContent?.toLowerCase() || ''
        return h2.includes('profil') || h2.includes('pwofil')
      })
      setTarget(profile || null)
    }
    syncTarget()
    const observer = new MutationObserver(syncTarget)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!target) return
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      if (!u) return
      const m = u.user_metadata || {}
      setName(m.full_name || '')
      setBirthDate(m.birth_date || '')
      setGender(m.gender || '')
      setPhone(m.phone || '')
      setEmail(u.email || '')
      setEditing(false)
      setMessage('')
    })
  }, [target])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: name.trim(),
        birth_date: birthDate,
        gender,
        phone: phone.trim(),
      },
    })
    setBusy(false)
    if (error) {
      setMessage(error.message)
      return
    }
    const m = data.user?.user_metadata || {}
    setName(m.full_name || name.trim())
    setBirthDate(m.birth_date || birthDate)
    setGender(m.gender || gender)
    setPhone(m.phone || phone.trim())
    setMessage('Profil enregistré ✓')
    setEditing(false)
  }

  if (!target) return null

  const genderLabel = gender === 'homme' ? 'Homme' : gender === 'femme' ? 'Femme' : gender === 'autre' ? 'Autre / Non précisé' : '—'
  const displayBirthDate = birthDate ? new Date(`${birthDate}T00:00:00`).toLocaleDateString('fr-FR') : '—'

  return createPortal(
    editing ? (
      <form className="passenger-profile-details" onSubmit={saveProfile}>
        <label><span>Nom</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom complet" autoComplete="name" /></label>
        <label><span>Date de naissance</span><input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></label>
        <label><span>Sexe</span><select value={gender} onChange={(e) => setGender(e.target.value)}><option value="">Sélectionner</option><option value="homme">Homme</option><option value="femme">Femme</option><option value="autre">Autre / Préfère ne pas préciser</option></select></label>
        <label><span>Téléphone</span><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+509 ..." autoComplete="tel" inputMode="tel" /></label>
        <label><span>E-mail</span><input type="email" value={email} readOnly className="profile-readonly" /></label>
        {message && <div className={message.includes('✓') ? 'profile-save-ok' : 'profile-save-error'}>{message}</div>}
        <div className="profile-edit-actions"><button type="button" className="profile-cancel-button" onClick={() => { setEditing(false); setMessage('') }} disabled={busy}>Annuler</button><button type="submit" className="profile-save-button" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button></div>
      </form>
    ) : (
      <section className="passenger-profile-view">
        {message && <div className="profile-save-ok">{message}</div>}
        <div className="profile-view-card">
          <div className="profile-view-row"><span>Nom</span><strong>{name || '—'}</strong></div>
          <div className="profile-view-row"><span>Date de naissance</span><strong>{displayBirthDate}</strong></div>
          <div className="profile-view-row"><span>Sexe</span><strong>{genderLabel}</strong></div>
          <div className="profile-view-row"><span>Téléphone</span><strong>{phone || '—'}</strong></div>
          <div className="profile-view-row"><span>E-mail</span><strong>{email || '—'}</strong></div>
        </div>
        <button type="button" className="profile-modify-button" onClick={() => { setEditing(true); setMessage('') }}>Modifier le profil</button>
      </section>
    ),
    target
  )
}
