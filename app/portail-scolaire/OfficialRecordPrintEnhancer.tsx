'use client'

import {useEffect} from 'react'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')
function escapeHtml(value:string){const map:Record<string,string>={"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'};return value.replace(/[&<>"']/g,(c:string)=>map[c]||c)}
function cleanText(value:string){return value.replace(/\s+/g,' ').trim()}

export default function OfficialRecordPrintEnhancer(){
 useEffect(()=>{
  const handler=async(event:Event)=>{
   const button=(event.target as HTMLElement|null)?.closest?.('button') as HTMLButtonElement|null
   if(!button)return
   const label=cleanText(button.textContent||'')
   const isDownload=/Telechaje Word|Télécharger Word/.test(label)
   const isPrint=/Enprime|Imprimer/.test(label)
   if(!isDownload&&!isPrint)return
   const card=button.closest('.card') as HTMLElement|null
   if(!card)return
   const title=cleanText(card.querySelector('h2')?.textContent||'')
   if(!(/Relve nòt/i.test(title)||/relev[eé]s? de notes/i.test(title)))return
   event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()

   const globalLanguage=document.querySelector('[data-global-language-menu] select') as HTMLSelectElement|null
   const ht=globalLanguage?globalLanguage.value!=='fr':!/relev[eé]/i.test(title)
   const {data:school}=await supabase.from('school_settings').select('school_name,address,phone,email,logo_url').eq('id',1).maybeSingle()
   const schoolName=school?.school_name||'Portail Scolaire Haïti'
   const contact=[school?.address,school?.phone,school?.email].filter(Boolean).join(' • ')
   const logo=school?.logo_url?`<img class="logo" src="${escapeHtml(school.logo_url)}" alt="Logo"/>`:''

   const typeSelect=Array.from(card.querySelectorAll('select')).find(s=>['trimester','control'].includes((s as HTMLSelectElement).value)) as HTMLSelectElement|undefined
   const type=typeSelect?.value==='control'?(ht?'Kontwòl':'Contrôle'):(ht?'Trimès':'Trimestre')
   const infoBoxes=Array.from(card.querySelectorAll('div')).filter(d=>{const t=cleanText(d.textContent||'');return (t.includes('Elèv:')||t.includes('Élève:'))&&(t.includes('Seksyon:')||t.includes('Section:'))})
   const info=infoBoxes.sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length)[0] as HTMLElement|undefined
   const infoChildren=info?Array.from(info.children).map(x=>cleanText(x.textContent||'')):[]
   const findInfo=(keys:string[])=>infoChildren.find(x=>keys.some(k=>x.startsWith(k)))?.split(':').slice(1).join(':').trim()||'—'
   const student=findInfo(['Elèv','Élève']),year=findInfo(['Ane akademik','Année scolaire']),level=findInfo(['Klas / Nivo','Classe / Niveau']),section=findInfo(['Seksyon','Section'])

   const periodBlocks=Array.from(card.querySelectorAll('div')).filter(d=>{const direct=Array.from(d.children).find(c=>c.tagName==='DIV')?.querySelector(':scope > strong');return /^(Trimès|Trimestre|Kontwòl|Contrôle) [1-4]$/.test(cleanText(direct?.textContent||''))}) as HTMLElement[]
   const unique=periodBlocks.filter((d,i,arr)=>!arr.some((other,j)=>j!==i&&other.contains(d)))
   const periods=unique.map(block=>{
    const strongs=Array.from(block.querySelectorAll('strong')).map(s=>cleanText(s.textContent||''))
    const period=strongs.find(x=>/^(Trimès|Trimestre|Kontwòl|Contrôle) [1-4]$/.test(x))||''
    const avg=strongs.find(x=>/^(Mwayèn|Moyenne)/.test(x))||'—'
    const rows=Array.from(block.querySelectorAll('table tr')).map(tr=>{const cells=Array.from(tr.querySelectorAll('td')).map(td=>cleanText(td.textContent||''));return cells.length>=2?`<tr><td>${escapeHtml(cells[0])}</td><td>${escapeHtml(cells[1])}</td></tr>`:''}).join('')
    return `<section><div class="period"><strong>${escapeHtml(period)}</strong><strong>${escapeHtml(avg)}</strong></div>${rows?`<table><thead><tr><th>${ht?'Matiyè':'Matière'}</th><th>${ht?'Nòt':'Note'}</th></tr></thead><tbody>${rows}</tbody></table>`:`<div class="empty">${ht?'Pa gen nòt pibliye.':'Aucune note publiée.'}</div>`}</section>`
   }).join('')

   const allStrong=Array.from(card.querySelectorAll('strong')).map(s=>cleanText(s.textContent||''))
   const weightedLabel=ht?'Mwayèn jeneral pondérée':'Moyenne générale pondérée'
   const regularLabel=ht?'Mwayèn jeneral':'Moyenne générale'
   let general='—'
   const wi=allStrong.findIndex(x=>x===weightedLabel)
   if(wi>=0)general=allStrong[wi+1]||'—'
   else{const gi=allStrong.findIndex(x=>x===regularLabel);if(gi>=0)general=allStrong[gi+1]||'—'}

   const docTitle=ht?'RELVE NÒT':'RELEVÉ DE NOTES'
   const generalTitle=wi>=0?weightedLabel:regularLabel
   const html=`<!doctype html><html><head><meta charset="utf-8"><title>${docTitle}</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#13213a;margin:0;font-size:12px}.header{text-align:center;border-bottom:3px double #123f68;padding-bottom:12px;margin-bottom:16px}.logo{max-width:86px;max-height:86px;object-fit:contain;margin-bottom:7px}.school{font-size:22px;font-weight:900;color:#0f4c81}.contact{font-size:10px;margin-top:4px;color:#5e6a78}.doc-title{text-align:center;font-size:20px;font-weight:900;margin:10px 0 14px}.student{border:1px solid #9fb4c8;padding:10px 12px;display:grid;grid-template-columns:1fr 1fr;gap:7px 18px;margin-bottom:14px;background:#f8fafc}.period{display:flex;justify-content:space-between;background:#eaf2f8;border:1px solid #bdccda;padding:8px 10px;margin-top:11px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd7e1;padding:6px 8px}th{text-align:left;background:#f5f8fb}th:last-child,td:last-child{text-align:right;width:22%}.empty{border:1px solid #cbd7e1;border-top:0;padding:7px;color:#667}.general{margin-top:16px;border:2px solid #0f4c81;padding:10px 12px;display:flex;justify-content:space-between;font-size:16px;font-weight:900}.validation{margin-top:28px;border:1px solid #9fb4c8;border-radius:10px;padding:14px}.validation-title{font-weight:900;color:#0f4c81;margin-bottom:20px}.validation-grid{display:grid;grid-template-columns:1fr 1fr;gap:26px}.validation-field{padding-top:46px;border-bottom:1px solid #374151}.validation-label{font-weight:800;padding-top:6px}.date-field{grid-column:1/-1;margin-top:8px}.footer{text-align:center;margin-top:24px;color:#667;font-size:9px}</style></head><body><div class="header">${logo}<div class="school">${escapeHtml(schoolName)}</div>${contact?`<div class="contact">${escapeHtml(contact)}</div>`:''}</div><div class="doc-title">${docTitle} — ${escapeHtml(type)}</div><div class="student"><div><b>${ht?'Elèv':'Élève'}:</b> ${escapeHtml(student)}</div><div><b>${ht?'Ane akademik':'Année scolaire'}:</b> ${escapeHtml(year)}</div><div><b>${ht?'Klas / Nivo':'Classe / Niveau'}:</b> ${escapeHtml(level)}</div><div><b>${ht?'Seksyon':'Section'}:</b> ${escapeHtml(section)}</div></div>${periods}<div class="general"><span>${generalTitle}</span><span>${escapeHtml(general)}</span></div><div class="validation"><div class="validation-title">${ht?'Validasyon dokiman':'Validation du document'}</div><div class="validation-grid"><div><div class="validation-field"></div><div class="validation-label">${ht?'Siyati Direksyon':'Signature de la Direction'}</div></div><div><div class="validation-field"></div><div class="validation-label">${ht?'Kachè lekòl la':'Cachet de l’école'}</div></div><div class="date-field"><div class="validation-field" style="padding-top:28px"></div><div class="validation-label">${ht?'Dat':'Date'}</div></div></div></div><div class="footer">${ht?'Dokiman akademik ofisyèl':'Document académique officiel'}</div></body></html>`
   if(isPrint){const w=window.open('','_blank');if(!w)return;w.document.open();w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),300);return}
   const blob=new Blob(['\ufeff',html],{type:'application/msword;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Releve-not-${(student||'eleve').replace(/[^a-zA-Z0-9À-ÿ_-]+/g,'-')}.doc`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)
  }
  document.addEventListener('click',handler,true);return()=>document.removeEventListener('click',handler,true)
 },[])
 return null
}
