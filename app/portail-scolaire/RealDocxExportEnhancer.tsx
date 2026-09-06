'use client'

import {useEffect} from 'react'
import {createClient} from '@supabase/supabase-js'
import {downloadAcademicDocx} from './wordDocx'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

function clean(v:string){return (v||'').replace(/\s+/g,' ').trim()}
function filenameSafe(v:string){return (v||'eleve').replace(/[^a-zA-Z0-9À-ÿ_-]+/g,'-')}
function scoreOf(v:string){const n=Number(String(v||'').replace('%','').replace(',','.').trim());return Number.isFinite(n)?n:null}
function fmt(n:number){return Number.isInteger(n)?`${n}%`:`${n.toFixed(1)}%`}
function decisionLabel(ht:boolean,value:string){if(value==='admitted')return 'Admis';if(value==='deferred')return ht?'Ajouné':'Ajourné';return ht?'An atant':'En attente'}

export default function RealDocxExportEnhancer(){
 useEffect(()=>{
  const handler=async(event:Event)=>{
   const button=(event.target as HTMLElement|null)?.closest?.('button') as HTMLButtonElement|null
   if(!button||!/Word/i.test(clean(button.textContent||'')))return
   const card=button.closest('.card') as HTMLElement|null
   if(!card)return
   const title=clean(card.querySelector('h2')?.textContent||'')
   const isBulletin=['Bilten mwen','Mon bulletin'].includes(title)
   const isRecord=/Relve nòt|relev[eé]s? de notes/i.test(title)
   if(!isBulletin&&!isRecord)return

   event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()

   const globalLang=document.querySelector('[data-global-language-menu] select') as HTMLSelectElement|null
   const ht=globalLang?.value!=='fr'
   const {data:school}=await supabase.from('school_settings').select('school_name,address,phone,email').eq('id',1).maybeSingle()
   const schoolName=school?.school_name||'Portail Scolaire Haïti'
   const contact=[school?.address,school?.phone,school?.email].filter(Boolean).join(' • ')

   const infoCandidate=Array.from(card.querySelectorAll('div')).filter(d=>{
    const t=clean(d.textContent||'')
    return (t.includes('Elèv:')||t.includes('Élève:'))&&(t.includes('Seksyon:')||t.includes('Section:'))
   }).sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length)[0] as HTMLElement|undefined
   const infoChildren=infoCandidate?Array.from(infoCandidate.children).map(x=>clean(x.textContent||'')):[]
   const findInfo=(keys:string[])=>infoChildren.find(x=>keys.some(k=>x.startsWith(k)))?.split(':').slice(1).join(':').trim()||'—'
   const student=findInfo(['Elèv','Élève'])
   const year=findInfo(['Ane akademik','Année scolaire'])
   const level=findInfo(['Klas / Nivo','Classe / Niveau'])
   const section=findInfo(['Seksyon','Section'])

   let studentId='—'
   const visibleId=Array.from(card.querySelectorAll('*')).map(x=>clean(x.textContent||'')).find(x=>/^ID (Elèv|Élève):/i.test(x))||''
   const parsedId=visibleId.split(':').slice(1).join(':').trim()
   if(parsedId&&parsedId!=='—')studentId=parsedId
   if(studentId==='—'&&student!=='—'){
    let q=supabase.from('school_students').select('id').eq('name',student)
    if(year!=='—')q=q.eq('academic_year',year)
    if(level!=='—')q=q.eq('level',level)
    if(section!=='—')q=q.eq('section',section)
    const {data:s}=await q.limit(1).maybeSingle()
    if(s?.id)studentId=s.id
   }

   let decision='—',decisionNote=''
   if(studentId!=='—'&&year!=='—'){
    const {data:d}=await supabase.from('school_student_decisions').select('decision,note').eq('student_id',studentId).eq('academic_year',year).maybeSingle()
    if(d){decision=decisionLabel(ht,d.decision||'pending');decisionNote=(d.note||'').trim()}
   }

   let headers:string[]=[]
   let rows:string[][]=[]
   let docTitle=''
   const generalLabel=ht?'Mwayèn jeneral pondérée':'Moyenne générale pondérée'
   let generalValue='—'
   let bulletinRank='—'

   if(isBulletin){
    const table=card.querySelector('table') as HTMLTableElement|null
    headers=table?Array.from(table.querySelectorAll('thead th')).map(th=>clean(th.textContent||'')):[]
    rows=table?Array.from(table.querySelectorAll('tbody tr')).map(tr=>Array.from(tr.querySelectorAll('td')).map(td=>clean(td.textContent||''))):[]
    const trimester=Array.from(card.querySelectorAll('select')).find(s=>['1','2','3'].includes((s as HTMLSelectElement).value)) as HTMLSelectElement|undefined
    const number=Number(trimester?.value||1)
    docTitle=`${ht?'BILTEN — TRIMÈS':'BULLETIN — TRIMESTRE'} ${number}`
    if(studentId!=='—'){
     const {data:r}=await supabase.rpc('school_student_period_rank',{p_student_id:studentId,p_type:'trimester',p_number:number})
     if(r?.length)bulletinRank=`${r[0].rank_position}/${r[0].cohort_size}`
    }
    let points=0,totalCoeff=0
    for(const r of rows){
     const coeff=Number(String(r[1]||'1').replace(',','.'))||1
     const avg=scoreOf(r[2]||'')
     if(avg!==null){points+=avg*coeff;totalCoeff+=coeff}
    }
    if(totalCoeff)generalValue=fmt(points/totalCoeff)
   }else{
    const typeSelect=Array.from(card.querySelectorAll('select')).find(s=>['trimester','control'].includes((s as HTMLSelectElement).value)) as HTMLSelectElement|undefined
    const assessmentType=typeSelect?.value==='control'?'control':'trimester'
    const type=assessmentType==='control'?(ht?'KONTWÒL':'CONTRÔLE'):(ht?'TRIMÈS':'TRIMESTRE')
    docTitle=`${ht?'RELVE NÒT':'RELEVÉ DE NOTES'} — ${type}`
    headers=[ht?'Peryòd':'Période',ht?'Matiyè':'Matière',ht?'Nòt':'Note',ht?'Ran':'Rang']
    const rankMap=new Map<number,string>()
    if(studentId!=='—'){
     const count=assessmentType==='control'?4:3
     for(let n=1;n<=count;n++){
      const {data:r}=await supabase.rpc('school_student_period_rank',{p_student_id:studentId,p_type:assessmentType,p_number:n})
      rankMap.set(n,r?.length?`${r[0].rank_position}/${r[0].cohort_size}`:'—')
     }
    }
    const periodBlocks=Array.from(card.querySelectorAll('div')).filter(d=>{
     const t=clean(d.textContent||'')
     return /^(Trimès|Trimestre|Kontwòl|Contrôle) [1-4]/.test(t)
    }) as HTMLElement[]
    const unique=periodBlocks.filter((d,i,arr)=>!arr.some((other,j)=>j!==i&&other.contains(d)))
    for(const block of unique){
     const period=Array.from(block.querySelectorAll('strong')).map(s=>clean(s.textContent||'')).find(x=>/^(Trimès|Trimestre|Kontwòl|Contrôle) [1-4]$/.test(x))||''
     const number=Number(period.match(/[1-4]$/)?.[0]||0)
     const table=block.querySelector('table')
     if(!table)continue
     for(const tr of Array.from(table.querySelectorAll('tbody tr'))){
      const cells=Array.from(tr.querySelectorAll('td')).map(td=>clean(td.textContent||''))
      if(cells.length>=2)rows.push([period,cells[0],cells[1],rankMap.get(number)||'—'])
     }
    }

    const {data:subjects}=await supabase.from('school_subjects').select('name,coefficient')
    const coeffMap=new Map((subjects||[]).map(s=>[clean(s.name).toLowerCase(),Math.max(.01,Number(s.coefficient)||1)]))
    const grouped=new Map<string,number[]>()
    for(const r of rows){
     const subject=r[1]||'';const score=scoreOf(r[2]||'')
     if(!subject||score===null)continue
     const list=grouped.get(subject)||[];list.push(score);grouped.set(subject,list)
    }
    let points=0,totalCoeff=0
    grouped.forEach((scores,subject)=>{
     const avg=scores.reduce((a,b)=>a+b,0)/scores.length
     const coeff=coeffMap.get(clean(subject).toLowerCase())||1
     points+=avg*coeff;totalCoeff+=coeff
    })
    if(totalCoeff)generalValue=fmt(points/totalCoeff)
   }

   const info:Array<[string,string]>=[
    [ht?'Elèv':'Élève',student],
    [ht?'ID Elèv':'ID Élève',studentId],
    [ht?'Ane akademik':'Année scolaire',year],
    [ht?'Klas / Nivo':'Classe / Niveau',level],
    [ht?'Seksyon':'Section',section]
   ]
   if(isBulletin)info.push([ht?'Ran nan klas':'Rang dans la classe',bulletinRank])
   info.push([ht?'Desizyon final':'Décision finale',decision])
   if(decisionNote)info.push([ht?'Nòt Direksyon':'Note de la Direction',decisionNote])

   await downloadAcademicDocx({
    filename:`${isBulletin?'Bulletin':'Releve-not'}-${filenameSafe(student)}.docx`,
    title:docTitle,
    schoolName,
    contact,
    info,
    headers:headers.length?headers:[ht?'Matiyè':'Matière',ht?'Nòt':'Note'],
    rows,
    generalLabel,
    generalValue,
    validationTitle:ht?'Validasyon dokiman':'Validation du document',
    signatureLabel:ht?'Siyati Direksyon':'Signature de la Direction',
    stampLabel:ht?'Kachè lekòl la':'Cachet de l’école',
    dateLabel:ht?'Dat':'Date'
   })
  }

  document.addEventListener('click',handler,true)
  return()=>document.removeEventListener('click',handler,true)
 },[])
 return null
}
