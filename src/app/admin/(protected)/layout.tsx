import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sessionOptions, SessionData } from '@/lib/auth'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.isLoggedIn) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-sm">Admin</span>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/admin/artwork" className="text-muted-foreground hover:text-foreground transition-colors">
              Artwork
            </Link>
            <Link href="/admin/posts" className="text-muted-foreground hover:text-foreground transition-colors">
              Posts
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              View Site
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-muted-foreground hover:text-foreground transition-colors">
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
