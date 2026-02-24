import { useState, useEffect } from 'react';
import { getWorkSessionHistory } from '../api/timesheet';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';

// Loading Skeleton Component
const HistorySkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-full"></div>
      </div>
    ))}
  </div>
);

// Utility functions
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '00:00';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const getProductivityBadgeClass = (productivity) => {
  const baseClass = 'px-2 py-1 text-xs font-semibold rounded-md';

  if (productivity === null || productivity === undefined || Number.isNaN(productivity)) {
    return `${baseClass} bg-gray-100 text-gray-600`;
  }

  if (productivity > 100) {
    return `${baseClass} bg-green-100 text-green-700`;
  }

  if (productivity === 100) {
    return `${baseClass} bg-blue-100 text-blue-700`;
  }

  return `${baseClass} bg-red-100 text-red-700`;
};

const formatProductivity = (productivity) => {
  if (productivity === null || productivity === undefined || Number.isNaN(productivity)) {
    return 'N/A';
  }

  return `${Math.round(productivity)}%`;
};

export const HistoryPage = () => {
  // State
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  // Fetch work session history
  const fetchHistory = async (page = 1, startDate = '', endDate = '') => {
    try {
      setLoading(true);
      setError('');

      const response = await getWorkSessionHistory(
        page,
        pagination.limit,
        startDate || null,
        endDate || null
      );

      if (response.data && response.data.data) {
        setSessions(response.data.data);
        setPagination({
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
        });
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.response?.data?.message || 'Failed to load work session history');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchHistory(1, filters.startDate, filters.endDate);
  }, []);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters (reset to page 1)
  const handleApplyFilters = () => {
    fetchHistory(1, filters.startDate, filters.endDate);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({ startDate: '', endDate: '' });
    fetchHistory(1, '', '');
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (pagination.page > 1) {
      fetchHistory(pagination.page - 1, filters.startDate, filters.endDate);
    }
  };

  const handleNextPage = () => {
    const maxPages = Math.ceil(pagination.total / pagination.limit);
    if (pagination.page < maxPages) {
      fetchHistory(pagination.page + 1, filters.startDate, filters.endDate);
    }
  };

  const handlePageChange = (newPage) => {
    fetchHistory(newPage, filters.startDate, filters.endDate);
  };

  const maxPages = Math.ceil(pagination.total / pagination.limit);

  // Error state
  if (error && !loading) {
    return (
      <>
        <PageHeader 
          title="Work Session History" 
          subtitle="Track your completed work sessions and metrics."
        />
        <Card>
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 font-medium">⚠️ {error}</p>
          </div>
          <button
            onClick={() => {
              setError('');
              fetchHistory(1, filters.startDate, filters.endDate);
            }}
            className="mt-4 h-11 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Try Again
          </button>
        </Card>
      </>
    );
  }

  // Empty state
  if (!loading && sessions.length === 0) {
    return (
      <>
        <PageHeader 
          title="Work Session History" 
          subtitle="Track your completed work sessions and metrics."
        />

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleApplyFilters}
              className="h-11 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="h-11 px-6 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              Reset
            </button>
          </div>
        </Card>

        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">📋 No work sessions found.</p>
            <p className="text-gray-500 mt-2">Start a new work session to see it in your history.</p>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader 
        title="Work Session History" 
        subtitle="Track your completed work sessions and metrics."
      />

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleApplyFilters}
            className="h-11 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            className="h-11 px-6 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            Reset
          </button>
        </div>
      </Card>

      {/* Loading Skeleton */}
      {loading && <HistorySkeleton />}

      {/* Table */}
      {!loading && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Start Time</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">End Time</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Duration</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Productivity</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Activity</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Process</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Sub-Process</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Job Type</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Comment</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {formatDate(session.startTime)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatTime(session.startTime)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatTime(session.endTime)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium font-mono">
                      {formatDuration(session.totalDuration)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-mono">
                      <span className={getProductivityBadgeClass(session.productivity)}>
                        {formatProductivity(session.productivity)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {session.activityName || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {session.processName || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {session.subProcessName || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {session.jobTypeName || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                      {session.comment || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-semibold">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-semibold">{pagination.total}</span> sessions
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={pagination.page === 1}
                className="h-10 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {[...Array(Math.min(maxPages, 5))].map((_, i) => {
                  let pageNum = pagination.page - 2 + i;
                  if (pageNum < 1 || pageNum > maxPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-10 px-3 rounded-lg text-sm font-medium transition ${
                        pageNum === pagination.page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={pagination.page >= maxPages}
                className="h-10 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
