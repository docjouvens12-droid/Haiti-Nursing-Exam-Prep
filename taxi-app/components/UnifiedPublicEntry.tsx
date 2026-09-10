'use client'

import { FormEvent, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

type Lang = 'fr' | 'ht'

export default function UnifiedPublicEntry() {
  const pathname = usePathname()
  const [lang, setLang] = useState<Lang>('ht')
  const [visible, setVisible] = useState(false)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')

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
      if (!mounted) return
      setVisible(!session?.user)
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

  function continueWithEmail(event: FormEvent) {
    event.preventDefault()
    const clean = email.trim().toLowerCase()
    if (!clean) return
    window.sessionStorage.setItem('taxi-entry-email', clean)
    setVisible(false)

    // Prefill the existing secure auth form without changing its authentication logic.
    window.setTimeout(() => {
      const input = document.querySelector('.auth-form input[type="email"]') as HTMLInputElement | null
      if (!input) return
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      setter?.call(input, clean)
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
      const password = document.querySelector('.auth-form input[type="password"]') as HTMLInputElement | null
      password?.focus()
    }, 80)
  }

  if (pathname !== '/' || checking || !visible) return null

  const ht = lang === 'ht'
  return <main className="upe-shell" aria-label={ht ? 'Akèy Taxi Platform Haiti' : 'Accueil Taxi Platform Haiti'}>
    <section className="upe-card">
      <header className="upe-top">
        <div className="upe-brand"><span>🚕</span><div><strong>Taxi Platform Haiti</strong><small>{ht ? 'Deplase fasil. Deplase an sekirite.' : 'Déplacez-vous facilement, en toute sécurité.'}</small></div></div>
        <div className="upe-lang"><button className={lang==='ht'?'active':''} onClick={()=>chooseLanguage('ht')}>KR</button><button className={lang==='fr'?'active':''} onClick={()=>chooseLanguage('fr')}>FR</button></div>
      </header>

      <section className="upe-hero">
        <div className="upe-badge">🇭🇹 {ht ? 'Yon sèl pòt antre pou tout moun' : 'Une seule entrée pour tout le monde'}</div>
        <h1>{ht ? 'Antre imel ou pou kòmanse' : 'Entrez votre e-mail pour commencer'}</h1>
        <p>{ht ? 'Nou pral gide ou otomatikman selon kont ou: pasaje, chofè oswa administrasyon.' : 'Nous vous guiderons automatiquement selon votre compte : passager, chauffeur ou administration.'}</p>
      </section>

      <form className="upe-email-form" onSubmit={continueWithEmail}>
        <label htmlFor="upe-email">{ht ? 'Imel' : 'E-mail'}</label>
        <div className="upe-email-box"><span>✉️</span><input id="upe-email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder={ht ? 'nonou@email.com' : 'votre@email.com'} value={email} onChange={e=>setEmail(e.target.value)} required /></div>
        <button type="submit">{ht ? 'Kontinye' : 'Continuer'} <b>›</b></button>
      </form>

      <section className="upe-flow">
        <div><span>👤</span><p><strong>{ht?'Pasaje':'Passager'}</strong><small>{ht?'Konekte oswa kreye kont, epi mande yon taksi.':'Connexion ou inscription, puis commandez un taxi.'}</small></p></div>
        <div><span>🚘</span><p><strong>{ht?'Chofè':'Chauffeur'}</strong><small>{ht?'Apre koneksyon, suiv pwosesis aplikasyon chofè a si sa nesesè.':'Après connexion, suivez la procédure de candidature chauffeur si nécessaire.'}</small></p></div>
        <div><span>🛡️</span><p><strong>Admin</strong><small>{ht?'Kont admin otorize ale dirèk sou dashboard administrasyon an.':'Un compte admin autorisé est dirigé vers le tableau de bord.'}</small></p></div>
      </section>

      <div className="upe-trust"><span>✓ {ht?'Kont sekirize':'Compte sécurisé'}</span><span>✓ FR / Kreyòl</span><span>✓ {ht?'Yon sèl paj akèy':'Une seule page d’accueil'}</span></div>
    </section>
    <style jsx>{`
      .upe-shell{position:fixed;inset:0;z-index:2147480000;overflow:auto;background:radial-gradient(circle at 20% 0,#17735f 0,#0a3f35 42%,#062b25 100%);padding:max(18px,env(safe-area-inset-top)) 14px max(18px,env(safe-area-inset-bottom));display:grid;place-items:center;font-family:Inter,system-ui,-apple-system,sans-serif;color:#102033}
      .upe-card{width:min(100%,440px);background:#fff;border-radius:30px;padding:18px;box-shadow:0 28px 80px rgba(0,0,0,.28)}
      .upe-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.upe-brand{display:flex;align-items:center;gap:10px;min-width:0}.upe-brand>span{width:46px;height:46px;border-radius:15px;background:#0f705a;display:grid;place-items:center;font-size:24px;box-shadow:0 10px 22px rgba(15,112,90,.2)}.upe-brand strong,.upe-brand small{display:block}.upe-brand strong{font-size:14px}.upe-brand small{font-size:9px;color:#71817b;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}.upe-lang{display:flex;background:#edf3f1;padding:3px;border-radius:11px}.upe-lang button{border:0;background:transparent;border-radius:8px;padding:7px 8px;font-size:10px;font-weight:900;color:#63736d}.upe-lang button.active{background:#fff;color:#0f705a;box-shadow:0 2px 8px rgba(16,32,51,.08)}
      .upe-hero{padding:32px 4px 20px}.upe-badge{display:inline-flex;padding:7px 10px;border-radius:999px;background:#eaf6f1;color:#0f705a;font-size:10px;font-weight:900}.upe-hero h1{font-size:34px;line-height:1.03;margin:14px 0 10px;letter-spacing:-.035em}.upe-hero p{margin:0;color:#6b7a75;font-size:13px;line-height:1.55;max-width:360px}
      .upe-email-form{display:grid;gap:9px}.upe-email-form label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#5e7069}.upe-email-box{display:grid;grid-template-columns:28px 1fr;align-items:center;border:1.5px solid #d8e4df;background:#fbfdfc;border-radius:16px;padding:0 13px;min-height:58px}.upe-email-box:focus-within{border-color:#0f705a;box-shadow:0 0 0 4px rgba(15,112,90,.1)}.upe-email-box span{font-size:17px}.upe-email-box input{width:100%;border:0;outline:0;background:transparent;color:#102033;font-size:16px;font-weight:700;min-width:0}.upe-email-form>button{margin-top:3px;border:0;border-radius:16px;min-height:56px;background:#0f705a;color:#fff;font-size:15px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:9px;box-shadow:0 12px 28px rgba(15,112,90,.23);touch-action:manipulation}.upe-email-form>button b{font-size:22px;font-weight:500}
      .upe-flow{display:grid;gap:8px;margin-top:20px;padding-top:17px;border-top:1px solid #edf1ef}.upe-flow>div{display:grid;grid-template-columns:34px 1fr;gap:9px;align-items:start}.upe-flow>div>span{width:34px;height:34px;border-radius:11px;background:#eef6f3;display:grid;place-items:center}.upe-flow p{margin:0}.upe-flow strong,.upe-flow small{display:block}.upe-flow strong{font-size:11px;color:#17352d}.upe-flow small{font-size:9.5px;line-height:1.35;color:#778680;margin-top:2px}
      .upe-trust{display:flex;justify-content:center;flex-wrap:wrap;gap:8px 13px;margin-top:16px;padding-top:14px;border-top:1px solid #edf1ef;color:#71817b;font-size:9px;font-weight:750}
      @media(max-width:390px){.upe-card{padding:14px;border-radius:24px}.upe-brand small{max-width:160px}.upe-hero{padding:25px 2px 17px}.upe-hero h1{font-size:29px}}
    `}</style>
  </main>
}
