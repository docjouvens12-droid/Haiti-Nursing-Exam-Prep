import type { ReactNode } from 'react'
import './driver-dashboard.css'
import DriverDashboardHydrator from '../../../components/DriverDashboardHydrator'

export default function DriverDashboardLayout({ children }: { children: ReactNode }) {
  return <>
    {children}
    <DriverDashboardHydrator />
  </>
}
