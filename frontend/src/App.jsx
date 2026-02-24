import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { TimeSheetPage } from './pages/TimeSheetPage';
import { HistoryPage } from './pages/HistoryPage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/timesheet" /> : <LoginPage />} 
        />

        {/* Protected Routes */}
        <Route
          path="/timesheet"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TimeSheetPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <MainLayout>
                <HistoryPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to={user ? "/timesheet" : "/login"} />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to={user ? "/timesheet" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
