'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function PassengerSupportRequestPolish() {
  useEffect(() => {
    if (window.location.pathname !== '/passenger/dashboard') return

    const styleId = 'passenger-support-request-polish'
    document.getElementById(styleId)?.remove()
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .passenger-support-box{display:none;gap:6px;padding:7px;border:1px solid #dce4e8;border-radius:9px;background:#f8fafb}
      .passenger-support-box.open{display:grid}
      .passenger-support-select,.passenger-support-text{width:100%;box-sizing:border-box;border:1px solid #d6e0e5;border-radius:8px;background:#fff;color:#243747;font-size:10px;padding:7px 8px}
      .passenger-support-text{min-height:72px;resize:vertical;font-family:inherit}
      .passenger-support-send{width:100%;border:0;border-radius:8px;background:#0f6f59;color:#fff;font-size:10.5px;font-weight:850;padding:8px}
      .passenger-support-send:disabled{opacity:.55}
      .passenger-support-status{min-height:14px;font-size:9.5px;line-height:1.3;color:#0f6f59}
    `
    document.head.appendChild(style)

    const apply = () => {
      const details = document.querySelector<HTMLElement>('.passenger-help-details')
      const oldContact = details?.querySelector<HTMLButtonElement>('.passenger-help-contact')
      if (!details || !oldContact || oldContact.dataset.realSupportReady === 'true') return

      const ht = window.localStorage.getItem('taxi-language') === 'ht'

      // Clone removes the previous temporary alert listener.
      const contact = oldContact.cloneNode(true) as HTMLButtonElement
      contact.dataset.realSupportReady = 'true'
      contact.textContent = ht ? 'Kontakte sipò' : 'Contacter le support'
      oldContact.replaceWith(contact)

      const box = document.createElement('div')
      box.className = 'passenger-support-box'
      box.innerHTML = `
        <select class="passenger-support-select" aria-label="${ht ? 'Kategori' : 'Catégorie'}">
          <option value="general">${ht ? 'Jeneral' : 'Général'}</option>
          <option value="ride">${ht ? 'Pwoblèm ak trajè' : 'Problème de trajet'}</option>
          <option value="payment">${ht ? 'Pwoblèm ak peman' : 'Problème de paiement'}</option>
          <option value="account">${ht ? 'Kont mwen' : 'Mon compte'}</option>
          <option value="safety">${ht ? 'Sekirite' : 'Sécurité'}</option>
          <option value="price">${ht ? 'Kesyon sou pri' : 'Question sur le prix'}</option>
        </select>
        <textarea class="passenger-support-text" maxlength="2000" placeholder="${ht ? 'Ekri mesaj ou pou sipò…' : 'Écrivez votre message au support…'}"></textarea>
        <button type="button" class="passenger-support-send">${ht ? 'Voye bay sipò' : 'Envoyer au support'}</button>
        <div class="passenger-support-status" aria-live="polite"></div>
      `
      contact.insertAdjacentElement('afterend', box)

      contact.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        box.classList.toggle('open')
      })

      const select = box.querySelector<HTMLSelectElement>('.passenger-support-select')
      const text = box.querySelector<HTMLTextAreaElement>('.passenger-support-text')
      const send = box.querySelector<HTMLButtonElement>('.passenger-support-send')
      const status = box.querySelector<HTMLElement>('.passenger-support-status')

      send?.addEventListener('click', async (event) => {
        event.preventDefault()
        event.stopPropagation()
        const message = text?.value.trim() || ''
        if (message.length < 3) {
          if (status) status.textContent = ht ? 'Ekri yon mesaj anvan ou voye.' : 'Écrivez un message avant de l’envoyer.'
          return
        }

        send.disabled = true
        if (status) status.textContent = ht ? 'N ap voye mesaj la…' : 'Envoi du message…'

        const { data: auth } = await supabase.auth.getUser()
        const user = auth.user
        if (!user) {
          if (status) status.textContent = ht ? 'Ou bezwen konekte pou voye mesaj la.' : 'Vous devez être connecté pour envoyer le message.'
          send.disabled = false
          return
        }

        let rideId: string | null = null
        const { data: rideData } = await supabase
          .from('rides')
          .select('id')
          .eq('passenger_id', user.id)
          .order('requested_at', { ascending: false })
          .limit(1)
        rideId = (rideData ?? [])[0]?.id ?? null

        const { error } = await supabase.from('support_requests').insert({
          passenger_id: user.id,
          ride_id: rideId,
          category: select?.value || 'general',
          message,
        })

        if (error) {
          if (status) status.textContent = ht ? 'Mesaj la pa pase. Eseye ankò.' : 'Le message n’a pas été envoyé. Réessayez.'
        } else {
          if (status) status.textContent = ht ? 'Mesaj la voye bay sipò. ✅' : 'Message envoyé au support. ✅'
          if (text) text.value = ''
        }
        send.disabled = false
      })
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
