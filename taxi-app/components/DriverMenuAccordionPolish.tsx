'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function DriverMenuAccordionPolish() {
  useEffect(() => {
    if (location.pathname !== '/driver/dashboard') return

    const cleanups: Array<() => void> = []

    const makeRow = (label: string, value: string) => {
      const row = document.createElement('p')
      const left = document.createElement('span')
      const right = document.createElement('b')
      left.textContent = label
      right.textContent = value || '—'
      row.append(left, right)
      return row
    }

    const apply = async () => {
      const drawer = document.querySelector('.drawer') as HTMLElement | null
      if (!drawer || drawer.dataset.accordionPolished === 'true') return
      drawer.dataset.accordionPolished = 'true'

      const head = drawer.querySelector('.drawerHead') as HTMLElement | null
      const headTitle = head?.querySelector('strong') as HTMLElement | null
      if (headTitle) headTitle.style.display = 'none'
      if (head) head.style.justifyContent = 'flex-end'

      // Keep only the avatar/photo in the compact profile area.
      const profile = drawer.querySelector('.profileBlock') as HTMLElement | null
      const profileText = profile?.querySelector('div:last-child') as HTMLElement | null
      const visibleName = profileText?.querySelector('strong')?.textContent?.trim() || ''
      if (profileText) profileText.style.display = 'none'
      if (profile) profile.style.justifyContent = 'center'

      const { data: auth } = await supabase.auth.getUser()
      const user = auth.user
      let licenseNumber = ''
      let fullName = visibleName
      let phone = ''
      let email = user?.email ?? ''
      let birthDate = ''
      let sex = ''
      let licenseUrl = ''

      if (user) {
        const [{ data: driver }, { data: person }] = await Promise.all([
          supabase.from('driver_profiles').select('license_number').eq('user_id', user.id).maybeSingle(),
          supabase.from('profiles').select('full_name,phone').eq('id', user.id).maybeSingle(),
        ])
        licenseNumber = driver?.license_number ?? ''
        fullName = person?.full_name ?? fullName
        phone = person?.phone ?? ''
        const meta = user.user_metadata || {}
        birthDate = meta.birth_date || meta.date_of_birth || ''
        sex = meta.sex || meta.gender || ''
        licenseUrl = meta.driver_license_url || meta.license_document_url || ''
      }

      const lang = localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
      const sections = Array.from(drawer.querySelectorAll('.menuSection')) as HTMLElement[]
      for (const section of sections) {
        const title = section.querySelector('h3') as HTMLElement | null
        if (!title) continue
        const label = (title.textContent || '').trim().toLowerCase()
        const isPersonal = label.includes('person') || label.includes('pèson')
        const isVehicle = label.includes('véhic') || label.includes('veyikil') || label === 'vehicle'
        if (!isPersonal && !isVehicle) continue

        if (isPersonal) {
          Array.from(section.children).forEach((child) => { if (child !== title) child.remove() })
          section.append(
            makeRow(lang === 'ht' ? 'Non' : 'Nom', fullName),
            makeRow(lang === 'ht' ? 'Dat nesans' : 'Date de naissance', birthDate),
            makeRow(lang === 'ht' ? 'Sèks' : 'Sexe', sex),
            makeRow(lang === 'ht' ? 'Nimewo lisans' : 'N° de permis', licenseNumber),
            makeRow(lang === 'ht' ? 'Tel' : 'Tél.', phone),
            makeRow(lang === 'ht' ? 'Imèl' : 'E-mail', email),
          )

          const download = document.createElement(licenseUrl ? 'a' : 'button')
          download.textContent = lang === 'ht' ? '⬇ Download lisans' : '⬇ Télécharger le permis'
          download.className = 'driverLicenseDownload'
          if (licenseUrl && download instanceof HTMLAnchorElement) {
            download.href = licenseUrl
            download.target = '_blank'
            download.rel = 'noopener noreferrer'
            download.download = ''
          } else if (download instanceof HTMLButtonElement) {
            download.type = 'button'
            download.disabled = true
            download.title = lang === 'ht' ? 'Dokiman lisans lan poko disponib' : 'Document du permis non disponible'
          }
          Object.assign((download as HTMLElement).style, {
            width: '100%', marginTop: '10px', padding: '11px 12px', borderRadius: '12px',
            border: '1px solid #dce4eb', background: licenseUrl ? '#eef8f4' : '#f4f6f8',
            color: licenseUrl ? '#0f6f59' : '#8a96a3', fontWeight: '800', textAlign: 'center',
            textDecoration: 'none', boxSizing: 'border-box', display: 'block'
          })
          section.append(download)
        }

        const rows = Array.from(section.children).filter((el) => el !== title) as HTMLElement[]
        let open = false
        const arrow = document.createElement('span')
        arrow.textContent = '›'
        arrow.setAttribute('aria-hidden', 'true')
        Object.assign(arrow.style, { marginLeft: 'auto', fontSize: '22px', lineHeight: '1', transition: 'transform .18s ease' })
        Object.assign(title.style, { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 0', marginBottom: '0', userSelect: 'none' })
        title.setAttribute('role', 'button')
        title.setAttribute('tabindex', '0')
        title.setAttribute('aria-expanded', 'false')
        title.appendChild(arrow)

        const setOpen = (next: boolean) => {
          open = next
          rows.forEach((row) => { row.style.display = next ? '' : 'none' })
          arrow.style.transform = next ? 'rotate(90deg)' : 'rotate(0deg)'
          title.setAttribute('aria-expanded', String(next))
          section.style.paddingBottom = next ? '16px' : '12px'
        }
        const toggle = () => setOpen(!open)
        const keyToggle = (e: Event) => {
          const ke = e as KeyboardEvent
          if (ke.key === 'Enter' || ke.key === ' ') { e.preventDefault(); toggle() }
        }
        title.addEventListener('click', toggle)
        title.addEventListener('keydown', keyToggle)
        cleanups.push(() => {
          title.removeEventListener('click', toggle)
          title.removeEventListener('keydown', keyToggle)
        })
        setOpen(false)
      }
    }

    void apply()
    const observer = new MutationObserver(() => { void apply() })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      cleanups.forEach((fn) => fn())
    }
  }, [])

  return null
}
