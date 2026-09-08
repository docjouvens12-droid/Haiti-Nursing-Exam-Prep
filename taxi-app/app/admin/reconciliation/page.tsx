'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Lang = 'fr' | 'ht'
type CaseStatus = 'new' | 'reviewing' | 'resolved'
type Row = {
  anomaly_key: string
  severity: 'critical' | 'high' | 'medium' | string
  payment_id: string | null
  payout_id: string | null
  ride_id: string | null
  driver_id: string | null
  payment_status: string | null
  payout_status: string | null
  gross_htg: number | string | null
  platform_fee_htg: number | string | null
  expected_platform_fee_htg: number | string | null
  driver_net_htg: number | string | null
  expected_driver_net_htg: number | string | null
  payout_amount_htg: number | string | null
  provider: string | null
  payout_reference: string | null
  created_at: string | null
  details: string
  case?: AnomalyCase | null
}
type AnomalyCase = {
  id: string
  anomaly_fingerprint: string
  anomaly_key: string
  payment_id: string | null
  payout_id: string | null
  ride_id: string | null
  status: CaseStatus
  assigned_admin_id: string | null
  admin_note: string | null
  resolution_reason: string | null
  assigned_at: string | null
  resolved_at: string | null
  updated_at: string
}
type Action = { id: string; case_id: string; actor_admin_id: string | null; action_type: string; note: string | null; created_at: string }

const labels = {
  fr: {
    title: 'Anomalies financières', subtitle: 'Contrôle et résolution des écarts de paiements, commissions et versements', back: 'Paiements & commissions', loading: 'Analyse en cours…', empty: 'Aucune anomalie détectée.', denied: 'Accès réservé aux administrateurs.', refresh: 'Actualiser', gross: 'Brut', fee: 'Commission 15 %', net: 'Net chauffeur 85 %', payout: 'Versement', statuses: 'Statuts', reference: 'Référence', provider: 'Fournisseur', new: 'Nouveau', reviewing: 'En révision', resolved: 'Résolu', take: 'Prendre le dossier', note: 'Note admin', saveNote: 'Enregistrer la note', resolve: 'Résoudre', reopen: 'Rouvrir', resolution: 'Raison de résolution', timeline: 'Historique', noTimeline: 'Aucune action enregistrée.', missing_payout: 'Versement chauffeur manquant', platform_fee_mismatch: 'Commission 15 % incorrecte', driver_net_mismatch: 'Net chauffeur 85 % incorrect', payout_amount_mismatch: 'Montant du versement incorrect', paid_payout_missing_proof: 'Versement payé sans preuve complète', stale_payout: 'Versement en attente depuis plus de 24 h'
  },
  ht: {
    title: 'Anomali finansye', subtitle: 'Kontwole epi rezoud diferans nan peman, komisyon ak payout chofè yo', back: 'Peman & komisyon', loading: 'N ap analize…', empty: 'Pa gen okenn anomali finansye detekte.', denied: 'Se administratè sèlman ki gen aksè.', refresh: 'Rafrechi', gross: 'Brit', fee: 'Komisyon 15%', net: 'Net chofè 85%', payout: 'Payout', statuses: 'Estati', reference: 'Referans', provider: 'Founisè', new: 'Nouvo', reviewing: 'An revizyon', resolved: 'Rezoud', take: 'Pran dosye a', note: 'Nòt admin', saveNote: 'Anrejistre nòt', resolve: 'Rezoud', reopen: 'Relouvri', resolution: 'Rezon rezolisyon', timeline: 'Istorik', noTimeline: 'Pa gen aksyon anrejistre.', missing_payout: 'Payout chofè manke', platform_fee_mismatch: 'Komisyon 15% pa kòrèk', driver_net_mismatch: 'Net chofè 85% pa kòrèk', payout_amount_mismatch: 'Montan payout la pa kòrèk', paid_payout_missing_proof: 'Payout make peye san prèv konplè', stale_payout: 'Payout ap tann plis pase 24 èdtan'
  }
}

