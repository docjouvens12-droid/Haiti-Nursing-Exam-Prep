'use client'

import {useEffect,useState} from 'react'
import {createClient,type User} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Student={id:string;name:string;level:string;section:string;academic_year:string}

export default function SecretaryEnhancements(){
 const [user,setUser]=useState<User|null>(null)
 const [isSecretary,setIsSecretary]=useState(false)
 const [students,setStudents]=useState<Student[]>([])

 const load=async(u:User)=>{
  const pr=await supabase.from('school_profiles').select('role').eq('user_id',u.id).maybeSingle()
  const secretary=pr.data?.role==='secretary'
  setIsSecretary(secretary)
  if(!secretary){setStudents([]);return}
  const sr=await supabase.from('school_students').select('id,name,level,section,academic_year').order('name')
  if(!sr.error)setStudents(sr.data||[])
 }

 useEffect(()=>{
  supabase.auth.getSession().then(({data})=>{const u=data.session?.user||null;setUser(u);if(u)load(u)})
  const {data:l}=supabase.auth.onAuthStateChange((_e,s)=>{const u=s?.user||null;setUser(u);setIsSecretary(false);setStudents([]);if(u)load(u)})
  return()=>l.subscription.unsubscribe()
 },[])

 useEffect(()=>{
  const syncLanguage=(e:Event)=>{
   const target=e.target as HTMLElement|null
   const button=target?.closest?.('.langChoice') as HTMLButtonElement|null
   if(!button)return
   const next=button.textContent?.includes('Français')?'Français':'Kreyòl'
   setTimeout(()=>{
    const root=document.querySelector('.secretary-dashboard')
    if(!root)return
    const buttons=Array.from(root.querySelectorAll('button')) as HTMLButtonElement[]
    buttons.find(b=>b.textContent?.trim()===next)?.click()
   },0)
  }
  document.addEventListener('click',syncLanguage,true)
  return()=>document.removeEventListener('click',syncLanguage,true)
 },[])

 useEffect(()=>{
  if(!user||!isSecretary)return
  const handleModify=(e:Event)=>{
   const target=e.target as HTMLElement|null
   const button=target?.closest?.('button') as HTMLButtonElement|null
   if(!button||!['Modifye','Modifier'].includes(button.textContent?.trim()||''))return
   const row=button.closest('tr')
   if(!row)return
   const cells=row.querySelectorAll('td')
   const name=cells[0]?.textContent?.trim()||''
   const level=cells[1]?.textContent?.trim()||''
   const section=cells[2]?.textContent?.trim()||''
   const student=students.find(s=>s.name===name&&s.level===level&&s.section===section)||students.find(s=>s.name===name)
   if(!student)return
   setTimeout(async()=>{
    const french=document.querySelector('.secretary-dashboard h2')?.textContent?.includes('Tableau de bord')
    const nextYear=window.prompt(french?'Année académique':'Ane akademik',student.academic_year||'2026–2027')
    if(nextYear===null||!nextYear.trim())return
    await supabase.from('school_students').update({academic_year:nextYear.trim()}).eq('id',student.id)
    setStudents(prev=>prev.map(s=>s.id===student.id?{...s,academic_year:nextYear.trim()}:s))
   },0)
  }
  document.addEventListener('click',handleModify,true)
  return()=>document.removeEventListener('click',handleModify,true)
 },[user,isSecretary,students])

 return null
}
