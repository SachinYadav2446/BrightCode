import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Landing from './pages/Landing';
import EditorPage from './pages/EditorPage';
import Auth from './pages/Auth';
import Settings from './pages/Settings';
import Arcade from './pages/Arcade';
import Leaderboard from './pages/Leaderboard';
import Factions from './pages/Factions';
import Library from './pages/Library';
import Workspace from './pages/Workspace';
import CodeVault from './pages/CodeVault';
import CodeWarsArena from './pages/CodeWarsArena';
import BattleArena from './pages/BattleArena';
import UserModule from './pages/UserModule';
import UserProfile from './pages/UserProfile';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import { useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;
  return children;
};

const LandingRoute = () => {
  const { user, loading, sessionValid } = useAuth();
  if (loading) return null;
  // If user is logged in and session is valid (within 1 week), redirect to hub
  if (user && sessionValid) return <Navigate to="/hub" />;
  // Otherwise show landing page
  return <Landing />;
};

const NavbarWrapper = () => {
  const location = useLocation();
  const { navbarHidden } = useAuth();
  
  const hideOnPaths = ['/auth', '/editor', '/code-wars', '/battle-arena', '/u'];
  const isLanding = location.pathname === '/';
  const shouldHide = navbarHidden || isLanding || hideOnPaths.some(p => location.pathname.startsWith(p));
  
  if (shouldHide) return null;
  return <Navbar />;
};

