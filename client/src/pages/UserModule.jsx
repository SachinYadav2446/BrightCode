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
  { id: "workspace",       icon: "Layout",    label: "Collaborative Workspace" },
  { id: "codevault",       icon: "FileText",  label: "CodeVault Notes"         },
  { id: "arcade",          icon: "Zap",       label: "Arcade & Challenges"     },
  { id: "factions",        icon: "Sword",     label: "Factions & Code Wars"    },
  { id: "nexus",           icon: "Users",     label: "The Nexus (SOS Board)"   },
  { id: "proctor",         icon: "BookOpen",  label: "Proctor Arena"           },
  { id: "ai-assistant",    icon: "Bot",       label: "Pal AI Chatbot"          },
  { id: "troubleshooting", icon: "LifeBuoy",  label: "Troubleshooting"         },
];

const ICON_MAP = {
  Home:      <Home      size={15} />,
  Rocket:    <Rocket    size={15} />,
  Shield:    <Shield    size={15} />,
  Layout:    <Layout    size={15} />,
  FileText:  <FileText  size={15} />,
  Zap:       <Zap       size={15} />,
  Sword:     <Sword     size={15} />,
  Users:     <Users     size={15} />,
  BookOpen:  <BookOpen  size={15} />,
  Bot:       <Bot       size={15} />,
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
        'Log in with your credentials or use GitHub/Google OAuth to access the dashboard.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Dashboard Overview">
      <BulletList items={[
        '<strong>Hub</strong> &mdash; Your personal dashboard.',
        '<strong>Workspace</strong> &mdash; Collaborative real-time code editor.',
        '<strong>CodeVault</strong> &mdash; Personal notes and knowledge base.',
        '<strong>Arcade</strong> &mdash; Competitive coding challenges.',
        '<strong>Factions</strong> &mdash; Team-based competition and group activities.',
        '<strong>The Nexus</strong> &mdash; Mentorship and SOS directory.',
        '<strong>Leaderboard</strong> &mdash; Global rankings and Hall of Fame.',
      ]} />
    </AccordionItem>
  </>
);

const PageAccount = () => (
  <>
    <PageHeader
      icon={<Shield size={14} />} label="Account Management"
      title="Profile &amp; Settings"
      desc="Keep your account secure and your profile up to date."
    />
    <AccordionItem title="Editing Your Profile" defaultOpen>
      <StepList steps={[
        'Navigate to <strong>Settings</strong> from the top-right avatar.',
        'Update your username, bio, and social links.',
        'Click <strong>Save Changes</strong> to apply all updates.',
      ]} />
    </AccordionItem>
  </>
);

