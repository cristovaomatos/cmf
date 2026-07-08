import { useMemo } from 'react'
import katex from 'katex'

function renderKatex(math: string, displayMode: boolean): string {
  try {
    return katex.renderToString(math, { displayMode, throwOnError: false })
  } catch {
    return math
  }
}

export function Katex({ math, display = false }: { math: string; display?: boolean }) {
  const html = useMemo(() => renderKatex(math, display), [math, display])
  const Tag = display ? 'div' : 'span'
  return <Tag dangerouslySetInnerHTML={{ __html: html }} />
}
