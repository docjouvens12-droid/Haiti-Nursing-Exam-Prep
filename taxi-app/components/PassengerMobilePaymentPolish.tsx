'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Provider = 'moncash' | 'natcash'

export default function PassengerMobilePaymentPolish() {
  useEffect(() => {
    if (window.location.pathname !== '/') return

    const styleId = 'passenger-mobile-payment-polish'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .mobile-pay-choice{display:grid;gap:10px;margin-top:14px}
        .mobile-pay-choice button{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;border:1px solid #dce5ea;background:#fff;border-radius:16px;padding:14px 15px;font-weight:900;color:#173042}
        .mobile-pay-choice button.selected{border-color:#0f6f59;background:#eaf6f2;color:#0f6f59;box-shadow:0 0 0 2px rgba(15,111,89,.08)}
        .mobile-pay-choice .left{display:flex;align-items:center;gap:11px;text-align:left}
        .mobile-pay-choice .logo{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:#f3f6f8;font-size:19px}
        .mobile-pay-choice small{display:block;color:#748496;font-size:11px;margin-top:2px;font-weight:700}
        .mobile-pay-note{margin-top:12px;padding:12px;border-radius:14px;background:#f5f8fa;color:#617184;font-size:12px;line-height:1.35}
        .payment-row .payment-icon{font-size:18px}
      `
      document.head.appendChild(style)
    }

    let provider: Provider = (localStorage.getItem('taxi-payment-provider') as Provider) || 'moncash'

    const label = () => provider === 'moncash' ? 'MonCash' : 'NatCash'
    const isHt = () => localStorage.getItem('taxi-language') === 'ht'

    const saveProvider = async (next: Provider) => {
      provider = next
      localStorage.setItem('taxi-payment-provider', next)
      const { data } = await supabase.auth.getUser()
      if (data.user) await supabase.rpc('set_preferred_payment_provider', { p_provider: next })
      apply()
    }

    const enhanceMainPaymentRow = () => {
      document.querySelectorAll<HTMLElement>('.payment-row').forEach((row) => {
        const icon = row.querySelector<HTMLElement>('.payment-icon')
        const strong = row.querySelector<HTMLElement>('strong')
        if (icon) icon.textContent = '📱'
        if (strong) strong.textContent = label()
      })
    }

    const enhancePaymentPanel = () => {
      const panels = Array.from(document.querySelectorAll<HTMLElement>('.account-panel'))
      for (const panel of panels) {
        const header = panel.querySelector<HTMLElement>('.panel-header strong')?.textContent?.toLowerCase() || ''
        if (!header.includes('paiement') && !header.includes('peman')) continue
        const body = panel.querySelector<HTMLElement>('.panel-body')
        if (!body) continue

        const oldFeature = body.querySelector<HTMLElement>('.feature-card')
        if (oldFeature) oldFeature.style.display = 'none'
        const oldNote = body.querySelector<HTMLElement>('.muted')
        if (oldNote) oldNote.style.display = 'none'

        let chooser = body.querySelector<HTMLElement>('[data-mobile-payment-chooser="true"]')
        if (!chooser) {
          chooser = document.createElement('div')
          chooser.dataset.mobilePaymentChooser = 'true'
          chooser.className = 'mobile-pay-choice'
          chooser.innerHTML = `
            <button type="button" data-provider="moncash"><span class="left"><span class="logo">M</span><span>MonCash<small>${isHt() ? 'Peye dirèkteman nan aplikasyon an' : 'Payez directement dans l’application'}</small></span></span><span>✓</span></button>
            <button type="button" data-provider="natcash"><span class="left"><span class="logo">N</span><span>NatCash<small>${isHt() ? 'Peye dirèkteman nan aplikasyon an' : 'Payez directement dans l’application'}</small></span></span><span>✓</span></button>
          `
          const note = document.createElement('div')
          note.className = 'mobile-pay-note'
          note.textContent = isHt()
            ? 'Apre peman an konfime, platfòm nan kenbe 15% epi 85% rete pou chofè a.'
            : 'Après confirmation du paiement, la plateforme conserve 15 % et 85 % reviennent au chauffeur.'
          body.append(chooser, note)
          chooser.querySelectorAll<HTMLButtonElement>('button[data-provider]').forEach((button) => {
            button.addEventListener('click', () => void saveProvider(button.dataset.provider as Provider))
          })
        }

        chooser.querySelectorAll<HTMLButtonElement>('button[data-provider]').forEach((button) => {
          button.classList.toggle('selected', button.dataset.provider === provider)
          const check = button.lastElementChild as HTMLElement | null
          if (check) check.style.visibility = button.dataset.provider === provider ? 'visible' : 'hidden'
        })
      }
    }

    const apply = () => {
      enhanceMainPaymentRow()
      enhancePaymentPanel()
    }

    ;(async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (auth.user) {
        const { data: profile } = await supabase.from('profiles').select('preferred_payment_provider').eq('id', auth.user.id).maybeSingle()
        if (profile?.preferred_payment_provider === 'moncash' || profile?.preferred_payment_provider === 'natcash') {
          provider = profile.preferred_payment_provider
          localStorage.setItem('taxi-payment-provider', provider)
        }
      }
      apply()
    })()

    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    const interval = window.setInterval(apply, 1500)

    return () => {
      observer.disconnect()
      window.clearInterval(interval)
      document.getElementById(styleId)?.remove()
    }
  }, [])

  return null
}
