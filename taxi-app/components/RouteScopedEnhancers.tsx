'use client'

import { usePathname } from 'next/navigation'

import PassengerActiveDriver from './PassengerActiveDriver'
import PassengerPendingRideCancel from './PassengerPendingRideCancel'
import PassengerRideCompletion from './PassengerRideCompletion'
import PassengerStaleReceiptGuard from './PassengerStaleReceiptGuard'
import PassengerRidePhasePolish from './PassengerRidePhasePolish'
import PassengerCompletionPolish from './PassengerCompletionPolish'
import PassengerRideLifecycleGuard from './PassengerRideLifecycleGuard'
import PassengerAvatarEnhancer from './PassengerAvatarEnhancer'
import PassengerProfileDetails from './PassengerProfileDetails'
import PassengerDriverApplicationMenuItem from './PassengerDriverApplicationMenuItem'
import PassengerTripsEnhancer from './PassengerTripsEnhancer'
import PassengerPaymentEnhancer from './PassengerPaymentEnhancer'
import PassengerLanguageSwitchEnhancer from './PassengerLanguageSwitchEnhancer'
import PassengerHelpDirectNavigation from './PassengerHelpDirectNavigation'
import PassengerLogoutPolish from './PassengerLogoutPolish'
import PassengerRidePaymentSync from './PassengerRidePaymentSync'
import PassengerDashboardDriverStyle from './PassengerDashboardDriverStyle'
import PassengerMainPaymentPolish from './PassengerMainPaymentPolish'
import PassengerDashboardQuickInfo from './PassengerDashboardQuickInfo'
import PassengerRestoredVersionPolish from './PassengerRestoredVersionPolish'
import PassengerHomeDashboardPolish from './PassengerHomeDashboardPolish'
import PassengerDashboardV2Polish from './PassengerDashboardV2Polish'
import PassengerDashboardHardV2 from './PassengerDashboardHardV2'
import PassengerDashboardFinalReview from './PassengerDashboardFinalReview'
import PassengerPlatformRedesignV3 from './PassengerPlatformRedesignV3'
import PassengerUnifiedFinalPolish from './PassengerUnifiedFinalPolish'
import MoviPassengerDesign from './MoviPassengerDesign'

import DriverAvatarUploadPolish from './DriverAvatarUploadPolish'
import DriverDashboardTitleHide from './DriverDashboardTitleHide'
import DriverOnlineSwitchPolish from './DriverOnlineSwitchPolish'
import DriverBrandTaxiPolish from './DriverBrandTaxiPolish'
import DriverCompactBrandPolish from './DriverCompactBrandPolish'
import DriverLogoutPolish from './DriverLogoutPolish'
import DriverAutoRequestSearch from './DriverAutoRequestSearch'
import DriverRideExperiencePolish from './DriverRideExperiencePolish'
import DriverCompletedRideSummary from './DriverCompletedRideSummary'
import DriverHomeDashboardPolish from './DriverHomeDashboardPolish'
import DriverFinalMenuStable from './DriverFinalMenuStable'
import DriverApplicationSubmitButton from './DriverApplicationSubmitButton'
import DriverPayoutEditPolish from './DriverPayoutEditPolish'
import DriverFinalHelpTopics from './DriverFinalHelpTopics'
import DriverDrawerHeaderPolish from './DriverDrawerHeaderPolish'
import DriverProfileSectionPolish from './DriverProfileSectionPolish'
import DriverVehicleSectionPolish from './DriverVehicleSectionPolish'
import DriverPaymentsSectionPolish from './DriverPaymentsSectionPolish'
import DriverHistorySectionPolish from './DriverHistorySectionPolish'
import DriverEarningsSectionPolish from './DriverEarningsSectionPolish'
import DriverLanguageSectionPolish from './DriverLanguageSectionPolish'
import DriverAccessGate from './DriverAccessGate'

import AdminDriverApplicationProfileSnapshot from './AdminDriverApplicationProfileSnapshot'
import AdminDriverVehicleSnapshot from './AdminDriverVehicleSnapshot'

export default function RouteScopedEnhancers() {
  const pathname = usePathname()
  const isDriver = pathname.startsWith('/driver')
  const isCleanDriverDashboard = pathname === '/driver/dashboard-v2'
  const isAdmin = pathname.startsWith('/admin')
  const isPassenger = !isDriver && !isAdmin

  return <>
    {isPassenger && <>
      <PassengerRideLifecycleGuard />
      <PassengerActiveDriver />
      <PassengerPendingRideCancel />
      <PassengerRideCompletion />
      <PassengerStaleReceiptGuard />
      <PassengerRidePhasePolish />
      <PassengerCompletionPolish />
      <PassengerAvatarEnhancer />
      <PassengerProfileDetails />
      <PassengerDriverApplicationMenuItem />
      <PassengerTripsEnhancer />
      <PassengerPaymentEnhancer />
      <PassengerLanguageSwitchEnhancer />
      <PassengerHelpDirectNavigation />
      <PassengerLogoutPolish />
      <PassengerRidePaymentSync />
      <PassengerDashboardDriverStyle />
      <PassengerMainPaymentPolish />
      <PassengerDashboardQuickInfo />
      <PassengerRestoredVersionPolish />
      <PassengerHomeDashboardPolish />
      <PassengerDashboardV2Polish />
      <PassengerDashboardHardV2 />
      <PassengerDashboardFinalReview />
      <PassengerPlatformRedesignV3 />
      <PassengerUnifiedFinalPolish />
      <MoviPassengerDesign />
    </>}

    {isDriver && !isCleanDriverDashboard && <>
      <DriverAccessGate />
      <DriverAvatarUploadPolish />
      <DriverDashboardTitleHide />
      <DriverOnlineSwitchPolish />
      <DriverBrandTaxiPolish />
      <DriverCompactBrandPolish />
      <DriverLogoutPolish />
      <DriverAutoRequestSearch />
      <DriverRideExperiencePolish />
      <DriverCompletedRideSummary />
      <DriverHomeDashboardPolish />
      <DriverFinalMenuStable />
      <DriverApplicationSubmitButton />
      <DriverPayoutEditPolish />
      <DriverFinalHelpTopics />
      <DriverDrawerHeaderPolish />
      <DriverProfileSectionPolish />
      <DriverVehicleSectionPolish />
      <DriverPaymentsSectionPolish />
      <DriverHistorySectionPolish />
      <DriverEarningsSectionPolish />
      <DriverLanguageSectionPolish />
    </>}

    {isAdmin && <>
      <AdminDriverApplicationProfileSnapshot />
      <AdminDriverVehicleSnapshot />
    </>}
  </>
}
