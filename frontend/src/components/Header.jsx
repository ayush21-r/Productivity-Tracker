import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const safeNavigate = (path) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const isTimesheetActive = location.pathname === '/timesheet';
  const isHistoryActive = location.pathname === '/history';

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || 'user@email.com';

  const handleLogout = () => {
    logout();
    safeNavigate('/login');
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: App Title */}
          <div>
            <button
              type="button"
              onClick={() => safeNavigate('/timesheet')}
              className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition"
            >
              Productivity Tracker
            </button>
          </div>

          {/* Right: Navigation Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => safeNavigate('/timesheet')}
              className={`h-11 px-6 rounded-lg border font-medium transition ${
                isTimesheetActive
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Time Sheet
            </button>
            <button
              onClick={() => safeNavigate('/history')}
              className={`h-11 px-6 rounded-lg border font-medium transition ${
                isHistoryActive
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              History
            </button>
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold text-slate-700">
                {displayName}
              </div>
              <div className="text-xs text-slate-500 hidden sm:block">
                {displayEmail}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="h-11 px-6 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
