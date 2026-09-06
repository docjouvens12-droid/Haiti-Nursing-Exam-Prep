'use client'

import {FormEvent,useEffect,useState} from 'react'
import {createClient,type User} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Student={id:string;name:string;level:string;section:string;year:string}
type Teacher={id:string;name:string;subject:string;classes:string;section:string}
type Grade={id:string;studentId:string|null;student:string;subject:string;score:number;term:string;teacherId:string|null;teacher:string}
type View='home'|'students'|'grades'|'pending'|'classes'
type Credential={name:string;accessId:string;password:string}|null

export default function SecretaryPanel(){
 const [user,setUser]=useState<User|null>(null)
 const [role,setRole]=useState('')
 const [displayName,setDisplayName]=useState('')
 const [mustChange,setMustChange]=useState(false)
 const [lang,setLang]=useState<'ht'|'fr'>('ht')
 const [view,setView]=useState<View>('home')
 const [students,setStudents]=useState<Student[]>([])
 const [teachers,setTeachers]=useState<Teacher[]>([])
 const [grades,setGrades]=useState<Grade[]>([])
 const [classes,setClasses]=useState<{id:number;name:string;section:string}[]>([])
 const [subjects,setSubjects]=useState<{id:number;name:string}[]>([])
 const [secretaries,setSecretaries]=useState<any[]>([])
 const [credential,setCredential]=useState<Credential>(null)
 const [error,setError]=useState('')
 const ht=lang==='ht'

 const load=async(u:User)=>{
  setError('')
  const pr=await supabase.from('school_profiles').select('*').eq('user_id',u.id).maybeSingle()
  if(pr.error||!pr.data){if(pr.error)setError(pr.error.message);return}
  setRole(pr.data.role);setDisplayName(pr.data.display_name||'');setMustChange(Boolean(pr.data.must_change_password))
  if(pr.data.role==='secretary'){
   const [sr,tr,gr,cr,mr]=await Promise.all([
    supabase.from('school_students').select('*').order('id'),
    supabase.from('school_teachers').select('*').order('id'),
    supabase.from('school_grades').select('*').eq('status','pending').order('created_at'),
    supabase.from('school_classes').select('*').order('id'),
    supabase.from('school_subjects').select('*').order('id')
   ])
   const e=sr.error||tr.error||gr.error||cr.error||mr.error;if(e){setError(e.message);return}
   setStudents((sr.data||[]).map(x=>({id:x.id,name:x.name,level:x.level,section:x.section,year:x.academic_year})))
   setTeachers((tr.data||[]).map(x=>({id:x.id,name:x.name,subject:x.subject,classes:x.classes,section:x.section||''})))
   setGrades((gr.data||[]).map(x=>({id:x.id,studentId:x.student_id,student:x.student_name,subject:x.subject,score:Number(x.score),term:x.term,teacherId:x.teacher_id,teacher:x.teacher_name})))
   setClasses((cr.data||[]).map(x=>({id:x.id,name:x.name,section:x.section})))
   setSubjects((mr.data||[]).map(x=>({id:x.id,name:x.name})))
  }
  if(pr.data.role==='direction'){
   const r=await supabase.from('school_profiles').select('*').eq('role','secretary').order('created_at')
   if(!r.error)setSecretaries(r.data||[])
  }
 }

 useEffect(()=>{
  supabase.auth.getSession().then(({data})=>{const u=data.session?.user||null;setUser(u);if(u)load(u)})
  const {data:l}=supabase.auth.onAuthStateChange((_e,s)=>{const u=s?.user||null;setUser(u);setRole('');if(u)load(u)})
  return()=>l.subscription.unsubscribe()
 },[])

 useEffect(()=>{
  const sync=(e:Event)=>{
   const b=(e.target as HTMLElement|null)?.closest?.('.langChoice') as HTMLButtonElement|null
   if(!b)return
   setLang(b.textContent?.includes('Français')?'fr':'ht')
  }
  document.addEventListener('click',sync,true)
  return()=>document.removeEventListener('click',sync,true)
 },[])

 const createSecretary=async(fd:FormData)=>{
  if(role!=='direction')return
  setError('');setCredential(null)
  const name=String(fd.get('name')||'').trim(),accessId=String(fd.get('access_id')||'').trim()
  const {data,error}=await supabase.functions.invoke('create-secretary-access',{body:{name,access_id:accessId}})
  if(error||data?.error){setError(data?.error||error?.message||'Erreur');return}
  setCredential({name:data.name,accessId:data.access_id,password:data.temporary_password})
  if(user)await load(user)
 }

 const nextStudentId=()=>{
  const max=students.reduce((m,s)=>Math.max(m,Number(s.id.match(/^ELV-(\d+)$/)?.[1]||0)),0)
  return `ELV-${String(max+1).padStart(3,'0')}`
 }

 const addStudent=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();if(role!=='secretary')return
  setError('')
  const form=e.currentTarget,fd=new FormData(form)
  const payload={id:nextStudentId(),name:String(fd.get('name')||'').trim(),level:String(fd.get('level')||'').trim(),section:String(fd.get('section')||'').trim(),academic_year:String(fd.get('year')||'2026–2027').trim()}
  if(!payload.name||!payload.level||!payload.section||!payload.academic_year){setError(ht?'Ranpli tout chan yo.':'Remplissez tous les champs.');return}
  const {error}=await supabase.from('school_students').insert(payload)
  if(error){setError(error.message);return}
  form.reset();if(user)await load(user)
 }

 const editStudent=async(s:Student)=>{
  if(role!=='secretary')return
  const name=prompt(ht?'Non elèv':'Nom de l’élève',s.name);if(!name)return
  const level=prompt(ht?'Klas / nivo':'Classe / niveau',s.level);if(!level)return
  const section=prompt(ht?'Seksyon':'Section',s.section);if(!section)return
  const year=prompt(ht?'Ane akademik':'Année académique',s.year);if(!year)return
  const {error}=await supabase.from('school_students').update({name:name.trim(),level:level.trim(),section:section.trim(),academic_year:year.trim()}).eq('id',s.id)
  if(error){setError(error.message);return}
  if(user)await load(user)
 }

 const submitGrade=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();if(role!=='secretary')return
  const fd=new FormData(e.currentTarget),studentId=String(fd.get('student')||''),student=students.find(x=>x.id===studentId),teacherId=String(fd.get('teacher')||''),teacher=teachers.find(x=>x.id===teacherId),subject=String(fd.get('subject')||''),term=String(fd.get('term')||''),score=Number(fd.get('score'))
  if(!student||!subject||!term||Number.isNaN(score)||score<0||score>100)return
  const {error}=await supabase.from('school_grades').insert({id:'SEC-'+Date.now(),student_id:student.id,student_name:student.name,subject,score,term,teacher_id:teacher?.id||null,teacher_name:teacher?.name||'Secrétariat',status:'pending',published:false})
  if(error){setError(error.message);return}
  if(user)await load(user);setView('pending')
 }

 const editGrade=async(g:Grade)=>{
  if(role!=='secretary')return
  const raw=prompt(ht?'Nouvo nòt (0–100)':'Nouvelle note (0–100)',String(g.score));if(raw===null)return
  const score=Number(raw);if(Number.isNaN(score)||score<0||score>100)return
  const {error}=await supabase.from('school_grades').update({score}).eq('id',g.id)
  if(error){setError(error.message);return}
  if(user)await load(user)
 }

 if(role==='direction')return <section className="card" style={{maxWidth:1000,margin:'14px auto'}}><h2>{ht?'Kont Sekretè':'Compte Secrétariat'}</h2><p className="muted">{ht?'Direksyon ka kreye ID aksè ak modpas tanporè pou sekretè a.':'La Direction peut créer un identifiant d’accès et un mot de passe temporaire pour le secrétariat.'}</p>{error&&<div className="notice">⚠️ {error}</div>}<form action={createSecretary}><div className="grid2"><div><label>{ht?'Non sekretè':'Nom du secrétaire'}</label><input name="name" required/></div><div><label>{ht?'Nimewo badge / ID aksè':'Numéro de badge / Identifiant d’accès'}</label><input name="access_id" placeholder="SEC-001"/></div></div><button className="btn" style={{marginTop:12}}>{ht?'Kreye kont Sekretè':'Créer le compte Secrétariat'}</button></form>{credential&&<div className="credential"><b>{credential.name}</b><p>{ht?'Remèt enfòmasyon sa yo dirèkteman bay sekretè a.':'Remettez ces informations directement au secrétaire.'}</p><small>ID</small><code>{credential.accessId}</code><small>{ht?'Modpas tanporè':'Mot de passe temporaire'}</small><code>{credential.password}</code><button className="btn secondary" onClick={()=>setCredential(null)}>{ht?'Mwen note yo':'Je les ai notés'}</button></div>}{secretaries.length>0&&<div className="teacherList"><h3>{ht?'Kont Sekretè ki egziste':'Comptes Secrétariat existants'}</h3>{secretaries.map(s=><div className="teacherCard" key={s.user_id}><b>{s.display_name||'Secrétariat'}</b><div className="muted">ID aksè: {s.access_id}</div></div>)}</div>}</section>

 if(role!=='secretary'||mustChange)return null
 return <section className="secretary-dashboard" style={{maxWidth:1000,margin:'14px auto',padding:'0 12px'}}>
  {error&&<div className="notice">⚠️ {error}</div>}
  <div className="card"><h2>{ht?'Tablo bò pou Sekretarya a':'Tableau de bord du Secrétariat'}</h2><div className="studentHead"><div className="name">{displayName||'Secrétariat'}</div><div className="muted">{ht?'Aksè limite — Direksyon valide epi pibliye nòt yo.':'Accès limité — la Direction valide et publie les notes.'}</div></div>{view==='home'&&<div className="menu"><button className="menuBtn" onClick={()=>setView('students')}>👥 {ht?'Jere elèv':'Gérer les élèves'}</button><button className="menuBtn" onClick={()=>setView('grades')}>📝 {ht?'Antre nòt':'Saisir les notes'}</button><button className="menuBtn" onClick={()=>setView('pending')}>✏️ {ht?'Korije nòt an atant':'Corriger les notes en attente'} ({grades.length})</button><button className="menuBtn" onClick={()=>setView('classes')}>🏫 {ht?'Klas & seksyon':'Classes & sections'}</button></div>}{view!=='home'&&<button className="btn secondary" onClick={()=>setView('home')}>← {ht?'Retounen':'Retour'}</button>}</div>

  {view==='students'&&<div className="card"><h3>{ht?'Jere elèv':'Gérer les élèves'}</h3><form onSubmit={addStudent}><div className="grid2"><input name="name" placeholder={ht?'Non elèv':'Nom de l’élève'} required/><input name="level" placeholder={ht?'Klas / nivo':'Classe / niveau'} required/><input name="section" placeholder={ht?'Seksyon':'Section'} required/><input name="year" defaultValue="2026–2027" required/></div><button type="submit" className="btn" style={{marginTop:12}}>➕ {ht?'Ajoute elèv':'Ajouter l’élève'}</button></form><table style={{marginTop:14}}><tbody>{students.map(s=><tr key={s.id}><td>{s.id}</td><td>{s.name}</td><td>{s.level}</td><td>{s.section}</td><td>{s.year}</td><td><button className="btn" onClick={()=>editStudent(s)}>{ht?'Modifye':'Modifier'}</button></td></tr>)}</tbody></table></div>}

  {view==='grades'&&<div className="card"><h3>{ht?'Antre nòt':'Saisir les notes'}</h3><form onSubmit={submitGrade}><div className="grid2"><div><label>{ht?'Elèv':'Élève'}</label><select name="student" required><option value="">—</option>{students.map(s=><option value={s.id} key={s.id}>{s.name} — {s.level} {s.section}</option>)}</select></div><div><label>{ht?'Matiyè':'Matière'}</label><select name="subject" required><option value="">—</option>{subjects.map(s=><option key={s.id}>{s.name}</option>)}</select></div><div><label>{ht?'Pèson konsène':'Personne concernée'}</label><select name="teacher"><option value="">{ht?'Sekretarya':'Secrétariat'}</option>{teachers.map(t=><option value={t.id} key={t.id}>{t.name}</option>)}</select></div><div><label>{ht?'Nòt':'Note'}</label><input name="score" inputMode="decimal" placeholder="0–100" required/></div><div><label>{ht?'Trimès':'Trimestre'}</label><select name="term"><option>1er trimestre</option><option>2e trimestre</option><option>3e trimestre</option></select></div></div><button type="submit" className="btn" style={{marginTop:12}}>{ht?'Voye pou validasyon Direksyon':'Envoyer pour validation'}</button></form></div>}

  {view==='pending'&&<div className="card"><h3>{ht?'Nòt an atant':'Notes en attente'}</h3><p className="muted">{ht?'Sekretarya ka korije nòt sa yo sèlman anvan Direksyon valide yo.':'Le Secrétariat peut modifier ces notes uniquement avant leur validation par la Direction.'}</p>{grades.length===0?<div className="notice">{ht?'Pa gen nòt an atant.':'Aucune note en attente.'}</div>:<table><tbody>{grades.map(g=><tr key={g.id}><td>{g.student}</td><td>{g.subject}</td><td>{g.term}</td><td className="score">{g.score}%</td><td><button className="btn" onClick={()=>editGrade(g)}>{ht?'Korije':'Corriger'}</button></td></tr>)}</tbody></table>}</div>}

  {view==='classes'&&<div className="card"><h3>{ht?'Klas & seksyon':'Classes & sections'}</h3><div className="teacherList">{classes.map(c=><div className="teacherCard" key={c.id}><b>{c.name}</b><div className="muted">{ht?'Seksyon':'Section'} {c.section}</div></div>)}</div></div>}
 </section>
}
