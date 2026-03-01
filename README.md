# 🏓 PlayNow — Campus Pickup Sports Finder

Find and join pickup games on campus. Built at [Hackathon Name] 2026.

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (free tier)
- **Auth:** Firebase Authentication (.edu email)

## Quick Start

### Prerequisites
- Node.js 18+ installed ([download](https://nodejs.org))
- Git installed
- MongoDB Atlas account ([free signup](https://www.mongodb.com/atlas))

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/playnow.git
cd playnow

# Install backend
cd server
npm install

# Install frontend
cd ../client
npm install
```

### 2. Set Up Environment Variables
```bash
# In /server, create .env file:
cp .env.example .env
# Then fill in your MongoDB URI and Firebase keys
```

### 3. Run It
```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

App opens at `http://localhost:5173`

## Project Structure
```
playnow/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Full page views
│   │   ├── styles/          # CSS files
│   │   └── utils/           # Helper functions, API calls
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                  # Express backend
│   ├── routes/              # API route handlers
│   ├── models/              # MongoDB schemas
│   ├── middleware/           # Auth middleware
│   ├── config/              # DB connection
│   ├── server.js            # Entry point
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/games | Get all games |
| POST | /api/games | Create a game |
| POST | /api/games/:id/join | Join a game |
| POST | /api/games/:id/leave | Leave a game |
| GET | /api/games/:id | Get game details |
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |

## Team
- Rameez — Frontend
- [Person 2] — Backend API
- [Person 3] — Auth & Profiles
- [Person 4] — Create/Join Flow
