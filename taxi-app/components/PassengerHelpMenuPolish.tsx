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
      .nav-drawer .drawer-nav>button[data-passenger-help-ready="true"]{
        color:#243747!important;
        font-size:12px!important;
        font-weight:750!important;
        line-height:1!important;
        font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
      }
      .nav-drawer .drawer-nav>button[data-passenger-help-ready="true"]>*{
        color:#243747!important;
        font-family:inherit!important;
        font-weight:750!important;
      }
      .nav-drawer .drawer-nav>button[data-passenger-help-ready="true"] b{
        font-size:12px!important;
        line-height:1!important;
        color:#243747!important;
      }
      .passenger-help-details{display:none;padding:4px 4px 10px 30px;border-bottom:1px solid #e7ecef}
      .passenger-help-details.open{display:grid;gap:6px}
      .passenger-help-item{width:100%;display:grid;grid-template-columns:22px minmax(0,1fr) 12px;align-items:center;gap:7px;border:0;background:#f7f9fa;color:#243747;border-radius:10px;padding:9px 8px;text-align:left;font-size:11px;font-weight:750;line-height:1.2}
      .passenger-help-item span:first-child{font-size:14px}
      .passenger-help-item span:last-child{font-size:14px;color:#8794a0;text-align:right}
      .passenger-help-item:active{background:#eef3f5}
      .passenger-help-answer{display:none;margin:-2px 0 3px;padding:8px 10px;border-radius:9px;background:#fff;border:1px solid #e7ecef;color:#657483;font-size:10.5px;line-height:1.4}
      .passenger-help-answer.open{display:block}
      .passenger-help-contact{display:block;width:100%;border:0;border-radius:10px;padding:9px 10px;background:#0f6f59;color:#fff;font-size:11px;font-weight:850;text-align:center}
      .passenger-ai-box{display:none;margin:-2px 0 3px;padding:8px;border:1px solid #dce6e3;border-radius:10px;background:#f8fbfa}
      .passenger-ai-box.open{display:grid;gap:7px}
      .passenger-ai-head{display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:10px;font-weight:850;color:#243747}
      .passenger-ai-beta{font-size:8.5px;padding:3px 6px;border-radius:999px;background:#e7f3ef;color:#0f6f59}
      .passenger-ai-message{font-size:10px;line-height:1.35;color:#526273;background:#fff;border:1px solid #e5ece9;border-radius:8px;padding:7px}
      .passenger-ai-form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px}
      .passenger-ai-input{width:100%;min-width:0;box-sizing:border-box;border:1px solid #d6e0e5;border-radius:8px;padding:7px 8px;background:#fff;color:#243747;font-size:10px;outline:none}
      .passenger-ai-send{border:0;border-radius:8px;padding:7px 9px;background:#0f6f59;color:#fff;font-size:10px;font-weight:850}
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

      const aiItem = document.createElement('button')
      aiItem.type = 'button'
      aiItem.className = 'passenger-help-item passenger-ai-trigger'
      aiItem.innerHTML = `<span>🤖</span><b>${ht ? 'Asistan AI' : 'Assistant IA'}</b><span>›</span>`

      const aiBox = document.createElement('div')
      aiBox.className = 'passenger-ai-box'
      aiBox.innerHTML = `
        <div class="passenger-ai-head">
          <span>${ht ? 'Asistan Taxi Haiti' : 'Assistant Taxi Haiti'}</span>
          <span class="passenger-ai-beta">BETA</span>
        </div>
        <div class="passenger-ai-message" aria-live="polite">${ht ? 'Poze yon kesyon sou trajè, peman, pri oswa kont ou. Koneksyon ak vrè sèvis AI a ap fèt nan pwochen etap la.' : 'Posez une question sur votre trajet, paiement, prix ou compte. La connexion au véritable service IA sera faite à la prochaine étape.'}</div>
        <div class="passenger-ai-form">
          <input class="passenger-ai-input" type="text" placeholder="${ht ? 'Ekri kesyon ou…' : 'Écrivez votre question…'}" />
          <button class="passenger-ai-send" type="button">${ht ? 'Voye' : 'Envoyer'}</button>
        </div>
      `

      aiItem.addEventListener('click', (event) => {
        event.preventDefault(); event.stopPropagation()
        const open = aiBox.classList.toggle('open')
        const arrow = aiItem.querySelector<HTMLElement>('span:last-child')
        if (arrow) arrow.style.transform = open ? 'rotate(90deg)' : 'rotate(0deg)'
      })

      const aiInput = aiBox.querySelector<HTMLInputElement>('.passenger-ai-input')
      const aiSend = aiBox.querySelector<HTMLButtonElement>('.passenger-ai-send')
      const aiMessage = aiBox.querySelector<HTMLElement>('.passenger-ai-message')
      aiSend?.addEventListener('click', (event) => {
        event.preventDefault(); event.stopPropagation()
        const question = aiInput?.value.trim() || ''
        if (!question) return
        if (aiMessage) aiMessage.textContent = ht
          ? 'Chat AI a pare vizyèlman. Nan pwochen etap la n ap konekte li ak done trajè yo ak sèvis AI a pou repons an tan reyèl.'
          : 'Le chat IA est prêt visuellement. À la prochaine étape, nous le connecterons aux données de trajet et au service IA pour des réponses en temps réel.'
        if (aiInput) aiInput.value = ''
      })
      aiInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          aiSend?.click()
        }
      })

      details.append(aiItem, aiBox)

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
