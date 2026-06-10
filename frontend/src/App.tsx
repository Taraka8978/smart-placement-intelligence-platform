import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPages } from './pages/AuthPages';
import { StudentDashboard } from './pages/StudentDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { RefreshCw } from 'lucide-react';

const DynamicDashboard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
          <span>Synchronizing security context...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPages />;
  }

  // Role routing
  switch (user.role) {
    case 'STUDENT':
      return <StudentDashboard />;
    case 'RECRUITER':
      return <RecruiterDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <AuthPages />;
  }
};

function App() {
  return (
    <AuthProvider>
      <DynamicDashboard />
    </AuthProvider>
  );
}

export default App;
