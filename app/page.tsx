// app/page.tsx - Landing page without "Start Free Trial"
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ira-carbon-900 via-ira-carbon-800 to-ira-carbon-900">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-ira-carbon-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">IRA</span>
            <span className="text-xs text-white/50">Racing Analytics</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-white/60 hover:text-white text-sm">Privacy</Link>
            <Link href="/terms" className="text-white/60 hover:text-white text-sm">Terms</Link>
            <Link href="/login" className="px-4 py-2 bg-ira-red rounded-lg text-white font-medium hover:bg-ira-red/90">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Race Smarter.<br/>
            <span className="text-ira-red">Win More.</span>
          </h1>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            AI-powered telemetry analysis for karting. Transform your MyChron data into actionable coaching insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="px-8 py-4 bg-ira-red rounded-xl text-white font-bold text-lg hover:bg-ira-red/90 transition-all"
            >
              Get Started
            </Link>
            <a 
              href="#features" 
              className="px-8 py-4 border border-white/20 rounded-xl text-white font-medium hover:bg-white/5 transition-all"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-ira-carbon-800 border border-white/10">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-white mb-2">Track Visualization</h3>
              <p className="text-white/60">GPS heatmaps showing speed through every corner. Satellite view with racing line overlay.</p>
            </div>
            <div className="p-6 rounded-2xl bg-ira-carbon-800 border border-white/10">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">Telemetry Charts</h3>
              <p className="text-white/60">Speed, RPM, G-Force, temperatures. Multi-lap overlay for comparison.</p>
            </div>
            <div className="p-6 rounded-2xl bg-ira-carbon-800 border border-white/10">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-white mb-2">AI Coaching</h3>
              <p className="text-white/60">Get personalized tips from AI analyzing your driving data. Braking zones, racing line, consistency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-20 px-4 bg-ira-carbon-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Available Everywhere</h2>
          <p className="text-white/60 mb-8">iOS • Android • Web</p>
          <div className="flex justify-center gap-4">
            <a href="#" className="px-6 py-3 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all">
              📱 App Store
            </a>
            <a href="#" className="px-6 py-3 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all">
              🤖 Google Play
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white/50 text-sm">
            © 2026 Ipro Racing, Barcelona, Spain
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/50 hover:text-white text-sm">Privacy</Link>
            <Link href="/terms" className="text-white/50 hover:text-white text-sm">Terms</Link>
            <a href="https://instagram.com/intelligent_racing_analytics" className="text-white/50 hover:text-white text-sm">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
