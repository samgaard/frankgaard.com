import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <Image src="/swan.png" alt="Swan" width={200} height={200} />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">This page doesn't exist or has moved.</p>
      </div>
      <div className="flex gap-4 text-sm">
        <Link href="/" className="underline underline-offset-4 hover:text-muted-foreground transition-colors">
          Home
        </Link>
        <Link href="/gallery" className="underline underline-offset-4 hover:text-muted-foreground transition-colors">
          Gallery
        </Link>
        <Link href="/blog" className="underline underline-offset-4 hover:text-muted-foreground transition-colors">
          Blog
        </Link>
      </div>
    </div>
  )
}
