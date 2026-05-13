import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import Dashboard from './components/Dashboard/Dashboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  // null = still checking auth
  if (user === null) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center" data-testid="app-loading">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0033FF]/30 border-t-[#0033FF] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#666] text-sm font-mono">Loading...</p>
        </div>
      </div>
    );
  }

  // false = not authenticated
  if (user === false) {
    return <AuthPage />;
  }

  // user object = authenticated
  return <Dashboard />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
