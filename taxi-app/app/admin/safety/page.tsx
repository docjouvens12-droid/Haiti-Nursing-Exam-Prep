'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Lang = 'fr' | 'ht'
type Filter = 'all' | 'new' | 'acknowledged' | 'resolved'

type SafetyRow = {
  id: string
  ride_id: string
  passenger_id: string
  event_type: string
  severity: string
  details: Record<string, unknown> | null
  acknowledged_at: string | null
  resolved_at: string | null
  admin_note: string | null
  created_at: string
  passenger_name?: string | null
  driver_name?: string | null
  driver_id?: string | null
  pickup_address?: string | null
  destination_address?: string | null
}

const text = {
  fr: {
    title: 'Sécurité des trajets', subtitle: 'Surveillez et traitez les alertes de sécurité', back: 'Chauffeurs', logout: 'Se déconnecter', loading: 'Chargement des alertes…', denied: 'Accès réservé aux administrateurs.', notSigned: 'Vous devez être connecté.', all: 'Toutes', fresh: 'Nouvelles', ack: 'Reconnues', resolved: 'Résolues', noAlerts: 'Aucune alerte dans cette catégorie.', passenger: 'Passager', driver: 'Chauffeur', route: 'Trajet', created: 'Détectée', status: 'Statut', type: 'Type', severity: 'Niveau', note: 'Note admin', resolve: 'Marquer résolue', reopen: 'Rouvrir', save: 'Enregistrer la note', saved: 'Mise à jour enregistrée.', error: 'Impossible de mettre à jour cette alerte.', stopped: 'Arrêt prolongé', deviation: 'Écart d’itinéraire', safetyOpen: 'Centre de sécurité ouvert', unknown: 'Alerte de sécurité', newStatus: 'Nouvelle', ackStatus: 'Reconnue', resolvedStatus: 'Résolue'
  },
  ht: {
    title: 'Sekirite trajè yo', subtitle: 'Siveye epi trete alèt sekirite yo', back: 'Chofè yo', logout: 'Dekonekte', loading: 'N ap chaje alèt yo…', denied: 'Se administratè sèlman ki gen aksè.', notSigned: 'Ou dwe konekte.', all: 'Tout', fresh: 'Nouvo', ack: 'Rekonèt', resolved: 'Rezoud', noAlerts: 'Pa gen alèt nan kategori sa a.', passenger: 'Kliyan', driver: 'Chofè', route: 'Trajè', created: 'Detekte', status: 'Estati', type: 'Kalite', severity: 'Nivo', note: 'Nòt admin', resolve: 'Make kòm rezoud', reopen: 'Relouvri', save: 'Anrejistre nòt', saved: 'Mizajou anrejistre.', error: 'Nou pa ka modifye alèt sa a.', stopped: 'Machin kanpe lontan', deviation: 'Devyasyon wout', safetyOpen: 'Sant sekirite ouvri', unknown: 'Alèt sekirite', newStatus: 'Nouvo', ackStatus: 'Rekonèt', resolvedStatus: 'Rezoud'
  },
}

