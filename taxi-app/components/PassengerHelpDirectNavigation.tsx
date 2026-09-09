'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Topic = { icon: string; fr: string; ht: string; bodyFr: string; bodyHt: string }

const TOPICS: Topic[] = [
  { icon:'🚕', fr:'Commander un trajet', ht:'Mande yon trajè', bodyFr:'Choisissez votre point de prise en charge et votre destination, vérifiez le type de véhicule et le prix estimé, puis appuyez sur Commander. Gardez votre téléphone disponible pendant la recherche du chauffeur.', bodyHt:'Chwazi kote pou pran ou ak destinasyon an, verifye kalite machin nan ak pri estime a, epi peze Mande. Kenbe telefòn ou disponib pandan sistèm nan ap chèche chofè.' },
  { icon:'📍', fr:'Position et GPS', ht:'Pozisyon ak GPS', bodyFr:'Activez la localisation du téléphone et autorisez Taxi Haiti à utiliser votre position. Si votre position est incorrecte, vérifiez le GPS et actualisez la page une fois.', bodyHt:'Aktive Location/GPS sou telefòn ou epi bay Taxi Haiti pèmisyon pou itilize pozisyon an. Si pozisyon an pa bon, verifye GPS la epi rafrechi paj la yon fwa.' },
  { icon:'👤', fr:'Chauffeur et véhicule', ht:'Chofè ak machin', bodyFr:'Après acceptation, vérifiez les informations du chauffeur et du véhicule affichées dans l’application. Utilisez uniquement le véhicule indiqué pour votre trajet.', bodyHt:'Apre yon chofè aksepte, verifye enfòmasyon chofè a ak machin nan aplikasyon an. Monte sèlman nan machin ki koresponn ak enfòmasyon trajè a.' },
  { icon:'💳', fr:'Paiement', ht:'Peman', bodyFr:'Votre mode de paiement principal peut être MonCash ou NatCash. Vérifiez le nom et le numéro associés au compte avant de confirmer. Le montant affiché dans l’application doit correspondre au trajet.', bodyHt:'Metòd peman prensipal ou ka MonCash oswa NatCash. Verifye non ak nimewo ki sou kont lan anvan ou konfime. Montan ki nan aplikasyon an dwe koresponn ak trajè a.' },
  { icon:'✖️', fr:'Annuler un trajet', ht:'Anile yon trajè', bodyFr:'Annulez seulement si nécessaire. Si un chauffeur a déjà accepté, choisissez le motif le plus exact afin que l’historique du trajet reste clair.', bodyHt:'Anile sèlman lè sa nesesè. Si yon chofè deja aksepte, chwazi rezon ki pi egzak la pou istorik trajè a rete klè.' },
  { icon:'🧾', fr:'Historique des trajets', ht:'Istorik trajè', bodyFr:'La rubrique Mes trajets affiche vos trajets récents, leur statut, la date, le trajet et le montant. Utilisez Détails pour ouvrir les informations complètes.', bodyHt:'Seksyon Trajè mwen yo montre dènye trajè yo, estati, dat, wout ak montan. Peze Detay pou wè plis enfòmasyon.' },
  { icon:'🛡️', fr:'Sécurité', ht:'Sekirite', bodyFr:'Vérifiez toujours le chauffeur et le véhicule avant de monter. Portez la ceinture si disponible. En cas de menace, d’accident ou de danger immédiat, éloignez-vous si possible et contactez les services d’urgence locaux.', bodyHt:'Toujou verifye chofè a ak machin nan anvan ou monte. Mete senti sekirite si genyen. Si gen menas, aksidan oswa danje imedya, mete tèt ou an sekirite epi kontakte sèvis ijans lokal yo.' },
  { icon:'🛠️', fr:'Problème technique', ht:'Pwoblèm teknik', bodyFr:'Si un bouton ne répond pas ou si une page ne charge pas, actualisez une fois, vérifiez votre connexion Internet, puis relancez l’application si nécessaire. Prenez une capture d’écran si le problème continue.', bodyHt:'Si yon bouton pa reponn oswa yon paj pa chaje, rafrechi yon fwa, verifye entènèt la, epi relouvri aplikasyon an si sa nesesè. Pran yon screenshot si pwoblèm nan kontinye.' },
  { icon:'⚠️', fr:'Signaler un problème', ht:'Rapòte yon pwoblèm', bodyFr:'Notez la date du trajet, le problème rencontré et toute information utile. Si possible, gardez une capture d’écran pour aider le support à comprendre plus rapidement la situation.', bodyHt:'Note dat trajè a, pwoblèm ki rive a ak tout enfòmasyon itil. Si posib, kenbe yon screenshot pou ede sipò konprann sitiyasyon an pi vit.' },
  { icon:'💬', fr:'Contacter le support', ht:'Kontakte sipò', bodyFr:'Contactez le support si les étapes ci-dessus ne résolvent pas votre problème. Indiquez votre nom, le type de problème, la date et l’heure, ainsi que les informations du trajet si nécessaire.', bodyHt:'Kontakte sipò si etap ki anlè yo pa rezoud pwoblèm nan. Bay non ou, kalite pwoblèm nan, dat ak lè, epi enfòmasyon trajè a si sa nesesè.' },
]

