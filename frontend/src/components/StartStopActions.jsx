export const StartStopActions = ({ 
  onStart, 
  onComplete, 
  isSessionActive = false,
  isActivitySelected = false,
  isLoading = false 
}) => {
  return (
    <div className="flex gap-3">
      <button
        onClick={onStart}
        disabled={isSessionActive || !isActivitySelected || isLoading}
        className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
      >
        {isLoading ? 'Starting...' : 'START'}
      </button>
      <button
        onClick={onComplete}
        disabled={!isSessionActive || isLoading}
        className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
      >
        {isLoading ? 'Completing...' : 'COMPLETE'}
      </button>
    </div>
  );
};
