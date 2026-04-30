import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, Rocket, Gamepad2,
  Layout, Sword, Shield, Zap, Globe, Code2, Users,
  Activity, ChevronDown, ChevronRight, ExternalLink,
  FileText, Image, GitBranch, Bot, Keyboard, LifeBuoy, Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./UserModule.css";

const navSections = [
  { id: "getting-started", icon: "Rocket", label: "Getting Started" },
  { id: "account", icon: "Shield", label: "Account Management" },
  { id: "workspace", icon: "Layout", label: "Collaborative Workspace" },
  { id: "learning", icon: "Gamepad2", label: "Learning Modules" },
  { id: "codevault", icon: "FileText", label: "CodeVault Notes" },
  { id: "rich-editor", icon: "BookOpen", label: "Rich Text Editor" },
  { id: "diagrams", icon: "Image", label: "Diagram Creation" },
  { id: "ai-assistant", icon: "Bot", label: "AI Assistant" },
  { id: "version-control", icon: "GitBranch", label: "Version Control" },
  { id: "activity", icon: "Activity", label: "Activity Tracking" },
  { id: "factions", icon: "Sword", label: "Factions & Competition" },
  { id: "shortcuts", icon: "Keyboard", label: "Keyboard Shortcuts" },
  { id: "troubleshooting", icon: "LifeBuoy", label: "Troubleshooting" },
];

const iconMap = {
  Rocket: <Rocket size={18} />, Shield: <Shield size={18} />,
  Layout: <Layout size={18} />, Gamepad2: <Gamepad2 size={18} />,
  FileText: <FileText size={18} />, BookOpen: <BookOpen size={18} />,
  Image: <Image size={18} />, Bot: <Bot size={18} />,
  GitBranch: <GitBranch size={18} />, Activity: <Activity size={18} />,
  Sword: <Sword size={18} />, Keyboard: <Keyboard size={18} />,
  LifeBuoy: <LifeBuoy size={18} />,
};

const AccordionItem = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`accordion-item ${open ? "open" : ""}`}>
      <button className="accordion-trigger" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="accordion-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="accordion-content">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StepList = ({ steps }) => (
  <ol className="step-list">
    {steps.map((step, i) => (
      <li key={i} className="step-item">
        <span className="step-num">{i + 1}</span>
        <span>{step}</span>
      </li>
    ))}
  </ol>
);

const BulletList = ({ items }) => (
  <ul className="bullet-list">
    {items.map((item, i) => (
      <li key={i}><Zap size={12} className="bullet-icon" /><span>{item}</span></li>
    ))}
  </ul>
);

const ShortcutRow = ({ keys, action }) => (
  <div className="shortcut-row">
    <div className="shortcut-keys">
      {keys.map((k, i) => <kbd key={i}>{k}</kbd>)}
    </div>
    <span className="shortcut-action">{action}</span>
  </div>
);

