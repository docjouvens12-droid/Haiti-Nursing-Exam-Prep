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
  const isPassengerPage = pathname === '/' || pathname === '/passenger/dashboard'
  const [ride, setRide] = useState<PendingRide | null>(null)
  const [busy, setBusy] = useState(false)
  const [lang, setLang] = useState<'fr' | 'ht'>('fr')

  useEffect(() => {
    if (!isPassengerPage) return
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
  }, [isPassengerPage])

  async function cancelRide() {
    if (!ride || busy) return
    const ok = window.confirm(lang === 'ht' ? 'Ou vle anile kous sa a?' : 'Voulez-vous annuler cette course ?')
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

  if (!isPassengerPage || !ride) return null

  return <aside className="pending-ride-card" aria-live="polite">
    <div className="pending-copy">
      <strong>{lang === 'ht' ? 'N ap chèche yon chofè pou ou…' : 'Nous cherchons un chauffeur pour vous…'}</strong>
      <small>{ride.destination_address}</small>
    </div>
    <button className="cancel-button" onClick={() => void cancelRide()} disabled={busy}>
      {busy ? (lang === 'ht' ? 'N ap anile…' : 'Annulation…') : (lang === 'ht' ? 'Anile kous la' : 'Annuler la course')}
    </button>
    <style jsx>{`
      .pending-ride-card{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147483000;width:min(calc(100vw - 24px),720px);display:grid;gap:11px;background:#fff;border:1px solid #e4d5d2;border-radius:20px;padding:14px;box-shadow:0 18px 50px rgba(16,32,51,.26);font-family:Inter,system-ui,sans-serif;color:#102033}.pending-copy{min-width:0}.pending-copy strong,.pending-copy small{display:block}.pending-copy strong{font-size:15px}.pending-copy small{margin-top:4px;color:#71808e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cancel-button{width:100%;min-height:52px;border:0;border-radius:14px;background:#b42318;color:#fff;font-weight:900;font-size:16px;padding:13px 16px;cursor:pointer;touch-action:manipulation}.cancel-button:disabled{opacity:.6}@media(max-width:520px){.pending-ride-card{bottom:12px;width:calc(100vw - 20px);padding:12px}.pending-copy strong{font-size:14px}.cancel-button{min-height:54px;font-size:16px}}
    `}</style>
  </aside>
}
