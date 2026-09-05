import type { ReactNode } from 'react'

export default function PortailScolaireLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        body:has(.ps-page) .mobile-student-nav,
        body:has(.ps-page) .mobile-student-nav-spacer,
        body:has(.ps-page) .pwa-splash {
          display: none !important;
        }
        body:has(.ps-page) {
          padding-bottom: 0 !important;
        }
      `}</style>
      {children}
    </>
  )
}
