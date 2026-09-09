'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Lang = 'fr' | 'ht'

export default function PassengerLanguageSwitchEnhancer() {
  const [target, setTarget] = useState<Element | null>(null)
  const [lang, setLang] = useState<Lang>('fr')

  useEffect(() => {
    const saved = window.localStorage.getItem('taxi-language')
    if (saved === 'ht' || saved === 'fr') setLang(saved)

    const syncTarget = () => {
      const drawer = document.querySelector('.nav-drawer')
      const language = drawer?.querySelector('.drawer-language')
      if (!language) {
        setTarget(null)
        return
      }

      let mount = language.querySelector('.drawer-language-switch-target') as HTMLElement | null
      if (!mount) {
        mount = document.createElement('div')
        mount.className = 'drawer-language-switch-target'
        const menu = language.querySelector('.language-menu')
        if (menu) menu.insertAdjacentElement('afterend', mount)
        else language.appendChild(mount)
      }
      setTarget(mount)
    }

    syncTarget()
    const observer = new MutationObserver(syncTarget)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  const changeLanguage = (next: Lang) => {
    if (next === lang) return
    const language = document.querySelector('.drawer-language')
    const trigger = language?.querySelector<HTMLButtonElement>('.language-trigger')
    if (!trigger) return

    trigger.click()
    window.setTimeout(() => {
      const options = Array.from(document.querySelectorAll<HTMLButtonElement>('.language-options button'))
      const desired = options.find((button) => {
        const text = (button.textContent || '').toLowerCase()
        return next === 'ht' ? text.includes('kreyòl') : text.includes('français')
      })
      if (desired) {
        desired.click()
        setLang(next)
        window.localStorage.setItem('taxi-language', next)
      }
    }, 30)
  }

  if (!target) return null

  return createPortal(
    <div className="drawer-language-switch" role="group" aria-label="Langue">
      <button type="button" className={lang === 'fr' ? 'active' : ''} onClick={() => changeLanguage('fr')}>Français</button>
      <button type="button" className={lang === 'ht' ? 'active' : ''} onClick={() => changeLanguage('ht')}>Kreyòl</button>
    </div>,
    target,
  )
}
