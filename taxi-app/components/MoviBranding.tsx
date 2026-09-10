'use client'

import { useEffect } from 'react'

const replacements: Array<[RegExp, string]> = [
  [/Taxi Platform Haiti/gi, 'MOVI'],
  [/Taxi Haiti/gi, 'MOVI'],
]

function applyMoviBranding() {
  document.title = 'MOVI'
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  let node = walker.nextNode()
  while (node) {
    nodes.push(node as Text)
    node = walker.nextNode()
  }

  for (const textNode of nodes) {
    let value = textNode.nodeValue || ''
    let next = value
    for (const [pattern, replacement] of replacements) next = next.replace(pattern, replacement)
    if (next !== value) textNode.nodeValue = next
  }
}

export default function MoviBranding() {
  useEffect(() => {
    applyMoviBranding()
    const observer = new MutationObserver(() => applyMoviBranding())
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  return null
}
