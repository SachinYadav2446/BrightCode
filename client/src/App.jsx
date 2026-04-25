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
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;
  return children;
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
            <Route path="/" element={<Landing />} />
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
              path="/arcade" 
              element={
                <ProtectedRoute>
                  <Arcade />
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

