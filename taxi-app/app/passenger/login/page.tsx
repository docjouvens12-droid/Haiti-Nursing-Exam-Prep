'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Lang = 'fr' | 'ht'

const copy = {
  fr: {
    subtitle: 'Connexion passager',
    title: 'Connectez-vous comme passager',
    intro: 'Entrez l’e-mail et le mot de passe de votre compte passager.',
    email: 'E-mail',
    password: 'Mot de passe',
    preparing: 'Préparation de la connexion…',
    connecting: 'Connexion…',
    submit: 'Se connecter',
    invalidRole: 'Ce compte n’est pas un compte passager. Utilisez un compte client.',
    error: 'Impossible de connecter ce compte.',
    sessionError: 'La session n’a pas pu être enregistrée. Réessayez.'
  },
  ht: {
    subtitle: 'Koneksyon kliyan',
    title: 'Rantre sou kont kliyan',
    intro: 'Antre imel ak modpas kont kliyan/pasaje a.',
    email: 'Imel',
    password: 'Modpas',
    preparing: 'N ap prepare koneksyon an…',
    connecting: 'N ap konekte…',
    submit: 'Konekte kòm kliyan',
    invalidRole: 'Kont sa a pa yon kont kliyan/pasaje. Antre yon kont kliyan.',
    error: 'Nou pa kapab konekte kont sa a.',
    sessionError: 'Sesyon an pa rive anrejistre. Eseye ankò.'
  }
}

export default function PassengerLoginPage() {
  const [lang, setLang] = useState<Lang>('fr')
  const t = copy[lang]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem('taxi-language') as Lang | null
    if (saved === 'fr' || saved === 'ht') setLang(saved)
    setReady(true)
  }, [])

  function changeLang(next: Lang) {
    setLang(next)
    window.localStorage.setItem('taxi-language', next)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user || !data.session) {
      setMessage(error?.message || t.error)
      setBusy(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profile?.role === 'admin' || profile?.role === 'driver') {
      await supabase.auth.signOut()
      setMessage(t.invalidRole)
      setBusy(false)
      return
    }

    // Force the authenticated session into the persisted Supabase client
    // before navigating. This avoids an iOS/Safari race where the next page
    // mounts before the session has been written to local storage.
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })

    if (setSessionError) {
      setMessage(t.sessionError)
      setBusy(false)
      return
    }

    let confirmed = false
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session?.user?.id === data.user.id) {
        confirmed = true
        break
      }
      await new Promise((resolve) => window.setTimeout(resolve, 150))
    }

    if (!confirmed) {
      setMessage(t.sessionError)
      setBusy(false)
      return
    }

    window.location.assign('/passenger/dashboard')
  }

  return <main className="passenger-login-page">
    <section className="passenger-login-card">
      <div className="login-top">
        <div className="brand"><span>T</span><div><strong>Taxi Platform Haiti</strong><small>{t.subtitle}</small></div></div>
        <div className="lang-switch"><button className={lang === 'fr' ? 'active' : ''} onClick={()=>changeLang('fr')}>FR</button><button className={lang === 'ht' ? 'active' : ''} onClick={()=>changeLang('ht')}>KREYÒL</button></div>
      </div>
      <h1>{t.title}</h1>
      <p>{t.intro}</p>
      {!ready ? <div className="loading">{t.preparing}</div> : <form onSubmit={submit}>
        <label>{t.email}<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" required /></label>
        <label>{t.password}<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="current-password" required /></label>
        {message && <div className="message">{message}</div>}
        <button disabled={busy}>{busy ? t.connecting : t.submit}</button>
      </form>}
    </section>
    <style jsx>{`
      .passenger-login-page{min-height:100dvh;display:grid;place-items:center;padding:20px;background:linear-gradient(160deg,#e8f4ef,#eef3f7);font-family:Inter,system-ui,sans-serif;color:#102033}.passenger-login-card{width:min(100%,430px);background:#fff;border-radius:26px;padding:24px;box-shadow:0 24px 70px rgba(16,32,51,.14)}.login-top{display:grid;gap:14px}.brand{display:flex;align-items:center;gap:11px}.brand>span{width:46px;height:46px;border-radius:14px;background:#0f6f59;color:#fff;display:grid;place-items:center;font-weight:900;font-size:20px}.brand strong,.brand small{display:block}.brand small{color:#728294;margin-top:3px}.lang-switch{display:flex;gap:6px;justify-content:flex-end}.lang-switch button{border:1px solid #dbe4ea;background:#fff;border-radius:999px;padding:8px 12px;font-weight:850;color:#5b6a79}.lang-switch button.active{background:#0f6f59;border-color:#0f6f59;color:#fff}.passenger-login-card h1{font-size:27px;margin:24px 0 8px}.passenger-login-card>p{color:#6f7e8e;margin:0 0 20px}.passenger-login-card form{display:grid;gap:14px}.passenger-login-card label{display:grid;gap:7px;font-size:13px;font-weight:800}.passenger-login-card input{width:100%;box-sizing:border-box;border:1px solid #dbe4ea;border-radius:14px;padding:13px 14px;font-size:16px;outline:none}.passenger-login-card input:focus{border-color:#0f6f59;box-shadow:0 0 0 3px rgba(15,111,89,.1)}.passenger-login-card form>button{border:0;border-radius:15px;padding:14px;background:#0f6f59;color:white;font-weight:900;font-size:15px}.passenger-login-card form>button:disabled{opacity:.65}.message{padding:11px 12px;border-radius:12px;background:#fff0f0;color:#9a3030;font-size:13px;font-weight:700}.loading{padding:16px;border-radius:14px;background:#f3f7f8;color:#5f7182;font-weight:700;text-align:center}@media(max-width:600px){.passenger-login-page{padding:0}.passenger-login-card{min-height:100dvh;border-radius:0;padding:24px 18px;box-sizing:border-box}}
    `}</style>
  </main>
}
