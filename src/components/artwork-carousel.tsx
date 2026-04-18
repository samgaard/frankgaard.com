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
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {artworks.map((artwork) => (
          <CarouselItem key={artwork.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4">
            <ArtworkDialog
              artwork={artwork}
              className="aspect-square relative overflow-hidden rounded-md bg-muted cursor-pointer block w-full"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
