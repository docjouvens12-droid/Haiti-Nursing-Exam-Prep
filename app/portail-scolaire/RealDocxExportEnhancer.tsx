'use client'

import {useEffect} from 'react'
import {createClient} from '@supabase/supabase-js'
import {downloadAcademicDocx} from './wordDocx'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

function clean(v:string){return (v||'').replace(/\s+/g,' ').trim()}
function filenameSafe(v:string){return (v||'eleve').replace(/[^a-zA-Z0-9À-ÿ_-]+/g,'-')}

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
   const idText=Array.from(card.querySelectorAll('*')).map(x=>clean(x.textContent||'')).find(x=>/^ID (Elèv|Élève):/i.test(x))||''
   const studentId=idText.split(':').slice(1).join(':').trim()||'—'

   const info:Array<[string,string]>=[
    [ht?'Elèv':'Élève',student],
    [ht?'ID Elèv':'ID Élève',studentId],
    [ht?'Ane akademik':'Année scolaire',year],
    [ht?'Klas / Nivo':'Classe / Niveau',level],
    [ht?'Seksyon':'Section',section]
   ]

   let headers:string[]=[]
   let rows:string[][]=[]
   let docTitle=''
   let generalLabel=ht?'Mwayèn jeneral pondérée':'Moyenne générale pondérée'
   let generalValue='—'

   if(isBulletin){
    const table=card.querySelector('table') as HTMLTableElement|null
    headers=table?Array.from(table.querySelectorAll('thead th')).map(th=>clean(th.textContent||'')):[]
    rows=table?Array.from(table.querySelectorAll('tbody tr')).map(tr=>Array.from(tr.querySelectorAll('td')).map(td=>clean(td.textContent||''))):[]
    const trimester=Array.from(card.querySelectorAll('select')).find(s=>['1','2','3'].includes((s as HTMLSelectElement).value)) as HTMLSelectElement|undefined
    docTitle=`${ht?'BILTEN — TRIMÈS':'BULLETIN — TRIMESTRE'} ${trimester?.value||''}`.trim()
   }else{
    headers=[ht?'Peryòd':'Période',ht?'Matiyè':'Matière',ht?'Nòt':'Note']
    const periodBlocks=Array.from(card.querySelectorAll('div')).filter(d=>{
     const t=clean(d.textContent||'')
     return /^(Trimès|Trimestre|Kontwòl|Contrôle) [1-4]/.test(t)
    }) as HTMLElement[]
    const unique=periodBlocks.filter((d,i,arr)=>!arr.some((other,j)=>j!==i&&other.contains(d)))
    for(const block of unique){
     const period=Array.from(block.querySelectorAll('strong')).map(s=>clean(s.textContent||'')).find(x=>/^(Trimès|Trimestre|Kontwòl|Contrôle) [1-4]$/.test(x))||''
     const table=block.querySelector('table')
     if(!table)continue
     for(const tr of Array.from(table.querySelectorAll('tbody tr'))){
      const cells=Array.from(tr.querySelectorAll('td')).map(td=>clean(td.textContent||''))
      if(cells.length>=2)rows.push([period,cells[0],cells[1]])
     }
    }
    const typeSelect=Array.from(card.querySelectorAll('select')).find(s=>['trimester','control'].includes((s as HTMLSelectElement).value)) as HTMLSelectElement|undefined
    const type=typeSelect?.value==='control'?(ht?'KONTWÒL':'CONTRÔLE'):(ht?'TRIMÈS':'TRIMESTRE')
    docTitle=`${ht?'RELVE NÒT':'RELEVÉ DE NOTES'} — ${type}`
   }

   const strongs=Array.from(card.querySelectorAll('strong')).map(s=>clean(s.textContent||''))
   const weightedIndex=strongs.findIndex(x=>x===generalLabel)
   if(weightedIndex>=0)generalValue=strongs[weightedIndex+1]||'—'
   if(generalValue==='—'){
    const avg=strongs.find(x=>/^\d+(\.\d+)?%$/.test(x))
    if(avg)generalValue=avg
   }

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
