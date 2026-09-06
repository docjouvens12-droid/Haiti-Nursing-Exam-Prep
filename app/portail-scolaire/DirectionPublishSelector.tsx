'use client'

import {useEffect} from 'react'

export default function DirectionPublishSelector(){
 useEffect(()=>{
  let applying=false
  const apply=()=>{
   if(applying)return
   applying=true
   try{
    const headings=Array.from(document.querySelectorAll('.ps-page h2'))
    const heading=headings.find(h=>['Pibliye bilten','Publier les bulletins'].includes((h.textContent||'').trim()))
    const card=heading?.closest('.card') as HTMLElement|null
    if(!card)return
    const native=card.querySelector('select') as HTMLSelectElement|null
    if(!native)return

    const isFr=(heading?.textContent||'').trim()==='Publier les bulletins'
    if(!native.dataset.publishNative){
      native.dataset.publishNative='true'
      native.style.display='none'
    }

    let wrap=card.querySelector('[data-direction-publish-selector]') as HTMLElement|null
    if(!wrap){
      wrap=document.createElement('div')
      wrap.setAttribute('data-direction-publish-selector','true')
      wrap.style.display='grid'
      wrap.style.gridTemplateColumns='1fr 1fr'
      wrap.style.gap='10px'
      native.insertAdjacentElement('afterend',wrap)
    }

    const parse=()=>{
      const value=(native.value||'1er trimestre').toLowerCase()
      if(value.includes('kontwòl')||value.includes('kontwol')||value.includes('control')||value.includes('contrôle')||value.includes('controle')){
        const n=Number(value.match(/([1-4])/)?.[1]||1)
        return {type:'control',number:n}
      }
      const n=Number(value.match(/([1-3])/)?.[1]||1)
      return {type:'trimester',number:n}
    }
    const current=parse()

    if(!wrap.querySelector('[data-publish-type]')){
      const typeBox=document.createElement('div')
      const typeLabel=document.createElement('label')
      typeLabel.dataset.publishTypeLabel='true'
      const typeSelect=document.createElement('select')
      typeSelect.dataset.publishType='true'
      typeSelect.innerHTML='<option value="trimester"></option><option value="control"></option>'
      typeBox.append(typeLabel,typeSelect)

      const numBox=document.createElement('div')
      const numLabel=document.createElement('label')
      numLabel.dataset.publishNumberLabel='true'
      const numSelect=document.createElement('select')
      numSelect.dataset.publishNumber='true'
      numBox.append(numLabel,numSelect)
      wrap.append(typeBox,numBox)

      const sync=()=>{
        const type=(typeSelect.value||'trimester') as 'trimester'|'control'
        const max=type==='trimester'?3:4
        const previous=Math.min(Number(numSelect.value||1),max)
        numSelect.innerHTML=''
        for(let i=1;i<=max;i++){
          const o=document.createElement('option');o.value=String(i);o.textContent=String(i);numSelect.appendChild(o)
        }
        numSelect.value=String(previous||1)
        const n=Number(numSelect.value||1)
        const term=type==='control'?`Kontwòl ${n}`:(n===1?'1er trimestre':`${n}e trimestre`)
        if(!Array.from(native.options).some(o=>o.value===term)){
          const o=document.createElement('option');o.value=term;o.textContent=term;native.appendChild(o)
        }
        native.value=term
        native.dispatchEvent(new Event('change',{bubbles:true}))
      }
      typeSelect.addEventListener('change',sync)
      numSelect.addEventListener('change',sync)
    }

    const typeSelect=wrap.querySelector('[data-publish-type]') as HTMLSelectElement
    const numSelect=wrap.querySelector('[data-publish-number]') as HTMLSelectElement
    const typeLabel=wrap.querySelector('[data-publish-type-label]') as HTMLElement
    const numLabel=wrap.querySelector('[data-publish-number-label]') as HTMLElement
    typeLabel.textContent=isFr?'Type':'Kalite evalyasyon'
    numLabel.textContent=isFr?'Numéro':'Nimewo'
    const opts=Array.from(typeSelect.options)
    if(opts[0])opts[0].textContent=isFr?'Trimestre':'Trimès'
    if(opts[1])opts[1].textContent=isFr?'Contrôle':'Kontwòl'

    if(typeSelect.dataset.initialized!=='true'){
      typeSelect.value=current.type
      const max=current.type==='trimester'?3:4
      numSelect.innerHTML=''
      for(let i=1;i<=max;i++){
        const o=document.createElement('option');o.value=String(i);o.textContent=String(i);numSelect.appendChild(o)
      }
      numSelect.value=String(current.number)
      typeSelect.dataset.initialized='true'
    }

    const button=Array.from(card.querySelectorAll('button')).find(b=>b.classList.contains('btn')) as HTMLButtonElement|undefined
    if(button){
      const type=typeSelect.value
      button.textContent=isFr
        ? (type==='control'?'Publier les notes de ce contrôle':'Publier les notes de ce trimestre')
        : (type==='control'?'Pibliye nòt kontwòl sa a':'Pibliye nòt trimès sa a')
    }
   } finally {applying=false}
  }
  apply()
  const o=new MutationObserver(()=>requestAnimationFrame(apply))
  o.observe(document.body,{subtree:true,childList:true,characterData:true})
  return()=>o.disconnect()
 },[])
 return null
}
