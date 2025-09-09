# CardVerse - Transform Anything into Epic Cards 🃏

A strategic PVP card game where players transform photos into unique, powerful cards using AI. Features tactical 6-card battlefield gameplay, comprehensive effect system, and user authentication.

## ✨ Features

- 🤖 **AI Card Generation**: Upload photos to create unique cards with AI-generated stats and abilities
- 🎯 **Strategic Gameplay**: 6-card battlefield with front/back positioning
- 📚 **Card Management**: Create, collect, and manage cards with JSON export/import
- ⚔️ **PVP Battles**: Turn-based strategic combat system
- ✨ **Dynamic Effects**: Buffs, debuffs, triggers, and persistent effects
- 🏆 **7 Rarity Levels**: Common to Unique with distinct power scaling
- 🔮 **7 Magical Elements**: Aurora, Void, Crystal, Blood, Storm, Flora, Aether
- 🔐 **User Authentication**: Registration, login, profile management
- 📧 **Email Integration**: Password reset and account verification

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript, Next.js 15
- **UI**: Tailwind CSS, Framer Motion
- **Database**: Neon PostgreSQL
- **Auth**: JWT + bcrypt
- **Email**: Gmail SMTP
- **AI**: Google Gemini API
- **Deployment**: Netlify

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Gmail account
- Google Gemini API key

### Installation

1. **Clone & Install:**

```bash
git clone https://github.com/Eggplant203/CardVerse.git
cd CardVerse
npm install
```

2. **Environment Setup:**

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_neon_database_url
DIRECT_URL=your_neon_direct_url
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

3. **Database Setup:**

   - Create Neon database at [neon.tech](https://neon.tech)
   - Get connection strings and update `.env.local`
   - Run migrations: `POST http://localhost:3000/api/migrate`

4. **Start Development:**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🎮 Game Mechanics

### Card Creation

1. Upload any photo
2. AI analyzes image and generates stats/abilities
3. Customize card name and review description
4. Save to collection or export as JSON

### Gameplay

1. Build deck from card collection
2. Position cards on 6-slot battlefield (3 front, 3 back)
3. Manage mana and use card abilities
4. Reduce opponent's health to zero to win

### Card Stats

- ❤️ **HP**: Health points (1-12)
- 🗡️ **Attack**: Damage output (0-12)
- 🔮 **Mana Cost**: Summon cost (0-10)

## 📁 Project Structure

```
src/
├── components/     # React components
├── context/        # React Context providers
├── data/          # Game data & configurations
├── hooks/         # Custom React hooks
├── lib/           # Core libraries & utilities
├── pages/         # Next.js pages & API routes
├── services/      # Business logic services
├── types/         # TypeScript definitions
└── utils/         # Helper functions
```

## 🚀 Deployment

### Netlify Setup

1. Connect GitHub repository to Netlify
2. Set build settings:

   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18`

3. Add environment variables in Netlify dashboard (same as `.env.local`)

4. Deploy and run migrations on production

## 🔧 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📋 Requirements

- **Node.js**: 18+
- **Database**: PostgreSQL (Neon recommended)
- **Email**: Gmail with App Password
- **AI**: Google Gemini API key

## 📄 License

MIT License - see LICENSE file for details.

## 👨‍💻 Author

© 2023-2025 - Developed by Eggplant203 🍆

---

**🎮 Ready to create epic cards? Upload any photo and let AI transform it into a powerful card!**
