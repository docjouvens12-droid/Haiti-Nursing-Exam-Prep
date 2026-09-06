'use client'

import {useEffect} from 'react'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type AssessmentType='trimester'|'control'
type RankRow={student_id:string;weighted_average:number;rank_position:number;cohort_size:number}

function clean(v:string){return (v||'').replace(/\s+/g,' ').trim()}
function isHt(card:HTMLElement){return clean(card.querySelector('h2')?.textContent||'').startsWith('Relve')}
function selectByLabel(card:HTMLElement,pattern:RegExp){
 for(const label of Array.from(card.querySelectorAll('label'))){
  if(!pattern.test(clean(label.textContent||'')))continue
  const select=label.parentElement?.querySelector('select') as HTMLSelectElement|null
  if(select)return select
 }
 return null
}
async function rankFor(studentId:string|null,type:AssessmentType,number:number){
 const {data,error}=await supabase.rpc('school_student_period_rank',{p_student_id:studentId,p_type:type,p_number:number})
 if(error||!data?.length)return null
 return data[0] as RankRow
}

export default function StudentIdentityRankEnhancer(){
 useEffect(()=>{
  let disposed=false
  let timer:number|undefined
  let selfStudentId=''

  const loadSelf=async()=>{
   const {data:{session}}=await supabase.auth.getSession();if(!session?.user)return
   const {data}=await supabase.from('school_profiles').select('role,student_id').eq('user_id',session.user.id).maybeSingle()
   selfStudentId=data?.role==='student'?(data.student_id||''):''
  }

  const addPeriodRanks=async(card:HTMLElement,studentId:string|null,type:AssessmentType)=>{
   if(!studentId)return
   const ht=isHt(card)
   const periodLabel=type==='trimester'?(ht?'Trimès':'Trimestre'):(ht?'Kontwòl':'Contrôle')
   const count=type==='trimester'?3:4
   for(let n=1;n<=count;n++){
    const period=Array.from(card.querySelectorAll('strong')).find(s=>clean(s.textContent||'')===`${periodLabel} ${n}`) as HTMLElement|undefined
    if(!period)continue
    let tag=period.parentElement?.querySelector(`[data-period-rank="${n}"]`) as HTMLElement|null
    if(!tag){tag=document.createElement('span');tag.setAttribute('data-period-rank',String(n));tag.style.cssText='font-size:12px;color:#637083;margin-left:8px;font-weight:700';period.insertAdjacentElement('afterend',tag)}
    tag.textContent=ht?'Ran: …':'Rang : …'
    const r=await rankFor(studentId,type,n)
    if(disposed||!tag.isConnected)return
    tag.textContent=r?(ht?`Ran: ${r.rank_position}/${r.cohort_size}`:`Rang : ${r.rank_position}/${r.cohort_size}`):(ht?'Ran: —':'Rang : —')
   }
  }

  const render=async()=>{
   if(disposed)return
   const cards=Array.from(document.querySelectorAll('.card')) as HTMLElement[]
   for(const card of cards){
    const title=clean(card.querySelector('h2')?.textContent||'')
    if(title==='Relve nòt mwen'||title==='Mon relevé de notes'){
     const typeSel=selectByLabel(card,/^(Kalite|Type)$/i)
     const type=(typeSel?.value==='control'?'control':'trimester') as AssessmentType
     const firstInfo=Array.from(card.querySelectorAll('div')).find(d=>/^(Elèv|Élève):/i.test(clean(d.textContent||'')))
     if(firstInfo&&!card.querySelector('[data-record-student-id]')){const id=document.createElement('div');id.setAttribute('data-record-student-id','true');id.innerHTML=`<strong>${isHt(card)?'ID Elèv':'ID Élève'}:</strong> ${selfStudentId||'—'}`;firstInfo.parentElement?.appendChild(id)}
     await addPeriodRanks(card,selfStudentId||null,type)
     continue
    }
    if(title==='Relve nòt elèv yo'||title==='Relevés de notes des élèves'){
     const studentSel=selectByLabel(card,/^(Elèv|Élève)$/i)
     const studentId=studentSel?.value||''
     if(!studentId)continue
     const typeSel=selectByLabel(card,/^(Kalite|Type)$/i)
     const type=(typeSel?.value==='control'?'control':'trimester') as AssessmentType
     const firstInfo=Array.from(card.querySelectorAll('div')).find(d=>/^(Elèv|Élève):/i.test(clean(d.textContent||'')))
     card.querySelector('[data-record-student-id]')?.remove()
     if(firstInfo){const id=document.createElement('div');id.setAttribute('data-record-student-id','true');id.innerHTML=`<strong>${isHt(card)?'ID Elèv':'ID Élève'}:</strong> ${studentId}`;firstInfo.parentElement?.appendChild(id)}
     await addPeriodRanks(card,studentId,type)
    }
   }
  }

  const schedule=()=>{window.clearTimeout(timer);timer=window.setTimeout(render,160)}
  loadSelf().then(render)
  const observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true})
  document.addEventListener('change',schedule,true)
  return()=>{disposed=true;window.clearTimeout(timer);observer.disconnect();document.removeEventListener('change',schedule,true)}
 },[])
 return null
}
