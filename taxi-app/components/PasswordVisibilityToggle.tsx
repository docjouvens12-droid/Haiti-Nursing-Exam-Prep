'use client'

import { useEffect } from 'react'

export default function PasswordVisibilityToggle() {
  useEffect(() => {
    const enhance = () => {
      document.querySelectorAll<HTMLInputElement>('input[type="password"], input[data-password-visible-toggle="true"]').forEach((input) => {
        if (input.dataset.passwordToggleReady === 'true') return
        input.dataset.passwordToggleReady = 'true'
        input.dataset.passwordVisibleToggle = 'true'

        const parent = input.parentElement
        if (!parent) return

        parent.style.position = 'relative'
        input.style.paddingRight = '3.25rem'

        const button = document.createElement('button')
        button.type = 'button'
        button.setAttribute('aria-label', 'Afficher le mot de passe')
        button.setAttribute('title', 'Afficher / masquer le mot de passe')
        button.textContent = '👁'
        button.style.position = 'absolute'
        button.style.right = '0.75rem'
        button.style.bottom = '0.78rem'
        button.style.border = '0'
        button.style.background = 'transparent'
        button.style.cursor = 'pointer'
        button.style.fontSize = '1.2rem'
        button.style.lineHeight = '1'
        button.style.padding = '0.25rem'
        button.style.zIndex = '3'

        button.addEventListener('click', () => {
          const showing = input.type === 'text'
          input.type = showing ? 'password' : 'text'
          button.textContent = showing ? '👁' : '🙈'
          button.setAttribute('aria-label', showing ? 'Afficher le mot de passe' : 'Masquer le mot de passe')
          input.focus()
        })

        parent.appendChild(button)
      })
    }

    enhance()
    const observer = new MutationObserver(enhance)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
