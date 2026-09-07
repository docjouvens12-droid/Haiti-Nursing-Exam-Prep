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
  const [show,setShow]=useState(false)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)

  useEffect(()=>{
    const timer=window.setTimeout(()=>{
      const nativeLogin=document.querySelector('.loginWrap') as HTMLElement|null
      const nativeLoginVisible=Boolean(nativeLogin && nativeLogin.offsetParent!==null)
      if(!nativeLoginVisible){
        document.querySelectorAll('.notice').forEach(el=>{
          const text=el.textContent?.trim()
          if(text==='Chargement...' || text==='Chajman...') (el as HTMLElement).style.display='none'
        })
        setShow(true)
      }
    },3000)
    return()=>window.clearTimeout(timer)
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

  return <div style={{maxWidth:460,margin:'28px auto',padding:'0 12px'}}>
    <section style={{background:'#fff',border:'1px solid #dde6ef',borderRadius:18,padding:18,boxShadow:'0 8px 24px rgba(20,33,61,.06)'}}>
      <h2 style={{fontSize:28,marginTop:0,color:'#14213d'}}>Connexion</h2>
      <p style={{color:'#6b7280'}}>Utilisez vos informations de connexion.</p>
      {error&&<div style={{background:'#fff7ed',border:'1px solid #fed7aa',borderRadius:12,padding:12,marginBottom:12}}>⚠️ {error}</div>}
      <form onSubmit={submit}>
        <label style={{display:'block',fontWeight:800,marginBottom:6}}>Identifiant du personnel</label>
        <input name="identifier" autoCapitalize="none" autoCorrect="off" autoComplete="username" required style={{width:'100%',padding:12,border:'1px solid #dde6ef',borderRadius:11,fontSize:16}}/>
        <label style={{display:'block',fontWeight:800,margin:'14px 0 6px'}}>Mot de passe</label>
        <input name="password" type="password" autoComplete="current-password" required style={{width:'100%',padding:12,border:'1px solid #dde6ef',borderRadius:11,fontSize:16}}/>
        <button disabled={busy} style={{marginTop:14,border:0,borderRadius:11,padding:'12px 16px',background:'#0f4c81',color:'#fff',fontWeight:800,fontSize:16}}>{busy?'Connexion...':'Se connecter'}</button>
      </form>
    </section>
  </div>
}
