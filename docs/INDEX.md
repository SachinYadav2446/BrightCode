# 📚 CodeBright Documentation Index

Welcome to the CodeBright documentation! This index will help you find the information you need quickly.

---

## 🚀 Getting Started

### Quick Start Guides
- **[Quick Start Guide](./guides/QUICK_START.md)** - Get CodeBright up and running in minutes
- **[Environment Configuration](./guides/ENV_FORMAT_GUIDE.md)** - How to configure your `.env` file with API keys
- **[AI Test Cases Setup](./guides/SETUP_AI_TEST_CASES.md)** - Configure AI-powered test case generation

---

## 🎯 Features Documentation

### AI Test Case System
- **[AI Test Case Complete Guide](./features/AI_TEST_CASE_COMPLETE_GUIDE.md)** - Comprehensive guide to the AI test case generation system
- **[Persistent Storage Guide](./features/PERSISTENT_STORAGE_GUIDE.md)** - How test cases are cached and stored for offline use

### Code Wars Arena
- **[Codeforces & Exercism Integration](./features/CODEFORCES_EXERCISM_INTEGRATION.md)** - External API integration for coding challenges
- **[Collaborative Editor Spec](./features/COLLABORATIVE_EDITOR_SPEC.md)** - Real-time collaborative coding features

---

## 🔧 Troubleshooting

- **[Check Server Status](./troubleshooting/CHECK_SERVER_STATUS.md)** - Verify your server is running correctly
- **[Code Wars Troubleshooting](./troubleshooting/CODE_WARS_TROUBLESHOOTING.md)** - Common issues and solutions for Code Wars Arena

---

## 📦 Project Structure

```
CodeBright/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── context/       # React Context providers
│   │   ├── services/      # API service layer
│   │   └── data/          # Static data and configurations
│   └── public/            # Static assets
├── server/                # Express backend application
│   ├── routes/            # API route handlers
│   ├── middleware/        # Express middleware
│   ├── ai_test_cases/     # AI-generated test case storage
│   └── .env               # Environment configuration
├── docs/                  # Documentation (you are here!)
│   ├── guides/            # Setup and configuration guides
│   ├── features/          # Feature documentation
│   └── troubleshooting/   # Problem-solving guides
├── archive/               # Historical documentation
└── .kiro/                 # Kiro AI assistant configuration
    └── specs/             # Feature specifications
```

---

## 🎓 Key Concepts

### AI Test Case Generation
CodeBright uses a multi-provider AI system to automatically generate test cases for coding challenges:
- **Primary Provider**: Gemini API (Google)
- **Fallback Chain**: OpenAI → Anthropic → Groq
- **Caching**: Test cases are stored locally after first generation
- **Performance**: ~10 seconds for first generation, <0.01 seconds from cache

### Real-Time Collaboration
The platform uses Socket.io for real-time features:
- Live code synchronization across multiple users
- Cursor position tracking
- User presence indicators
- Room-based permissions and controls

### Gamification System
- **XP System**: Earn experience points by completing challenges
- **Factions**: Join teams and compete on leaderboards
- **Modules**: Progressive learning paths (Logic Lab, Code Arena, etc.)
- **Achievements**: Unlock badges and rewards

---

## 🔗 External Resources

- **[React Documentation](https://react.dev/)** - Frontend framework
- **[Socket.io Documentation](https://socket.io/docs/)** - Real-time communication
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Code editor component
- **[Gemini API](https://ai.google.dev/docs)** - AI test case generation
- **[PostgreSQL Documentation](https://www.postgresql.org/docs/)** - Database

---

## 📝 Contributing

When adding new documentation:
1. Place setup guides in `docs/guides/`
2. Place feature documentation in `docs/features/`
3. Place troubleshooting guides in `docs/troubleshooting/`
4. Update this INDEX.md file with links to new documentation
5. Use clear, descriptive filenames in UPPERCASE_WITH_UNDERSCORES.md format

---

## 📜 Archive

Historical documentation and completed phase summaries are stored in the `archive/` folder. These documents are kept for reference but may contain outdated information.

---

## 🆘 Need Help?

1. Check the [Troubleshooting](./troubleshooting/) section
2. Review the [Quick Start Guide](./guides/QUICK_START.md)
3. Check the main [README.md](../README.md) for feature overview
4. Review feature-specific documentation in [Features](./features/)

---

**Last Updated**: May 2, 2026
**Version**: 1.0.0
