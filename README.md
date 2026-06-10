# 🌐 BrightCode

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933.svg?logo=nodedotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1.svg?logo=postgresql)

> **The Ultimate Collaborative Coding Frontier.**  
> BrightCode is a high-performance, real-time collaborative coding platform designed for the modern developer. It blends professional-grade IDE features with gamified learning experiences and competitive social layers, all wrapped in a premium cyberpunk-inspired operating command deck.

---

## ✨ Features & Modules

### 🏗️ Real-Time Collaborative Workspace
The core terminal of BrightCode where developers collaborate.
- **Tech Stack**: `Socket.io`, `Monaco Editor`, `UUID`.
- **Details**: Utilizing a WebSocket event pipeline, keystrokes sync across participants instantly. Admins hold permissions for editor lockouts, user bans, and workspace settings.

### 🧪 Logic Lab (100-Level Campaign)
A progressive linear campaign designed to build algorithm mastery.
- **Tech Stack**: `React`, `Framer Motion`, `PostgreSQL`.
- **Details**: Levels are arranged in successive operational phases. Users solve syntax and algorithm quests to gain XP and proceed.

### 🕹️ Code Arena (Arcade)
Gamified, time-sensitive coding challenge arrays.
- **Tech Stack**: `React`, `Custom Compiler Sandbox`.
- **Details**: Developers select challenge suites (e.g., CSS Wizardry, Logic Engine) and solve problems under test execution timeouts.

### 🤖 The Sentinel (AI Companion)
An integrated AI assistant providing workspace code analyses.
- **Tech Stack**: `Google Gemini / OpenAI API`, `React Context`.
- **Details**: Sentinel reads the active buffer from Monaco and returns contextual syntax repairs, complexity diagnostics, and optimizations.

### 🌀 Warp Drive (Temporal Versioning)
A built-in time-travel debugging snapshot deck.
- **Details**: Milestone revisions are cached as local snapshots, enabling developers to roll back to compilation checkpoints instantly.

### 🏆 Factions & Hall of Fame
Social guilds and high-performance competitive rankings.
- **Details**: Users form factions, coordinate group PvPs, and top performers populate a premium Hall of Fame podium fetched from real-time database leaderboards.

---

## 🎨 Creative UI/UX Redesign System

BrightCode employs an advanced **Cyber-Premium HUD User Interface**:
- **Split-Panel Workspace Deck**: A sidebar identity console houses dynamic operative stats. A tabbed terminal deck switches panels seamlessly using sliding Framer Motion animations.
- **Levitating Card Decks**: Skill proficiency cards and action badges levitate using organic CSS coordinates.
- **Glow Highlight Spotlights**: Interactive mouse-coordinate variables dynamically illuminate container borders and background radial gradients.

---

## 🛠️ Technology Stack

| Frontend | Backend | Infrastructure |
|----------|---------|----------------|
| React 19 | Node.js | PostgreSQL |
| Vite 8 | Express | Socket.io |
| Monaco Editor | JWT Auth | WebSockets |
| Framer Motion | BcryptJS | REST APIs |
| Tailwind / Vanilla CSS | | |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SachinYadav2446/BrightCode.git
   cd BrightCode
   ```

2. **Setup Environment Variables**
   Create a `.env` file in the `server` directory:
   ```env
   DATABASE_URL=your_postgresql_url
   JWT_SECRET=your_jwt_secret
   ```

3. **Install Dependencies & Start Backend**
   ```bash
   cd server
   npm install
   npm start
   ```

4. **Install Dependencies & Start Frontend**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

---

## 🤝 Contributing
Contributions are always welcome! Please open an issue first to discuss what you would like to change.

## 📄 License
This project is licensed under the MIT License.
