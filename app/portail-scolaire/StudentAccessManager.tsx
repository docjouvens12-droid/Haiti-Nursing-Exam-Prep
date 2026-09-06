'use client'

import {useMemo,useState} from 'react'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Student={id:string;name:string;level:string;section:string;year:string}
type Account={studentId:string;accessId:string}
type Credential={name:string;accessId:string;password:string}|null

export default function StudentAccessManager({ht,students,accounts,onChanged}:{ht:boolean;students:Student[];accounts:Account[];onChanged:()=>void|Promise<void>}){
 const [credential,setCredential]=useState<Credential>(null)
 const [error,setError]=useState('')
 const [busyStudent,setBusyStudent]=useState('')
 const used=useMemo(()=>new Set(accounts.map(a=>a.studentId)),[accounts])
 const available=students.filter(s=>!used.has(s.id))

 const createAccess=async(fd:FormData)=>{
  setError('');setCredential(null)
  const studentId=String(fd.get('student_id')||'').trim()
  const accessId=String(fd.get('access_id')||'').trim()
  const {data,error}=await supabase.functions.invoke('create-student-access',{body:{student_id:studentId,access_id:accessId}})
  if(error||data?.error){setError(data?.error||error?.message||'Erreur');return}
  setCredential({name:data.student_name,accessId:data.access_id,password:data.temporary_password})
  await onChanged()
 }

 const resetPassword=async(studentId:string)=>{
  if(busyStudent)return
  setError('');setCredential(null);setBusyStudent(studentId)
  const {data,error}=await supabase.functions.invoke('reset-student-password',{body:{student_id:studentId}})
  setBusyStudent('')
  if(error||data?.error){setError(data?.error||error?.message||'Erreur');return}
  setCredential({name:data.student_name,accessId:data.access_id,password:data.temporary_password})
  await onChanged()
 }

 return <div style={{marginTop:26,paddingTop:20,borderTop:'1px solid #dde6ef'}}>
  <h3>{ht?'Kreye kont Elèv':'Créer un compte Élève'}</h3>
  <p className="muted">{ht?'Direksyon kreye ID aksè ak modpas tanporè pou elèv la. Elèv la ap oblije chanje modpas la premye fwa li konekte.':'La Direction crée un identifiant d’accès et un mot de passe temporaire pour l’élève. L’élève devra changer le mot de passe lors de sa première connexion.'}</p>
  {error&&<div className="notice">⚠️ {error}</div>}
  <form action={createAccess}>
   <div className="grid2">
    <div><label>{ht?'Elèv':'Élève'}</label><select name="student_id" required><option value="">—</option>{available.map(s=><option key={s.id} value={s.id}>{s.name} — {s.id} — {s.level} {s.section}</option>)}</select></div>
    <div><label>{ht?'ID aksè / Nimewo elèv':'Identifiant d’accès / Numéro d’élève'}</label><input name="access_id" placeholder="ELV-001" autoCapitalize="none"/></div>
   </div>
   <button className="btn" style={{marginTop:12}} disabled={available.length===0}>{ht?'Kreye kont Elèv':'Créer le compte Élève'}</button>
  </form>

  {accounts.length>0&&<div className="teacherList" style={{marginTop:20}}><h3>{ht?'Kont Elèv ki egziste':'Comptes Élèves existants'}</h3>{accounts.map(a=>{const s=students.find(x=>x.id===a.studentId);return <div className="teacherCard" key={a.studentId}><b>{s?.name||a.studentId}</b><div className="muted">{a.accessId} • {s?.level||''} {s?.section||''}</div><button type="button" className="btn secondary" style={{marginTop:10}} onClick={()=>resetPassword(a.studentId)} disabled={busyStudent===a.studentId}>{busyStudent===a.studentId?(ht?'Reyinisyalizasyon...':'Réinitialisation...'):(ht?'Reyinisyalize modpas':'Réinitialiser le mot de passe')}</button></div>})}</div>}

  {credential&&<div className="credential"><b>{credential.name}</b><p>{ht?'Remèt enfòmasyon sa yo dirèkteman bay elèv la oswa responsab li. Modpas la tanporè.':'Remettez ces informations directement à l’élève ou à son responsable. Le mot de passe est temporaire.'}</p><small>{ht?'ID aksè':'Identifiant d’accès'}</small><code>{credential.accessId}</code><small>{ht?'Modpas tanporè':'Mot de passe temporaire'}</small><code>{credential.password}</code><button type="button" className="btn secondary" onClick={()=>setCredential(null)}>{ht?'Mwen note yo':'Je les ai notés'}</button></div>}
 </div>
}
