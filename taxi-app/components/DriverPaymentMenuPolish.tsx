'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function DriverPaymentMenuPolish() {
  useEffect(() => {
    if (window.location.pathname !== '/driver/dashboard') return

    const styleId = 'driver-payment-menu-polish-style'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .driver-payment-menu-section{padding:0 2px;border-bottom:1px solid #e5eaee}
        .driver-payment-menu-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;border:0;background:transparent;padding:16px 0;color:#0f6f59;font-size:15px;font-weight:800;text-align:left}
        .driver-payment-menu-trigger .arrow{font-size:22px;line-height:1;transition:transform .18s ease}
        .driver-payment-menu-section.open .driver-payment-menu-trigger .arrow{transform:rotate(90deg)}
        .driver-payment-menu-content{display:none;padding:0 0 12px}
        .driver-payment-menu-section.open .driver-payment-menu-content{display:block}
        .driver-payout-provider{margin:10px 0;padding:12px;border-radius:14px;background:#f7f9fa;border:1px solid #e2e8ed}
        .driver-payout-head{display:flex;justify-content:space-between;align-items:center;gap:12px}
        .driver-payout-head strong{font-size:14px;color:#102033}
        .driver-payout-switch{position:relative;width:48px;height:28px;border:0;border-radius:999px;background:#b9c4cc;padding:0;transition:.18s ease}
        .driver-payout-switch::after{content:'';position:absolute;width:22px;height:22px;left:3px;top:3px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.2);transition:.18s ease}
        .driver-payout-provider.enabled .driver-payout-switch{background:#0f6f59}
        .driver-payout-provider.enabled .driver-payout-switch::after{transform:translateX(20px)}
        .driver-payout-form{display:none;gap:10px;margin-top:12px}
        .driver-payout-provider.enabled .driver-payout-form{display:grid}
        .driver-payout-form label{display:grid;gap:5px;font-size:12px;font-weight:750;color:#526273}
        .driver-payout-form input{width:100%;box-sizing:border-box;border:1px solid #d9e1e7;border-radius:11px;padding:10px 11px;font-size:15px;background:#fff;color:#102033}
        .driver-payout-save{border:0;border-radius:11px;padding:10px 12px;background:#0f6f59;color:#fff;font-weight:900;font-size:13px}
        .driver-payout-note{font-size:11px;line-height:1.35;color:#778694;margin:0}
        .driver-payout-status{min-height:16px;font-size:11px;font-weight:750;color:#0f6f59}
      `
      document.head.appendChild(style)
    }

    let disposed = false
    let setupRunning = false

    const setup = async () => {
      if (setupRunning || disposed) return
      const drawer = document.querySelector<HTMLElement>('.drawer')
      if (!drawer) return

      const existing = Array.from(drawer.querySelectorAll<HTMLElement>('[data-driver-payment-menu="true"]'))
      if (existing.length > 0) {
        existing.slice(1).forEach((item) => item.remove())
        return
      }

      setupRunning = true
      try {
        const lang = localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
        const { data: auth } = await supabase.auth.getUser()
        if (disposed || !auth.user) return

        const { data: payout } = await supabase
          .from('driver_profiles')
          .select('moncash_enabled,moncash_name,moncash_phone,natcash_enabled,natcash_name,natcash_phone')
          .eq('user_id', auth.user.id)
          .maybeSingle()
        if (disposed) return

        if (drawer.querySelector('[data-driver-payment-menu="true"]')) return

        const section = document.createElement('div')
        section.className = 'driver-payment-menu-section'
        section.dataset.driverPaymentMenu = 'true'
        section.innerHTML = `
          <button type="button" class="driver-payment-menu-trigger" aria-expanded="false">
            <span>${lang === 'ht' ? 'Peman' : 'Paiements'}</span>
            <span class="arrow" aria-hidden="true">›</span>
          </button>
          <div class="driver-payment-menu-content">
            ${providerMarkup('moncash', 'MonCash', Boolean(payout?.moncash_enabled), payout?.moncash_name ?? '', payout?.moncash_phone ?? '', lang)}
            ${providerMarkup('natcash', 'NatCash', Boolean(payout?.natcash_enabled), payout?.natcash_name ?? '', payout?.natcash_phone ?? '', lang)}
          </div>
        `

        section.querySelector<HTMLButtonElement>('.driver-payment-menu-trigger')?.addEventListener('click', () => {
          const open = section.classList.toggle('open')
          section.querySelector<HTMLButtonElement>('.driver-payment-menu-trigger')?.setAttribute('aria-expanded', String(open))
        })

        for (const provider of ['moncash', 'natcash'] as const) {
          const box = section.querySelector<HTMLElement>(`[data-provider="${provider}"]`)
          const toggle = box?.querySelector<HTMLButtonElement>('.driver-payout-switch')
          const save = box?.querySelector<HTMLButtonElement>('.driver-payout-save')
          const name = box?.querySelector<HTMLInputElement>('input[name="name"]')
          const phone = box?.querySelector<HTMLInputElement>('input[name="phone"]')
          const status = box?.querySelector<HTMLElement>('.driver-payout-status')

          toggle?.addEventListener('click', async () => {
            if (!box) return
            const enabled = !box.classList.contains('enabled')
            box.classList.toggle('enabled', enabled)
            toggle.setAttribute('aria-pressed', String(enabled))
            const update = provider === 'moncash' ? { moncash_enabled: enabled } : { natcash_enabled: enabled }
            const { error } = await supabase.from('driver_profiles').update(update).eq('user_id', auth.user.id)
            if (status) status.textContent = error ? (lang === 'ht' ? 'Pa ka anrejistre chanjman an.' : 'Impossible d’enregistrer ce changement.') : ''
          })

          save?.addEventListener('click', async () => {
            const accountName = name?.value.trim() ?? ''
            const accountPhone = phone?.value.trim() ?? ''
            if (!accountName || !accountPhone) {
              if (status) status.textContent = lang === 'ht' ? 'Antre non ak nimewo telefòn lan.' : 'Entrez le nom et le numéro de téléphone.'
              return
            }
            save.disabled = true
            if (status) status.textContent = lang === 'ht' ? 'N ap anrejistre…' : 'Enregistrement…'
            const update = provider === 'moncash'
              ? { moncash_name: accountName, moncash_phone: accountPhone, moncash_enabled: true }
              : { natcash_name: accountName, natcash_phone: accountPhone, natcash_enabled: true }
            const { error } = await supabase.from('driver_profiles').update(update).eq('user_id', auth.user.id)
            if (!error) box?.classList.add('enabled')
            if (status) status.textContent = error
              ? (lang === 'ht' ? 'Nou pa ka anrejistre enfòmasyon yo.' : 'Impossible d’enregistrer les informations.')
              : (lang === 'ht' ? 'Enfòmasyon yo anrejistre.' : 'Informations enregistrées.')
            save.disabled = false
          })
        }

        const languageSection = Array.from(drawer.querySelectorAll<HTMLElement>('.menuSection')).find((item) => {
          const text = item.querySelector('h3')?.textContent?.trim().toLowerCase() ?? ''
          return text === 'langue' || text === 'lang'
        })
        if (languageSection) drawer.insertBefore(section, languageSection)
        else {
          const logout = drawer.querySelector('.drawerLogout')
          if (logout) drawer.insertBefore(section, logout)
          else drawer.appendChild(section)
        }
      } finally {
        setupRunning = false
      }
    }

    void setup()
    const observer = new MutationObserver(() => { void setup() })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => { disposed = true; observer.disconnect() }
  }, [])

  return null
}

function providerMarkup(provider: 'moncash' | 'natcash', label: string, enabled: boolean, name: string, phone: string, lang: 'fr' | 'ht') {
  return `
    <div class="driver-payout-provider${enabled ? ' enabled' : ''}" data-provider="${provider}">
      <div class="driver-payout-head">
        <strong>${label}</strong>
        <button type="button" class="driver-payout-switch" aria-label="${label}" aria-pressed="${enabled}"></button>
      </div>
      <div class="driver-payout-form">
        <label>${lang === 'ht' ? 'Non' : 'Nom'}<input name="name" type="text" value="${escapeHtml(name)}" autocomplete="name" /></label>
        <label>${lang === 'ht' ? 'Telefòn ki asosye ak kont lan' : 'Téléphone associé au compte'}<input name="phone" type="tel" value="${escapeHtml(phone)}" autocomplete="tel" inputmode="tel" /></label>
        <p class="driver-payout-note">${lang === 'ht' ? `Nimewo sa a dwe menm nimewo ki asosye ak kont ${label} la.` : `Ce numéro doit être celui associé au compte ${label}.`}</p>
        <button type="button" class="driver-payout-save">${lang === 'ht' ? 'Anrejistre' : 'Enregistrer'}</button>
        <div class="driver-payout-status" aria-live="polite"></div>
      </div>
    </div>
  `
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] ?? char))
}
