'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Lang = 'fr' | 'ht'
type Role = 'passenger' | 'driver' | 'admin' | null

const copy = {
  fr: {
    title: 'Choisissez votre espace',
    subtitle: 'Accédez rapidement à la bonne partie de Taxi Platform Haiti.',
    passenger: 'Espace passager',
    passengerText: 'Commander un taxi et suivre vos trajets.',
    driver: 'Espace chauffeur',
    driverText: 'Passer en ligne, recevoir et gérer les courses.',
    admin: 'Administration',
    adminText: 'Valider les chauffeurs et gérer la plateforme.',
    login: 'Se connecter',
    logout: 'Se déconnecter',
    loading: 'Chargement de votre compte…',
    connectedAs: 'Connecté comme',
    notConnected: 'Aucun compte connecté.',
  },
  ht: {
    title: 'Chwazi espas ou',
    subtitle: 'Antre rapid nan bon pati Taxi Platform Haiti a.',
    passenger: 'Espas pasaje',
    passengerText: 'Mande taksi epi swiv trajè ou yo.',
    driver: 'Espas chofè',
    driverText: 'Mete tèt ou sou liy, resevwa epi jere trajè.',
    admin: 'Administrasyon',
    adminText: 'Apwouve chofè epi jere platfòm lan.',
    login: 'Konekte',
    logout: 'Dekonekte',
    loading: 'N ap chaje kont ou…',
    connectedAs: 'Konekte kòm',
    notConnected: 'Pa gen kont ki konekte.',
  },
}

export default function SpacesPage() {
  const [lang, setLang] = useState<Lang>('fr')
  const [role, setRole] = useState<Role>(null)
  const [email, setEmail] = useState('')
  const [driverApproved, setDriverApproved] = useState(false)
  const [driverHref, setDriverHref] = useState('/driver/dashboard')
  const [loading, setLoading] = useState(true)
  const t = copy[lang]

  useEffect(() => {
    const saved = localStorage.getItem('taxi-language') as Lang | null
    if (saved === 'fr' || saved === 'ht') setLang(saved)
    void loadAccount()
  }, [])

  async function loadAccount() {
    setLoading(true)
    const { data: auth } = await supabase.auth.getUser()
    const user = auth.user
    if (!user) {
      setRole(null)
      setEmail('')
      setDriverApproved(false)
      setDriverHref('/driver/dashboard')
      setLoading(false)
      return
    }
    setEmail(user.email ?? '')
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    setRole((profile?.role ?? 'passenger') as Role)
    const { data: driver } = await supabase.from('driver_profiles').select('status').eq('user_id', user.id).maybeSingle()
    const approved = driver?.status === 'approved'
    setDriverApproved(approved)

    if (approved || profile?.role === 'driver') {
      const { data: activeRide } = await supabase
        .from('rides')
        .select('id')
        .eq('driver_id', user.id)
        .in('status', ['accepted', 'driver_arriving', 'in_progress'])
        .order('requested_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      setDriverHref(activeRide ? '/driver/navigation' : '/driver/dashboard')
    } else {
      setDriverHref('/driver/dashboard')
    }

    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    location.href = '/spaces'
  }

  function changeLang(next: Lang) {
    setLang(next)
    localStorage.setItem('taxi-language', next)
  }

  return <main className="page"><section className="card">
    <div className="topbar">
      <div className="brand"><span>T</span><div><strong>Taxi Platform Haiti</strong><small>{t.subtitle}</small></div></div>
      <select value={lang} onChange={(e)=>changeLang(e.target.value as Lang)}><option value="fr">Français</option><option value="ht">Kreyòl</option></select>
    </div>

    <h1>{t.title}</h1>

    {loading ? <div className="info">{t.loading}</div> : email ? <div className="account"><span>{t.connectedAs}</span><strong>{email}</strong><button onClick={()=>void logout()}>{t.logout}</button></div> : <div className="account"><span>{t.notConnected}</span><a href="/">{t.login}</a></div>}

    <div className="spaces">
      <a className="space passenger" href="/"><div className="icon">👤</div><div><strong>{t.passenger}</strong><span>{t.passengerText}</span></div><b>›</b></a>

      {(role === 'driver' || driverApproved) && <a className="space driver" href={driverHref}><div className="icon">🚕</div><div><strong>{t.driver}</strong><span>{t.driverText}</span></div><b>›</b></a>}

      {role === 'admin' && <a className="space admin" href="/admin/drivers"><div className="icon">🛡️</div><div><strong>{t.admin}</strong><span>{t.adminText}</span></div><b>›</b></a>}

      {!email && <><a className="space driver" href="/driver/login"><div className="icon">🚕</div><div><strong>{t.driver}</strong><span>{t.login}</span></div><b>›</b></a><a className="space admin" href="/admin/login"><div className="icon">🛡️</div><div><strong>{t.admin}</strong><span>{t.login}</span></div><b>›</b></a></>}
    </div>
  </section>
  <style jsx>{`
    .page{min-height:100vh;background:linear-gradient(160deg,#e4f1ed,#eef2f7 55%,#e7edf3);padding:22px;color:#102033;font-family:Inter,system-ui,sans-serif}.card{width:min(100%,720px);margin:auto;background:#fff;border-radius:28px;padding:22px;box-shadow:0 24px 70px rgba(18,36,61,.14)}.topbar{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.brand{display:flex;gap:11px;align-items:center}.brand>span{width:48px;height:48px;border-radius:15px;background:#0f6f59;color:#fff;display:grid;place-items:center;font-weight:900}.brand strong,.brand small{display:block}.brand small{color:#7a8998;margin-top:2px}.topbar select{border:1px solid #d8e1e8;border-radius:13px;background:#fff;padding:10px 12px}.card h1{font-size:34px;margin:30px 0 18px}.account{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#f4f8f7;border-radius:16px;padding:14px 16px;margin-bottom:18px}.account span{color:#748597}.account strong{flex:1}.account button,.account a{border:0;border-radius:11px;background:#fff;color:#9a3030;padding:9px 11px;font-weight:850;text-decoration:none}.spaces{display:grid;gap:14px}.space{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;text-decoration:none;color:#102033;border:1px solid #dce5eb;border-radius:20px;padding:18px;background:#fff}.space .icon{width:54px;height:54px;border-radius:16px;background:#eef5f3;display:grid;place-items:center;font-size:27px}.space strong,.space span{display:block}.space strong{font-size:20px}.space span{color:#77879a;margin-top:4px}.space b{font-size:30px;color:#8292a2}.driver{border-color:#b9ded2}.admin{border-color:#d8dce7}@media(max-width:600px){.page{padding:0}.card{min-height:100vh;border-radius:0;padding:20px 16px}.topbar{align-items:flex-start}.brand small{max-width:220px}.card h1{font-size:30px}}
  `}</style>
  </main>
}
