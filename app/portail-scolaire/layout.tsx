import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import SecretaryPanel from './SecretaryPanel'
import StudentAccessMount from './StudentAccessMount'
import StudentTrimesterSummary from './StudentTrimesterSummary'
import StudentWeightedBulletin from './StudentWeightedBulletin'
import SessionJwtRecovery from './SessionJwtRecovery'
import RecordsPanel from './RecordsPanel'
import SchoolIdentitySettings from './SchoolIdentitySettings'
import DirectionStudentManager from './DirectionStudentManager'
import RoleAcademicFilters from './RoleAcademicFilters'
import GlobalAcademicYearSelector from './GlobalAcademicYearSelector'
import PortailPWARegister from './PortailPWARegister'
import LoginPersonnelSimplifier from './LoginPersonnelSimplifier'

export const metadata: Metadata = {
  title: 'Portail Scolaire Haïti',
  description: 'Portail scolaire pour la direction, les enseignants et les élèves en Haïti.',
  manifest: '/portail-scolaire/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Portail Scolaire Haïti',
  },
  icons: {
    icon: '/portail-scolaire-icon.svg',
    apple: '/portail-scolaire-icon.svg',
  },
}

export default function PortailScolaireLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        body:has(.ps-page) .mobile-student-nav,
        body:has(.ps-page) .mobile-student-nav-spacer,
        body:has(.ps-page) .pwa-splash { display:none!important; }
        body:has(.ps-page){padding-bottom:0!important}

        body:has(.ps-page) header.top{
          width:100%!important;
          overflow:hidden!important;
        }
        body:has(.ps-page) header.top > .bar{
          width:100%!important;
          max-width:1000px!important;
          min-height:44px!important;
          margin:0 auto!important;
          padding:0!important;
          display:flex!important;
          align-items:center!important;
          gap:11px!important;
          background:transparent!important;
          border:0!important;
          border-radius:0!important;
          box-shadow:none!important;
          overflow:visible!important;
        }
        body:has(.ps-page) header.top > .bar > .logo{
          width:44px!important;
          min-width:44px!important;
          height:44px!important;
          flex:0 0 44px!important;
          border-radius:13px!important;
          background:#fff!important;
          color:#0f4c81!important;
          display:grid!important;
          place-items:center!important;
          overflow:hidden!important;
          white-space:nowrap!important;
        }
        body:has(.ps-page) header.top > .bar > .brand{
          flex:1 1 auto!important;
          min-width:0!important;
          width:auto!important;
          height:auto!important;
          padding:0!important;
          margin:0!important;
          background:transparent!important;
          border:0!important;
          border-radius:0!important;
          box-shadow:none!important;
          color:#fff!important;
          font-weight:800!important;
          line-height:1.2!important;
          white-space:normal!important;
          overflow:visible!important;
        }
        body:has(.ps-page) .topActions{
          position:static!important;
          margin-left:auto!important;
          z-index:auto!important;
          flex:0 0 auto!important;
        }
        body:has(.ps-page) .topActions button{
          background:transparent!important;
          color:#fff!important;
          border:1px solid rgba(255,255,255,.55)!important;
          border-radius:10px!important;
          padding:8px 10px!important;
          box-shadow:none!important;
          font-weight:800!important;
          min-height:40px!important;
          pointer-events:auto!important;
        }
        @media(max-width:720px){
          body:has(.ps-page) .nativeLangMenu{
            margin-top:calc(env(safe-area-inset-top, 0px) + 18px)!important;
            margin-bottom:14px!important;
          }
          body:has(.ps-page) header.top{padding:14px 16px!important}
          body:has(.ps-page) header.top > .bar > .brand{font-size:16px!important}
          body:has(.ps-page) .topActions button{font-size:12px!important;padding:7px 9px!important;min-height:38px!important}
        }

        body:has(.secretary-dashboard) .ps-page{
          min-height:auto!important;
          pointer-events:none!important;
        }
        body:has(.secretary-dashboard) .secretary-dashboard{
          position:relative!important;
          z-index:10000!important;
          pointer-events:auto!important;
          touch-action:manipulation;
        }
        body:has(.secretary-dashboard) .secretary-dashboard button,
        body:has(.secretary-dashboard) .secretary-dashboard input,
        body:has(.secretary-dashboard) .secretary-dashboard select,
        body:has(.secretary-dashboard) .secretary-dashboard form,
        body:has(.secretary-dashboard) .secretary-dashboard .teacherCard{
          pointer-events:auto!important;
          touch-action:manipulation;
        }
        body:has(.secretary-dashboard) .secretary-dashboard .teacherCard{cursor:pointer}
        body:has(.secretary-dashboard) .ps-page .topActions,
        body:has(.secretary-dashboard) .ps-page [data-global-academic-year-mount="true"],
        body:has(.secretary-dashboard) .ps-page [data-global-academic-year="true"],
        body:has(.secretary-dashboard) .ps-page [data-global-academic-year="true"] select{
          pointer-events:auto!important;
          position:relative!important;
          z-index:10001!important;
        }

        body:has(.ps-page) .native-student-access-mount{display:none!important}
        body:has(.ps-page select[name="teacher_id"]) .native-student-access-mount{display:block!important}
      `}</style>
      <PortailPWARegister />
      <LoginPersonnelSimplifier />
      {children}
      <GlobalAcademicYearSelector />
      <SecretaryPanel />
      <StudentAccessMount />
      <StudentTrimesterSummary />
      <StudentWeightedBulletin />
      <RecordsPanel />
      <SchoolIdentitySettings />
      <DirectionStudentManager />
      <RoleAcademicFilters />
      <SessionJwtRecovery />
    </>
  )
}
