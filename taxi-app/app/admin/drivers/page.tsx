'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Lang = 'fr' | 'ht'
type DriverStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
type DriverRow = {
  user_id: string
  status: DriverStatus
  license_number: string | null
  national_id_number: string | null
  created_at: string
  full_name?: string | null
  phone?: string | null
  vehicle_type?: string | null
  make?: string | null
  model?: string | null
  color?: string | null
  year?: number | null
  plate_number?: string | null
  seats?: number | null
  is_active?: boolean | null
}

const copy = {
  fr: {
    title: 'Administration des chauffeurs', subtitle: 'Validez ou refusez les demandes chauffeur', back: 'Accueil', logout: 'Se déconnecter', pending: 'En attente', approved: 'Approuvé', rejected: 'Refusé', suspended: 'Suspendu', approve: 'Approuver', reject: 'Refuser', driver: 'Chauffeur', license: 'Permis', nationalId: 'Identification', vehicle: 'Véhicule', plate: 'Plaque', seats: 'Places', noApps: 'Aucune demande chauffeur pour le moment.', loading: 'Chargement des demandes…', denied: 'Accès réservé aux administrateurs.', notSigned: 'Vous devez être connecté.', actionError: 'Impossible de mettre à jour la demande.', car: 'Voiture', moto: 'Moto', all: 'Toutes', filter: 'Filtrer', updated: 'Demande mise à jour.', safety: 'Sécurité des trajets', payments: 'Paiements & commissions'
  },
  ht: {
    title: 'Administrasyon chofè yo', subtitle: 'Apwouve oswa refize aplikasyon chofè yo', back: 'Akèy', logout: 'Dekonekte', pending: 'Ap tann', approved: 'Apwouve', rejected: 'Refize', suspended: 'Sispann', approve: 'Apwouve', reject: 'Refize', driver: 'Chofè', license: 'Lisans', nationalId: 'Idantifikasyon', vehicle: 'Veyikil', plate: 'Plak', seats: 'Plas', noApps: 'Pa gen aplikasyon chofè pou kounye a.', loading: 'N ap chaje aplikasyon yo…', denied: 'Se administratè sèlman ki gen aksè.', notSigned: 'Ou dwe konekte.', actionError: 'Nou pa ka modifye aplikasyon an.', car: 'Machin', moto: 'Moto', all: 'Tout', filter: 'Filtre', updated: 'Aplikasyon an modifye.', safety: 'Sekirite trajè yo', payments: 'Peman & komisyon'
  }
}

