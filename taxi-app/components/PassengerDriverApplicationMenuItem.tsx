'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

type DriverStatus = 'pending' | 'approved' | 'suspended' | 'rejected' | 'cancelled' | null

type ProfileInfo = {
  fullName: string
  birthDate: string
  gender: string
  maritalStatus: string
  address: string
  phone: string
  email: string
  license: string
  nationalId: string
}

type VehicleInfo = {
  vehicleType: string
  make: string
  model: string
  color: string
  year: string
  plate: string
  seats: string
}

const emptyProfile: ProfileInfo = { fullName: '', birthDate: '', gender: '', maritalStatus: '', address: '', phone: '', email: '', license: '', nationalId: '' }
const emptyVehicle: VehicleInfo = { vehicleType: '', make: '', model: '', color: '', year: '', plate: '', seats: '' }

export default function PassengerDriverApplicationMenuItem() {
  const [target, setTarget] = useState<Element | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState<DriverStatus>(null)
  const [profile, setProfile] = useState<ProfileInfo>(emptyProfile)
  const [vehicle, setVehicle] = useState<VehicleInfo>(emptyVehicle)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [lang, setLang] = useState<'fr' | 'ht'>('fr')

  useEffect(() => {
    const sync = () => {
      const drawer = document.querySelector('.nav-drawer')
      const nav = drawer?.querySelector('.drawer-nav') as HTMLElement | null
      if (!drawer || !nav) { setTarget(null); return }

      const currentLang = localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr'
      setLang(currentLang)

      let row = nav.querySelector('.passenger-driver-application-row') as HTMLButtonElement | null
      if (!row) {
        row = document.createElement('button')
        row.type = 'button'
        row.className = 'passenger-driver-application-row'
        const profileButton = Array.from(nav.querySelectorAll<HTMLButtonElement>(':scope > button')).find((button) => {
          const text = (button.textContent || '').toLowerCase()
          return text.includes('profil') || text.includes('pwofil')
        })
        if (profileButton) profileButton.insertAdjacentElement('afterend', row)
        else nav.appendChild(row)
      }

      row.innerHTML = `<span>🚗</span><span>${currentLang === 'ht' ? 'Demand devni chofè' : 'Demande devenir chauffeur'}</span><b>›</b>`
      row.onclick = (event) => {
        event.preventDefault()
        event.stopPropagation()
        setExpanded((value) => !value)
        setMessage('')
      }

      let mount = drawer.querySelector('.passenger-driver-application-target') as HTMLElement | null
      if (!mount) {
        mount = document.createElement('div')
        mount.className = 'passenger-driver-application-target'
        row.insertAdjacentElement('afterend', mount)
      }
      setTarget(mount)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!target || !expanded) return
    void loadApplicationData()
  }, [target, expanded])

  async function loadApplicationData() {
    const { data: auth } = await supabase.auth.getUser()
    const user = auth.user
    if (!user) return

    const metadata = user.user_metadata || {}
    const [{ data: person }, { data: driver }, { data: vehicleRow }] = await Promise.all([
      supabase.from('profiles').select('full_name,phone').eq('id', user.id).maybeSingle(),
      supabase.from('driver_profiles').select('status,license_number,national_id_number').eq('user_id', user.id).maybeSingle(),
      supabase.from('vehicles').select('vehicle_type,make,model,color,year,plate_number,seats').eq('driver_id', user.id).order('created_at', { ascending: true }).limit(1).maybeSingle(),
    ])

    setStatus((driver?.status as DriverStatus) || null)
    setProfile({
      fullName: String(person?.full_name || metadata.full_name || ''),
      birthDate: String(metadata.birth_date || metadata.date_of_birth || ''),
      gender: String(metadata.gender || metadata.sex || ''),
      maritalStatus: String(metadata.marital_status || ''),
      address: String(metadata.address || metadata.driver_address || ''),
      phone: String(person?.phone || metadata.phone || ''),
      email: user.email || '',
      license: String(driver?.license_number || ''),
      nationalId: String(driver?.national_id_number || ''),
    })

    setVehicle({
      vehicleType: String(vehicleRow?.vehicle_type || ''),
      make: String(vehicleRow?.make || ''),
      model: String(vehicleRow?.model || ''),
      color: String(vehicleRow?.color || ''),
      year: vehicleRow?.year ? String(vehicleRow.year) : '',
      plate: String(vehicleRow?.plate_number || ''),
      seats: vehicleRow?.seats ? String(vehicleRow.seats) : '',
    })
  }

  async function cancelApplication() {
    if (status !== 'pending' || busy) return
    const ht = lang === 'ht'
    const confirmed = window.confirm(ht ? 'Anile demann pou vin chofè a?' : 'Annuler votre demande pour devenir chauffeur ?')
    if (!confirmed) return
    setBusy(true)
    setMessage('')
    const { error } = await supabase.rpc('cancel_driver_application')
    setBusy(false)
    if (error) { setMessage(error.message); return }
    setStatus('cancelled')
    setMessage(ht ? 'Demann lan anile ✓' : 'Demande annulée ✓')
  }

  if (!target || !expanded) return null

  const ht = lang === 'ht'
  const statusText = status === 'pending'
    ? (ht ? 'Demann lan an attente' : 'Demande en attente')
    : status === 'approved'
      ? (ht ? 'Chofè apwouve ✓' : 'Chauffeur approuvé ✓')
      : status === 'suspended'
        ? (ht ? 'Kont chofè sispann' : 'Compte chauffeur suspendu')
        : status === 'rejected'
          ? (ht ? 'Demann lan refize' : 'Demande refusée')
          : status === 'cancelled'
            ? (ht ? 'Demann lan anile' : 'Demande annulée')
            : (ht ? 'Ou poko voye yon demann.' : 'Vous n’avez pas encore envoyé de demande.')

  const genderLabel = profile.gender === 'homme' ? (ht ? 'Gason' : 'Homme') : profile.gender === 'femme' ? (ht ? 'Fanm' : 'Femme') : (profile.gender || '—')
  const vehicleTypeLabel = vehicle.vehicleType === 'moto' ? 'Moto' : vehicle.vehicleType === 'car' ? (ht ? 'Machin' : 'Voiture') : '—'

  return createPortal(
    <section className="drawer-profile-inline">
      <div className="drawer-profile-inline-head">
        <strong>{ht ? 'Demand devni chofè' : 'Demande devenir chauffeur'}</strong>
        <button type="button" onClick={() => setExpanded(false)}>{ht ? 'Fèmen' : 'Fermer'}</button>
      </div>

      <div className="drawer-profile-saved">
        {message && <div className="drawer-profile-message success">{message}</div>}
        <div><span>{ht ? 'Estati demann' : 'Statut de la demande'}</span><strong>{statusText}</strong></div>

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5eaee' }}>
          <strong style={{ display: 'block', marginBottom: 10 }}>{ht ? 'Enfòmasyon pwofil' : 'Informations du profil'}</strong>
          <div><span>{ht ? 'Non' : 'Nom'}</span><strong>{profile.fullName || '—'}</strong></div>
          <div><span>{ht ? 'Dat nesans' : 'Date de naissance'}</span><strong>{profile.birthDate || '—'}</strong></div>
          <div><span>{ht ? 'Sèks' : 'Sexe'}</span><strong>{genderLabel}</strong></div>
          <div><span>{ht ? 'Eta sivil' : 'État civil'}</span><strong>{profile.maritalStatus || '—'}</strong></div>
          <div><span>{ht ? 'Adrès' : 'Adresse'}</span><strong>{profile.address || '—'}</strong></div>
          <div><span>{ht ? 'Telefòn' : 'Téléphone'}</span><strong>{profile.phone || '—'}</strong></div>
          <div><span>{ht ? 'Imèl' : 'E-mail'}</span><strong>{profile.email || '—'}</strong></div>
          <div><span>{ht ? 'Nimewo lisans' : 'Numéro de permis'}</span><strong>{profile.license || '—'}</strong></div>
          <div><span>{ht ? 'Nimewo idantifikasyon' : 'Numéro d’identification'}</span><strong>{profile.nationalId || '—'}</strong></div>
        </div>

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5eaee' }}>
          <strong style={{ display: 'block', marginBottom: 10 }}>{ht ? 'Enfòmasyon veyikil' : 'Informations du véhicule'}</strong>
          <div><span>{ht ? 'Kalite' : 'Type'}</span><strong>{vehicleTypeLabel}</strong></div>
          <div><span>{ht ? 'Mak' : 'Marque'}</span><strong>{vehicle.make || '—'}</strong></div>
          <div><span>{ht ? 'Modèl' : 'Modèle'}</span><strong>{vehicle.model || '—'}</strong></div>
          <div><span>{ht ? 'Koulè' : 'Couleur'}</span><strong>{vehicle.color || '—'}</strong></div>
          <div><span>{ht ? 'Ane' : 'Année'}</span><strong>{vehicle.year || '—'}</strong></div>
          <div><span>{ht ? 'Plak' : 'Plaque'}</span><strong>{vehicle.plate || '—'}</strong></div>
          <div><span>{ht ? 'Kantite plas' : 'Nombre de places'}</span><strong>{vehicle.seats || '—'}</strong></div>
        </div>

        {status === 'pending' ? (
          <button type="button" className="drawer-profile-edit" onClick={() => void cancelApplication()} disabled={busy} style={{ marginTop: 12, background: '#fff0f0', color: '#a83232' }}>
            {busy ? (ht ? 'Ap anile…' : 'Annulation…') : (ht ? 'Anile demann lan' : 'Annuler la demande')}
          </button>
        ) : status !== 'approved' && status !== 'suspended' ? (
          <button type="button" className="drawer-profile-edit" onClick={() => { window.location.href = '/driver' }} style={{ marginTop: 12 }}>
            {ht ? 'Ranpli / modifye epi voye demann lan' : 'Compléter / modifier et envoyer la demande'}
          </button>
        ) : null}
      </div>
    </section>,
    target,
  )
}
