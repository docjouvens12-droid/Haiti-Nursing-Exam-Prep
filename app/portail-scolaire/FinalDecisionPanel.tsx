'use client'

import {useEffect,useState} from 'react'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

type Role='direction'|'secretary'|'student'|''
type Decision='pending'|'admitted'|'deferred'

function clean(v:string){return (v||'').replace(/\s+/g,' ').trim()}
function escapeHtml(v:string){
 const map:Record<string,string>={'&':'&amp;','<':'&lt;','>':'&gt;'}
 return (v||'').replace(/[&<>]/g,(c:string)=>map[c]||c)
}
function labels(ht:boolean,d:Decision){
 if(d==='admitted')return 'Admis'
 if(d==='deferred')return ht?'Ajouné':'Ajourné'
 return ht?'An atant':'En attente'
}

export default function FinalDecisionPanel(){
 const [role,setRole]=useState<Role>('')
 const [ownStudentId,setOwnStudentId]=useState('')
 const [,setLang]=useState<'ht'|'fr'>('ht')

 useEffect(()=>{
  let active=true
  const loadProfile=async()=>{
   const {data:{session}}=await supabase.auth.getSession();const user=session?.user;if(!user)return
   const {data}=await supabase.from('school_profiles').select('role,student_id').eq('user_id',user.id).maybeSingle()
   if(!active)return
   const r=(['direction','secretary','student'].includes(data?.role)?data?.role:'') as Role
   setRole(r);setOwnStudentId(data?.student_id||'')
  }
  loadProfile();const {data:l}=supabase.auth.onAuthStateChange(()=>loadProfile())
  return()=>{active=false;l.subscription.unsubscribe()}
 },[])

 useEffect(()=>{
  const language=()=>{
   const sel=document.querySelector('[data-global-language-menu] select') as HTMLSelectElement|null
   if(sel)return sel.value==='fr'?'fr':'ht'
   const frenchActive=Array.from(document.querySelectorAll('button.langChoice')).some(b=>(b.textContent||'').includes('Français')&&b.classList.contains('active'))
   return frenchActive?'fr':'ht'
  }
  const findStudentSelect=(card:HTMLElement)=>{
   for(const label of Array.from(card.querySelectorAll('label'))){
    if(!/^(Elèv|Élève)$/i.test(clean(label.textContent||'')))continue
    const s=label.parentElement?.querySelector('select') as HTMLSelectElement|null
    if(s)return s
   }
   return null
  }
  const mountBox=async(card:HTMLElement,studentId:string,mode:'records'|'student')=>{
   const ht=language()==='ht';setLang(ht?'ht':'fr')
   if(!studentId){card.querySelector('[data-final-decision-box]')?.remove();return}
   const {data:student}=await supabase.from('school_students').select('academic_year').eq('id',studentId).maybeSingle()
   const year=student?.academic_year||''
   if(!year)return
   const {data:existing}=await supabase.from('school_student_decisions').select('decision,note').eq('student_id',studentId).eq('academic_year',year).maybeSingle()
   const decision=(existing?.decision||'pending') as Decision
   const note=existing?.note||''
   let box=card.querySelector('[data-final-decision-box]') as HTMLElement|null
   if(!box){box=document.createElement('div');box.setAttribute('data-final-decision-box','true');box.style.cssText='margin-top:14px;border:2px solid #d8e2ea;border-radius:14px;padding:14px;background:#fff';card.appendChild(box)}
   if(role==='direction'&&mode==='records'){
    box.innerHTML=`<div style="font-weight:800;margin-bottom:10px">${ht?'Desizyon final':'Décision finale'}</div><label style="display:block;margin-bottom:6px">${ht?'Estati':'Statut'}</label><select data-final-decision-select style="width:100%;margin-bottom:10px"><option value="pending" ${decision==='pending'?'selected':''}>${ht?'An atant':'En attente'}</option><option value="admitted" ${decision==='admitted'?'selected':''}>Admis</option><option value="deferred" ${decision==='deferred'?'selected':''}>${ht?'Ajouné':'Ajourné'}</option></select><label style="display:block;margin-bottom:6px">${ht?'Nòt Direksyon (opsyonèl)':'Note de la Direction (facultatif)'}</label><textarea data-final-decision-note rows="3" style="width:100%;margin-bottom:10px">${escapeHtml(note)}</textarea><button type="button" class="btn" data-final-decision-save>${ht?'Anrejistre desizyon':'Enregistrer la décision'}</button><span data-final-decision-msg style="margin-left:10px"></span>`
    const save=box.querySelector('[data-final-decision-save]') as HTMLButtonElement|null
    save?.addEventListener('click',async()=>{
     const select=box?.querySelector('[data-final-decision-select]') as HTMLSelectElement|null
     const noteEl=box?.querySelector('[data-final-decision-note]') as HTMLTextAreaElement|null
     const msg=box?.querySelector('[data-final-decision-msg]') as HTMLElement|null
     const payload={student_id:studentId,academic_year:year,decision:(select?.value||'pending'),note:(noteEl?.value||'').trim()||null,updated_at:new Date().toISOString()}
     const {error}=await supabase.from('school_student_decisions').upsert(payload,{onConflict:'student_id,academic_year'})
     if(msg)msg.textContent=error?(ht?'Erè pandan anrejistreman.':'Erreur lors de l’enregistrement.'):(ht?'✓ Anrejistre':'✓ Enregistré')
     if(!error)window.dispatchEvent(new CustomEvent('school-final-decision-updated',{detail:{studentId,year}}))
    })
   }else{
    box.innerHTML=`<div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><strong>${ht?'Desizyon final':'Décision finale'}</strong><strong style="font-size:18px;color:#0f4c81">${labels(ht,decision)}</strong></div>${note?`<div style="margin-top:8px;color:#637083">${escapeHtml(note)}</div>`:''}`
   }
  }

  let timer:number|undefined
  const render=()=>{
   window.clearTimeout(timer);timer=window.setTimeout(()=>{
    if(!role)return
    if(role==='direction'||role==='secretary'){
     const card=Array.from(document.querySelectorAll('.card')).find(c=>['Relve nòt elèv yo','Relevés de notes des élèves'].includes(clean(c.querySelector('h2')?.textContent||''))) as HTMLElement|undefined
     if(card){const s=findStudentSelect(card);void mountBox(card,s?.value||'','records')}
    }
    if(role==='student'&&ownStudentId){
     Array.from(document.querySelectorAll('.card')).forEach(c=>{
      const title=clean(c.querySelector('h2')?.textContent||'')
      if(['Bilten mwen','Mon bulletin','Relve nòt mwen','Mon relevé de notes'].includes(title))void mountBox(c as HTMLElement,ownStudentId,'student')
     })
    }
   },120)
  }
  render();const o=new MutationObserver(render);o.observe(document.body,{subtree:true,childList:true})
  document.addEventListener('change',render,true)
  window.addEventListener('school-final-decision-updated',render)
  return()=>{window.clearTimeout(timer);o.disconnect();document.removeEventListener('change',render,true);window.removeEventListener('school-final-decision-updated',render)}
 },[role,ownStudentId])

 return null
}
