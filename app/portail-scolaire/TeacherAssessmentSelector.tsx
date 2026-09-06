'use client'

import {useEffect,useState} from 'react'
import {createPortal} from 'react-dom'

type AssessmentType='trimester'|'control'

export default function TeacherAssessmentSelector(){
 const [target,setTarget]=useState<HTMLElement|null>(null)
 const [lang,setLang]=useState<'ht'|'fr'>('ht')
 const [assessmentType,setAssessmentType]=useState<AssessmentType>('trimester')
 const [assessmentNumber,setAssessmentNumber]=useState(1)

 useEffect(()=>{
  let applying=false
  const attach=()=>{
   if(applying)return
   applying=true
   try{
    const headings=Array.from(document.querySelectorAll('.ps-page h2'))
    const h=headings.find(x=>['Antre nòt','Saisir les notes'].includes((x.textContent||'').trim()))
    const card=h?.closest('.card') as HTMLElement|null
    const form=card?.querySelector('form') as HTMLFormElement|null
    if(!form){setTarget(null);return}
    setLang((h?.textContent||'').trim()==='Saisir les notes'?'fr':'ht')
    const termSelect=form.querySelector('select[name="term"]') as HTMLSelectElement|null
    if(!termSelect){setTarget(null);return}
    const termWrap=termSelect.parentElement as HTMLElement|null
    if(termWrap)termWrap.style.display='none'
    let mount=form.querySelector('[data-teacher-assessment-mount]') as HTMLElement|null
    if(!mount){
      mount=document.createElement('div')
      mount.setAttribute('data-teacher-assessment-mount','true')
      mount.style.gridColumn='1 / -1'
      const grid=form.querySelector('.grid2')
      grid?.appendChild(mount)
    }
    setTarget(mount)
   } finally {applying=false}
  }
  attach()
  const observer=new MutationObserver(()=>requestAnimationFrame(attach))
  observer.observe(document.body,{subtree:true,childList:true})
  return()=>observer.disconnect()
 },[])

 useEffect(()=>{
  const form=target?.closest('form') as HTMLFormElement|null
  const termSelect=form?.querySelector('select[name="term"]') as HTMLSelectElement|null
  if(!termSelect)return

  const value=assessmentType==='control'
    ? `Kontwòl ${assessmentNumber}`
    : assessmentNumber===1?'1er trimestre':`${assessmentNumber}e trimestre`

  let option=Array.from(termSelect.options).find(o=>o.value===value)
  if(!option){
    option=document.createElement('option')
    option.value=value
    option.textContent=value
    termSelect.appendChild(option)
  }
  termSelect.value=value
 },[target,assessmentType,assessmentNumber])

 if(!target)return null
 const ht=lang==='ht'
 return createPortal(<div className="grid2" style={{marginTop:0}}>
  <div>
   <label>{ht?'Kalite evalyasyon':'Type d’évaluation'}</label>
   <select value={assessmentType} onChange={e=>setAssessmentType(e.target.value as AssessmentType)}>
    <option value="trimester">{ht?'Trimès':'Trimestre'}</option>
    <option value="control">{ht?'Kontwòl':'Contrôle'}</option>
   </select>
  </div>
  <div>
   <label>{ht?'Nimewo':'Numéro'}</label>
   <select value={assessmentNumber} onChange={e=>setAssessmentNumber(Number(e.target.value))}>
    {[1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}
   </select>
  </div>
 </div>,target)
}
