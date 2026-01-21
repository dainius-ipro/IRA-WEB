# 🏎️ IRA Web Platform

**Intelligent Racing Analytics** - Web Application

Full-featured web platform for post-race telemetry analysis, video sync, and AI coaching.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local
# Edit .env.local with your Supabase keys

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 + React 18 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Charts** | Recharts + D3.js |
| **Maps** | MapLibre GL JS |
| **Auth** | Supabase Auth |
| **Database** | Supabase PostgreSQL |
| **AI** | Lambda (Claude) |

## 📁 Project Structure

```
ira-web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, callback)
│   ├── app/               # Protected dashboard
│   │   ├── sessions/      # Session management
│   │   ├── analysis/      # Telemetry analysis
│   │   ├── coaching/      # AI coaching
│   │   └── settings/      # User settings
│   └── leaderboard/       # Public leaderboards
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── track-map/        # MapLibre components
│   └── charts/           # Recharts components
├── lib/                   # Utilities
│   ├── supabase/         # Supabase clients
│   └── utils.ts          # Helper functions
├── stores/               # Zustand stores
├── hooks/                # Custom React hooks
└── types/                # TypeScript types
```

## 🔑 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# AI
NEXT_PUBLIC_AI_ENDPOINT=https://your-lambda-url/

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 Features

### Phase 1 (Current)
- [x] Project setup + auth
- [x] CSV import + session list
- [ ] Track map visualization
- [ ] Telemetry charts

### Phase 2
- [ ] Video sync with SmartyCam
- [ ] Telemetry overlay

### Phase 3
- [ ] Community leaderboards
- [ ] Public session sharing

### Phase 4
- [ ] Admin panel
- [ ] Track management

## 🔗 Related

- **iOS App:** App Store (Build 256)
- **Android App:** Play Store (v98)
- **Backend:** Supabase (24 tables)
- **Jira:** IRA-139 (Epic 16)

## 📝 License

Copyright © 2026 Ipro Racing S.L. All rights reserved.

---

**"SIMPLY LOVELY."** 🏎️
