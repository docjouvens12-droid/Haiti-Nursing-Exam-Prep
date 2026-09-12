'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

type DriverStatus = '' | 'pending' | 'approved' | 'suspended' | 'rejected' | 'cancelled'

export default function DriverCleanApplicationRestore(){
  useEffect(()=>{
    if(!window.location.pathname.startsWith('/driver/dashboard-v2')) return

    let busy=false
    let currentStatus:DriverStatus=''
    const isHt=()=>localStorage.getItem('taxi-language')==='ht'

    const findPanel=()=>{
      const rows=Array.from(document.querySelectorAll<HTMLButtonElement>('.dcm-row'))
      const row=rows.find(el=>{
        const t=(el.textContent||'').toLowerCase()
        return t.includes('demande devenir chauffeur')||t.includes('demand devni chofè')
      })
      const panel=row?.nextElementSibling as HTMLElement|null
      return panel?.classList.contains('dcm-panel') ? panel : null
    }

    const buttonLabel=(status:DriverStatus)=>{
      const ht=isHt()
      if(status==='pending') return ht?'Demand lan an attente':'Demande en attente'
      if(status==='approved') return ht?'Chofè apwouve':'Chauffeur approuvé'
      if(status==='suspended') return ht?'Kont chofè sispann':'Compte chauffeur suspendu'
      if(busy) return ht?'N ap voye…':'Envoi…'
      return ht?'Voye demand lan':'Envoyer la demande'
    }

    const render=(message?:string)=>{
      const panel=findPanel()
      if(!panel) return
      const old=panel.querySelector<HTMLElement>(':scope > .dcm-note')
      if(old) old.style.display='none'
      let wrap=panel.querySelector<HTMLElement>('[data-clean-driver-application="true"]')
      if(!wrap){
        wrap=document.createElement('div')
        wrap.dataset.cleanDriverApplication='true'
        panel.appendChild(wrap)
      }
      wrap.innerHTML=''
      const ht=isHt()
      const intro=document.createElement('div')
      intro.className='dcm-note'
      intro.style.display='block'
      intro.textContent=currentStatus==='approved'
        ? (ht?'Kont chofè sa a deja apwouve.':'Ce compte chauffeur est déjà approuvé.')
        : currentStatus==='pending'
          ? (ht?'Demand ou an attente verifikasyon administrasyon an.':'Votre demande est en attente de vérification par l’administration.')
          : (ht?'Ranpli Pwofil ak Veyikil, epi voye demand ou pou vin chofè.':'Complétez Profil et Véhicule, puis envoyez votre demande pour devenir chauffeur.')
      wrap.appendChild(intro)

      const btn=document.createElement('button')
      btn.type='button'
      btn.className='dcm-primary'
      btn.textContent=buttonLabel(currentStatus)
      const locked=currentStatus==='pending'||currentStatus==='approved'||currentStatus==='suspended'
      btn.disabled=busy||locked
      if(locked){btn.style.opacity='.65';btn.style.cursor='default'}
      btn.onclick=()=>void submit()
      wrap.appendChild(btn)

      if(message){
        const m=document.createElement('div')
        m.className='dcm-status'
        m.style.marginTop='8px'
        m.style.lineHeight='1.4'
        m.textContent=message
        wrap.appendChild(m)
      }
    }

    const loadStatus=async()=>{
      const {data:auth}=await supabase.auth.getUser()
      const user=auth.user
      if(!user) return
      const {data}=await supabase.from('driver_profiles').select('status').eq('user_id',user.id).maybeSingle()
      currentStatus=(data?.status||'') as DriverStatus
      render()
    }

    const submit=async()=>{
      if(busy) return
      const ht=isHt()
      busy=true
      render('')
      const {data:auth}=await supabase.auth.getUser()
      const user=auth.user
      if(!user){busy=false;render(ht?'Ou dwe konekte anvan.':'Vous devez être connecté.');return}

      const metadata=user.user_metadata||{}
      const [{data:person},{data:driver},{data:vehicle}]=await Promise.all([
        supabase.from('profiles').select('full_name,phone').eq('id',user.id).maybeSingle(),
        supabase.from('driver_profiles').select('status,license_number,national_id_number').eq('user_id',user.id).maybeSingle(),
        supabase.from('vehicles').select('vehicle_type,make,model,color,year,plate_number,seats').eq('driver_id',user.id).order('created_at',{ascending:true}).limit(1).maybeSingle(),
      ])

      const fullName=String(person?.full_name||metadata.full_name||'').trim()
      const birthDate=String(metadata.birth_date||metadata.date_of_birth||'').trim()
      const gender=String(metadata.gender||metadata.sex||'').trim()
      const address=String(metadata.address||metadata.driver_address||'').trim()
      const maritalStatus=String(metadata.marital_status||'').trim()
      const phone=String(person?.phone||metadata.phone||'').trim()
      const license=String(driver?.license_number||'').trim()
      const nationalId=String(driver?.national_id_number||'').trim()
      const vehicleType=String(vehicle?.vehicle_type||'').trim()
      const make=String(vehicle?.make||'').trim()
      const model=String(vehicle?.model||'').trim()
      const color=String(vehicle?.color||'').trim()
      const year=vehicle?.year?Number(vehicle.year):0
      const plate=String(vehicle?.plate_number||'').trim()
      const seats=vehicle?.seats?Number(vehicle.seats):0

      if(!fullName||!birthDate||!gender||!address||!phone||!license||!nationalId||!vehicleType||!make||!model||!color||!year||!plate||!seats){
        busy=false
        render(ht?'Tanpri ranpli tout chan obligatwa nan Pwofil ak tout chan Veyikil yo. Eta sivil ak imèl opsyonèl.':'Veuillez compléter tous les champs obligatoires du Profil et tous les champs du Véhicule. L’état civil et l’e-mail sont facultatifs.')
        return
      }

      const normalizedType=vehicleType==='moto'?'moto':'car'
      const {error}=await supabase.rpc('submit_driver_application_with_profile',{
        p_full_name:fullName,p_birth_date:birthDate,p_gender:gender,p_address:address,p_marital_status:maritalStatus,p_phone:phone,p_email:user.email||'',p_license_number:license,p_national_id_number:nationalId,p_vehicle_type:normalizedType,p_vehicle_make:make,p_vehicle_model:model,p_vehicle_color:color,p_vehicle_year:year,p_plate_number:plate,p_seats:seats,
      })
      busy=false
      if(error){render(error.message);return}
      currentStatus='pending'
      render(ht?'Demand lan voye avèk siksè. Li an attente verifikasyon.':'Demande envoyée avec succès. Elle est en attente de vérification.')
    }

    const onClick=(event:MouseEvent)=>{
      const target=event.target as Element|null
      if(!target?.closest('.dcm-row')) return
      window.setTimeout(()=>{render();void loadStatus()},30)
    }

    document.addEventListener('click',onClick,false)
    void loadStatus()
    return()=>document.removeEventListener('click',onClick,false)
  },[])
  return null
}
