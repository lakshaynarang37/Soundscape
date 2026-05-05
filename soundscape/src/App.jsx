import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Landing from './pages/Landing';
import Callback from './pages/Callback';
import Dashboard from './pages/Dashboard';
import Tracks from './pages/Tracks';
import Artists from './pages/Artists';
import Genres from './pages/Genres';
import Heatmap from './pages/Heatmap';
import Mood from './pages/Mood';
import PersonalityCard from './pages/PersonalityCard';

function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-base">
      <div className="w-8 h-8 border-2 border-spotify border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/callback" element={<Callback />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tracks" element={<ProtectedRoute><Tracks /></ProtectedRoute>} />
          <Route path="/artists" element={<ProtectedRoute><Artists /></ProtectedRoute>} />
          <Route path="/genres" element={<ProtectedRoute><Genres /></ProtectedRoute>} />
          <Route path="/heatmap" element={<ProtectedRoute><Heatmap /></ProtectedRoute>} />
          <Route path="/mood" element={<ProtectedRoute><Mood /></ProtectedRoute>} />
          <Route path="/card" element={<ProtectedRoute><PersonalityCard /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
