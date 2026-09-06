'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@supabase/supabase-js'
import {downloadStudentListDocx,printStudentList} from './studentListExport'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Student={id:string;name:string;level:string;section:string;year:string}
type SchoolClass={id:number;name:string;section:string}

const SECTION_OPTIONS=['A','B','C','D']
const SCHOOL_LEVELS=['7e Année Fondamentale','8e Année Fondamentale','9e Année Fondamentale','NS I','NS II','NS III','NS IV']

function levelKey(value:string){return value.trim().toLowerCase().replace(/\s+/g,' ').replace(/^8\s+année\s+fondamentale$/,'8e année fondamentale')}
function nextAcademicYear(){const now=new Date();const y=now.getFullYear();const start=now.getMonth()>=6?y:y-1;return `${start}–${start+1}`}
function storedYear(){return typeof window==='undefined'?'':window.localStorage.getItem('ps-academic-year')||''}

export default function DirectionStudentManager(){
 const [host,setHost]=useState<HTMLElement|null>(null)
 const [lang,setLang]=useState<'ht'|'fr'>('fr')
 const [authorized,setAuthorized]=useState(false)
 const [students,setStudents]=useState<Student[]>([])
 const [classes,setClasses]=useState<SchoolClass[]>([])
 const [year,setYear]=useState('')
 const [level,setLevel]=useState('')
 const [section,setSection]=useState('')
 const [search,setSearch]=useState('')
 const [adding,setAdding]=useState(false)
 const [editingId,setEditingId]=useState<string|null>(null)
 const [message,setMessage]=useState('')
 const [error,setError]=useState('')
 const ht=lang==='ht'

 const load=async()=>{
  const {data:{user}}=await supabase.auth.getUser()
  if(!user){setAuthorized(false);return}
  const pr=await supabase.from('school_profiles').select('role').eq('user_id',user.id).maybeSingle()
  if(pr.data?.role!=='direction'){setAuthorized(false);return}
  setAuthorized(true)
  const [sr,cr]=await Promise.all([supabase.from('school_students').select('*').order('name'),supabase.from('school_classes').select('*').order('name')])
  if(sr.error||cr.error){setError(sr.error?.message||cr.error?.message||'Erreur');return}
  const mapped=(sr.data||[]).map((x:any)=>({id:x.id,name:x.name,level:x.level,section:x.section,year:x.academic_year}))
  setStudents(mapped);setClasses((cr.data||[]).map((x:any)=>({id:x.id,name:x.name,section:x.section})))
  if(!year)setYear(storedYear()||[...new Set(mapped.map((s:Student)=>s.year).filter(Boolean))].sort().reverse()[0]||nextAcademicYear())
 }

 useEffect(()=>{
  load()
  const findHost=()=>{const sections=Array.from(document.querySelectorAll<HTMLElement>('.ps-page section.card'));const found=sections.find(s=>{const title=s.querySelector('h2')?.textContent?.trim().toLowerCase()||'';return title==='jere elèv'||title==='gérer les élèves'})||null;if(found){found.classList.add('direction-student-manager-host');setHost(found)}else setHost(null)}
  findHost();const observer=new MutationObserver(findHost);observer.observe(document.body,{childList:true,subtree:true})
  const selector=document.querySelector<HTMLSelectElement>('[data-global-language-menu="true"] select');if(selector)setLang(selector.value==='ht'?'ht':'fr')
  const onLang=(e:Event)=>setLang((e.target as HTMLSelectElement).value==='ht'?'ht':'fr')
  const onYear=(e:Event)=>{setYear((e as CustomEvent<{year:string}>).detail?.year||storedYear());setLevel('');setSection('')}
  selector?.addEventListener('change',onLang);window.addEventListener('school-academic-year-change',onYear)
  return()=>{observer.disconnect();selector?.removeEventListener('change',onLang);window.removeEventListener('school-academic-year-change',onYear)}
 },[])

 const levels=useMemo(()=>{const extras=[...classes.map(c=>c.name),...students.filter(s=>!year||s.year===year).map(s=>s.level)].filter(Boolean);const officialKeys=new Set(SCHOOL_LEVELS.map(levelKey));const seen=new Set(officialKeys);const uniqueExtras:string[]=[];for(const x of extras){const key=levelKey(x);if(seen.has(key))continue;seen.add(key);uniqueExtras.push(x)}return [...SCHOOL_LEVELS,...uniqueExtras]},[classes,students,year])
 const sections=useMemo(()=>[...new Set([...SECTION_OPTIONS,...classes.filter(c=>!level||levelKey(c.name)===levelKey(level)).map(c=>c.section),...students.filter(s=>(!year||s.year===year)&&(!level||levelKey(s.level)===levelKey(level))).map(s=>s.section)].filter(Boolean))].sort(),[classes,students,year,level])
 const filtered=useMemo(()=>students.filter(s=>(!year||s.year===year)&&(!level||levelKey(s.level)===levelKey(level))&&(!section||s.section===section)&&(!search||`${s.id} ${s.name}`.toLowerCase().includes(search.toLowerCase()))),[students,year,level,section,search])

 const addStudent=async(fd:FormData)=>{
  setError('');setMessage('');const name=String(fd.get('name')||'').trim(),studentLevel=String(fd.get('level')||'').trim(),studentSection=String(fd.get('section')||'').trim(),academicYear=String(fd.get('year')||year||nextAcademicYear()).trim();if(!name||!studentLevel||!studentSection||!academicYear)return
  const next=students.reduce((m,s)=>Math.max(m,Number(s.id.split('-')[1])||0),0)+1;const id=`ELV-${String(next).padStart(3,'0')}`
  const {error}=await supabase.from('school_students').insert({id,name,level:studentLevel,section:studentSection,academic_year:academicYear});if(error){setError(error.message);return}
  setAdding(false);setLevel(studentLevel);setSection(studentSection);setMessage(ht?'Elèv la ajoute avèk siksè.':'Élève ajouté avec succès.');await load()
 }
 const saveStudent=async(id:string,fd:FormData)=>{setError('');setMessage('');const payload={name:String(fd.get('name')||'').trim(),level:String(fd.get('level')||'').trim(),section:String(fd.get('section')||'').trim(),academic_year:String(fd.get('year')||'').trim()};const {error}=await supabase.from('school_students').update(payload).eq('id',id);if(error){setError(error.message);return}setEditingId(null);setMessage(ht?'Enfòmasyon elèv la modifye.':'Informations de l’élève modifiées.');await load()}
 const exportArgs={students:filtered,year,level,section,ht,issuer:'direction' as const}

 if(!host||!authorized)return null
 return createPortal(<div className="direction-student-manager-native">
  <style>{`.direction-student-manager-host> :not(.direction-student-manager-native){display:none!important}.dsmFilters{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0}.dsmFilters label,.dsmForm label{display:block;font-size:12px;font-weight:800;margin-bottom:5px;color:#4b5563}.dsmFilters select,.dsmFilters input,.dsmForm select,.dsmForm input{width:100%;box-sizing:border-box}.dsmSummary{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.dsmBadge{background:#eef6ff;border:1px solid #cfe4fa;border-radius:999px;padding:7px 11px;font-size:13px;font-weight:800;color:#0f4c81}.dsmStudent{border:1px solid #e5e7eb;border-radius:14px;padding:13px;margin-top:10px;background:#fff}.dsmStudent strong{display:block;margin-bottom:4px}.dsmMeta{font-size:13px;color:#6b7280}.dsmForm{margin-top:14px;padding:14px;border:1px solid #dbeafe;background:#f8fbff;border-radius:14px}.dsmFormGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.dsmActions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}@media(max-width:720px){.dsmFilters,.dsmFormGrid{grid-template-columns:1fr}.dsmStudent .row{gap:7px}.dsmStudent .btn{width:auto}.dsmActions .btn{flex:1 1 150px}}`}</style>
  <h2>{ht?'Jere elèv pa klas ak seksyon':'Gérer les élèves par classe et section'}</h2>
  <p className="muted">{ht?'Ane akademik la soti nan selektè global la anlè. Chwazi klas ak seksyon pou filtre elèv yo.':'L’année académique vient du sélecteur global ci-dessus. Choisissez la classe et la section pour filtrer les élèves.'}</p>
  <div className="dsmFilters"><div><label>{ht?'Klas / Nivo':'Classe / Niveau'}</label><select value={level} onChange={e=>{setLevel(e.target.value);setSection('')}}><option value="">{ht?'Tout klas':'Toutes les classes'}</option>{levels.map(x=><option key={x}>{x}</option>)}</select></div><div><label>{ht?'Seksyon':'Section'}</label><select value={section} onChange={e=>setSection(e.target.value)}><option value="">{ht?'Tout seksyon':'Toutes les sections'}</option>{sections.map(x=><option key={x}>{x}</option>)}</select></div></div>
  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={ht?'Chèche pa non oswa ID elèv':'Rechercher par nom ou identifiant'} />
  <div className="dsmSummary"><span className="dsmBadge">{year}</span>{level&&<span className="dsmBadge">{level}</span>}{section&&<span className="dsmBadge">{ht?'Seksyon':'Section'} {section}</span>}<span className="dsmBadge">{filtered.length} {ht?'elèv':'élève(s)'}</span></div>
  <div className="dsmActions"><button type="button" className="btn" onClick={()=>setAdding(v=>!v)}>➕ {ht?'Ajoute yon elèv':'Ajouter un élève'}</button><button type="button" className="btn secondary" disabled={!filtered.length} onClick={()=>printStudentList(exportArgs)}>🖨️ {ht?'Enprime lis elèv yo':'Imprimer la liste'}</button><button type="button" className="btn secondary" disabled={!filtered.length} onClick={()=>downloadStudentListDocx(exportArgs)}>📄 {ht?'Telechaje Word':'Télécharger Word'}</button></div>
  {error&&<div className="notice" style={{marginTop:12}}>{error}</div>}{message&&<div className="notice" style={{marginTop:12}}>{message}</div>}
  {adding&&<form action={addStudent} className="dsmForm"><div className="dsmFormGrid"><div><label>{ht?'Non elèv':'Nom de l’élève'}</label><input name="name" required/></div><div><label>{ht?'Ane akademik':'Année académique'}</label><input name="year" value={year||nextAcademicYear()} readOnly/></div><div><label>{ht?'Klas / Nivo':'Classe / Niveau'}</label><select name="level" defaultValue={level} required><option value="" disabled>{ht?'Chwazi klas':'Choisir la classe'}</option>{levels.map(x=><option key={x}>{x}</option>)}</select></div><div><label>{ht?'Seksyon':'Section'}</label><select name="section" defaultValue={section||'A'} required>{sections.map(x=><option key={x}>{x}</option>)}</select></div></div><div className="row" style={{marginTop:12}}><button className="btn">{ht?'Anrejistre':'Enregistrer'}</button><button type="button" className="btn secondary" onClick={()=>setAdding(false)}>{ht?'Anile':'Annuler'}</button></div></form>}
  <div style={{marginTop:14}}>{filtered.length===0?<div className="notice">{ht?'Pa gen elèv nan gwoup sa a.':'Aucun élève dans ce groupe.'}</div>:filtered.map(s=><div className="dsmStudent" key={s.id}><strong>{s.name}</strong><div className="dsmMeta">{s.id} • {s.year} • {s.level} • {ht?'Seksyon':'Section'} {s.section}</div><div className="row" style={{marginTop:9}}><button className="btn secondary" onClick={()=>setEditingId(editingId===s.id?null:s.id)}>{ht?'Modifye':'Modifier'}</button></div>{editingId===s.id&&<form action={fd=>saveStudent(s.id,fd)} className="dsmForm"><div className="dsmFormGrid"><div><label>{ht?'Non elèv':'Nom de l’élève'}</label><input name="name" defaultValue={s.name} required/></div><div><label>{ht?'Ane akademik':'Année académique'}</label><input name="year" defaultValue={s.year} required/></div><div><label>{ht?'Klas / Nivo':'Classe / Niveau'}</label><select name="level" defaultValue={s.level} required>{[...new Set([s.level,...levels])].map(x=><option key={x}>{x}</option>)}</select></div><div><label>{ht?'Seksyon':'Section'}</label><select name="section" defaultValue={s.section} required>{[...new Set([s.section,...sections])].map(x=><option key={x}>{x}</option>)}</select></div></div><div className="row" style={{marginTop:12}}><button className="btn">{ht?'Anrejistre':'Enregistrer'}</button><button type="button" className="btn secondary" onClick={()=>setEditingId(null)}>{ht?'Anile':'Annuler'}</button></div></form>}</div>)}</div>
 </div>,host)
}
