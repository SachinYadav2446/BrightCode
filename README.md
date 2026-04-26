# 🌐 CodeBright: The Ultimate Collaborative Coding Frontier

CodeBright is a high-performance, real-time collaborative coding platform designed for the modern developer. It blends professional-grade IDE features with gamified learning experiences and competitive social layers, all wrapped in a premium cyberpunk-inspired interface.

---

## 🚀 Mega Features

### 1. 🏗️ Real-Time Collaborative Workspace
The heart of CodeBright. Developers can create private or public rooms to code together in real-time.
- **Tech Stack**: `Socket.io`, `Monaco Editor`, `UUID`.
- **How it Works**: Utilizing a robust WebSocket architecture, every keystroke is synchronized across all participants instantly. Admins have granular control, including the ability to mute/kick users, transfer ownership, and manage file permissions.

### 2. 🧪 Logic Lab (100-Level Campaign)
A progressive learning journey designed to master complex programming concepts.
- **Tech Stack**: `React`, `Framer Motion`, `Local Storage/DB State`.
- **How it Works**: Levels are grouped into phases. Users must complete challenges to earn XP and unlock the next phase. The UI enforces strict boundary navigation, ensuring a structured learning path.

### 3. 🕹️ Code Arena (Arcade)
Gamified, time-attack coding challenges.
- **Tech Stack**: `React`, `Vanilla CSS Animations`, `Custom Logic Engine`.
- **How it Works**: Users select modules (e.g., CSS Odyssey, Logic Suite) and solve problems under specific constraints. Real-time evaluation provides instant feedback and awards XP upon successful completion.

### 4. 🤖 The Sentinel (AI Assistant)
An integrated AI companion that understands your current workspace context.
- **Tech Stack**: `OpenAI/Gemini API Integration`, `React Context`.
- **How it Works**: The Sentinel analyzes your active file and provides code suggestions, debugging help, and architectural advice without you ever leaving the editor.

### 5. 🌀 Warp Drive (Temporal Versioning)
A built-in time-travel debugging and versioning system.
- **Tech Stack**: `Custom Snapshoting Logic`, `JSON-based State diffing`.
- **How it Works**: Every significant milestone is captured as a "Temporal Snapshot." Users can navigate through their code's history visually and restore previous states with a single click.

### 6. 📊 Dynamic Activity Heatmap
Visual tracking of your coding consistency.
- **Tech Stack**: `SVG`, `React`, `Backend XP Tracking`.
- **How it Works**: Similar to GitHub's contribution graph, it tracks XP gains across different modules (Logic Lab, Arcade, Workshop) and visualizes daily engagement levels directly on the dashboard.

### 7. 🏆 Factions & Leaderboards
The social and competitive layer of the platform.
- **Tech Stack**: `PostgreSQL`, `Express`, `JWT`.
- **How it Works**: Users join factions and compete for the top spot on global and faction-specific leaderboards. XP earned from coding activities translates directly into rank progression.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Editor**: [@monaco-editor/react](https://www.npmjs.com/package/@monaco-editor/react)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks + Context API
- **Form Handling**: React Hook Form + Zod

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: [JWT](https://jwt.io/) + [BcryptJS](https://www.npmjs.com/package/bcryptjs)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL

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
   # Configure your .env with DATABASE_URL and JWT_SECRET
   npm start
   ```

3. **Setup Client**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

---

## 🎨 Design Philosophy
CodeBright utilizes a **Cyber-Premium Design System**. 
- **Glassmorphism**: Layered transparency for depth.
- **Glow-Based Feedback**: Subtle neon accents and micro-animations indicate system states.
- **Performance First**: Optimized rendering for zero-latency real-time collaboration.

---

Built with ❤️ by the CodeBright Team.
