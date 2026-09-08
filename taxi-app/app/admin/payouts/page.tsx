'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Lang = 'fr' | 'ht'
type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed'
type PayoutRow = {
  id: string
  payment_id: string
  ride_id: string
  driver_id: string
  amount_htg: number | string
  status: PayoutStatus
  provider: string | null
  payout_reference: string | null
  failure_reason: string | null
  created_at: string
  paid_at: string | null
  driver_name?: string | null
  pickup_address?: string | null
  destination_address?: string | null
}

const copy = {
  fr: {
    title: 'Paiements chauffeurs', subtitle: 'Suivez les 85 % dus aux chauffeurs après paiement confirmé du passager', back: 'Paiements & commissions', loading: 'Chargement des paiements chauffeurs…', denied: 'Accès réservé aux administrateurs.', all: 'Tous', pending: 'À payer', processing: 'En traitement', paid: 'Payé', failed: 'Échoué', driver: 'Chauffeur', amount: 'Net chauffeur', route: 'Trajet', created: 'Créé', paidAt: 'Payé le', noRows: 'Aucun paiement chauffeur dans cette catégorie.', readyTotal: 'À payer', paidTotal: 'Déjà payé', count: 'Dossiers', reference: 'Référence', provider: 'Fournisseur', markProcessing: 'Marquer en traitement', markPaid: 'Marquer payé', markFailed: 'Marquer échoué', note: "Ces boutons mettent à jour le suivi interne uniquement. Ils n’envoient pas d’argent à MonCash/NatCash.", error: 'Impossible de mettre à jour ce paiement.'
  },
  ht: {
    title: 'Peman chofè', subtitle: 'Swiv 85% ki pou chofè yo apre peman kliyan an konfime', back: 'Peman & komisyon', loading: 'N ap chaje peman chofè yo…', denied: 'Se administratè sèlman ki gen aksè.', all: 'Tout', pending: 'Pou peye', processing: 'Ap trete', paid: 'Peye', failed: 'Echwe', driver: 'Chofè', amount: 'Net chofè', route: 'Trajè', created: 'Kreye', paidAt: 'Peye nan', noRows: 'Pa gen peman chofè nan kategori sa a.', readyTotal: 'Pou peye', paidTotal: 'Deja peye', count: 'Dosye', reference: 'Referans', provider: 'Founisè', markProcessing: 'Mete ap trete', markPaid: 'Make kòm peye', markFailed: 'Make kòm echwe', note: 'Bouton sa yo sèlman mete estati entèn ajou. Yo pa voye lajan sou MonCash/NatCash.', error: 'Nou pa ka modifye peman sa a.'
  }
}

