import type { Metadata } from 'next'
import './globals.css'
import './menu.css'
import './completion.css'
import './passenger-secondary.css'
import DriverCtaBridge from '../components/DriverCtaBridge'
import GlobalSpacesButton from '../components/GlobalSpacesButton'
import GlobalLogoutButton from '../components/GlobalLogoutButton'
import HaitiTestGeolocation from '../components/HaitiTestGeolocation'
import PassengerRideCompletion from '../components/PassengerRideCompletion'
import PassengerActiveDriver from '../components/PassengerActiveDriver'
import PassengerPendingRideCancel from '../components/PassengerPendingRideCancel'
import RideRealtimeNotifications from '../components/RideRealtimeNotifications'
import PassengerHomePolish from '../components/PassengerHomePolish'
import PassengerBookingFlowPolish from '../components/PassengerBookingFlowPolish'
import PassengerMobilePaymentPolish from '../components/PassengerMobilePaymentPolish'
import PassengerMenuPolish from '../components/PassengerMenuPolish'
import PassengerMenuCompactPolish from '../components/PassengerMenuCompactPolish'
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
import AuthRoleRedirector from '../components/AuthRoleRedirector'
import PasswordVisibilityToggle from '../components/PasswordVisibilityToggle'
import LoginTitlePolish from '../components/LoginTitlePolish'

export const metadata: Metadata = {
  title: 'Taxi Platform Haiti',
  description: 'Mande yon taksi rapidman an Ayiti',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body><PasswordVisibilityToggle /><LoginTitlePolish /><AuthRoleRedirector /><HaitiTestGeolocation /><DriverCtaBridge /><GlobalSpacesButton /><GlobalLogoutButton /><PassengerRideCompletion /><PassengerActiveDriver /><PassengerPendingRideCancel /><RideRealtimeNotifications /><PassengerHomePolish /><PassengerBookingFlowPolish /><PassengerMobilePaymentPolish /><PassengerMenuPolish /><PassengerMenuCompactPolish /><DriverMenuAccordionPolish /><DriverAvatarUploadPolish /><DriverVehicleMenuPolish /><DriverLanguageSwitchPolish /><DriverDashboardTitleHide /><DriverOnlineSwitchPolish /><DriverBrandTaxiPolish /><DriverCompactBrandPolish /><DriverEarningsMenuPolish /><DriverNetEarningsPolish /><DriverRideHistoryMenuPolish /><DriverMenuVisualConsistency /><DriverLogoutPolish /><DriverAutoRequestSearch /><DriverRideExperiencePolish /><DriverCompletedRideSummary /><DriverPaymentMethodPolish /><DriverPaymentMenuPolish />{children}</body>
    </html>
  )
}
