'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Target = {
  path: string
}

export default function UnifiedLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error || !data.user || !data.session) {
      setMessage(error?.message || 'Connexion impossible. Vérifiez vos informations.')
      setBusy(false)
      return
    }

    let target: Target = {
      path: '/passenger/dashboard',
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profile?.role === 'admin') {
      target = {
        path: '/admin/drivers',
      }
    } else {
      const { data: driver } = await supabase
        .from('driver_profiles')
        .select('status')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (driver?.status === 'approved') {
        target = {
          path: '/driver/dashboard',
        }
      }
    }

    // signInWithPassword already persisted the single shared session
    // under taxi-auth-default. Do not create role-specific sessions.
    window.location.replace(target.path)
  }

  return (
    <main style={{position:'fixed',inset:0,zIndex:2147483647,background:'linear-gradient(160deg,#e3f1ed,#eef2f7 48%,#e7edf3)',padding:'28px 20px',overflow:'auto',fontFamily:'system-ui,sans-serif',pointerEvents:'auto',touchAction:'auto'}}>
      <section style={{maxWidth:430,margin:'56px auto',background:'#fff',borderRadius:28,padding:'28px 24px',boxShadow:'0 24px 70px rgba(18,36,61,.15)',position:'relative',zIndex:2147483647}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
          <div style={{width:52,height:52,borderRadius:16,display:'grid',placeItems:'center',background:'#0f6f59',color:'#fff',fontSize:24,fontWeight:900}}>T</div>
          <div><strong style={{fontSize:22,color:'#102033'}}>Taxi Platform Haiti</strong><div style={{color:'#7b8999',fontSize:14,marginTop:2}}>Une seule connexion pour tous les espaces</div></div>
        </div>
        <div style={{fontSize:13,fontWeight:900,letterSpacing:1.5,color:'#0f7a62',marginBottom:6}}>BON RETOUR</div>
        <h1 style={{fontSize:36,lineHeight:1.05,margin:'0 0 24px',color:'#102033'}}>Connectez-vous</h1>
        <form onSubmit={submit} style={{display:'grid',gap:18,position:'relative',zIndex:2147483647}}>
          <label style={{display:'grid',gap:8,fontWeight:800,color:'#506174'}}>E-mail
            <input type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} onTouchStart={(e)=>e.currentTarget.focus()} required style={{fontSize:18,minHeight:58,width:'100%',padding:'13px 14px',border:'2px solid #d7e0e7',borderRadius:14,background:'#fff',color:'#111',pointerEvents:'auto',touchAction:'auto',WebkitUserSelect:'text',userSelect:'text',WebkitAppearance:'none',appearance:'none',position:'relative',zIndex:2147483647}} />
          </label>
          <label style={{display:'grid',gap:8,fontWeight:800,color:'#506174'}}>Mot de passe
            <input type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} onTouchStart={(e)=>e.currentTarget.focus()} required style={{fontSize:18,minHeight:58,width:'100%',padding:'13px 14px',border:'2px solid #d7e0e7',borderRadius:14,background:'#fff',color:'#111',pointerEvents:'auto',touchAction:'auto',WebkitUserSelect:'text',userSelect:'text',WebkitAppearance:'none',appearance:'none',position:'relative',zIndex:2147483647}} />
          </label>
          {message && <div style={{padding:'11px 13px',borderRadius:12,background:'#fff1f1',color:'#9d2d2d',fontWeight:700}}>{message}</div>}
          <button type="submit" disabled={busy} style={{minHeight:58,fontSize:18,fontWeight:900,border:0,borderRadius:15,background:'#0f6f59',color:'#fff',pointerEvents:'auto',touchAction:'manipulation',position:'relative',zIndex:2147483647,opacity:busy?.72:1}}>{busy ? 'Connexion…' : 'Se connecter'}</button>
        </form>
        <p style={{textAlign:'center',margin:'18px 0 0',color:'#748395',fontSize:13}}>Le système vous dirigera automatiquement vers votre espace.</p>
      </section>
    </main>
  )
}