export default function AdminPayoutsPage() {
  const [lang, setLang] = useState<Lang>('fr')
  const t = copy[lang]
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [rows, setRows] = useState<PayoutRow[]>([])
  const [filter, setFilter] = useState<'all' | PayoutStatus>('all')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('taxi-language') as Lang | null
    if (saved === 'fr' || saved === 'ht') setLang(saved)
    void init()
  }, [])

  useEffect(() => {
    if (!authorized) return
    const channel = supabase.channel('admin-driver-payouts-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_payouts' }, () => void loadRows())
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [authorized])

  async function init() {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) { setAuthorized(false); return }
    const { data: me } = await supabase.from('profiles').select('role').eq('id', auth.user.id).maybeSingle()
    if (me?.role !== 'admin') { setAuthorized(false); return }
    setAuthorized(true)
    await loadRows()
  }

  async function loadRows() {
    setMessage('')
    const { data, error } = await supabase.from('driver_payouts')
      .select('id,payment_id,ride_id,driver_id,amount_htg,status,provider,payout_reference,failure_reason,created_at,paid_at')
      .order('created_at', { ascending: false }).limit(250)
    if (error) { setMessage(error.message); return }
    const base = (data ?? []) as PayoutRow[]
    const driverIds = Array.from(new Set(base.map(x => x.driver_id)))
    const rideIds = Array.from(new Set(base.map(x => x.ride_id)))
    const [{ data: profiles }, { data: rides }] = await Promise.all([
      driverIds.length ? supabase.from('profiles').select('id,full_name').in('id', driverIds) : Promise.resolve({ data: [] as any[] }),
      rideIds.length ? supabase.from('rides').select('id,pickup_address,destination_address').in('id', rideIds) : Promise.resolve({ data: [] as any[] }),
    ])
    const names = new Map((profiles ?? []).map((p: any) => [p.id, p.full_name]))
    const rideMap = new Map((rides ?? []).map((r: any) => [r.id, r]))
    setRows(base.map(x => ({ ...x, driver_name: names.get(x.driver_id) ?? null, pickup_address: rideMap.get(x.ride_id)?.pickup_address ?? null, destination_address: rideMap.get(x.ride_id)?.destination_address ?? null })))
  }

  async function setStatus(row: PayoutRow, status: PayoutStatus) {
    setBusyId(row.id)
    setMessage('')
    const { error } = await supabase.from('driver_payouts').update({ status }).eq('id', row.id)
    if (error) setMessage(`${t.error} ${error.message}`)
    else await loadRows()
    setBusyId(null)
  }

  const visible = useMemo(() => filter === 'all' ? rows : rows.filter(r => r.status === filter), [rows, filter])
  const money = (v: number | string | null | undefined) => `${Number(v ?? 0).toLocaleString('fr-HT', { maximumFractionDigits: 2 })} HTG`
  const readyTotal = rows.filter(r => r.status === 'pending' || r.status === 'processing').reduce((s, r) => s + Number(r.amount_htg ?? 0), 0)
  const paidTotal = rows.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.amount_htg ?? 0), 0)
  const dateLabel = (v: string | null) => v ? new Intl.DateTimeFormat(lang === 'ht' ? 'fr-HT' : 'fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(v)) : '—'

  if (authorized === null) return <main className="page"><section className="card"><p>{t.loading}</p></section></main>
  if (!authorized) return <main className="page"><section className="card"><h1>{t.title}</h1><p>{t.denied}</p><button onClick={() => location.href='/admin/login'}>Admin login</button></section></main>

  return <main className="page"><section className="card">
    <div className="top"><button onClick={() => location.href='/admin/payments'}>‹ {t.back}</button><select value={lang} onChange={e => { const v=e.target.value as Lang; setLang(v); localStorage.setItem('taxi-language', v) }}><option value="fr">Français</option><option value="ht">Kreyòl</option></select></div>
    <div className="brand"><span>T</span><div><strong>Taxi Platform Haiti</strong><small>{t.subtitle}</small></div></div>
    <h1>{t.title}</h1>
    <div className="warning">⚠ {t.note}</div>
    <div className="stats"><div><small>{t.readyTotal}</small><strong>{money(readyTotal)}</strong></div><div><small>{t.paidTotal}</small><strong>{money(paidTotal)}</strong></div><div><small>{t.count}</small><strong>{rows.length}</strong></div></div>
    <div className="filters"><select value={filter} onChange={e => setFilter(e.target.value as any)}><option value="all">{t.all}</option><option value="pending">{t.pending}</option><option value="processing">{t.processing}</option><option value="paid">{t.paid}</option><option value="failed">{t.failed}</option></select><button onClick={() => void loadRows()}>↻</button></div>
    {message && <div className="message">{message}</div>}
    {visible.length === 0 && <div className="empty">{t.noRows}</div>}
    <div className="list">{visible.map(r => <article className="payout" key={r.id}>
      <div className="head"><div><strong>{r.driver_name || t.driver}</strong><small>{dateLabel(r.created_at)}</small></div><span className={`status ${r.status}`}>{t[r.status]}</span></div>
      <div className="amount"><small>{t.amount}</small><strong>{money(r.amount_htg)}</strong></div>
      <div className="route"><small>{t.route}</small><strong>{r.pickup_address || '—'} → {r.destination_address || '—'}</strong></div>
      <div className="meta"><span><b>{t.provider}:</b> {r.provider || '—'}</span><span><b>{t.reference}:</b> {r.payout_reference || '—'}</span>{r.paid_at && <span><b>{t.paidAt}:</b> {dateLabel(r.paid_at)}</span>}</div>
      <div className="actions">
        {r.status !== 'processing' && r.status !== 'paid' && <button onClick={() => void setStatus(r,'processing')} disabled={busyId===r.id}>{t.markProcessing}</button>}
        {r.status !== 'paid' && <button className="paidBtn" onClick={() => void setStatus(r,'paid')} disabled={busyId===r.id}>{t.markPaid}</button>}
        {r.status !== 'failed' && r.status !== 'paid' && <button className="failedBtn" onClick={() => void setStatus(r,'failed')} disabled={busyId===r.id}>{t.markFailed}</button>}
      </div>
    </article>)}</div>
  </section>
  <style jsx>{`
    .page{min-height:100vh;background:linear-gradient(160deg,#e7f0ff,#eef3f8 48%,#e8edf4);padding:24px;color:#102033;font-family:Inter,system-ui,sans-serif}.card{width:min(100%,920px);margin:auto;background:#fff;border-radius:28px;padding:24px;box-shadow:0 24px 70px rgba(18,36,61,.14);box-sizing:border-box}.top{display:flex;justify-content:space-between}.top button{border:0;background:none;color:#185fc2;font-weight:900}.top select,.filters select{border:1px solid #d8e1e9;border-radius:11px;padding:9px;background:white}.brand{display:flex;gap:10px;align-items:center;margin-top:18px}.brand>span{width:42px;height:42px;border-radius:13px;background:#1b70eb;color:#fff;display:grid;place-items:center;font-weight:950}.brand strong,.brand small{display:block}.brand small{color:#77879a}.card h1{font-size:30px;margin:18px 0}.warning{background:#fff7e8;color:#7a5200;border:1px solid #f1ddaf;border-radius:14px;padding:11px 13px;font-size:12px;font-weight:800}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}.stats>div{background:#f5f8fc;border:1px solid #e2e8ef;border-radius:15px;padding:12px}.stats small,.stats strong{display:block}.stats small{font-size:9px;color:#718192;text-transform:uppercase;font-weight:900}.stats strong{margin-top:5px;font-size:17px}.filters{display:flex;gap:8px;margin-bottom:14px}.filters button{border:0;border-radius:11px;background:#102033;color:#fff;padding:10px 13px}.message{background:#fff0f0;color:#9b2c2c;border-radius:12px;padding:10px;margin-bottom:12px}.empty{padding:28px;text-align:center;border:1px dashed #d8e1e9;border-radius:16px;color:#78889a}.list{display:grid;gap:12px}.payout{border:1px solid #dfe6ee;border-radius:18px;padding:14px}.head{display:flex;justify-content:space-between;gap:10px}.head strong,.head small{display:block}.head small{color:#7c8996;margin-top:3px}.status{height:max-content;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:900}.status.pending{background:#fff4d8;color:#805c00}.status.processing{background:#eaf2ff;color:#185fc2}.status.paid{background:#e7f7ef;color:#087052}.status.failed{background:#fff0f0;color:#a12e2e}.amount{margin-top:12px;background:#eaf7f2;border-radius:13px;padding:11px}.amount small,.amount strong{display:block}.amount small{font-size:9px;color:#53756a;font-weight:900;text-transform:uppercase}.amount strong{font-size:18px;margin-top:3px}.route{margin-top:9px;background:#f8fafc;border-radius:12px;padding:10px}.route small,.route strong{display:block}.route small{font-size:9px;color:#7b8997;font-weight:900;text-transform:uppercase}.route strong{font-size:12px;margin-top:3px}.meta{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-size:11px;color:#657487}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.actions button{border:0;border-radius:11px;padding:9px 11px;background:#eaf2ff;color:#185fc2;font-weight:900}.actions .paidBtn{background:#0b7a5d;color:#fff}.actions .failedBtn{background:#fff0f0;color:#a12e2e}@media(max-width:650px){.page{padding:0}.card{min-height:100vh;border-radius:0;padding:18px 14px}.stats{grid-template-columns:1fr}.card h1{font-size:26px}.actions{display:grid;grid-template-columns:1fr}.actions button{width:100%}}
  `}</style>
  </main>
}
