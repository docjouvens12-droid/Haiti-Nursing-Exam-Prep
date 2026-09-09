'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

type Method = 'moncash' | 'natcash'
type Account = { name: string; phone: string }

const emptyAccount: Account = { name: '', phone: '' }

export default function PassengerPaymentEnhancer() {
  const [target, setTarget] = useState<Element | null>(null)
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState<'fr' | 'ht'>('fr')
  const [method, setMethod] = useState<Method>('moncash')
  const [accounts, setAccounts] = useState<Record<Method, Account>>({ moncash: emptyAccount, natcash: emptyAccount })
  const [drafts, setDrafts] = useState<Record<Method, Account>>({ moncash: emptyAccount, natcash: emptyAccount })
  const [editing, setEditing] = useState<Record<Method, boolean>>({ moncash: false, natcash: false })
  const [saving, setSaving] = useState<Method | null>(null)

  useEffect(() => {
    const savedMethod = window.localStorage.getItem('taxi-payment-method') as Method | 'cash' | null
    const normalized: Method = savedMethod === 'natcash' ? 'natcash' : 'moncash'
    setMethod(normalized)
    window.localStorage.setItem('taxi-payment-method', normalized)
  }, [])

  useEffect(() => {
    if (!open) return
    void supabase.auth.getUser().then(({ data }) => {
      const user = data.user
      if (!user) return
      const metadata = user.user_metadata || {}
      const fallbackName = String(metadata.full_name || '')
      const fallbackPhone = String(metadata.phone || '')
      const next = {
        moncash: {
          name: String(metadata.moncash_name || ''),
          phone: String(metadata.moncash_phone || ''),
        },
        natcash: {
          name: String(metadata.natcash_name || ''),
          phone: String(metadata.natcash_phone || ''),
        },
      }
      setAccounts(next)
      setDrafts({
        moncash: { name: next.moncash.name || fallbackName, phone: next.moncash.phone || fallbackPhone },
        natcash: { name: next.natcash.name || fallbackName, phone: next.natcash.phone || fallbackPhone },
      })
      setEditing({ moncash: !next.moncash.name || !next.moncash.phone, natcash: !next.natcash.name || !next.natcash.phone })
    })
  }, [open])

  useEffect(() => {
    let currentButton: HTMLButtonElement | null = null
    let currentHandler: ((event: MouseEvent) => void) | null = null

    const syncTarget = () => {
      const drawer = document.querySelector('.nav-drawer')
      if (!drawer) {
        setTarget(null)
        setOpen(false)
        return
      }

      const buttons = Array.from(drawer.querySelectorAll<HTMLButtonElement>('.drawer-nav > button'))
      const paymentButton = buttons.find((button) => {
        const text = (button.textContent || '').toLowerCase()
        return text.includes('paiement') || text.includes('peman')
      }) || null

      if (!paymentButton) {
        setTarget(null)
        setOpen(false)
        return
      }

      if (currentButton !== paymentButton) {
        if (currentButton && currentHandler) currentButton.removeEventListener('click', currentHandler, true)
        currentButton = paymentButton
        currentHandler = (event: MouseEvent) => {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          const saved = window.localStorage.getItem('taxi-language')
          setLang(saved === 'ht' ? 'ht' : 'fr')
          setOpen((value) => !value)
        }
        paymentButton.addEventListener('click', currentHandler, true)
      }

      let mount = drawer.querySelector('.drawer-payment-inline-target') as HTMLElement | null
      if (!mount) {
        mount = document.createElement('div')
        mount.className = 'drawer-payment-inline-target'
        paymentButton.insertAdjacentElement('afterend', mount)
      }
      setTarget(mount)
    }

    syncTarget()
    const observer = new MutationObserver(syncTarget)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      if (currentButton && currentHandler) currentButton.removeEventListener('click', currentHandler, true)
    }
  }, [])

  const choose = (next: Method) => {
    setMethod(next)
    window.localStorage.setItem('taxi-payment-method', next)
    window.dispatchEvent(new CustomEvent('taxi-payment-method-change', { detail: next }))
  }

  async function saveAccount(event: FormEvent, id: Method) {
    event.preventDefault()
    const draft = drafts[id]
    if (!draft.name.trim() || !draft.phone.trim()) return
    setSaving(id)
    const payload = id === 'moncash'
      ? { moncash_name: draft.name.trim(), moncash_phone: draft.phone.trim() }
      : { natcash_name: draft.name.trim(), natcash_phone: draft.phone.trim() }
    const { error } = await supabase.auth.updateUser({ data: payload })
    setSaving(null)
    if (error) return
    setAccounts((current) => ({ ...current, [id]: { name: draft.name.trim(), phone: draft.phone.trim() } }))
    setEditing((current) => ({ ...current, [id]: false }))
  }

  if (!target || !open) return null
  const ht = lang === 'ht'

  const options: Array<{ id: Method; icon: string; label: string }> = [
    { id: 'moncash', icon: '📱', label: 'MonCash' },
    { id: 'natcash', icon: '📲', label: 'NatCash' },
  ]

  return createPortal(
    <section className="drawer-payment-inline">
      <div className="drawer-payment-inline-head">
        <strong>{ht ? 'Peman' : 'Paiement'}</strong>
        <button type="button" onClick={() => setOpen(false)}>{ht ? 'Fèmen' : 'Fermer'}</button>
      </div>

      <div className="drawer-payment-methods">
        {options.map((option) => {
          const active = method === option.id
          const account = accounts[option.id]
          const isEditing = editing[option.id]
          return <div key={option.id} className={`drawer-payment-method-card ${active ? 'active' : ''}`}>
            <div className="drawer-payment-method-top">
              <span className="drawer-payment-icon">{option.icon}</span>
              <span className="drawer-payment-copy"><strong>{option.label}</strong><small>{active ? (ht ? 'Metòd chwazi' : 'Mode sélectionné') : (ht ? 'Peze switch la pou chwazi' : 'Activez pour sélectionner')}</small></span>
              <button type="button" className={`drawer-payment-switch ${active ? 'on' : ''}`} onClick={() => choose(option.id)} aria-label={option.label}><i /></button>
            </div>

            {isEditing ? (
              <form className="drawer-payment-account-form" onSubmit={(event) => saveAccount(event, option.id)}>
                <label><span>{ht ? 'Non sou kont lan' : 'Nom sur le compte'}</span><input value={drafts[option.id].name} onChange={(e) => setDrafts((current) => ({ ...current, [option.id]: { ...current[option.id], name: e.target.value } }))} autoComplete="name" /></label>
                <label><span>{ht ? 'Telefòn kont lan' : 'Téléphone du compte'}</span><input type="tel" inputMode="tel" value={drafts[option.id].phone} onChange={(e) => setDrafts((current) => ({ ...current, [option.id]: { ...current[option.id], phone: e.target.value } }))} placeholder="+509 ..." /></label>
                <button className="drawer-payment-save" type="submit" disabled={saving === option.id}>{saving === option.id ? (ht ? 'N ap sove…' : 'Enregistrement…') : (ht ? 'Anrejistre' : 'Enregistrer')}</button>
              </form>
            ) : (
              <div className="drawer-payment-account-saved">
                <div><span>{ht ? 'Non' : 'Nom'}</span><strong>{account.name}</strong></div>
                <div><span>{ht ? 'Telefòn' : 'Téléphone'}</span><strong>{account.phone}</strong></div>
                <button type="button" onClick={() => {
                  setDrafts((current) => ({ ...current, [option.id]: account }))
                  setEditing((current) => ({ ...current, [option.id]: true }))
                }}>{ht ? 'Modifye' : 'Modifier'}</button>
              </div>
            )}
          </div>
        })}
      </div>

      <p className="drawer-payment-note">{ht ? 'Chwazi youn nan 2 metòd yo pou pwochen trajè a.' : 'Choisissez un des deux modes pour le prochain trajet.'}</p>
    </section>,
    target,
  )
}
