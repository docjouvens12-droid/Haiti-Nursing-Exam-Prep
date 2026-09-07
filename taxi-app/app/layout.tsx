import type { Metadata } from 'next'
import './globals.css'
import './menu.css'
import './completion.css'
import DriverCtaBridge from '../components/DriverCtaBridge'
import GlobalSpacesButton from '../components/GlobalSpacesButton'
import HaitiTestGeolocation from '../components/HaitiTestGeolocation'
import PassengerRideCompletion from '../components/PassengerRideCompletion'
import PassengerActiveDriver from '../components/PassengerActiveDriver'
import PassengerPendingRideCancel from '../components/PassengerPendingRideCancel'

export const metadata: Metadata = {
  title: 'Taxi Platform Haiti',
  description: 'Mande yon taksi rapidman an Ayiti',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body><HaitiTestGeolocation /><DriverCtaBridge /><GlobalSpacesButton /><PassengerRideCompletion /><PassengerActiveDriver /><PassengerPendingRideCancel />{children}</body>
    </html>
  )
}
