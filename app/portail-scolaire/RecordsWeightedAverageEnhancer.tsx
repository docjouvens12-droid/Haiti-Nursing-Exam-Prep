'use client'

import {useEffect} from 'react'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type AssessmentType='trimester'|'control'
type Grade={subject:string;score:number;term:string}

type CoeffMap=Record<string,number>

function clean(v:string){return v.replace(/\s+/g,' ').trim()}
function matchesSelection(term:string,type:AssessmentType,number:number){
 const value=clean(term||'').toLowerCase()
 if(type==='trimester'){
  const terms=[
   ['1er trimestre','1e trimestre','trimestre 1','trimès 1'],
   ['2e trimestre','trimestre 2','trimès 2'],
   ['3e trimestre','trimestre 3','trimès 3']
  ][number-1]||[]
  return terms.includes(value)
 }
 return [`contrôle ${number}`,`controle ${number}`,`control ${number}`,`kontwòl ${number}`,`kontwol ${number}`].includes(value)
}
function typeRows(rows:Grade[],type:AssessmentType){
 const count=type==='trimester'?3:4
 return rows.filter(g=>Array.from({length:count},(_,i)=>i+1).some(n=>matchesSelection(g.term,type,n)))
}
function subjectAverages(rows:Grade[],coeffs:CoeffMap){
 const by=new Map<string,number[]>()
 rows.forEach(g=>{if(!g.subject)return;const a=by.get(g.subject)||[];a.push(g.score);by.set(g.subject,a)})
 return [...by.entries()].map(([subject,scores])=>({subject,avg:scores.reduce((a,b)=>a+b,0)/scores.length,coefficient:Math.max(0,Number(coeffs[subject]??1))}))
}
function weightedAverage(rows:Grade[],coeffs:CoeffMap){
 const subjects=subjectAverages(rows,coeffs).filter(x=>x.coefficient>0)
 const totalCoeff=subjects.reduce((a,s)=>a+s.coefficient,0)
 if(!subjects.length||!totalCoeff)return null
 return Math.round(subjects.reduce((a,s)=>a+s.avg*s.coefficient,0)/totalCoeff)
}

export default function RecordsWeightedAverageEnhancer(){
 useEffect(()=>{
  let disposed=false
  let timer:number|undefined
  let coefficients:CoeffMap={}
  let lastKey=''

  const loadCoefficients=async()=>{
   const {data}=await supabase.from('school_subjects').select('name,coefficient')
   coefficients=Object.fromEntries((data||[]).map((x:any)=>[x.name,Math.max(0,Number(x.coefficient??1))]))
  }

  const findRecordCard=()=>Array.from(document.querySelectorAll('.card')).find(card=>{
   const h=clean(card.querySelector('h2')?.textContent||'')
   return h==='Relve nòt elèv yo'||h==='Relevés de notes des élèves'
  }) as HTMLElement|undefined

  const selectByLabel=(card:HTMLElement,pattern:RegExp)=>{
   for(const label of Array.from(card.querySelectorAll('label'))){
    if(!pattern.test(clean(label.textContent||'')))continue
    const parent=label.parentElement
    const select=parent?.querySelector('select') as HTMLSelectElement|null
    if(select)return select
   }
   return null
  }

  const render=async()=>{
   if(disposed)return
   const card=findRecordCard();if(!card)return
   const studentSelect=selectByLabel(card,/^(Elèv|Élève)$/i)
   const typeSelect=selectByLabel(card,/^(Kalite|Type)$/i)
   const studentId=studentSelect?.value||''
   const type=(typeSelect?.value==='control'?'control':'trimester') as AssessmentType
   const key=`${studentId}|${type}`
   if(!studentId){card.querySelector('[data-weighted-record-summary]')?.remove();lastKey='';return}
   if(key===lastKey&&card.querySelector('[data-weighted-record-summary]'))return
   lastKey=key

   const {data}=await supabase.from('school_grades').select('subject,score,term').eq('student_id',studentId).eq('status','approved').eq('published',true)
   if(disposed)return
   const grades:Grade[]=(data||[]).map((x:any)=>({subject:x.subject||'',score:Number(x.score),term:x.term||''}))
   const relevant=typeRows(grades,type)
   const overall=weightedAverage(relevant,coefficients)
   const ht=clean(card.querySelector('h2')?.textContent||'').startsWith('Relve')
   const subjects=subjectAverages(relevant,coefficients)

   let box=card.querySelector('[data-weighted-record-summary]') as HTMLElement|null
   if(!box){
    box=document.createElement('div')
    box.setAttribute('data-weighted-record-summary','true')
    box.style.cssText='margin-top:14px;border:2px solid #d8e2ea;border-radius:14px;padding:14px;background:#f8fafc'
    const actionGrid=Array.from(card.querySelectorAll('div')).find(d=>Array.from(d.querySelectorAll(':scope > button')).some(b=>/Word/.test(b.textContent||'')))
    if(actionGrid)actionGrid.insertAdjacentElement('beforebegin',box);else card.appendChild(box)
   }
   box.innerHTML=`<div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><strong>${ht?'Mwayèn jeneral pondérée':'Moyenne générale pondérée'}</strong><strong style="font-size:24px;color:#0f4c81">${overall===null?'—':overall+'%'}</strong></div>${subjects.length?`<div style="margin-top:8px;color:#637083;font-size:12px">${subjects.map(s=>`${s.subject}: ${Math.round(s.avg)}% × ${s.coefficient}`).join(' · ')}</div>`:''}`

   // Replace visible group-average labels with the weighted average of subjects in that period.
   const count=type==='trimester'?3:4
   const periodName=type==='trimester'?(ht?'Trimès':'Trimestre'):(ht?'Kontwòl':'Contrôle')
   for(let n=1;n<=count;n++){
    const avg=weightedAverage(grades.filter(g=>matchesSelection(g.term,type,n)),coefficients)
    const candidates=Array.from(card.querySelectorAll('strong'))
    const period=candidates.find(s=>clean(s.textContent||'')===`${periodName} ${n}`)
    if(!period)continue
    const wrap=period.parentElement
    const avgNode=wrap?Array.from(wrap.querySelectorAll('strong')).find(s=>s!==period):undefined
    if(avgNode)avgNode.textContent=avg===null?'—':`${ht?'Mwayèn':'Moyenne'} ${avg}%`
   }
  }

  const schedule=()=>{window.clearTimeout(timer);timer=window.setTimeout(()=>{lastKey='';render()},120)}
  loadCoefficients().then(render)
  const observer=new MutationObserver(schedule)
  observer.observe(document.body,{subtree:true,childList:true})
  document.addEventListener('change',schedule,true)
  window.addEventListener('school-subject-coefficients-updated',async()=>{await loadCoefficients();schedule()})
  return()=>{disposed=true;window.clearTimeout(timer);observer.disconnect();document.removeEventListener('change',schedule,true);window.removeEventListener('school-subject-coefficients-updated',schedule as EventListener)}
 },[])
 return null
}
