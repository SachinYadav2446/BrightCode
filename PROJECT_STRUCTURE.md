# BrightCode - Project Structure

## 📁 Repository Organization

```
BrightCode/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── codevault/     # CodeVault components
│   │   │   ├── codewars/      # Code Wars components
│   │   │   ├── Chatbot.jsx    # AI chatbot
│   │   │   ├── Navbar.jsx     # Navigation
│   │   │   └── ...
│   │   ├── pages/         # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── CodeWarsArena.jsx
│   │   │   ├── BattleArena.jsx
│   │   │   ├── CodeVault.jsx
│   │   │   ├── Workspace.jsx
│   │   │   ├── Library.jsx
│   │   │   ├── Factions.jsx
│   │   │   └── ...
│   │   ├── context/       # React context providers
│   │   ├── services/      # API service layer
│   │   ├── data/          # Static data and constants
│   │   └── socket.js      # Socket.io client
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── index.js          # Main server file
│   ├── chatbotAPI.js     # AI chatbot endpoints
│   ├── intraFactionArena.js  # Code Wars logic
│   ├── testCaseManager.js    # Test case system
│   ├── aiTestCaseGenerator.js # AI test generation
│   ├── leetcodeAPI.js    # LeetCode integration
│   ├── exercismAPI.js    # Exercism integration
│   ├── codeforcesAPI.js  # Codeforces integration
│   ├── javaCompiler.js   # Code execution
│   ├── test_cases/       # Test case library
│   ├── ai_test_cases/    # AI-generated tests
│   ├── users_db.json     # User database (temp)
│   ├── factions_db.json  # Factions database (temp)
│   ├── notes_db.json     # Notes database (temp)
│   └── package.json
│
├── .kiro/                # Kiro AI specifications
│   ├── specs/            # Feature specifications
│   └── steering/         # AI steering files
│
├── archive/              # Archived documentation
│
├── docs/                 # Project documentation
│   ├── BRANCHING_STRATEGY.md
│   ├── PROJECT_STRUCTURE.md
│   ├── API_DOCUMENTATION.md
│   └── DEPLOYMENT_GUIDE.md
│
├── .gitignore
├── README.md
└── package.json
```

## 🎯 Feature Modules

### **1. Code Wars Arena** (`feature/code-wars-arena`)
**Files:**
- `client/src/pages/CodeWarsArena.jsx`
- `client/src/pages/CodeWarsArena.css`
- `client/src/components/codewars/CollaborativeCodeEditor.jsx`
- `client/src/components/codewars/TeammatePresence.jsx`
- `client/src/components/codewars/TeammateCursor.jsx`
- `server/intraFactionArena.js`
- `server/testCaseManager.js`

**Responsibilities:**
- Team matchmaking and room management
- Real-time collaborative editing
- Test case execution and scoring
- Leaderboards and rankings

### **2. CodeVault** (`feature/codevault`)
**Files:**
- `client/src/pages/CodeVault.jsx`
- `client/src/components/codevault/NoteEditor.jsx`
- `client/src/components/codevault/RichEditor.jsx`
- `client/src/components/codevault/MarkdownPreview.jsx`
- `client/src/components/codevault/DiagramModal.jsx`
- `client/src/components/codevault/Sidebar.jsx`
- `client/src/services/notesService.js`
- `server/notes_db.json`

**Responsibilities:**
- Rich text editing with markdown
- Mermaid diagram rendering
- Code block syntax highlighting
- File organization and search

### **3. Workspace Editor** (`feature/workspace-editor`)
**Files:**
- `client/src/pages/Workspace.jsx`
- `client/src/pages/EditorPage.jsx`
- Monaco editor integration

**Responsibilities:**
- Real-time collaborative coding
- Session management
- Multi-language support
- Live cursor tracking

### **4. Battle Arena** (`feature/battle-arena`)
**Files:**
- `client/src/pages/BattleArena.jsx`
- `client/src/pages/BattleArena.css`

**Responsibilities:**
- Solo coding challenges
- XP and progression system
- Personal leaderboards
- Practice mode

### **5. Library** (`feature/library`)
**Files:**
- `client/src/pages/Library.jsx`
- `client/src/data/javaModule*.js`
- `client/src/data/mernQuestions.js`
- `client/src/data/languageData.js`

**Responsibilities:**
- Problem collection management
- Module organization
- Progress tracking
- Multi-language support

