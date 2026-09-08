'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function PassengerMenuPolish() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/' && pathname !== '/passenger/dashboard') return
    const styleId = 'passenger-menu-iphone-polish'
    document.getElementById(styleId)?.remove()

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .nav-drawer{box-sizing:border-box;overflow-x:hidden;background:#fff}
      .nav-drawer .drawer-user{border:0!important;box-shadow:none!important;background:transparent!important;padding:4px 0!important;justify-content:flex-start!important}
      .nav-drawer .drawer-user>div:last-child{display:none!important}
      .nav-drawer .drawer-nav>button{min-height:46px;transition:background .15s ease,transform .15s ease}
      .nav-drawer .drawer-nav>button:active{transform:scale(.99)}
      .nav-drawer .drawer-language{border-top:1px solid #e7ecef;border-radius:0;background:#fff;margin:2px 0;padding:12px 2px}
      .nav-drawer .drawer-logout{min-height:46px;margin-top:12px;border:0;background:#fff0f0;color:#9a3030}
      .passenger-profile-details{display:none;padding:4px 8px 12px 36px;border-bottom:1px solid #e7ecef}
      .passenger-profile-details.open{display:block}
      .passenger-profile-details p{display:flex;justify-content:space-between;gap:10px;margin:8px 0;font-size:12px}
      .passenger-profile-details span{color:#7a8998}
      .passenger-profile-details b{text-align:right;color:#102033;font-weight:750;overflow-wrap:anywhere}
      @media(max-width:600px){
        .nav-drawer{width:min(62vw,255px)!important;height:auto!important;min-height:0!important;max-height:calc(100dvh - 18px)!important;overflow-y:auto!important;border-bottom-right-radius:24px!important;padding:16px 14px 18px!important;box-shadow:20px 0 60px rgba(0,0,0,.20)}
        .nav-drawer .drawer-head{display:flex!important;justify-content:flex-end!important;padding:0 1px 8px!important;margin-bottom:4px!important;border-bottom:0!important}
        .nav-drawer .drawer-brand{display:none!important}
        .nav-drawer .drawer-head>button{width:36px;height:36px;border-radius:11px;font-size:21px;flex:0 0 auto}
        .nav-drawer .drawer-user{margin:0 0 8px!important}
        .nav-drawer .drawer-avatar{width:46px;height:46px;font-size:17px}
        .nav-drawer .drawer-nav{gap:2px}
        .nav-drawer .drawer-nav>button{grid-template-columns:25px minmax(0,1fr) 14px;min-height:42px;padding:9px 4px;border-radius:10px;font-size:12px;background:transparent}
        .nav-drawer .drawer-nav>button.active{background:#eaf6f2;color:#0f6f59}
        .nav-drawer .drawer-nav>button span{font-size:16px}
        .nav-drawer .drawer-nav>button b{font-size:15px}
        .nav-drawer .drawer-language{grid-template-columns:25px minmax(0,1fr);padding:11px 4px;margin:2px 0}
        .nav-drawer .drawer-language>span{font-size:16px}
        .nav-drawer .drawer-language small{font-size:9px;margin-bottom:4px}
        .nav-drawer .drawer-language .language-trigger{width:100%;text-align:left;box-shadow:none;padding:7px 8px;font-size:10px}
        .nav-drawer .drawer-language .language-options{min-width:145px}
        .nav-drawer .drawer-logout{padding:11px 12px;border-radius:12px;font-size:12px;margin-top:10px;width:100%}
      }
    `
    document.head.appendChild(style)

    let busy = false

    const cleanPassengerMenu = async () => {
      if (pathname !== '/passenger/dashboard' || busy) return
      const drawer = document.querySelector<HTMLElement>('.nav-drawer')
      const nav = drawer?.querySelector<HTMLElement>('.drawer-nav')
      if (!drawer || !nav) return

      nav.querySelectorAll<HTMLButtonElement>(':scope > button').forEach((button) => {
        const text = (button.textContent || '').toLowerCase()
        if (text.includes('accueil') || text.includes('akèy') || text.includes('devenir chauffeur') || text.includes('vin chofè')) button.remove()
      })

      const profileButton = Array.from(nav.querySelectorAll<HTMLButtonElement>(':scope > button')).find((button) => {
        const text = (button.textContent || '').toLowerCase()
        return text.includes('profil') || text.includes('pwofil')
      })
      if (!profileButton) return

      if (nav.firstElementChild !== profileButton) nav.insertBefore(profileButton, nav.firstElementChild)
      if (profileButton.dataset.passengerProfileReady === 'true') return
      profileButton.dataset.passengerProfileReady = 'true'

      busy = true
      const { data: auth } = await supabase.auth.getUser()
      const user = auth.user
      const { data: person } = user
        ? await supabase.from('profiles').select('full_name,phone').eq('id', user.id).maybeSingle()
        : { data: null }
      busy = false
      if (!profileButton.isConnected) return

      const lang = localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
      const meta = user?.user_metadata || {}
      const details = document.createElement('div')
      details.className = 'passenger-profile-details'
      details.dataset.passengerProfileDetails = 'true'

      const row = (label: string, value: string) => {
        const p = document.createElement('p')
        const s = document.createElement('span')
        const b = document.createElement('b')
        s.textContent = label
        b.textContent = value || '—'
        p.append(s, b)
        return p
      }

      details.append(
        row(lang === 'ht' ? 'Non' : 'Nom', person?.full_name ?? meta.full_name ?? ''),
        row(lang === 'ht' ? 'Dat nesans' : 'Date de naissance', meta.birth_date ?? meta.date_of_birth ?? ''),
        row(lang === 'ht' ? 'Sèks' : 'Sexe', meta.sex ?? meta.gender ?? ''),
        row(lang === 'ht' ? 'Tel' : 'Tél.', person?.phone ?? ''),
        row(lang === 'ht' ? 'Imèl' : 'E-mail', user?.email ?? ''),
      )
      profileButton.insertAdjacentElement('afterend', details)

      const arrow = profileButton.querySelector<HTMLElement>('b:last-child')
      const toggleProfile = (event: Event) => {
        event.preventDefault()
        event.stopPropagation()
        const open = details.classList.toggle('open')
        if (arrow) arrow.style.transform = open ? 'rotate(90deg)' : 'rotate(0deg)'
      }
      profileButton.addEventListener('click', toggleProfile, true)
    }

    void cleanPassengerMenu()
    const observer = new MutationObserver(() => { void cleanPassengerMenu() })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      document.getElementById(styleId)?.remove()
    }
  }, [pathname])

  return null
}
