'use client'

import Image from 'next/image'
import { XIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { artworks } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

type Artwork = InferSelectModel<typeof artworks>

export function ArtworkDialog({ artwork, className, priority }: { artwork: Artwork; className?: string; priority?: boolean }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`group ${className ?? "aspect-square relative overflow-hidden rounded-md bg-muted cursor-pointer block w-full"}`}
      >
        <Image
          src={artwork.imageUrl}
          alt={artwork.altText ?? artwork.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 25vw"
          priority={priority}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white text-xs font-medium leading-tight line-clamp-2">{artwork.title}</p>
        </div>
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>

          <div
            className="relative w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={artwork.imageUrl}
              alt={artwork.altText ?? artwork.title}
              fill
              className="object-contain"
              sizes="100vw"
            />
            {(artwork.title || artwork.description) && (
              <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-black/60 text-white flex justify-center">
              <div className="w-full max-w-xl">
                <p className="font-medium text-sm">{artwork.title}</p>
                {artwork.description && (
                  <div
                    className="text-xs text-white/70 mt-0.5"
                    dangerouslySetInnerHTML={{ __html: artwork.description }}
                  />
                )}
              </div>
            </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
