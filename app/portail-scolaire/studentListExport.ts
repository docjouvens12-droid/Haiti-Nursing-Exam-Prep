'use client'

import {createClient} from '@supabase/supabase-js'
import {downloadAcademicDocx} from './wordDocx'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type StudentRow={id:string;name:string;level:string;section:string;year:string}
type ExportArgs={students:StudentRow[];year:string;level?:string;section?:string;ht:boolean;issuer:'direction'|'secretary'}

function esc(v:string){return (v||'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[c]||c))}
function safe(v:string){return (v||'liste-eleves').replace(/[^a-zA-Z0-9À-ÿ_-]+/g,'-')}
async function schoolInfo(){
 const {data}=await supabase.from('school_settings').select('school_name,address,phone,email').eq('id',1).maybeSingle()
 return {name:data?.school_name||'Portail Scolaire Haïti',contact:[data?.address,data?.phone,data?.email].filter(Boolean).join(' • ')}
}

export async function printStudentList({students,year,level,section,ht,issuer}:ExportArgs){
 const school=await schoolInfo()
 const title=ht?'LIS ELÈV YO':'LISTE DES ÉLÈVES'
 const issuerLabel=issuer==='direction'?(ht?'Direksyon':'Direction'):(ht?'Sekretarya':'Secrétariat')
 const rows=students.map((s,i)=>`<tr><td>${i+1}</td><td>${esc(s.id)}</td><td>${esc(s.name)}</td><td>${esc(s.level)}</td><td>${esc(s.section)}</td></tr>`).join('')
 const html=`<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#13213a;font-size:12px}.school{text-align:center;font-size:22px;font-weight:900;color:#0f4c81}.contact{text-align:center;color:#637083;font-size:10px;margin:4px 0 14px}h1{text-align:center;margin:12px 0}.info{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;border:1px solid #b9c9d8;padding:10px 12px;margin-bottom:14px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd7e1;padding:7px}th{background:#eef4f8;text-align:left}th:first-child,td:first-child{text-align:center;width:42px}.count{margin:12px 0;font-weight:800}.validation{margin-top:32px;display:grid;grid-template-columns:1fr 1fr;gap:34px}.line{padding-top:48px;border-bottom:1px solid #374151}.date{margin-top:24px}</style></head><body><div class="school">${esc(school.name)}</div>${school.contact?`<div class="contact">${esc(school.contact)}</div>`:''}<h1>${title}</h1><div class="info"><div><b>${ht?'Ane akademik':'Année académique'}:</b> ${esc(year||'—')}</div><div><b>${ht?'Klas / Nivo':'Classe / Niveau'}:</b> ${esc(level|| (ht?'Tout klas':'Toutes les classes'))}</div><div><b>${ht?'Seksyon':'Section'}:</b> ${esc(section|| (ht?'Tout seksyon':'Toutes les sections'))}</div><div><b>${ht?'Kantite elèv':'Nombre d’élèves'}:</b> ${students.length}</div></div><table><thead><tr><th>N°</th><th>${ht?'ID Elèv':'ID Élève'}</th><th>${ht?'Non ak siyati':'Nom et prénom'}</th><th>${ht?'Klas / Nivo':'Classe / Niveau'}</th><th>${ht?'Seksyon':'Section'}</th></tr></thead><tbody>${rows}</tbody></table><div class="validation"><div><div class="line"></div><b>${ht?'Siyati':'Signature'} — ${issuerLabel}</b></div><div><div class="line"></div><b>${ht?'Kachè lekòl la':'Cachet de l’école'}</b></div></div><div class="date"><div class="line"></div><b>${ht?'Dat':'Date'}</b></div></body></html>`
 const w=window.open('','_blank');if(!w)return;w.document.open();w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),300)
}

export async function downloadStudentListDocx({students,year,level,section,ht,issuer}:ExportArgs){
 const school=await schoolInfo()
 const issuerLabel=issuer==='direction'?(ht?'Direksyon':'Direction'):(ht?'Sekretarya':'Secrétariat')
 const scope=[year,level,section].filter(Boolean).join('-')||'tout-elèv'
 await downloadAcademicDocx({
  filename:`Liste-eleves-${safe(scope)}.docx`,
  title:ht?'LIS ELÈV YO':'LISTE DES ÉLÈVES',
  schoolName:school.name,
  contact:school.contact,
  info:[
   [ht?'Ane akademik':'Année académique',year||'—'],
   [ht?'Klas / Nivo':'Classe / Niveau',level||(ht?'Tout klas':'Toutes les classes')],
   [ht?'Seksyon':'Section',section||(ht?'Tout seksyon':'Toutes les sections')],
   [ht?'Kantite elèv':'Nombre d’élèves',String(students.length)]
  ],
  headers:['N°',ht?'ID Elèv':'ID Élève',ht?'Non ak siyati':'Nom et prénom',ht?'Klas / Nivo':'Classe / Niveau',ht?'Seksyon':'Section'],
  rows:students.map((s,i)=>[String(i+1),s.id,s.name,s.level,s.section]),
  validationTitle:ht?'Validasyon dokiman':'Validation du document',
  signatureLabel:`${ht?'Siyati':'Signature'} — ${issuerLabel}`,
  stampLabel:ht?'Kachè lekòl la':'Cachet de l’école',
  dateLabel:ht?'Dat':'Date'
 })
}
