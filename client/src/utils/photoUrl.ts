export function withCacheBust(url: string | null | undefined): string | null {
  if (!url) return null
  const base = url.split('?')[0]
  return `${base}?v=${Date.now()}`
}
