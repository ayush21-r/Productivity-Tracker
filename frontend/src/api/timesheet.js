import apiClient from './axios';

// Get active work session
export const getActiveWorkSession = () => {
  return apiClient.get('/work-sessions/active');
};

// Start a new work session
export const startWorkSession = (activityId, processId, subProcessId, jobTypeId) => {
  return apiClient.post('/work-sessions/start', {
    activityId,
    processId,
    subProcessId,
    jobTypeId,
  });
};

// Complete active work session
export const completeWorkSession = (comment) => {
  return apiClient.post('/work-sessions/complete', {
    comment,
  });
};

// Get active shift session
export const getActiveShiftSession = () => {
  return apiClient.get('/shift/active');
};

// Fetch master data
export const getActivities = () => {
  return apiClient.get('/master/activities');
};

export const getProcesses = () => {
  return apiClient.get('/master/processes');
};

export const getSubProcesses = () => {
  return apiClient.get('/master/subprocesses');
};

export const getJobTypes = () => {
  return apiClient.get('/master/jobtypes');
};

// Fetch work session history with filters and pagination
export const getWorkSessionHistory = (page = 1, limit = 10, startDate = null, endDate = null) => {
  const params = { page, limit };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  return apiClient.get('/work-sessions/history', { params });
};
