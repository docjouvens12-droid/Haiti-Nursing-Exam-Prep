'use client'

import {useEffect} from 'react'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')
function escapeHtml(value:string){const map:Record<string,string>={"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'};return (value||'').replace(/[&<>"']/g,(c:string)=>map[c]||c)}
function cleanText(value:string){return (value||'').replace(/\s+/g,' ').trim()}
function decisionLabel(ht:boolean,value:string){if(value==='admitted')return 'Admis';if(value==='deferred')return ht?'Ajouné':'Ajourné';return ht?'An atant':'En attente'}

export default function OfficialRecordPrintEnhancer(){
 useEffect(()=>{
  const handler=async(event:Event)=>{
   const button=(event.target as HTMLElement|null)?.closest?.('button') as HTMLButtonElement|null
   if(!button||!/Enprime|Imprimer/i.test(cleanText(button.textContent||'')))return
   const card=button.closest('.card') as HTMLElement|null
   if(!card)return
   const title=cleanText(card.querySelector('h2')?.textContent||'')
   const isBulletin=['Bilten mwen','Mon bulletin'].includes(title)
   const isRecord=/Relve nòt|relev[eé]s? de notes/i.test(title)
   if(!isBulletin&&!isRecord)return
   event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()

   const globalLanguage=document.querySelector('[data-global-language-menu] select') as HTMLSelectElement|null
   const ht=globalLanguage?.value!=='fr'
   const {data:school}=await supabase.from('school_settings').select('school_name,address,phone,email,logo_url').eq('id',1).maybeSingle()
   const schoolName=school?.school_name||'Portail Scolaire Haïti'
   const contact=[school?.address,school?.phone,school?.email].filter(Boolean).join(' • ')
   const logo=school?.logo_url?`<img class="logo" src="${escapeHtml(school.logo_url)}" alt="Logo"/>`:''

   const infoBoxes=Array.from(card.querySelectorAll('div')).filter(d=>{const t=cleanText(d.textContent||'');return (t.includes('Elèv:')||t.includes('Élève:'))&&(t.includes('Seksyon:')||t.includes('Section:'))})
   const info=infoBoxes.sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length)[0] as HTMLElement|undefined
   const infoChildren=info?Array.from(info.children).map(x=>cleanText(x.textContent||'')):[]
   const findInfo=(keys:string[])=>infoChildren.find(x=>keys.some(k=>x.startsWith(k)))?.split(':').slice(1).join(':').trim()||'—'
   const student=findInfo(['Elèv','Élève']),year=findInfo(['Ane akademik','Année scolaire']),level=findInfo(['Klas / Nivo','Classe / Niveau']),section=findInfo(['Seksyon','Section'])

   let studentId='—'
   const visibleId=Array.from(card.querySelectorAll('*')).map(x=>cleanText(x.textContent||'')).find(x=>/^ID (Elèv|Élève):/i.test(x))||''
   const parsedId=visibleId.split(':').slice(1).join(':').trim()
   if(parsedId&&parsedId!=='—')studentId=parsedId
   if(studentId==='—'&&student!=='—'){
    let q=supabase.from('school_students').select('id').eq('name',student)
    if(year!=='—')q=q.eq('academic_year',year)
    if(level!=='—')q=q.eq('level',level)
    if(section!=='—')q=q.eq('section',section)
    const {data:s}=await q.limit(1).maybeSingle();if(s?.id)studentId=s.id
   }

   let decision='—',decisionNote=''
   if(studentId!=='—'&&year!=='—'){
    const {data:d}=await supabase.from('school_student_decisions').select('decision,note').eq('student_id',studentId).eq('academic_year',year).maybeSingle()
    if(d){decision=decisionLabel(ht,d.decision||'pending');decisionNote=(d.note||'').trim()}
   }

   let docTitle='',content='',general='—',generalTitle=ht?'Mwayèn jeneral pondérée':'Moyenne générale pondérée',rankSummary='—'

   if(isBulletin){
    const trim=Array.from(card.querySelectorAll('select')).find(s=>['1','2','3'].includes((s as HTMLSelectElement).value)) as HTMLSelectElement|undefined
    const number=Number(trim?.value||1)
    docTitle=`${ht?'BILTEN — TRIMÈS':'BULLETIN — TRIMESTRE'} ${number}`
    if(studentId!=='—'){
     const {data:r}=await supabase.rpc('school_student_period_rank',{p_student_id:studentId,p_type:'trimester',p_number:number})
     if(r?.length)rankSummary=`${r[0].rank_position}/${r[0].cohort_size}`
    }
    const table=card.querySelector('table') as HTMLTableElement|null
    if(table){
     const headers=Array.from(table.querySelectorAll('thead th')).map(th=>`<th>${escapeHtml(cleanText(th.textContent||''))}</th>`).join('')
     const rows=Array.from(table.querySelectorAll('tbody tr')).map(tr=>`<tr>${Array.from(tr.querySelectorAll('td')).map(td=>`<td>${escapeHtml(cleanText(td.textContent||''))}</td>`).join('')}</tr>`).join('')
     content=`<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`
    }
   }else{
    const typeSelect=Array.from(card.querySelectorAll('select')).find(s=>['trimester','control'].includes((s as HTMLSelectElement).value)) as HTMLSelectElement|undefined
    const assessmentType=typeSelect?.value==='control'?'control':'trimester'
    const type=assessmentType==='control'?(ht?'KONTWÒL':'CONTRÔLE'):(ht?'TRIMÈS':'TRIMESTRE')
    docTitle=`${ht?'RELVE NÒT':'RELEVÉ DE NOTES'} — ${type}`
    const blocks=Array.from(card.querySelectorAll('div')).filter(d=>{const direct=Array.from(d.children).find(c=>c.tagName==='DIV')?.querySelector(':scope > strong');return /^(Trimès|Trimestre|Kontwòl|Contrôle) [1-4]$/.test(cleanText(direct?.textContent||''))}) as HTMLElement[]
    const unique=blocks.filter((d,i,arr)=>!arr.some((other,j)=>j!==i&&other.contains(d)))
    const rankMap=new Map<number,string>()
    if(studentId!=='—'){
     const count=assessmentType==='control'?4:3
     for(let n=1;n<=count;n++){const {data:r}=await supabase.rpc('school_student_period_rank',{p_student_id:studentId,p_type:assessmentType,p_number:n});rankMap.set(n,r?.length?`${r[0].rank_position}/${r[0].cohort_size}`:'—')}
    }
    content=unique.map(block=>{
     const strongs=Array.from(block.querySelectorAll('strong')).map(s=>cleanText(s.textContent||''))
     const period=strongs.find(x=>/^(Trimès|Trimestre|Kontwòl|Contrôle) [1-4]$/.test(x))||''
     const number=Number(period.match(/[1-4]$/)?.[0]||0)
     const avg=strongs.find(x=>/^(Mwayèn|Moyenne)/.test(x))||'—'
     const rows=Array.from(block.querySelectorAll('table tbody tr')).map(tr=>{const cells=Array.from(tr.querySelectorAll('td')).map(td=>cleanText(td.textContent||''));return cells.length>=2?`<tr><td>${escapeHtml(cells[0])}</td><td>${escapeHtml(cells[1])}</td></tr>`:''}).join('')
     return `<section><div class="period"><strong>${escapeHtml(period)}</strong><span>${ht?'Ran':'Rang'}: ${escapeHtml(rankMap.get(number)||'—')}</span><strong>${escapeHtml(avg)}</strong></div>${rows?`<table><thead><tr><th>${ht?'Matiyè':'Matière'}</th><th>${ht?'Nòt':'Note'}</th></tr></thead><tbody>${rows}</tbody></table>`:`<div class="empty">${ht?'Pa gen nòt pibliye.':'Aucune note publiée.'}</div>`}</section>`
    }).join('')
   }

   const allStrong=Array.from(card.querySelectorAll('strong')).map(s=>cleanText(s.textContent||''))
   const wi=allStrong.findIndex(x=>x===generalTitle)
   if(wi>=0)general=allStrong[wi+1]||'—'
   if(general==='—'){const regular=ht?'Mwayèn jeneral':'Moyenne générale';const gi=allStrong.findIndex(x=>x===regular);if(gi>=0){general=allStrong[gi+1]||'—';generalTitle=regular}}

   const extraRank=isBulletin?`<div><b>${ht?'Ran nan klas':'Rang dans la classe'}:</b> ${escapeHtml(rankSummary)}</div>`:''
   const noteHtml=decisionNote?`<div class="decision-note"><b>${ht?'Nòt Direksyon':'Note de la Direction'}:</b> ${escapeHtml(decisionNote)}</div>`:''
   const html=`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(docTitle)}</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#13213a;margin:0;font-size:12px}.header{text-align:center;border-bottom:3px double #123f68;padding-bottom:12px;margin-bottom:16px}.logo{max-width:80px;max-height:80px;object-fit:contain;margin-bottom:7px}.school{font-size:22px;font-weight:900;color:#0f4c81}.contact{font-size:10px;margin-top:4px;color:#5e6a78}.doc-title{text-align:center;font-size:20px;font-weight:900;margin:10px 0 14px}.student{border:1px solid #9fb4c8;padding:10px 12px;display:grid;grid-template-columns:1fr 1fr;gap:7px 18px;margin-bottom:14px;background:#f8fafc}.period{display:grid;grid-template-columns:1fr auto auto;gap:18px;background:#eaf2f8;border:1px solid #bdccda;padding:8px 10px;margin-top:11px}table{width:100%;border-collapse:collapse;margin-bottom:8px}th,td{border:1px solid #cbd7e1;padding:6px 8px}th{text-align:left;background:#f5f8fb}th:not(:first-child),td:not(:first-child){text-align:right}.empty{border:1px solid #cbd7e1;padding:7px;color:#667}.general{margin-top:16px;border:2px solid #0f4c81;padding:10px 12px;display:flex;justify-content:space-between;font-size:16px;font-weight:900}.decision{margin-top:14px;border:1px solid #9fb4c8;padding:10px 12px;background:#f8fafc}.decision-note{margin-top:6px;color:#4b5563}.validation{margin-top:28px;border:1px solid #9fb4c8;border-radius:10px;padding:14px}.validation-title{font-weight:900;color:#0f4c81;margin-bottom:20px}.validation-grid{display:grid;grid-template-columns:1fr 1fr;gap:26px}.validation-field{padding-top:46px;border-bottom:1px solid #374151}.validation-label{font-weight:800;padding-top:6px}.date-field{grid-column:1/-1;margin-top:8px}.footer{text-align:center;margin-top:24px;color:#667;font-size:9px}</style></head><body><div class="header">${logo}<div class="school">${escapeHtml(schoolName)}</div>${contact?`<div class="contact">${escapeHtml(contact)}</div>`:''}</div><div class="doc-title">${escapeHtml(docTitle)}</div><div class="student"><div><b>${ht?'Elèv':'Élève'}:</b> ${escapeHtml(student)}</div><div><b>${ht?'ID Elèv':'ID Élève'}:</b> ${escapeHtml(studentId)}</div><div><b>${ht?'Ane akademik':'Année scolaire'}:</b> ${escapeHtml(year)}</div><div><b>${ht?'Klas / Nivo':'Classe / Niveau'}:</b> ${escapeHtml(level)}</div><div><b>${ht?'Seksyon':'Section'}:</b> ${escapeHtml(section)}</div>${extraRank}</div>${content}<div class="general"><span>${escapeHtml(generalTitle)}</span><span>${escapeHtml(general)}</span></div><div class="decision"><b>${ht?'Desizyon final':'Décision finale'}:</b> ${escapeHtml(decision)}${noteHtml}</div><div class="validation"><div class="validation-title">${ht?'Validasyon dokiman':'Validation du document'}</div><div class="validation-grid"><div><div class="validation-field"></div><div class="validation-label">${ht?'Siyati Direksyon':'Signature de la Direction'}</div></div><div><div class="validation-field"></div><div class="validation-label">${ht?'Kachè lekòl la':'Cachet de l’école'}</div></div><div class="date-field"><div class="validation-field" style="padding-top:28px"></div><div class="validation-label">${ht?'Dat':'Date'}</div></div></div></div><div class="footer">${ht?'Dokiman akademik ofisyèl':'Document académique officiel'}</div></body></html>`
   const w=window.open('','_blank');if(!w)return;w.document.open();w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),300)
  }
  document.addEventListener('click',handler,true);return()=>document.removeEventListener('click',handler,true)
 },[])
 return null
}
