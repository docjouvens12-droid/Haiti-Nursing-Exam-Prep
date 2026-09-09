'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function DriverAccessGate(){
  useEffect(()=>{
    let cancelled=false

    const enforce=async()=>{
      const path=window.location.pathname
      if(path!=='/driver' && path!=='/driver/dashboard') return

      const {data:auth}=await supabase.auth.getUser()
      if(cancelled) return

      if(!auth.user){
        if(path==='/driver/dashboard') window.location.replace('/driver/login?test=haiti')
        return
      }

      const {data:driver}=await supabase
        .from('driver_profiles')
        .select('status')
        .eq('user_id',auth.user.id)
        .maybeSingle()

      if(cancelled) return
      const approved=driver?.status==='approved'

      if(path==='/driver/dashboard' && !approved){
        window.location.replace('/driver')
        return
      }

      if(path==='/driver' && approved){
        window.location.replace('/driver/dashboard')
      }
    }

    void enforce()
    return()=>{cancelled=true}
  },[])

  return null
}
