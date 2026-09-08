import type { ReactNode } from 'react'
import DriverOpenRideOffers from '../../../components/DriverOpenRideOffers'

export default function DriverDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DriverOpenRideOffers />
      {children}
    </>
  )
}
