'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

type PendingRide = {
  id: string
  pickup_address: string
  destination_address: string
  requested_at: string
}

export default function PassengerPendingRideCancel() {
  const pathname = usePathname()
  const [ride, setRide] = useState<PendingRide | null>(null)
  const [busy, setBusy] = useState(false)
  const [lang, setLang] = useState<'fr' | 'ht'>('fr')

  useEffect(() => {
    if (pathname !== '/') return
    const saved = window.localStorage.getItem('taxi-language')
    if (saved === 'fr' || saved === 'ht') setLang(saved)

    let active = true
    async function load() {
      const { data: auth } = await supabase.auth.getUser()
      if (!active || !auth.user) { setRide(null); return }
      const { data } = await supabase
        .from('rides')
        .select('id,pickup_address,destination_address,requested_at')
        .eq('passenger_id', auth.user.id)
        .eq('status', 'requested')
        .order('requested_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (active) setRide((data ?? null) as PendingRide | null)
    }

    void load()
    const timer = window.setInterval(() => void load(), 3000)
    return () => { active = false; window.clearInterval(timer) }
  }, [pathname])

  async function cancelRide() {
    if (!ride || busy) return
    const ok = window.confirm(lang === 'ht' ? 'Ou vle anile demann trajè sa a?' : 'Voulez-vous annuler cette demande de trajet ?')
    if (!ok) return
    setBusy(true)
    const reason = lang === 'ht' ? 'Anile pa pasaje a' : 'Annulé par le passager'
    const { error } = await supabase.rpc('cancel_ride', { p_ride_id: ride.id, p_reason: reason })
    setBusy(false)
    if (error) {
      window.alert(error.message)
      return
    }
    setRide(null)
    window.dispatchEvent(new Event('taxi-ride-cancelled'))
  }

  if (pathname !== '/' || !ride) return null

  return <aside className="pending-ride-card" aria-live="polite">
    <div className="pending-copy">
      <strong>{lang === 'ht' ? 'N ap chèche yon chofè…' : 'Recherche d’un chauffeur…'}</strong>
      <small>{ride.destination_address}</small>
    </div>
    <button onClick={() => void cancelRide()} disabled={busy}>
      {busy ? (lang === 'ht' ? 'N ap anile…' : 'Annulation…') : (lang === 'ht' ? 'Anile trajè' : 'Annuler le trajet')}
    </button>
    <style jsx>{`
      .pending-ride-card{position:fixed;left:50%;bottom:86px;transform:translateX(-50%);z-index:900;width:min(calc(100vw - 28px),720px);display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #dce7e3;border-radius:18px;padding:12px 13px;box-shadow:0 16px 45px rgba(16,32,51,.2);font-family:Inter,system-ui,sans-serif;color:#102033}.pending-copy{min-width:0;flex:1}.pending-copy strong,.pending-copy small{display:block}.pending-copy strong{font-size:14px}.pending-copy small{margin-top:3px;color:#71808e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pending-ride-card button{border:0;border-radius:13px;background:#fff0ee;color:#9f2e2e;font-weight:850;padding:10px 12px;white-space:nowrap}.pending-ride-card button:disabled{opacity:.6}@media(max-width:520px){.pending-ride-card{bottom:82px}.pending-copy strong{font-size:13px}.pending-ride-card button{font-size:12px;padding:9px 10px}}
    `}</style>
  </aside>
}
