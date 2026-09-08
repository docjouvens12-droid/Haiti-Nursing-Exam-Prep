'use client'

import { useEffect } from 'react'

export default function PassengerHelpMenuPolish() {
  useEffect(() => {
    if (window.location.pathname !== '/passenger/dashboard') return

    const styleId = 'passenger-help-menu-polish'
    document.getElementById(styleId)?.remove()
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .passenger-help-details{display:none;padding:4px 4px 10px 30px;border-bottom:1px solid #e7ecef}
      .passenger-help-details.open{display:grid;gap:6px}
      .passenger-help-item{width:100%;display:grid;grid-template-columns:22px minmax(0,1fr) 12px;align-items:center;gap:7px;border:0;background:#f7f9fa;color:#243747;border-radius:10px;padding:9px 8px;text-align:left;font-size:11px;font-weight:750;line-height:1.2}
      .passenger-help-item span:first-child{font-size:14px}
      .passenger-help-item span:last-child{font-size:14px;color:#8794a0;text-align:right}
      .passenger-help-item:active{background:#eef3f5}
      .passenger-help-answer{display:none;margin:-2px 0 3px;padding:8px 10px;border-radius:9px;background:#fff;border:1px solid #e7ecef;color:#657483;font-size:10.5px;line-height:1.4}
      .passenger-help-answer.open{display:block}
      .passenger-help-contact{display:block;width:100%;border:0;border-radius:10px;padding:9px 10px;background:#0f6f59;color:#fff;font-size:11px;font-weight:850;text-align:center}
    `
    document.head.appendChild(style)

    const apply = () => {
      const drawer = document.querySelector<HTMLElement>('.nav-drawer')
      const nav = drawer?.querySelector<HTMLElement>('.drawer-nav')
      if (!drawer || !nav) return

      const buttons = Array.from(nav.querySelectorAll<HTMLButtonElement>(':scope > button'))
      const helpButton = buttons.find((button) => /(^|\s)(aide|èd)(\s|$)/i.test((button.textContent || '').trim()))
      if (!helpButton || helpButton.dataset.passengerHelpReady === 'true') return

      helpButton.dataset.passengerHelpReady = 'true'
      const ht = window.localStorage.getItem('taxi-language') === 'ht'
      const details = document.createElement('div')
      details.className = 'passenger-help-details'
      details.dataset.passengerHelpDetails = 'true'

      const items = ht ? [
        ['🚕','Pwoblèm ak yon trajè','Chofè pa vini, trajè anile, move destinasyon oswa lòt pwoblèm ki gen rapò ak yon trajè.'],
        ['💳','Pwoblèm ak peman','MonCash/NatCash pa pase, move montan oswa peman an rete an atant.'],
        ['👤','Kont mwen','Pwoblèm koneksyon, modpas, telefòn oswa enfòmasyon pèsonèl.'],
        ['🛡️','Sekirite','Rapòte yon pwoblèm ak yon chofè oswa yon sitiyasyon ki rive pandan trajè a.'],
        ['💰','Kesyon sou pri','Jwenn eksplikasyon sou pri trajè a ak fason peman an trete sou platfòm nan.'],
      ] : [
        ['🚕','Problème avec un trajet','Chauffeur absent, trajet annulé, mauvaise destination ou autre problème lié à un trajet.'],
        ['💳','Problème de paiement','MonCash/NatCash refusé, mauvais montant ou paiement en attente.'],
        ['👤','Mon compte','Problème de connexion, mot de passe, téléphone ou informations personnelles.'],
        ['🛡️','Sécurité','Signaler un problème avec un chauffeur ou une situation survenue pendant le trajet.'],
        ['💰','Question sur le prix','Comprendre le prix du trajet et le traitement du paiement sur la plateforme.'],
      ]

      items.forEach(([icon, label, answer]) => {
        const item = document.createElement('button')
        item.type = 'button'
        item.className = 'passenger-help-item'
        item.innerHTML = `<span>${icon}</span><b>${label}</b><span>›</span>`
        const answerBox = document.createElement('div')
        answerBox.className = 'passenger-help-answer'
        answerBox.textContent = answer
        item.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation()
          const open = answerBox.classList.toggle('open')
          const arrow = item.querySelector<HTMLElement>('span:last-child')
          if (arrow) arrow.style.transform = open ? 'rotate(90deg)' : 'rotate(0deg)'
        })
        details.append(item, answerBox)
      })

      const contact = document.createElement('button')
      contact.type = 'button'
      contact.className = 'passenger-help-contact'
      contact.textContent = ht ? 'Kontakte sipò' : 'Contacter le support'
      contact.addEventListener('click', (event) => {
        event.preventDefault(); event.stopPropagation()
        window.alert(ht ? 'Sipò dirèk la ap konekte nan pwochen etap la.' : 'Le support direct sera connecté à la prochaine étape.')
      })
      details.appendChild(contact)

      helpButton.insertAdjacentElement('afterend', details)
      const arrow = helpButton.querySelector<HTMLElement>('b:last-child')
      helpButton.addEventListener('click', (event) => {
        event.preventDefault(); event.stopPropagation()
        const open = details.classList.toggle('open')
        if (arrow) arrow.style.transform = open ? 'rotate(90deg)' : 'rotate(0deg)'
      }, true)
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
