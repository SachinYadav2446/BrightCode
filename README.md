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

### 8. 📝 CodeVault Notes System
A comprehensive note-taking system with advanced features for developers.
- **Tech Stack**: `React`, `@tiptap/react`, `PostgreSQL`, `Express`.
- **How it Works**: 
  - Create, edit, and organize notes in a VS Code-inspired interface
  - Rich text editing with markdown support, code blocks, and formatting
  - Folder-based organization with drag & drop support
  - Real-time saving and synchronization
  - Tag system for categorization
  - Search functionality across all notes

### 9. 🎨 Advanced Rich Text Editor
Professional-grade text editor with extensive formatting options.
- **Tech Stack**: `@tiptap/react`, `StarterKit`, `CodeBlock`, `Image`, `Link` extensions.
- **Features**:
  - Real-time WYSIWYG editing with markdown shortcuts
  - Code syntax highlighting with language support
  - Image upload and embedding (local files and URLs)
  - Link insertion and management
  - Text formatting (bold, italic, underline, strikethrough)
  - Headings (H1-H6) with visual indicators
  - Lists (bullet, numbered, task lists)
  - Blockquotes and horizontal rules
  - Text alignment (left, center, right, justify)
  - Text and highlight color customization

### 10. 🖼️ Visual Diagram Creation
Integrated diagram editor for creating visual notes and documentation.
- **Tech Stack**: `@excalidraw/excalidraw`, `React`, `Canvas API`.
- **Features**:
  - Create flowcharts, diagrams, and sketches directly in notes
  - Dark mode optimized interface
  - Export diagrams as PNG images embedded in notes
  - Edit existing diagrams with full revision history
  - Shape libraries and drawing tools
  - Text annotations and connectors
  - Zoom and pan controls

### 11. 📄 Legal Documentation System
Comprehensive legal pages for platform compliance.
- **Features**:
  - Terms of Service with acceptance tracking
  - Privacy Policy with data handling transparency
  - Cookie Policy with consent management
  - Accessibility Statement (WCAG compliance)
  - Responsive design for all screen sizes
  - Easy updates through markdown-based content

### 12. 🎯 Enhanced UI/UX Improvements
Continuous interface refinements for better user experience.
- **Improvements**:
  - Home page about section with dynamic content
  - Responsive design optimizations
  - Performance enhancements for faster loading
  - Accessibility improvements (ARIA labels, keyboard navigation)
  - Consistent color scheme and typography
  - Smooth animations and transitions

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Editor**: [@monaco-editor/react](https://www.npmjs.com/package/@monaco-editor/react)
- **Rich Text Editor**: [@tiptap/react](https://tiptap.dev/) + [StarterKit](https://tiptap.dev/docs/editor/getting-started/install)
- **Diagram Editor**: [@excalidraw/excalidraw](https://excalidraw.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks + Context API
- **Form Handling**: React Hook Form + Zod
- **Markdown Processing**: [marked](https://marked.js.org/)
- **File Handling**: [file-saver](https://www.npmjs.com/package/file-saver), [jszip](https://stuk.github.io/jszip/)
- **Terminal Emulation**: [@xterm/xterm](https://xtermjs.org/)

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
- **Dark Mode First**: All components are optimized for dark theme with proper contrast ratios.

---

## 📖 Using the New Features

### CodeVault Notes System
1. **Accessing Notes**: Navigate to the CodeVault section from the main dashboard
2. **Creating Notes**: Click "New Note" button or use `Ctrl+N` shortcut
3. **Organizing**: Create folders, drag & drop notes, use tags for categorization
4. **Editing**: Use the rich text editor with toolbar or markdown shortcuts
5. **Searching**: Use the search bar to find notes by title, content, or tags

### Rich Text Editor Tips
- Use `#` followed by space for H1 headings, `##` for H2, etc.
- Use `**text**` for bold, `*text*` for italic
- Use `-` or `*` for bullet lists, `1.` for numbered lists
- Use `[ ]` for task lists (checkboxes)
- Use `>` for blockquotes
- Use \`code\` for inline code, \`\`\`language for code blocks
- Use `---` for horizontal rules

### Diagram Creation
1. **Insert Diagram**: Click the diagram button in the editor toolbar
2. **Create Shapes**: Use the toolbar to draw rectangles, circles, arrows, etc.
3. **Add Text**: Click the text tool to add annotations
4. **Connect Elements**: Use arrow tools to create flowcharts
5. **Save**: Click "Save to Note" to embed the diagram as an image
6. **Edit**: Click on existing diagram images and select "Edit diagram"

### Legal Pages
- **Terms of Service**: Accessible from footer or account settings
- **Privacy Policy**: Details data collection and usage practices
- **Cookie Policy**: Manages cookie consent preferences
- **Accessibility**: Information on WCAG compliance and accessibility features

### Keyboard Shortcuts
- `Ctrl+N`: New note
- `Ctrl+S`: Save note
- `Ctrl+F`: Search notes
- `Ctrl+B`: Bold text
- `Ctrl+I`: Italic text
- `Ctrl+K`: Insert link
- `Ctrl+E`: Toggle preview mode
- `Ctrl+/`: Show keyboard shortcuts help
- `Esc`: Close modals/panels

---

## 🔧 Development Notes

### Code Structure
- **Components**: Located in `client/src/components/`
- **Pages**: Located in `client/src/pages/`
- **Services**: API calls and business logic in `client/src/services/`
- **Context**: Global state management in `client/src/context/`
- **Utils**: Helper functions and utilities in `client/src/utils/`

### Specs and Documentation
- **Feature Specs**: Detailed requirements in `.kiro/specs/`
- **Design Documents**: UI/UX specifications in `.kiro/specs/*/design.md`
- **Task Tracking**: Implementation tasks in `.kiro/specs/*/tasks.md`
- **Bug Reports**: Issue tracking in `.kiro/specs/*/bugfix.md`

### Styling Guidelines
- Use CSS custom properties (variables) defined in `:root`
- Follow BEM naming convention for complex components
- Use responsive design principles (mobile-first approach)
- Maintain consistent spacing using 4px/8px/16px/24px/32px increments
- Use semantic HTML elements for accessibility

---

## 📚 Additional Documentation

- **[USER_GUIDE.md](./USER_GUIDE.md)**: Comprehensive user guide with detailed instructions
- **[API_DOCS.md](./API_DOCS.md)**: API documentation (if available)
- **[CONTRIBUTING.md](./CONTRIBUTING.md)**: Guidelines for contributors
- **[CHANGELOG.md](./CHANGELOG.md)**: Version history and changes

---


