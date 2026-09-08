'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function PassengerLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      await supabase.auth.signOut()
      if (active) setReady(true)
    })()
    return () => { active = false }
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      setMessage(error?.message || 'Nou pa kapab konekte kont sa a.')
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
      setMessage('Kont sa a pa yon kont kliyan/pasaje. Antre yon kont kliyan.')
      setBusy(false)
      return
    }

    window.location.replace('/passenger/dashboard')
  }

  return <main className="passenger-login-page">
    <section className="passenger-login-card">
      <div className="brand"><span>T</span><div><strong>Taxi Platform Haiti</strong><small>Koneksyon kliyan / Connexion passager</small></div></div>
      <h1>Rantre sou kont kliyan</h1>
      <p>Antre imel ak modpas kont kliyan/pasaje a.</p>
      {!ready ? <div className="loading">N ap prepare koneksyon an…</div> : <form onSubmit={submit}>
        <label>Imel / E-mail<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" required /></label>
        <label>Modpas / Mot de passe<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="current-password" required /></label>
        {message && <div className="message">{message}</div>}
        <button disabled={busy}>{busy ? 'N ap konekte…' : 'Konekte kòm kliyan'}</button>
      </form>}
    </section>
    <style jsx>{`
      .passenger-login-page{min-height:100dvh;display:grid;place-items:center;padding:20px;background:linear-gradient(160deg,#e8f4ef,#eef3f7);font-family:Inter,system-ui,sans-serif;color:#102033}.passenger-login-card{width:min(100%,430px);background:#fff;border-radius:26px;padding:24px;box-shadow:0 24px 70px rgba(16,32,51,.14)}.brand{display:flex;align-items:center;gap:11px}.brand>span{width:46px;height:46px;border-radius:14px;background:#0f6f59;color:#fff;display:grid;place-items:center;font-weight:900;font-size:20px}.brand strong,.brand small{display:block}.brand small{color:#728294;margin-top:3px}.passenger-login-card h1{font-size:27px;margin:26px 0 8px}.passenger-login-card>p{color:#6f7e8e;margin:0 0 20px}.passenger-login-card form{display:grid;gap:14px}.passenger-login-card label{display:grid;gap:7px;font-size:13px;font-weight:800}.passenger-login-card input{width:100%;box-sizing:border-box;border:1px solid #dbe4ea;border-radius:14px;padding:13px 14px;font-size:16px;outline:none}.passenger-login-card input:focus{border-color:#0f6f59;box-shadow:0 0 0 3px rgba(15,111,89,.1)}.passenger-login-card button{border:0;border-radius:15px;padding:14px;background:#0f6f59;color:white;font-weight:900;font-size:15px}.passenger-login-card button:disabled{opacity:.65}.message{padding:11px 12px;border-radius:12px;background:#fff0f0;color:#9a3030;font-size:13px;font-weight:700}.loading{padding:16px;border-radius:14px;background:#f3f7f8;color:#5f7182;font-weight:700;text-align:center}@media(max-width:600px){.passenger-login-page{padding:0}.passenger-login-card{min-height:100dvh;border-radius:0;padding:24px 18px;box-sizing:border-box}}
    `}</style>
  </main>
}
