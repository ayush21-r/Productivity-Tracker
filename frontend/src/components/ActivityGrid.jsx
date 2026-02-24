import { ActivityRow } from './ActivityRow';

export const ActivityGrid = ({ selectedActivities = [], onActivitySelect, isDisabled = false }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4 uppercase tracking-wide">Activity Selection</h2>
        <ActivityRow onSelectActivity={onActivitySelect} isDisabled={isDisabled} />
      </div>

      {/* Display selected activities */}
      {selectedActivities.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Selected Activities</h3>
          <div className="space-y-2">
            {selectedActivities.map((activity, index) => (
              <div
                key={index}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-800"
              >
                <p className="font-medium text-xs">
                  Activity {activity.activityId} • Process {activity.processId} • SubProcess {activity.subProcessId} •
                  JobType {activity.jobTypeId}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
