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
      const drawer = document.querySelector('.nav-drawer') as HTMLElement | null
      if (!drawer) return

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
        user.classList.add('avatar-only-user')
        const details = user.querySelector(':scope > div:last-child') as HTMLElement | null
        if (details) details.style.display = 'none'
      }

      const nav = drawer.querySelector('.drawer-nav') as HTMLElement | null
      if (nav) {
        const navButtons = Array.from(nav.querySelectorAll<HTMLButtonElement>(':scope > button'))
        const becomeDriverButton = navButtons.find((button) => {
          const text = (button.textContent || '').toLowerCase()
          return text.includes('devenir chauffeur') || text.includes('vin chofè') || text.includes('vin chofe')
        })
        if (becomeDriverButton) becomeDriverButton.remove()

        const helpButton = Array.from(nav.querySelectorAll<HTMLButtonElement>(':scope > button')).find((button) => {
          const text = (button.textContent || '').toLowerCase().trim()
          return text.includes('aide') || text.includes('èd')
        })
        const languageBlock = nav.querySelector(':scope > .drawer-language') as HTMLElement | null
        if (helpButton && languageBlock && languageBlock.nextElementSibling !== helpButton) {
          languageBlock.insertAdjacentElement('afterend', helpButton)
        }
      }

      const circle = drawer.querySelector('.drawer-avatar') as HTMLElement | null
      if (circle) {
        circle.classList.add('passenger-photo-avatar')
        circle.setAttribute('role', 'button')
        circle.setAttribute('aria-label', 'Ajouter une photo de profil')
        circle.setAttribute('title', 'Ajouter une photo')
        circle.onclick = () => inputRef.current?.click()
        if (avatar) {
          circle.innerHTML = ''
          const img = document.createElement('img')
          img.src = avatar
          img.alt = 'Photo de profil'
          circle.appendChild(img)
        }
      }
    }

    decorate()
    const observer = new MutationObserver(decorate)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
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

  return <input ref={inputRef} type="file" accept="image/*" onChange={onPick} style={{ display: 'none' }} />
}
