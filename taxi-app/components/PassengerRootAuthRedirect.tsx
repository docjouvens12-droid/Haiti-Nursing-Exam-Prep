'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function PassengerRootAuthRedirect() {
  useEffect(() => {
    if (window.location.pathname !== '/') return
    let active = true

    const redirectIfSignedIn = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return false
      if (data.session?.user) {
        window.location.replace('/passenger/dashboard')
        return true
      }
      return false
    }

    void redirectIfSignedIn()

    const handleSubmit = async (event: Event) => {
      const form = event.target as HTMLFormElement | null
      if (!form?.classList.contains('auth-form')) return

      const emailInput = form.querySelector<HTMLInputElement>('input[type="email"]')
      const passwordInput = form.querySelector<HTMLInputElement>('input[type="password"]')
      if (!emailInput || !passwordInput) return

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"], button:not([type])')
      if (submitButton) submitButton.disabled = true

      const oldError = form.querySelector('.passenger-direct-auth-error')
      oldError?.remove()

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailInput.value.trim(),
          password: passwordInput.value,
        })

        if (error || !data.session?.user) {
          const errorBox = document.createElement('div')
          errorBox.className = 'auth-message passenger-direct-auth-error'
          errorBox.textContent = error?.message || 'Connexion impossible. Veuillez réessayer.'
          submitButton?.insertAdjacentElement('beforebegin', errorBox)
          return
        }

        window.location.replace('/passenger/dashboard')
      } finally {
        if (submitButton) submitButton.disabled = false
      }
    }

    document.addEventListener('submit', handleSubmit, true)

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      if (session?.user && window.location.pathname === '/') {
        window.location.replace('/passenger/dashboard')
      }
    })

    return () => {
      active = false
      document.removeEventListener('submit', handleSubmit, true)
      listener.subscription.unsubscribe()
    }
  }, [])

  return null
}
