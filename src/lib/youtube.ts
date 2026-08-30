export function extractYouTubeId(url: string): string | null {
  const pattern =
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  return url.match(pattern)?.[1] ?? null
}

export function toEmbedUrl(url: string): string | null {
  const id = extractYouTubeId(url)
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null
}

export function toThumbnailUrl(url: string): string | null {
  const id = extractYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null
}
