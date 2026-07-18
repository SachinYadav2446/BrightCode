<div align="center">

# ⚡ BrightCode

**A next-generation collaborative coding platform for developers who want to learn, compete, and grow together.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-bright--code--ruby.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://bright-code-ruby.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql)](https://postgresql.org)

</div>

---

## 🚀 Overview

BrightCode is a full-stack real-time collaborative coding platform that combines a professional-grade IDE, gamified learning, competitive coding, mentorship, and social features — all in one unified interface.

Whether you're a beginner solving your first algorithm or an experienced developer looking to mentor others, BrightCode has a space for you.

---

## ✨ Features

### 🖥️ Collaborative Workspace
- Real-time multi-user code synchronization via **WebSockets**
- **Monaco Editor** with full syntax highlighting for 10+ languages
- Shared terminal and live execution environment
- Git integration with commit, push, and branch management
- Teammate presence indicators and live cursor tracking

### 🧠 Logic Lab
- Curated problem sets organized by difficulty and topic
- Covers algorithms, data structures, React, MERN, and more
- Instant test case validation with detailed feedback
- XP rewards and streak tracking for consistency

### ⚔️ Code Arena (Code Wars)
- Timed head-to-head and group coding contests
- Multiple difficulty levels with live leaderboards
- Contest history and performance analytics
- Forfeit / end-contest controls

### 📓 CodeVault
- Rich-text note editor with **Markdown** and **code block** support
- Diagram creation powered by Excalidraw
- Folder-based organization system with tags and search
- Auto-save and cloud sync

### 🆘 The Nexus (SOS Mentorship Board)
- Post tickets when you're stuck on a problem
- Mentors can browse open tickets and offer help
- Private chat between mentee and assigned mentor
- Collaborative workspace opens when mentor is accepted
- Issue reassignment if the mentor can't resolve it

### 👥 Social Layer
- Friend requests and real-time online status
- Private direct messaging
- Factions / team system with join requests
- Global leaderboard with XP rankings

### 🤖 Pal — AI Assistant
- Built-in AI chatbot with BrightCode-specific knowledge
- No API key required — runs fully on-device embeddings
- Assists with debugging, explanations, and platform navigation

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Monaco Editor, Socket.IO Client |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Database** | PostgreSQL (Neon), with in-memory JSON fallback |
| **Auth** | JWT + Google OAuth + GitHub OAuth |
| **Realtime** | WebSockets via Socket.IO |
| **Deployment** | Vercel (frontend) + Render (backend) |
| **Payments** | Razorpay (subscription tiers) |

---

## 📁 Project Structure

```
BrightCode/
├── client/               # React frontend (Vite)
│   ├── src/
│   │   ├── pages/        # Route-level components
│   │   ├── components/   # Shared UI components
│   │   └── config.js     # API URL config
│   └── package.json
├── server/               # Node.js backend
│   ├── index.js          # Main server entry point
│   ├── logger.js         # Winston logging
│   ├── questions/        # Local coding problem bank
│   └── package.json
├── render.yaml           # Render deployment config
├── vercel.json           # Vercel deployment config
└── docker-compose.yml    # Local Docker setup
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or use memory mode for local dev)

### Local Development

```bash
# Clone the repository
git clone https://github.com/SachinYadav2446/BrightCode.git
cd BrightCode

# Install and start the backend
cd server
npm install
npm start

# In a new terminal — install and start the frontend
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5051`.

### Environment Variables

Create a `server/.env` file:

```env
DB_CONNECTION_STRING=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

# Optional — OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_CLIENT_SECRET=

# Optional — Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

> **Note:** If `DB_CONNECTION_STRING` is not set or unreachable, the server automatically falls back to a local JSON-based memory store — no setup required for quick local testing.

---

## 🚢 Deployment

| Service | Platform | Config File |
|---|---|---|
| Frontend | Vercel | `vercel.json` |
| Backend | Render | `render.yaml` |

Simply push to `main` — both platforms auto-deploy on new commits.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss significant changes.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/SachinYadav2446">Sachin Yadav</a>
</div>
