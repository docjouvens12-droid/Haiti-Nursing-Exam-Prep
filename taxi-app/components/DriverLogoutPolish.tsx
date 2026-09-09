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
          width:auto !important;
          min-width:150px !important;
          max-width:100% !important;
          min-height:42px !important;
          margin:22px auto 8px !important;
          padding:10px 16px !important;
          border:1px solid #f0caca !important;
          border-radius:13px !important;
          background:#fff4f4 !important;
          color:#9b3030 !important;
          font-size:14px !important;
          font-weight:800 !important;
          line-height:1.2 !important;
          display:flex !important;
          align-items:center !important;
          justify-content:center !important;
          gap:8px !important;
          box-shadow:none !important;
        }
        .drawer .drawerLogout:active {
          background:#fdeaea !important;
          transform:scale(.98);
        }
        .driver-logout-confirm-backdrop {
          position:fixed;
          inset:0;
          z-index:99999;
          background:rgba(15,32,51,.46);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
        }
        .driver-logout-confirm-card {
          width:min(360px,100%);
          background:#fff;
          border-radius:18px;
          padding:20px;
          box-shadow:0 18px 60px rgba(0,0,0,.22);
          font-family:Inter,system-ui,sans-serif;
          color:#102033;
        }
        .driver-logout-confirm-card h3 {
          margin:0 0 8px;
          font-size:18px;
          font-weight:850;
        }
        .driver-logout-confirm-card p {
          margin:0 0 18px;
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
          min-height:44px;
          border-radius:12px;
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
          background:#b63b3b;
          color:#fff;
        }
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
      if (button.textContent !== `⎋ ${label}`) button.textContent = `⎋ ${label}`

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
