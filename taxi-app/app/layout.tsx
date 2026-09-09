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
import PassengerTripsEnhancer from '../components/PassengerTripsEnhancer'
import PassengerPaymentEnhancer from '../components/PassengerPaymentEnhancer'
import PassengerLanguageSwitchEnhancer from '../components/PassengerLanguageSwitchEnhancer'
import PassengerHelpDirectNavigation from '../components/PassengerHelpDirectNavigation'
import PassengerRidePaymentSync from '../components/PassengerRidePaymentSync'
import PassengerDashboardDriverStyle from '../components/PassengerDashboardDriverStyle'
import PassengerMainPaymentPolish from '../components/PassengerMainPaymentPolish'
import PassengerDashboardQuickInfo from '../components/PassengerDashboardQuickInfo'
import PassengerRestoredVersionPolish from '../components/PassengerRestoredVersionPolish'
import PassengerSamePageLoginFix from '../components/PassengerSamePageLoginFix'
import DriverMenuAccordionPolish from '../components/DriverMenuAccordionPolish'
import DriverAvatarUploadPolish from '../components/DriverAvatarUploadPolish'
import DriverVehicleMenuPolish from '../components/DriverVehicleMenuPolish'
import DriverLanguageSwitchPolish from '../components/DriverLanguageSwitchPolish'
import DriverDashboardTitleHide from '../components/DriverDashboardTitleHide'
import DriverOnlineSwitchPolish from '../components/DriverOnlineSwitchPolish'
import DriverBrandTaxiPolish from '../components/DriverBrandTaxiPolish'
import DriverCompactBrandPolish from '../components/DriverCompactBrandPolish'
import DriverEarningsMenuPolish from '../components/DriverEarningsMenuPolish'
import DriverNetEarningsPolish from '../components/DriverNetEarningsPolish'
import DriverRideHistoryMenuPolish from '../components/DriverRideHistoryMenuPolish'
import DriverMenuVisualConsistency from '../components/DriverMenuVisualConsistency'
import DriverLogoutPolish from '../components/DriverLogoutPolish'
import DriverAutoRequestSearch from '../components/DriverAutoRequestSearch'
import DriverRideExperiencePolish from '../components/DriverRideExperiencePolish'
import DriverCompletedRideSummary from '../components/DriverCompletedRideSummary'
import DriverPaymentMethodPolish from '../components/DriverPaymentMethodPolish'
import DriverPaymentMenuPolish from '../components/DriverPaymentMenuPolish'

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
        <PassengerTripsEnhancer />
        <PassengerPaymentEnhancer />
        <PassengerLanguageSwitchEnhancer />
        <PassengerHelpDirectNavigation />
        <PassengerRidePaymentSync />
        <PassengerDashboardDriverStyle />
        <PassengerMainPaymentPolish />
        <PassengerDashboardQuickInfo />
        <PassengerRestoredVersionPolish />
        <PassengerSamePageLoginFix />
        <DriverMenuAccordionPolish />
        <DriverAvatarUploadPolish />
        <DriverVehicleMenuPolish />
        <DriverLanguageSwitchPolish />
        <DriverDashboardTitleHide />
        <DriverOnlineSwitchPolish />
        <DriverBrandTaxiPolish />
        <DriverCompactBrandPolish />
        <DriverEarningsMenuPolish />
        <DriverNetEarningsPolish />
        <DriverRideHistoryMenuPolish />
        <DriverMenuVisualConsistency />
        <DriverLogoutPolish />
        <DriverAutoRequestSearch />
        <DriverRideExperiencePolish />
        <DriverCompletedRideSummary />
        <DriverPaymentMethodPolish />
        <DriverPaymentMenuPolish />
        {children}
      </body>
    </html>
  )
}
