import Link from 'next/link'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/auth'

export async function SiteHeader() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  return (
    <header className="border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          Frank Gaard
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/gallery" className="text-muted-foreground hover:text-foreground transition-colors">
            Gallery
          </Link>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
            Blog
          </Link>
          {session.isLoggedIn && (
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
