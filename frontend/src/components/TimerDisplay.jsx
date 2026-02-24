import { useTimer } from '../hooks/useTimer';

export const TimerDisplay = ({ isRunning = false, startTime = null }) => {
  const { formatted } = useTimer(startTime, isRunning);

  return (
    <div className="text-center">
      <div className="text-7xl font-bold text-gray-900 font-mono tracking-wider leading-tight">
        {formatted}
      </div>
      <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Elapsed Time</p>
    </div>
  );
};
