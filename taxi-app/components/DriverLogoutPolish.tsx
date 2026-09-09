'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function DriverLogoutPolish() {
  useEffect(() => {
    if (location.pathname !== '/driver/dashboard') return

    const styleId = 'driver-logout-polish'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .drawer .drawerLogout {
          width:100% !important;
          min-height:54px !important;
          margin:18px 0 10px !important;
          padding:0 14px !important;
          border:1px solid #f3cccc !important;
          border-radius:16px !important;
          background:#fff5f5 !important;
          color:#b33d3d !important;
          font-size:14px !important;
          font-weight:850 !important;
          line-height:1.2 !important;
          display:flex !important;
          align-items:center !important;
          justify-content:flex-start !important;
          gap:12px !important;
          box-shadow:0 5px 16px rgba(201,75,75,.07) !important;
        }
        .drawer .drawerLogout::after {
          content:'›';
          margin-left:auto;
          font-size:22px;
          line-height:1;
          color:#c94b4b;
        }
        .drawer .drawerLogout:active {
          background:#fdeaea !important;
          transform:scale(.99);
        }
        .driver-logout-confirm-backdrop {
          position:fixed;
          inset:0;
          z-index:99999;
          background:rgba(15,32,51,.5);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
          backdrop-filter:blur(3px);
        }
        .driver-logout-confirm-card {
          width:min(360px,100%);
          background:#fff;
          border-radius:22px;
          padding:22px;
          box-shadow:0 20px 70px rgba(0,0,0,.24);
          font-family:Inter,system-ui,sans-serif;
          color:#102033;
          text-align:center;
        }
        .driver-logout-confirm-icon {
          width:58px;
          height:58px;
          margin:0 auto 12px;
          border-radius:18px;
          display:grid;
          place-items:center;
          background:#fff1f1;
          font-size:28px;
        }
        .driver-logout-confirm-card h3 {
          margin:0 0 8px;
          font-size:19px;
          font-weight:900;
        }
        .driver-logout-confirm-card p {
          margin:0 auto 20px;
          max-width:270px;
          color:#667789;
          font-size:14px;
          line-height:1.45;
        }
        .driver-logout-confirm-actions {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
        }
        .driver-logout-confirm-actions button {
          min-height:46px;
          border-radius:13px;
          font-size:14px;
          font-weight:850;
          cursor:pointer;
        }
        .driver-logout-cancel {
          border:1px solid #d8e0e6;
          background:#fff;
          color:#30465a;
        }
        .driver-logout-yes {
          border:0;
          background:#c94b4b;
          color:#fff;
        }
        .driver-logout-yes:disabled { opacity:.65 }
      `
      document.head.appendChild(style)
    }

    const closeModal = () => {
      document.querySelector('.driver-logout-confirm-backdrop')?.remove()
    }

    const showModal = () => {
      closeModal()
      const lang = localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
      const backdrop = document.createElement('div')
      backdrop.className = 'driver-logout-confirm-backdrop'
      backdrop.innerHTML = `
        <div class="driver-logout-confirm-card" role="dialog" aria-modal="true">
          <div class="driver-logout-confirm-icon">🚪</div>
          <h3>${lang === 'ht' ? 'Dekonekte?' : 'Se déconnecter ?'}</h3>
          <p>${lang === 'ht' ? 'Èske ou vle soti nan kont chofè ou a?' : 'Voulez-vous vraiment quitter votre compte chauffeur ?'}</p>
          <div class="driver-logout-confirm-actions">
            <button type="button" class="driver-logout-cancel">${lang === 'ht' ? 'Anile' : 'Annuler'}</button>
            <button type="button" class="driver-logout-yes">${lang === 'ht' ? 'Dekonekte' : 'Se déconnecter'}</button>
          </div>
        </div>
      `

      backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) closeModal()
      })
      backdrop.querySelector<HTMLButtonElement>('.driver-logout-cancel')?.addEventListener('click', closeModal)
      backdrop.querySelector<HTMLButtonElement>('.driver-logout-yes')?.addEventListener('click', async () => {
        const yes = backdrop.querySelector<HTMLButtonElement>('.driver-logout-yes')
        if (yes) {
          yes.disabled = true
          yes.textContent = lang === 'ht' ? 'Ap dekonekte…' : 'Déconnexion…'
        }
        await supabase.auth.signOut()
        window.location.href = '/'
      })
      document.body.appendChild(backdrop)
    }

    const apply = () => {
      const button = document.querySelector<HTMLButtonElement>('.drawer .drawerLogout')
      if (!button) return

      const lang = localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
      const label = lang === 'ht' ? 'Dekonekte' : 'Se déconnecter'
      if (button.textContent !== `🚪 ${label}`) button.textContent = `🚪 ${label}`

      if (button.dataset.logoutConfirm === 'custom') return
      button.dataset.logoutConfirm = 'custom'
      button.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        showModal()
      }, true)
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      closeModal()
    }
  }, [])

  return null
}
