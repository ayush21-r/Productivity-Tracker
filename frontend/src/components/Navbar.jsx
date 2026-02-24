import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left: App Name */}
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-gray-900">
              Productivity Tracker
            </h1>
          </div>

          {/* Right: Navigation & Logout */}
          {user && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/history')}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                History
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm bg-red-50 border border-red-200 text-red-700 rounded hover:bg-red-100 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