export default function PassengerHelpDirectNavigation() {
  const [target, setTarget] = useState<Element | null>(null)
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState<'fr'|'ht'>('fr')
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    let currentButton: HTMLButtonElement | null = null
    let currentHandler: ((event: MouseEvent) => void) | null = null

    const sync = () => {
      const drawer = document.querySelector('.nav-drawer')
      if (!drawer) { setTarget(null); setOpen(false); return }
      const buttons = Array.from(drawer.querySelectorAll<HTMLButtonElement>('.drawer-nav > button'))
      const helpButton = buttons.find((button) => {
        const text = (button.textContent || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
        return text.includes('aide') || text.includes('ed')
      }) || null
      if (!helpButton) { setTarget(null); return }

      if (currentButton !== helpButton) {
        if (currentButton && currentHandler) currentButton.removeEventListener('click', currentHandler, true)
        currentButton = helpButton
        currentHandler = (event: MouseEvent) => {
          event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation()
          setLang(localStorage.getItem('taxi-language') === 'ht' ? 'ht' : 'fr')
          setOpen((value) => !value)
          setActive(null)
        }
        helpButton.addEventListener('click', currentHandler, true)
      }

      let mount = drawer.querySelector('.drawer-help-inline-target') as HTMLElement | null
      if (!mount) {
        mount = document.createElement('div')
        mount.className = 'drawer-help-inline-target'
        helpButton.insertAdjacentElement('afterend', mount)
      }
      setTarget(mount)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList:true, subtree:true })
    return () => {
      observer.disconnect()
      if (currentButton && currentHandler) currentButton.removeEventListener('click', currentHandler, true)
    }
  }, [])

  if (!target || !open) return null
  const ht = lang === 'ht'

  return createPortal(
    <section className="passenger-help-center">
      <style>{`
        .drawer-help-inline-target{width:100%;order:51}
        .passenger-help-center{margin:4px 4px 10px;padding:11px;border:1px solid #dce9e5;border-radius:16px;background:#f8fcfa}
        .passenger-help-head{background:linear-gradient(145deg,#0f705a,#155f51);color:#fff;border-radius:15px;padding:13px;margin-bottom:9px;display:grid;grid-template-columns:40px 1fr auto;gap:10px;align-items:center}
        .passenger-help-icon{width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.16);display:grid;place-items:center;font-size:19px}
        .passenger-help-head strong{display:block;font-size:12px}.passenger-help-head small{display:block;margin-top:3px;font-size:8.5px;line-height:1.35;opacity:.86}
        .passenger-help-head button{border:0;border-radius:9px;background:rgba(255,255,255,.16);color:#fff;font-size:9px;font-weight:850;padding:6px 8px}
        .passenger-help-topic{border:1px solid #e3ebe8;border-radius:12px;background:#fff;margin:7px 0;overflow:hidden}
        .passenger-help-topic>button{width:100%;border:0;background:#fff;padding:10px;display:grid;grid-template-columns:30px 1fr 18px;gap:8px;align-items:center;text-align:left;color:#173246}
        .passenger-help-topic-icon{width:30px;height:30px;border-radius:9px;background:#eaf5f1;display:grid;place-items:center;font-size:14px}
        .passenger-help-topic-title{font-size:10px;font-weight:850;line-height:1.25}.passenger-help-chevron{font-size:15px;color:#0f705a;transition:.2s}.passenger-help-topic.open .passenger-help-chevron{transform:rotate(90deg)}
        .passenger-help-answer{padding:0 10px 11px 48px;font-size:9.5px;line-height:1.55;color:#5d6d67}
        .passenger-help-support{margin-top:9px;padding:10px;border-radius:12px;background:#eef7f3;border:1px solid #dbe9e3;text-align:center;color:#63736d;font-size:9px;line-height:1.45}
      `}</style>
      <div className="passenger-help-head">
        <div className="passenger-help-icon">❓</div>
        <div><strong>{ht ? 'Sant èd pasaje' : 'Centre d’aide passager'}</strong><small>{ht ? 'Chwazi yon sijè pou wè etap yo' : 'Choisissez un sujet pour voir les étapes'}</small></div>
        <button type="button" onClick={() => setOpen(false)}>{ht ? 'Fèmen' : 'Fermer'}</button>
      </div>
      {TOPICS.map((topic, index) => {
        const isOpen = active === index
        return <div className={`passenger-help-topic ${isOpen ? 'open' : ''}`} key={topic.fr}>
          <button type="button" onClick={() => setActive(isOpen ? null : index)}>
            <span className="passenger-help-topic-icon">{topic.icon}</span>
            <span className="passenger-help-topic-title">{ht ? topic.ht : topic.fr}</span>
            <span className="passenger-help-chevron">›</span>
          </button>
          {isOpen && <div className="passenger-help-answer">{ht ? topic.bodyHt : topic.bodyFr}</div>}
        </div>
      })}
      <div className="passenger-help-support">{ht ? 'Si gen yon ijans oswa danje fizik imedya, kontakte sèvis ijans lokal yo an premye.' : 'En cas d’urgence ou de danger physique immédiat, contactez d’abord les services d’urgence locaux.'}</div>
    </section>,
    target,
  )
}
