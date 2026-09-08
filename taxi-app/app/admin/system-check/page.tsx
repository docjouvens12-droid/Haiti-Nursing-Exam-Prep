'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Lang = 'fr' | 'ht'
type CheckRow = { check_key: string; ok: boolean; detail: string }

const copy = {
  fr: {
    title: 'Contrôle système', subtitle: 'Vérification des composants critiques de Taxi Platform Haiti', loading: 'Vérification en cours…', denied: 'Accès réservé aux administrateurs.', healthy: 'Système prêt', issue: 'À vérifier', refresh: 'Actualiser', back: 'Administration', passed: 'Contrôles réussis', failed: 'Contrôles en échec', allGood: 'Tous les contrôles critiques sont au vert.', someFail: 'Certains contrôles nécessitent une intervention avant un test complet.',
  },
  ht: {
    title: 'Kontwòl sistèm', subtitle: 'Verifikasyon pati kritik Taxi Platform Haiti', loading: 'N ap verifye sistèm nan…', denied: 'Se administratè sèlman ki gen aksè.', healthy: 'Sistèm pare', issue: 'Pou verifye', refresh: 'Rafrechi', back: 'Administrasyon', passed: 'Kontwòl ki pase', failed: 'Kontwòl ki echwe', allGood: 'Tout kontwòl kritik yo vèt.', someFail: 'Gen kèk kontwòl ki bezwen koreksyon anvan tès konplè a.',
  }
}

export default function AdminSystemCheckPage() {
  const [lang, setLang] = useState<Lang>('fr')
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [rows, setRows] = useState<CheckRow[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const t = copy[lang]

  useEffect(() => {
    const saved = localStorage.getItem('taxi-language') as Lang | null
    if (saved === 'fr' || saved === 'ht') setLang(saved)
    void init()
  }, [])

  async function init() {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) { setAuthorized(false); setLoading(false); return }
    const { data: me } = await supabase.from('profiles').select('role').eq('id', auth.user.id).maybeSingle()
    if (me?.role !== 'admin') { setAuthorized(false); setLoading(false); return }
    setAuthorized(true)
    await load()
  }

  async function load() {
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.rpc('get_admin_system_health')
    if (error) setMessage(error.message)
    else setRows((data ?? []) as CheckRow[])
    setLoading(false)
  }

  const passed = useMemo(() => rows.filter(r => r.ok).length, [rows])
  const failed = rows.length - passed

  if (authorized === null) return <main className="page"><section className="card"><p>{t.loading}</p></section></main>
  if (!authorized) return <main className="page"><section className="card"><h1>{t.title}</h1><p>{t.denied}</p></section></main>

  return <main className="page"><section className="card">
    <div className="top"><button onClick={() => location.href='/admin/drivers'}>‹ {t.back}</button><select value={lang} onChange={e => { const v=e.target.value as Lang; setLang(v); localStorage.setItem('taxi-language', v) }}><option value="fr">Français</option><option value="ht">Kreyòl</option></select></div>
    <div className="brand"><span>T</span><div><strong>Taxi Platform Haiti</strong><small>{t.subtitle}</small></div></div>
    <h1>{t.title}</h1>
    <div className={`summary ${failed === 0 ? 'good' : 'bad'}`}><strong>{failed === 0 ? `✅ ${t.healthy}` : `⚠ ${t.issue}`}</strong><span>{failed === 0 ? t.allGood : t.someFail}</span></div>
    <div className="stats"><div><small>{t.passed}</small><strong>{passed}</strong></div><div><small>{t.failed}</small><strong>{failed}</strong></div><div><small>Total</small><strong>{rows.length}</strong></div></div>
    <div className="toolbar"><button onClick={() => void load()}>↻ {t.refresh}</button></div>
    {message && <div className="message">{message}</div>}
    {loading ? <p className="muted">{t.loading}</p> : <div className="checks">{rows.map(r => <article key={r.check_key} className={r.ok ? 'ok' : 'fail'}><span>{r.ok ? '✓' : '!'}</span><div><strong>{r.detail}</strong><small>{r.check_key}</small></div></article>)}</div>}
  </section>
  <style jsx>{`
    .page{min-height:100vh;background:linear-gradient(160deg,#e7f0ff,#eef3f8 48%,#e8edf4);padding:24px;color:#102033;font-family:Inter,system-ui,sans-serif}.card{width:min(100%,860px);margin:auto;background:#fff;border-radius:28px;padding:24px;box-shadow:0 24px 70px rgba(18,36,61,.14);box-sizing:border-box}.top{display:flex;justify-content:space-between}.top button{border:0;background:none;color:#185fc2;font-weight:900}.top select{border:1px solid #d8e1e9;border-radius:11px;padding:9px;background:#fff}.brand{display:flex;gap:10px;align-items:center;margin-top:18px}.brand>span{width:42px;height:42px;border-radius:13px;background:#1b70eb;color:#fff;display:grid;place-items:center;font-weight:950}.brand strong,.brand small{display:block}.brand small{color:#77879a}.card h1{font-size:30px;margin:18px 0}.summary{border-radius:16px;padding:14px;display:grid;gap:4px}.summary strong{font-size:16px}.summary span{font-size:12px}.summary.good{background:#eaf7f2;color:#0b6b53}.summary.bad{background:#fff0f0;color:#9f2b2b}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}.stats>div{background:#f5f8fc;border:1px solid #e2e8ef;border-radius:15px;padding:12px}.stats small,.stats strong{display:block}.stats small{font-size:9px;color:#718192;font-weight:900;text-transform:uppercase}.stats strong{font-size:21px;margin-top:4px}.toolbar{margin-bottom:14px}.toolbar button{border:0;border-radius:11px;background:#102033;color:#fff;padding:10px 13px;font-weight:900}.message{background:#fff0f0;color:#9b2c2c;border-radius:12px;padding:10px}.muted{color:#7a8795}.checks{display:grid;gap:9px}.checks article{display:flex;gap:10px;align-items:center;border:1px solid #dfe6ee;border-radius:14px;padding:12px}.checks article>span{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;font-weight:950}.checks article div strong,.checks article div small{display:block}.checks article div small{margin-top:3px;color:#8190a0;font-size:10px}.checks article.ok{background:#f7fcfa}.checks article.ok>span{background:#dff4eb;color:#087052}.checks article.fail{background:#fff8f8}.checks article.fail>span{background:#ffe4e4;color:#a12e2e}@media(max-width:650px){.page{padding:0}.card{min-height:100vh;border-radius:0;padding:18px 14px}.stats{grid-template-columns:1fr}.card h1{font-size:26px}}
  `}</style>
  </main>
}
