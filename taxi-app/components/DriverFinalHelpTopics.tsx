'use client'

import { useEffect } from 'react'

type Topic = [string,string]

const HT: Topic[] = [
  ['Trajè ak demann','Kijan pou resevwa, verifye ak jere yon nouvo demann trajè.'],
  ['Aksepte oswa kòmanse trajè','Kijan pou aksepte yon demann, rive jwenn pasaje a epi kòmanse trajè a.'],
  ['Pwoblèm ak pasaje','Sa pou fè si pasaje a pa parèt, bay move enfòmasyon oswa gen yon dezakò.'],
  ['Peman ak revni','Konprann pri trajè a, revni ou ak komisyon platfòm lan.'],
  ['MonCash ak NatCash','Chwazi epi mete ajou kont MonCash oswa NatCash pou resevwa peman.'],
  ['Pwofil ak kont','Modifye enfòmasyon pèsonèl ou epi verifye done kont chofè a.'],
  ['Veyikil ak dokiman','Mete ajou enfòmasyon veyikil la, plak, ane, plas ak dokiman ki nesesè.'],
  ['Sekirite','Konsèy pou pwoteje tèt ou, pasaje a ak veyikil la pandan trajè yo.'],
  ['Aksidan oswa ijans','Etap pou swiv si gen aksidan, blesi oswa yon lòt ijans sou wout la.'],
  ['Pwoblèm teknik','Sa pou fè si aplikasyon an pa chaje, yon bouton pa mache oswa gen yon erè.'],
  ['GPS ak pozisyon','Kijan pou aktive pozisyon epi rezoud pwoblèm GPS oswa lokalizasyon.'],
  ['Kont sispann oswa limite','Kisa pou fè si kont chofè a sispann, bloke oswa gen restriksyon.'],
  ['Anile yon trajè','Kilè ak kijan pou anile yon trajè san konfizyon.'],
  ['Rapòte yon pwoblèm','Kijan pou rapòte yon pasaje, yon trajè, yon peman oswa yon pwoblèm sekirite.'],
  ['Règ ak kondisyon chofè','Prensipal règ ak responsablite chofè yo sou Taxi Platform Haiti.'],
  ['Kontakte sipò','Kijan pou kontakte ekip sipò a lè ou bezwen asistans dirèk.']
]

const FR: Topic[] = [
  ['Trajets et demandes','Comment recevoir, vérifier et gérer une nouvelle demande de trajet.'],
  ['Accepter ou démarrer un trajet','Comment accepter une demande, rejoindre le passager et démarrer le trajet.'],
  ['Problèmes avec un passager','Que faire si le passager est absent, donne de mauvaises informations ou en cas de désaccord.'],
  ['Paiements et revenus','Comprendre le prix du trajet, vos revenus et la commission de la plateforme.'],
  ['MonCash et NatCash','Choisir et mettre à jour votre compte MonCash ou NatCash pour recevoir les versements.'],
  ['Profil et compte','Modifier vos informations personnelles et vérifier les données de votre compte chauffeur.'],
  ['Véhicule et documents','Mettre à jour le véhicule, la plaque, l’année, les places et les documents nécessaires.'],
  ['Sécurité','Conseils pour protéger le chauffeur, le passager et le véhicule pendant les trajets.'],
  ['Accident ou urgence','Étapes à suivre en cas d’accident, blessure ou autre urgence sur la route.'],
  ['Problème technique','Que faire si l’application ne charge pas, si un bouton ne fonctionne pas ou en cas d’erreur.'],
  ['GPS et localisation','Comment activer la localisation et résoudre les problèmes de GPS ou de position.'],
  ['Compte suspendu ou limité','Que faire si votre compte chauffeur est suspendu, bloqué ou restreint.'],
  ['Annuler un trajet','Quand et comment annuler un trajet correctement.'],
  ['Signaler un problème','Comment signaler un passager, un trajet, un paiement ou un problème de sécurité.'],
  ['Règles et conditions chauffeur','Les principales règles et responsabilités des chauffeurs sur Taxi Platform Haiti.'],
  ['Contacter le support','Comment contacter l’équipe de support lorsque vous avez besoin d’une assistance directe.']
]

const ICONS=['🚕','✅','👤','💳','📱','👤','🚗','🛡️','🚨','🛠️','📍','🔒','✖️','⚠️','📋','💬']

