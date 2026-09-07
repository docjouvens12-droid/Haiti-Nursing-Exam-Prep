'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function DriverVehicleMenuPolish() {
  useEffect(() => {
    if (location.pathname !== '/driver/dashboard') return

    const cleanups: Array<() => void> = []

    const makeRow = (label: string, value: string) => {
      const row = document.createElement('p')
      const left = document.createElement('span')
      const right = document.createElement('b')
      left.textContent = `${label}: `
      right.textContent = value || '—'
      row.append(left, right)
      return row
    }

    const apply = async () => {
      const drawer = document.querySelector('.drawer') as HTMLElement | null
      if (!drawer || drawer.dataset.accordionPolished !== 'true') return
      if (drawer.dataset.vehiclePolished === 'true') return

      const sections = Array.from(drawer.querySelectorAll('.menuSection')) as HTMLElement[]
      const oldSection = sections.find((section) => {
        const text = (section.querySelector('h3')?.textContent || '').trim().toLowerCase()
        return text.includes('véhic') || text.includes('veyikil') || text === 'vehicle'
      })
      if (!oldSection) return
      drawer.dataset.vehiclePolished = 'true'

      const { data: auth } = await supabase.auth.getUser()
      const user = auth.user
      if (!user) return

      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('id,vehicle_type,make,model,color,year,plate_number,seats,document_path')
        .eq('driver_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      const lang = localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
      const section = document.createElement('div')
      section.className = 'menuSection'

      const title = document.createElement('h3')
      title.textContent = lang === 'ht' ? 'Veyikil' : 'Véhicule'
      const arrow = document.createElement('span')
      arrow.textContent = '›'
      arrow.setAttribute('aria-hidden', 'true')
      Object.assign(arrow.style, { marginLeft: 'auto', fontSize: '22px', lineHeight: '1', transition: 'transform .18s ease' })
      Object.assign(title.style, { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 0', marginBottom: '0', userSelect: 'none' })
      title.setAttribute('role', 'button')
      title.setAttribute('tabindex', '0')
      title.setAttribute('aria-expanded', 'false')
      title.appendChild(arrow)
      section.append(title)

      const rows: HTMLElement[] = []
      const addRow = (label: string, value: string) => {
        const row = makeRow(label, value)
        rows.push(row)
        section.append(row)
      }

      addRow(lang === 'ht' ? 'Kalite veyikil' : 'Type de véhicule', vehicle?.vehicle_type === 'moto' ? 'Moto' : vehicle ? (lang === 'ht' ? 'Machin' : 'Voiture') : '—')
      addRow(lang === 'ht' ? 'Mak' : 'Marque', vehicle?.make ?? '')
      addRow(lang === 'ht' ? 'Modèl' : 'Modèle', vehicle?.model ?? '')
      addRow(lang === 'ht' ? 'Koulè' : 'Couleur', vehicle?.color ?? '')
      addRow(lang === 'ht' ? 'Ane' : 'Année', vehicle?.year ? String(vehicle.year) : '')
      addRow(lang === 'ht' ? 'Plak' : 'Plaque', vehicle?.plate_number ?? '')
      addRow(lang === 'ht' ? 'Kantite plas' : 'Nombre de places', vehicle?.seats ? String(vehicle.seats) : '')

      const uploadRow = document.createElement('div')
      Object.assign(uploadRow.style, { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' })
      const uploadLabel = document.createElement('span')
      uploadLabel.textContent = `${lang === 'ht' ? 'Telechaje papye machin' : 'Téléverser les papiers du véhicule'}: `
      Object.assign(uploadLabel.style, { color: '#7a8998', fontSize: '13px' })

      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = 'image/*,application/pdf'
      fileInput.style.display = 'none'

      let documentPath = vehicle?.document_path ?? ''
      const uploadButton = document.createElement('button')
      uploadButton.type = 'button'
      uploadButton.textContent = documentPath
        ? (lang === 'ht' ? 'Ranplase' : 'Remplacer')
        : (lang === 'ht' ? 'Pran foto / Upload' : 'Photo / Fichier')
      Object.assign(uploadButton.style, {
        padding: '8px 11px', borderRadius: '10px', border: '1px solid #b8d8ce',
        background: '#eef8f4', color: '#0f6f59', fontWeight: '800', cursor: 'pointer'
      })

      const status = document.createElement('small')
      status.textContent = documentPath ? (lang === 'ht' ? '✓ Papye machin nan anrejistre' : '✓ Document enregistré') : ''
      Object.assign(status.style, { width: '100%', color: '#688074', fontSize: '11px' })

      const openPicker = () => fileInput.click()
      uploadButton.addEventListener('click', openPicker)
      cleanups.push(() => uploadButton.removeEventListener('click', openPicker))

      const onFile = async () => {
        const file = fileInput.files?.[0]
        if (!file || !vehicle) return

        uploadButton.disabled = true
        uploadButton.textContent = lang === 'ht' ? 'N ap voye…' : 'Envoi…'
        status.textContent = ''

        if (file.size > 10 * 1024 * 1024) {
          status.textContent = lang === 'ht' ? 'Fichye a depase 10 MB.' : 'Le fichier dépasse 10 Mo.'
          status.style.color = '#9a3030'
          uploadButton.disabled = false
          uploadButton.textContent = documentPath ? (lang === 'ht' ? 'Ranplase' : 'Remplacer') : (lang === 'ht' ? 'Pran foto / Upload' : 'Photo / Fichier')
          return
        }

        const mime = file.type || ''
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
        if (!allowed.includes(mime)) {
          status.textContent = lang === 'ht' ? 'Chwazi JPG/PNG/WEBP oswa PDF.' : 'Choisissez JPG/PNG/WEBP ou PDF.'
          status.style.color = '#9a3030'
          uploadButton.disabled = false
          uploadButton.textContent = documentPath ? (lang === 'ht' ? 'Ranplase' : 'Remplacer') : (lang === 'ht' ? 'Pran foto / Upload' : 'Photo / Fichier')
          return
        }

        const ext = mime === 'application/pdf' ? 'pdf' : mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'
        const path = `${user.id}/vehicle-document.${ext}`
        if (documentPath && documentPath !== path) await supabase.storage.from('driver-documents').remove([documentPath])

        const { error: uploadError } = await supabase.storage
          .from('driver-documents')
          .upload(path, file, { upsert: true, contentType: mime })

        if (uploadError) {
          status.textContent = uploadError.message
          status.style.color = '#9a3030'
          uploadButton.disabled = false
          uploadButton.textContent = documentPath ? (lang === 'ht' ? 'Ranplase' : 'Remplacer') : (lang === 'ht' ? 'Pran foto / Upload' : 'Photo / Fichier')
          return
        }

        const { error: saveError } = await supabase.from('vehicles').update({ document_path: path }).eq('id', vehicle.id)
        if (saveError) {
          status.textContent = saveError.message
          status.style.color = '#9a3030'
          uploadButton.disabled = false
          return
        }

        documentPath = path
        status.textContent = lang === 'ht' ? '✓ Papye machin nan anrejistre' : '✓ Document enregistré'
        status.style.color = '#0f6f59'
        uploadButton.textContent = lang === 'ht' ? 'Ranplase' : 'Remplacer'
        uploadButton.disabled = false
        fileInput.value = ''
      }

      fileInput.addEventListener('change', onFile)
      cleanups.push(() => fileInput.removeEventListener('change', onFile))
      uploadRow.append(uploadLabel, uploadButton, fileInput, status)
      rows.push(uploadRow)
      section.append(uploadRow)

      let open = false
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

      oldSection.replaceWith(section)
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
