'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

async function accessEmail(accessId:string){
  const data=new TextEncoder().encode(accessId.trim().toLowerCase())
  const digest=await crypto.subtle.digest('SHA-256',data)
  const hex=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('')
  return `u-${hex.slice(0,32)}@access.portailscolaire.local`
}

export default function SafariLoginFallback(){
  const [show,setShow]=useState(true)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)

  useEffect(()=>{
    const sync=()=>{
      const loading=[...document.querySelectorAll('.notice')].some(el=>{
        const text=el.textContent?.trim()
        return text==='Chargement...' || text==='Chajman...'
      })
      setShow(loading)
    }
    sync()
    const timer=window.setInterval(sync,300)
    return()=>window.clearInterval(timer)
  },[])

  if(!show)return null

  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();setError('');setBusy(true)
    const fd=new FormData(e.currentTarget)
    const identifier=String(fd.get('identifier')||'').trim()
    const password=String(fd.get('password')||'')
    if(!identifier||!password){setBusy(false);return}
    try{
      const email=identifier.includes('@')?identifier:await accessEmail(identifier)
      const result=await Promise.race([
        supabase.auth.signInWithPassword({email,password}),
        new Promise<{error:{message:string}}>(resolve=>window.setTimeout(()=>resolve({error:{message:'timeout'}}),10000))
      ])
      if(result.error){setError("Identifiant d’accès ou mot de passe incorrect.");setBusy(false);return}
      window.location.reload()
    }catch{
      setError("Connexion impossible pour le moment. Réessayez.")
      setBusy(false)
    }
  }

  return <div style={{position:'fixed',inset:0,zIndex:99999,overflowY:'auto',background:'#f4f7fb',fontFamily:'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
    <div style={{background:'#0f4c81',padding:'24px 20px',color:'#fff',fontSize:22,fontWeight:800}}>Portail Scolaire Haïti</div>
    <div style={{maxWidth:460,margin:'34px auto',padding:'0 16px'}}>
      <section style={{background:'#fff',border:'1px solid #dde6ef',borderRadius:18,padding:20,boxShadow:'0 8px 24px rgba(20,33,61,.06)'}}>
        <h2 style={{fontSize:30,margin:'0 0 10px',color:'#14213d'}}>Connexion</h2>
        <p style={{color:'#6b7280',marginTop:0}}>Utilisez vos informations de connexion.</p>
        {error&&<div style={{background:'#fff7ed',border:'1px solid #fed7aa',borderRadius:12,padding:12,marginBottom:12}}>⚠️ {error}</div>}
        <form onSubmit={submit}>
          <label style={{display:'block',fontWeight:800,marginBottom:6}}>Identifiant du personnel</label>
          <input name="identifier" autoCapitalize="none" autoCorrect="off" autoComplete="username" required style={{boxSizing:'border-box',width:'100%',padding:13,border:'1px solid #cfd9e4',borderRadius:11,fontSize:16}}/>
          <label style={{display:'block',fontWeight:800,margin:'16px 0 6px'}}>Mot de passe</label>
          <input name="password" type="password" autoComplete="current-password" required style={{boxSizing:'border-box',width:'100%',padding:13,border:'1px solid #cfd9e4',borderRadius:11,fontSize:16}}/>
          <button disabled={busy} style={{marginTop:16,border:0,borderRadius:11,padding:'13px 18px',background:'#0f4c81',color:'#fff',fontWeight:800,fontSize:16}}>{busy?'Connexion...':'Se connecter'}</button>
        </form>
      </section>
    </div>
  </div>
}
