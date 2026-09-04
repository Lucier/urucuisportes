'use client'

import { useState } from 'react'

interface Props {
  src: string
  alt: string
  className?: string
}

export function SafeImage({ src, alt, className }: Props) {
  const [hidden, setHidden] = useState(false)
  if (hidden) return null
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHidden(true)}
    />
  )
}
