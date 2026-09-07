'use client'

import { usePathname } from 'next/navigation'

export default function GlobalSpacesButton() {
  const pathname = usePathname()
  if (pathname === '/spaces') return null

  return (
    <a
      href="/spaces"
      aria-label="Choisir un espace"
      style={{
        position: 'fixed',
        right: 14,
        bottom: 'calc(18px + env(safe-area-inset-bottom))',
        zIndex: 9999,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '11px 14px',
        borderRadius: 999,
        background: '#102033',
        color: '#fff',
        textDecoration: 'none',
        fontWeight: 850,
        boxShadow: '0 10px 28px rgba(16,32,51,.25)',
        border: '1px solid rgba(255,255,255,.18)',
      }}
    >
      <span aria-hidden="true">⇄</span>
      <span>Espaces</span>
    </a>
  )
}
