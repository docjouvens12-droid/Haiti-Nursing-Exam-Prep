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
        {children}
      </body>
    </html>
  )
}
