import type { Metadata } from 'next'
import './globals.css'
import './menu.css'
import './completion.css'
import './passenger-secondary.css'
import './passenger-dashboard-mobile.css'
import './passenger-menu-final.css'
import './passenger-avatar.css'
import './passenger-profile-details.css'
import './passenger-trips-page.css'
import './passenger-payment-inline.css'
import './passenger-language-switch.css'
import PassengerActiveDriver from '../components/PassengerActiveDriver'
import PassengerPendingRideCancel from '../components/PassengerPendingRideCancel'
import PassengerRideCompletion from '../components/PassengerRideCompletion'
import PassengerAvatarEnhancer from '../components/PassengerAvatarEnhancer'
import PassengerProfileDetails from '../components/PassengerProfileDetails'
import PassengerDriverApplicationMenuItem from '../components/PassengerDriverApplicationMenuItem'
import PassengerTripsEnhancer from '../components/PassengerTripsEnhancer'
import PassengerPaymentEnhancer from '../components/PassengerPaymentEnhancer'
import PassengerLanguageSwitchEnhancer from '../components/PassengerLanguageSwitchEnhancer'
import PassengerHelpDirectNavigation from '../components/PassengerHelpDirectNavigation'
import PassengerRidePaymentSync from '../components/PassengerRidePaymentSync'
import PassengerDashboardDriverStyle from '../components/PassengerDashboardDriverStyle'
import PassengerMainPaymentPolish from '../components/PassengerMainPaymentPolish'
import PassengerDashboardQuickInfo from '../components/PassengerDashboardQuickInfo'
import PassengerRestoredVersionPolish from '../components/PassengerRestoredVersionPolish'
import PassengerHomeDashboardPolish from '../components/PassengerHomeDashboardPolish'
import PassengerDashboardV2Polish from '../components/PassengerDashboardV2Polish'
import DriverAvatarUploadPolish from '../components/DriverAvatarUploadPolish'
import DriverDashboardTitleHide from '../components/DriverDashboardTitleHide'
import DriverOnlineSwitchPolish from '../components/DriverOnlineSwitchPolish'
import DriverBrandTaxiPolish from '../components/DriverBrandTaxiPolish'
import DriverCompactBrandPolish from '../components/DriverCompactBrandPolish'
import DriverLogoutPolish from '../components/DriverLogoutPolish'
import DriverAutoRequestSearch from '../components/DriverAutoRequestSearch'
import DriverRideExperiencePolish from '../components/DriverRideExperiencePolish'
import DriverCompletedRideSummary from '../components/DriverCompletedRideSummary'
import DriverHomeDashboardPolish from '../components/DriverHomeDashboardPolish'
import DriverFinalMenuStable from '../components/DriverFinalMenuStable'
import DriverApplicationSubmitButton from '../components/DriverApplicationSubmitButton'
import DriverPayoutEditPolish from '../components/DriverPayoutEditPolish'
import DriverFinalHelpTopics from '../components/DriverFinalHelpTopics'
import DriverDrawerHeaderPolish from '../components/DriverDrawerHeaderPolish'
import DriverProfileSectionPolish from '../components/DriverProfileSectionPolish'
import DriverVehicleSectionPolish from '../components/DriverVehicleSectionPolish'
import DriverPaymentsSectionPolish from '../components/DriverPaymentsSectionPolish'
import DriverHistorySectionPolish from '../components/DriverHistorySectionPolish'
import DriverEarningsSectionPolish from '../components/DriverEarningsSectionPolish'
import DriverLanguageSectionPolish from '../components/DriverLanguageSectionPolish'
import DriverAccessGate from '../components/DriverAccessGate'
import AdminDriverApplicationProfileSnapshot from '../components/AdminDriverApplicationProfileSnapshot'
import AdminDriverVehicleSnapshot from '../components/AdminDriverVehicleSnapshot'

export const metadata: Metadata = {
  title: 'Taxi Platform Haiti',
  description: 'Mande yon taksi rapidman an Ayiti',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <PassengerActiveDriver />
        <PassengerPendingRideCancel />
        <PassengerRideCompletion />
        <PassengerAvatarEnhancer />
        <PassengerProfileDetails />
        <PassengerDriverApplicationMenuItem />
        <PassengerTripsEnhancer />
        <PassengerPaymentEnhancer />
        <PassengerLanguageSwitchEnhancer />
        <PassengerHelpDirectNavigation />
        <PassengerRidePaymentSync />
        <PassengerDashboardDriverStyle />
        <PassengerMainPaymentPolish />
        <PassengerDashboardQuickInfo />
        <PassengerRestoredVersionPolish />
        <PassengerHomeDashboardPolish />
        <PassengerDashboardV2Polish />
        <DriverAccessGate />
        <DriverAvatarUploadPolish />
        <DriverDashboardTitleHide />
        <DriverOnlineSwitchPolish />
        <DriverBrandTaxiPolish />
        <DriverCompactBrandPolish />
        <DriverLogoutPolish />
        <DriverAutoRequestSearch />
        <DriverRideExperiencePolish />
        <DriverCompletedRideSummary />
        <DriverHomeDashboardPolish />
        <DriverFinalMenuStable />
        <DriverApplicationSubmitButton />
        <DriverPayoutEditPolish />
        <DriverFinalHelpTopics />
        <DriverDrawerHeaderPolish />
        <DriverProfileSectionPolish />
        <DriverVehicleSectionPolish />
        <DriverPaymentsSectionPolish />
        <DriverHistorySectionPolish />
        <DriverEarningsSectionPolish />
        <DriverLanguageSectionPolish />
        <AdminDriverApplicationProfileSnapshot />
        <AdminDriverVehicleSnapshot />
        {children}
      </body>
    </html>
  )
}
