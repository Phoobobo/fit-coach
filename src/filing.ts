export interface FilingLink {
  text: string
  url: string
}

export interface Filing {
  icp: FilingLink
  police: FilingLink & {
    code: string
    icon: string
  }
}

function isLink(value: unknown): value is FilingLink {
  if (typeof value !== 'object' || value === null) return false
  const link = value as { text?: unknown; url?: unknown }
  return (
    typeof link.text === 'string' &&
    link.text.trim() !== '' &&
    typeof link.url === 'string' &&
    link.url.startsWith('https://')
  )
}

export function isFiling(value: unknown): value is Filing {
  if (typeof value !== 'object' || value === null) return false
  const filing = value as { icp?: unknown; police?: unknown }
  if (!isLink(filing.icp) || !isLink(filing.police)) return false
  const police = filing.police as { code?: unknown; icon?: unknown }
  return typeof police.code === 'string' && /^\d{14}$/.test(police.code) && typeof police.icon === 'string'
}
