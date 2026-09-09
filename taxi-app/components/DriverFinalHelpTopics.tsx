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

export default function DriverFinalHelpTopics(){
  useEffect(()=>{
    if(window.location.pathname!=='/driver/dashboard') return

    const render=()=>{
      const sections=Array.from(document.querySelectorAll<HTMLElement>('.driver-final-menu-stable-root .dfm-section'))
      const help=sections.find(section=>{
        const text=section.querySelector('.dfm-trigger span')?.textContent?.trim().toLowerCase()
        return text==='aide'||text==='èd'
      })
      const body=help?.querySelector<HTMLElement>('.dfm-body')
      if(!body) return
      if(body.dataset.fullHelpTopics==='1') return

      const ht=localStorage.getItem('taxi-language')==='ht'
      const topics=ht?HT:FR
      body.innerHTML=''
      for(const [title,description] of topics){
        const card=document.createElement('div')
        card.className='dfm-help-card'
        const strong=document.createElement('strong')
        strong.textContent=title
        const p=document.createElement('p')
        p.textContent=description
        card.append(strong,p)
        body.appendChild(card)
      }
      body.dataset.fullHelpTopics='1'
    }

    render()
    const observer=new MutationObserver(render)
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>observer.disconnect()
  },[])

  return null
}