export default function AdminReconciliationPage() {
  const [lang, setLang] = useState<Lang>('fr')
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [adminId, setAdminId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string,string>>({})
  const [resolutions, setResolutions] = useState<Record<string,string>>({})
  const [timeline, setTimeline] = useState<Record<string,Action[]>>({})
  const [openTimeline, setOpenTimeline] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const t = labels[lang]

  useEffect(() => {
    const saved = localStorage.getItem('taxi-language') as Lang | null
    if (saved === 'fr' || saved === 'ht') setLang(saved)
    void init()
  }, [])

  useEffect(() => {
    if (!authorized) return
    const channel = supabase.channel('admin-financial-reconciliation-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_payouts' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_anomaly_cases' }, () => void load())
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [authorized])

  const fingerprint = (r: Row) => `${r.anomaly_key}:${r.payment_id ?? 'none'}:${r.payout_id ?? 'none'}`

  async function init() {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) { setAuthorized(false); setLoading(false); return }
    const { data: me } = await supabase.from('profiles').select('role').eq('id', auth.user.id).maybeSingle()
    if (me?.role !== 'admin') { setAuthorized(false); setLoading(false); return }
    setAdminId(auth.user.id)
    setAuthorized(true)
    await load()
  }

  async function load() {
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.rpc('get_admin_financial_reconciliation')
    if (error) { setMessage(error.message); setLoading(false); return }
    const anomalies = (data ?? []) as Row[]
    const { data: existing } = await supabase.from('financial_anomaly_cases').select('*')
    const caseMap = new Map((existing ?? []).map((c: any) => [c.anomaly_fingerprint, c as AnomalyCase]))
    const missing = anomalies.filter(r => !caseMap.has(fingerprint(r))).map(r => ({
      anomaly_fingerprint: fingerprint(r), anomaly_key: r.anomaly_key, payment_id: r.payment_id, payout_id: r.payout_id, ride_id: r.ride_id
    }))
    if (missing.length) {
      const { error: insertError } = await supabase.from('financial_anomaly_cases').insert(missing)
      if (insertError) setMessage(insertError.message)
    }
    const { data: refreshedCases } = await supabase.from('financial_anomaly_cases').select('*')
    const refreshedMap = new Map((refreshedCases ?? []).map((c: any) => [c.anomaly_fingerprint, c as AnomalyCase]))
    setRows(anomalies.map(r => ({ ...r, case: refreshedMap.get(fingerprint(r)) ?? null })))
    const nextNotes: Record<string,string> = {}
    const nextRes: Record<string,string> = {}
    for (const c of (refreshedCases ?? []) as AnomalyCase[]) { nextNotes[c.id] = c.admin_note ?? ''; nextRes[c.id] = c.resolution_reason ?? '' }
    setNotes(nextNotes); setResolutions(nextRes)
    setLoading(false)
  }

  async function log(caseId: string, actionType: string, note?: string) {
    await supabase.from('financial_anomaly_actions').insert({ case_id: caseId, actor_admin_id: adminId, action_type: actionType, note: note || null })
  }

  async function take(c: AnomalyCase) {
    if (!adminId) return
    setBusyId(c.id)
    const { error } = await supabase.from('financial_anomaly_cases').update({ status: 'reviewing', assigned_admin_id: adminId, assigned_at: new Date().toISOString() }).eq('id', c.id)
    if (!error) await log(c.id, 'taken')
    else setMessage(error.message)
    await load(); setBusyId(null)
  }

  async function saveNote(c: AnomalyCase) {
    setBusyId(c.id)
    const note = notes[c.id]?.trim() || ''
    const { error } = await supabase.from('financial_anomaly_cases').update({ admin_note: note || null }).eq('id', c.id)
    if (!error) await log(c.id, 'note_saved', note)
    else setMessage(error.message)
    await load(); setBusyId(null)
  }

  async function resolve(c: AnomalyCase) {
    if (!adminId) return
    const reason = resolutions[c.id]?.trim() || ''
    if (!reason) { setMessage(lang === 'ht' ? 'Mete rezon rezolisyon an anvan.' : 'Ajoutez la raison de résolution.'); return }
    setBusyId(c.id)
    const { error } = await supabase.from('financial_anomaly_cases').update({ status: 'resolved', assigned_admin_id: c.assigned_admin_id || adminId, resolution_reason: reason, resolved_at: new Date().toISOString() }).eq('id', c.id)
    if (!error) await log(c.id, 'resolved', reason)
    else setMessage(error.message)
    await load(); setBusyId(null)
  }

  async function reopen(c: AnomalyCase) {
    setBusyId(c.id)
    const { error } = await supabase.from('financial_anomaly_cases').update({ status: 'reviewing', resolved_at: null }).eq('id', c.id)
    if (!error) await log(c.id, 'reopened')
    else setMessage(error.message)
    await load(); setBusyId(null)
  }

  async function toggleTimeline(c: AnomalyCase) {
    if (openTimeline === c.id) { setOpenTimeline(null); return }
    const { data } = await supabase.from('financial_anomaly_actions').select('id,case_id,actor_admin_id,action_type,note,created_at').eq('case_id', c.id).order('created_at', { ascending: false })
    setTimeline(prev => ({ ...prev, [c.id]: (data ?? []) as Action[] }))
    setOpenTimeline(c.id)
  }

  const counts = useMemo(() => ({
    critical: rows.filter(r => r.severity === 'critical').length,
    high: rows.filter(r => r.severity === 'high').length,
    medium: rows.filter(r => r.severity === 'medium').length,
  }), [rows])
  const money = (v: number | string | null) => `${Number(v ?? 0).toLocaleString('fr-HT', { maximumFractionDigits: 2 })} HTG`
  const anomalyLabel = (key: string) => (t as any)[key] ?? key
  const statusLabel = (s?: CaseStatus) => s ? (t as any)[s] : t.new

  if (authorized === null) return <main className="page"><section className="card"><p>{t.loading}</p></section></main>
  if (!authorized) return <main className="page"><section className="card"><h1>{t.title}</h1><p>{t.denied}</p></section></main>

  return <main className="page"><section className="card">
    <div className="top"><button onClick={() => location.href='/admin/payments'}>‹ {t.back}</button><select value={lang} onChange={e => { const v=e.target.value as Lang; setLang(v); localStorage.setItem('taxi-language', v) }}><option value="fr">Français</option><option value="ht">Kreyòl</option></select></div>
    <div className="brand"><span>T</span><div><strong>Taxi Platform Haiti</strong><small>{t.subtitle}</small></div></div>
    <h1>{t.title}</h1>
    <div className="stats"><div className="critical"><small>Critical</small><strong>{counts.critical}</strong></div><div className="high"><small>High</small><strong>{counts.high}</strong></div><div className="medium"><small>Medium</small><strong>{counts.medium}</strong></div></div>
    <div className="toolbar"><button onClick={() => void load()}>↻ {t.refresh}</button></div>
    {message && <div className="message">{message}</div>}
    {loading ? <div className="empty">{t.loading}</div> : rows.length === 0 ? <div className="empty">✅ {t.empty}</div> : <div className="list">{rows.map((r, i) => {
      const c = r.case
      return <article className={`issue ${r.severity}`} key={`${r.anomaly_key}-${r.payment_id}-${r.payout_id}-${i}`}>
        <div className="issueHead"><div><span className="severity">{r.severity.toUpperCase()}</span><strong>{anomalyLabel(r.anomaly_key)}</strong></div><span className={`caseStatus ${c?.status || 'new'}`}>{statusLabel(c?.status)}</span></div>
        <p>{r.details}</p>
        <div className="grid"><div><small>{t.gross}</small><strong>{money(r.gross_htg)}</strong></div><div><small>{t.fee}</small><strong>{money(r.platform_fee_htg)} / {money(r.expected_platform_fee_htg)}</strong></div><div><small>{t.net}</small><strong>{money(r.driver_net_htg)} / {money(r.expected_driver_net_htg)}</strong></div><div><small>{t.payout}</small><strong>{money(r.payout_amount_htg)}</strong></div></div>
        <div className="meta"><span><b>{t.statuses}:</b> {r.payment_status || '—'} → {r.payout_status || '—'}</span><span><b>{t.provider}:</b> {r.provider || '—'}</span><span><b>{t.reference}:</b> {r.payout_reference || '—'}</span></div>
        {c && <div className="workflow">
          {c.status === 'new' && <button onClick={() => void take(c)} disabled={busyId===c.id}>{t.take}</button>}
          <label>{t.note}<textarea value={notes[c.id] ?? ''} onChange={e => setNotes(v => ({...v,[c.id]:e.target.value}))}/></label>
          <button onClick={() => void saveNote(c)} disabled={busyId===c.id}>{t.saveNote}</button>
          {c.status !== 'resolved' ? <><label>{t.resolution}<input value={resolutions[c.id] ?? ''} onChange={e => setResolutions(v => ({...v,[c.id]:e.target.value}))}/></label><button className="resolve" onClick={() => void resolve(c)} disabled={busyId===c.id}>{t.resolve}</button></> : <button onClick={() => void reopen(c)} disabled={busyId===c.id}>{t.reopen}</button>}
          <button className="timelineBtn" onClick={() => void toggleTimeline(c)}>{t.timeline}</button>
          {openTimeline === c.id && <div className="timeline">{(timeline[c.id] ?? []).length ? (timeline[c.id] ?? []).map(a => <div key={a.id}><strong>{a.action_type}</strong><small>{new Date(a.created_at).toLocaleString()}</small>{a.note && <p>{a.note}</p>}</div>) : <span>{t.noTimeline}</span>}</div>}
        </div>}
      </article>
    })}</div>}
  </section>
  <style jsx>{`
    .page{min-height:100vh;background:linear-gradient(160deg,#e7f0ff,#eef3f8 48%,#e8edf4);padding:24px;color:#102033;font-family:Inter,system-ui,sans-serif}.card{width:min(100%,960px);margin:auto;background:#fff;border-radius:28px;padding:24px;box-shadow:0 24px 70px rgba(18,36,61,.14);box-sizing:border-box}.top{display:flex;justify-content:space-between}.top button{border:0;background:none;color:#185fc2;font-weight:900}.top select{border:1px solid #d8e1e9;border-radius:11px;padding:9px;background:#fff}.brand{display:flex;gap:10px;align-items:center;margin-top:18px}.brand>span{width:42px;height:42px;border-radius:13px;background:#1b70eb;color:#fff;display:grid;place-items:center;font-weight:950}.brand strong,.brand small{display:block}.brand small{color:#77879a}.card h1{font-size:30px;margin:18px 0}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.stats div{border-radius:15px;padding:12px}.stats small,.stats strong{display:block}.stats strong{font-size:22px;margin-top:4px}.critical{background:#fff0f0;color:#a12e2e}.high{background:#fff4e7;color:#a05200}.medium{background:#fff9df;color:#756200}.toolbar{margin:14px 0}.toolbar button,.workflow button{border:0;border-radius:11px;background:#102033;color:#fff;padding:10px 13px;font-weight:900}.message{background:#fff0f0;color:#9b2c2c;border-radius:12px;padding:10px;margin-bottom:12px}.empty{padding:30px;text-align:center;border:1px dashed #d8e1e9;border-radius:16px;color:#78889a}.list{display:grid;gap:12px}.issue{border:1px solid #dfe6ee;border-left-width:5px;border-radius:18px;padding:14px}.issue.critical{border-left-color:#c62828;background:#fffafa}.issue.high{border-left-color:#ef6c00;background:#fffdf9}.issue.medium{border-left-color:#d4a900;background:#fffef8}.issueHead{display:flex;justify-content:space-between;gap:12px}.issueHead>div{display:flex;gap:8px;align-items:center}.severity,.caseStatus{font-size:9px;font-weight:950;border-radius:999px;padding:5px 7px;background:#edf2f7}.caseStatus.reviewing{background:#eaf2ff;color:#185fc2}.caseStatus.resolved{background:#e7f7ef;color:#087052}.issue>p{font-size:12px;color:#647487}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.grid>div{background:#f7f9fc;border-radius:12px;padding:10px}.grid small,.grid strong{display:block}.grid small{font-size:9px;color:#778697;font-weight:900;text-transform:uppercase}.grid strong{font-size:12px;margin-top:4px}.meta{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px;font-size:11px;color:#657487}.workflow{margin-top:12px;border-top:1px solid #e3e9ef;padding-top:12px;display:grid;gap:8px}.workflow label{font-size:10px;font-weight:900;color:#657487}.workflow textarea,.workflow input{width:100%;box-sizing:border-box;margin-top:5px;border:1px solid #d8e1e9;border-radius:10px;padding:9px;font:inherit;background:#fff}.workflow textarea{min-height:72px;resize:vertical}.workflow .resolve{background:#087052}.workflow .timelineBtn{background:#eaf2ff;color:#185fc2}.timeline{display:grid;gap:6px;background:#f7f9fc;border-radius:12px;padding:10px}.timeline>div{border-bottom:1px solid #e3e9ef;padding:6px 0}.timeline strong,.timeline small{display:block}.timeline small{font-size:9px;color:#78889a}.timeline p{font-size:11px;margin:4px 0 0;color:#526273}@media(max-width:700px){.page{padding:0}.card{min-height:100vh;border-radius:0;padding:18px 14px}.stats,.grid{grid-template-columns:1fr}.card h1{font-size:26px}.issueHead{display:grid}}
  `}</style>
  </main>
}
