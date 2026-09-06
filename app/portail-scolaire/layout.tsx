import type { ReactNode } from 'react'
import SecretaryPanel from './SecretaryPanel'
import StudentAccessMount from './StudentAccessMount'
import StudentTrimesterSummary from './StudentTrimesterSummary'
import StudentWeightedBulletin from './StudentWeightedBulletin'
import SessionJwtRecovery from './SessionJwtRecovery'
import RecordsPanel from './RecordsPanel'
import AcademicYearEditor from './AcademicYearEditor'
import SchoolIdentitySettings from './SchoolIdentitySettings'
import SubjectCoefficientEditor from './SubjectCoefficientEditor'

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
        @media(max-width:720px){
          body:has(.ps-page) header.top{padding:14px 16px!important}
          body:has(.ps-page) header.top > .bar > .brand{font-size:17px!important}
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
        body:has(.secretary-dashboard) .ps-page .topActions{pointer-events:auto!important}

        body:has(.ps-page) .native-student-access-mount{display:none!important}
        body:has(.ps-page select[name="teacher_id"]) .native-student-access-mount{display:block!important}

        body:has(.ps-page) .topActions{
          position:fixed!important;
          right:16px!important;
          bottom:calc(env(safe-area-inset-bottom, 0px) + 18px)!important;
          margin:0!important;
          z-index:99999!important;
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
          pointer-events:auto!important;
        }
      `}</style>
      {children}
      <SecretaryPanel />
      <StudentAccessMount />
      <StudentTrimesterSummary />
      <StudentWeightedBulletin />
      <RecordsPanel />
      <AcademicYearEditor />
      <SchoolIdentitySettings />
      <SubjectCoefficientEditor />
      <SessionJwtRecovery />
    </>
  )
}