const PageWorkspace = () => (
  <>
    <PageHeader
      icon={<Layout size={14} />} label="Collaborative Workspace"
      title="Build Together in Real Time"
      desc="BrightCode&rsquo;s signature IDE-like environment. Real-time sync, multi-language support, and integrated team communication &mdash; all in one place."
    />
    <AccordionItem title="Creating a Workspace" defaultOpen>
      <StepList steps={[
        'Click <strong>Workspace</strong> in the main navigation sidebar.',
        'Enter a Session ID and join.',
        'Share the Session ID with your team.',
        'Select your preferred language from the dropdown.',
        'Start coding collaboratively in real-time.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Real-Time Collaboration Features">
      <BulletList items={[
        '<strong>Live Editing</strong> &mdash; Code synchronises across all connected clients instantly.',
        '<strong>Language Support</strong> &mdash; Write code in Python, JavaScript, C++, Java, and more.',
        '<strong>Theme Support</strong> &mdash; Monaco editor with syntax highlighting.',
      ]} />
    </AccordionItem>
  </>
);

const PageCodeVault = () => (
  <>
    <PageHeader
      icon={<FileText size={14} />} label="CodeVault Notes System"
      title="Your Personal Knowledge Base"
      desc="A notes system built right into BrightCode. Organise your thoughts and document your code."
    />
    <AccordionItem title="Creating &amp; Managing Notes" defaultOpen>
      <StepList steps={[
        'Click <strong>CodeVault</strong> in the main navigation.',
        'Create folders to organise your notes.',
        'Click inside a folder to create a new Markdown note.',
        'Notes support full Markdown syntax including code blocks and links.',
      ]} />
    </AccordionItem>
  </>
);

const PageArcade = () => (
  <>
    <PageHeader
      icon={<Zap size={14} />} label="Arcade &amp; Challenges"
      title="Sharpen Your Coding Skills"
      desc="The Arcade is your training ground. Solve challenges, learn new algorithms, and earn XP."
    />
    <AccordionItem title="Arcade Modes" defaultOpen>
      <BulletList items={[
        '<strong>Coding Challenges</strong> &mdash; Solve algorithm problems with automatic test cases.',
        '<strong>Quizzes</strong> &mdash; Test your knowledge in specific programming languages.',
        '<strong>Interactive Labs</strong> &mdash; Learn concepts step-by-step.',
      ]} />
    </AccordionItem>
  </>
);

const PageFactions = () => (
  <>
    <PageHeader
      icon={<Sword size={14} />} label="Factions &amp; Code Wars"
      title="Join Forces, Dominate Together"
      desc="Factions are specialised developer groups with their own identity. Join one to unlock exclusive resources and compete in Code Wars."
    />
    <AccordionItem title="Joining a Faction" defaultOpen>
      <StepList steps={[
        'Navigate to <strong>Factions</strong> from the sidebar.',
        'Browse available factions (e.g. Byte Builders, Cyber Syndicate).',
        'Join a faction to participate in their specific activities.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Code Wars">
      <StepList steps={[
        'Enter the Code Wars arena from your Faction page.',
        'Challenge other factions to real-time coding battles.',
        'The first team to solve the algorithm wins the match.',
      ]} />
    </AccordionItem>
  </>
);

const PageNexus = () => (
  <>
    <PageHeader
      icon={<Users size={14} />} label="The Nexus (SOS Board)"
      title="Mentorship &amp; SOS Directory"
      desc="Stuck on a bug? Transmit an SOS signal to the Nexus. Experienced developers can intercept your ticket and mentor you in real time."
    />
    <AccordionItem title="Creating an SOS Ticket" defaultOpen>
      <StepList steps={[
        'Click <strong>The Nexus</strong> in the navigation.',
        'Click <strong>Create SOS Ticket</strong>.',
        'Provide a title, description of the bug, language, and tags.',
        'Submit the ticket. It will appear on the global board as OPEN.',
      ]} />
    </AccordionItem>
    <AccordionItem title="Mentoring Others">
      <BulletList items={[
        'Browse OPEN tickets on the Nexus board.',
        'Click <strong>Mentor User</strong> to accept a ticket and move it to IN PROGRESS.',
        'Connect with the user to help them resolve their issue.',
        'Once solved, the author can mark the ticket as RESOLVED.',
      ]} />
    </AccordionItem>
  </>
);

const PageProctor = () => (
  <>
    <PageHeader
      icon={<BookOpen size={14} />} label="Proctor Arena"
      title="Interview Preparation &amp; Proctoring"
      desc="Simulate real-world technical interviews with the Proctor Arena."
    />
    <AccordionItem title="Taking an Interview" defaultOpen>
      <StepList steps={[
        'Enter a unique Proctor Room ID.',
        'Allow camera and microphone permissions for the proctoring environment.',
        'Solve the assigned coding challenges under time constraints.',
        'Your code and behaviour are recorded for review.',
      ]} />
    </AccordionItem>
  </>
);

const PageAI = () => (
  <>
    <PageHeader
      icon={<Bot size={14} />} label="Pal AI Chatbot"
      title="Your Intelligent Coding Partner"
      desc="Meet Pal, BrightCode's built-in AI assistant. Pal is 100% API-free and expands its knowledge based on the platform's knowledge base."
    />
    <AccordionItem title="Chatting with Pal" defaultOpen>
      <StepList steps={[
        'Click the <strong>Pal Chatbot</strong> icon in the bottom right corner.',
        'Ask questions about BrightCode features, coding concepts, or general help.',
        'Pal uses the brightcode_knowledge.json file to provide accurate, platform-specific answers.',
      ]} />
    </AccordionItem>
  </>
);

const PageTroubleshooting = () => (
  <>
    <PageHeader
      icon={<LifeBuoy size={14} />} label="Troubleshooting"
      title="Common Issues &amp; Fixes"
      desc="Running into a problem? Most issues have a quick fix."
    />
    <AccordionItem title="Editor or Page Not Loading" defaultOpen>
      <StepList steps={[
        'Hard-refresh the page: <kbd>Ctrl+Shift+R</kbd> (Windows) or <kbd>Cmd+Shift+R</kbd> (Mac).',
        'Clear your browser cache and cookies.',
      ]} />
    </AccordionItem>
    <div className="um-support-card">
      <div className="um-support-icon"><LifeBuoy size={24} /></div>
      <div className="um-support-body">
        <h4>Still stuck?</h4>
        <p>Reach out via <strong>codebrightlim@gmail.com</strong> or join the community Discord.</p>
      </div>
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
  "arcade":           PageArcade,
  "factions":         PageFactions,
  "nexus":            PageNexus,
  "proctor":          PageProctor,
  "ai-assistant":     PageAI,
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
