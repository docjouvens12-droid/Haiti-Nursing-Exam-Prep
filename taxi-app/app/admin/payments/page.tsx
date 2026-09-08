'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Lang = 'fr' | 'ht'
type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded'
type PaymentRow = {
  id: string
  ride_id: string
  passenger_id: string
  amount_htg: number | string
  method: string
  status: PaymentStatus
  platform_fee_percent: number | string
  platform_fee_htg: number | string | null
  driver_net_htg: number | string | null
  provider: string | null
  provider_status: string | null
  created_at: string
  passenger_name?: string | null
  driver_name?: string | null
  driver_id?: string | null
  pickup_address?: string | null
  destination_address?: string | null
}

const copy = {
  fr: {
    title: 'Paiements & commissions', subtitle: 'Suivez les montants, la commission plateforme et le net chauffeur', back: 'Chauffeurs', loading: 'Chargement des paiements…', denied: 'Accès réservé aux administrateurs.', all: 'Tous', pending: 'En attente', authorized: 'Autorisé', paid: 'Payé', failed: 'Échoué', refunded: 'Remboursé', gross: 'Montant brut', fee: 'Commission plateforme', driverNet: 'Net chauffeur', transactions: 'Transactions', method: 'Méthode', status: 'Statut', passenger: 'Passager', driver: 'Chauffeur', route: 'Trajet', created: 'Créé', noRows: 'Aucun paiement dans cette catégorie.', todayFee: "Commission aujourd’hui", totalFee: 'Commission totale', pendingAmount: 'Montant en attente', live: 'Temps réel'
  },
  ht: {
    title: 'Peman & komisyon', subtitle: 'Swiv montan yo, komisyon platfòm nan ak net chofè a', back: 'Chofè yo', loading: 'N ap chaje peman yo…', denied: 'Se administratè sèlman ki gen aksè.', all: 'Tout', pending: 'Ap tann', authorized: 'Otorize', paid: 'Peye', failed: 'Echwe', refunded: 'Ranbouse', gross: 'Montan brit', fee: 'Komisyon platfòm', driverNet: 'Net chofè', transactions: 'Tranzaksyon', method: 'Metòd', status: 'Estati', passenger: 'Kliyan', driver: 'Chofè', route: 'Trajè', created: 'Kreye', noRows: 'Pa gen peman nan kategori sa a.', todayFee: 'Komisyon jodi a', totalFee: 'Komisyon total', pendingAmount: 'Montan k ap tann', live: 'An tan reyèl'
  }
}

