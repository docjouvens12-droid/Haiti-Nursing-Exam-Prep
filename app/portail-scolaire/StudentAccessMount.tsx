'use client'

import {useEffect,useState} from 'react'
import {createClient,type User} from '@supabase/supabase-js'
import StudentAccessManager from './StudentAccessManager'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Student={id:string;name:string;level:string;section:string;year:string}
type Account={studentId:string;accessId:string}

export default function StudentAccessMount(){
 const [user,setUser]=useState<User|null>(null)
 const [role,setRole]=useState('')
 const [lang,setLang]=useState<'ht'|'fr'>('fr')
 const [students,setStudents]=useState<Student[]>([])
 const [accounts,setAccounts]=useState<Account[]>([])

 const load=async(u:User)=>{
  const {data:profile}=await supabase.from('school_profiles').select('role').eq('user_id',u.id).maybeSingle()
  const r=profile?.role||''
  setRole(r)
  if(r!=='direction'){setStudents([]);setAccounts([]);return}
  const [sr,pr]=await Promise.all([
   supabase.from('school_students').select('id,name,level,section,academic_year').order('id'),
   supabase.from('school_profiles').select('student_id,access_id').eq('role','student')
  ])
  if(!sr.error)setStudents((sr.data||[]).map(x=>({id:x.id,name:x.name,level:x.level,section:x.section,year:x.academic_year})))
  if(!pr.error)setAccounts((pr.data||[]).filter(x=>x.student_id).map(x=>({studentId:x.student_id,accessId:x.access_id||x.student_id})))
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
   if(target?.closest?.('[data-global-language-menu]'))setLang(target.value==='ht'?'ht':'fr')
  }
  document.addEventListener('change',sync,true)
  return()=>document.removeEventListener('change',sync,true)
 },[])

 if(role!=='direction'||!user)return null
 return <section className="card native-student-access-mount" style={{maxWidth:1000,margin:'14px auto'}}>
  <StudentAccessManager ht={lang==='ht'} students={students} accounts={accounts} onChanged={()=>load(user)}/>
 </section>
}
