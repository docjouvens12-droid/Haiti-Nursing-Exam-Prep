'use client'

import {useEffect} from 'react'
import {createClient} from '@supabase/supabase-js'

const supabase=createClient('https://vncrujkndfpatwvxtchk.supabase.co','sb_publishable_jfsR5S6Sqcf-9h16Mw3zvA_zZPUlfe2')

export default function SessionJwtRecovery(){
 useEffect(()=>{
  let busy=false
  const recover=async()=>{
   if(busy)return
   const text=document.body.innerText||''
   if(!text.includes('JWT issued at future'))return
   busy=true
   const tried=sessionStorage.getItem('psh-jwt-recovery')==='1'
   if(!tried){
    sessionStorage.setItem('psh-jwt-recovery','1')
    const {data,error}=await supabase.auth.refreshSession()
    if(!error&&data.session){window.location.reload();return}
   }
   await supabase.auth.signOut()
   sessionStorage.removeItem('psh-jwt-recovery')
   window.location.reload()
  }
  recover()
  const observer=new MutationObserver(()=>recover())
  observer.observe(document.body,{subtree:true,childList:true,characterData:true})
  return()=>observer.disconnect()
 },[])
 return null
}
