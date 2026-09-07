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
        input.style.paddingRight = '3.5rem'

        const button = document.createElement('button')
        button.type = 'button'
        button.setAttribute('aria-label', 'Afficher le mot de passe')
        button.setAttribute('title', 'Afficher / masquer le mot de passe')
        button.textContent = '👁'
        button.style.position = 'absolute'
        button.style.right = '0.8rem'
        button.style.top = '50%'
        button.style.transform = 'translateY(-50%)'
        button.style.border = '0'
        button.style.background = 'transparent'
        button.style.cursor = 'pointer'
        button.style.fontSize = '1.25rem'
        button.style.lineHeight = '1'
        button.style.padding = '0.3rem'
        button.style.zIndex = '10'
        button.style.webkitAppearance = 'none'
        button.style.appearance = 'none'

        const toggle = (event: Event) => {
          event.preventDefault()
          event.stopPropagation()
          const nextType = input.type === 'password' ? 'text' : 'password'
          input.setAttribute('type', nextType)
          button.textContent = nextType === 'text' ? '🙈' : '👁'
          button.setAttribute('aria-label', nextType === 'text' ? 'Masquer le mot de passe' : 'Afficher le mot de passe')
          requestAnimationFrame(() => input.focus())
        }

        button.addEventListener('click', toggle)
        button.addEventListener('touchend', toggle, { passive: false })
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
