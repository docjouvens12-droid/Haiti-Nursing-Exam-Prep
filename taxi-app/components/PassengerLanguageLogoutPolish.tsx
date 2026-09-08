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
      .nav-drawer .drawer-language{display:grid!important;grid-template-columns:25px minmax(0,1fr)!important;align-items:center!important;gap:8px!important;padding:7px 4px!important;margin:0!important;border-top:1px solid #e7ecef!important;background:#fff!important}
      .nav-drawer .drawer-language>span{font-size:15px!important}
      .nav-drawer .drawer-language small{font-size:11px!important;font-weight:750!important;margin:0 0 5px!important;color:#5f6f7d!important}
      .nav-drawer .drawer-language .language-menu{display:none!important}
      .passenger-lang-shell{width:132px;max-width:100%;height:34px;border:1px solid #d7e1e8;border-radius:999px;background:#f2f5f7;padding:3px;display:grid;grid-template-columns:1fr 1fr;align-items:center;position:relative;cursor:pointer;overflow:hidden;box-sizing:border-box}
      .passenger-lang-knob{position:absolute;top:3px;bottom:3px;width:calc(50% - 3px);border-radius:999px;background:#0f6f59;box-shadow:0 2px 7px rgba(15,111,89,.2);transition:transform .2s ease;left:3px}
      .passenger-lang-label{position:relative;z-index:1;text-align:center;font-size:10px;font-weight:850;transition:color .2s ease;pointer-events:none}
      .nav-drawer .drawer-logout{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;min-height:40px!important;margin:6px 0 0!important;padding:9px 10px!important;border:1px solid #efdcdc!important;border-radius:10px!important;background:#fff6f6!important;color:#9a3030!important;font-size:12px!important;font-weight:800!important;line-height:1.2!important;box-shadow:none!important;text-align:center!important}
    `
    document.head.appendChild(style)

    const apply = () => {
      const drawer = document.querySelector<HTMLElement>('.nav-drawer')
      if (!drawer) return

      const langWrap = drawer.querySelector<HTMLElement>('.drawer-language')
      if (langWrap && !langWrap.querySelector('[data-passenger-lang-switch="true"]')) {
        const shell = document.createElement('button')
        shell.type = 'button'
        shell.className = 'passenger-lang-shell'
        shell.dataset.passengerLangSwitch = 'true'
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
        langWrap.appendChild(shell)

        const paint = () => {
          const isHt = window.localStorage.getItem('taxi-language') === 'ht'
          knob.style.transform = isHt ? 'translateX(100%)' : 'translateX(0)'
          fr.style.color = isHt ? '#657483' : '#fff'
          ht.style.color = isHt ? '#fff' : '#657483'
          shell.setAttribute('aria-checked', String(isHt))
        }

        shell.addEventListener('click', (event) => {
          event.preventDefault()
          event.stopPropagation()
          const isHt = window.localStorage.getItem('taxi-language') === 'ht'
          window.localStorage.setItem('taxi-language', isHt ? 'fr' : 'ht')
          paint()
          window.setTimeout(() => window.location.reload(), 60)
        })
        paint()
      }
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
