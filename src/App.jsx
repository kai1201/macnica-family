import { Toaster } from "@/components/ui/toaster"
import CursorSparkle from "@/components/landing/CursorSparkle"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';

// Electron loads via file:// — BrowserRouter breaks on that protocol.
// HashRouter works for both Electron and browser.
const Router = (typeof window !== 'undefined' && window.electronAPI)
  ? HashRouter
  : BrowserRouter;
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import GameMenu from './pages/GameMenu';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#0a0a2a" }}>
        <div style={{
          width: 32,
          height: 32,
          border: "4px solid #a78bfa",
          borderTop: "4px solid transparent",
          animation: "spin 0.6s linear infinite",
          imageRendering: "pixelated",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<GameMenu />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
<CursorSparkle />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App