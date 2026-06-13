import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, BookOpen, Rocket,
  Layout, Sword, Shield, Zap, Globe, Users,
  Activity, ChevronDown, ChevronRight, ExternalLink,
  FileText, Image, GitBranch, Bot, Keyboard, LifeBuoy,
  Search, Play, CheckCircle2, Info, Star, AlertCircle,
  Home
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./UserModule.css";

/* ── Section registry ── */
const SECTIONS = [
  { id: "home",             icon: "Home",      label: "Overview"               },
  { id: "getting-started", icon: "Rocket",    label: "Getting Started"         },
  { id: "account",         icon: "Shield",    label: "Account Management"      },
  { id: "workspace",       icon: "Layout",    label: "Collaborative Workspace"  },
  { id: "codevault",       icon: "FileText",  label: "CodeVault Notes"          },
  { id: "rich-editor",     icon: "BookOpen",  label: "Rich Text Editor"         },
  { id: "diagrams",        icon: "Image",     label: "Diagram Creation"         },
  { id: "ai-assistant",    icon: "Bot",       label: "AI Assistant"             },
  { id: "version-control", icon: "GitBranch", label: "Version Control"          },
  { id: "activity",        icon: "Activity",  label: "Activity Tracking"        },
  { id: "factions",        icon: "Sword",     label: "Factions & Competition"   },
  { id: "shortcuts",       icon: "Keyboard",  label: "Keyboard Shortcuts"       },
  { id: "troubleshooting", icon: "LifeBuoy",  label: "Troubleshooting"          },
];

const ICON_MAP = {
  Home:      <Home      size={15} />,
  Rocket:    <Rocket    size={15} />,
  Shield:    <Shield    size={15} />,
  Layout:    <Layout    size={15} />,
  FileText:  <FileText  size={15} />,
  BookOpen:  <BookOpen  size={15} />,
  Image:     <Image     size={15} />,
  Bot:       <Bot       size={15} />,
  GitBranch: <GitBranch size={15} />,
  Activity:  <Activity  size={15} />,
  Sword:     <Sword     size={15} />,
  Keyboard:  <Keyboard  size={15} />,
  LifeBuoy:  <LifeBuoy  size={15} />,
};

/* ── Reusable sub-components ── */

const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`um-accordion ${open ? "open" : ""}`}>
      <button className="um-accordion-trigger" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="um-accordion-icon">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="um-accordion-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="um-accordion-content">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StepList = ({ steps }) => (
  <ol className="um-step-list">
    {steps.map((s, i) => (
      <li key={i} className="um-step-item">
        <span className="um-step-num">{i + 1}</span>
        <span className="um-step-text" dangerouslySetInnerHTML={{ __html: s }} />
      </li>
    ))}
  </ol>
);

const BulletList = ({ items }) => (
  <ul className="um-bullet-list">
    {items.map((item, i) => (
      <li key={i} className="um-bullet-item">
        <CheckCircle2 size={13} className="um-bullet-icon" />
        <span dangerouslySetInnerHTML={{ __html: item }} />
      </li>
    ))}
  </ul>
);

const TipBox = ({ children, type = "tip" }) => (
  <div className={`um-tip-box um-tip-${type}`}>
    <span className="um-tip-icon">
      {type === "tip"  && <Info size={13} />}
      {type === "warn" && <AlertCircle size={13} />}
      {type === "good" && <Star size={13} />}
    </span>
    <span>{children}</span>
  </div>
);

const CodeTable = ({ rows }) => (
  <div className="um-code-table">
    {rows.map(([code, desc], i) => (
      <div key={i} className="um-code-row">
        <code>{code}</code>
        <span>{desc}</span>
      </div>
    ))}
  </div>
);

const ShortcutRow = ({ keys, action }) => (
  <div className="um-shortcut-row">
    <div className="um-shortcut-keys">
      {keys.map((k, i) => (
        <span key={i} className="um-key-wrap">
          <kbd>{k}</kbd>
          {i < keys.length - 1 && <span className="um-key-plus">+</span>}
        </span>
      ))}
    </div>
    <span className="um-shortcut-action">{action}</span>
  </div>
);

const PageHeader = ({ icon, label, title, desc }) => (
  <div className="um-page-header">
    <div className="um-page-label">
      {icon}
      <span>{label}</span>
    </div>
    <h2 className="um-page-title">{title}</h2>
    {desc && <p className="um-page-desc" dangerouslySetInnerHTML={{ __html: desc }} />}
  </div>
);

/* ══════════════════════════════════════════════════════
   PAGE CONTENT COMPONENTS
══════════════════════════════════════════════════════ */

