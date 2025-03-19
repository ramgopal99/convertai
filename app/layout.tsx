import Providers from '@/components/providers'
import Nav from '@/components/layout/nav'
import './globals.css'
import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative min-h-screen">
            <div className="sticky top-0 z-50">
              <Nav />
            </div>
            <main className="h-[calc(100vh-4rem)] overflow-auto">
              {children}
            </main>
          </div>
        </Providers>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
