'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function PassengerLoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) window.location.replace('/passenger/dashboard')
    })
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setMessage('')

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } },
        })
        if (error) throw error
        if (data.session) window.location.replace('/passenger/dashboard')
        else setMessage('Compte créé. Vérifiez votre e-mail, puis connectez-vous.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error
        window.location.replace('/passenger/dashboard')
      }
    } catch (error: any) {
      setMessage(error?.message || 'Impossible de se connecter.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="passenger-auth-page">
      <section className="passenger-auth-card">
        <div className="language-pill">🌐 Français⌄</div>

        <div className="brand-row">
          <span className="brand-logo">T</span>
          <div>
            <strong>Taxi Platform Haiti</strong>
            <small>Déplacez-vous facilement, en toute sécurité</small>
          </div>
        </div>

        <p className="eyebrow">{mode === 'signin' ? 'BON RETOUR' : 'CRÉER UN COMPTE PASSAGER'}</p>
        <h1>{mode === 'signin' ? 'Connectez-vous pour commander un taxi' : 'Inscrivez-vous comme passager'}</h1>

        <form onSubmit={submit} className="passenger-auth-form">
          {mode === 'signup' && (
            <label>
              Nom complet
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            E-mail
            <input
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </label>

          <label>
            Mot de passe
            <span className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                minLength={6}
                required
              />
              <button type="button" className="eye" onClick={() => setShowPassword((v) => !v)} aria-label="Afficher le mot de passe">
                {showPassword ? '🙈' : '👁'}
              </button>
            </span>
          </label>

          {message && <div className="auth-message">{message}</div>}

          <button className="submit-button" type="submit" disabled={busy}>
            {busy ? 'Veuillez patienter…' : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <button className="switch-button" type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage('') }}>
          {mode === 'signin' ? 'Pas encore de compte ? Créez-en un' : 'Vous avez déjà un compte ? Connectez-vous'}
        </button>
      </section>

      <style jsx>{`
        .passenger-auth-page{min-height:100dvh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at top,#dcefe8 0,#eef2f7 40%,#e8edf3 100%);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#102033}
        .passenger-auth-card{position:relative;z-index:100;width:min(100%,420px);background:#fff;border-radius:28px;padding:26px;box-shadow:0 24px 70px rgba(18,36,61,.15);pointer-events:auto!important;touch-action:manipulation}
        .language-pill{margin-left:auto;width:max-content;padding:10px 14px;border:1px solid #dbe4e9;border-radius:13px;font-size:12px;font-weight:800;color:#33475b;box-shadow:0 6px 18px rgba(19,39,64,.08)}
        .brand-row{display:flex;align-items:center;gap:10px;margin:24px 0 30px}.brand-logo{width:38px;height:38px;border-radius:12px;background:#1d73df;color:#fff;display:grid;place-items:center;font-weight:900;font-size:20px}.brand-row strong,.brand-row small{display:block}.brand-row strong{font-size:18px}.brand-row small{font-size:11px;color:#7c8b9b;margin-top:2px}
        .eyebrow{margin:0 0 5px;color:#1471df;font-size:11px;font-weight:900;letter-spacing:.08em}.passenger-auth-card h1{font-size:28px;line-height:1.08;margin:0 0 22px}
        .passenger-auth-form{display:grid;gap:14px;position:relative;z-index:101}.passenger-auth-form label{display:grid;gap:7px;font-size:12px;font-weight:800;color:#4f6072;position:relative;z-index:102}.passenger-auth-form input{position:relative!important;z-index:103!important;width:100%;min-height:50px;border:1px solid #d7e1e9;border-radius:14px;padding:12px 14px;font-size:16px!important;color:#102033;background:#fff!important;outline:0;pointer-events:auto!important;touch-action:manipulation!important;-webkit-user-select:text!important;user-select:text!important;-webkit-appearance:none;appearance:none}.passenger-auth-form input:focus{border-color:#0f7a62;box-shadow:0 0 0 3px rgba(15,122,98,.12)}
        .password-wrap{position:relative;display:block}.password-wrap input{padding-right:54px}.eye{position:absolute;right:8px;top:50%;transform:translateY(-50%);z-index:110;border:0;background:transparent;font-size:20px;padding:8px;pointer-events:auto}
        .submit-button{min-height:52px;margin-top:4px;border:0;border-radius:15px;background:#0f6f59;color:#fff;font-size:17px;font-weight:900;pointer-events:auto;touch-action:manipulation}.submit-button:disabled{opacity:.7}.switch-button{width:100%;margin-top:16px;border:0;background:transparent;color:#1672df;font-size:13px;font-weight:850;padding:8px;pointer-events:auto;touch-action:manipulation}.auth-message{padding:10px 12px;border-radius:12px;background:#fff1f1;color:#9d2d2d;font-size:11px;font-weight:700}
        @media(max-width:480px){.passenger-auth-page{padding:18px}.passenger-auth-card{padding:24px 22px}.passenger-auth-card h1{font-size:27px}}
      `}</style>
    </main>
  )
}
