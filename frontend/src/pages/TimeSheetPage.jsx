import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { useTimer } from '../hooks/useTimer';
import { 
  getActivities,
  getProcesses,
  getSubProcesses,
  getJobTypes,
  getActiveShiftSession,
  getActiveWorkSession, 
  startWorkSession, 
  completeWorkSession 
} from '../api/timesheet';

const FALLBACK_SHIFT_TIME = '08:00:00';

const formatHms = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatInputDateTime = (dateInput) => {
  if (!dateInput) return '';

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const TimeSheetPage = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const [activityId, setActivityId] = useState('');
  const [processId, setProcessId] = useState('');
  const [subProcessId, setSubProcessId] = useState('');
  const [jobTypeId, setJobTypeId] = useState('');
  const [stage, setStage] = useState('');
  const [action, setAction] = useState('');
  const [startTimeInput, setStartTimeInput] = useState('');
  const [endTimeInput, setEndTimeInput] = useState('');
  const [comment, setComment] = useState('');

  const [activities, setActivities] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [subProcesses, setSubProcesses] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);

  const [masterLoading, setMasterLoading] = useState(true);
  const [masterError, setMasterError] = useState('');

  const [shiftLoading, setShiftLoading] = useState(true);
  const [shiftError, setShiftError] = useState('');
  const [shiftEnd, setShiftEnd] = useState(null);
  const [shiftCountdown, setShiftCountdown] = useState(FALLBACK_SHIFT_TIME);

  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Timer hook
  const { formatted: elapsedTimerDisplay } = useTimer(sessionStartTime, isSessionActive);

  const isFormSelectionReady = Boolean(activityId && processId && subProcessId && jobTypeId);

  const resetFormFields = () => {
    setActivityId('');
    setProcessId('');
    setSubProcessId('');
    setJobTypeId('');
    setStage('');
    setAction('');
    setStartTimeInput('');
    setEndTimeInput('');
    setComment('');
  };

  useEffect(() => {
    const initializePageData = async () => {
      try {
        setLoading(true);
        setMasterLoading(true);
        setShiftLoading(true);
        setError('');
        setMasterError('');
        setShiftError('');

        const [activeSessionResult, activitiesResult, processesResult, subProcessesResult, jobTypesResult, shiftResult] = await Promise.allSettled([
          getActiveWorkSession(),
          getActivities(),
          getProcesses(),
          getSubProcesses(),
          getJobTypes(),
          getActiveShiftSession(),
        ]);

        if (activeSessionResult.status === 'fulfilled') {
          const response = activeSessionResult.value;

          if (response.data?.session) {
            const session = response.data.session;
            setIsSessionActive(true);
            setSessionStartTime(session.startTime);
            setStartTimeInput(formatInputDateTime(session.startTime));
          }
        } else {
          const activeErr = activeSessionResult.reason;
          if (activeErr?.response?.status !== 404) {
            setError('Failed to load active session');
            console.error('Error loading active session:', activeErr);
          }
        }

        if (activitiesResult.status === 'fulfilled') {
          setActivities(activitiesResult.value.data?.data || []);
        }
        if (processesResult.status === 'fulfilled') {
          setProcesses(processesResult.value.data?.data || []);
        }
        if (subProcessesResult.status === 'fulfilled') {
          setSubProcesses(subProcessesResult.value.data?.data || []);
        }
        if (jobTypesResult.status === 'fulfilled') {
          setJobTypes(jobTypesResult.value.data?.data || []);
        }

        const masterFailures = [activitiesResult, processesResult, subProcessesResult, jobTypesResult]
          .filter((result) => result.status === 'rejected');
        if (masterFailures.length > 0) {
          setMasterError('Some form data could not be loaded. Please retry.');
        }

        if (shiftResult.status === 'fulfilled') {
          const shiftData = shiftResult.value.data;
          if (shiftData?.shiftEnd) {
            setShiftEnd(shiftData.shiftEnd);
            if (typeof shiftData.remainingTime === 'number') {
              setShiftCountdown(formatHms(shiftData.remainingTime));
            }
          } else {
            setShiftCountdown(FALLBACK_SHIFT_TIME);
          }
        } else {
          setShiftError('Shift timer unavailable. Showing fallback timer.');
          setShiftCountdown(FALLBACK_SHIFT_TIME);
        }
      } finally {
        setMasterLoading(false);
        setShiftLoading(false);
        setLoading(false);
      }
    };

    initializePageData();
  }, []);

  useEffect(() => {
    if (!shiftEnd) {
      return;
    }

    const updateCountdown = () => {
      const remainingSeconds = Math.max(0, Math.floor((new Date(shiftEnd).getTime() - Date.now()) / 1000));
      setShiftCountdown(formatHms(remainingSeconds));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [shiftEnd]);

  const handleStart = async () => {
    if (!isFormSelectionReady || isProcessing || isSessionActive) return;

    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');

      const response = await startWorkSession(
        activityId,
        processId,
        subProcessId,
        jobTypeId
      );

      if (response.data) {
        const session = response.data;
          setIsSessionActive(true);
          setSessionStartTime(session.startTime);
        setStartTimeInput(formatInputDateTime(session.startTime || new Date()));
        setEndTimeInput('');
        setSuccess('Work session started!');

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        try {
          const activeResponse = await getActiveWorkSession();
          if (activeResponse.data?.session) {
            const session = activeResponse.data.session;
            setIsSessionActive(true);
            setSessionStartTime(session.startTime);
            setStartTimeInput(formatInputDateTime(session.startTime));
            setError('An active work session is already running. Loaded current session.');
            return;
          }
        } catch (syncErr) {
          console.error('Error syncing active session:', syncErr);
        }
      }
      setError(err.response?.data?.message || 'Failed to start work session');
      console.error('Error starting session:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!isSessionActive || isProcessing) return;

    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');

      const response = await completeWorkSession(comment);

      if (response.data) {
        setIsSessionActive(false);
        setSessionStartTime(null);
        setEndTimeInput(formatInputDateTime(new Date()));
        setSuccess('Work session completed successfully!');

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete work session');
      console.error('Error completing session:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (isProcessing) return;

    setError('');
    setSuccess('');

    if (!isSessionActive) {
      resetFormFields();
      return;
    }

    setStage('');
    setAction('');
    setComment('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center">
        <PageHeader title="Time Sheet" subtitle="Track your work activities and time" />
      </div>

      <Card className="space-y-6">
        <div className="text-center">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Shift Remaining Time</p>
          <div className="text-6xl font-bold text-gray-900 font-mono tracking-wider">{shiftLoading ? 'Loading...' : shiftCountdown}</div>
          {shiftError && <p className="text-xs text-amber-600 mt-2">{shiftError}</p>}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Work Session Elapsed</p>
          <div className="text-4xl font-bold text-gray-900 font-mono">{elapsedTimerDisplay}</div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-800 text-sm font-medium">✓ {success}</p>
          </div>
        )}

        {masterError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 text-sm font-medium">{masterError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Activity</label>
            <select
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              disabled={masterLoading || isProcessing || isSessionActive}
              className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
            >
              <option value="">Select Activity</option>
              {activities.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Process / Category</label>
            <select
              value={processId}
              onChange={(e) => setProcessId(e.target.value)}
              disabled={masterLoading || isProcessing || isSessionActive}
              className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
            >
              <option value="">Select Process</option>
              {processes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Sub Process</label>
            <select
              value={subProcessId}
              onChange={(e) => setSubProcessId(e.target.value)}
              disabled={masterLoading || isProcessing || isSessionActive}
              className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
            >
              <option value="">Select Sub Process</option>
              {subProcesses.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Type of Job</label>
            <select
              value={jobTypeId}
              onChange={(e) => setJobTypeId(e.target.value)}
              disabled={masterLoading || isProcessing || isSessionActive}
              className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
            >
              <option value="">Select Job Type</option>
              {jobTypes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Stage</label>
            <input
              type="text"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              disabled={isProcessing}
              placeholder="Enter stage"
              className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Action</label>
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              disabled={isProcessing}
              placeholder="Describe the action performed"
              className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Start Time</label>
            <input
              type="text"
              value={startTimeInput}
              readOnly
              placeholder="Auto-filled on START"
              className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 bg-gray-50 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">End Time</label>
            <input
              type="text"
              value={endTimeInput}
              readOnly
              placeholder="Auto-filled on COMPLETE"
              className="h-11 w-full px-3 text-sm rounded-lg border border-gray-300 bg-gray-50 text-gray-700"
            />
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            disabled={isProcessing}
            placeholder="Add any notes or comments about this task..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100"
            rows="3"
          />
          <div className="flex justify-end mt-2">
            <p className="text-xs text-gray-500">{comment.length} / 1000</p>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleStart}
            disabled={!isFormSelectionReady || isProcessing || isSessionActive || masterLoading}
            className="h-11 w-32 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-green-300 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'START'}
          </button>
          <button
            onClick={handleReset}
            disabled={isProcessing}
            className="h-11 w-32 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            RESET
          </button>
          <button
            onClick={handleComplete}
            disabled={!isSessionActive || isProcessing}
            className="h-11 w-32 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'COMPLETE'}
          </button>
        </div>
      </Card>
    </div>
  );
};
