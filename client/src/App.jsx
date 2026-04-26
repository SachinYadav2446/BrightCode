import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Landing from './pages/Landing';
import EditorPage from './pages/EditorPage';
import Auth from './pages/Auth';
import Settings from './pages/Settings';
import Arcade from './pages/Arcade';
import Leaderboard from './pages/Leaderboard';
import Factions from './pages/Factions';
import UserModule from './pages/UserModule';
import Library from './pages/Library';
import Workspace from './pages/Workspace';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

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

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div>
          <Toaster
            position="top-right"
            toastOptions={{
              success: { theme: { primary: '#4aed88' } },
              error: { theme: { primary: '#ff4b4b' } }
            }}
          />
        </div>
        <BrowserRouter>
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
            <Route path="/user-module" element={<UserModule />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

