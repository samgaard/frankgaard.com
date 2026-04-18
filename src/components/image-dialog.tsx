'use client'

import Image from 'next/image'
import { XIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export function ImageDialog({ src, alt }: { src: string; alt?: string }) {
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
        className="aspect-square relative overflow-hidden rounded-md bg-muted cursor-pointer block w-full"
      >
        <Image
          src={src}
          alt={alt ?? ''}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
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
          <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image src={src} alt={alt ?? ''} fill className="object-contain" sizes="100vw" />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