const applyGlobalTheme = (theme) => {
  const root = document.documentElement;
  // Handle migration from old theme name
  let activeTheme = theme;
  if (activeTheme === 'cyber-neon') {
    activeTheme = 'neo-noir';
  }

  // Remove all theme classes first
  root.classList.remove('theme-minecraft');
  root.classList.remove('theme-cyberpunk');

  if (activeTheme === 'amber') {
    // ── Minecraft / Amber theme ──────────────────────────────
    root.classList.add('theme-minecraft');
    root.style.setProperty('--primary', '#FFD700');
    root.style.setProperty('--primary-rgb', '255, 215, 0');
    root.style.setProperty('--primary-dark', '#c8a020');
    root.style.setProperty('--primary-dark-rgb', '200, 160, 32');
    root.style.setProperty('--primary-light', '#ffe566');
    root.style.setProperty('--primary-light-rgb', '255, 229, 102');
    root.style.setProperty('--primary-glow', 'rgba(255, 215, 0, 0.5)');
    root.style.setProperty('--complementary', '#5D9E3F');
    root.style.setProperty('--text-complementary', '#fffdd0');
    root.style.setProperty('--panel-text', '#fffdd0');
    root.style.setProperty('--bg-dark', '#1a1a1a');
    root.style.setProperty('--bg-surface', '#3a3a3a');
    root.style.setProperty('--text-main', '#fffdd0');
    root.style.setProperty('--text-muted', '#7a7a7a');
    root.style.setProperty('--text-hi', '#fffdd0');
    root.style.setProperty('--text-mid', '#FFD700');
    root.style.setProperty('--text-lo', '#8B6914');
    root.style.setProperty('--font-sans', "'Press Start 2P', monospace");
  } else if (activeTheme === 'neo-noir') {
    // ── Cyberpunk / Neo Noir theme ──────────────────────────────
    root.classList.add('theme-cyberpunk');
    root.style.setProperty('--primary', '#00d9ff');
    root.style.setProperty('--primary-rgb', '0, 217, 255');
    root.style.setProperty('--primary-dark', '#ff0080');
    root.style.setProperty('--primary-dark-rgb', '255, 0, 128');
    root.style.setProperty('--primary-light', '#66e8ff');
    root.style.setProperty('--primary-light-rgb', '102, 232, 255');
    root.style.setProperty('--primary-glow', 'rgba(0, 217, 255, 0.6)');
    root.style.setProperty('--complementary', '#ff0080');
    root.style.setProperty('--text-complementary', '#ffffff');
    root.style.setProperty('--panel-text', '#00d9ff');
    root.style.setProperty('--bg-dark', '#050508');
    root.style.setProperty('--bg-surface', '#0a0a12');
    root.style.setProperty('--text-main', '#e0f7ff');
    root.style.setProperty('--text-muted', '#4a6a7a');
    root.style.setProperty('--text-hi', '#ffffff');
    root.style.setProperty('--text-mid', '#00d9ff');
    root.style.setProperty('--text-lo', '#ff0080');
    root.style.setProperty('--font-sans', "'Orbitron', 'Share Tech Mono', sans-serif");
  } else if (activeTheme === 'leetcode') {
    // ── LeetCode theme ──────────────────────────────
    root.style.setProperty('--primary', '#ffa116');
    root.style.setProperty('--primary-rgb', '255, 161, 22');
    root.style.setProperty('--primary-dark', '#b36b00');
    root.style.setProperty('--primary-dark-rgb', '179, 107, 0');
    root.style.setProperty('--primary-light', '#ffc059');
    root.style.setProperty('--primary-light-rgb', '255, 192, 89');
    root.style.setProperty('--primary-glow', 'rgba(255, 161, 22, 0.4)');
    root.style.setProperty('--complementary', '#2cbb5d');
    root.style.setProperty('--text-complementary', '#ffffff');
    root.style.setProperty('--panel-text', '#ffa116');
    root.style.setProperty('--bg-dark', '#1a1a1a');
    root.style.setProperty('--bg-surface', '#282828');
    root.style.setProperty('--text-main', '#eff1f6');
    root.style.setProperty('--text-muted', '#8c8c8c');
    root.style.setProperty('--text-hi', '#ffffff');
    root.style.setProperty('--text-mid', '#eff1f6');
    root.style.setProperty('--text-lo', '#bfbfbf');
    root.style.setProperty('--font-sans', "'Inter', sans-serif");
  } else {
    // ── Scarlet Flare theme (default) ──────────────────────────
    root.style.setProperty('--primary', '#ef4444');
    root.style.setProperty('--primary-rgb', '239, 68, 68');
    root.style.setProperty('--primary-dark', '#dc2626');
    root.style.setProperty('--primary-dark-rgb', '220, 38, 38');
    root.style.setProperty('--primary-light', '#f87171');
    root.style.setProperty('--primary-light-rgb', '248, 113, 113');
    root.style.setProperty('--primary-glow', 'rgba(239, 68, 68, 0.5)');
    root.style.setProperty('--complementary', '#fdf5e6');
    root.style.setProperty('--text-complementary', '#1a1a1a');
    root.style.setProperty('--panel-text', '#1a1a1a');
    root.style.setProperty('--bg-dark', '#0f0f0f');
    root.style.setProperty('--bg-surface', '#1a1a1a');
    // Text variables – always set explicitly to prevent CSS cascade bugs
    root.style.setProperty('--text-main', '#ffffff');
    root.style.setProperty('--text-muted', '#a0a0a0');
    root.style.setProperty('--text-hi', '#fffdd0');   // Cream – the Scarlet Flare signature
    root.style.setProperty('--text-mid', '#f5f5dc');  // Light cream
    root.style.setProperty('--text-lo', '#d2b48c');   // Tan
  }
};

const applyGlobalFont = (font) => {
  const root = document.documentElement;
  const fonts = {
    'poppins': "'Poppins', sans-serif",
    'inter': "'Inter', sans-serif",
    'outfit': "'Outfit', sans-serif",
    'montserrat': "'Montserrat', sans-serif"
  };
  root.style.setProperty('--font-sans', fonts[font] || fonts['poppins']);
};

// Pages that always use Scarlet Flare regardless of user's saved theme
const LANDING_PATHS = ['/', '/auth'];

