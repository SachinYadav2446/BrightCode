# BrightCode

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.4-61dafb.svg?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933.svg?logo=nodedotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1.svg?logo=postgresql)
![Vite](https://img.shields.io/badge/Vite-8.0.4-646CFF.svg?logo=vite)

BrightCode is a high-performance, real-time collaborative coding platform designed for the modern developer. It integrates professional-grade IDE features, gamified learning experiences, and competitive social layers into a unified interface.

---

## Project Overview

BrightCode provides a comprehensive environment for developers to:
- Collaborate in real-time on code
- Practice coding challenges with progressive difficulty
- Compete in timed contests
- Manage and organize coding notes and resources
- Learn through structured modules
- Contribute to the platform's question library

---

## Core Features

### Collaborative Workspace
- Real-time code synchronization using WebSockets
- Integrated Monaco Editor with syntax highlighting for multiple languages
- Shared terminal access
- Teammate presence and cursor tracking
- Workspace snapshot and version history
- Git integration for version control

### Logic Lab
- Progressive learning modules organized by difficulty
- Structured curriculum covering algorithms, data structures, and programming languages
- Interactive problem-solving interface
- Instant feedback and test case validation

### Code Arena
- Timed coding challenges
- Multiple difficulty levels
- Leaderboard and ranking system
- Contest history and performance analytics

### CodeVault
- Rich-text note editor with Markdown support
- Code block syntax highlighting
- Diagram creation with Excalidraw
- Folder organization for notes
- Export functionality

### AI Companion
- Code analysis and suggestions
- Syntax error detection and fixes
- Complexity optimization recommendations
- Contextual assistance based on active code

### Factions & Community
- Team formation and collaboration
- Group challenges and competitions
- Global leaderboards
- Social features and friend management

---

## System Architecture

BrightCode follows a 3-tier web architecture optimized for real-time communication:

### Presentation Layer
- React 19 with Vite for fast development and optimized builds
- Client-side routing with React Router
- State management using React Context API
- Real-time communication via Socket.io Client
- UI animations with Framer Motion

### Application Layer
- Express.js REST API for core backend functionality
- Socket.io Server for real-time event broadcasting
- JWT-based authentication system
- Secure code execution sandbox
- Background workers for resource-intensive tasks

### Data Layer
- PostgreSQL relational database for persistent storage
- Neon serverless PostgreSQL integration
- Socket.io Postgres Adapter for scaling real-time features

---

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, Vite, Monaco Editor, Framer Motion, React Router, Socket.io Client, TipTap, Lucide React |
| Backend | Node.js, Express, Socket.io, JWT, Bcrypt, Nodemailer, Winston |
| Database | PostgreSQL, Neon Serverless |
| DevOps | Docker, Docker Compose, Vercel |

---

## Project Structure

```
brightcode/
├── client/                 # Frontend application
│   ├── public/             # Static assets
│   │   └── data/           # Question banks and resources
│   ├── src/
│   │   ├── assets/         # Images and media
│   │   ├── components/     # Reusable UI components
│   │   │   ├── codevault/  # CodeVault feature components
│   │   │   └── codewars/   # CodeArena feature components
│   │   ├── context/        # React Context providers
│   │   ├── data/           # Static data files
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Backend application
│   ├── index.js            # Server entry point
│   └── package.json
├── docs/                   # Project documentation
│   ├── features/           # Feature specifications
│   ├── guides/             # Setup and usage guides
│   └── project_updates/    # Development updates
└── docker-compose.yml      # Docker configuration
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/SachinYadav2446/BrightCode.git
   cd BrightCode
   ```

2. Set up environment variables
   Create a `.env` file in the `server` directory with the following variables:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

   Create a `.env` file in the `client` directory with:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

3. Install server dependencies and start the backend
   ```bash
   cd server
   npm install
   npm start
   ```

4. Install client dependencies and start the frontend
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

5. Access the application at `http://localhost:5173`

---

## Configuration

### Server Configuration
- `PORT`: Server port (default: 5000)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `NODE_ENV`: Environment mode (development/production)

### Client Configuration
- `VITE_API_URL`: Backend API endpoint
- `VITE_SOCKET_URL`: Socket.io server endpoint

---

## API Reference

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/leaderboard` - Get user leaderboard

### Questions
- `GET /api/questions` - Get questions list
- `GET /api/questions/:id` - Get question details
- `POST /api/questions` - Submit a new question (Contribute feature)

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
