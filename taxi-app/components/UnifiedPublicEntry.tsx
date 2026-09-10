'use client'

import { FormEvent, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

type Lang = 'fr' | 'ht'
type Mode = 'signin' | 'signup'

export default function UnifiedPublicEntry() {
  const pathname = usePathname()
  const [lang, setLang] = useState<Lang>('fr')
  const [mode, setMode] = useState<Mode>('signin')
  const [visible, setVisible] = useState(false)
  const [checking, setChecking] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (pathname !== '/') { setChecking(false); setVisible(false); return }
    const saved = window.localStorage.getItem('taxi-language') as Lang | null
    if (saved === 'fr' || saved === 'ht') setLang(saved)
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setVisible(!data.session?.user)
      setChecking(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setVisible(!session?.user)
    })
    return () => { mounted = false; listener.subscription.unsubscribe() }
  }, [pathname])

  useEffect(() => {
    document.body.classList.toggle('unified-public-entry-open', visible)
    return () => document.body.classList.remove('unified-public-entry-open')
  }, [visible])

  function chooseLanguage(next: Lang) {
    setLang(next)
    window.localStorage.setItem('taxi-language', next)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const cleanEmail = email.trim().toLowerCase()

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
      if (error) setMessage(lang === 'ht' ? 'Imel oswa modpas la pa kòrèk.' : 'E-mail ou mot de passe incorrect.')
    } else {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName.trim(), role: 'passenger' },
        },
      })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage(lang === 'ht' ? 'Kont lan kreye. Tcheke imel ou epi konfime adrès imel la anvan ou konekte.' : 'Compte créé. Vérifiez votre e-mail et confirmez votre adresse avant de vous connecter.')
        setMode('signin')
        setPassword('')
      }
    }
    setBusy(false)
  }

  if (pathname !== '/' || checking || !visible) return null
  const ht = lang === 'ht'

  return <main className="upe-shell">
    <section className="upe-card">
      <header className="upe-top">
        <div className="upe-brand"><span>🚕</span><div><strong>Taxi Platform Haiti</strong><small>{ht ? 'Deplase fasil. Deplase an sekirite.' : 'Déplacez-vous facilement, en toute sécurité.'}</small></div></div>
        <div className="upe-lang"><button className={lang==='ht'?'active':''} onClick={()=>chooseLanguage('ht')}>KR</button><button className={lang==='fr'?'active':''} onClick={()=>chooseLanguage('fr')}>FR</button></div>
      </header>

      <section className="upe-hero">
        <h1>{mode === 'signin' ? (ht ? 'Konekte' : 'Connectez-vous') : (ht ? 'Enskri' : 'Inscrivez-vous')}</h1>
        <p>{mode === 'signin' ? (ht ? 'Antre imel ak modpas ou. N ap voye ou otomatikman nan espas ki koresponn ak kont ou.' : 'Entrez votre e-mail et votre mot de passe. Vous serez dirigé automatiquement vers votre espace.') : (ht ? 'Kreye kont ou. N ap voye yon imel konfimasyon ba ou.' : 'Créez votre compte. Un e-mail de confirmation vous sera envoyé.')}</p>
      </section>

      <form className="upe-form" onSubmit={submit}>
        {mode === 'signup' && <><label htmlFor="upe-name">{ht ? 'Non konplè' : 'Nom complet'}</label><input id="upe-name" value={fullName} onChange={e=>setFullName(e.target.value)} autoComplete="name" required /></>}
        <label htmlFor="upe-email">{ht ? 'Imel' : 'E-mail'}</label>
        <input id="upe-email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@exemple.com" required />
        <label htmlFor="upe-password">{ht ? 'Modpas' : 'Mot de passe'}</label>
        <input id="upe-password" type="password" autoComplete={mode==='signin'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required />
        {message && <div className="upe-message">{message}</div>}
        <button className="upe-submit" type="submit" disabled={busy}>{busy ? (ht ? 'Tanpri tann…' : 'Veuillez patienter…') : mode === 'signin' ? (ht ? 'Konekte' : 'Se connecter') : (ht ? 'Enskri' : "S'inscrire")}</button>
      </form>

      <div className="upe-switch">
        <span>{mode === 'signin' ? (ht ? 'Ou poko gen kont?' : 'Vous n’avez pas encore de compte ?') : (ht ? 'Ou deja gen kont?' : 'Vous avez déjà un compte ?')}</span>
        <button onClick={()=>{setMode(mode==='signin'?'signup':'signin');setMessage('')}}>{mode === 'signin' ? (ht ? 'Enskri' : "S'inscrire") : (ht ? 'Konekte' : 'Se connecter')}</button>
      </div>
      <div className="upe-note">🔒 {ht ? 'Kont admin, chofè ak pasaje itilize menm koneksyon an.' : 'Les comptes admin, chauffeur et passager utilisent la même connexion.'}</div>
    </section>

    <style jsx>{`
      .upe-shell{position:fixed;inset:0;z-index:2147480000;overflow:auto;background:radial-gradient(circle at 20% 0,#17735f 0,#0a3f35 42%,#062b25 100%);padding:max(18px,env(safe-area-inset-top)) 14px max(18px,env(safe-area-inset-bottom));display:grid;place-items:center;font-family:Inter,system-ui,-apple-system,sans-serif;color:#102033}.upe-card{width:min(100%,430px);background:#fff;border-radius:30px;padding:20px;box-shadow:0 28px 80px rgba(0,0,0,.28)}.upe-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.upe-brand{display:flex;align-items:center;gap:10px;min-width:0}.upe-brand>span{width:46px;height:46px;border-radius:15px;background:#0f705a;display:grid;place-items:center;font-size:24px}.upe-brand strong,.upe-brand small{display:block}.upe-brand strong{font-size:14px}.upe-brand small{font-size:9px;color:#71817b;margin-top:2px}.upe-lang{display:flex;background:#edf3f1;padding:3px;border-radius:11px}.upe-lang button{border:0;background:transparent;border-radius:8px;padding:7px 8px;font-size:10px;font-weight:900}.upe-lang button.active{background:#fff;color:#0f705a}.upe-hero{padding:34px 2px 22px}.upe-hero h1{font-size:34px;line-height:1;margin:0 0 10px}.upe-hero p{margin:0;color:#6b7a75;font-size:13px;line-height:1.5}.upe-form{display:grid;gap:8px}.upe-form label{font-size:10px;text-transform:uppercase;letter-spacing:.07em;font-weight:900;color:#5e7069;margin-top:4px}.upe-form input{width:100%;height:56px;border:1.5px solid #d8e4df;border-radius:16px;padding:0 14px;font-size:16px;outline:none;background:#fbfdfc}.upe-form input:focus{border-color:#0f705a;box-shadow:0 0 0 4px rgba(15,112,90,.1)}.upe-submit{margin-top:8px;border:0;border-radius:16px;min-height:56px;background:#0f705a;color:#fff;font-size:15px;font-weight:900;box-shadow:0 12px 28px rgba(15,112,90,.23)}.upe-submit:disabled{opacity:.65}.upe-message{margin-top:5px;padding:11px 12px;border-radius:12px;background:#edf7f3;color:#17664f;font-size:11px;font-weight:750;line-height:1.4}.upe-switch{display:flex;justify-content:center;align-items:center;gap:5px;flex-wrap:wrap;margin-top:18px;font-size:11px;color:#71817b}.upe-switch button{border:0;background:transparent;color:#0f705a;font-weight:900;text-decoration:underline}.upe-note{margin-top:16px;padding-top:14px;border-top:1px solid #edf1ef;text-align:center;color:#71817b;font-size:9px;font-weight:700}@media(max-width:390px){.upe-card{padding:15px;border-radius:24px}.upe-hero{padding:27px 2px 18px}.upe-hero h1{font-size:30px}}
    `}</style>
  </main>
}
