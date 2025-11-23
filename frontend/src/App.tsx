import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import OnboardingWizard from './components/Onboarding/OnboardingWizard';
import Dashboard from './components/Dashboard/Dashboard';
import TradeEntryForm from './components/TradeEntry/TradeEntryForm';
import TradeList from './components/TradeList/TradeList';
import CalendarView from './components/Calendar/CalendarView';
import LandingPage from './components/Landing/LandingPage';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';

// Lazy load new components to prevent bundle crashes
const ExchangeSettings = React.lazy(() => import('./components/Settings/ExchangeSettings'));
const ReportsDashboard = React.lazy(() => import('./components/Reports/ReportsDashboard'));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppLayout = () => {
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden font-sans selection:bg-blue-500/30">
      {/* New Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-gray-950 to-gray-900 relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

        {/* New TopBar */}
        <TopBar onEditLayout={() => setShowWidgetLibrary(true)} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto p-6">
            <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Dashboard showLibrary={showWidgetLibrary} setShowLibrary={setShowWidgetLibrary} />} />
                <Route path="/trades" element={<TradeList />} />
                <Route path="/new-trade" element={<TradeEntryForm />} />
                <Route path="/calendar" element={<CalendarView />} />
                <Route path="/reports" element={<ReportsDashboard />} />
                <Route path="/settings/exchanges" element={<ExchangeSettings />} />
                {/* Add other routes as needed */}
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/onboarding" /> : <Signup />} />

      <Route
        path="/onboarding"
        element={isAuthenticated ? <OnboardingWizard /> : <Navigate to="/login" />}
      />

      {/* Protected dashboard routes with layout */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
