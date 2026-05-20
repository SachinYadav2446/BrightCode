# BrightCode - Git Branching Strategy

## 📋 Overview
This document outlines the branching strategy for the BrightCode project, designed to support a 1-2 month development cycle with multiple features being developed in parallel.

## 🌳 Branch Structure

### **Main Branches**

#### `main` (Production)
- **Purpose**: Production-ready code
- **Protection**: Protected branch, requires PR approval
- **Deployment**: Auto-deploys to production
- **Merge From**: `staging` only
- **Never commit directly to this branch**

#### `develop` (Integration)
- **Purpose**: Main development branch, integration point for all features
- **Protection**: Protected branch, requires PR approval
- **Deployment**: Auto-deploys to development environment
- **Merge From**: Feature branches
- **Merge To**: `staging`

#### `staging` (Pre-Production)
- **Purpose**: Pre-production testing and QA
- **Protection**: Protected branch
- **Deployment**: Auto-deploys to staging environment
- **Merge From**: `develop`
- **Merge To**: `main`
- **Testing**: Full QA testing before production release

### **Feature Branches**

#### `feature/code-wars-arena`
**Scope**: Team-based competitive coding battles
- Real-time collaborative editor
- Team matchmaking (1v1, 2v2, 4v4)
- Test case system (15 cases per problem)
- Scoring and leaderboards
- Socket.io integration
- Room management

#### `feature/codevault`
**Scope**: Knowledge management and note-taking
- Rich markdown editor
- Mermaid diagram support
- Code block syntax highlighting
- Image uploads and embeds
- Folder organization
- Search functionality

#### `feature/workspace-editor`
**Scope**: Collaborative code editor
- Real-time pair programming
- Monaco editor integration
- Multi-language support
- Live cursor tracking
- Session management
- Code synchronization

#### `feature/battle-arena`
**Scope**: Solo coding challenges
- Individual practice mode
- XP and points system
- Progress tracking
- Problem library integration
- Leaderboards

#### `feature/factions`
**Scope**: Team system and social features
- Faction creation and management
- Team chat
- Faction leaderboards
- Team challenges
- Member management

#### `feature/library`
**Scope**: Coding challenge collection
- Multi-language support (Java, Python, JavaScript, C++)
- Module organization
- Problem categorization
- XP system
- Progress tracking
- Difficulty levels

#### `feature/ai-chatbot`
**Scope**: AI-powered coding assistant "Pal"
- Context-aware responses
- Code analysis and debugging
- Platform guidance
- Learning assistance
- Multi-provider AI support (Gemini, OpenAI, etc.)

#### `feature/authentication`
**Scope**: User authentication and authorization
- JWT-based auth
- User registration/login
- Password reset
- Session management
- Role-based access control

### **Support Branches**

#### `hotfix/*`
**Purpose**: Critical production fixes
- **Branch From**: `main`
- **Merge To**: `main` AND `develop`
- **Naming**: `hotfix/issue-description`
- **Example**: `hotfix/login-crash-fix`

#### `bugfix/*`
**Purpose**: Non-critical bug fixes
- **Branch From**: `develop`
- **Merge To**: `develop`
- **Naming**: `bugfix/issue-description`
- **Example**: `bugfix/codevault-save-error`

#### `refactor/*`
**Purpose**: Code refactoring without feature changes
- **Branch From**: `develop`
- **Merge To**: `develop`
- **Naming**: `refactor/component-name`
- **Example**: `refactor/arena-state-management`

#### `docs/*`
**Purpose**: Documentation updates
- **Branch From**: `develop`
- **Merge To**: `develop`
- **Naming**: `docs/section-name`
- **Example**: `docs/api-documentation`

## 🔄 Workflow

### **Feature Development Workflow**

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Develop and Commit**
   ```bash
   # Make changes
   git add .
   git commit -m "feat(scope): description"
   ```

3. **Keep Updated with Develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-feature-name
   git rebase develop
   ```

4. **Push Feature Branch**
   ```bash
   git push -u origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Open PR from `feature/your-feature-name` → `develop`
   - Add description and screenshots
   - Request review
   - Link related issues

6. **After Approval**
   ```bash
   # Merge via GitHub UI (squash and merge recommended)
   # Delete feature branch after merge
   ```

### **Release Workflow**

1. **Develop → Staging**
   ```bash
   git checkout staging
   git pull origin staging
   git merge develop
   git push origin staging
   ```

2. **QA Testing on Staging**
   - Full regression testing
   - Performance testing
   - Security testing
   - Bug fixes go to `bugfix/*` branches

3. **Staging → Main (Production Release)**
   ```bash
   git checkout main
   git pull origin main
   git merge staging
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin main --tags
   ```

### **Hotfix Workflow**

1. **Create Hotfix Branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-issue
   ```

2. **Fix and Test**
   ```bash
   # Make fix
   git commit -m "hotfix: description"
   ```

3. **Merge to Main**
   ```bash
   git checkout main
   git merge hotfix/critical-issue
   git push origin main
   ```

4. **Merge to Develop**
   ```bash
   git checkout develop
   git merge hotfix/critical-issue
   git push origin develop
   ```

5. **Delete Hotfix Branch**
   ```bash
   git branch -d hotfix/critical-issue
   git push origin --delete hotfix/critical-issue
   ```

## 📝 Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### **Types**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### **Scopes**
- `codewars`: Code Wars Arena
- `codevault`: CodeVault
- `workspace`: Workspace Editor
- `battle-arena`: Battle Arena
- `factions`: Factions
- `library`: Library
- `chatbot`: AI Chatbot
- `auth`: Authentication
- `api`: Backend API
- `db`: Database
- `ui`: User Interface

### **Examples**
```bash
feat(codewars): add real-time collaborative editor
fix(codevault): resolve markdown rendering issue
docs(api): update authentication endpoints
refactor(chatbot): improve response generation logic
perf(library): optimize problem loading
```

## 🔒 Branch Protection Rules

### **Main Branch**
- ✅ Require pull request reviews (2 approvals)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require conversation resolution
- ✅ No force pushes
- ✅ No deletions

### **Develop Branch**
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ✅ No force pushes
- ✅ No deletions

### **Staging Branch**
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ✅ No force pushes

## 📊 Development Timeline

### **Phase 1: Foundation (Weeks 1-2)**
- `feature/authentication` - User auth system
- `feature/library` - Basic problem library
- `feature/workspace-editor` - Basic editor

### **Phase 2: Core Features (Weeks 3-4)**
- `feature/code-wars-arena` - Team battles
- `feature/battle-arena` - Solo challenges
- `feature/codevault` - Note-taking

### **Phase 3: Social & AI (Weeks 5-6)**
- `feature/factions` - Team system
- `feature/ai-chatbot` - AI assistant

### **Phase 4: Polish & Testing (Weeks 7-8)**
- Bug fixes and refinements
- Performance optimization
- Full QA testing
- Production deployment

## 🚀 Quick Reference

### **Check Current Branch**
```bash
git branch
```

### **List All Branches**
```bash
git branch -a
```

### **Switch Branch**
```bash
git checkout branch-name
```

### **Update Branch**
```bash
git pull origin branch-name
```

### **Delete Local Branch**
```bash
git branch -d branch-name
```

### **Delete Remote Branch**
```bash
git push origin --delete branch-name
```

## 📞 Support

For questions about the branching strategy:
- Check this document first
- Ask in team chat
- Create an issue with `question` label

---

**Last Updated**: 2024
**Maintained By**: BrightCode Development Team
