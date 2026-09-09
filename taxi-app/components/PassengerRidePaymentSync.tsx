'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Method = 'moncash' | 'natcash'

export default function PassengerRidePaymentSync() {
  useEffect(() => {
    if (window.location.pathname !== '/passenger/dashboard') return

    let timers: number[] = []

    async function syncPayment() {
      const method = window.localStorage.getItem('taxi-payment-method') as Method | null
      if (method !== 'moncash' && method !== 'natcash') return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const metadata = user.user_metadata || {}
      const name = method === 'moncash' ? String(metadata.moncash_name || '') : String(metadata.natcash_name || '')
      const phone = method === 'moncash' ? String(metadata.moncash_phone || '') : String(metadata.natcash_phone || '')
      if (!name.trim() || !phone.trim()) return

      await supabase.rpc('attach_latest_ride_payment', {
        p_payment_method: method,
        p_account_name: name.trim(),
        p_account_phone: phone.trim(),
      })
    }

    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const button = target?.closest<HTMLButtonElement>('button')
      if (!button) return
      const text = (button.textContent || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
      if (!(text === 'commander' || text === 'mande' || text.includes('commander'))) return

      timers.forEach((id) => window.clearTimeout(id))
      timers = [
        window.setTimeout(() => void syncPayment(), 900),
        window.setTimeout(() => void syncPayment(), 2200),
        window.setTimeout(() => void syncPayment(), 4500),
      ]
    }

    document.addEventListener('click', handler, true)
    return () => {
      document.removeEventListener('click', handler, true)
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  return null
}
