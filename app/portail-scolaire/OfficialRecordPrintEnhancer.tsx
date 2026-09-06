'use client'

import {useEffect} from 'react'

function escapeHtml(value:string){
 return value.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[c]||c))
}

function cleanText(value:string){return value.replace(/\s+/g,' ').trim()}

export default function OfficialRecordPrintEnhancer(){
 useEffect(()=>{
  const handler=(event:Event)=>{
   const button=(event.target as HTMLElement|null)?.closest?.('button') as HTMLButtonElement|null
   if(!button)return
   const label=cleanText(button.textContent||'')
   const isDownload=['⬇️ Telechaje Word','⬇️ Télécharger Word'].some(x=>label.includes(x.replace('⬇️ ','')))
   const isPrint=['🖨️ Enprime','🖨️ Imprimer'].some(x=>label.includes(x.replace('🖨️ ','')))
   if(!isDownload&&!isPrint)return

   const card=button.closest('.card') as HTMLElement|null
   if(!card)return
   const title=cleanText(card.querySelector('h2')?.textContent||'')
   const isRecord=/Relve nòt/i.test(title)||/relev[eé]s? de notes/i.test(title)
   if(!isRecord)return

   event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()
   const ht=!/relev[eé]/i.test(title)
   const typeSelect=Array.from(card.querySelectorAll('select')).find(s=>['trimester','control'].includes((s as HTMLSelectElement).value)) as HTMLSelectElement|undefined
   const type=typeSelect?.value==='control'?(ht?'Kontwòl':'Contrôle'):(ht?'Trimès':'Trimestre')

   const infoBoxes=Array.from(card.querySelectorAll('div')).filter(d=>{
    const t=cleanText(d.textContent||'')
    return (t.includes('Elèv:')||t.includes('Élève:'))&&(t.includes('Seksyon:')||t.includes('Section:'))
   })
   const info=infoBoxes.sort((a,b)=>a.textContent!.length-b.textContent!.length)[0] as HTMLElement|undefined
   const infoChildren=info?Array.from(info.children).map(x=>cleanText(x.textContent||'')):[]
   const findInfo=(keys:string[])=>infoChildren.find(x=>keys.some(k=>x.startsWith(k)))?.split(':').slice(1).join(':').trim()||'—'
   const student=findInfo(['Elèv','Élève'])
   const year=findInfo(['Ane akademik','Année scolaire'])
   const level=findInfo(['Klas / Nivo','Classe / Niveau'])
   const section=findInfo(['Seksyon','Section'])

   const periodBlocks=Array.from(card.querySelectorAll('div')).filter(d=>{
    const directStrong=Array.from(d.children).find(c=>c.tagName==='DIV')?.querySelector(':scope > strong')
    const t=cleanText(directStrong?.textContent||'')
    return /^(Trimès|Trimestre|Kontwòl|Contrôle) [1-4]$/.test(t)
   }) as HTMLElement[]
   const unique=periodBlocks.filter((d,i,arr)=>!arr.some((other,j)=>j!==i&&other.contains(d)))
   const periods=unique.map(block=>{
    const strongs=Array.from(block.querySelectorAll('strong')).map(s=>cleanText(s.textContent||''))
    const period=strongs.find(x=>/^(Trimès|Trimestre|Kontwòl|Contrôle) [1-4]$/.test(x))||''
    const avg=strongs.find(x=>/^(Mwayèn|Moyenne)/.test(x))||'—'
    const rows=Array.from(block.querySelectorAll('table tr')).map(tr=>{
     const cells=Array.from(tr.querySelectorAll('td')).map(td=>cleanText(td.textContent||''))
     return cells.length>=2?`<tr><td>${escapeHtml(cells[0])}</td><td>${escapeHtml(cells[1])}</td></tr>`:''
    }).join('')
    return `<section><div class="period"><strong>${escapeHtml(period)}</strong><strong>${escapeHtml(avg)}</strong></div>${rows?`<table><thead><tr><th>${ht?'Matiyè':'Matière'}</th><th>${ht?'Nòt':'Note'}</th></tr></thead><tbody>${rows}</tbody></table>`:`<div class="empty">${ht?'Pa gen nòt pibliye.':'Aucune note publiée.'}</div>`}</section>`
   }).join('')

   const allStrong=Array.from(card.querySelectorAll('strong')).map(s=>cleanText(s.textContent||''))
   const generalIndex=allStrong.findIndex(x=>x==='Mwayèn jeneral'||x==='Moyenne générale')
   const general=generalIndex>=0?(allStrong[generalIndex+1]||'—'):'—'
   const docTitle=ht?'RELVE NÒT':'RELEVÉ DE NOTES'
   const html=`<!doctype html><html><head><meta charset="utf-8"><title>${docTitle}</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#13213a;margin:0;font-size:12px}.header{text-align:center;border-bottom:3px double #123f68;padding-bottom:12px;margin-bottom:16px}.portal{font-size:21px;font-weight:900;letter-spacing:.6px;color:#0f4c81}.subtitle{font-size:11px;margin-top:3px}.doc-title{text-align:center;font-size:20px;font-weight:900;margin:10px 0 14px}.student{border:1px solid #9fb4c8;padding:10px 12px;display:grid;grid-template-columns:1fr 1fr;gap:7px 18px;margin-bottom:14px;background:#f8fafc}.period{display:flex;justify-content:space-between;background:#eaf2f8;border:1px solid #bdccda;padding:8px 10px;margin-top:11px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd7e1;padding:6px 8px}th{text-align:left;background:#f5f8fb}th:last-child,td:last-child{text-align:right;width:22%}.empty{border:1px solid #cbd7e1;border-top:0;padding:7px;color:#667}.general{margin-top:16px;border:2px solid #0f4c81;padding:10px 12px;display:flex;justify-content:space-between;font-size:16px;font-weight:900}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:48px;text-align:center}.line{border-top:1px solid #333;padding-top:6px}.stamp{height:58px;margin-bottom:4px}.footer{text-align:center;margin-top:24px;color:#667;font-size:9px}</style></head><body><div class="header"><div class="portal">PORTAIL SCOLAIRE HAÏTI</div><div class="subtitle">${ht?'Dokiman akademik':'Document académique'}</div></div><div class="doc-title">${docTitle} — ${escapeHtml(type)}</div><div class="student"><div><b>${ht?'Elèv':'Élève'}:</b> ${escapeHtml(student)}</div><div><b>${ht?'Ane akademik':'Année scolaire'}:</b> ${escapeHtml(year)}</div><div><b>${ht?'Klas / Nivo':'Classe / Niveau'}:</b> ${escapeHtml(level)}</div><div><b>${ht?'Seksyon':'Section'}:</b> ${escapeHtml(section)}</div></div>${periods}<div class="general"><span>${ht?'Mwayèn jeneral':'Moyenne générale'}</span><span>${escapeHtml(general)}</span></div><div class="signatures"><div><div class="stamp"></div><div class="line">${ht?'Siyati Direksyon':'Signature de la Direction'}</div></div><div><div class="stamp">${ht?'Kachè lekòl la':'Cachet de l’école'}</div><div class="line">${ht?'Kachè / Dat':'Cachet / Date'}</div></div></div><div class="footer">${ht?'Dokiman pwodwi pa Portail Scolaire Haïti':'Document généré par Portail Scolaire Haïti'}</div></body></html>`

   if(isPrint){const w=window.open('','_blank');if(!w)return;w.document.open();w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),300);return}
   const blob=new Blob(['\ufeff',html],{type:'application/msword;charset=utf-8'})
   const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url
   const safeName=(student||'eleve').replace(/[^a-zA-Z0-9À-ÿ_-]+/g,'-')
   a.download=`Releve-not-${safeName}.doc`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)
  }
  document.addEventListener('click',handler,true)
  return()=>document.removeEventListener('click',handler,true)
 },[])
 return null
}
