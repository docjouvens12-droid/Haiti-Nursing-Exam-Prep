import type { ReactNode } from 'react'
import DriverDashboardHydrator from '../../../components/DriverDashboardHydrator'

export default function DriverDashboardLayout({ children }: { children: ReactNode }) {
  return <>
    {children}
    <DriverDashboardHydrator />
  </>
}