const applyScarletFlare = () => {
  const root = document.documentElement;
  root.classList.remove('theme-minecraft', 'theme-cyberpunk');
  root.style.setProperty('--primary', '#ef4444');
  root.style.setProperty('--primary-rgb', '239, 68, 68');
  root.style.setProperty('--primary-dark', '#dc2626');
  root.style.setProperty('--primary-dark-rgb', '220, 38, 38');
  root.style.setProperty('--primary-light', '#f87171');
  root.style.setProperty('--primary-light-rgb', '248, 113, 113');
  root.style.setProperty('--primary-glow', 'rgba(239, 68, 68, 0.5)');
  root.style.setProperty('--complementary', '#faf5ee');
  root.style.setProperty('--text-complementary', '#1a1a1a');
  root.style.setProperty('--panel-text', '#1a1a1a');
  root.style.setProperty('--bg-dark', '#0f0f0f');
  root.style.setProperty('--bg-surface', '#1a1a1a');
  root.style.setProperty('--text-main', '#ffffff');
  root.style.setProperty('--text-muted', '#a0a0a0');
  root.style.setProperty('--text-hi', '#fffdd0');
  root.style.setProperty('--text-mid', '#f5f5dc');
  root.style.setProperty('--text-lo', '#d2b48c');
  
  const savedFont = localStorage.getItem('app_font') || 'poppins';
  const fonts = {
    'poppins': "'Poppins', sans-serif",
    'inter': "'Inter', sans-serif",
    'outfit': "'Outfit', sans-serif",
    'montserrat': "'Montserrat', sans-serif"
  };
  root.style.setProperty('--font-sans', fonts[savedFont] || fonts['poppins']);
};

// Watches route changes and applies correct theme
const ThemeManager = () => {
  const location = useLocation();

  React.useEffect(() => {
    const isLandingPage = LANDING_PATHS.includes(location.pathname);

    if (isLandingPage) {
      // Always Scarlet Flare on landing/auth — no user theme
      applyScarletFlare();
    } else {
      // Restore user's saved theme on all other pages
      const savedTheme = localStorage.getItem('app_theme') || 'crimson';
      const savedFont = localStorage.getItem('app_font') || 'poppins';
      applyGlobalTheme(savedTheme);
      // Only apply font override if not a special theme (those set their own font)
      if (savedTheme !== 'amber' && savedTheme !== 'neo-noir' && savedTheme !== 'leetcode') {
        applyGlobalFont(savedFont);
      }
    }
  }, [location.pathname]);

  return null;
};

function App() {
  React.useEffect(() => {
    // On initial load: if we're on landing/auth, force Scarlet Flare
    // Otherwise apply the user's saved theme
    const path = window.location.pathname;
    const isLandingPage = LANDING_PATHS.includes(path);
    if (isLandingPage) {
      applyScarletFlare();
    } else {
      const savedTheme = localStorage.getItem('app_theme') || 'crimson';
      const savedFont = localStorage.getItem('app_font') || 'poppins';
      applyGlobalTheme(savedTheme);
      if (savedTheme !== 'amber' && savedTheme !== 'neo-noir' && savedTheme !== 'leetcode') {
        applyGlobalFont(savedFont);
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <ThemeManager />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.2)',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#1a1a2e',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--primary)',
                  secondary: '#1a1a2e',
                },
              },
            }}
          />
          <NavbarWrapper />
          <Routes>
            <Route path="/" element={<LandingRoute />} />
            <Route 
              path="/hub" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/library" 
              element={
                <ProtectedRoute>
                  <Arcade />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workspace" 
              element={
                <ProtectedRoute>
                  <Workspace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/build" 
              element={
                <ProtectedRoute>
                  <Navigate to="/editor/new" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/editor/:roomId" 
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={<Leaderboard />} 
            />
            <Route 
              path="/factions" 
              element={
                <ProtectedRoute>
                  <Factions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/codevault" 
              element={
                <ProtectedRoute>
                  <CodeVault />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/battle-arena" 
              element={
                <ProtectedRoute>
                  <BattleArena />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/code-wars" 
              element={
                <ProtectedRoute>
                  <CodeWarsArena />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user-guide" 
              element={<UserModule />} 
            />
            <Route 
              path="/u/:username" 
              element={<UserProfile />} 
            />
            {/* Catch-all: redirect any unknown path to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

