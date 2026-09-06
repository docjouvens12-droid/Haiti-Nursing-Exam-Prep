'use client'

import {useEffect,useState} from 'react'
import {createClient,type User} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Teacher={id:string;name:string;subject:string;classes:string;section:string}
type TeacherAccount={accessId:string;teacherId:string;mustChange:boolean}
type Credential={name:string;accessId:string;password:string}|null

export default function TeacherAccessPanel(){
 const [user,setUser]=useState<User|null>(null)
 const [role,setRole]=useState('')
 const [lang,setLang]=useState<'ht'|'fr'>('fr')
 const [teachers,setTeachers]=useState<Teacher[]>([])
 const [accounts,setAccounts]=useState<TeacherAccount[]>([])
 const [credential,setCredential]=useState<Credential>(null)
 const [error,setError]=useState('')
 const ht=lang==='ht'

 const load=async(u:User)=>{
  setError('')
  const {data:profile,error:profileError}=await supabase.from('school_profiles').select('role').eq('user_id',u.id).maybeSingle()
  if(profileError){setError(profileError.message);return}
  if(!profile)return
  setRole(profile.role||'')
  if(profile.role!=='direction')return

  const [tr,pr]=await Promise.all([
   supabase.from('school_teachers').select('id,name,subject,classes,section').order('id'),
   supabase.from('school_profiles').select('access_id,teacher_id,must_change_password').eq('role','teacher').order('created_at')
  ])
  if(tr.error){setError(tr.error.message);return}
  if(pr.error){setError(pr.error.message);return}

  setTeachers((tr.data||[]).map(t=>({id:t.id,name:t.name,subject:t.subject,classes:t.classes,section:t.section||''})))
  setAccounts((pr.data||[]).filter(p=>p.teacher_id).map(p=>({teacherId:p.teacher_id,accessId:p.access_id||p.teacher_id,mustChange:Boolean(p.must_change_password)})))
 }

 useEffect(()=>{
  supabase.auth.getSession().then(({data})=>{const u=data.session?.user||null;setUser(u);if(u)load(u)})
  const {data:l}=supabase.auth.onAuthStateChange((_e,s)=>{const u=s?.user||null;setUser(u);setRole('');if(u)load(u);else{setTeachers([]);setAccounts([])}})
  return()=>l.subscription.unsubscribe()
 },[])

 useEffect(()=>{
  const current=document.querySelector('[data-global-language-menu]') as HTMLSelectElement|null
  if(current)setLang(current.value==='ht'?'ht':'fr')
  const sync=(e:Event)=>{
   const target=e.target as HTMLSelectElement|null
   if(!target?.matches?.('[data-global-language-menu]'))return
   setLang(target.value==='ht'?'ht':'fr')
  }
  document.addEventListener('change',sync,true)
  return()=>document.removeEventListener('change',sync,true)
 },[])

 const createAccess=async(fd:FormData)=>{
  if(role!=='direction')return
  setError('');setCredential(null)
  const teacherId=String(fd.get('teacher_id')||'').trim()
  const accessId=String(fd.get('access_id')||'').trim()
  const {data,error}=await supabase.functions.invoke('create-teacher-access',{body:{teacher_id:teacherId,access_id:accessId}})
  if(error||data?.error){setError(data?.error||error?.message||'Erreur');return}
  setCredential({name:data.teacher_name,accessId:data.access_id,password:data.temporary_password})
  if(user)await load(user)
 }

 if(role!=='direction')return null
 const usedTeacherIds=accounts.map(a=>a.teacherId)
 const available=teachers.filter(t=>!usedTeacherIds.includes(t.id))

 return <section className="card" style={{maxWidth:1000,margin:'14px auto'}}>
  <h2>{ht?'Kont Ansenyan':'Compte Enseignant'}</h2>
  <p className="muted">{ht?'Direksyon kreye ID aksè ak modpas tanporè pou ansenyan an. Ansenyan an ap oblije chanje modpas la premye fwa li konekte.':'La Direction crée un identifiant d’accès et un mot de passe temporaire pour l’enseignant. L’enseignant devra changer le mot de passe lors de sa première connexion.'}</p>
  {error&&<div className="notice">⚠️ {error}</div>}

  <form action={createAccess}>
   <div className="grid2">
    <div><label>{ht?'Ansenyan':'Enseignant'}</label><select name="teacher_id" required><option value="">—</option>{available.map(t=><option key={t.id} value={t.id}>{t.name} — {t.id} — {t.subject} — {t.classes} {t.section}</option>)}</select></div>
    <div><label>{ht?'Nimewo badge / ID aksè':'Numéro de badge / Identifiant d’accès'}</label><input name="access_id" placeholder="ENS-001" autoCapitalize="none"/></div>
   </div>
   <button className="btn" style={{marginTop:12}} disabled={available.length===0}>{ht?'Kreye kont Ansenyan':'Créer le compte Enseignant'}</button>
  </form>

  {accounts.length>0&&<div className="teacherList" style={{marginTop:20}}><h3>{ht?'Kont Ansenyan ki egziste':'Comptes Enseignants existants'}</h3>{accounts.map(a=>{const t=teachers.find(x=>x.id===a.teacherId);return <div className="teacherCard" key={a.teacherId}><b>{t?.name||a.teacherId}</b><div className="muted">{ht?'ID aksè':'Identifiant'}: {a.accessId}</div><div className="muted">{t?.subject||'—'} • {t?.classes||'—'}{t?.section?` • ${ht?'Seksyon':'Section'} ${t.section}`:''}</div><div style={{marginTop:8}}><span className="badge">{a.mustChange?(ht?'Modpas tanporè':'Mot de passe temporaire'):(ht?'Kont aktif':'Compte actif')}</span></div></div>})}</div>}

  {credential&&<div className="credential"><b>{credential.name}</b><p>{ht?'Remèt enfòmasyon sa yo dirèkteman bay ansenyan an. Modpas la tanporè.':'Remettez ces informations directement à l’enseignant. Le mot de passe est temporaire.'}</p><small>{ht?'ID aksè':'Identifiant d’accès'}</small><code>{credential.accessId}</code><small>{ht?'Modpas tanporè':'Mot de passe temporaire'}</small><code>{credential.password}</code><button type="button" className="btn secondary" onClick={()=>setCredential(null)}>{ht?'Mwen note yo':'Je les ai notés'}</button></div>}
 </section>
}
