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
  
  const hideOnPaths = ['/auth', '/editor', '/code-wars', '/battle-arena'];
  const isLanding = location.pathname === '/';
  const shouldHide = navbarHidden || isLanding || hideOnPaths.some(p => location.pathname.startsWith(p));
  
  if (shouldHide) return null;
  return <Navbar />;
};

const applyGlobalTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'amber') {
    // Orange theme colors
    root.style.setProperty('--primary', '#fb923c');
    root.style.setProperty('--primary-rgb', '251, 146, 60');
    root.style.setProperty('--primary-dark', '#ea580c');
    root.style.setProperty('--primary-dark-rgb', '234, 88, 12');
    root.style.setProperty('--primary-light', '#fdba74');
    root.style.setProperty('--primary-light-rgb', '253, 186, 116');
    root.style.setProperty('--complementary', '#fef3c7'); // Light Gold/Sand
    root.style.setProperty('--text-complementary', '#78350f'); // Deep Brown
    root.style.setProperty('--bg-dark', '#161412'); // Warm Dark Roast
    root.style.setProperty('--bg-surface', '#241f1c'); // Warm Surface
  } else {
    // Scarlet Flare colors
    root.style.setProperty('--primary', '#ef4444');
    root.style.setProperty('--primary-rgb', '239, 68, 68');
    root.style.setProperty('--primary-dark', '#dc2626');
    root.style.setProperty('--primary-dark-rgb', '220, 38, 38');
    root.style.setProperty('--primary-light', '#f87171');
    root.style.setProperty('--primary-light-rgb', '248, 113, 113');
    root.style.setProperty('--complementary', '#fff9e6'); // Balanced Cream
    root.style.setProperty('--text-complementary', '#1a1a1a'); // Dark Text
    root.style.setProperty('--bg-dark', '#0f0f0f');
    root.style.setProperty('--bg-surface', '#1a1a1a');
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

function App() {
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') || 'crimson';
    const savedFont = localStorage.getItem('app_font') || 'poppins';
    applyGlobalTheme(savedTheme);
    applyGlobalFont(savedFont);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
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
            {/* Catch-all: redirect any unknown path to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

