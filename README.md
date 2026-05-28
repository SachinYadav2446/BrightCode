# 🌐 BrightCode: The Ultimate Collaborative Coding Frontier

BrightCode is a high-performance, real-time collaborative coding platform designed for the modern developer. It blends professional-grade IDE features with gamified learning experiences and competitive social layers, all wrapped in a premium cyberpunk-inspired operating command deck.

---

## 🚀 Key Features & Modules

### 1. 🏗️ Real-Time Collaborative Workspace
The core terminal of BrightCode where developers collaborate.
- **Tech Stack**: `Socket.io`, `Monaco Editor`, `UUID`.
- **How it Works**: Utilizing a WebSocket event pipeline, keystrokes sync across participants instantly. Admins hold permissions for editor lockouts, user bans, and workspace settings.

### 2. 🧪 Logic Lab (100-Level Campaign)
A progressive linear campaign designed to build algorithm mastery.
- **Tech Stack**: `React`, `Framer Motion`, `Local Storage / PostgreSQL DB`.
- **How it Works**: Levels are arranged in successive operational phases. Users solve syntax and algorithm quests to gain XP and proceed.

### 3. 🕹️ Code Arena (Arcade)
Gamified, time-sensitive coding challenge arrays.
- **Tech Stack**: `React`, `Vanilla CSS Keyframes`, `Custom Compiler Sandbox`.
- **How it Works**: Developers select challenge suites (e.g., CSS Wizardry, Logic Engine) and solve problems under test execution timeouts.

### 4. 🤖 The Sentinel (AI Companion)
An integrated AI assistant providing workspace code analyses.
- **Tech Stack**: `Google Gemini / OpenAI API`, `React Context`.
- **How it Works**: Sentinel reads the active buffer from Monaco and returns contextual syntax repairs, complexity diagnostics, and optimizations.

### 5. 🌀 Warp Drive (Temporal Versioning)
A built-in time-travel debugging snapshot deck.
- **Tech Stack**: `Custom React state snapshotting`, `JSON Diffing`.
- **How it Works**: Milestone revisions are cached as local snapshots, enabling developers to roll back to compilation checkpoints instantly.

### 6. 📊 Contribution Heatmap
Consistent contribution tracking grid showing historical productivity.
- **Tech Stack**: `SVG`, `React`, `Backend XP logs`.
- **How it Works**: Graphs daily activity grids mapped by XP accumulation level ranges.

### 7. 🏆 Factions & Hall of Fame Leaderboard
Social guilds and high-performance competitive rankings.
- **Tech Stack**: `Express`, `PostgreSQL`, `JSONB Faction Schemas`.
- **How it Works**: Users form factions, coordinate group PvPs, and top performers populate a premium Hall of Fame podium fetched from real-time database leaderboards.

### 8. 📝 CodeVault Notes System
A TipTap-based rich text workspace note-taking system.
- **Tech Stack**: `@tiptap/react`, `@excalidraw/excalidraw`, `PostgreSQL`.
- **How it Works**: Organize notes in folders, draw sketches on an Excalidraw canvas, and compile structural code sheets.

---

## 🎨 Creative UI/UX Redesign System

BrightCode employs an advanced **Cyber-Premium HUD User Interface**:
- **Split-Panel Workspace Deck**: A sidebar identity console houses dynamic operative stats (Real XP, online friends count, note logs, level progression ring). A tabbed terminal deck switches panels seamlessly using sliding Framer Motion animations.
- **Levitating Card Decks**: Skill proficiency cards and action badges levitate using organic CSS coordinates, automatically pausing their float loops on mouse focus to accommodate perspective 3D mouse tilts.
- **Glow Highlight Spotlights**: Interactive mouse-coordinate variables (`--mouse-x-local` and `--mouse-y-local`) dynamically illuminate container borders and background radial gradients matching individual skill colors.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Monaco Editor**: [@monaco-editor/react](https://www.npmjs.com/package/@monaco-editor/react)
- **Rich Text Editor**: [@tiptap/react](https://tiptap.dev/)
- **Canvas Draw**: [@excalidraw/excalidraw](https://excalidraw.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Web Server**: [Express](https://expressjs.com/)
- **Sockets**: [Socket.io](https://socket.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Auth**: [JWT](https://jwt.io/) + [BcryptJS](https://www.npmjs.com/package/bcryptjs)

---

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SachinYadav2446/Code-Sight.git
   cd Code-Sight
   ```

2. **Setup Server**
   ```bash
   cd server
   npm install
   # Create server/.env with DATABASE_URL, JWT_SECRET, and Gmail credentials
   npm start
   ```

3. **Setup Client**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

---

## 🔧 Git Operations Notice
- **GitHub Commit Sync**: When you commit changes locally via git (`git commit`), they are stored in your local repository logs. If you notice that commits are not appearing on your GitHub profile, run the following command to synchronize your local workspace commits to the remote master repository:
  ```bash
  git push origin main
  ```
