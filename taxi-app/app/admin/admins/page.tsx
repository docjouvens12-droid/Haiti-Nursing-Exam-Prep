'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Lang = 'fr' | 'ht'
type PermKey = 'can_manage_admins'|'can_manage_drivers'|'can_view_payments'|'can_manage_payouts'|'can_reconcile'|'can_manage_safety'|'can_view_system'
type AdminRow = { user_id:string; email:string; full_name:string|null; is_super_admin:boolean; can_manage_admins:boolean; can_manage_drivers:boolean; can_view_payments:boolean; can_manage_payouts:boolean; can_reconcile:boolean; can_manage_safety:boolean; can_view_system:boolean }

const labels:Record<Lang,Record<PermKey,string>>={
  fr:{can_manage_admins:'Gérer les administrateurs',can_manage_drivers:'Gérer les chauffeurs',can_view_payments:'Voir paiements & commissions',can_manage_payouts:'Gérer les versements chauffeurs',can_reconcile:'Accéder à la réconciliation',can_manage_safety:'Gérer la sécurité',can_view_system:'Voir l’état du système'},
  ht:{can_manage_admins:'Jere administratè',can_manage_drivers:'Jere chofè yo',can_view_payments:'Wè peman & komisyon',can_manage_payouts:'Jere peman pou chofè',can_reconcile:'Aksè rekonsilyasyon',can_manage_safety:'Jere sekirite',can_view_system:'Wè eta sistèm nan'}
}
const keys=Object.keys(labels.fr) as PermKey[]
const emptyPerms:Record<PermKey,boolean>={can_manage_admins:false,can_manage_drivers:false,can_view_payments:false,can_manage_payouts:false,can_reconcile:false,can_manage_safety:false,can_view_system:false}

