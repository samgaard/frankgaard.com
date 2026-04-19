'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { XIcon, ChevronLeftIcon, ChevronRightIcon, LoaderCircleIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import type { artworks } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

type Artwork = InferSelectModel<typeof artworks>

export function ArtworkLightbox({
  artworks,
  index,
  onClose,
  onPrev,
  onNext,
  getArtworkUrl,
  onCloseUrl,
  loadingMore,
}: {
  artworks: Artwork[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  getArtworkUrl?: (id: number) => string
  onCloseUrl?: string
  loadingMore?: boolean
}) {
  const artwork = artworks[index]
  const hasPrev = index > 0
  const hasNext = index < artworks.length - 1
  const [showInfo, setShowInfo] = useState(true)
  const touchStartX = useRef<number | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    setShowInfo(true)
    if (!getArtworkUrl) return
    const url = getArtworkUrl(artworks[index].id)
    if (isFirstRender.current) {
      window.history.pushState({}, '', url)
      isFirstRender.current = false
    } else {
      window.history.replaceState({}, '', url)
    }
  }, [index, artworks, getArtworkUrl])

  function handleClose() {
    if (onCloseUrl) window.history.replaceState({}, '', onCloseUrl)
    onClose()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext) onNext()
    }
    const onPopState = () => onClose()
    document.addEventListener('keydown', onKey)
    window.addEventListener('popstate', onPopState)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPopState)
    }
  }, [hasPrev, hasNext, onPrev, onNext])

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={handleClose}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return
        const dx = e.changedTouches[0].clientX - touchStartX.current
        if (dx > 50 && hasPrev) onPrev()
        if (dx < -50 && hasNext) onNext()
        touchStartX.current = null
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); handleClose() }}
        className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
        aria-label="Close"
      >
        <XIcon className="h-5 w-5" />
      </button>

      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      )}

      {(hasNext || loadingMore) && (
        <button
          onClick={(e) => { e.stopPropagation(); if (hasNext) onNext() }}
          disabled={!hasNext && loadingMore}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next"
        >
          {!hasNext && loadingMore
            ? <LoaderCircleIcon className="h-5 w-5 animate-spin" />
            : <ChevronRightIcon className="h-5 w-5" />
          }
        </button>
      )}

      <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
        <Image
          src={artwork.imageUrl}
          alt={artwork.altText ?? artwork.title}
          fill
          className="object-contain"
          sizes="100vw"
        />
        {(artwork.title || artwork.description) && (
          <div className="absolute bottom-0 left-0 right-0 text-white">
            <div className="flex justify-center">
              <div className="w-full max-w-xl px-6 flex justify-end">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowInfo(v => !v) }}
                  className="bg-black/60 rounded-t-md px-2 py-1 text-white/70 hover:text-white transition-colors"
                  aria-label={showInfo ? 'Hide info' : 'Show info'}
                >
                  {showInfo ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronUpIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {showInfo && (
              <div className="bg-black/60 py-4 flex justify-center">
                <div className="w-full max-w-xl px-6">
                  <p className="font-medium text-lg">{artwork.title}</p>
                  {artwork.description && (
                    <div
                      className="text-base text-white/90 mt-1"
                      dangerouslySetInnerHTML={{ __html: artwork.description }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
