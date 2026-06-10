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

## 🗺️ Consumer Flow (User Journey)

1. **Onboarding & Authentication**
   - User arrives at the BrightCode **Landing Page**, experiencing the premium Cyber-HUD aesthetics.
   - User registers or logs in via the JWT-secured Authentication flow.
   - Initial profile setup, selecting an avatar, and assigning a base rank.

2. **The Hub (Dashboard Navigation)**
   - Upon login, the user enters **The Hub**. Here, they see their personalized Welcome Banner, daily contribution heatmap, and current XP.
   - The user views the **Hall of Fame** podium to check the top performers on the network.

3. **Solo Progression (Logic Lab & Arcade)**
   - To build skills, the user enters the **Logic Lab**, navigating through 100 progressively difficult syntax and algorithm modules.
   - For a faster-paced challenge, the user enters the **Code Arena**, selecting a domain (e.g., CSS, Algorithms) and solving challenges against a timer.

4. **Multiplayer Collaboration (Workspace)**
   - The user creates a new room in the **Collaborative Workspace**.
   - They share the unique `Room ID` with peers or invite friends from the **Allies Drawer**.
   - Peers join the room. All users type in the Monaco Editor concurrently, with WebSockets syncing cursors and code changes instantly.
   - The room admin controls execution, runs the code against the custom compiler sandbox, and uses **Warp Drive** to snapshot stable versions.

5. **Social & Guild Expansion (Factions)**
   - As the user gains XP, they can join or create **Factions**.
   - They collaborate with faction members, share notes in the **CodeVault**, and climb the global leaderboards.

---

## 🏗️ High-Level Design (HLD)

At a macro level, BrightCode operates on a standard 3-tier web architecture, optimized for real-time bidirectional communication.

1. **Presentation Layer (Client)**
   - **React (Vite):** Handles DOM manipulation, routing, and complex state via Context API.
   - **Socket.io Client:** Maintains a persistent WebSocket connection to the Node server for live cursor syncing, code execution, and chat.

2. **Application Layer (Server/Execution Engine)**
   - **Express.js API:** Serves standard REST endpoints for authentication, profile fetching, and faction management.
   - **Socket.io Server:** Acts as the real-time message broker, distributing events (code updates, chat) to specific `Room IDs`.
   - **Compiler Sandbox:** A secure remote execution environment (or isolated Docker process) that securely compiles incoming code strings and returns stdout/stderr.

3. **Data Access Layer (Database)**
   - **PostgreSQL:** Primary relational store. Stores persistent state such as User profiles, Faction schemas, XP ledgers, and saved CodeVault notes.

---

## ⚙️ Low-Level Design (LLD)

### WebSocket Room Architecture
To enable scalable collaboration, Socket.io manages isolated channels called **Rooms**.
1. Client generates a UUID to instantiate a room: `ws.emit('join-room', roomId, userId)`.
2. Server registers the Socket FD to the specific `roomId` array.
3. Upon typing, Monaco Editor's `onChange` event triggers a `code-update` payload carrying the delta.
4. Server broadcasts the payload to all sockets in the room *except* the sender: `socket.to(roomId).emit('code-update', payload)`.

### Compiler Execution Pipeline
Code execution is decoupled from the main thread to prevent blocking.
1. Code payload + selected language is shipped via `POST /api/execute`.
2. Backend strips malicious `exec()` or `eval()` inputs via regex heuristics.
3. Payload is handed to a background worker or external Judge0/Piston API.
4. Worker returns raw JSON `stdout/stderr` back to the client.

### State & Temporal Snapshots (Warp Drive)
1. Frontend retains an array queue of `history = []`.
2. Every X keystrokes (or upon pressing "Snapshot"), the current Monaco string state is pushed to `history`.
3. Reverting triggers `editor.setValue(history[index])` and emits a room-wide override.

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
