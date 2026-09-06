'use client'

import {useEffect,useMemo,useState} from 'react'
import {createPortal} from 'react-dom'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Grade={score:number;term:string}

export default function StudentTrimesterSummary(){
 const [target,setTarget]=useState<HTMLElement|null>(null)
 const [lang,setLang]=useState<'ht'|'fr'>('ht')
 const [term,setTerm]=useState('1er trimestre')
 const [grades,setGrades]=useState<Grade[]>([])

 useEffect(()=>{
  let cancelled=false
  const load=async()=>{
   const {data:{session}}=await supabase.auth.getSession()
   const user=session?.user
   if(!user)return
   const {data:profile}=await supabase.from('school_profiles').select('role,student_id').eq('user_id',user.id).maybeSingle()
   if(cancelled||profile?.role!=='student'||!profile.student_id)return
   const {data}=await supabase.from('school_grades').select('score,term').eq('student_id',profile.student_id).eq('status','approved').eq('published',true)
   if(!cancelled)setGrades((data||[]).map(x=>({score:Number(x.score),term:x.term})))
  }
  load()
  return()=>{cancelled=true}
 },[])

 useEffect(()=>{
  const attach=()=>{
   const headings=Array.from(document.querySelectorAll('.ps-page h2'))
   const h=headings.find(x=>['Tablo bò pou Elèv yo','Tableau de bord de l’Élève'].includes((x.textContent||'').trim()))
   const card=h?.closest('.card') as HTMLElement|null
   if(!card)return
   setLang((h?.textContent||'').includes('Tableau')?'fr':'ht')
   const old=card.querySelector('[data-student-term-mount]') as HTMLElement|null
   if(old){setTarget(old);return}
   const mount=document.createElement('div')
   mount.setAttribute('data-student-term-mount','true')
   const stats=card.querySelector('.stats')
   if(stats){
    const first=stats.querySelector('.stat:first-child') as HTMLElement|null
    if(first)first.style.display='none'
    stats.parentElement?.insertBefore(mount,stats)
   }else card.appendChild(mount)
   setTarget(mount)
  }
  attach()
  const observer=new MutationObserver(()=>requestAnimationFrame(attach))
  observer.observe(document.body,{subtree:true,childList:true})
  return()=>observer.disconnect()
 },[])

 const termAverage=useMemo(()=>{
  const rows=grades.filter(g=>g.term===term)
  return rows.length?Math.round(rows.reduce((a,g)=>a+g.score,0)/rows.length):null
 },[grades,term])
 const generalAverage=useMemo(()=>grades.length?Math.round(grades.reduce((a,g)=>a+g.score,0)/grades.length):null,[grades])

 if(!target)return null
 const ht=lang==='ht'
 const terms=['1er trimestre','2e trimestre','3e trimestre']
 return createPortal(
  <div style={{marginBottom:14}}>
   <div style={{border:'1px solid #dde6ef',borderRadius:14,padding:14,background:'#f8fafc'}}>
    <div style={{fontWeight:800,marginBottom:10}}>{ht?'Mwayèn pa trimès':'Moyenne par trimestre'}</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12}}>
     {terms.map((t,i)=><button key={t} type="button" onClick={()=>setTerm(t)} style={{border:'1px solid #cbd8e6',borderRadius:10,padding:'10px 6px',fontWeight:800,background:term===t?'#0f4c81':'#fff',color:term===t?'#fff':'#14213d',font:'inherit'}}>{i+1}{i===0?'er':'e'} {ht?'trimès':'trim.'}</button>)}
    </div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
     <span style={{fontWeight:700}}>{term}</span>
     <strong style={{fontSize:24,color:'#0f4c81'}}>{termAverage===null?'—':termAverage+'%'}</strong>
    </div>
   </div>
   <div style={{marginTop:10,border:'1px solid #dde6ef',borderRadius:14,padding:14,background:'#fff',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
    <strong>{ht?'Mwayèn jeneral':'Moyenne générale'}</strong>
    <strong style={{fontSize:24,color:'#0f4c81'}}>{generalAverage===null?'—':generalAverage+'%'}</strong>
   </div>
  </div>,target
 )
}
