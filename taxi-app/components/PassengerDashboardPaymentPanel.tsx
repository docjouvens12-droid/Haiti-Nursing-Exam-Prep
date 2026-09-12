'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Method = 'cash' | 'moncash' | 'natcash'

const METHODS: { id: Method; icon: string; fr: string; ht: string; subFr: string; subHt: string }[] = [
  { id: 'cash', icon: '💵', fr: 'Espèces', ht: 'Lajan kach', subFr: 'Payer directement au chauffeur', subHt: 'Peye chofè a dirèkteman' },
  { id: 'moncash', icon: '📱', fr: 'MonCash', ht: 'MonCash', subFr: 'Paiement mobile', subHt: 'Peman mobil' },
  { id: 'natcash', icon: '📲', fr: 'NatCash', ht: 'NatCash', subFr: 'Paiement mobile', subHt: 'Peman mobil' },
]

export default function PassengerDashboardPaymentPanel() {
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const [ht, setHt] = useState(false)
  const [method, setMethod] = useState<Method>('cash')

  const syncMainRow = (next: Method) => {
    const row = document.querySelector<HTMLElement>('.shell .payment-row')
    const strong = row?.querySelector<HTMLElement>('strong')
    const icon = row?.querySelector<HTMLElement>('.payment-icon')
    if (strong) strong.textContent = next === 'cash' ? (localStorage.getItem('taxi-language') === 'ht' ? 'Lajan kach' : 'Espèces') : next === 'moncash' ? 'MonCash' : 'NatCash'
    if (icon) icon.textContent = next === 'cash' ? '💵' : next === 'moncash' ? '📱' : '📲'
  }

  useEffect(() => {
    const saved = localStorage.getItem('taxi-dashboard-payment-method') as Method | null
    const initial: Method = saved === 'moncash' || saved === 'natcash' || saved === 'cash' ? saved : 'cash'
    setMethod(initial)
    syncMainRow(initial)

    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('.shell .payment-row button')
      if (!button) return
      window.setTimeout(() => {
        const panel = document.querySelector<HTMLElement>('.shell .account-panel')
        const body = panel?.querySelector<HTMLElement>('.panel-body')
        if (!panel || !body) return
        panel.classList.add('pdp-active')
        setHt(localStorage.getItem('taxi-language') === 'ht')
        setTarget(body)
        setOpen(true)
      }, 20)
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  const choose = (next: Method) => {
    setMethod(next)
    localStorage.setItem('taxi-dashboard-payment-method', next)
    if (next === 'moncash' || next === 'natcash') {
      localStorage.setItem('taxi-payment-method', next)
      localStorage.setItem('taxi-payment-provider', next)
    }
    syncMainRow(next)
    window.dispatchEvent(new CustomEvent('taxi-payment-method-change', { detail: next }))
  }

  if (!open || !target || !document.contains(target)) return null

  return createPortal(
    <div className="pdp-root">
      <style>{`
        .pdp-active .panel-body > *:not(.pdp-root){display:none!important}
        .pdp-root{display:grid;gap:12px;padding:2px 0 24px}
        .pdp-title{margin:0 0 2px;font-size:22px;line-height:1.15;color:#10243a;font-weight:900}
        .pdp-sub{margin:0 0 6px;color:#71817b;font-size:13px;line-height:1.45}
        .pdp-list{display:grid;gap:10px}
        .pdp-card{width:100%;border:1px solid #dfe8e4;border-radius:18px;background:#fff;padding:14px;display:flex;align-items:center;gap:12px;text-align:left;box-shadow:0 8px 22px rgba(24,58,47,.045)}
        .pdp-card.active{border-color:#0f8065;box-shadow:0 0 0 1.5px #0f8065 inset,0 10px 24px rgba(15,128,101,.08)}
        .pdp-icon{width:48px;height:48px;border-radius:14px;background:#edf8f4;display:grid;place-items:center;font-size:23px;flex:0 0 auto}
        .pdp-copy{display:grid;gap:4px;min-width:0;flex:1}.pdp-copy strong{font-size:16px;color:#10243a}.pdp-copy small{font-size:11px;color:#7c8b85;line-height:1.35}
        .pdp-check{width:28px;height:28px;border-radius:50%;border:1.5px solid #cbd8d3;display:grid;place-items:center;font-size:15px;color:transparent;flex:0 0 auto}
        .pdp-card.active .pdp-check{background:#0f8065;border-color:#0f8065;color:#fff}
        .pdp-note{margin-top:4px;padding:12px 13px;border-radius:14px;background:#f0f6f4;color:#64756e;font-size:11px;line-height:1.45}
      `}</style>
      <h2 className="pdp-title">{ht ? 'Metòd peman' : 'Moyens de paiement'}</h2>
      <p className="pdp-sub">{ht ? 'Chwazi kijan ou vle peye trajè ou.' : 'Choisissez comment vous souhaitez payer votre trajet.'}</p>
      <div className="pdp-list">
        {METHODS.map(item => {
          const active = method === item.id
          return <button key={item.id} type="button" className={`pdp-card ${active ? 'active' : ''}`} onClick={() => choose(item.id)}>
            <span className="pdp-icon">{item.icon}</span>
            <span className="pdp-copy"><strong>{ht ? item.ht : item.fr}</strong><small>{ht ? item.subHt : item.subFr}</small></span>
            <span className="pdp-check">✓</span>
          </button>
        })}
      </div>
      <div className="pdp-note">{ht ? 'Metòd ou chwazi a ap parèt sou dashboard la epi li pral sèvi kòm metòd peman pou pwochen trajè a.' : 'Le moyen sélectionné apparaîtra sur le tableau de bord et sera utilisé comme mode de paiement pour le prochain trajet.'}</div>
    </div>,
    target,
  )
}
