import type { ReactNode } from 'react'
import SecretaryPanel from './SecretaryPanel'
import LoginRoleLabelFix from './LoginRoleLabelFix'
import SecretaryClassNavigator from './SecretaryClassNavigator'
import StudentAccessPanel from './StudentAccessPanel'
import TeacherAccessPanel from './TeacherAccessPanel'
import StudentTrimesterSummary from './StudentTrimesterSummary'
import TeacherAssessmentSelector from './TeacherAssessmentSelector'
import DirectionPublishSelector from './DirectionPublishSelector'
import SessionJwtRecovery from './SessionJwtRecovery'
import RecordsPanel from './RecordsPanel'
import AcademicYearEditor from './AcademicYearEditor'
import InlineAcademicYearEdit from './InlineAcademicYearEdit'
import OfficialRecordPrintEnhancer from './OfficialRecordPrintEnhancer'
import RecordValidationFields from './RecordValidationFields'
import SchoolIdentitySettings from './SchoolIdentitySettings'
import SchoolRecordBranding from './SchoolRecordBranding'
import AllSectionsSelectorFix from './AllSectionsSelectorFix'
import LanguageMenuSelector from './LanguageMenuSelector'
import SubjectCoefficientEditor from './SubjectCoefficientEditor'

export default function PortailScolaireLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        body:has(.ps-page) .mobile-student-nav,
        body:has(.ps-page) .mobile-student-nav-spacer,
        body:has(.ps-page) .pwa-splash { display:none!important; }
        body:has(.ps-page){padding-bottom:0!important}
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
        body:has(.secretary-dashboard) .secretary-dashboard .teacherCard{
          cursor:pointer;
        }
        body:has(.secretary-dashboard) .ps-page .topActions{
          pointer-events:auto!important;
        }

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
      <SecretaryClassNavigator />
      <StudentAccessPanel />
      <TeacherAccessPanel />
      <StudentTrimesterSummary />
      <RecordsPanel />
      <AcademicYearEditor />
      <InlineAcademicYearEdit />
      <TeacherAssessmentSelector />
      <DirectionPublishSelector />
      <SchoolIdentitySettings />
      <SchoolRecordBranding />
      <AllSectionsSelectorFix />
      <LanguageMenuSelector />
      <SubjectCoefficientEditor />
      <OfficialRecordPrintEnhancer />
      <RecordValidationFields />
      <LoginRoleLabelFix />
      <SessionJwtRecovery />
    </>
  )
}
