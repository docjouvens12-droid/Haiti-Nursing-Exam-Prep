'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Lang = 'fr' | 'ht'

type DriverStatus = 'pending' | 'approved' | 'suspended' | 'rejected' | null

const copy = {
  fr: {
    title: 'Devenir chauffeur', subtitle: 'Envoyez vos informations pour vérification', license: 'Numéro de permis de conduire', nationalId: 'Numéro d’identification nationale', make: 'Marque du véhicule', model: 'Modèle', color: 'Couleur', year: 'Année', plate: 'Plaque d’immatriculation', seats: 'Nombre de places', submit: 'Envoyer ma demande', sending: 'Envoi en cours…', back: 'Retour', pending: 'Votre demande est en attente de vérification.', approved: 'Votre compte chauffeur est approuvé.', suspended: 'Votre compte chauffeur est suspendu.', rejected: 'Votre demande a été refusée. Vous pouvez corriger vos informations et la renvoyer.', success: 'Demande envoyée avec succès.', auth: 'Vous devez être connecté pour envoyer une demande chauffeur.'
  },
  ht: {
    title: 'Vin chofè', subtitle: 'Voye enfòmasyon ou pou verifikasyon', license: 'Nimewo lisans kondwi', nationalId: 'Nimewo idantifikasyon nasyonal', make: 'Mak machin nan', model: 'Modèl', color: 'Koulè', year: 'Ane', plate: 'Nimewo plak', seats: 'Kantite plas', submit: 'Voye aplikasyon mwen', sending: 'N ap voye aplikasyon an…', back: 'Retounen', pending: 'Aplikasyon ou an ap tann verifikasyon.', approved: 'Kont chofè ou a apwouve.', suspended: 'Kont chofè ou a sispann.', rejected: 'Yo te refize aplikasyon an. Ou ka korije enfòmasyon yo epi voye l ankò.', success: 'Aplikasyon an voye avèk siksè.', auth: 'Ou dwe konekte pou voye yon aplikasyon chofè.'
  }
}

