'use client'

import {useEffect,useState} from 'react'
import {createClient,type User} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Student={id:string;name:string;level:string;section:string;year:string}
type StudentAccount={studentId:string;accessId:string}
type Credential={name:string;accessId:string;password:string}|null

export default function StudentAccessPanel(){
 const [user,setUser]=useState<User|null>(null)
 const [role,setRole]=useState('')
 const [lang,setLang]=useState<'ht'|'fr'>('fr')
 const [students,setStudents]=useState<Student[]>([])
 const [accounts,setAccounts]=useState<StudentAccount[]>([])
 const [credential,setCredential]=useState<Credential>(null)
 const [error,setError]=useState('')
 const [busyStudent,setBusyStudent]=useState('')
 const ht=lang==='ht'

 const load=async(u:User)=>{
  const {data:profile}=await supabase.from('school_profiles').select('role').eq('user_id',u.id).maybeSingle()
  if(!profile)return
  setRole(profile.role||'')
  if(profile.role!=='direction')return
  const [sr,pr]=await Promise.all([
   supabase.from('school_students').select('*').order('id'),
   supabase.from('school_profiles').select('student_id,access_id').eq('role','student')
  ])
  if(sr.error){setError(sr.error.message);return}
  if(pr.error){setError(pr.error.message);return}
  setStudents((sr.data||[]).map(x=>({id:x.id,name:x.name,level:x.level,section:x.section,year:x.academic_year})))
  setAccounts((pr.data||[]).filter(x=>x.student_id).map(x=>({studentId:x.student_id,accessId:x.access_id||x.student_id})))
 }

 useEffect(()=>{
  supabase.auth.getSession().then(({data})=>{const u=data.session?.user||null;setUser(u);if(u)load(u)})
  const {data:l}=supabase.auth.onAuthStateChange((_e,s)=>{const u=s?.user||null;setUser(u);setRole('');if(u)load(u)})
  return()=>l.subscription.unsubscribe()
 },[])

 useEffect(()=>{
  const current=document.querySelector('[data-global-language-menu] select') as HTMLSelectElement|null
  if(current)setLang(current.value==='ht'?'ht':'fr')
  const sync=(e:Event)=>{
   const target=e.target as HTMLSelectElement|null
   if(!target?.closest?.('[data-global-language-menu]'))return
   setLang(target.value==='ht'?'ht':'fr')
  }
  document.addEventListener('change',sync,true)
  return()=>document.removeEventListener('change',sync,true)
 },[])

 const createAccess=async(fd:FormData)=>{
  if(role!=='direction')return
  setError('');setCredential(null)
  const studentId=String(fd.get('student_id')||'').trim()
  const accessId=String(fd.get('access_id')||'').trim()
  const {data,error}=await supabase.functions.invoke('create-student-access',{body:{student_id:studentId,access_id:accessId}})
  if(error||data?.error){setError(data?.error||error?.message||'Erreur');return}
  setCredential({name:data.student_name,accessId:data.access_id,password:data.temporary_password})
  if(user)await load(user)
 }

 const resetPassword=async(studentId:string)=>{
  if(role!=='direction'||busyStudent)return
  setError('');setCredential(null);setBusyStudent(studentId)
  const {data,error}=await supabase.functions.invoke('reset-student-password',{body:{student_id:studentId}})
  setBusyStudent('')
  if(error||data?.error){setError(data?.error||error?.message||'Erreur');return}
  setCredential({name:data.student_name,accessId:data.access_id,password:data.temporary_password})
  if(user)await load(user)
 }

 if(role!=='direction')return null
 const usedStudentIds=accounts.map(a=>a.studentId)
 const available=students.filter(s=>!usedStudentIds.includes(s.id))
 return <section className="card" style={{maxWidth:1000,margin:'14px auto'}}>
  <h2>{ht?'Kont Elèv':'Compte Élève'}</h2>
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
 </section>
}