const PageHome = ({ navigate }) => (
  <div className="um-home-page">
    {/* Hero */}
    <div className="um-hero">
      <div className="um-hero-badge"><BookOpen size={11} /><span>User Guide</span></div>
      <h1 className="um-hero-title">Mastering BrightCode</h1>
      <p className="um-hero-desc">
        Everything you need to navigate, compete, and build inside the
        BrightCode ecosystem &mdash; from first login to faction domination.
      </p>
      <div className="um-hero-meta">
        <span><Globe size={13} />Comprehensive</span>
        <span><Zap size={13} />Always up to date</span>
        <span><Users size={13} />Community-driven</span>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="um-quick-actions">
      {[
        { icon: <Layout size={20} />, title: "Try Workspace", desc: "Code collaboratively in real time", path: "/workspace", tag: "Live" },
        { icon: <FileText size={20} />, title: "CodeVault",    desc: "Create and organise your notes",   path: "/codevault", tag: "Notes" },
        { icon: <Sword size={20} />,   title: "Join Faction", desc: "Team up and dominate together",    path: "/factions",  tag: "Compete" },
      ].map((card, i) => (
        <motion.div
          key={i}
          className="um-action-card"
          onClick={() => navigate(card.path)}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="um-action-top">
            <span className="um-action-icon">{card.icon}</span>
            <span className="um-action-tag">{card.tag}</span>
          </div>
          <h4 className="um-action-title">{card.title}</h4>
          <p className="um-action-desc">{card.desc}</p>
          <span className="um-action-arrow"><Play size={11} />Launch</span>
        </motion.div>
      ))}
    </div>

    {/* Section overview grid */}
    <div className="um-overview-section">
      <div className="um-overview-label">What&rsquo;s inside this guide</div>
      <div className="um-overview-grid">
        {SECTIONS.slice(1).map(s => (
          <div key={s.id} className="um-overview-card">
            <span className="um-overview-icon">{ICON_MAP[s.icon]}</span>
            <span className="um-overview-name">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PageGettingStarted = () => (
  <>
    <PageHeader
      icon={<Rocket size={14} />} label="Getting Started"
      title="Your First Steps"
      desc="New to BrightCode? Walk through registration, initial setup, and a quick tour of the dashboard so you can hit the ground running."
    />
    <AccordionItem title="Registration &amp; Login" defaultOpen>
      <StepList steps={[
        'Visit the BrightCode platform and click <strong>Sign Up</strong>.',
        'Fill in your username, email, and a strong password.',
        'Verify your email address via the confirmation link.',
        'Log in with your credentials to access the dashboard.',
      ]} />
      <TipBox type="tip">Passwords must be at least 8 characters and include a number.</TipBox>
    </AccordionItem>
    <AccordionItem title="First-Time Setup">
      <StepList steps={[
        'Complete your profile &mdash; add an avatar, bio, and social links from Settings.',
        'Choose your preferred programming languages in the stack section.',
        'Select a faction to join (you can change this later).',
        'Explore the platform by clicking through each section in the sidebar.',
      ]} />
      <TipBox type="good">Complete your profile to earn your first <strong>50 XP</strong> and unlock the Explorer badge.</TipBox>
    </AccordionItem>
    <AccordionItem title="Dashboard Overview">
      <BulletList items={[
        '<strong>Hub</strong> &mdash; Your personal stats, heatmap, XP bar, and activity feed.',
        '<strong>Workspace</strong> &mdash; Collaborative real-time code editor.',
        '<strong>CodeVault</strong> &mdash; Personal notes and knowledge base.',
        '<strong>Arcade</strong> &mdash; Competitive coding challenges and Logic Lab.',
        '<strong>Factions</strong> &mdash; Team-based competition and group activities.',
        '<strong>Leaderboard</strong> &mdash; Global rankings and Hall of Fame.',
        '<strong>Settings</strong> &mdash; Profile, theme, security, and preferences.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Earning Your First XP">
      <BulletList items={[
        'Complete your profile setup &mdash; <strong>+50 XP</strong>.',
        'Join a faction &mdash; <strong>+30 XP</strong>.',
        'Create your first CodeVault note &mdash; <strong>+20 XP</strong>.',
        'Open the Workspace and write code &mdash; <strong>+20 XP</strong>.',
        'Solve your first Arcade challenge &mdash; <strong>+100 XP</strong>.',
      ]} />
    </AccordionItem>
  </>
);

const PageAccount = () => (
  <>
    <PageHeader
      icon={<Shield size={14} />} label="Account Management"
      title="Profile &amp; Security"
      desc="Keep your account secure and your profile up to date. BrightCode gives you full control over your identity, privacy, and session management."
    />
    <AccordionItem title="Editing Your Profile" defaultOpen>
      <StepList steps={[
        'Navigate to <strong>Settings</strong> from the top-right avatar or the sidebar.',
        'Update your username, bio, GitHub handle, and LeetCode username.',
        'Choose an avatar &mdash; avatars unlock based on your current rank.',
        'Pick a profile banner that matches your style.',
        'Add your tech stack tags so others know what you code in.',
        'Click <strong>Save Changes</strong> to apply all updates.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Theme &amp; Appearance">
      <BulletList items={[
        '<strong>Scarlet Flare</strong> &mdash; The default high-energy crimson theme.',
        '<strong>Creeper Craft</strong> &mdash; Pixel-art Minecraft-inspired theme with Press Start 2P font.',
        '<strong>Night City</strong> &mdash; Cyberpunk neon-cyan theme with Orbitron font.',
        'Font selector (Scarlet Flare only): Poppins, Inter, Outfit, Montserrat.',
        'Theme preferences persist across sessions via localStorage.',
      ]} />
      <TipBox type="tip">The Creeper Craft and Night City themes change the entire UI font and visual language.</TipBox>
    </AccordionItem>
    <AccordionItem title="Security Settings">
      <BulletList items={[
        '<strong>Change Password</strong> &mdash; Update from Settings &rarr; Security tab.',
        'Always use a unique password not used on other sites.',
        'Sessions expire automatically after 7 days of inactivity.',
      ]} />
      <TipBox type="warn">Never share your password or session tokens with anyone.</TipBox>
    </AccordionItem>
    <AccordionItem title="Account Ranks &amp; Progression">
      <BulletList items={[
        '<strong>Rank 1 (0&ndash;499 XP)</strong> &mdash; Recruit. Basic avatars unlocked.',
        '<strong>Rank 2 (500&ndash;1,999 XP)</strong> &mdash; Operative. Cyber banner unlocked.',
        '<strong>Rank 3 (2,000&ndash;4,999 XP)</strong> &mdash; Specialist. Toxic banner unlocked.',
        '<strong>Rank 4 (5,000&ndash;9,999 XP)</strong> &mdash; Elite. Void banner unlocked.',
        '<strong>Rank 5 (10,000+ XP)</strong> &mdash; Legend. Golden Crown banner unlocked.',
      ]} />
    </AccordionItem>
  </>
);

const PageWorkspace = () => (
  <>
    <PageHeader
      icon={<Layout size={14} />} label="Collaborative Workspace"
      title="Build Together in Real Time"
      desc="BrightCode&rsquo;s signature IDE-like environment. Sub-10ms latency sync, multi-language support, and integrated team communication &mdash; all in one place."
    />
    <AccordionItem title="Creating a Workspace" defaultOpen>
      <StepList steps={[
        'Click <strong>Workspace</strong> in the main navigation sidebar.',
        'Choose a room name and set it as private or public.',
        'Share the room link or invite collaborators by username.',
        'Select your preferred language from the language picker in the toolbar.',
        'Start coding &mdash; collaborators see your cursor in real time.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Real-Time Collaboration Features">
      <BulletList items={[
        '<strong>Live Cursors</strong> &mdash; See every collaborator&rsquo;s cursor and selection live.',
        '<strong>Synchronized Edits</strong> &mdash; Sub-10ms latency via WebSocket / Socket.io.',
        '<strong>Built-in Chat</strong> &mdash; Message your team without leaving the editor.',
        '<strong>Presence Indicators</strong> &mdash; See who is currently in the room.',
        '<strong>Multi-File Support</strong> &mdash; Create and switch between multiple files.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Supported Languages">
      <BulletList items={[
        'JavaScript / TypeScript, Python, Java, C++, C',
        'Go, Rust, Ruby, PHP, Swift',
        'HTML, CSS, SQL, Bash / Shell',
        'JSON, YAML, Markdown',
      ]} />
      <TipBox type="tip">Syntax highlighting and auto-indentation apply automatically when you select a language.</TipBox>
    </AccordionItem>
    <AccordionItem title="Workspace Management">
      <BulletList items={[
        '<strong>Room Code</strong> &mdash; Share the auto-generated room code to let others join.',
        '<strong>Leave Room</strong> &mdash; Disconnect cleanly; your code remains until session expires.',
        '<strong>Copy Code</strong> &mdash; One-click copy of the entire editor contents.',
        '<strong>Run Code</strong> &mdash; Execute code directly inside the browser (select languages).',
        '<strong>Warp Drive</strong> &mdash; Save a version snapshot of the current code.',
      ]} />
    </AccordionItem>
  </>
);

const PageCodeVault = () => (
  <>
    <PageHeader
      icon={<FileText size={14} />} label="CodeVault Notes System"
      title="Your Personal Knowledge Base"
      desc="A full-featured notes system built right into BrightCode. Organise your thoughts, document your code, and build a personal knowledge base with rich formatting and diagrams."
    />
    <AccordionItem title="Creating &amp; Managing Notes" defaultOpen>
      <StepList steps={[
        'Click <strong>CodeVault</strong> in the main navigation.',
        'Click <strong>+ New Note</strong> or press <kbd>Ctrl+N</kbd>.',
        'Give the note a meaningful title by clicking the title area.',
        'Select a folder (or create one) to organise the note.',
        'Add tags for easy search and filtering.',
        'Notes auto-save &mdash; manual save available with <kbd>Ctrl+S</kbd>.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Folder &amp; Organisation System">
      <BulletList items={[
        '<strong>Folders</strong> &mdash; Create nested folder structures.',
        '<strong>Drag &amp; Drop</strong> &mdash; Reorganise notes by dragging between folders.',
        '<strong>Favorites</strong> &mdash; Star any note to pin it to the top.',
        '<strong>Trash</strong> &mdash; Deleted notes go to trash. Restore within 30 days.',
        '<strong>Rename</strong> &mdash; Right-click any note or folder for the context menu.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Search &amp; Discovery">
      <BulletList items={[
        '<strong>Full-Text Search</strong> &mdash; Press <kbd>Ctrl+Shift+F</kbd> to search all note content.',
        '<strong>Filter by Tag</strong> &mdash; Click any tag chip to show matching notes.',
        '<strong>Filter by Date</strong> &mdash; Sort by creation or last-modified date.',
        '<strong>Fuzzy Search</strong> &mdash; Results appear even with partial matches.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Import &amp; Export">
      <BulletList items={[
        'Export any note as a <strong>.md</strong> (Markdown) or <strong>.txt</strong> file.',
        'Copy note content to clipboard with one click.',
        'Import existing Markdown files by pasting content into a new note.',
      ]} />
    </AccordionItem>
  </>
);

const PageRichEditor = () => (
  <>
    <PageHeader
      icon={<BookOpen size={14} />} label="Rich Text Editor"
      title="Write Without Limits"
      desc="Full Markdown support, inline formatting, media embeds, and a powerful toolbar &mdash; everything you need to write beautiful, structured notes."
    />
    <AccordionItem title="Markdown Syntax Reference" defaultOpen>
      <CodeTable rows={[
        ["# Heading",   "Heading 1 (## for H2, up to ######)"],
        ["**text**",    "Bold text"],
        ["*text*",      "Italic text"],
        ["~~text~~",    "Strikethrough"],
        ["`code`",      "Inline code"],
        ["```lang",     "Fenced code block"],
        ["> text",      "Blockquote"],
        ["- item",      "Bullet list item"],
        ["1. item",     "Numbered list item"],
        ["[ ] task",    "Checkbox / task item"],
        ["---",         "Horizontal rule"],
        ["[text](url)", "Hyperlink"],
        ["![alt](url)", "Embedded image"],
      ]} />
    </AccordionItem>
    <AccordionItem title="Toolbar Functions">
      <BulletList items={[
        '<strong>Text Style</strong> &mdash; Bold, italic, underline, strikethrough.',
        '<strong>Headings</strong> &mdash; H1&ndash;H6 dropdown with size preview.',
        '<strong>Lists</strong> &mdash; Bullet, numbered, and task (checkbox) lists.',
        '<strong>Alignment</strong> &mdash; Left, centre, right, and justify.',
        '<strong>Colours</strong> &mdash; Text colour and highlight colour pickers.',
        '<strong>Links &amp; Images</strong> &mdash; Insert hyperlinks and image URLs.',
        '<strong>Code Block</strong> &mdash; Syntax-highlighted code block.',
        '<strong>Diagram</strong> &mdash; Launch the embedded diagram editor.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Editor Keyboard Shortcuts">
      <CodeTable rows={[
        ["Ctrl+B",       "Bold"],
        ["Ctrl+I",       "Italic"],
        ["Ctrl+U",       "Underline"],
        ["Ctrl+Z",       "Undo"],
        ["Ctrl+Y",       "Redo"],
        ["Ctrl+S",       "Save note"],
        ["Ctrl+N",       "New note"],
        ["Ctrl+Shift+C", "Code block"],
        ["Ctrl+E",       "Toggle Markdown preview"],
      ]} />
    </AccordionItem>
  </>
);

const PageDiagrams = () => (
  <>
    <PageHeader
      icon={<Image size={14} />} label="Diagram Creation"
      title="Visualise Your Ideas"
      desc="The integrated diagram editor lets you draw flowcharts, system diagrams, and sketches directly inside your notes &mdash; no external tools needed."
    />
    <AccordionItem title="Creating a Diagram" defaultOpen>
      <StepList steps={[
        'While editing a note, click the <strong>Diagram</strong> button in the toolbar.',
        'The canvas editor opens in a modal over your note.',
        'Use the left-side tool panel to select shapes, arrows, or the text tool.',
        'Draw and connect elements to build your diagram.',
        'Style elements using the colour picker and stroke controls.',
        'Click <strong>Save to Note</strong> to embed the diagram as an image.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Available Drawing Tools">
      <BulletList items={[
        '<strong>Select Tool</strong> &mdash; Click and drag to select, move, or resize.',
        '<strong>Rectangle &amp; Circle</strong> &mdash; Basic shapes with fill and stroke.',
        '<strong>Arrow &amp; Line</strong> &mdash; Directional connectors for flow diagrams.',
        '<strong>Text Label</strong> &mdash; Add annotations and descriptions.',
        '<strong>Free Draw</strong> &mdash; Freehand sketching for quick concepts.',
        '<strong>Eraser</strong> &mdash; Remove individual elements.',
        '<strong>Zoom</strong> &mdash; Mouse wheel or pinch to zoom in and out.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Editing &amp; Exporting">
      <BulletList items={[
        'Click any embedded diagram, then the <strong>pencil icon</strong> to re-open the editor.',
        '<strong>PNG Export</strong> &mdash; High-quality transparent-background PNG.',
        '<strong>Copy to Clipboard</strong> &mdash; Paste the diagram image anywhere.',
        '<strong>Download</strong> &mdash; Save the diagram locally as SVG or PNG.',
      ]} />
    </AccordionItem>
  </>
);

const PageAI = () => (
  <>
    <PageHeader
      icon={<Bot size={14} />} label="AI Assistant — The Sentinel"
      title="Your Intelligent Coding Partner"
      desc="The Sentinel is BrightCode&rsquo;s context-aware AI assistant. It reads your current file, understands your code, and helps you debug, optimise, and learn &mdash; all without leaving the editor."
    />
    <AccordionItem title="Accessing the Sentinel" defaultOpen>
      <StepList steps={[
        'Click the <strong>Bot icon</strong> in the bottom-right corner of any page.',
        'The Sentinel chat window opens with a greeting.',
        'The assistant automatically reads your current editor context.',
        'Type your question or describe the problem.',
        'Receive targeted suggestions, fixes, and step-by-step explanations.',
      ]} />
    </AccordionItem>
    <AccordionItem title="What the Sentinel Can Do">
      <BulletList items={[
        '<strong>Code Explanation</strong> &mdash; Break down complex snippets in plain language.',
        '<strong>Bug Detection</strong> &mdash; Identify logic errors and off-by-one mistakes.',
        '<strong>Fix Suggestions</strong> &mdash; Receive corrected code with explanation.',
        '<strong>Optimisation</strong> &mdash; Suggestions for better time / space complexity.',
        '<strong>Documentation</strong> &mdash; Auto-generate JSDoc, docstrings, and comments.',
        '<strong>Learning Paths</strong> &mdash; Recommend next topics based on your activity.',
        '<strong>Best Practices</strong> &mdash; Code style, design patterns, naming conventions.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Tips for Best Results">
      <BulletList items={[
        'Be specific &mdash; describe the <em>exact</em> behaviour you expect vs. what is happening.',
        'Paste the relevant code snippet directly into your message.',
        'Follow up with &ldquo;why?&rdquo; for deeper explanations.',
        'Use it to learn, not just to copy-paste answers.',
      ]} />
      <TipBox type="good">The Sentinel remembers earlier messages in the same session for context-aware follow-ups.</TipBox>
    </AccordionItem>
  </>
);

const PageVersionControl = () => (
  <>
    <PageHeader
      icon={<GitBranch size={14} />} label="Version Control — Warp Drive"
      title="Time-Travel Through Your Code"
      desc="Warp Drive is BrightCode&rsquo;s built-in version control system. Create temporal snapshots, compare versions side by side, and restore any previous state with a single click."
    />
    <AccordionItem title="Creating Snapshots" defaultOpen>
      <StepList steps={[
        'In the Workspace editor, click the <strong>Warp Drive</strong> button in the toolbar.',
        'Enter an optional description for the snapshot.',
        'Click <strong>Save Snapshot</strong> to capture the current state.',
        'The snapshot appears in the timeline panel.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Restoring a Previous State">
      <StepList steps={[
        'Open the Warp Drive panel from the toolbar.',
        'Browse the snapshot timeline &mdash; each entry shows description and timestamp.',
        'Click any snapshot to preview the code at that point.',
        'Click <strong>Restore</strong> to revert the editor to that snapshot.',
      ]} />
      <TipBox type="warn">Restoring overwrites the current code. Save a new snapshot first if you want to preserve current work.</TipBox>
    </AccordionItem>
    <AccordionItem title="Advanced Features">
      <BulletList items={[
        '<strong>Diff View</strong> &mdash; Side-by-side comparison of any two snapshots.',
        '<strong>Auto-Snapshot</strong> &mdash; The system captures automatically every 10 minutes.',
        '<strong>Description Search</strong> &mdash; Filter snapshots by keyword.',
        '<strong>Export</strong> &mdash; Download any snapshot as a standalone file.',
      ]} />
    </AccordionItem>
  </>
);

const PageActivity = () => (
  <>
    <PageHeader
      icon={<Activity size={14} />} label="Activity Tracking"
      title="Measure Your Growth"
      desc="BrightCode tracks your coding activity across every feature and surfaces insights to help you build better habits and level up faster."
    />
    <AccordionItem title="Heatmap Visualisation" defaultOpen>
      <BulletList items={[
        '<strong>Daily Activity</strong> &mdash; Each square represents one day of coding.',
        '<strong>Colour Intensity</strong> &mdash; Darker = more XP earned that day.',
        '<strong>Hover Tooltip</strong> &mdash; Hover any square to see exact XP and date.',
        '<strong>Streak Counter</strong> &mdash; Consecutive active days tracked in real time.',
      ]} />
    </AccordionItem>
    <AccordionItem title="XP System &amp; Level Progression">
      <BulletList items={[
        '<strong>Arcade challenges</strong> &mdash; 100&ndash;500 XP depending on difficulty.',
        '<strong>CodeVault notes</strong> &mdash; 10 XP per note created.',
        '<strong>Workspace sessions</strong> &mdash; 5 XP per active session.',
        '<strong>Profile completion</strong> &mdash; 50 XP one-time bonus.',
        '<strong>Faction battles</strong> &mdash; Up to 1,000 XP per event.',
        'XP thresholds: 0 / 500 / 2,000 / 5,000 / 10,000 for Ranks 1&ndash;5.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Leaderboard &amp; Rankings">
      <BulletList items={[
        'Global leaderboard ranks all users by total accumulated XP.',
        'Hall of Fame highlights the top 3 users with special visual treatment.',
        'Faction rankings update in real time based on combined member XP.',
        'Your own rank is shown at the top of the Leaderboard page.',
      ]} />
    </AccordionItem>
  </>
);

const PageFactions = () => (
  <>
    <PageHeader
      icon={<Sword size={14} />} label="Factions &amp; Competition"
      title="Join Forces, Dominate Together"
      desc="Factions are specialised developer groups with their own identity, goals, and competitive standing. Join one to unlock exclusive resources, group challenges, and faction-wide leaderboards."
    />
    <AccordionItem title="Joining a Faction" defaultOpen>
      <StepList steps={[
        'Navigate to <strong>Factions</strong> from the sidebar.',
        'Browse all available factions and view their descriptions and member counts.',
        'Click <strong>Join</strong> on the faction that matches your interests.',
        'Once joined, you are immediately added to faction chat and group boards.',
      ]} />
      <TipBox type="tip">You can only be in one faction at a time. Switching has a 7-day cooldown.</TipBox>
    </AccordionItem>
    <AccordionItem title="Faction Features">
      <BulletList items={[
        '<strong>Faction Hub</strong> &mdash; Private landing page with stats and news.',
        '<strong>Member Roster</strong> &mdash; See all members and their ranks.',
        '<strong>Faction XP</strong> &mdash; Your contributions add to the faction&rsquo;s total.',
        '<strong>Group Challenges</strong> &mdash; Time-limited events exclusive to your faction.',
        '<strong>Faction Chat</strong> &mdash; Private communication channel.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Code Wars Arena">
      <StepList steps={[
        'Go to <strong>Arcade &rarr; Code Wars</strong> from the navigation.',
        'Create a new battle room or join one with a room code.',
        'Both players receive the same problem statement simultaneously.',
        'First to submit a passing solution wins the match.',
        'XP and ranking points are awarded instantly after the match ends.',
      ]} />
      <TipBox type="good">Practice in solo mode first &mdash; the Arcade Logic Lab has 200+ problems to sharpen your skills.</TipBox>
    </AccordionItem>
    <AccordionItem title="Competitive Events &amp; Rewards">
      <BulletList items={[
        '<strong>Weekly Challenges</strong> &mdash; Time-limited events with bonus XP rewards.',
        '<strong>Season Rankings</strong> &mdash; Faction standings reset each season.',
        '<strong>Trophies &amp; Badges</strong> &mdash; Earned by top-performing individuals and factions.',
        '<strong>Exclusive Banners</strong> &mdash; Rank-locked profile banners for dedicated competitors.',
      ]} />
    </AccordionItem>
  </>
);

const PageShortcuts = () => (
  <>
    <PageHeader
      icon={<Keyboard size={14} />} label="Keyboard Shortcuts"
      title="Move at the Speed of Thought"
      desc="Master these shortcuts to navigate BrightCode without ever reaching for the mouse."
    />
    <div className="um-shortcuts-grid">
      {[
        { title: "Global", rows: [
          [["Ctrl","Shift","P"], "Command palette"],
          [["Ctrl","K"],        "Quick search"],
          [["Ctrl",","],        "Open Settings"],
          [["Ctrl","Shift","M"],"Toggle sidebar"],
          [["F1"],              "Open Help / User Guide"],
        ]},
        { title: "Editor", rows: [
          [["Ctrl","N"],  "New note / file"],
          [["Ctrl","S"],  "Save"],
          [["Ctrl","F"],  "Find in file"],
          [["Ctrl","H"],  "Find & Replace"],
          [["Ctrl","Z"],  "Undo"],
          [["Ctrl","Y"],  "Redo"],
        ]},
        { title: "Formatting", rows: [
          [["Ctrl","B"],        "Bold"],
          [["Ctrl","I"],        "Italic"],
          [["Ctrl","U"],        "Underline"],
          [["Ctrl","E"],        "Toggle preview"],
          [["Ctrl","Shift","C"],"Code block"],
          [["Ctrl","L"],        "Insert link"],
        ]},
        { title: "Navigation", rows: [
          [["Ctrl","1"],   "Go to Workspace"],
          [["Ctrl","2"],   "Go to Arcade"],
          [["Ctrl","3"],   "Go to CodeVault"],
          [["Ctrl","4"],   "Go to Factions"],
          [["Ctrl","Tab"], "Next open tab"],
          [["Ctrl","W"],   "Close current tab"],
        ]},
      ].map((g, i) => (
        <div key={i} className="um-shortcuts-group">
          <div className="um-shortcuts-group-title">{g.title}</div>
          {g.rows.map(([keys, action], j) => (
            <ShortcutRow key={j} keys={keys} action={action} />
          ))}
        </div>
      ))}
    </div>
  </>
);

const PageTroubleshooting = () => (
  <>
    <PageHeader
      icon={<LifeBuoy size={14} />} label="Troubleshooting"
      title="Common Issues &amp; Fixes"
      desc="Running into a problem? Most issues have a quick fix. Work through the steps below before reaching out to support."
    />
    <AccordionItem title="Editor or Page Not Loading" defaultOpen>
      <StepList steps={[
        'Hard-refresh the page: <kbd>Ctrl+Shift+R</kbd> (Windows) or <kbd>Cmd+Shift+R</kbd> (Mac).',
        'Clear your browser cache and cookies for this site.',
        'Try disabling browser extensions one by one &mdash; ad blockers are a common cause.',
        'Open DevTools (<kbd>F12</kbd>) &rarr; Console tab for error messages.',
        'Try a different browser to isolate whether it&rsquo;s browser-specific.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Real-Time Sync Not Working">
      <StepList steps={[
        'Check your internet connection is stable.',
        'Refresh the Workspace page &mdash; the socket connection re-establishes automatically.',
        'Ensure your network does not block WebSocket connections (port 443).',
        'If on a corporate network, try a mobile hotspot.',
      ]} />
      <TipBox type="tip">The connection indicator in the toolbar shows green (connected) or red (disconnected).</TipBox>
    </AccordionItem>
    <AccordionItem title="Login / Authentication Issues">
      <StepList steps={[
        'Double-check your email and password for typos.',
        'Use <strong>Forgot Password</strong> if you cannot recall your credentials.',
        'Clear cookies for the BrightCode domain if stuck in a redirect loop.',
        'Try incognito / private browsing mode to rule out cached session conflicts.',
      ]} />
    </AccordionItem>
    <AccordionItem title="XP / Activity Not Updating">
      <BulletList items={[
        'XP updates happen server-side. Wait up to 30 seconds then refresh.',
        'Ensure you are logged in &mdash; guest activity is not tracked.',
        'If a challenge succeeded but no XP appeared, check your profile page.',
      ]} />
    </AccordionItem>

    <div className="um-support-card">
      <div className="um-support-icon"><LifeBuoy size={24} /></div>
      <div className="um-support-body">
        <h4>Still stuck?</h4>
        <p>Reach out via <strong>support@codebright.com</strong> or join the community Discord for real-time help.</p>
      </div>
      <a href="mailto:support@codebright.com" className="um-support-btn">
        Contact Support <ExternalLink size={12} />
      </a>
    </div>
  </>
);

/* ── Page map ── */
const PAGE_COMPONENTS = {
  "home":             PageHome,
  "getting-started":  PageGettingStarted,
  "account":          PageAccount,
  "workspace":        PageWorkspace,
  "codevault":        PageCodeVault,
  "rich-editor":      PageRichEditor,
  "diagrams":         PageDiagrams,
  "ai-assistant":     PageAI,
  "version-control":  PageVersionControl,
  "activity":         PageActivity,
  "factions":         PageFactions,
  "shortcuts":        PageShortcuts,
  "troubleshooting":  PageTroubleshooting,
};

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const UserModule = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user }   = useAuth();

  const [activeId,     setActiveId]     = useState("home");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [direction,    setDirection]    = useState(1); // 1 = forward, -1 = back

  const handleBack = () => {
    const returnTo  = location.state?.returnTo;
    const activeTab = location.state?.activeTab || "details";
    if (returnTo)  navigate(returnTo, { state: { activeTab } });
    else if (user) navigate("/settings", { state: { activeTab: "details" } });
    else           navigate("/");
  };

  const activeIndex = SECTIONS.findIndex(s => s.id === activeId);

  const goTo = (id) => {
    const newIndex = SECTIONS.findIndex(s => s.id === id);
    setDirection(newIndex >= activeIndex ? 1 : -1);
    setActiveId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    if (activeIndex < SECTIONS.length - 1) {
      setDirection(1);
      setActiveId(SECTIONS[activeIndex + 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goPrev = () => {
    if (activeIndex > 0) {
      setDirection(-1);
      setActiveId(SECTIONS[activeIndex - 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const filteredSections = SECTIONS.filter(s =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ActivePage = PAGE_COMPONENTS[activeId] || PageHome;

  const variants = {
    enter:   (d) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center:  { opacity: 1, x: 0 },
    exit:    (d) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  };

  return (
    <div className="um-page">
      <div className="um-layout">

        {/* ── Sidebar ── */}
        <aside className="um-sidebar">
          <button type="button" className="um-back-btn" onClick={handleBack}>
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>

          <div className="um-sidebar-search">
            <Search size={13} />
            <input
              type="text"
              placeholder="Search sections..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="um-sidebar-label">Contents</div>
          <nav className="um-sidebar-nav">
            {filteredSections.map(sec => (
              <button
                key={sec.id}
                className={`um-nav-btn ${activeId === sec.id ? "active" : ""}`}
                onClick={() => goTo(sec.id)}
              >
                <span className="um-nav-icon">{ICON_MAP[sec.icon]}</span>
                <span className="um-nav-text">{sec.label}</span>
              </button>
            ))}
          </nav>

          <div className="um-sidebar-footer">
            <span className="um-sidebar-version">v2.1 &mdash; June 2026</span>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="um-main">

          {/* Mobile back */}
          <button type="button" className="um-back-mobile" onClick={handleBack}>
            <ArrowLeft size={15} />Back
          </button>

          {/* Progress bar */}
          <div className="um-progress-bar">
            <div
              className="um-progress-fill"
              style={{ width: `${((activeIndex + 1) / SECTIONS.length) * 100}%` }}
            />
          </div>

          {/* Page counter */}
          <div className="um-page-counter">
            <span>{activeIndex + 1}</span>
            <span className="um-counter-sep">/</span>
            <span className="um-counter-total">{SECTIONS.length}</span>
          </div>

          {/* Animated page content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeId}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="um-page-content"
            >
              <ActivePage navigate={navigate} />
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next navigation */}
          <div className="um-page-nav">
            <button
              className="um-page-nav-btn um-prev"
              onClick={goPrev}
              disabled={activeIndex === 0}
            >
              <ArrowLeft size={15} />
              <div className="um-nav-btn-text">
                <span className="um-nav-btn-label">Previous</span>
                <span className="um-nav-btn-title">
                  {activeIndex > 0 ? SECTIONS[activeIndex - 1].label : "—"}
                </span>
              </div>
            </button>

            {/* Dot indicators */}
            <div className="um-dot-nav">
              {SECTIONS.map((s, i) => (
                <button
                  key={s.id}
                  className={`um-dot ${activeId === s.id ? "active" : ""}`}
                  onClick={() => goTo(s.id)}
                  title={s.label}
                />
              ))}
            </div>

            <button
              className="um-page-nav-btn um-next"
              onClick={goNext}
              disabled={activeIndex === SECTIONS.length - 1}
            >
              <div className="um-nav-btn-text">
                <span className="um-nav-btn-label">Next</span>
                <span className="um-nav-btn-title">
                  {activeIndex < SECTIONS.length - 1 ? SECTIONS[activeIndex + 1].label : "—"}
                </span>
              </div>
              <ArrowRight size={15} />
            </button>
          </div>

        </main>
      </div>
    </div>
  );
};

export default UserModule;
