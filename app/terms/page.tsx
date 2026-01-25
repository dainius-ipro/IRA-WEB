// app/terms/page.tsx
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-ira-carbon-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-lg">
          <p className="text-white/70">Last updated: January 2026</p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance</h2>
          <p className="text-white/80">By using IRA (Intelligent Racing Analytics), you agree to these terms. IRA is provided by Ipro Racing S.L., Barcelona, Spain.</p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Service Description</h2>
          <p className="text-white/80">IRA provides telemetry analysis, AI coaching, and performance tracking for karting. Features may change without notice.</p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. User Responsibilities</h2>
          <p className="text-white/80">You are responsible for your account security and the accuracy of uploaded data. Do not upload data you dont have rights to.</p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. AI Coaching Disclaimer</h2>
          <p className="text-white/80">AI coaching is for informational purposes only. Always prioritize safety and follow your real coachs instructions on track.</p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Subscription & Payments</h2>
          <p className="text-white/80">Premium features require subscription. Prices shown at checkout. Cancel anytime.</p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Contact</h2>
          <p className="text-white/80">Email: legal@ipro.cat</p>
        </div>
      </div>
    </div>
  )
}
