'use client'

import {useEffect} from 'react'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

export default function SecretaryAddStudentFix(){
 useEffect(()=>{
  const handler=async(e:Event)=>{
   const form=e.target as HTMLFormElement|null
   if(!form||form.tagName!=='FORM')return
   const card=form.closest('.card')
   const title=card?.querySelector('h3')?.textContent?.trim()||''
   if(title!=='Jere elèv'&&title!=='Gérer les élèves')return
   if(!form.querySelector('input[name="name"]')||!form.querySelector('input[name="level"]')||!form.querySelector('input[name="section"]'))return
   e.preventDefault()
   e.stopImmediatePropagation()

   const {data:{session}}=await supabase.auth.getSession()
   const user=session?.user
   if(!user)return
   const {data:profile}=await supabase.from('school_profiles').select('role').eq('user_id',user.id).maybeSingle()
   if(profile?.role!=='secretary')return

   const fd=new FormData(form)
   const name=String(fd.get('name')||'').trim()
   const level=String(fd.get('level')||'').trim()
   const section=String(fd.get('section')||'').trim()
   const academicYear=String(fd.get('year')||'2026–2027').trim()
   if(!name||!level||!section)return

   const {data:rows,error:readError}=await supabase.from('school_students').select('id').order('id')
   if(readError){alert(readError.message);return}
   const next=(rows||[]).reduce((m:any,x:any)=>{
    const n=Number(String(x.id||'').match(/^ELV-(\d+)$/)?.[1]||0)
    return Math.max(m,n)
   },0)+1
   const id=`ELV-${String(next).padStart(3,'0')}`

   const button=form.querySelector('button[type="submit"],button:not([type])') as HTMLButtonElement|null
   if(button){button.disabled=true;button.textContent=title==='Jere elèv'?'Anrejistreman...':'Enregistrement...'}
   const {error}=await supabase.from('school_students').insert({id,name,level,section,academic_year:academicYear})
   if(error){if(button)button.disabled=false;alert(error.message);return}
   window.location.reload()
  }
  document.addEventListener('submit',handler,true)
  return()=>document.removeEventListener('submit',handler,true)
 },[])
 return null
}
