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
import DriverDashboardTitleCleanup from '../components/DriverDashboardTitleCleanup'
import DriverMenuPersonalInfoCleanup from '../components/DriverMenuPersonalInfoCleanup'
import PassengerHomePolish from '../components/PassengerHomePolish'
import PassengerMenuPolish from '../components/PassengerMenuPolish'
import AuthRoleRedirector from '../components/AuthRoleRedirector'
import PasswordVisibilityToggle from '../components/PasswordVisibilityToggle'
import LoginCopyNeutralizer from '../components/LoginCopyNeutralizer'

export const metadata: Metadata = {
  title: 'Taxi Platform Haiti',
  description: 'Mande yon taksi rapidman an Ayiti',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body><PasswordVisibilityToggle /><LoginCopyNeutralizer /><AuthRoleRedirector /><HaitiTestGeolocation /><DriverCtaBridge /><GlobalSpacesButton /><GlobalLogoutButton /><PassengerRideCompletion /><PassengerActiveDriver /><PassengerPendingRideCancel /><RideRealtimeNotifications /><DriverDashboardTitleCleanup /><DriverMenuPersonalInfoCleanup /><PassengerHomePolish /><PassengerMenuPolish />{children}</body>
    </html>
  )
}