export default function DriverFinalHelpTopics(){
  useEffect(()=>{
    if(window.location.pathname!=='/driver/dashboard') return

    const styleId='driver-help-center-polish-style'
    if(!document.getElementById(styleId)){
      const style=document.createElement('style')
      style.id=styleId
      style.textContent=`
        .driver-help-center-head{background:linear-gradient(145deg,#0f705a,#155f51);color:#fff;border-radius:18px;padding:15px;margin:2px 0 12px;display:flex;gap:12px;align-items:center;box-shadow:0 8px 20px rgba(15,112,90,.16)}
        .driver-help-center-head .dhc-icon{width:44px;height:44px;border-radius:14px;background:rgba(255,255,255,.16);display:grid;place-items:center;font-size:21px;border:1px solid rgba(255,255,255,.28)}
        .driver-help-center-head strong{display:block;font-size:14px}.driver-help-center-head small{display:block;margin-top:3px;font-size:10px;line-height:1.35;opacity:.86}
        .driver-help-topic{border:1px solid #e2e9e6;border-radius:14px;background:#fff;margin:8px 0;overflow:hidden;box-shadow:0 4px 12px rgba(16,32,51,.04)}
        .driver-help-topic button{width:100%;border:0;background:#fff;padding:12px;display:grid;grid-template-columns:34px 1fr 22px;gap:10px;align-items:center;text-align:left;color:#102033;cursor:pointer;touch-action:manipulation}
        .driver-help-topic .dht-icon{width:34px;height:34px;border-radius:10px;background:#eaf5f1;display:grid;place-items:center;font-size:16px}
        .driver-help-topic .dht-title{font-size:11px;font-weight:850;line-height:1.25}
        .driver-help-topic .dht-chevron{font-size:18px;color:#0f705a;text-align:center;transition:transform .2s ease}
        .driver-help-topic.open{border-color:#9fd1c1;background:#f8fcfa}
        .driver-help-topic.open .dht-chevron{transform:rotate(90deg)}
        .driver-help-topic .dht-answer{display:none;margin:0;padding:0 12px 12px 56px;font-size:10px;line-height:1.5;color:#63736d}
        .driver-help-topic.open .dht-answer{display:block}
        .driver-help-support{margin-top:12px;border-radius:14px;padding:13px;background:#f2f7f5;border:1px solid #dce9e4;text-align:center}
        .driver-help-support strong{display:block;font-size:11px;color:#102033;margin-bottom:4px}.driver-help-support span{font-size:10px;color:#6b7b75;line-height:1.4;display:block}
      `
      document.head.appendChild(style)
    }

    const render=()=>{
      const sections=Array.from(document.querySelectorAll<HTMLElement>('.driver-final-menu-stable-root .dfm-section'))
      const help=sections.find(section=>{
        const text=section.querySelector('.dfm-trigger span')?.textContent?.trim().toLowerCase()
        return text==='aide'||text==='èd'
      })
      const body=help?.querySelector<HTMLElement>('.dfm-body')
      if(!body) return

      const ht=localStorage.getItem('taxi-language')==='ht'
      const langKey=ht?'ht':'fr'
      if(body.dataset.fullHelpTopics===langKey) return

      const topics=ht?HT:FR
      body.replaceChildren()

      const head=document.createElement('div')
      head.className='driver-help-center-head'
      head.innerHTML=`<div class="dhc-icon">❓</div><div><strong>${ht?'Sant Èd chofè':'Centre d’aide chauffeur'}</strong><small>${ht?'Chwazi yon sijè pou jwenn asistans rapid.':'Choisissez un sujet pour obtenir une aide rapide.'}</small></div>`
      body.appendChild(head)

      topics.forEach(([title,description],index)=>{
        const card=document.createElement('div')
        card.className='driver-help-topic'
        const button=document.createElement('button')
        button.type='button'
        button.setAttribute('aria-expanded','false')
        button.innerHTML=`<span class="dht-icon">${ICONS[index]||'❓'}</span><span class="dht-title"></span><span class="dht-chevron">›</span>`
        const titleEl=button.querySelector<HTMLElement>('.dht-title')
        if(titleEl) titleEl.textContent=title
        const answer=document.createElement('p')
        answer.className='dht-answer'
        answer.textContent=description
        button.addEventListener('click',()=>{
          const open=card.classList.toggle('open')
          button.setAttribute('aria-expanded',String(open))
        })
        card.append(button,answer)
        body.appendChild(card)
      })

      const support=document.createElement('div')
      support.className='driver-help-support'
      support.innerHTML=`<strong>💬 ${ht?'Bezwen plis èd?':'Besoin de plus d’aide ?'}</strong><span>${ht?'Sèvi ak seksyon Kontakte sipò a pou asistans dirèk.':'Utilisez la rubrique Contacter le support pour une assistance directe.'}</span>`
      body.appendChild(support)
      body.dataset.fullHelpTopics=langKey
    }

    render()
    const observer=new MutationObserver(render)
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>observer.disconnect()
  },[])

  return null
}
