// app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-ira-carbon-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-lg">
          <p className="text-white/70">Last updated: January 2026</p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-white/80">IRA collects telemetry data from your racing sessions including GPS coordinates, speed, RPM, temperatures, and lap times. We also collect account information (email, name) for authentication.</p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. How We Use Your Data</h2>
          <p className="text-white/80">Your telemetry data is used to provide AI coaching insights, track visualization, and performance analysis. We do not sell your personal data to third parties.</p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Data Storage</h2>
          <p className="text-white/80">Your data is securely stored on Supabase servers with encryption at rest. You can request deletion of your data at any time.</p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Third Party Services</h2>
          <p className="text-white/80">We use: Supabase (database), AWS Lambda (AI processing), MapTiler (maps). Each has their own privacy policy.</p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Contact</h2>
          <p className="text-white/80">Questions? Email: privacy@ipro.cat</p>
        </div>
      </div>
    </div>
  )
}
