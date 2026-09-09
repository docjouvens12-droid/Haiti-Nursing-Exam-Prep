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
import PassengerActiveDriver from '../components/PassengerActiveDriver'
import PassengerPendingRideCancel from '../components/PassengerPendingRideCancel'
import PassengerRideCompletion from '../components/PassengerRideCompletion'
import PassengerAvatarEnhancer from '../components/PassengerAvatarEnhancer'
import PassengerProfileDetails from '../components/PassengerProfileDetails'
import PassengerTripsEnhancer from '../components/PassengerTripsEnhancer'

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
        {children}
      </body>
    </html>
  )
}