export default function AdminDriversPage() {
  const [lang, setLang] = useState<Lang>('fr')
  const t = copy[lang]
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [rows, setRows] = useState<DriverRow[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState<'all' | DriverStatus>('pending')
  const [safetyCount, setSafetyCount] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('taxi-language') as Lang | null
    if (saved === 'fr' || saved === 'ht') setLang(saved)
    void init()
  }, [])

  useEffect(() => {
    if (!authorized) return
    const channel = supabase
      .channel('admin-drivers-safety-badge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ride_safety_events' }, () => {
        void loadSafetyCount()
      })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [authorized])

  async function init() {
    setBusy(true)
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      setAuthorized(false)
      setMessage(t.notSigned)
      setBusy(false)
      return
    }

    const { data: me } = await supabase.from('profiles').select('role').eq('id', auth.user.id).maybeSingle()
    if (me?.role !== 'admin') {
      setAuthorized(false)
      setMessage(t.denied)
      setBusy(false)
      return
    }

    setAuthorized(true)
    await Promise.all([loadApplications(), loadSafetyCount()])
    setBusy(false)
  }

  async function loadSafetyCount() {
    const { count } = await supabase
      .from('ride_safety_events')
      .select('id', { count: 'exact', head: true })
      .is('acknowledged_at', null)
      .is('resolved_at', null)
    setSafetyCount(count ?? 0)
  }

  async function loadApplications() {
    setBusy(true)
    setMessage('')

    const { data: drivers, error } = await supabase
      .from('driver_profiles')
      .select('user_id,status,license_number,national_id_number,created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
      setBusy(false)
      return
    }

    const ids = (drivers ?? []).map((d) => d.user_id)
    if (!ids.length) {
      setRows([])
      setBusy(false)
      return
    }

    const [{ data: profiles }, { data: vehicles }] = await Promise.all([
      supabase.from('profiles').select('id,full_name,phone').in('id', ids),
      supabase.from('vehicles').select('driver_id,vehicle_type,make,model,color,year,plate_number,seats,is_active').in('driver_id', ids).order('created_at', { ascending: true }),
    ])

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))
    const vehicleMap = new Map<string, any>()
    for (const v of vehicles ?? []) if (!vehicleMap.has(v.driver_id)) vehicleMap.set(v.driver_id, v)

    setRows((drivers ?? []).map((d) => ({
      ...d,
      full_name: profileMap.get(d.user_id)?.full_name ?? null,
      phone: profileMap.get(d.user_id)?.phone ?? null,
      ...(vehicleMap.get(d.user_id) ?? {}),
    })) as DriverRow[])
    setBusy(false)
  }

  async function setStatus(driverId: string, status: 'approved' | 'rejected') {
    setBusy(true)
    setMessage('')
    const { error } = await supabase.rpc('set_driver_application_status', {
      p_driver_id: driverId,
      p_status: status,
    })
    if (error) setMessage(`${t.actionError} ${error.message}`)
    else {
      setMessage(t.updated)
      await loadApplications()
    }
    setBusy(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    location.href = '/'
  }

  const visible = useMemo(() => filter === 'all' ? rows : rows.filter((r) => r.status === filter), [rows, filter])

  function changeLang(next: Lang) {
    setLang(next)
    localStorage.setItem('taxi-language', next)
  }

  if (authorized === null) return <main className="admin-page"><section className="admin-card"><p>{t.loading}</p></section></main>

  if (!authorized) return <main className="admin-page"><section className="admin-card denied"><div className="admin-top"><button onClick={() => location.href = '/'}>‹ {t.back}</button><select value={lang} onChange={(e) => changeLang(e.target.value as Lang)}><option value="fr">Français</option><option value="ht">Kreyòl</option></select></div><h1>{t.title}</h1><p>{message || t.denied}</p></section></main>

  return <main className="admin-page">
    <section className="admin-card">
      <div className="admin-top"><button onClick={() => location.href = '/'}>‹ {t.back}</button><div className="top-actions"><button className="paymentsLink" onClick={() => location.href = '/admin/payments'}>💰 {t.payments}</button><button className="safetyLink" onClick={() => location.href = '/admin/safety'}>🛡 {t.safety}{safetyCount > 0 && <b>{safetyCount}</b>}</button><select value={lang} onChange={(e) => changeLang(e.target.value as Lang)}><option value="fr">Français</option><option value="ht">Kreyòl</option></select><button className="logout" onClick={() => void logout()}>{t.logout}</button></div></div>
      <div className="brand"><span>T</span><div><strong>Taxi Platform Haiti</strong><small>{t.subtitle}</small></div></div>
      <h1>{t.title}</h1>

      <div className="filter-row">
        <span>{t.filter}</span>
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option value="pending">{t.pending}</option>
          <option value="approved">{t.approved}</option>
          <option value="rejected">{t.rejected}</option>
          <option value="suspended">{t.suspended}</option>
          <option value="all">{t.all}</option>
        </select>
        <button onClick={() => void loadApplications()} disabled={busy}>↻</button>
      </div>

      {message && <div className="message">{message}</div>}
      {busy && <p className="muted">{t.loading}</p>}
      {!busy && visible.length === 0 && <div className="empty">{t.noApps}</div>}

      <div className="list">
        {visible.map((r) => <article className="driver-item" key={r.user_id}>
          <div className="item-head"><div><strong>{r.full_name || t.driver}</strong>{r.phone && <small>{r.phone}</small>}</div><span className={`status ${r.status}`}>{t[r.status]}</span></div>
          <div className="details">
            <div><span>{t.license}</span><strong>{r.license_number || '—'}</strong></div>
            <div><span>{t.nationalId}</span><strong>{r.national_id_number || '—'}</strong></div>
            <div><span>{t.vehicle}</span><strong>{r.vehicle_type === 'moto' ? `🏍️ ${t.moto}` : `🚕 ${t.car}`} · {[r.make, r.model, r.year].filter(Boolean).join(' ') || '—'}</strong></div>
            <div><span>{t.plate}</span><strong>{r.plate_number || '—'}</strong></div>
            <div><span>{t.seats}</span><strong>{r.seats ?? '—'}</strong></div>
          </div>
          {(r.status === 'pending' || r.status === 'rejected') && <div className="actions"><button className="reject" onClick={() => void setStatus(r.user_id, 'rejected')} disabled={busy}>{t.reject}</button><button className="approve" onClick={() => void setStatus(r.user_id, 'approved')} disabled={busy}>{t.approve}</button></div>}
        </article>)}
      </div>
    </section>

    <style jsx>{`
      .admin-page{min-height:100vh;background:linear-gradient(160deg,#e6f1ee,#eef3f8 48%,#e7edf3);padding:24px;color:#102033;font-family:Inter,system-ui,sans-serif}.admin-card{width:min(100%,900px);margin:auto;background:#fff;border-radius:28px;padding:24px;box-shadow:0 24px 70px rgba(18,36,61,.14)}.admin-card.denied{margin-top:8vh}.admin-top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:20px}.admin-top>button{border:0;background:none;color:#0f5f4d;font-weight:900}.top-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}.admin-top select,.filter-row select{border:1px solid #d8e1e9;border-radius:12px;background:white;padding:9px 11px}.paymentsLink{border:1px solid #cfe0fb;border-radius:12px;background:#eef5ff;color:#185fc2;padding:9px 11px;font-weight:900}.safetyLink{position:relative;border:1px solid #f0d1d1;border-radius:12px;background:#fff5f5;color:#9b2c2c;padding:9px 11px;font-weight:900}.safetyLink b{position:absolute;right:-6px;top:-7px;min-width:19px;height:19px;padding:0 5px;border-radius:999px;display:grid;place-items:center;background:#c92a2a;color:#fff;font-size:10px;box-sizing:border-box}.logout{border:1px solid #d8e1e9;border-radius:12px;background:#fff;color:#9c2d2d;padding:9px 11px;font-weight:900}.brand{display:flex;gap:10px;align-items:center}.brand>span{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:#0f5f4d;color:white;font-weight:900}.brand strong,.brand small{display:block}.brand small{color:#77879a;margin-top:2px}.admin-card h1{font-size:30px;margin:18px 0}.filter-row{display:flex;gap:10px;align-items:center;padding:12px;background:#f5f8fa;border-radius:16px;margin-bottom:14px}.filter-row span{font-size:12px;font-weight:900;color:#66778a}.filter-row button{margin-left:auto;border:0;border-radius:11px;padding:9px 12px;background:#102033;color:white}.message{padding:11px 13px;border-radius:12px;background:#eef7f4;color:#155f4e;font-size:13px;font-weight:700;margin-bottom:12px}.muted{color:#77879a}.empty{padding:28px;text-align:center;color:#78889a;border:1px dashed #d5dee7;border-radius:18px}.list{display:grid;gap:14px}.driver-item{border:1px solid #dfe6ed;border-radius:20px;padding:16px;background:#fff}.item-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.item-head strong,.item-head small{display:block}.item-head small{color:#78889a;margin-top:3px}.status{font-size:11px;font-weight:900;padding:7px 9px;border-radius:999px}.status.pending{background:#fff5d7;color:#7d5c00}.status.approved{background:#e6f7ef;color:#087052}.status.rejected,.status.suspended{background:#fff0f0;color:#a02c2c}.details{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:15px 0}.details div{background:#f7f9fb;border-radius:13px;padding:10px}.details span,.details strong{display:block}.details span{font-size:10px;color:#7b8997;font-weight:900;text-transform:uppercase}.details strong{font-size:13px;margin-top:3px}.actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.actions button{border:0;border-radius:13px;padding:12px;font-weight:900}.reject{background:#fff0f0;color:#9c2d2d}.approve{background:#0f5f4d;color:#fff}@media(max-width:700px){.admin-page{padding:0}.admin-card{min-height:100vh;border-radius:0;padding:20px 16px}.details{grid-template-columns:1fr}.admin-card h1{font-size:26px}.admin-top{align-items:flex-start;flex-direction:column}.top-actions{width:100%;justify-content:flex-start}.logout,.safetyLink,.paymentsLink{white-space:nowrap}}
    `}</style>
  </main>
}
