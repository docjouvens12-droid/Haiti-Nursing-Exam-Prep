'use client'

import { useEffect } from 'react'

export default function DriverRideExperiencePolish() {
  useEffect(() => {
    if (window.location.pathname !== '/driver/dashboard') return

    const styleId = 'driver-ride-experience-polish'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .section { margin-top:22px !important; }
        .section-title { align-items:center !important; }
        .section-title h2 { color:#102033 !important; font-size:19px !important; margin:0 !important; }
        .rides { gap:14px !important; }
        .ride-wrap {
          border:1px solid #dfe8e5 !important;
          border-radius:22px !important;
          padding:16px !important;
          background:#fff !important;
          box-shadow:0 8px 24px rgba(16,32,51,.07) !important;
        }
        .ride-card { gap:14px !important; }
        .ride-card .row {
          padding:11px 12px !important;
          border-radius:15px !important;
          background:#f7faf9 !important;
          border:1px solid #e8efed !important;
        }
        .ride-card .row small {
          color:#718193 !important;
          font-size:11px !important;
          font-weight:700 !important;
        }
        .ride-card .row strong {
          color:#102033 !important;
          font-size:14px !important;
          line-height:1.35 !important;
        }
        .ride-card .metrics {
          display:grid !important;
          grid-template-columns:1fr 1fr !important;
          gap:9px !important;
        }
        .ride-card .metrics > div {
          background:#f3f7f8 !important;
          border-radius:14px !important;
          padding:11px 10px !important;
          border:1px solid #e2e9ed !important;
        }
        .ride-card .metrics small {
          color:#7a8998 !important;
          font-size:10px !important;
          font-weight:750 !important;
        }
        .ride-card .metrics strong {
          color:#102033 !important;
          font-size:14px !important;
          margin-top:3px !important;
        }
        .driver-accept-action,
        .driver-arriving-action,
        .driver-start-action,
        .driver-complete-action {
          width:100% !important;
          min-height:48px !important;
          margin-top:13px !important;
          border-radius:15px !important;
          font-size:15px !important;
          font-weight:900 !important;
          box-shadow:none !important;
        }
        .driver-accept-action { background:#0f8067 !important; color:#fff !important; }
        .driver-arriving-action { background:#f4b740 !important; color:#332500 !important; }
        .driver-start-action { background:#173f68 !important; color:#fff !important; }
        .driver-complete-action { background:#0b6b55 !important; color:#fff !important; }
        .pill.driver-status-pill {
          font-size:11px !important;
          font-weight:850 !important;
          color:#0f6f59 !important;
          background:#e8f5f1 !important;
          border:1px solid #cce7df !important;
          padding:7px 10px !important;
        }
        .empty.driver-search-empty {
          border:1px dashed #bcd7cf !important;
          background:#f6fbf9 !important;
          color:#58706a !important;
          border-radius:18px !important;
          padding:24px 18px !important;
          font-weight:700 !important;
        }
        .status-card.driver-switch-card small.driver-gps-ok { color:#0f8067 !important; font-weight:700 !important; }
        .status-card.driver-switch-card small.driver-gps-off { color:#a26a23 !important; font-weight:700 !important; }
        @media (max-width:600px) {
          .ride-wrap { padding:14px !important; }
          .ride-card .metrics { grid-template-columns:1fr 1fr !important; }
        }
      `
      document.head.appendChild(style)
    }

    const getLang = () => localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'

    const apply = () => {
      const lang = getLang()

      document.querySelectorAll<HTMLButtonElement>('.ride-wrap > button.primary').forEach((button) => {
        button.classList.add('driver-accept-action')
      })

      document.querySelectorAll<HTMLButtonElement>('button.primary.action').forEach((button) => {
        button.classList.remove('driver-arriving-action', 'driver-start-action', 'driver-complete-action')
        const text = (button.textContent || '').toLowerCase()
        if (text.includes('arrivé') || text.includes('rive')) button.classList.add('driver-arriving-action')
        else if (text.includes('commencer') || text.includes('kòmanse')) button.classList.add('driver-start-action')
        else if (text.includes('terminer') || text.includes('fini')) button.classList.add('driver-complete-action')
      })

      document.querySelectorAll<HTMLElement>('.pill').forEach((pill) => {
        const raw = (pill.textContent || '').trim()
        const labels: Record<string, [string, string]> = {
          accepted: ['Chauffeur en route', 'Chofè sou wout'],
          driver_arriving: ['Chauffeur arrivé', 'Chofè rive'],
          in_progress: ['Trajet en cours', 'Trajè an kou'],
        }
        const label = labels[raw]
        if (label) pill.textContent = lang === 'ht' ? label[1] : label[0]
        pill.classList.add('driver-status-pill')
      })

      document.querySelectorAll<HTMLElement>('.empty').forEach((empty) => {
        const text = (empty.textContent || '').toLowerCase()
        if (text.includes('aucune demande') || text.includes('pa gen demann')) {
          empty.classList.add('driver-search-empty')
          empty.textContent = lang === 'ht'
            ? '🔎 N ap chèche nouvo trajè pou ou…'
            : '🔎 Nous recherchons de nouvelles courses pour vous…'
        }
      })

      const gps = document.querySelector<HTMLElement>('.status-card.driver-switch-card small')
      if (gps) {
        gps.classList.remove('driver-gps-ok', 'driver-gps-off')
        const text = (gps.textContent || '').toLowerCase()
        const active = text.includes('active') || text.includes('aktif')
        gps.classList.add(active ? 'driver-gps-ok' : 'driver-gps-off')
      }
    }

    const onClickCapture = (event: Event) => {
      const target = event.target as HTMLElement | null
      const button = target?.closest('button.primary.action') as HTMLButtonElement | null
      if (!button) return
      const text = (button.textContent || '').toLowerCase()
      if (!text.includes('terminer') && !text.includes('fini')) return
      if (button.dataset.finishConfirmed === 'true') {
        delete button.dataset.finishConfirmed
        return
      }
      const lang = getLang()
      const confirmed = window.confirm(lang === 'ht' ? 'Èske ou sèten ou vle fini trajè sa a?' : 'Voulez-vous vraiment terminer ce trajet ?')
      if (!confirmed) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      button.dataset.finishConfirmed = 'true'
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('click', onClickCapture, true)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClickCapture, true)
    }
  }, [])

  return null
}
