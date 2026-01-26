// app/page.tsx
// IRA Web Platform - Landing Page

import Link from 'next/link'
import { 
  Gauge, 
  Map, 
  BarChart3, 
  Brain, 
  Users, 
  Trophy,
  ArrowRight,
  Play,
  Zap,
  Globe
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ira-carbon-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-ira-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">IRA</span>
              </div>
              <span className="text-white font-bold text-xl hidden sm:block">
                Racing Analytics
              </span>
            </Link>
            
            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-white/70 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-white/70 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/leaderboard" className="text-white/70 hover:text-white transition-colors">
                Leaderboard
              </Link>
            </div>
            
            {/* CTA */}
            <div className="flex items-center gap-4">
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/login" className="btn-racing">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-ira-red/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-ira-red/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ira-red/10 border border-ira-red/20 mb-8 animate-in">
            <Globe className="w-4 h-4 text-ira-red" />
            <span className="text-sm text-white/80">Now in 6 languages</span>
            <span className="text-xs px-2 py-0.5 bg-ira-red rounded-full text-white font-bold">NEW</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-in" style={{ animationDelay: '100ms' }}>
            Transform Telemetry Into
            <span className="block text-gradient-ira">Championship Wins</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 animate-in" style={{ animationDelay: '200ms' }}>
            AI-powered karting analytics for drivers who want to improve. 
            Import your MyChron data, visualize your racing line, and get 
            personalized coaching insights.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in" style={{ animationDelay: '300ms' }}>
            <Link href="/login" className="btn-racing text-lg px-8 py-4">
              Start Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <button className="btn-ghost text-lg px-8 py-4 group">
              <Play className="w-5 h-5 mr-2 group-hover:text-ira-red transition-colors" />
              Watch Demo
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16 animate-in" style={{ animationDelay: '400ms' }}>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">349M+</div>
              <div className="text-sm text-white/50">Telemetry Points</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">1,000+</div>
              <div className="text-sm text-white/50">Racing Families</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">6</div>
              <div className="text-sm text-white/50">Languages</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Improve
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Professional-grade analysis tools designed for karting families
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {/* Feature Cards */}
            <FeatureCard
              icon={<Map className="w-6 h-6" />}
              title="Track Visualization"
              description="GPS track map with speed heatmap overlay. See exactly where you're fast and where you're losing time."
              color="red"
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Telemetry Charts"
              description="Speed, RPM, G-forces, temperatures - all synced and zoomable. Compare lap-to-lap with delta analysis."
              color="gold"
            />
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="AI Coaching"
              description="Get personalized insights powered by Claude AI. Braking zones, racing lines, apex points - in your language."
              color="red"
            />
            <FeatureCard
              icon={<Play className="w-6 h-6" />}
              title="Track Playback"
              description="Watch your kart move around the track. 3 camera modes: Top-down, Follow, and Cinematic Drone."
              color="gold"
            />
            <FeatureCard
              icon={<Trophy className="w-6 h-6" />}
              title="Gamification"
              description="XP system, 30+ achievements, daily streaks. Track your progress and stay motivated."
              color="red"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Family Sharing"
              description="Parents and coaches can follow drivers and receive session notifications. Everyone stays connected."
              color="gold"
            />
          </div>
        </div>
      </section>

      {/* Web Platform Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-ira-carbon-800 to-ira-carbon-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ira-gold/10 border border-ira-gold/20 mb-6">
                <Zap className="w-4 h-4 text-ira-gold" />
                <span className="text-sm text-ira-gold font-medium">Coming Soon</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Big Screen Analysis
              </h2>
              <p className="text-lg text-white/60 mb-8">
                Some analysis is better on a big screen. Our web platform brings 
                full telemetry analysis, video sync with SmartyCam, and multi-lap 
                comparison to your desktop.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-white/80">
                  <div className="w-6 h-6 rounded-full bg-ira-red/20 flex items-center justify-center">
                    <span className="text-ira-red">✓</span>
                  </div>
                  Video sync with telemetry overlay
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <div className="w-6 h-6 rounded-full bg-ira-red/20 flex items-center justify-center">
                    <span className="text-ira-red">✓</span>
                  </div>
                  Compare 10+ laps simultaneously
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <div className="w-6 h-6 rounded-full bg-ira-red/20 flex items-center justify-center">
                    <span className="text-ira-red">✓</span>
                  </div>
                  Coaching sessions with Xavier
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <div className="w-6 h-6 rounded-full bg-ira-red/20 flex items-center justify-center">
                    <span className="text-ira-red">✓</span>
                  </div>
                  PDF reports & video export
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-xl bg-ira-carbon-700 border border-ira-carbon-600 overflow-hidden">
                {/* Placeholder for screenshot/video */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Gauge className="w-16 h-16 text-ira-carbon-500 mx-auto mb-4" />
                    <p className="text-white/40">Web Platform Preview</p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-ira-red/20 rounded-full blur-2xl" />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-ira-gold/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Improve Your Lap Times?
          </h2>
          <p className="text-lg text-white/60 mb-10">
            Join 1,000+ racing families already using IRA. 
            Import your first session in under a minute.
          </p>
          <Link href="/login" className="btn-racing text-lg px-10 py-5">
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <p className="text-sm text-white/40 mt-4">
            No credit card required • Works with MyChron, RaceChrono, AiM
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ira-carbon-700 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-ira-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IRA</span>
              </div>
              <span className="text-white/60">
                © 2026 Ipro Racing S.L. Barcelona.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/40">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="mailto:support@ipro.cat" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-white/30 text-sm italic">
              "SIMPLY LOVELY." 🏎️
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  color: 'red' | 'gold'
}) {
  const colorClasses = {
    red: 'bg-ira-red/10 text-ira-red border-ira-red/20',
    gold: 'bg-ira-gold/10 text-ira-gold border-ira-gold/20',
  }
  
  return (
    <div className="card card-hover group">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/60">{description}</p>
    </div>
  )
}
