'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

type Lang = 'fr' | 'ht'

export default function UnifiedPublicEntry() {
  const pathname = usePathname()
  const [lang, setLang] = useState<Lang>('ht')
  const [visible, setVisible] = useState(false)
  const [checking, setChecking] = useState(true)

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

  if (pathname !== '/' || checking || !visible) return null

  const ht = lang === 'ht'
  return <main className="upe-shell" aria-label={ht ? 'Akèy Taxi Platform Haiti' : 'Accueil Taxi Platform Haiti'}>
    <section className="upe-card">
      <header className="upe-top">
        <div className="upe-brand"><span>🚕</span><div><strong>Taxi Platform Haiti</strong><small>{ht ? 'Deplase fasil. Deplase an sekirite.' : 'Déplacez-vous facilement, en toute sécurité.'}</small></div></div>
        <div className="upe-lang"><button className={lang==='ht'?'active':''} onClick={()=>chooseLanguage('ht')}>KR</button><button className={lang==='fr'?'active':''} onClick={()=>chooseLanguage('fr')}>FR</button></div>
      </header>

      <section className="upe-hero">
        <div className="upe-badge">🇭🇹 {ht ? 'Sèvis transpò pou Ayiti' : 'Mobilité pensée pour Haïti'}</div>
        <h1>{ht ? 'Ki jan ou vle antre?' : 'Comment souhaitez-vous continuer ?'}</h1>
        <p>{ht ? 'Yon sèl platfòm pou pasaje, chofè ak administrasyon.' : 'Une seule plateforme pour les passagers, les chauffeurs et l’administration.'}</p>
      </section>

      <section className="upe-roles">
        <button className="upe-role primary" onClick={()=>setVisible(false)}>
          <span className="upe-icon">👤</span><span><strong>{ht ? 'Mwen se Pasaje' : 'Je suis Passager'}</strong><small>{ht ? 'Konekte oswa kreye yon kont pou mande yon taksi' : 'Connectez-vous ou créez un compte pour commander un taxi'}</small></span><b>›</b>
        </button>
        <button className="upe-role" onClick={()=>window.location.assign('/driver')}>
          <span className="upe-icon">🚘</span><span><strong>{ht ? 'Mwen se Chofè' : 'Je suis Chauffeur'}</strong><small>{ht ? 'Antre nan espas chofè oswa voye aplikasyon ou' : 'Accédez à votre espace chauffeur ou envoyez votre demande'}</small></span><b>›</b>
        </button>
        <button className="upe-role admin" onClick={()=>window.location.assign('/admin/login')}>
          <span className="upe-icon">🛡️</span><span><strong>{ht ? 'Administrasyon' : 'Administration'}</strong><small>{ht ? 'Antre kòm Admin oswa Super Admin' : 'Connexion Admin ou Super Admin'}</small></span><b>›</b>
        </button>
      </section>

      <div className="upe-trust"><span>✓ {ht?'Kont sekirize':'Compte sécurisé'}</span><span>✓ {ht?'FR / Kreyòl':'FR / Kreyòl'}</span><span>✓ {ht?'Sipò mobil':'Compatible mobile'}</span></div>
    </section>
    <style jsx>{`
      .upe-shell{position:fixed;inset:0;z-index:2147480000;overflow:auto;background:radial-gradient(circle at 20% 0,#17735f 0,#0a3f35 42%,#062b25 100%);padding:max(18px,env(safe-area-inset-top)) 14px max(18px,env(safe-area-inset-bottom));display:grid;place-items:center;font-family:Inter,system-ui,-apple-system,sans-serif;color:#102033}
      .upe-card{width:min(100%,440px);background:#fff;border-radius:30px;padding:18px;box-shadow:0 28px 80px rgba(0,0,0,.28)}
      .upe-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.upe-brand{display:flex;align-items:center;gap:10px;min-width:0}.upe-brand>span{width:46px;height:46px;border-radius:15px;background:#0f705a;display:grid;place-items:center;font-size:24px;box-shadow:0 10px 22px rgba(15,112,90,.2)}.upe-brand strong,.upe-brand small{display:block}.upe-brand strong{font-size:14px}.upe-brand small{font-size:9px;color:#71817b;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}.upe-lang{display:flex;background:#edf3f1;padding:3px;border-radius:11px}.upe-lang button{border:0;background:transparent;border-radius:8px;padding:7px 8px;font-size:10px;font-weight:900;color:#63736d}.upe-lang button.active{background:#fff;color:#0f705a;box-shadow:0 2px 8px rgba(16,32,51,.08)}
      .upe-hero{padding:34px 4px 24px}.upe-badge{display:inline-flex;padding:7px 10px;border-radius:999px;background:#eaf6f1;color:#0f705a;font-size:10px;font-weight:900}.upe-hero h1{font-size:34px;line-height:1.02;margin:14px 0 10px;letter-spacing:-.035em}.upe-hero p{margin:0;color:#6b7a75;font-size:13px;line-height:1.55;max-width:340px}
      .upe-roles{display:grid;gap:10px}.upe-role{width:100%;border:1px solid #dce7e3;background:#f9fbfa;border-radius:18px;padding:13px;display:grid;grid-template-columns:48px 1fr auto;gap:11px;align-items:center;text-align:left;color:#17352d;min-height:78px;touch-action:manipulation}.upe-role.primary{background:#0f705a;color:#fff;border-color:#0f705a;box-shadow:0 12px 26px rgba(15,112,90,.22)}.upe-role.admin{background:#f4f5f6}.upe-icon{width:48px;height:48px;border-radius:14px;background:#fff;display:grid;place-items:center;font-size:24px;box-shadow:0 4px 12px rgba(16,32,51,.08)}.upe-role span:nth-child(2){min-width:0}.upe-role strong,.upe-role small{display:block}.upe-role strong{font-size:14px}.upe-role small{font-size:10px;line-height:1.4;margin-top:4px;color:#70807a}.upe-role.primary small{color:#d9eee7}.upe-role b{font-size:22px;font-weight:500}
      .upe-trust{display:flex;justify-content:center;flex-wrap:wrap;gap:8px 13px;margin-top:18px;padding-top:15px;border-top:1px solid #edf1ef;color:#71817b;font-size:9px;font-weight:750}
      @media(max-width:390px){.upe-card{padding:14px;border-radius:24px}.upe-brand small{max-width:160px}.upe-hero{padding:26px 2px 19px}.upe-hero h1{font-size:29px}.upe-role{grid-template-columns:44px 1fr auto;padding:11px}.upe-icon{width:44px;height:44px}}
    `}</style>
  </main>
}