export default function AdminSafetyPage() {
  const [lang, setLang] = useState<Lang>('fr')
  const t = text[lang]
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [rows, setRows] = useState<SafetyRow[]>([])
  const [filter, setFilter] = useState<Filter>('new')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [notes, setNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    const saved = localStorage.getItem('taxi-language') as Lang | null
    if (saved === 'fr' || saved === 'ht') setLang(saved)
    void init()
  }, [])

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
    await loadAlerts()
    setBusy(false)
  }

  async function loadAlerts() {
    setBusy(true)
    setMessage('')
    const { data: events, error } = await supabase
      .from('ride_safety_events')
      .select('id,ride_id,passenger_id,event_type,severity,details,acknowledged_at,resolved_at,admin_note,created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      setMessage(error.message)
      setBusy(false)
      return
    }

    const base = (events ?? []) as SafetyRow[]
    const rideIds = Array.from(new Set(base.map((e) => e.ride_id)))
    const passengerIds = Array.from(new Set(base.map((e) => e.passenger_id)))

    const ridesResp = rideIds.length
      ? await supabase.from('rides').select('id,passenger_id,driver_id,pickup_address,destination_address').in('id', rideIds)
      : { data: [] as any[] }
    const rides = ridesResp.data ?? []
    const driverIds = Array.from(new Set(rides.map((r: any) => r.driver_id).filter(Boolean))) as string[]
    const profileIds = Array.from(new Set([...passengerIds, ...driverIds]))
    const profilesResp = profileIds.length
      ? await supabase.from('profiles').select('id,full_name').in('id', profileIds)
      : { data: [] as any[] }

    const rideMap = new Map(rides.map((r: any) => [r.id, r]))
    const profileMap = new Map((profilesResp.data ?? []).map((p: any) => [p.id, p.full_name]))

    const merged = base.map((event) => {
      const ride: any = rideMap.get(event.ride_id)
      return {
        ...event,
        passenger_name: profileMap.get(event.passenger_id) ?? null,
        driver_id: ride?.driver_id ?? null,
        driver_name: ride?.driver_id ? profileMap.get(ride.driver_id) ?? null : null,
        pickup_address: ride?.pickup_address ?? null,
        destination_address: ride?.destination_address ?? null,
      }
    })
    setRows(merged)
    setNotes(Object.fromEntries(merged.map((r) => [r.id, r.admin_note ?? ''])))
    setBusy(false)
  }

  async function updateEvent(row: SafetyRow, resolved: boolean) {
    setBusy(true)
    setMessage('')
    const { error } = await supabase
      .from('ride_safety_events')
      .update({ resolved_at: resolved ? new Date().toISOString() : null, admin_note: notes[row.id]?.trim() || null })
      .eq('id', row.id)
    if (error) setMessage(`${t.error} ${error.message}`)
    else {
      setMessage(t.saved)
      await loadAlerts()
    }
    setBusy(false)
  }

  async function saveNote(row: SafetyRow) {
    setBusy(true)
    setMessage('')
    const { error } = await supabase.from('ride_safety_events').update({ admin_note: notes[row.id]?.trim() || null }).eq('id', row.id)
    if (error) setMessage(`${t.error} ${error.message}`)
    else {
      setMessage(t.saved)
      await loadAlerts()
    }
    setBusy(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    location.href = '/admin/login'
  }

  function changeLang(next: Lang) {
    setLang(next)
    localStorage.setItem('taxi-language', next)
  }

  const visible = useMemo(() => rows.filter((r) => {
    if (filter === 'all') return true
    if (filter === 'resolved') return Boolean(r.resolved_at)
    if (filter === 'acknowledged') return Boolean(r.acknowledged_at) && !r.resolved_at
    return !r.acknowledged_at && !r.resolved_at
  }), [rows, filter])

  const counts = useMemo(() => ({
    all: rows.length,
    new: rows.filter((r) => !r.acknowledged_at && !r.resolved_at).length,
    acknowledged: rows.filter((r) => r.acknowledged_at && !r.resolved_at).length,
    resolved: rows.filter((r) => r.resolved_at).length,
  }), [rows])

  const typeLabel = (value: string) => value === 'stalled' ? t.stopped : value === 'route_deviation' ? t.deviation : value === 'safety_opened' ? t.safetyOpen : t.unknown
  const statusLabel = (r: SafetyRow) => r.resolved_at ? t.resolvedStatus : r.acknowledged_at ? t.ackStatus : t.newStatus
  const statusClass = (r: SafetyRow) => r.resolved_at ? 'resolved' : r.acknowledged_at ? 'acknowledged' : 'new'
  const dateLabel = (value: string) => new Intl.DateTimeFormat(lang === 'ht' ? 'fr-HT' : 'fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

  if (authorized === null) return <main className="page"><section className="card"><p>{t.loading}</p></section></main>
  if (!authorized) return <main className="page"><section className="card denied"><h1>{t.title}</h1><p>{message || t.denied}</p><button onClick={() => location.href = '/admin/login'}>Admin login</button></section></main>

  return <main className="page">
    <section className="card">
      <div className="topbar">
        <button className="back" onClick={() => location.href = '/admin/drivers'}>‹ {t.back}</button>
        <div className="topActions">
          <select value={lang} onChange={(e) => changeLang(e.target.value as Lang)}><option value="fr">Français</option><option value="ht">Kreyòl</option></select>
          <button className="logout" onClick={() => void logout()}>{t.logout}</button>
        </div>
      </div>

      <div className="brand"><span>T</span><div><strong>Taxi Platform Haiti</strong><small>{t.subtitle}</small></div></div>
      <div className="titleRow"><div><h1>{t.title}</h1><p>{t.subtitle}</p></div><button className="refresh" onClick={() => void loadAlerts()} disabled={busy}>↻</button></div>

      <div className="stats">
        <button className={filter === 'new' ? 'active' : ''} onClick={() => setFilter('new')}><b>{counts.new}</b><span>{t.fresh}</span></button>
        <button className={filter === 'acknowledged' ? 'active' : ''} onClick={() => setFilter('acknowledged')}><b>{counts.acknowledged}</b><span>{t.ack}</span></button>
        <button className={filter === 'resolved' ? 'active' : ''} onClick={() => setFilter('resolved')}><b>{counts.resolved}</b><span>{t.resolved}</span></button>
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}><b>{counts.all}</b><span>{t.all}</span></button>
      </div>

      {message && <div className="message">{message}</div>}
      {busy && <p className="muted">{t.loading}</p>}
      {!busy && visible.length === 0 && <div className="empty">{t.noAlerts}</div>}

      <div className="list">
        {visible.map((r) => <article className={`alert ${statusClass(r)}`} key={r.id}>
          <div className="alertHead">
            <div><span className="kind">🛡 {typeLabel(r.event_type)}</span><strong>{r.passenger_name || t.passenger}</strong></div>
            <span className={`status ${statusClass(r)}`}>{statusLabel(r)}</span>
          </div>

          <div className="details">
            <div><span>{t.driver}</span><strong>{r.driver_name || '—'}</strong></div>
            <div><span>{t.severity}</span><strong>{r.severity || '—'}</strong></div>
            <div className="wide"><span>{t.route}</span><strong>{r.pickup_address || '—'} → {r.destination_address || '—'}</strong></div>
            <div className="wide"><span>{t.created}</span><strong>{dateLabel(r.created_at)}</strong></div>
          </div>

          <label className="note"><span>{t.note}</span><textarea value={notes[r.id] ?? ''} onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))} placeholder={t.note} /></label>
          <div className="actions">
            <button className="save" onClick={() => void saveNote(r)} disabled={busy}>{t.save}</button>
            <button className={r.resolved_at ? 'reopen' : 'resolve'} onClick={() => void updateEvent(r, !r.resolved_at)} disabled={busy}>{r.resolved_at ? t.reopen : t.resolve}</button>
          </div>
        </article>)}
      </div>
    </section>

    <style jsx>{`
      .page{min-height:100vh;background:linear-gradient(160deg,#e8f1ff,#eef3f8 48%,#e7edf3);padding:24px;color:#102033;font-family:Inter,system-ui,sans-serif}.card{width:min(100%,820px);margin:auto;background:#fff;border-radius:28px;padding:24px;box-shadow:0 24px 70px rgba(18,36,61,.14);box-sizing:border-box}.denied{margin-top:8vh}.topbar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px}.back{border:0;background:none;color:#185fc2;font-weight:900}.topActions{display:flex;gap:8px;align-items:center}.topActions select{border:1px solid #d8e1e9;border-radius:12px;background:#fff;padding:9px 11px}.logout{border:1px solid #efd4d4;border-radius:12px;background:#fff5f5;color:#9c2d2d;padding:9px 11px;font-weight:900}.brand{display:flex;gap:10px;align-items:center}.brand>span{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:#1b70eb;color:#fff;font-weight:950}.brand strong,.brand small{display:block}.brand small{color:#77879a;margin-top:2px}.titleRow{display:flex;align-items:end;justify-content:space-between;gap:12px}.titleRow h1{font-size:30px;margin:18px 0 3px}.titleRow p{margin:0 0 16px;color:#78889a;font-size:12px}.refresh{width:40px;height:40px;border:0;border-radius:12px;background:#102033;color:#fff;font-size:18px;margin-bottom:12px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:8px 0 16px}.stats button{border:1px solid #dfe7ef;border-radius:15px;background:#f8fafc;padding:12px 8px;color:#536579}.stats button.active{border-color:#b9d2fb;background:#eef5ff;color:#185fc2}.stats b,.stats span{display:block}.stats b{font-size:21px}.stats span{font-size:10px;font-weight:850;margin-top:3px}.message{padding:11px 13px;border-radius:12px;background:#eef5ff;color:#185fc2;font-size:12px;font-weight:750;margin-bottom:12px}.muted{color:#78889a}.empty{padding:30px;text-align:center;border:1px dashed #d7e0e8;border-radius:18px;color:#78889a}.list{display:grid;gap:14px}.alert{border:1px solid #dfe6ed;border-radius:20px;padding:16px;background:#fff}.alert.new{border-left:4px solid #d97706}.alert.acknowledged{border-left:4px solid #1b70eb}.alert.resolved{border-left:4px solid #0f7a5d}.alertHead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.alertHead>div{min-width:0}.kind{display:block;color:#6d7d8d;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px}.alertHead strong{font-size:16px}.status{border-radius:999px;padding:6px 9px;font-size:10px;font-weight:900;white-space:nowrap}.status.new{background:#fff3df;color:#9a5a00}.status.acknowledged{background:#eaf2ff;color:#185fc2}.status.resolved{background:#e8f7f1;color:#0b6a50}.details{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.details>div{background:#f7f9fb;border-radius:12px;padding:10px;min-width:0}.details .wide{grid-column:1/-1}.details span,.details strong{display:block}.details span{font-size:9px;text-transform:uppercase;color:#8492a0;font-weight:900}.details strong{font-size:12px;margin-top:3px;overflow-wrap:anywhere}.note{display:grid;gap:6px;margin-top:12px}.note span{font-size:10px;font-weight:900;color:#718192}.note textarea{min-height:68px;resize:vertical;border:1px solid #dce4ec;border-radius:12px;padding:10px;font:inherit;font-size:12px;color:#102033;box-sizing:border-box;width:100%}.actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.actions button{border:0;border-radius:12px;padding:11px;font-weight:900}.save{background:#eef3f8;color:#334d66}.resolve{background:#1b70eb;color:#fff}.reopen{background:#fff2df;color:#9a5a00}@media(max-width:600px){.page{padding:0}.card{min-height:100vh;border-radius:0;padding:18px 14px}.stats{grid-template-columns:1fr 1fr}.details{grid-template-columns:1fr}.details .wide{grid-column:auto}.actions{grid-template-columns:1fr}.topActions{flex-direction:column;align-items:stretch}.titleRow h1{font-size:26px}}
    `}</style>
  </main>
}
