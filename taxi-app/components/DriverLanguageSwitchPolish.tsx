'use client'

import { useEffect } from 'react'

export default function DriverLanguageSwitchPolish() {
  useEffect(() => {
    if (window.location.pathname !== '/driver/dashboard') return

    const apply = () => {
      const wrap = document.querySelector('.drawer .langButtons') as HTMLElement | null
      if (!wrap || wrap.dataset.switchPolished === 'true') return
      const buttons = Array.from(wrap.querySelectorAll('button')) as HTMLButtonElement[]
      if (buttons.length < 2) return

      wrap.dataset.switchPolished = 'true'
      const frButton = buttons.find((b) => (b.textContent || '').toLowerCase().includes('fran')) || buttons[0]
      const htButton = buttons.find((b) => (b.textContent || '').toLowerCase().includes('krey')) || buttons[1]
      buttons.forEach((b) => { b.style.display = 'none' })

      Object.assign(wrap.style, {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center'
      })

      const shell = document.createElement('button')
      shell.type = 'button'
      shell.setAttribute('role', 'switch')
      shell.style.cssText = 'width:138px;max-width:100%;height:36px;border:1px solid #d7e1e8;border-radius:999px;background:#f2f5f7;padding:3px;display:grid;grid-template-columns:1fr 1fr;align-items:center;position:relative;cursor:pointer;overflow:hidden;box-sizing:border-box;'

      const knob = document.createElement('span')
      knob.style.cssText = 'position:absolute;top:3px;bottom:3px;width:calc(50% - 3px);border-radius:999px;background:#0f6f59;box-shadow:0 2px 7px rgba(15,111,89,.2);transition:transform .2s ease;left:3px;'

      const fr = document.createElement('span')
      fr.textContent = 'FR'
      const ht = document.createElement('span')
      ht.textContent = 'KREYÒL'
      ;[fr, ht].forEach((el) => {
        el.style.cssText = 'position:relative;z-index:1;text-align:center;font-size:10px;font-weight:850;letter-spacing:.1px;transition:color .2s ease;pointer-events:none;'
      })
      shell.append(knob, fr, ht)
      wrap.append(shell)

      const paint = () => {
        const current = window.localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
        const isHt = current === 'ht'
        knob.style.transform = isHt ? 'translateX(100%)' : 'translateX(0)'
        fr.style.color = isHt ? '#657483' : '#fff'
        ht.style.color = isHt ? '#fff' : '#657483'
        shell.setAttribute('aria-checked', String(isHt))
        shell.setAttribute('aria-label', isHt ? 'Lang: Kreyòl. Peze pou Français.' : 'Langue : Français. Appuyez pour Kreyòl.')
      }

      const toggle = () => {
        const current = window.localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
        if (current === 'ht') frButton.click()
        else htButton.click()
        window.setTimeout(paint, 0)
      }
      shell.addEventListener('click', toggle)
      paint()
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