export default function AdminPaymentsPage() {
  const [lang, setLang] = useState<Lang>('fr')
  const t = copy[lang]
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [rows, setRows] = useState<PaymentRow[]>([])
  const [filter, setFilter] = useState<'all' | PaymentStatus>('all')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('taxi-language') as Lang | null
    if (saved === 'fr' || saved === 'ht') setLang(saved)
    void init()
  }, [])

  useEffect(() => {
    if (!authorized) return
    const channel = supabase.channel('admin-payments-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => void loadPayments(false))
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [authorized])

  async function init() {
    setBusy(true)
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) { setAuthorized(false); setBusy(false); return }
    const { data: me } = await supabase.from('profiles').select('role').eq('id', auth.user.id).maybeSingle()
    if (me?.role !== 'admin') { setAuthorized(false); setBusy(false); return }
    setAuthorized(true)
    await loadPayments()
    setBusy(false)
  }

  async function loadPayments(showBusy = true) {
    if (showBusy) setBusy(true)
    setMessage('')
    const { data: payments, error } = await supabase
      .from('payments')
      .select('id,ride_id,passenger_id,amount_htg,method,status,platform_fee_percent,platform_fee_htg,driver_net_htg,provider,provider_status,created_at')
      .order('created_at', { ascending: false })
      .limit(250)
    if (error) {
      setMessage(error.message)
      if (showBusy) setBusy(false)
      return
    }

    const base = (payments ?? []) as PaymentRow[]
    const rideIds = Array.from(new Set(base.map(p => p.ride_id)))
    const passengerIds = Array.from(new Set(base.map(p => p.passenger_id)))
    const { data: rides } = rideIds.length
      ? await supabase.from('rides').select('id,driver_id,pickup_address,destination_address').in('id', rideIds)
      : { data: [] as any[] }
    const driverIds = Array.from(new Set((rides ?? []).map((r: any) => r.driver_id).filter(Boolean))) as string[]
    const profileIds = Array.from(new Set([...passengerIds, ...driverIds]))
    const { data: profiles } = profileIds.length
      ? await supabase.from('profiles').select('id,full_name').in('id', profileIds)
      : { data: [] as any[] }

    const rideMap = new Map((rides ?? []).map((r: any) => [r.id, r]))
    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p.full_name]))
    setRows(base.map(p => {
      const ride: any = rideMap.get(p.ride_id)
      return {
        ...p,
        passenger_name: profileMap.get(p.passenger_id) ?? null,
        driver_id: ride?.driver_id ?? null,
        driver_name: ride?.driver_id ? profileMap.get(ride.driver_id) ?? null : null,
        pickup_address: ride?.pickup_address ?? null,
        destination_address: ride?.destination_address ?? null,
      }
    }))
    if (showBusy) setBusy(false)
  }

  const visible = useMemo(() => filter === 'all' ? rows : rows.filter(r => r.status === filter), [rows, filter])
  const number = (v: number | string | null | undefined) => Number(v ?? 0)
  const money = (v: number | string | null | undefined) => `${number(v).toLocaleString('fr-HT', { maximumFractionDigits: 2 })} HTG`
  const startToday = new Date(); startToday.setHours(0,0,0,0)
  const totalFee = rows.reduce((s, r) => s + number(r.platform_fee_htg), 0)
  const todayFee = rows.filter(r => new Date(r.created_at) >= startToday).reduce((s, r) => s + number(r.platform_fee_htg), 0)
  const pendingAmount = rows.filter(r => r.status === 'pending' || r.status === 'authorized').reduce((s, r) => s + number(r.amount_htg), 0)
  const statusLabel = (s: PaymentStatus) => t[s]
  const methodLabel = (r: PaymentRow) => r.provider?.toLowerCase() === 'moncash' ? 'MonCash' : r.provider?.toLowerCase() === 'natcash' ? 'NatCash' : r.method === 'mobile_money' ? 'Mobile Money' : r.method === 'card' ? (lang === 'ht' ? 'Kat' : 'Carte') : (lang === 'ht' ? 'Lajan kach' : 'Espèces')
  const dateLabel = (v: string) => new Intl.DateTimeFormat(lang === 'ht' ? 'fr-HT' : 'fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(v))

  if (authorized === null) return <main className="page"><section className="card"><p>{t.loading}</p></section></main>
  if (!authorized) return <main className="page"><section className="card"><h1>{t.title}</h1><p>{t.denied}</p><button onClick={() => location.href='/admin/login'}>Admin login</button></section></main>

  return <main className="page"><section className="card">
    <div className="top"><button onClick={() => location.href='/admin/drivers'}>‹ {t.back}</button><div><span className="live">● {t.live}</span><select value={lang} onChange={e => { const v=e.target.value as Lang; setLang(v); localStorage.setItem('taxi-language',v) }}><option value="fr">Français</option><option value="ht">Kreyòl</option></select></div></div>
    <div className="brand"><span>T</span><div><strong>Taxi Platform Haiti</strong><small>{t.subtitle}</small></div></div>
    <h1>{t.title}</h1>

    <div className="stats">
      <div><small>{t.totalFee}</small><strong>{money(totalFee)}</strong></div>
      <div><small>{t.todayFee}</small><strong>{money(todayFee)}</strong></div>
      <div><small>{t.pendingAmount}</small><strong>{money(pendingAmount)}</strong></div>
      <div><small>{t.transactions}</small><strong>{rows.length}</strong></div>
    </div>

    <div className="filters"><select value={filter} onChange={e => setFilter(e.target.value as any)}><option value="all">{t.all}</option><option value="pending">{t.pending}</option><option value="authorized">{t.authorized}</option><option value="paid">{t.paid}</option><option value="failed">{t.failed}</option><option value="refunded">{t.refunded}</option></select><button onClick={() => void loadPayments()} disabled={busy}>↻</button></div>
    {message && <div className="message">{message}</div>}
    {busy && <p className="muted">{t.loading}</p>}
    {!busy && visible.length === 0 && <div className="empty">{t.noRows}</div>}

    <div className="list">{visible.map(r => <article key={r.id} className="payment">
      <div className="head"><div><strong>{r.passenger_name || t.passenger}</strong><small>{r.driver_name ? `${t.driver}: ${r.driver_name}` : t.driver}</small></div><span className={`status ${r.status}`}>{statusLabel(r.status)}</span></div>
      <div className="split"><div><small>{t.gross}</small><strong>{money(r.amount_htg)}</strong></div><div className="fee"><small>{t.fee} ({number(r.platform_fee_percent)}%)</small><strong>{money(r.platform_fee_htg)}</strong></div><div className="net"><small>{t.driverNet}</small><strong>{money(r.driver_net_htg)}</strong></div></div>
      <div className="meta"><span><b>{t.method}:</b> {methodLabel(r)}</span><span><b>{t.created}:</b> {dateLabel(r.created_at)}</span></div>
      <div className="route"><small>{t.route}</small><strong>{r.pickup_address || '—'} → {r.destination_address || '—'}</strong></div>
    </article>)}</div>
  </section>
  <style jsx>{`
    .page{min-height:100vh;background:linear-gradient(160deg,#e7f0ff,#eef3f8 48%,#e8edf4);padding:24px;color:#102033;font-family:Inter,system-ui,sans-serif}.card{width:min(100%,980px);margin:auto;background:#fff;border-radius:28px;padding:24px;box-shadow:0 24px 70px rgba(18,36,61,.14);box-sizing:border-box}.top{display:flex;justify-content:space-between;gap:12px}.top>button{border:0;background:none;color:#185fc2;font-weight:900}.top>div{display:flex;gap:8px;align-items:center}.top select{border:1px solid #d8e1e9;border-radius:11px;padding:8px;background:#fff}.live{font-size:10px;font-weight:900;color:#087052}.brand{display:flex;gap:10px;align-items:center;margin-top:18px}.brand>span{width:42px;height:42px;border-radius:13px;background:#1b70eb;color:#fff;display:grid;place-items:center;font-weight:950}.brand strong,.brand small{display:block}.brand small{color:#77879a}.card h1{font-size:30px;margin:18px 0}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.stats>div{background:#f5f8fc;border:1px solid #e2e8ef;border-radius:15px;padding:12px}.stats small,.stats strong{display:block}.stats small{font-size:9px;color:#718192;text-transform:uppercase;font-weight:900}.stats strong{margin-top:5px;font-size:17px}.filters{display:flex;gap:8px;margin:14px 0}.filters select{border:1px solid #d8e1e9;border-radius:12px;padding:10px;background:#fff}.filters button{border:0;border-radius:11px;background:#102033;color:#fff;padding:10px 13px}.message{background:#fff0f0;color:#9b2c2c;border-radius:12px;padding:10px}.muted{color:#7a8795}.empty{padding:28px;text-align:center;border:1px dashed #d8e1e9;border-radius:16px;color:#78889a}.list{display:grid;gap:12px}.payment{border:1px solid #dfe6ee;border-radius:18px;padding:14px}.head{display:flex;justify-content:space-between;gap:10px}.head strong,.head small{display:block}.head small{color:#7c8996;margin-top:3px}.status{height:max-content;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:900}.status.pending{background:#fff4d8;color:#805c00}.status.authorized{background:#eaf2ff;color:#185fc2}.status.paid{background:#e7f7ef;color:#087052}.status.failed{background:#fff0f0;color:#a12e2e}.status.refunded{background:#f1edff;color:#6840a8}.split{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.split>div{background:#f6f8fb;border-radius:13px;padding:10px}.split .fee{background:#fff7e8}.split .net{background:#eaf7f2}.split small,.split strong{display:block}.split small{font-size:9px;color:#748190;font-weight:900}.split strong{font-size:14px;margin-top:3px}.meta{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-size:11px;color:#657487}.route{margin-top:10px;background:#f8fafc;border-radius:12px;padding:10px}.route small,.route strong{display:block}.route small{font-size:9px;color:#7b8997;text-transform:uppercase;font-weight:900}.route strong{font-size:12px;margin-top:3px}@media(max-width:700px){.page{padding:0}.card{min-height:100vh;border-radius:0;padding:18px 14px}.stats{grid-template-columns:1fr 1fr}.split{grid-template-columns:1fr}.card h1{font-size:26px}.top{align-items:flex-start}.top>div{flex-direction:column;align-items:flex-end}}
  `}</style>
  </main>
}
