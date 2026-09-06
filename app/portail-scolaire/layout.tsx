import type { ReactNode } from 'react'
import SecretaryPanel from './SecretaryPanel'
import LoginRoleLabelFix from './LoginRoleLabelFix'

export default function PortailScolaireLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        body:has(.ps-page) .mobile-student-nav,
        body:has(.ps-page) .mobile-student-nav-spacer,
        body:has(.ps-page) .pwa-splash { display:none!important; }
        body:has(.ps-page){padding-bottom:0!important}
        body:has(.secretary-dashboard) .ps-page{min-height:auto!important}

        body:has(.ps-page) .topActions{
          position:fixed!important;
          right:16px!important;
          bottom:calc(env(safe-area-inset-bottom, 0px) + 18px)!important;
          margin:0!important;
          z-index:9999!important;
        }
        body:has(.ps-page) .topActions button{
          background:#fff!important;
          color:#a52a2a!important;
          border:1px solid #efcaca!important;
          border-radius:999px!important;
          padding:12px 16px!important;
          box-shadow:0 8px 24px rgba(20,33,61,.18)!important;
          font-weight:800!important;
          min-height:46px!important;
        }
      `}</style>
      {children}
      <SecretaryPanel />
      <LoginRoleLabelFix />
    </>
  )
}
