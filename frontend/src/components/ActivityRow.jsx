import { useState, useEffect } from 'react';
import { getActivities, getProcesses, getSubProcesses, getJobTypes } from '../api/timesheet';

export const ActivityRow = ({ onSelectActivity, isDisabled = false }) => {
  const [activity, setActivity] = useState('');
  const [process, setProcess] = useState('');
  const [subProcess, setSubProcess] = useState('');
  const [jobType, setJobType] = useState('');

  // Master data from API
  const [activities, setActivities] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [subProcesses, setSubProcesses] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load master data on mount
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [activData, procData, subProcData, jobData] = await Promise.all([
          getActivities(),
          getProcesses(),
          getSubProcesses(),
          getJobTypes(),
        ]);

        setActivities(activData.data.data || []);
        setProcesses(procData.data.data || []);
        setSubProcesses(subProcData.data.data || []);
        setJobTypes(jobData.data.data || []);
      } catch (err) {
        setError('Failed to load activity data');
        console.error('Error loading dropdown data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  const handleSelectActivity = () => {
    if (activity && process && subProcess && jobType) {
      onSelectActivity({ 
        activityId: activity, 
        processId: process, 
        subProcessId: subProcess, 
        jobTypeId: jobType 
      });
      // Reset form
      setActivity('');
      setProcess('');
      setSubProcess('');
      setJobType('');
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-200">
      {/* Activity Dropdown */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Activity</label>
        <select
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          disabled={isDisabled || loading}
          className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select Activity</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Process Dropdown */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Process</label>
        <select
          value={process}
          onChange={(e) => setProcess(e.target.value)}
          disabled={isDisabled || loading}
          className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select Process</option>
          {processes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sub Process Dropdown */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Sub Process</label>
        <select
          value={subProcess}
          onChange={(e) => setSubProcess(e.target.value)}
          disabled={isDisabled || loading}
          className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select Sub Process</option>
          {subProcesses.map((sp) => (
            <option key={sp.id} value={sp.id}>
              {sp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Job Type Dropdown */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Job Type</label>
        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          disabled={isDisabled || loading}
          className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select Job Type</option>
          {jobTypes.map((jt) => (
            <option key={jt.id} value={jt.id}>
              {jt.name}
            </option>
          ))}
        </select>
      </div>

      {/* Select Activity Button */}
      <button
        onClick={handleSelectActivity}
        disabled={!activity || !process || !subProcess || !jobType || isDisabled || loading}
        className="h-11 w-full px-6 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
      >
        Select Activity
      </button>
    </div>
  );
};
