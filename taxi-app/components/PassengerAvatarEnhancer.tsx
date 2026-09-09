'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const size = 180
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('canvas'))
        const scale = Math.max(size / img.width, size / img.height)
        const w = img.width * scale
        const h = img.height * scale
        const x = (size - w) / 2
        const y = (size - h) / 2
        ctx.drawImage(img, x, y, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      }
      img.onerror = reject
      img.src = String(reader.result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function PassengerAvatarEnhancer() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [avatar, setAvatar] = useState('')

  useEffect(() => {
    let mounted = true
    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      const saved = String(data.user?.user_metadata?.avatar_data_url ?? '')
      setAvatar(saved)
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const decorate = () => {
      if (window.location.pathname !== '/passenger/dashboard') return
      const drawer = document.querySelector('.nav-drawer') as HTMLElement | null
      if (!drawer) return

      const ht = localStorage.getItem('taxi-language') === 'ht'
      const brand = drawer.querySelector('.drawer-brand') as HTMLElement | null
      if (brand) brand.style.display = 'none'

      const head = drawer.querySelector('.drawer-head') as HTMLElement | null
      if (head) {
        head.style.justifyContent = 'flex-end'
        head.style.borderBottom = '0'
        head.style.paddingBottom = '2px'
      }

      const user = drawer.querySelector('.drawer-user') as HTMLElement | null
      if (user) {
        user.classList.add('passenger-premium-user')
        const details = user.querySelector(':scope > div:last-child') as HTMLElement | null
        if (details) {
          details.style.display = 'flex'
          details.classList.add('passenger-premium-user-details')
          const name = details.querySelector('strong') as HTMLElement | null
          const email = details.querySelector('small') as HTMLElement | null
          if (name) name.classList.add('passenger-premium-name')
          if (email) email.classList.add('passenger-premium-email')

          let accountLabel = details.querySelector('.passenger-account-label') as HTMLElement | null
          if (!accountLabel) {
            accountLabel = document.createElement('span')
            accountLabel.className = 'passenger-account-label'
            if (name) name.insertAdjacentElement('afterend', accountLabel)
            else details.prepend(accountLabel)
          }
          accountLabel.textContent = ht ? 'Kont pasaje' : 'Compte passager'

          let status = details.querySelector('.passenger-account-status') as HTMLElement | null
          if (!status) {
            status = document.createElement('span')
            status.className = 'passenger-account-status'
            details.appendChild(status)
          }
          status.innerHTML = `<i></i>${ht ? 'Aktif' : 'Actif'}`
        }
      }

      const nav = drawer.querySelector('.drawer-nav') as HTMLElement | null
      if (nav) {
        const buttons = Array.from(nav.querySelectorAll<HTMLButtonElement>(':scope > button'))
        const byText = (terms: string[]) => buttons.find((button) => {
          const text = (button.textContent || '').toLowerCase()
          return terms.some((term) => text.includes(term))
        }) || null

        const homeButton = byText(['accueil', 'akèy'])
        if (homeButton) homeButton.style.setProperty('display', 'none', 'important')

        const becomeDriverButton = byText(['devenir chauffeur', 'vin chofè', 'vin chofe'])
        if (becomeDriverButton) becomeDriverButton.style.setProperty('display', 'none', 'important')

        const profileButton = byText(['profil', 'pwofil'])
        const tripsButton = byText(['mes trajets', 'trajè mwen yo'])
        const paymentButton = byText(['paiement', 'peman'])
        const helpButton = byText(['aide', 'èd'])
        const languageBlock = nav.querySelector(':scope > .drawer-language') as HTMLElement | null
        const profileTarget = nav.querySelector(':scope > .drawer-profile-inline-target') as HTMLElement | null
        const tripsTarget = nav.querySelector(':scope > .drawer-trips-inline-target') as HTMLElement | null

        if (profileButton) profileButton.style.order = '10'
        if (profileTarget) profileTarget.style.order = '11'
        if (tripsButton) tripsButton.style.order = '20'
        if (tripsTarget) tripsTarget.style.order = '21'
        if (paymentButton) paymentButton.style.order = '30'
        if (languageBlock) languageBlock.style.order = '40'
        if (helpButton) helpButton.style.order = '50'
      }

      const circle = drawer.querySelector('.drawer-avatar') as HTMLElement | null
      if (circle) {
        circle.classList.add('passenger-photo-avatar')
        circle.setAttribute('role', 'button')
        circle.setAttribute('aria-label', ht ? 'Ajoute oswa chanje foto pwofil' : 'Ajouter ou changer la photo de profil')
        circle.setAttribute('title', ht ? 'Chanje foto' : 'Changer la photo')
        circle.onclick = () => inputRef.current?.click()
        if (avatar) {
          circle.innerHTML = ''
          const img = document.createElement('img')
          img.src = avatar
          img.alt = ht ? 'Foto pwofil' : 'Photo de profil'
          circle.appendChild(img)
        }
        if (!circle.querySelector('.passenger-avatar-camera')) {
          const camera = document.createElement('span')
          camera.className = 'passenger-avatar-camera'
          camera.textContent = '📷'
          circle.appendChild(camera)
        }
      }
    }

    decorate()
    const observer = new MutationObserver(decorate)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('storage', decorate)
    return () => {
      observer.disconnect()
      window.removeEventListener('storage', decorate)
    }
  }, [avatar])

  async function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    try {
      const dataUrl = await resizeImage(file)
      setAvatar(dataUrl)
      await supabase.auth.updateUser({ data: { avatar_data_url: dataUrl } })
    } finally {
      event.target.value = ''
    }
  }

  return <>
    <input ref={inputRef} type="file" accept="image/*" onChange={onPick} style={{ display: 'none' }} />
    <style>{`
      .nav-drawer .drawer-user.passenger-premium-user{
        display:flex!important;
        flex-direction:column!important;
        align-items:center!important;
        justify-content:center!important;
        gap:9px!important;
        margin:6px 2px 14px!important;
        padding:14px 12px 15px!important;
        border:1px solid #e2ebe7!important;
        border-radius:20px!important;
        background:linear-gradient(180deg,#ffffff 0%,#f5faf8 100%)!important;
        box-shadow:0 8px 24px rgba(16,32,51,.06)!important;
        text-align:center!important;
      }
      .nav-drawer .drawer-avatar.passenger-photo-avatar{
        position:relative!important;
        width:76px!important;
        height:76px!important;
        min-width:76px!important;
        border-radius:24px!important;
        display:grid!important;
        place-items:center!important;
        overflow:visible!important;
        background:#0f705a!important;
        color:#fff!important;
        font-size:27px!important;
        font-weight:900!important;
        border:4px solid #fff!important;
        box-shadow:0 8px 22px rgba(15,112,90,.2)!important;
        cursor:pointer!important;
      }
      .nav-drawer .drawer-avatar.passenger-photo-avatar img{
        width:100%!important;height:100%!important;object-fit:cover!important;border-radius:20px!important;display:block!important;
      }
      .nav-drawer .passenger-avatar-camera{
        position:absolute!important;right:-6px!important;bottom:-5px!important;
        width:27px!important;height:27px!important;border-radius:10px!important;
        display:grid!important;place-items:center!important;background:#fff!important;border:1px solid #dce7e2!important;
        box-shadow:0 5px 12px rgba(16,32,51,.14)!important;font-size:12px!important;
      }
      .nav-drawer .passenger-premium-user-details{
        display:flex!important;flex-direction:column!important;align-items:center!important;min-width:0!important;width:100%!important;
      }
      .nav-drawer .passenger-premium-name{font-size:16px!important;line-height:1.2!important;color:#102033!important;font-weight:900!important}
      .nav-drawer .passenger-account-label{margin-top:3px!important;font-size:10px!important;color:#6e8079!important;font-weight:750!important}
      .nav-drawer .passenger-premium-email{display:block!important;max-width:220px!important;margin-top:4px!important;font-size:9px!important;color:#87958f!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      .nav-drawer .passenger-account-status{
        display:inline-flex!important;align-items:center!important;gap:5px!important;margin-top:8px!important;padding:5px 9px!important;
        border-radius:999px!important;background:#eaf5f1!important;color:#0f705a!important;font-size:9px!important;font-weight:850!important;
      }
      .nav-drawer .passenger-account-status i{width:7px!important;height:7px!important;border-radius:50%!important;background:#58ad98!important;display:block!important}
    `}</style>
  </>
}