### **6. Factions** (`feature/factions`)
**Files:**
- `client/src/pages/Factions.jsx`
- `server/factions_db.json`

**Responsibilities:**
- Team creation and management
- Faction chat
- Team leaderboards
- Member management

### **7. AI Chatbot** (`feature/ai-chatbot`)
**Files:**
- `client/src/components/Chatbot.jsx`
- `client/src/components/Chatbot.css`
- `server/chatbotAPI.js`
- `server/aiTestCaseGenerator.js`

**Responsibilities:**
- AI-powered assistance
- Code analysis and debugging
- Platform guidance
- Test case generation

### **8. Authentication** (`feature/authentication`)
**Files:**
- `client/src/context/AuthContext.jsx`
- `client/src/pages/Auth.jsx`
- `server/index.js` (auth endpoints)
- `server/users_db.json`

**Responsibilities:**
- User registration and login
- JWT token management
- Session handling
- Password reset

## 🔧 Technology Stack

### **Frontend**
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: CSS3, Framer Motion
- **Editor**: Monaco Editor
- **State Management**: React Context
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios
- **Routing**: React Router v6

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Authentication**: JWT
- **Database**: PostgreSQL (planned), JSON files (current)
- **Code Execution**: Java compiler integration
- **AI**: Gemini API, OpenAI API

### **DevOps**
- **Version Control**: Git
- **CI/CD**: GitHub Actions (planned)
- **Hosting**: TBD
- **Monitoring**: TBD

## 📦 Dependencies

### **Client Dependencies**
```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "socket.io-client": "^4.x",
  "framer-motion": "^10.x",
  "lucide-react": "^0.x",
  "react-hot-toast": "^2.x",
  "@monaco-editor/react": "^4.x"
}
```

### **Server Dependencies**
```json
{
  "express": "^4.x",
  "socket.io": "^4.x",
  "jsonwebtoken": "^9.x",
  "bcryptjs": "^2.x",
  "axios": "^1.x",
  "cors": "^2.x",
  "dotenv": "^16.x"
}
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- Java JDK 11+ (for code execution)
- Git

### **Installation**

1. **Clone Repository**
   ```bash
   git clone https://github.com/SachinYadav2446/BrightCode.git
   cd BrightCode
   ```

2. **Install Client Dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install Server Dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Environment Setup**
   ```bash
   # Create .env file in server directory
   cp .env.example .env
   # Add your API keys
   ```

5. **Run Development Servers**
   ```bash
   # Terminal 1 - Client (port 5173)
   cd client
   npm run dev

   # Terminal 2 - Server (port 5051)
   cd server
   node index.js
   ```

## 📝 Development Guidelines

### **Code Style**
- Use ESLint and Prettier
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Write meaningful commit messages

### **File Naming**
- Components: PascalCase (e.g., `CodeWarsArena.jsx`)
- Utilities: camelCase (e.g., `notesService.js`)
- CSS: Match component name (e.g., `CodeWarsArena.css`)
- Constants: UPPER_SNAKE_CASE

### **Component Structure**
```jsx
// Imports
import React, { useState, useEffect } from 'react';
import './Component.css';

// Component
const Component = ({ props }) => {
  // State
  const [state, setState] = useState();

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Handlers
  const handleAction = () => {
    // Handler logic
  };

  // Render
  return (
    <div className="component">
      {/* JSX */}
    </div>
  );
};

export default Component;
```

## 🧪 Testing

### **Unit Tests**
```bash
npm test
```

### **Integration Tests**
```bash
npm run test:integration
```

### **E2E Tests**
```bash
npm run test:e2e
```

## 📊 Project Status

### **Completed Features** ✅
- Authentication system
- Code Wars Arena (basic)
- CodeVault (basic)
- Library (basic)
- AI Chatbot (Pal)
- Test case system

### **In Progress** 🚧
- Real-time collaboration
- Faction system
- Advanced scoring
- Performance optimization

### **Planned** 📋
- PostgreSQL migration
- Advanced analytics
- Mobile responsiveness
- Deployment pipeline

## 📞 Contact

- **Repository**: https://github.com/SachinYadav2446/BrightCode
- **Issues**: https://github.com/SachinYadav2446/BrightCode/issues
- **Discussions**: https://github.com/SachinYadav2446/BrightCode/discussions

---

**Last Updated**: 2024
**Version**: 1.0.0