const UserModule = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("getting-started");

  const handleNavClick = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="user-module-page">
      {/* Top Nav */}
      <nav className="module-nav">
        <button className="back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={20} /> <span>Back to Landing</span>
        </button>
        <div className="nav-brand">
          <Code2 size={22} color="#ef4444" />
          <span>BrightCode / User Guide</span>
        </div>
        <div className="nav-version">
          <Star size={14} color="#ef4444" />
          <span>v2.0 — April 2026</span>
        </div>
      </nav>

      <div className="module-layout">
        {/* Sidebar */}
        <aside className="module-sidebar">
          <div className="sidebar-header">
            <h3>Contents</h3>
          </div>
          <nav className="sidebar-links">
            {navSections.map((sec) => (
              <button
                key={sec.id}
                className={`sidebar-link ${activeSection === sec.id ? "active" : ""}`}
                onClick={() => handleNavClick(sec.id)}
              >
                {iconMap[sec.icon]}
                <span>{sec.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="module-main">
          {/* Hero */}
          <motion.div
            className="module-intro"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="intro-badge">User Guide</div>
            <h1>Mastering BrightCode</h1>
            <p>
              Everything you need to navigate, compete, and build inside the
              BrightCode ecosystem — from first login to faction domination.
            </p>
            <div className="intro-meta">
              <span><Globe size={14} /> Comprehensive</span>
              <span><Zap size={14} /> Always up to date</span>
              <span><Users size={14} /> Community-driven</span>
            </div>
          </motion.div>

          {/* ── Getting Started ── */}
          <section id="getting-started" className="doc-section">
            <div className="section-label">
              <Rocket size={20} />
              <span>Getting Started</span>
            </div>
            <h2>Your First Steps</h2>
            <p>
              New to BrightCode? This section walks you through registration,
              initial setup, and a quick tour of the dashboard so you can hit
              the ground running.
            </p>

            <AccordionItem title="Registration & Login">
              <StepList steps={[
                "Visit the BrightCode platform and click Sign Up.",
                "Fill in your username, email, and a strong password.",
                "Verify your email address via the confirmation link.",
                "Log in with your credentials to access the dashboard.",
              ]} />
            </AccordionItem>

            <AccordionItem title="First-Time Setup">
              <StepList steps={[
                "Complete your profile — add an avatar, bio, and social links.",
                "Choose your preferred programming languages.",
                "Select a faction to join (you can change this later).",
                "Explore the interactive onboarding tutorial.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Dashboard Overview">
              <BulletList items={[
                "Left Sidebar — Navigation menu for all main features.",
                "Center Panel — Active workspace or learning module.",
                "Right Sidebar — Activity feed, notifications, and AI assistant.",
                "Top Bar — User profile, settings, and quick actions.",
              ]} />
            </AccordionItem>
          </section>

          {/* ── Account Management ── */}
          <section id="account" className="doc-section">
            <div className="section-label">
              <Shield size={20} />
              <span>Account Management</span>
            </div>
            <h2>Profile & Security</h2>
            <p>
              Keep your account secure and your profile up to date. BrightCode
              gives you full control over your identity, privacy, and session
              management.
            </p>

            <AccordionItem title="Profile Settings">
              <BulletList items={[
                "Edit Profile — Update username, avatar, bio, and social links.",
                "Privacy Settings — Control visibility of your activity and profile.",
                "Notification Preferences — Choose what notifications to receive.",
                "Theme Preferences — Switch between light and dark mode.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Security">
              <BulletList items={[
                "Password Management — Change your password regularly.",
                "Two-Factor Authentication — Enable 2FA for added security.",
                "Session Management — View and revoke active sessions.",
                "Connected Devices — Manage all authorized devices.",
              ]} />
            </AccordionItem>
          </section>

          {/* ── Collaborative Workspace ── */}
          <section id="workspace" className="doc-section">
            <div className="section-label">
              <Layout size={20} />
              <span>Collaborative Workspace</span>
            </div>
            <h2>Build Together in Real Time</h2>
            <p>
              The Workspace is BrightCode's signature IDE-like environment.
              Sub-10ms latency sync, multi-language support, and integrated
              team communication — all in one place.
            </p>

            <AccordionItem title="Creating a Workspace">
              <StepList steps={[
                "Click New Workspace from the dashboard.",
                "Choose workspace type — private or public.",
                "Set permissions and invite collaborators by username or email.",
                "Configure workspace settings and language preferences.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Real-Time Collaboration">
              <BulletList items={[
                "Live Editing — See collaborators' cursors in real time.",
                "Built-in Chat — Communicate without leaving the editor.",
                "File Sharing — Upload and share files within the workspace.",
                "Version History — Track every change with Warp Drive.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Workspace Management">
              <BulletList items={[
                "Admin Controls — Manage users, permissions, and settings.",
                "File Organization — Create folders and organize your files.",
                "Export Options — Export workspace as ZIP or individual files.",
                "Archive Workspace — Archive inactive workspaces to keep things tidy.",
              ]} />
            </AccordionItem>
          </section>

          {/* ── Learning Modules ── */}
          <section id="learning" className="doc-section">
            <div className="section-label">
              <Gamepad2 size={20} />
              <span>Learning Modules</span>
            </div>
            <h2>Sharpen Your Skills</h2>
            <p>
              From guided campaigns to timed arena battles, BrightCode's
              learning modules are designed to push your engineering skills
              to the next level.
            </p>

            <AccordionItem title="Logic Lab — 100-Level Campaign">
              <StepList steps={[
                "Start Campaign — Begin with Phase 1 challenges.",
                "Complete Challenges — Solve programming problems to earn XP.",
                "Unlock Phases — Progress through increasingly difficult stages.",
                "Track Progress — View completion percentage and badges earned.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Code Arena (Arcade)">
              <StepList steps={[
                "Select Module — Choose from CSS Odyssey, Logic Suite, and more.",
                "Time Attack — Solve problems within strict time limits.",
                "Instant Feedback — Get real-time evaluation of your solutions.",
                "Leaderboards — Compete against players globally.",
                "Rewards — Earn XP and unlock achievements.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Learning Tips">
              <BulletList items={[
                "Start with easier modules to build confidence before advancing.",
                "Review solution explanations — understanding beats memorizing.",
                "Use the AI Assistant (The Sentinel) when you get stuck.",
                "Practice consistently — even 20 minutes a day compounds fast.",
              ]} />
            </AccordionItem>
          </section>

          {/* ── CodeVault Notes ── */}
          <section id="codevault" className="doc-section">
            <div className="section-label">
              <FileText size={20} />
              <span>CodeVault Notes System</span>
            </div>
            <h2>Your Personal Knowledge Base</h2>
            <p>
              CodeVault is a full-featured notes system built right into
              BrightCode. Organize your thoughts, document your code, and
              build a personal knowledge base with rich formatting and diagrams.
            </p>

            <AccordionItem title="Creating & Managing Notes">
              <StepList steps={[
                "New Note — Click + New Note or press Ctrl+N.",
                "Title & Organize — Give meaningful titles and place notes in folders.",
                "Rich Editing — Use the toolbar or markdown for formatting.",
                "Tags — Add tags for easy categorization and search.",
                "Save — Notes auto-save; manual save is available with Ctrl+S.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Organization Features">
              <BulletList items={[
                "Folders — Create nested folder structures for any project.",
                "Drag & Drop — Reorganize notes by dragging them.",
                "Favorites — Star important notes for quick access.",
                "Recent Notes — Quickly jump back to recently edited notes.",
                "Trash — Recover deleted notes from the trash bin.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Search & Discovery">
              <BulletList items={[
                "Full-Text Search — Search across all note content instantly.",
                "Filter by Tags — Narrow results by one or more tags.",
                "Filter by Date — Find notes from specific time periods.",
                "Advanced Search — Use AND, OR, NOT operators for complex queries.",
              ]} />
            </AccordionItem>
          </section>

          {/* ── Rich Text Editor ── */}
          <section id="rich-editor" className="doc-section">
            <div className="section-label">
              <BookOpen size={20} />
              <span>Rich Text Editor</span>
            </div>
            <h2>Write Without Limits</h2>
            <p>
              The built-in rich text editor supports full markdown, inline
              formatting, media embeds, and a powerful toolbar — everything
              you need to write beautiful, structured notes.
            </p>

            <AccordionItem title="Basic Formatting">
              <div className="code-table">
                <div className="code-row"><code>#</code><span>Heading 1</span></div>
                <div className="code-row"><code>##</code><span>Heading 2 (up to ######)</span></div>
                <div className="code-row"><code>**text**</code><span>Bold</span></div>
                <div className="code-row"><code>*text*</code><span>Italic</span></div>
                <div className="code-row"><code>~~text~~</code><span>Strikethrough</span></div>
                <div className="code-row"><code>`code`</code><span>Inline code</span></div>
                <div className="code-row"><code>```lang</code><span>Code block</span></div>
              </div>
            </AccordionItem>

            <AccordionItem title="Advanced Features">
              <BulletList items={[
                "Lists — - for bullet, 1. for numbered, [ ] for task lists.",
                "Blockquotes — > at the start of a line.",
                "Horizontal Rules — --- or ***.",
                "Links — [text](url) or use the toolbar button.",
                "Images — ![alt](url) or upload directly from your computer.",
                "Tables — Markdown table syntax or the toolbar insert.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Toolbar Functions">
              <BulletList items={[
                "Formatting — Bold, italic, underline, strikethrough.",
                "Headings — H1–H6 dropdown with color coding.",
                "Lists — Bullet, numbered, and task lists.",
                "Alignment — Left, center, right, justify.",
                "Colors — Text color and highlight color pickers.",
                "Media — Insert links, images, and diagrams.",
                "Blocks — Code blocks, quotes, and horizontal rules.",
              ]} />
            </AccordionItem>
          </section>

          {/* ── Diagram Creation ── */}
          <section id="diagrams" className="doc-section">
            <div className="section-label">
              <Image size={20} />
              <span>Diagram Creation</span>
            </div>
            <h2>Visualize Your Ideas</h2>
            <p>
              The integrated diagram editor lets you draw flowcharts, system
              diagrams, and sketches directly inside your notes — no external
              tools needed.
            </p>

            <AccordionItem title="Creating a Diagram">
              <StepList steps={[
                "Open Diagram Editor — Click the diagram button in the editor toolbar.",
                "Draw Shapes — Select from rectangle, circle, arrow, and line tools.",
                "Add Text — Use the text tool for labels and annotations.",
                "Connect Elements — Draw arrows between shapes to show relationships.",
                "Style Elements — Change colors, stroke width, and fill.",
                "Save — Click Save to Note to embed the diagram as an image.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Available Tools">
              <BulletList items={[
                "Selection Tool — Select and move elements freely.",
                "Rectangle / Circle — Basic shapes for any diagram.",
                "Arrow / Line — Connectors and directional lines.",
                "Text — Add labels and descriptions anywhere.",
                "Free Draw — Hand-drawn sketches for quick ideas.",
                "Eraser — Remove individual elements.",
                "Zoom — Zoom in and out for detail work.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Editing & Export">
              <BulletList items={[
                "Click any embedded diagram then hit the pencil icon to edit.",
                "PNG Export — High-quality image export for sharing.",
                "Copy to Clipboard — Quick copy for pasting anywhere.",
                "Save Locally — Download the diagram file to your machine.",
              ]} />
            </AccordionItem>
          </section>

          {/* ── AI Assistant ── */}
          <section id="ai-assistant" className="doc-section">
            <div className="section-label">
              <Bot size={20} />
              <span>AI Assistant — The Sentinel</span>
            </div>
            <h2>Your Intelligent Coding Partner</h2>
            <p>
              The Sentinel is BrightCode's context-aware AI assistant. It reads
              your current file, understands your code, and helps you debug,
              optimize, and learn — all without leaving the editor.
            </p>

            <AccordionItem title="Accessing the Assistant">
              <StepList steps={[
                "Click the AI assistant icon in the right sidebar.",
                "The Sentinel automatically reads your current file for context.",
                "Type your question or describe the problem you are facing.",
                "Receive targeted suggestions, fixes, and explanations.",
              ]} />
            </AccordionItem>

            <AccordionItem title="What the Sentinel Can Do">
              <BulletList items={[
                "Code Explanation — Break down complex snippets in plain language.",
                "Debugging Help — Identify and fix bugs with context-aware analysis.",
                "Optimization Suggestions — Improve performance and readability.",
                "Learning Resources — Recommend tutorials and documentation.",
                "Best Practices — Suggest coding standards and design patterns.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Tips for Best Results">
              <BulletList items={[
                "Be specific — describe the exact behavior you expect vs. what happens.",
                "Share relevant code context when asking about a bug.",
                "Ask follow-up questions to dig deeper into an explanation.",
                "Use it for learning, not just for getting answers.",
              ]} />
            </AccordionItem>
          </section>

          {/* ── Version Control ── */}
          <section id="version-control" className="doc-section">
            <div className="section-label">
              <GitBranch size={20} />
              <span>Version Control — Warp Drive</span>
            </div>
            <h2>Time-Travel Through Your Code</h2>
            <p>
              Warp Drive is BrightCode's built-in version control system.
              Create temporal snapshots, compare versions side by side, and
              restore any previous state with a single click.
            </p>

            <AccordionItem title="Temporal Snapshots">
              <StepList steps={[
                "Automatic Snapshots — The system captures milestones automatically.",
                "Manual Snapshots — Create a snapshot anytime with one click.",
                "View History — Browse the full timeline of all snapshots.",
                "Restore — Revert to any previous snapshot instantly.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Advanced Features">
              <BulletList items={[
                "Compare Versions — Side-by-side diff view of any two snapshots.",
                "Branching — Create alternative versions to experiment safely.",
                "Merge Changes — Combine different versions when ready.",
                "Export History — Export the full version history as a report.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Best Practices">
              <BulletList items={[
                "Create a snapshot before every major change.",
                "Add descriptive comments to snapshots for easy navigation.",
                "Use branching for experimental features to keep main clean.",
                "Regularly review and clean up old snapshots.",
              ]} />
            </AccordionItem>
          </section>

          {/* ── Activity Tracking ── */}
          <section id="activity" className="doc-section">
            <div className="section-label">
              <Activity size={20} />
              <span>Activity Tracking</span>
            </div>
            <h2>Measure Your Growth</h2>
            <p>
              BrightCode tracks your coding activity across every feature and
              surfaces insights to help you build better habits and level up
              faster.
            </p>

            <AccordionItem title="Heatmap Visualization">
              <BulletList items={[
                "Daily Activity — See your coding activity mapped by day.",
                "Module Breakdown — View activity split by Logic Lab, Arcade, etc.",
                "Trend Analysis — Identify patterns in your coding habits.",
                "Goal Setting — Set and track personal coding goals.",
              ]} />
            </AccordionItem>

            <AccordionItem title="XP System">
              <BulletList items={[
                "Earning XP — Complete challenges, solve problems, create content.",
                "Level Progression — Level up based on your total accumulated XP.",
                "Achievements — Unlock badges and special rewards.",
                "Leaderboard Ranking — See how you compare to other users globally.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Productivity Insights">
              <BulletList items={[
                "Time Tracking — Monitor time spent on different activities.",
                "Skill Development — Track progress in specific programming areas.",
                "Recommendations — Get personalized learning suggestions.",
                "Progress Reports — Weekly and monthly activity summaries.",
              ]} />
            </AccordionItem>
          </section>

          {/* ── Factions ── */}
          <section id="factions" className="doc-section">
            <div className="section-label">
              <Sword size={20} />
              <span>Factions & Competition</span>
            </div>
            <h2>Join Forces, Dominate Together</h2>
            <p>
              Factions are specialized developer groups with their own identity,
              goals, and competitive standing. Join one to unlock exclusive
              resources, group challenges, and faction-wide leaderboards.
            </p>

            <AccordionItem title="Joining a Faction">
              <StepList steps={[
                "Browse Factions — View available factions and their focus areas.",
                "Select Faction — Choose based on your interests (Web Dev, Data Science, etc.).",
                "Apply — Request to join or accept an invitation.",
                "Participate — Contribute to faction goals and group activities.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Faction Features">
              <BulletList items={[
                "Private Chat — Communicate exclusively with faction members.",
                "Shared Resources — Access faction-specific learning materials.",
                "Group Challenges — Complete challenges as a coordinated team.",
                "Faction Leaderboards — Compete against other factions for supremacy.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Competition">
              <BulletList items={[
                "Global Leaderboards — Top performers ranked across all users.",
                "Faction Rankings — Faction vs. faction competition each season.",
                "Weekly Challenges — Time-limited competitive events with big rewards.",
                "Rewards — Trophies, badges, and special platform privileges.",
              ]} />
            </AccordionItem>
          </section>

          {/* ── Keyboard Shortcuts ── */}
          <section id="shortcuts" className="doc-section">
            <div className="section-label">
              <Keyboard size={20} />
              <span>Keyboard Shortcuts</span>
            </div>
            <h2>Move at the Speed of Thought</h2>
            <p>
              Master these shortcuts to navigate BrightCode without ever
              reaching for the mouse.
            </p>

            <div className="shortcuts-grid">
              <div className="shortcuts-group">
                <h4>Global</h4>
                <ShortcutRow keys={["Ctrl", "Shift", "P"]} action="Command palette" />
                <ShortcutRow keys={["Ctrl", "K"]} action="Quick search" />
                <ShortcutRow keys={["Ctrl", ","]} action="Settings" />
                <ShortcutRow keys={["Ctrl", "Shift", "M"]} action="Toggle sidebar" />
                <ShortcutRow keys={["F1"]} action="Help" />
              </div>
              <div className="shortcuts-group">
                <h4>Editor</h4>
                <ShortcutRow keys={["Ctrl", "N"]} action="New note / file" />
                <ShortcutRow keys={["Ctrl", "S"]} action="Save" />
                <ShortcutRow keys={["Ctrl", "F"]} action="Find" />
                <ShortcutRow keys={["Ctrl", "H"]} action="Find & replace" />
                <ShortcutRow keys={["Ctrl", "Z"]} action="Undo" />
                <ShortcutRow keys={["Ctrl", "Y"]} action="Redo" />
              </div>
              <div className="shortcuts-group">
                <h4>Formatting</h4>
                <ShortcutRow keys={["Ctrl", "B"]} action="Bold" />
                <ShortcutRow keys={["Ctrl", "I"]} action="Italic" />
                <ShortcutRow keys={["Ctrl", "U"]} action="Underline" />
                <ShortcutRow keys={["Ctrl", "E"]} action="Toggle preview" />
                <ShortcutRow keys={["Ctrl", "Shift", "C"]} action="Code block" />
                <ShortcutRow keys={["Ctrl", "L"]} action="Insert link" />
              </div>
              <div className="shortcuts-group">
                <h4>Navigation</h4>
                <ShortcutRow keys={["Ctrl", "1"]} action="Workspace" />
                <ShortcutRow keys={["Ctrl", "2"]} action="Logic Lab" />
                <ShortcutRow keys={["Ctrl", "3"]} action="Code Arena" />
                <ShortcutRow keys={["Ctrl", "4"]} action="CodeVault" />
                <ShortcutRow keys={["Ctrl", "Tab"]} action="Next tab" />
                <ShortcutRow keys={["Ctrl", "W"]} action="Close tab" />
              </div>
            </div>
          </section>

          {/* ── Troubleshooting ── */}
          <section id="troubleshooting" className="doc-section">
            <div className="section-label">
              <LifeBuoy size={20} />
              <span>Troubleshooting</span>
            </div>
            <h2>Common Issues & Fixes</h2>
            <p>
              Running into a problem? Most issues have a quick fix. Work through
              the steps below before reaching out to support.
            </p>

            <AccordionItem title="Editor Not Loading">
              <StepList steps={[
                "Clear your browser cache and cookies.",
                "Ensure your browser is up to date.",
                "Try disabling browser extensions one by one.",
                "Open the browser console (F12) and check for error messages.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Connection Issues">
              <StepList steps={[
                "Verify you have a stable internet connection.",
                "Check that BrightCode is not blocked by your firewall.",
                "Review proxy settings if you are on a corporate network.",
                "Contact support if the issue persists after the above steps.",
              ]} />
            </AccordionItem>

            <AccordionItem title="Performance Problems">
              <StepList steps={[
                "Close unused browser tabs to free up memory.",
                "Clear BrightCode-specific browser storage.",
                "Enable hardware acceleration in your browser settings.",
                "Update your graphics drivers if rendering feels sluggish.",
              ]} />
            </AccordionItem>

            <div className="support-card">
              <div className="support-card-icon"><LifeBuoy size={28} /></div>
              <div className="support-card-text">
                <h4>Still stuck?</h4>
                <p>Reach out via <strong>support@codebright.com</strong> or join the community Discord for real-time help.</p>
              </div>
              <a href="mailto:support@codebright.com" className="support-card-btn">
                Contact Support <ExternalLink size={14} />
              </a>
            </div>
          </section>

          {/* Footer */}
          <footer className="module-page-footer">
            <div className="footer-line"></div>
            <p>
              All documentation is free and open to the community.{" "}
              <span className="footer-highlight">Join the elite.</span>
            </p>
            <span className="footer-version">Last updated: April 30, 2026 · v2.0</span>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default UserModule;

