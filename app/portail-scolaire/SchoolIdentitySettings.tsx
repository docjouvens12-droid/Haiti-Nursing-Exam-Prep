'use client'

import {useEffect,useState} from 'react'
import {createPortal} from 'react-dom'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Settings={school_name:string;address:string;phone:string;email:string;logo_url:string}

export default function SchoolIdentitySettings(){
 const [target,setTarget]=useState<HTMLElement|null>(null)
 const [lang,setLang]=useState<'ht'|'fr'>('ht')
 const [open,setOpen]=useState(false)
 const [settings,setSettings]=useState<Settings>({school_name:'Portail Scolaire Haïti',address:'',phone:'',email:'',logo_url:''})
 const [message,setMessage]=useState('')
 const [saving,setSaving]=useState(false)
 const ht=lang==='ht'

 const load=async()=>{
  const {data:{session}}=await supabase.auth.getSession();const user=session?.user;if(!user)return
  const {data:p}=await supabase.from('school_profiles').select('role').eq('user_id',user.id).maybeSingle()
  if(p?.role!=='direction'){setTarget(null);return}
  const {data:s}=await supabase.from('school_settings').select('school_name,address,phone,email,logo_url').eq('id',1).maybeSingle()
  if(s)setSettings({school_name:s.school_name||'',address:s.address||'',phone:s.phone||'',email:s.email||'',logo_url:s.logo_url||''})
 }

 useEffect(()=>{load();const {data:l}=supabase.auth.onAuthStateChange(()=>load());return()=>l.subscription.unsubscribe()},[])

 useEffect(()=>{
  const attach=()=>{
   const quickHeading=Array.from(document.querySelectorAll('.card h3')).find(h=>['Aksyon rapid','Actions rapides'].includes((h.textContent||'').trim()))
   const menu=quickHeading?.closest('.card')?.querySelector('.menu') as HTMLElement|null
   if(!menu){setTarget(null);return}
   setLang((quickHeading?.textContent||'').includes('Actions')?'fr':'ht')
   let mount=menu.querySelector('[data-school-identity-mount]') as HTMLElement|null
   if(!mount){mount=document.createElement('div');mount.setAttribute('data-school-identity-mount','true');mount.style.display='contents';menu.appendChild(mount)}
   setTarget(mount)
  }
  attach();const o=new MutationObserver(()=>requestAnimationFrame(attach));o.observe(document.body,{subtree:true,childList:true});return()=>o.disconnect()
 },[])

 const uploadLogo=async(file:File)=>{
  setMessage('')
  if(file.size>2*1024*1024){setMessage(ht?'Logo a pa dwe depase 2 MB.':'Le logo ne doit pas dépasser 2 Mo.');return}
  const ext=(file.name.split('.').pop()||'png').toLowerCase()
  const path=`logo-${Date.now()}.${ext}`
  const {error}=await supabase.storage.from('school-branding').upload(path,file,{upsert:true})
  if(error){setMessage(error.message);return}
  const {data}=supabase.storage.from('school-branding').getPublicUrl(path)
  setSettings(v=>({...v,logo_url:data.publicUrl}))
 }

 const save=async()=>{
  if(!settings.school_name.trim())return
  setSaving(true);setMessage('')
  const {error}=await supabase.from('school_settings').upsert({id:1,school_name:settings.school_name.trim(),address:settings.address.trim(),phone:settings.phone.trim(),email:settings.email.trim(),logo_url:settings.logo_url,updated_at:new Date().toISOString()})
  setSaving(false)
  setMessage(error?error.message:(ht?'Enfòmasyon lekòl la anrejistre.':'Informations de l’école enregistrées.'))
  if(!error)window.dispatchEvent(new CustomEvent('school-settings-updated'))
 }

 if(!target)return null
 return createPortal(<>
  <button type="button" className="menuBtn" onClick={()=>setOpen(v=>!v)}>🏫 {ht?'Enfòmasyon lekòl':'Informations de l’école'}</button>
  {open&&<div className="card" style={{gridColumn:'1 / -1',marginTop:12}}>
   <h2>{ht?'Enfòmasyon lekòl':'Informations de l’école'}</h2>
   <div className="grid2">
    <div><label>{ht?'Non lekòl la':'Nom de l’école'}</label><input value={settings.school_name} onChange={e=>setSettings(v=>({...v,school_name:e.target.value}))}/></div>
    <div><label>{ht?'Telefòn':'Téléphone'}</label><input value={settings.phone} onChange={e=>setSettings(v=>({...v,phone:e.target.value}))}/></div>
    <div><label>{ht?'Adrès':'Adresse'}</label><input value={settings.address} onChange={e=>setSettings(v=>({...v,address:e.target.value}))}/></div>
    <div><label>{ht?'E-mail':'E-mail'}</label><input type="email" value={settings.email} onChange={e=>setSettings(v=>({...v,email:e.target.value}))}/></div>
   </div>
   <div style={{marginTop:14}}><label>{ht?'Logo lekòl la':'Logo de l’école'}</label><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)uploadLogo(f)}}/></div>
   {settings.logo_url&&<div style={{marginTop:12}}><img src={settings.logo_url} alt="Logo" style={{maxWidth:110,maxHeight:110,objectFit:'contain',border:'1px solid #dde6ef',borderRadius:12,padding:8,background:'#fff'}}/></div>}
   <button type="button" className="btn" style={{marginTop:16}} disabled={saving} onClick={save}>{saving?(ht?'Ap anrejistre...':'Enregistrement...'):(ht?'Anrejistre enfòmasyon lekòl':'Enregistrer les informations')}</button>
   {message&&<div className="notice" style={{marginTop:10}}>{message}</div>}
  </div>}
 </>,target)
}
