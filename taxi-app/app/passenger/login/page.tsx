'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function PassengerLoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) window.location.replace('/passenger/dashboard')
    })
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true); setMessage('')
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() } } })
        if (error) throw error
        if (data.session) window.location.replace('/passenger/dashboard')
        else setMessage('Compte créé. Vérifiez votre e-mail, puis connectez-vous.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
        window.location.replace('/passenger/dashboard')
      }
    } catch (err: any) {
      setMessage(err?.message || 'Impossible de se connecter.')
    } finally { setBusy(false) }
  }

  return <main className="login-layer">
    <section className="card">
      <div className="brand"><span>T</span><div><strong>Taxi Platform Haiti</strong><small>Déplacez-vous facilement, en toute sécurité</small></div></div>
      <p>{mode === 'signin' ? 'BON RETOUR' : 'CRÉER UN COMPTE PASSAGER'}</p>
      <h1>{mode === 'signin' ? 'Connectez-vous pour commander un taxi' : 'Inscrivez-vous comme passager'}</h1>
      <form onSubmit={submit}>
        {mode === 'signup' && <label>Nom complet<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" required /></label>}
        <label>E-mail<input type="email" inputMode="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} required /></label>
        <label>Mot de passe<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==='signin'?'current-password':'new-password'} minLength={6} required /></label>
        {message && <div className="msg">{message}</div>}
        <button type="submit" disabled={busy}>{busy ? 'Veuillez patienter…' : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}</button>
      </form>
      <button className="switch" type="button" onClick={()=>{setMode(mode==='signin'?'signup':'signin');setMessage('')}}>{mode==='signin'?'Pas encore de compte ? Créez-en un':'Vous avez déjà un compte ? Connectez-vous'}</button>
    </section>
    <style jsx>{`
      .login-layer{position:fixed!important;inset:0!important;z-index:2147483647!important;overflow:auto!important;background:radial-gradient(circle at top,#dcefe8,#eef2f7 45%,#e8edf3)!important;display:grid!important;place-items:center!important;padding:20px!important;pointer-events:auto!important;touch-action:auto!important;font-family:Inter,system-ui,-apple-system,sans-serif;color:#102033}
      .card{width:min(100%,430px);background:#fff;border-radius:28px;padding:28px 24px;box-shadow:0 24px 70px rgba(18,36,61,.18);position:relative;z-index:2147483647;pointer-events:auto!important}
      .brand{display:flex;align-items:center;gap:12px;margin-bottom:30px}.brand>span{width:42px;height:42px;border-radius:13px;background:#1672df;color:white;display:grid;place-items:center;font-size:22px;font-weight:900}.brand strong,.brand small{display:block}.brand strong{font-size:19px}.brand small{font-size:12px;color:#7c8b9b;margin-top:2px}
      p{font-size:12px;font-weight:900;letter-spacing:.08em;color:#1672df;margin:0 0 8px}h1{font-size:28px;line-height:1.08;margin:0 0 24px}
      form{display:grid;gap:15px;position:relative;z-index:2147483647}label{display:grid;gap:7px;font-weight:800;color:#4f6072;font-size:13px;position:relative;z-index:2147483647}
      input{display:block!important;position:relative!important;z-index:2147483647!important;width:100%!important;min-height:54px!important;border:1px solid #cfdbe5!important;border-radius:14px!important;padding:13px 14px!important;background:#fff!important;color:#102033!important;font-size:16px!important;pointer-events:auto!important;touch-action:auto!important;-webkit-user-select:text!important;user-select:text!important;-webkit-appearance:none!important;appearance:none!important;opacity:1!important}
      input:focus{outline:3px solid rgba(15,122,98,.16)!important;border-color:#0f7a62!important}
      form button{min-height:54px;border:0;border-radius:15px;background:#0f6f59;color:#fff;font-size:17px;font-weight:900;pointer-events:auto!important}.switch{width:100%;margin-top:16px;border:0;background:transparent;color:#1672df;font-size:14px;font-weight:850;padding:10px;pointer-events:auto!important}.msg{padding:10px;border-radius:12px;background:#fff1f1;color:#9d2d2d;font-size:12px;font-weight:700}
    `}</style>
  </main>
}
