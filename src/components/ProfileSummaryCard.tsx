import React, { useEffect, useState } from "react";
import { useProfile } from "../context/ProfileContext";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { useStandardMastery } from "../context/StandardMasteryContext";

interface ProfileSummaryCardProps {
  profileId?: string; // Optional - if not provided, uses selected profile
  compact?: boolean; // Optional - for a more compact display
}

const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  profileId,
  compact = false,
}) => {
  const { selectedProfileId } = useProfile();
  const actualProfileId = profileId || selectedProfileId;

  const { getProfiles, getProfileMasteryCount, profiles } = useStandardMastery();

  const profile = getProfiles().find((p) => p.id === actualProfileId);

  // Local state to force refresh when data changes
  const [stats, setStats] = useState({
    completed: 0,
    needs_improvement: 0,
    total: 0,
  });

  // This will re-run whenever the profiles object changes
  useEffect(() => {
    if (actualProfileId) {
      const currentStats = getProfileMasteryCount(actualProfileId);
      setStats(currentStats);
    }
  }, [actualProfileId, profiles]); // <-- Add profiles as dependency

  // Calculate percentages
  const completedPercentage = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;
  const needsImprovementPercentage = stats.total
    ? Math.round((stats.needs_improvement / stats.total) * 100)
    : 0;
  const notStartedCount =
    stats.total - stats.completed - stats.needs_improvement;
  const notStartedPercentage = stats.total
    ? Math.round((notStartedCount / stats.total) * 100)
    : 0;

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-sm">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
        <div className="flex items-center justify-center">
          <UserCircleIcon className="h-24 w-24 text-white" />
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold text-center mb-4">
          {profile.displayName}
        </h2>

        <div className="space-y-3">
          <div className="mastery-stats">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Mastery Progress
            </h3>

            {/* Progress bar */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="flex h-full">
                <div
                  className="bg-green-400"
                  style={{ width: `${completedPercentage}%` }}
                />
                <div
                  className="bg-yellow-400"
                  style={{ width: `${needsImprovementPercentage}%` }}
                />
                <div
                  className="bg-blue-400"
                  style={{ width: `${notStartedPercentage}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-2 text-center text-sm">
              <div>
                <div className="font-bold text-green-600">
                  {stats.completed}
                </div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div>
                <div className="font-bold text-yellow-600">
                  {stats.needs_improvement}
                </div>
                <div className="text-xs text-gray-500">Needs Work</div>
              </div>
              <div>
                <div className="font-bold text-blue-600">{notStartedCount}</div>
                <div className="text-xs text-gray-500">Not Started</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 text-center">
            {stats.total} Standards Tracked
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSummaryCard;
