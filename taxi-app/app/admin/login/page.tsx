'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Lang = 'fr' | 'ht'

const copy = {
  fr: { title: 'Connexion administrateur', subtitle: 'Accédez à l’administration de Taxi Platform Haiti', email: 'E-mail', password: 'Mot de passe', login: 'Se connecter comme administrateur', loading: 'Connexion…', denied: 'Ce compte n’a pas les droits administrateur.', back: 'Espaces', failed: 'Connexion impossible. Vérifiez votre e-mail et votre mot de passe.' },
  ht: { title: 'Koneksyon administratè', subtitle: 'Antre nan administrasyon Taxi Platform Haiti', email: 'Imel', password: 'Modpas', login: 'Konekte kòm administratè', loading: 'N ap konekte…', denied: 'Kont sa a pa gen dwa administratè.', back: 'Espas yo', failed: 'Koneksyon pa mache. Verifye imel ak modpas ou.' },
}

export default function AdminLoginPage() {
  const [lang, setLang] = useState<Lang>('fr')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const t = copy[lang]

  useEffect(() => {
    const saved = localStorage.getItem('taxi-language') as Lang | null
    if (saved === 'fr' || saved === 'ht') setLang(saved)
    void (async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
      if (profile?.role === 'admin') window.location.assign('/admin')
    })()
  }, [])

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setMessage(t.loading)

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error || !data.user) {
      setMessage(error?.message || t.failed)
      setBusy(false)
      return
    }

    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
    if (profileError || profile?.role !== 'admin') {
      await supabase.auth.signOut()
      setMessage(t.denied)
      setBusy(false)
      return
    }

    window.location.assign('/admin')
  }

  function changeLang(next: Lang) { setLang(next); localStorage.setItem('taxi-language', next) }

  return <main className="page"><section className="card">
    <div className="top"><a className="back" href="/spaces">‹ {t.back}</a><select value={lang} onChange={(e)=>changeLang(e.target.value as Lang)}><option value="fr">Français</option><option value="ht">Kreyòl</option></select></div>
    <div className="brand"><span>T</span><div><strong>Taxi Platform Haiti</strong><small>{t.subtitle}</small></div></div>
    <h1>{t.title}</h1>
    <form onSubmit={submit}>
      <label>{t.email}<input type="email" inputMode="email" autoCapitalize="none" required autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} /></label>
      <label>{t.password}<input type="password" required autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} /></label>
      {message && <div className={busy ? 'message info' : 'message'}>{message}</div>}
      <button type="submit" className="login" disabled={busy}>{busy ? t.loading : t.login}</button>
    </form>
  </section>
  <style jsx>{`
    .page{min-height:100vh;display:grid;place-items:center;background:linear-gradient(160deg,#e5f1ed,#eef2f7 45%,#e7edf3);padding:24px;color:#102033;font-family:Inter,system-ui,sans-serif}.card{width:min(100%,500px);background:#fff;border-radius:28px;padding:24px;box-shadow:0 24px 70px rgba(18,36,61,.15)}.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.back{text-decoration:none;color:#0f5f4d;font-weight:900}.top select{border:1px solid #dbe3eb;border-radius:12px;background:#fff;padding:9px 11px;min-height:44px}.brand{display:flex;align-items:center;gap:10px}.brand>span{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:#0f5f4d;color:#fff;font-weight:900}.brand strong,.brand small{display:block}.brand small{color:#758596;margin-top:2px}.card h1{font-size:31px;margin:24px 0 18px}.card form{display:grid;gap:15px}.card label{display:grid;gap:7px;color:#506174;font-weight:850;font-size:13px}.card input{border:1px solid #dbe3eb;border-radius:14px;padding:14px;font-size:16px;min-height:52px}.message{padding:12px 14px;border-radius:13px;background:#fff0f0;color:#9d2d2d;font-weight:700;font-size:13px}.message.info{background:#eef7f4;color:#155f4e}.login{width:100%;min-height:54px;border:0;border-radius:15px;padding:15px;background:#0f5f4d;color:#fff;font-weight:900;font-size:16px}.login:disabled{opacity:.65}@media(max-width:560px){.page{padding:0}.card{min-height:100vh;border-radius:0;padding:24px 18px}}
  `}</style></main>
}
