'use client'

import {useState} from 'react'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Credential={name:string;accessId:string;password:string}|null

export default function SecretaryAccessManager({ht,onCreated}:{ht:boolean;onCreated?:()=>void|Promise<void>}){
 const [credential,setCredential]=useState<Credential>(null)
 const [error,setError]=useState('')
 const [busy,setBusy]=useState(false)

 const createSecretary=async(fd:FormData)=>{
  setError('');setCredential(null);setBusy(true)
  const name=String(fd.get('name')||'').trim()
  const accessId=String(fd.get('access_id')||'').trim()
  if(!name){setBusy(false);return}
  const {data,error}=await supabase.functions.invoke('create-secretary-access',{body:{name,access_id:accessId}})
  setBusy(false)
  if(error||data?.error){setError(data?.error||error?.message||'Erreur');return}
  setCredential({name:data.name,accessId:data.access_id,password:data.temporary_password})
  await onCreated?.()
 }

 return <div style={{marginTop:24,paddingTop:20,borderTop:'1px solid #dde6ef'}}>
  <h3>{ht?'Kreye kont Sekretarya':'Créer un compte Secrétariat'}</h3>
  <p className="muted">{ht?'Direksyon ka kreye ID aksè ak modpas tanporè pou Sekretarya a.':'La Direction peut créer un identifiant d’accès et un mot de passe temporaire pour le Secrétariat.'}</p>
  {error&&<div className="notice">⚠️ {error}</div>}
  <form action={createSecretary}>
   <div className="grid2">
    <div><label>{ht?'Non sekretè':'Nom du secrétaire'}</label><input name="name" required/></div>
    <div><label>{ht?'Nimewo badge / ID aksè':'Numéro de badge / Identifiant d’accès'}</label><input name="access_id" placeholder="SEC-001" autoCapitalize="none"/></div>
   </div>
   <button className="btn" style={{marginTop:12}} disabled={busy}>{busy?(ht?'Kreyasyon...':'Création...'):(ht?'Kreye kont Sekretarya':'Créer le compte Secrétariat')}</button>
  </form>
  {credential&&<div className="credential">
   <b>{credential.name}</b>
   <p>{ht?'Remèt enfòmasyon sa yo dirèkteman bay sekretè a. Modpas la tanporè.':'Remettez ces informations directement au secrétaire. Le mot de passe est temporaire.'}</p>
   <small>{ht?'ID aksè':'Identifiant d’accès'}</small><code>{credential.accessId}</code>
   <small>{ht?'Modpas tanporè':'Mot de passe temporaire'}</small><code>{credential.password}</code>
   <button type="button" className="btn secondary" onClick={()=>setCredential(null)}>{ht?'Mwen note yo':'Je les ai notés'}</button>
  </div>}
 </div>
}
