'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Method = 'cash' | 'moncash' | 'natcash'

export default function PassengerPaymentEnhancer() {
  const [target, setTarget] = useState<Element | null>(null)
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState<'fr' | 'ht'>('fr')
  const [method, setMethod] = useState<Method>('cash')

  useEffect(() => {
    const savedMethod = window.localStorage.getItem('taxi-payment-method') as Method | null
    if (savedMethod === 'cash' || savedMethod === 'moncash' || savedMethod === 'natcash') setMethod(savedMethod)
  }, [])

  useEffect(() => {
    let currentButton: HTMLButtonElement | null = null
    let currentHandler: ((event: MouseEvent) => void) | null = null

    const syncTarget = () => {
      const drawer = document.querySelector('.nav-drawer')
      if (!drawer) {
        setTarget(null)
        setOpen(false)
        return
      }

      const buttons = Array.from(drawer.querySelectorAll<HTMLButtonElement>('.drawer-nav > button'))
      const paymentButton = buttons.find((button) => {
        const text = (button.textContent || '').toLowerCase()
        return text.includes('paiement') || text.includes('peman')
      }) || null

      if (!paymentButton) {
        setTarget(null)
        setOpen(false)
        return
      }

      if (currentButton !== paymentButton) {
        if (currentButton && currentHandler) currentButton.removeEventListener('click', currentHandler, true)
        currentButton = paymentButton
        currentHandler = (event: MouseEvent) => {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          const saved = window.localStorage.getItem('taxi-language')
          setLang(saved === 'ht' ? 'ht' : 'fr')
          setOpen((value) => !value)
        }
        paymentButton.addEventListener('click', currentHandler, true)
      }

      let mount = drawer.querySelector('.drawer-payment-inline-target') as HTMLElement | null
      if (!mount) {
        mount = document.createElement('div')
        mount.className = 'drawer-payment-inline-target'
        paymentButton.insertAdjacentElement('afterend', mount)
      }
      setTarget(mount)
    }

    syncTarget()
    const observer = new MutationObserver(syncTarget)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      if (currentButton && currentHandler) currentButton.removeEventListener('click', currentHandler, true)
    }
  }, [])

  const choose = (next: Method) => {
    setMethod(next)
    window.localStorage.setItem('taxi-payment-method', next)
    window.dispatchEvent(new CustomEvent('taxi-payment-method-change', { detail: next }))
  }

  if (!target || !open) return null
  const ht = lang === 'ht'

  const options: Array<{ id: Method; icon: string; label: string; sub: string }> = [
    { id: 'cash', icon: '💵', label: ht ? 'Lajan kach' : 'Espèces', sub: ht ? 'Peye chofè a an kach' : 'Payer le chauffeur en espèces' },
    { id: 'moncash', icon: '📱', label: 'MonCash', sub: ht ? 'Peman mobil MonCash' : 'Paiement mobile MonCash' },
    { id: 'natcash', icon: '📲', label: 'NatCash', sub: ht ? 'Peman mobil NatCash' : 'Paiement mobile NatCash' },
  ]

  return createPortal(
    <section className="drawer-payment-inline">
      <div className="drawer-payment-inline-head">
        <strong>{ht ? 'Peman' : 'Paiement'}</strong>
        <button type="button" onClick={() => setOpen(false)}>{ht ? 'Fèmen' : 'Fermer'}</button>
      </div>
      <div className="drawer-payment-methods">
        {options.map((option) => {
          const active = method === option.id
          return <button key={option.id} type="button" className={`drawer-payment-method ${active ? 'active' : ''}`} onClick={() => choose(option.id)}>
            <span className="drawer-payment-icon">{option.icon}</span>
            <span className="drawer-payment-copy"><strong>{option.label}</strong><small>{option.sub}</small></span>
            <span className={`drawer-payment-switch ${active ? 'on' : ''}`} aria-hidden="true"><i /></span>
          </button>
        })}
      </div>
      <p className="drawer-payment-note">{ht ? 'Chwazi yon sèl metòd peman pou pwochen trajè ou.' : 'Choisissez un seul mode de paiement pour votre prochain trajet.'}</p>
    </section>,
    target,
  )
}
