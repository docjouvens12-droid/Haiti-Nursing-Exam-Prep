import type { Metadata } from 'next'
import './globals.css'
import './menu.css'
import DriverCtaBridge from '../components/DriverCtaBridge'
import GlobalSpacesButton from '../components/GlobalSpacesButton'
import HaitiTestGeolocation from '../components/HaitiTestGeolocation'
import PassengerRideCompletion from '../components/PassengerRideCompletion'

export const metadata: Metadata = {
  title: 'Taxi Platform Haiti',
  description: 'Mande yon taksi rapidman an Ayiti',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body><HaitiTestGeolocation /><DriverCtaBridge /><GlobalSpacesButton /><PassengerRideCompletion />{children}</body>
    </html>
  )
}
