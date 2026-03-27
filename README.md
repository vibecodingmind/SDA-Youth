# BUSYBEES - SDA Youth Ministry Platform

<div align="center">
  <img src="public/logo.svg" alt="BUSYBEES Logo" width="120" height="120">
  
  <h3 align="center">BUSYBEES - SDA Youth Ministry Platform</h3>
  
  <p align="center">
    A comprehensive youth ministry management platform with gamification, real-time communication, and engagement tracking.
    <br />
    <a href="#features"><strong>Explore Features »</strong></a>
  </p>
</div>

---

## 🚀 Features

### 💬 Communication & Social
- Real-time Group Chat with WebSocket
- Prayer Request Wall
- Discussion Forums
- Direct Messaging
- Announcements Board

### 📅 Event Management
- Event Creation & RSVP
- QR Code Check-in
- Event Photo Galleries
- Feedback & Surveys
- Calendar Integration

### 📖 Content & Resources
- Daily Devotionals
- Bible Study Materials
- Video Library
- Document Repository
- Blog/Articles
- Daily Bible Verse

### 🎮 Gamification
- Points & Leaderboard
- Achievement Badges
- Daily Challenges
- Streak Tracking
- Rewards Store
- Quest System

### 👥 Member Engagement
- Small Groups
- Mentorship Program
- Prayer Partners
- Testimony Sharing

### 👨‍💼 Admin Dashboard
- User Management
- Content Moderation
- Analytics Dashboard
- Bulk Email
- Data Export

### 🔐 Security
- NextAuth.js Authentication
- Google OAuth
- Role-based Access Control
- Audit Logging
- 2FA Support

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Database:** Prisma ORM + SQLite/PostgreSQL
- **Authentication:** NextAuth.js v4
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Real-time:** Socket.io
- **Email:** Resend
- **Charts:** Recharts

---

## 📦 Installation

### Prerequisites
- Node.js 20+ or Bun
- PostgreSQL (production) or SQLite (development)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/busybees.git
cd busybees

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
bun run db:generate

# Push database schema
bun run db:push

# Seed database with sample data
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d '{"confirm":"SEED_DATA_CONFIRM"}'

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deployment to Railway

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/busybees.git
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **New Project**
4. Select **Deploy from GitHub repo**
5. Choose your `busybees` repository
6. Click **Deploy**

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **+ New**
2. Select **Database** → **PostgreSQL**
3. Railway will auto-link the database

### Step 4: Set Environment Variables

In Railway dashboard, go to your service → **Variables**:

```env
DATABASE_URL=${{PostgreSQL.DATABASE_URL}}
NEXTAUTH_SECRET=your-secret-key-at-least-32-characters
NEXTAUTH_URL=https://your-app.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
RESEND_API_KEY=re_your_resend_key
EMAIL_FROM=BUSYBEES <noreply@yourdomain.com>
```

### Step 5: Deploy & Seed

1. Railway will auto-deploy on push
2. After deployment, seed the database:
```bash
curl -X POST https://your-app.railway.app/api/seed \
  -H "Content-Type: application/json" \
  -d '{"confirm":"SEED_DATA_CONFIRM"}'
```

---

## 🔑 Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@busybees.church | admin123 |
| Leader | sarah@busybees.church | member123 |
| Member | mike@busybees.church | member123 |

---

## 📁 Project Structure

```
├── prisma/               # Database schema
├── public/               # Static files
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes (50+)
│   │   ├── auth/         # Auth pages
│   │   └── dashboard/    # Dashboard pages
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   └── lib/              # Utilities
├── mini-services/        # WebSocket service
├── e2e/                  # Playwright tests
└── __tests__/            # Jest unit tests
```

---

## 🧪 Testing

```bash
# Unit tests
bun run test

# E2E tests
bun run test:e2e

# Test coverage
bun run test:coverage
```

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth.js

### Users
- `GET /api/users` - List users
- `GET /api/admin/users` - Admin user management

### Events
- `GET /api/events` - List events
- `POST /api/events/[id]/checkin` - Event check-in
- `POST /api/events/[id]/feedback` - Submit feedback

### Gamification
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/badges` - List badges
- `POST /api/challenges/complete` - Complete challenge
- `POST /api/rewards/[id]/redeem` - Redeem reward

### Communication
- `GET /api/chat/rooms` - Chat rooms
- `GET /api/prayer-requests` - Prayer wall
- `GET /api/forum/topics` - Forum topics

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<div align="center">
  Made with ❤️ for SDA Youth Ministries
</div>
