'use client'

import { useEffect } from 'react'

export default function PassengerLanguageLogoutPolish() {
  useEffect(() => {
    if (window.location.pathname !== '/passenger/dashboard') return

    const styleId = 'passenger-language-logout-polish'
    document.getElementById(styleId)?.remove()
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .nav-drawer{
        height:auto!important;
        min-height:0!important;
        max-height:calc(100dvh - 12px)!important;
        padding:8px 10px 10px!important;
        overflow-y:auto!important;
      }
      .nav-drawer .drawer-head{min-height:0!important;margin:0 0 2px!important;padding:0!important}
      .nav-drawer .drawer-user{margin:0 0 4px!important;padding:2px 0!important;min-height:0!important}
      .nav-drawer .drawer-nav{gap:0!important;margin:0!important;padding:0!important}
      .nav-drawer .drawer-nav>button{min-height:38px!important;margin:0!important;padding:6px 4px!important;font-size:12px!important;line-height:1.15!important}
      .nav-drawer [data-passenger-language-row="true"]{display:grid!important;grid-template-columns:24px minmax(0,1fr)!important;align-items:center!important;gap:7px!important;margin:0!important;padding:7px 4px!important;border-top:1px solid #e7ecef!important;border-bottom:0!important;background:#fff!important;min-height:0!important}
      .passenger-language-icon{font-size:15px;line-height:1}
      .passenger-language-main{display:grid;gap:4px;min-width:0}
      .passenger-language-title{font-size:11px;font-weight:800;color:#5f6f7d;line-height:1}
      .passenger-lang-shell{width:132px;max-width:100%;height:32px;border:1px solid #d7e1e8;border-radius:999px;background:#f2f5f7;padding:3px 8px;display:grid;grid-template-columns:1fr 1fr;align-items:center;position:relative;cursor:pointer;overflow:hidden;box-sizing:border-box}
      .passenger-lang-knob{position:absolute;top:5px;left:7px;width:20px;height:20px;border-radius:50%;background:#0f6f59;box-shadow:0 2px 7px rgba(15,111,89,.22);transition:transform .2s ease;z-index:2}
      .passenger-lang-label{position:relative;z-index:1;text-align:center;font-size:10px;font-weight:850;transition:color .2s ease;pointer-events:none;color:#657483}
      .nav-drawer .drawer-logout,
      .nav-drawer [data-passenger-logout="true"]{
        display:flex!important;align-items:center!important;justify-content:center!important;
        width:100%!important;min-height:38px!important;margin:4px 0 0!important;padding:8px 10px!important;
        border:1px solid #efdcdc!important;border-radius:10px!important;background:#fff6f6!important;color:#9a3030!important;
        font-size:12px!important;font-weight:800!important;line-height:1.1!important;box-shadow:none!important;text-align:center!important;
      }
    `
    document.head.appendChild(style)

    const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    const apply = () => {
      const drawer = document.querySelector<HTMLElement>('.nav-drawer')
      if (!drawer) return

      drawer.querySelectorAll<HTMLElement>('[data-passenger-language-row="true"]').forEach((el, index) => {
        if (index > 0) el.remove()
      })

      if (!drawer.querySelector('[data-passenger-language-row="true"]')) {
        const candidates = Array.from(drawer.querySelectorAll<HTMLElement>('div,section,li'))
          .filter((el) => {
            const text = normalize((el.textContent || '').trim())
            if (!(text.includes('langue') || text.includes('lang'))) return false
            return text.includes('francais') || text.includes('kreyol')
          })
          .sort((a, b) => (a.textContent || '').length - (b.textContent || '').length)

        const nativeLang = candidates[0] || drawer.querySelector<HTMLElement>('.drawer-language')
        if (nativeLang) {
          nativeLang.dataset.passengerLanguageRow = 'true'
          nativeLang.innerHTML = ''

          const icon = document.createElement('span')
          icon.className = 'passenger-language-icon'
          icon.textContent = '🌐'

          const main = document.createElement('div')
          main.className = 'passenger-language-main'
          const title = document.createElement('span')
          title.className = 'passenger-language-title'
          title.textContent = window.localStorage.getItem('taxi-language') === 'ht' ? 'Lang' : 'Langue'

          const shell = document.createElement('button')
          shell.type = 'button'
          shell.className = 'passenger-lang-shell'
          shell.setAttribute('role', 'switch')

          const knob = document.createElement('span')
          knob.className = 'passenger-lang-knob'
          const fr = document.createElement('span')
          fr.className = 'passenger-lang-label'
          fr.textContent = 'FR'
          const ht = document.createElement('span')
          ht.className = 'passenger-lang-label'
          ht.textContent = 'KREYÒL'
          shell.append(knob, fr, ht)
          main.append(title, shell)
          nativeLang.append(icon, main)

          const paint = () => {
            const isHt = window.localStorage.getItem('taxi-language') === 'ht'
            knob.style.transform = isHt ? 'translateX(96px)' : 'translateX(0)'
            fr.style.color = isHt ? '#657483' : '#0f6f59'
            ht.style.color = isHt ? '#0f6f59' : '#657483'
            shell.setAttribute('aria-checked', String(isHt))
          }

          shell.addEventListener('click', (event) => {
            event.preventDefault()
            event.stopPropagation()
            const isHt = window.localStorage.getItem('taxi-language') === 'ht'
            window.localStorage.setItem('taxi-language', isHt ? 'fr' : 'ht')
            paint()
            window.setTimeout(() => window.location.reload(), 50)
          })
          paint()
        }
      }

      const logout = Array.from(drawer.querySelectorAll<HTMLButtonElement>('button')).find((button) => {
        const text = normalize(button.textContent || '')
        return text.includes('deconnect') || text.includes('dekonekte')
      })
      if (logout) logout.dataset.passengerLogout = 'true'
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      document.getElementById(styleId)?.remove()
    }
  }, [])

  return null
}
