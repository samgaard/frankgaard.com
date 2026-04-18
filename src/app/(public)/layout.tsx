import { SiteHeader } from '@/components/site-header'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="w-full max-w-5xl mx-auto px-4 py-8">{children}</main>
    </>
  )
}
