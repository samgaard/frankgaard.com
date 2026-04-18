'use client'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { ArtworkDialog } from '@/components/artwork-dialog'
import type { artworks } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'
import Autoplay from 'embla-carousel-autoplay'
import { useRef } from 'react'

type Artwork = InferSelectModel<typeof artworks>

export function ArtworkCarousel({ artworks }: { artworks: Artwork[] }) {
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }))

  return (
    <div className="relative">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="ml-0">
          {artworks.map((artwork) => (
            <CarouselItem key={artwork.id} className="pl-0 basis-1/2 sm:basis-1/3 md:basis-1/4">
              <ArtworkDialog
                artwork={artwork}
                className="aspect-[3/4] relative overflow-hidden bg-muted cursor-pointer block w-full"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2" />
      </Carousel>
    </div>
  )
}
