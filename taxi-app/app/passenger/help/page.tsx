'use client'

import { useRouter } from 'next/navigation'

export default function PassengerHelpPage() {
  const router = useRouter()
  return (
    <main className="shell">
      <section className="phone-frame">
        <section className="account-panel">
          <div className="panel-header">
            <button type="button" onClick={() => router.push('/passenger/dashboard')}>‹</button>
            <strong>Centre d’aide</strong>
            <span />
          </div>
          <div className="panel-body" />
        </section>
      </section>
    </main>
  )
}
