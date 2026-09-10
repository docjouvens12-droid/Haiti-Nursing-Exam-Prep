'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

type PermissionRow = {
  is_admin: boolean
  is_super_admin: boolean
  can_manage_admins: boolean
  can_manage_drivers: boolean
  can_view_payments: boolean
  can_manage_payouts: boolean
  can_reconcile: boolean
  can_manage_safety: boolean
  can_view_system: boolean
}

function allowed(pathname: string, p: PermissionRow) {
  if (p.is_super_admin) return true
  if (pathname === '/admin' || pathname === '/admin/login') return true
  if (pathname.startsWith('/admin/admins')) return p.can_manage_admins
  if (pathname.startsWith('/admin/drivers')) return p.can_manage_drivers
  if (pathname.startsWith('/admin/payments')) return p.can_view_payments
  if (pathname.startsWith('/admin/payouts')) return p.can_manage_payouts
  if (pathname.startsWith('/admin/reconciliation')) return p.can_reconcile
  if (pathname.startsWith('/admin/safety')) return p.can_manage_safety
  if (pathname.startsWith('/admin/system-check')) return p.can_view_system
  return false
}

export default function AdminPermissionGuard() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname.startsWith('/admin') || pathname === '/admin/login') return
    let cancelled = false

    async function check() {
      const { data: auth } = await supabase.auth.getUser()
      if (cancelled || !auth.user) return
      const { data, error } = await supabase.rpc('get_my_admin_permissions')
      if (cancelled || error) return
      const row = (Array.isArray(data) ? data[0] : data) as PermissionRow | undefined
      if (!row?.is_admin) return
      if (!allowed(pathname, row)) window.location.replace('/admin?restricted=1')
    }

    void check()
    return () => { cancelled = true }
  }, [pathname])

  return null
}
