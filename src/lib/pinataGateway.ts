const PUBLIC_PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs'

function normalizeGatewaySubdomain(raw: string): string {
  let s = raw.trim().replace(/\/+$/, '')
  s = s.replace(/^https?:\/\//i, '')
  const hostMarker = '.mypinata.cloud'
  const idx = s.toLowerCase().indexOf(hostMarker)
  if (idx >= 0) s = s.slice(0, idx)
  return s.split('/')[0]?.trim() ?? ''
}

/** Base gateway path (no CID). Matches backend ``pinata_gateway_base_url()`` resolution. */
export function pinataGatewayBaseUrl(): string {
  const explicit = (import.meta.env.VITE_PINATA_GATEWAY_BASE_URL as string | undefined)?.trim().replace(/\/+$/, '')
  if (explicit) return explicit

  const subdomain = (import.meta.env.VITE_PINATA_GATEWAY_SUBDOMAIN as string | undefined)?.trim()
  if (subdomain) {
    const bare = normalizeGatewaySubdomain(subdomain)
    if (bare) return `https://${bare}.mypinata.cloud/ipfs`
  }

  return PUBLIC_PINATA_GATEWAY
}

/** Deterministic Pinata/IPFS URL from CID or pass-through for existing http(s) URLs. */
export function pinataGatewayUrl(cidOrUrl: string | null | undefined): string | null {
  const s = cidOrUrl?.trim()
  if (!s || s === 'created') return null
  if (/^https?:\/\//i.test(s)) return s
  const cid = s.replace(/^ipfs:\/\//i, '').replace(/\/+$/, '')
  return cid ? `${pinataGatewayBaseUrl()}/${cid}` : null
}
