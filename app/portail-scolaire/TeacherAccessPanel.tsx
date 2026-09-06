'use client'

import {useEffect,useState} from 'react'
import {createPortal} from 'react-dom'
import {createClient,type User} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type TeacherAccount={accessId:string;teacherId:string;name:string;subject:string;classes:string;section:string;mustChange:boolean}

export default function TeacherAccessPanel(){
 const [role,setRole]=useState('')
 const [lang,setLang]=useState<'ht'|'fr'>('ht')
 const [accounts,setAccounts]=useState<TeacherAccount[]>([])
 const [error,setError]=useState('')
 const [target,setTarget]=useState<HTMLElement|null>(null)
 const ht=lang==='ht'

 const load=async(u:User)=>{
  setError('')
  const {data:profile,error:profileError}=await supabase.from('school_profiles').select('role').eq('user_id',u.id).maybeSingle()
  if(profileError){setError(profileError.message);return}
  if(!profile)return
  setRole(profile.role||'')
  if(profile.role!=='direction')return
  const {data:profiles,error:pErr}=await supabase.from('school_profiles').select('access_id,teacher_id,must_change_password').eq('role','teacher').order('created_at')
  if(pErr){setError(pErr.message);return}
  const {data:teachers,error:tErr}=await supabase.from('school_teachers').select('id,name,subject,classes,section')
  if(tErr){setError(tErr.message);return}
  const byId=new Map((teachers||[]).map(t=>[t.id,t]))
  setAccounts((profiles||[]).map(p=>{
   const t=byId.get(p.teacher_id)
   return {accessId:p.access_id||'',teacherId:p.teacher_id||'',name:t?.name||p.teacher_id||'Ansenyan',subject:t?.subject||'',classes:t?.classes||'',section:t?.section||'',mustChange:Boolean(p.must_change_password)}
  }))
 }

 useEffect(()=>{
  supabase.auth.getSession().then(({data})=>{const u=data.session?.user;if(u)load(u)})
  const {data:l}=supabase.auth.onAuthStateChange((_e,s)=>{const u=s?.user;setRole('');setTarget(null);if(u)load(u);else setAccounts([])})
  return()=>l.subscription.unsubscribe()
 },[])

 useEffect(()=>{
  const syncLang=(e:Event)=>{
   const b=(e.target as HTMLElement|null)?.closest?.('.langChoice') as HTMLButtonElement|null
   if(!b)return
   setLang(b.textContent?.includes('Français')?'fr':'ht')
  }
  document.addEventListener('click',syncLang,true)
  return()=>document.removeEventListener('click',syncLang,true)
 },[])

 useEffect(()=>{
  if(role!=='direction'){setTarget(null);return}
  const attach=()=>{
   const headings=Array.from(document.querySelectorAll('.ps-page h2'))
   const h=headings.find(x=>['Kont & aksè','Comptes & accès'].includes((x.textContent||'').trim()))
   const card=h?.closest('.card') as HTMLElement|null
   if(!card){setTarget(null);return}
   let mount=card.querySelector('[data-teacher-access-mount]') as HTMLElement|null
   if(!mount){
    mount=document.createElement('div')
    mount.setAttribute('data-teacher-access-mount','true')
    const existingTitle=Array.from(card.querySelectorAll('h3')).find(x=>['Kont ki egziste','Comptes existants'].includes((x.textContent||'').trim()))
    if(existingTitle) card.insertBefore(mount,existingTitle)
    else card.appendChild(mount)
   }
   setTarget(mount)
  }
  attach()
  const observer=new MutationObserver(()=>requestAnimationFrame(attach))
  observer.observe(document.body,{subtree:true,childList:true})
  return()=>observer.disconnect()
 },[role])

 if(role!=='direction'||!target)return null
 return createPortal(<div style={{marginTop:24,marginBottom:18,borderTop:'1px solid #dde6ef',paddingTop:18}}>
  <h3>{ht?'Kont Ansenyan':'Comptes Enseignants'}</h3>
  <p className="muted">{ht?'Men ansenyan ki deja gen yon kont aksè nan pòtal la.':'Voici les enseignants qui disposent déjà d’un compte d’accès au portail.'}</p>
  {error&&<div className="notice">⚠️ {error}</div>}
  {accounts.length===0?<div className="notice">{ht?'Pa gen kont Ansenyan ki kreye pou kounye a.':'Aucun compte Enseignant n’a encore été créé.'}</div>:<div className="teacherList">{accounts.map(a=><div className="teacherCard" key={a.accessId||a.teacherId}><div className="teacherName">{a.name}</div><div className="muted"><b>{ht?'ID aksè':'Identifiant'}:</b> {a.accessId||'—'}</div><div className="muted">{a.subject||'—'} • {a.classes||'—'}{a.section?` • ${ht?'Seksyon':'Section'} ${a.section}`:''}</div><div style={{marginTop:8}}><span className="badge">{a.mustChange?(ht?'Modpas tanporè':'Mot de passe temporaire'):(ht?'Kont aktif':'Compte actif')}</span></div></div>)}</div>}
 </div>,target)
}
