'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

type Section = 'profile' | 'vehicle' | 'payments' | 'history' | 'earnings' | 'language' | 'help'
type Lang = 'fr' | 'ht'
type MenuData = {
  email?: string
  profile?: { full_name?: string|null; phone?: string|null } | null
  driver?: { license_number?: string|null; national_id_number?: string|null; preferred_payout_provider?: string|null; moncash_name?: string|null; moncash_phone?: string|null; natcash_name?: string|null; natcash_phone?: string|null } | null
  vehicle?: { vehicle_type?: string|null; make?: string|null; model?: string|null; color?: string|null; year?: number|null; plate_number?: string|null; seats?: number|null } | null
  rides?: Array<{ id:string; pickup_address?:string|null; destination_address?:string|null; final_fare_htg?:number|null; completed_at?:string|null }>
  earnings?: { gross:number; fee:number; net:number }
}

function parseSession(raw: string | null) {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    const session = parsed?.currentSession ?? parsed?.session ?? parsed
    return session?.access_token ? session : null
  } catch { return null }
}

function getToken() {
  if (typeof window === 'undefined') return null
  const preferred = parseSession(localStorage.getItem('movi-session')) || parseSession(localStorage.getItem('taxi-auth-default'))
  if (preferred?.access_token) return preferred.access_token as string
  for (let i=0;i<localStorage.length;i+=1) {
    const key = localStorage.key(i)
    if (!key) continue
    const session = parseSession(localStorage.getItem(key))
    if (session?.access_token) return session.access_token as string
  }
  return null
}

