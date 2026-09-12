'use client'

import { useEffect } from 'react'

const locations: Array<{ keys: string[]; context: string }> = [
  { keys: ['les gonaives', 'gonaives', 'gonayiv'], context: 'Les Gonaïves, Artibonite, Haïti' },
  { keys: ['port au prince', 'potoprens'], context: 'Port-au-Prince, Ouest, Haïti' },
  { keys: ['delmas'], context: 'Delmas, Ouest, Haïti' },
  { keys: ['petion ville', 'petion-ville', 'petyonvil'], context: 'Pétion-Ville, Ouest, Haïti' },
  { keys: ['cap haitien', 'cap-haitien', 'okap'], context: 'Cap-Haïtien, Nord, Haïti' },
  { keys: ['saint marc', 'saint-marc', 'senmak'], context: 'Saint-Marc, Artibonite, Haïti' },
  { keys: ['jacmel', 'jakmel'], context: 'Jacmel, Sud-Est, Haïti' },
  { keys: ['les cayes', 'okay'], context: 'Les Cayes, Sud, Haïti' },
]

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function findContext(value: string) {
  const normalized = normalize(value)
  return locations.find(item => item.keys.some(key => normalized.includes(normalize(key))))?.context ?? ''
}

export default function PassengerTypedAddressPreview() {
  useEffect(() => {
    let host: HTMLDivElement | null = null
    let cleanupTimer: number | null = null

    const removeHost = () => {
      host?.remove()
      host = null
    }

    const renderPreview = (input: HTMLInputElement) => {
      const value = input.value.trim()
      const context = findContext(value)
      const routeCard = input.closest('.route-card') as HTMLElement | null
      if (!routeCard || value.length < 3 || !context) {
        removeHost()
        return
      }

      if (!host || !host.isConnected) {
        host = document.createElement('div')
        host.className = 'passenger-typed-address-preview'
        routeCard.insertAdjacentElement('afterend', host)
      }

      host.innerHTML = ''
      const pin = document.createElement('span')
      pin.className = 'passenger-typed-address-pin'
      pin.textContent = '📍'
      const copy = document.createElement('div')
      copy.className = 'passenger-typed-address-copy'
      const top = document.createElement('strong')
      top.textContent = context
      const bottom = document.createElement('small')
      bottom.textContent = value
      copy.append(top, bottom)
      host.append(pin, copy)

      if (cleanupTimer) window.clearTimeout(cleanupTimer)
      cleanupTimer = window.setTimeout(() => {
        const nativeResults = routeCard.parentElement?.querySelector('.search-results')
        if (nativeResults && nativeResults.querySelector('button')) removeHost()
      }, 1300)
    }

    const onInput = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLInputElement)) return
      if (!target.matches('.route-card input:not([readonly])')) return
      renderPreview(target)
    }

    const onFocus = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLInputElement)) return
      if (!target.matches('.route-card input:not([readonly])')) return
      renderPreview(target)
    }

    document.addEventListener('input', onInput, true)
    document.addEventListener('focusin', onFocus, true)

    return () => {
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('focusin', onFocus, true)
      if (cleanupTimer) window.clearTimeout(cleanupTimer)
      removeHost()
    }
  }, [])

  return <style>{`
    .passenger-typed-address-preview{
      margin:10px 0 4px;
      min-height:70px;
      padding:12px 14px;
      border:1px solid #dce8e3;
      border-radius:18px;
      background:#fff;
      display:flex;
      align-items:center;
      gap:12px;
      box-shadow:0 7px 20px rgba(16,32,51,.04);
    }
    .passenger-typed-address-pin{font-size:22px;flex:none}
    .passenger-typed-address-copy{min-width:0;display:grid;gap:4px;text-align:left}
    .passenger-typed-address-copy strong{font-size:14px;line-height:1.25;color:#17324b;font-weight:900}
    .passenger-typed-address-copy small{font-size:13px;line-height:1.25;color:#71817a;font-weight:750;white-space:normal;overflow-wrap:anywhere}
  `}</style>
}