export default function AdminManagementPage(){
  const [lang,setLang]=useState<Lang>('fr')
  const [admins,setAdmins]=useState<AdminRow[]>([])
  const [email,setEmail]=useState('')
  const [makeSuper,setMakeSuper]=useState(false)
  const [perms,setPerms]=useState<Record<PermKey,boolean>>(emptyPerms)
  const [authorized,setAuthorized]=useState<boolean|null>(null)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')

  useEffect(()=>{const saved=localStorage.getItem('taxi-language') as Lang|null;if(saved==='fr'||saved==='ht')setLang(saved);void init()},[])
  async function init(){const {data,error}=await supabase.rpc('get_my_admin_permissions');const row=(Array.isArray(data)?data[0]:data) as any;if(error||!row?.is_super_admin){setAuthorized(false);return}setAuthorized(true);await loadAdmins()}
  async function loadAdmins(){const {data,error}=await supabase.rpc('admin_list_admins');if(!error)setAdmins((data??[]) as AdminRow[])}

  async function addAdmin(){
    if(!email.trim()){
      setMessage(lang==='ht'?'Antre imel moun nan anvan ou peze bouton an. Moun nan dwe deja gen yon kont Taxi Haiti.':'Entrez d’abord l’adresse e-mail. La personne doit déjà avoir un compte Taxi Haiti.')
      return
    }
    setBusy(true);setMessage('')
    const payload:any={p_email:email.trim(),p_is_super_admin:makeSuper}
    keys.forEach(k=>payload['p_'+k]=makeSuper?true:perms[k])
    const {error}=await supabase.rpc('admin_promote_existing_user',payload)
    if(error)setMessage(lang==='ht'?(error.message.includes('create an account')?'Itilizatè sa a dwe kreye yon kont sou platfòm nan anvan.':error.message):(error.message.includes('create an account')?'Cet utilisateur doit d’abord créer un compte sur la plateforme.':error.message))
    else{
      setMessage(makeSuper?(lang==='ht'?'Nouvo Super Admin lan ajoute.':'Nouveau Super Admin ajouté.'):(lang==='ht'?'Administratè limite a ajoute ak restriksyon li yo.':'Administrateur limité ajouté avec ses restrictions.'))
      setEmail('');setMakeSuper(false);setPerms({...emptyPerms});await loadAdmins()
    }
    setBusy(false)
  }

  async function updateAdmin(a:AdminRow){setBusy(true);setMessage('');const payload:any={p_admin_id:a.user_id};keys.forEach(k=>payload['p_'+k]=a[k]);const {error}=await supabase.rpc('admin_update_permissions',payload);setMessage(error?error.message:(lang==='ht'?'Dwa administratè a mete ajou.':'Permissions mises à jour.'));await loadAdmins();setBusy(false)}
  async function removeAdmin(a:AdminRow){if(!window.confirm(lang==='ht'?`Retire ${a.full_name||a.email} kòm admin?`:`Retirer ${a.full_name||a.email} comme administrateur ?`))return;setBusy(true);const {error}=await supabase.rpc('admin_remove_admin',{p_admin_id:a.user_id});setMessage(error?error.message:(lang==='ht'?'Admin lan retire.':'Administrateur retiré.'));await loadAdmins();setBusy(false)}

  if(authorized===null)return <main className="shell"><section className="card">Chargement…</section></main>
  if(authorized===false)return <main className="shell"><section className="card"><h1>🔒 {lang==='ht'?'Super Admin sèlman.':'Super Admin uniquement.'}</h1><button onClick={()=>window.location.assign('/admin')}>← Admin</button></section></main>

  return <main className="shell"><section className="wrap">
    <header><button onClick={()=>window.location.assign('/admin')}>←</button><div><small>SUPER ADMIN</small><h1>{lang==='ht'?'Administratè & restriksyon':'Administrateurs & restrictions'}</h1></div><select value={lang} onChange={e=>{const v=e.target.value as Lang;setLang(v);localStorage.setItem('taxi-language',v)}}><option value="fr">FR</option><option value="ht">KR</option></select></header>

    <article className="addCard">
      <h2>{lang==='ht'?'Ajoute yon administratè':'Ajouter un administrateur'}</h2>
      <p>{lang==='ht'?'Moun nan dwe deja gen yon kont Taxi Haiti. Ou ka fè li Admin limite oswa Super Admin.':'La personne doit déjà avoir un compte Taxi Haiti. Vous pouvez la nommer administrateur limité ou Super Admin.'}</p>
      <input type="email" value={email} onChange={e=>{setEmail(e.target.value);if(message)setMessage('')}} placeholder="email@example.com" />
      <div className="levelChoice">
        <button className={!makeSuper?'selected':''} onClick={()=>setMakeSuper(false)} type="button"><strong>🛡️ {lang==='ht'?'Admin limite':'Admin limité'}</strong><small>{lang==='ht'?'Chwazi dwa yo youn pa youn':'Choisir les droits un par un'}</small></button>
        <button className={makeSuper?'selected super':''} onClick={()=>setMakeSuper(true)} type="button"><strong>👑 Super Admin</strong><small>{lang==='ht'?'Tout dwa + ka ajoute lòt Super Admin':'Tous les droits + peut ajouter d’autres Super Admins'}</small></button>
      </div>
      {!makeSuper&&<div className="permGrid">{keys.map(k=><label key={k}><input type="checkbox" checked={perms[k]} onChange={e=>setPerms({...perms,[k]:e.target.checked})}/><span>{labels[lang][k]}</span></label>)}</div>}
      {makeSuper&&<div className="superWarning">👑 {lang==='ht'?'Super Admin sa a ap gen menm aksè konplè ak ou, ladan l dwa pou ajoute lòt Super Admin.':'Ce Super Admin aura un accès complet, y compris le droit d’ajouter d’autres Super Admins.'}</div>}
      <button className="primary" disabled={busy} onClick={()=>void addAdmin()}>{busy?'…':makeSuper?(lang==='ht'?'Ajoute Super Admin':'Ajouter le Super Admin'):(lang==='ht'?'Ajoute admin limite':'Ajouter l’admin limité')}</button>
      {!email.trim()&&<small className="emailHint">{lang==='ht'?'↑ Antre imel kont Taxi Haiti a anvan.':'↑ Saisissez d’abord l’e-mail du compte Taxi Haiti.'}</small>}
    </article>

    {message&&<div className="message">{message}</div>}
    <div className="list"><h2>{lang==='ht'?'Administratè aktyèl yo':'Administrateurs actuels'}</h2>{admins.map(a=><article className="adminCard" key={a.user_id}>
      <div className="who"><div className="avatar">{(a.full_name||a.email||'A').slice(0,1).toUpperCase()}</div><div><strong>{a.full_name||a.email}</strong><small>{a.email}</small></div>{a.is_super_admin&&<b>👑 SUPER ADMIN</b>}</div>
      {!a.is_super_admin&&<><div className="permGrid">{keys.map(k=><label key={k}><input type="checkbox" checked={a[k]} onChange={e=>setAdmins(old=>old.map(x=>x.user_id===a.user_id?{...x,[k]:e.target.checked}:x))}/><span>{labels[lang][k]}</span></label>)}</div><div className="actions"><button disabled={busy} onClick={()=>void updateAdmin(a)}>{lang==='ht'?'Sove dwa yo':'Enregistrer'}</button><button className="danger" disabled={busy} onClick={()=>void removeAdmin(a)}>{lang==='ht'?'Retire admin':'Retirer'}</button></div></>}
      {a.is_super_admin&&<p className="superNote">{lang==='ht'?'Kont sa a gen tout dwa, li ka jere admin epi ajoute lòt Super Admin.':'Ce compte possède tous les droits, peut gérer les administrateurs et ajouter d’autres Super Admins.'}</p>}
    </article>)}</div>
  </section>
  <style jsx>{`
    .shell{min-height:100dvh;background:#eef3f1;padding:12px;color:#102033;font-family:Inter,system-ui,sans-serif}.wrap{width:min(100%,820px);margin:auto}header{display:grid;grid-template-columns:44px 1fr auto;gap:10px;align-items:center;background:#fff;border:1px solid #dce7e3;border-radius:20px;padding:12px;box-shadow:0 8px 24px rgba(16,32,51,.06)}header button,header select{height:42px;border:1px solid #d9e4e0;background:#fff;border-radius:12px;font-weight:900}header small{font-size:9px;color:#0f705a;font-weight:950;letter-spacing:.12em}header h1{font-size:20px;margin:2px 0}.addCard,.adminCard{background:#fff;border:1px solid #dde8e3;border-radius:20px;padding:16px;margin-top:12px;box-shadow:0 8px 22px rgba(16,32,51,.045)}.addCard h2,.list h2{margin:0 0 5px;font-size:17px}.addCard p{font-size:11px;color:#71817b;line-height:1.5}.addCard>input{width:100%;box-sizing:border-box;height:48px;border:1px solid #d8e4df;border-radius:13px;padding:0 12px;font-size:16px}.levelChoice{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:13px 0}.levelChoice button{min-height:74px;border:1px solid #dfe8e4;background:#f8faf9;border-radius:15px;text-align:left;padding:11px;color:#344b43}.levelChoice button.selected{border:2px solid #0f705a;background:#eef8f4;color:#0f705a}.levelChoice button.selected.super{border-color:#a87b13;background:#fff8e5;color:#75550d}.levelChoice strong,.levelChoice small{display:block}.levelChoice strong{font-size:12px}.levelChoice small{font-size:9px;margin-top:5px;line-height:1.3}.permGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:13px 0}.permGrid label{display:flex;gap:9px;align-items:center;background:#f7faf9;border:1px solid #e2ebe7;border-radius:13px;padding:10px;font-size:11px;font-weight:750}.permGrid input{width:18px;height:18px;accent-color:#0f705a}.superWarning{margin:12px 0;background:#fff7df;border:1px solid #ead498;color:#745713;border-radius:14px;padding:11px;font-size:10px;font-weight:800;line-height:1.45}.primary,.actions button{border:0;border-radius:13px;background:#0f705a;color:#fff;min-height:46px;padding:0 15px;font-weight:900}.primary{width:100%}.primary:disabled{opacity:.6}.emailHint{display:block;margin-top:7px;color:#8a6612;font-size:10px;font-weight:800;text-align:center}.message{margin-top:10px;background:#eaf6f1;color:#0d6c55;border:1px solid #d3e9e0;border-radius:14px;padding:11px;font-size:11px;font-weight:800}.list>h2{margin-top:20px}.who{display:grid;grid-template-columns:46px 1fr auto;align-items:center;gap:10px}.avatar{width:46px;height:46px;border-radius:14px;background:#e8f4ef;color:#0f705a;display:grid;place-items:center;font-weight:950;font-size:19px}.who strong,.who small{display:block}.who small{font-size:10px;color:#7b8984;margin-top:2px}.who b{font-size:8px;background:#17382f;color:#fff;border-radius:999px;padding:6px 8px}.actions{display:flex;gap:8px;justify-content:flex-end}.actions .danger{background:#fff2f2;color:#a33a3a;border:1px solid #efcccc}.superNote{font-size:10px;color:#73817c;margin:12px 0 0}.card{margin:20vh auto 0;max-width:420px;background:#fff;border-radius:20px;padding:20px;text-align:center}.card button{border:0;background:#0f705a;color:#fff;border-radius:12px;padding:10px 14px}@media(max-width:600px){.shell{padding:8px}.permGrid,.levelChoice{grid-template-columns:1fr}header h1{font-size:16px}.who{grid-template-columns:42px 1fr}.who b{grid-column:2;justify-self:start}.actions{display:grid;grid-template-columns:1fr 1fr}.actions button{width:100%}}
  `}</style></main>
}