export default function DriverApplicationPage() {
  const [lang, setLang] = useState<Lang>('fr')
  const t = copy[lang]
  const [status, setStatus] = useState<DriverStatus>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ license: '', nationalId: '', make: '', model: '', color: '', year: '', plate: '', seats: '4' })

  useEffect(() => {
    const saved = window.localStorage.getItem('taxi-language') as Lang | null
    if (saved === 'fr' || saved === 'ht') setLang(saved)
    ;(async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) { setMessage((saved === 'ht' ? copy.ht : copy.fr).auth); return }
      const { data } = await supabase.from('driver_profiles').select('status,license_number,national_id_number').eq('user_id', auth.user.id).maybeSingle()
      if (data) {
        setStatus(data.status as DriverStatus)
        setForm((f) => ({ ...f, license: data.license_number ?? '', nationalId: data.national_id_number ?? '' }))
        const { data: vehicle } = await supabase.from('vehicles').select('make,model,color,year,plate_number,seats').eq('driver_id', auth.user.id).order('created_at', { ascending: true }).limit(1).maybeSingle()
        if (vehicle) setForm((f) => ({ ...f, make: vehicle.make ?? '', model: vehicle.model ?? '', color: vehicle.color ?? '', year: vehicle.year ? String(vehicle.year) : '', plate: vehicle.plate_number ?? '', seats: String(vehicle.seats ?? 4) }))
      }
    })()
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('')
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) { setMessage(t.auth); setBusy(false); return }
    const { error } = await supabase.rpc('submit_driver_application', {
      p_license_number: form.license,
      p_national_id_number: form.nationalId,
      p_vehicle_make: form.make,
      p_vehicle_model: form.model,
      p_vehicle_color: form.color,
      p_vehicle_year: form.year ? Number(form.year) : null,
      p_plate_number: form.plate,
      p_seats: Number(form.seats || 4),
    })
    if (error) setMessage(error.message)
    else { setStatus('pending'); setMessage(t.success) }
    setBusy(false)
  }

  const statusText = status ? t[status] : ''
  const locked = status === 'approved' || status === 'suspended'

  return <main className="driver-page">
    <section className="driver-card">
      <div className="driver-top"><button onClick={() => history.back()}>‹ {t.back}</button><select value={lang} onChange={(e) => { const next = e.target.value as Lang; setLang(next); localStorage.setItem('taxi-language', next) }}><option value="fr">Français</option><option value="ht">Kreyòl</option></select></div>
      <div className="driver-brand"><span>T</span><div><strong>Taxi Platform Haiti</strong><small>{t.subtitle}</small></div></div>
      <h1>{t.title}</h1>
      {statusText && <div className={`driver-status ${status}`}>{statusText}</div>}
      <form onSubmit={submit} className="driver-form">
        <label>{t.license}<input required disabled={locked} value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} /></label>
        <label>{t.nationalId}<input required disabled={locked} value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} /></label>
        <div className="grid2"><label>{t.make}<input required disabled={locked} value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} /></label><label>{t.model}<input required disabled={locked} value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></label></div>
        <div className="grid2"><label>{t.color}<input disabled={locked} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></label><label>{t.year}<input type="number" min="1980" max="2030" disabled={locked} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></label></div>
        <div className="grid2"><label>{t.plate}<input required disabled={locked} value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} /></label><label>{t.seats}<input type="number" min="1" max="20" required disabled={locked} value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} /></label></div>
        {message && <div className="driver-message">{message}</div>}
        {!locked && <button className="submit-driver" disabled={busy}>{busy ? t.sending : t.submit}</button>}
      </form>
    </section>
    <style jsx>{`
      .driver-page{min-height:100vh;background:linear-gradient(160deg,#e5f1ed,#eef2f7 45%,#e7edf3);padding:24px;display:grid;place-items:center;color:#102033;font-family:Inter,system-ui,sans-serif}.driver-card{width:min(100%,520px);background:white;border-radius:28px;padding:24px;box-shadow:0 24px 70px rgba(18,36,61,.15)}.driver-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px}.driver-top button{border:0;background:none;font-weight:800;color:#0f5f4d}.driver-top select{border:1px solid #dbe3eb;border-radius:12px;padding:8px 10px;background:white}.driver-brand{display:flex;align-items:center;gap:10px;margin-bottom:18px}.driver-brand>span{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;background:#0f5f4d;color:white;font-weight:900}.driver-brand strong,.driver-brand small{display:block}.driver-brand small{color:#758596;margin-top:2px}.driver-card h1{font-size:30px;margin:0 0 18px}.driver-status{padding:12px 14px;border-radius:14px;margin-bottom:16px;font-weight:750;font-size:13px}.driver-status.pending{background:#fff7df;color:#795d00}.driver-status.approved{background:#e8f7ef;color:#0b704f}.driver-status.suspended,.driver-status.rejected{background:#fff0f0;color:#9d2d2d}.driver-form{display:grid;gap:13px}.driver-form label{display:grid;gap:6px;font-size:12px;font-weight:800;color:#4f6072}.driver-form input{width:100%;border:1px solid #dbe3eb;border-radius:13px;padding:12px 13px;outline:none;background:#fbfcfe;color:#102033}.driver-form input:focus{border-color:#0f7a62;box-shadow:0 0 0 3px rgba(15,122,98,.1)}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.submit-driver{border:0;border-radius:15px;background:#0f5f4d;color:white;padding:14px;font-weight:900;margin-top:4px}.driver-message{padding:11px 12px;border-radius:12px;background:#eef7f4;color:#195b4d;font-size:12px;font-weight:700}@media(max-width:560px){.driver-page{padding:0}.driver-card{min-height:100vh;border-radius:0;padding:22px 18px}.grid2{grid-template-columns:1fr}}
    `}</style>
  </main>
}
