import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Transform Your Content with{' '}
              <span className="text-primary">ConvertAI</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Powerful AI-driven content conversion platform. Convert any format instantly with professional quality.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors font-medium"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-input bg-background hover:bg-accent transition-colors font-medium"
            >
              Learn More
            </Link>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Trusted by creators worldwide
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