export default function DriverCleanMenu() {
  const [open, setOpen] = useState(false)
  const [section, setSection] = useState<Section | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<MenuData | null>(null)
  const [lang, setLang] = useState<Lang>('fr')
  const ht = lang === 'ht'

  useEffect(() => {
    if (location.pathname !== '/driver/dashboard-v2') return
    setLang(localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr')
    const handler = (event: MouseEvent) => {
      const target = event.target as Element | null
      if (!target?.closest('.menu')) return
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      setOpen(true)
      setSection(null)
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])

  useEffect(() => {
    if (!open || data || loading) return
    void load()
  }, [open, data, loading])

  async function load() {
    const token = getToken()
    if (!token) { setError(ht ? 'Sesyon an pa disponib.' : 'Session indisponible.'); return }
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/driver/menu', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || `Erreur ${response.status}`)
      setData(payload)
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }

  const name = data?.profile?.full_name?.trim() || 'Chauffeur'
  const initial = name.slice(0,1).toUpperCase()
  const rides = data?.rides ?? []
  const earnings = data?.earnings ?? { gross:0, fee:0, net:0 }
  const payout = data?.driver?.preferred_payout_provider
  const labels = useMemo(() => ht ? {
    profile:'Pwofil', vehicle:'Veyikil', payments:'Peman', history:'Istwa trajè', earnings:'Revni', language:'Lang', help:'Èd', logout:'Dekonekte'
  } : {
    profile:'Profil', vehicle:'Véhicule', payments:'Paiements', history:'Historique', earnings:'Revenus', language:'Langue', help:'Aide', logout:'Se déconnecter'
  }, [ht])

  function chooseLanguage(next: Lang) {
    localStorage.setItem('taxi-language', next)
    setLang(next)
  }

  async function logout() {
    try { localStorage.removeItem('movi-session'); localStorage.removeItem('taxi-auth-default') } catch {}
    window.location.replace('/movi-app-v2')
  }

  if (!open || typeof document === 'undefined') return null

  const Row = ({id,icon,label}:{id:Section;icon:string;label:string}) => (
    <button className="dcm-row" onClick={() => setSection(section === id ? null : id)}>
      <span className="dcm-icon">{icon}</span><b>{label}</b><span className="dcm-arrow">{section === id ? '⌃' : '›'}</span>
    </button>
  )

  return createPortal(<div className="dcm-overlay" onClick={() => setOpen(false)}>
    <aside className="dcm-drawer" onClick={e => e.stopPropagation()}>
      <button className="dcm-close" onClick={() => setOpen(false)}>×</button>
      <div className="dcm-head">
        <div className="dcm-avatar">{initial}</div>
        <div><h2>{name}</h2><small>{data?.email || ''}</small></div>
      </div>
      {loading && <div className="dcm-note">{ht?'Chajman...':'Chargement...'}</div>}
      {error && <div className="dcm-error">{error}</div>}

      <div className="dcm-list">
        <Row id="profile" icon="👤" label={labels.profile}/>
        {section==='profile' && <div className="dcm-panel">
          <p><span>{ht?'Non':'Nom'}</span><b>{name}</b></p>
          <p><span>E-mail</span><b>{data?.email || '—'}</b></p>
          <p><span>{ht?'Telefòn':'Téléphone'}</span><b>{data?.profile?.phone || '—'}</b></p>
          <p><span>{ht?'Lisans':'Permis'}</span><b>{data?.driver?.license_number || '—'}</b></p>
          <p><span>ID</span><b>{data?.driver?.national_id_number || '—'}</b></p>
        </div>}

        <Row id="vehicle" icon="🚙" label={labels.vehicle}/>
        {section==='vehicle' && <div className="dcm-panel">
          <p><span>{ht?'Mak / Modèl':'Marque / Modèle'}</span><b>{data?.vehicle ? `${data.vehicle.make||''} ${data.vehicle.model||''}`.trim() : '—'}</b></p>
          <p><span>{ht?'Plak':'Plaque'}</span><b>{data?.vehicle?.plate_number || '—'}</b></p>
          <p><span>{ht?'Koulè':'Couleur'}</span><b>{data?.vehicle?.color || '—'}</b></p>
          <p><span>{ht?'Ane':'Année'}</span><b>{data?.vehicle?.year || '—'}</b></p>
          <p><span>{ht?'Plas':'Places'}</span><b>{data?.vehicle?.seats || '—'}</b></p>
        </div>}

        <Row id="payments" icon="💳" label={labels.payments}/>
        {section==='payments' && <div className="dcm-panel">
          <p><span>{ht?'Metòd resevwa':'Mode de versement'}</span><b>{payout ? payout.toUpperCase() : '—'}</b></p>
          {payout==='moncash' && <><p><span>MonCash</span><b>{data?.driver?.moncash_name || '—'}</b></p><p><span>{ht?'Telefòn':'Téléphone'}</span><b>{data?.driver?.moncash_phone || '—'}</b></p></>}
          {payout==='natcash' && <><p><span>NatCash</span><b>{data?.driver?.natcash_name || '—'}</b></p><p><span>{ht?'Telefòn':'Téléphone'}</span><b>{data?.driver?.natcash_phone || '—'}</b></p></>}
        </div>}

        <Row id="history" icon="🧾" label={labels.history}/>
        {section==='history' && <div className="dcm-panel dcm-trips">
          {rides.length===0 ? <div className="dcm-note">{ht?'Pa gen trajè fini pou montre.':'Aucun trajet terminé à afficher.'}</div> : rides.map(r => <div className="dcm-trip" key={r.id}><b>{r.destination_address || 'Destination'}</b><span>{r.pickup_address || '—'}</span><small>{Number(r.final_fare_htg||0).toLocaleString()} HTG</small></div>)}
        </div>}

        <Row id="earnings" icon="💰" label={labels.earnings}/>
        {section==='earnings' && <div className="dcm-panel">
          <p><span>{ht?'Brit':'Brut'}</span><b>{earnings.gross.toLocaleString()} HTG</b></p>
          <p><span>{ht?'Komisyon platfòm':'Commission plateforme'}</span><b>{earnings.fee.toLocaleString()} HTG</b></p>
          <p><span>Net</span><b>{earnings.net.toLocaleString()} HTG</b></p>
          <small className="dcm-muted">{ht?'Sou 10 dènye trajè fini yo.':'Sur les 10 derniers trajets terminés.'}</small>
        </div>}

        <Row id="language" icon="🌐" label={labels.language}/>
        {section==='language' && <div className="dcm-panel"><div className="dcm-lang"><button className={lang==='fr'?'active':''} onClick={()=>chooseLanguage('fr')}>🇫🇷 Français</button><button className={lang==='ht'?'active':''} onClick={()=>chooseLanguage('ht')}>🇭🇹 Kreyòl</button></div></div>}

        <Row id="help" icon="❓" label={labels.help}/>
        {section==='help' && <div className="dcm-panel"><div className="dcm-note">{ht?'Pou yon pwoblèm ak yon trajè, peman, oswa kont chofè a, sèvi ak seksyon sa a pou jwenn asistans MOVI.':'Pour un problème de trajet, paiement ou compte chauffeur, utilisez cette section pour obtenir de l’aide MOVI.'}</div></div>}
      </div>

      <button className="dcm-logout" onClick={logout}>↪ {labels.logout}</button>
    </aside>
    <style jsx global>{`
      .dcm-overlay{position:fixed;inset:0;z-index:2147481000;background:rgba(17,45,39,.48);backdrop-filter:blur(5px)}
      .dcm-drawer{position:absolute;left:0;top:0;bottom:0;width:min(86vw,390px);overflow-y:auto;background:#fff;padding:28px 24px 38px;box-shadow:14px 0 50px rgba(0,0,0,.16);font-family:Inter,system-ui,-apple-system,sans-serif;color:#10253a}
      .dcm-close{position:absolute;right:22px;top:24px;width:46px;height:46px;border:0;border-radius:15px;background:#edf5f2;color:#14604f;font-size:30px;line-height:1}
      .dcm-head{display:flex;align-items:center;gap:16px;padding:82px 0 24px;border-bottom:1px solid #e3ece8}
      .dcm-avatar{width:72px;height:72px;border-radius:22px;background:#0f8065;color:#fff;display:grid;place-items:center;font-size:30px;font-weight:900}
      .dcm-head h2{margin:0;font-size:25px}.dcm-head small{display:block;color:#788781;margin-top:4px;max-width:220px;overflow:hidden;text-overflow:ellipsis}
      .dcm-list{margin-top:12px}.dcm-row{width:100%;display:grid;grid-template-columns:44px 1fr 24px;align-items:center;gap:10px;border:0;border-bottom:1px solid #edf2ef;background:#fff;padding:13px 0;text-align:left;color:#19372f;font-size:16px}.dcm-icon{width:40px;height:40px;border-radius:13px;background:#f1f6f4;display:grid;place-items:center;font-size:20px}.dcm-arrow{text-align:right;color:#8da09a;font-size:23px}.dcm-panel{padding:12px 6px 16px;border-bottom:1px solid #e7efec;background:#fbfdfc}.dcm-panel p{display:flex;justify-content:space-between;gap:16px;margin:9px 0;font-size:12px}.dcm-panel p span{color:#7b8a85}.dcm-panel p b{text-align:right;color:#17362e}.dcm-note,.dcm-error{margin:12px 0;padding:11px 12px;border-radius:12px;background:#eef7f3;color:#245c4d;font-size:12px;font-weight:700;line-height:1.45}.dcm-error{background:#fff2f2;color:#9e3f3f}.dcm-trips{display:grid;gap:8px}.dcm-trip{display:grid;gap:3px;padding:10px;border:1px solid #e0eae6;border-radius:12px;background:#fff}.dcm-trip b{font-size:12px}.dcm-trip span,.dcm-trip small{font-size:11px;color:#778781}.dcm-trip small{color:#0f8065;font-weight:800}.dcm-muted{display:block;color:#87948f;margin-top:8px}.dcm-lang{display:grid;grid-template-columns:1fr 1fr;gap:8px}.dcm-lang button{border:1px solid #d9e6e1;border-radius:12px;background:#fff;padding:10px;font-weight:800;color:#405b53}.dcm-lang button.active{border-color:#0f8065;background:#eaf7f2;color:#0f8065}.dcm-logout{width:100%;margin-top:22px;border:1px solid #efcaca;background:#fff7f7;color:#ae3939;border-radius:14px;padding:14px;font-size:15px;font-weight:900}
    `}</style>
  </div>, document.body)
}
