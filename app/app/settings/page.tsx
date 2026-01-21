// app/app/settings/page.tsx
// IRA Web - Settings Page

'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Globe, 
  Bell, 
  Palette, 
  Shield, 
  LogOut,
  Save,
  Loader2,
  Check,
  ChevronRight,
  Trash2
} from 'lucide-react'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'ca', name: 'Català', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
]

const COACHING_TONES = [
  { value: 'balanced', label: 'Balanced', description: 'Mix of encouragement and technical feedback' },
  { value: 'technical', label: 'Technical', description: 'Focus on data and detailed analysis' },
  { value: 'motivational', label: 'Motivational', description: 'Encouraging and positive feedback' },
]

export default function SettingsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [profile, setProfile] = useState({
    display_name: '',
    email: '',
    country: '',
    racing_category: '',
    chassis_brand: '',
    engine: '',
    coaching_tone: 'balanced',
    preferences: {
      language: 'en',
      units: 'metric',
      notifications: true,
      theme: 'dark'
    }
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile({
        display_name: data.display_name || '',
        email: data.email || user.email || '',
        country: data.country || '',
        racing_category: data.racing_category || '',
        chassis_brand: data.chassis_brand || '',
        engine: data.engine || '',
        coaching_tone: data.coaching_tone || 'balanced',
        preferences: data.preferences || {
          language: 'en',
          units: 'metric',
          notifications: true,
          theme: 'dark'
        }
      })
    }
    setIsLoading(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name,
        country: profile.country,
        racing_category: profile.racing_category,
        chassis_brand: profile.chassis_brand,
        engine: profile.engine,
        coaching_tone: profile.coaching_tone,
        preferences: profile.preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    setIsSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-ira-red animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/60">Manage your account and preferences</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="btn-racing flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : saved ? (
            <Check className="w-5 h-5" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-ira-red/10 flex items-center justify-center">
              <User className="w-5 h-5 text-ira-red" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Profile</h2>
              <p className="text-sm text-white/50">Your personal information</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                className="input"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="input opacity-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Country
              </label>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                className="input"
                placeholder="e.g. Spain"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Racing Category
              </label>
              <input
                type="text"
                value={profile.racing_category}
                onChange={(e) => setProfile({ ...profile, racing_category: e.target.value })}
                className="input"
                placeholder="e.g. IAME X30 Junior"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Chassis
              </label>
              <input
                type="text"
                value={profile.chassis_brand}
                onChange={(e) => setProfile({ ...profile, chassis_brand: e.target.value })}
                className="input"
                placeholder="e.g. FA Kart"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Engine
              </label>
              <input
                type="text"
                value={profile.engine}
                onChange={(e) => setProfile({ ...profile, engine: e.target.value })}
                className="input"
                placeholder="e.g. IAME X30"
              />
            </div>
          </div>
        </section>

        {/* Language Section */}
        <section className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-ira-gold/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-ira-gold" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Language</h2>
              <p className="text-sm text-white/50">Choose your preferred language</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setProfile({
                  ...profile,
                  preferences: { ...profile.preferences, language: lang.code }
                })}
                className={`
                  flex items-center gap-3 p-4 rounded-lg border transition-all
                  ${profile.preferences.language === lang.code
                    ? 'border-ira-red bg-ira-red/10'
                    : 'border-ira-carbon-600 hover:border-ira-carbon-500'
                  }
                `}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium text-white">{lang.name}</span>
                {profile.preferences.language === lang.code && (
                  <Check className="w-5 h-5 text-ira-red ml-auto" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* AI Coaching Section */}
        <section className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-ira-red/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-ira-red" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Coaching Tone</h2>
              <p className="text-sm text-white/50">How should the AI coach communicate?</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {COACHING_TONES.map((tone) => (
              <button
                key={tone.value}
                onClick={() => setProfile({ ...profile, coaching_tone: tone.value })}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left
                  ${profile.coaching_tone === tone.value
                    ? 'border-ira-red bg-ira-red/10'
                    : 'border-ira-carbon-600 hover:border-ira-carbon-500'
                  }
                `}
              >
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${profile.coaching_tone === tone.value
                    ? 'border-ira-red bg-ira-red'
                    : 'border-ira-carbon-500'
                  }
                `}>
                  {profile.coaching_tone === tone.value && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-white">{tone.label}</div>
                  <div className="text-sm text-white/50">{tone.description}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Notifications Section */}
        <section className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-ira-gold/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-ira-gold" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Notifications</h2>
              <p className="text-sm text-white/50">Manage your notification preferences</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-ira-carbon-700/50">
            <div>
              <div className="font-medium text-white">Email Notifications</div>
              <div className="text-sm text-white/50">Receive updates about your sessions</div>
            </div>
            <button
              onClick={() => setProfile({
                ...profile,
                preferences: { 
                  ...profile.preferences, 
                  notifications: !profile.preferences.notifications 
                }
              })}
              className={`
                w-12 h-7 rounded-full transition-colors relative
                ${profile.preferences.notifications ? 'bg-ira-red' : 'bg-ira-carbon-600'}
              `}
            >
              <div className={`
                absolute top-1 w-5 h-5 rounded-full bg-white transition-transform
                ${profile.preferences.notifications ? 'left-6' : 'left-1'}
              `} />
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="card border-ira-danger/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-ira-danger/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-ira-danger" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Account</h2>
              <p className="text-sm text-white/50">Manage your account</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-ira-carbon-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-white/60" />
                <span className="text-white">Sign Out</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-ira-danger/10 transition-colors group">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-ira-danger" />
                <span className="text-ira-danger">Delete Account</span>
              </div>
              <ChevronRight className="w-5 h-5 text-ira-danger/30 group-hover:text-ira-danger/60" />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
