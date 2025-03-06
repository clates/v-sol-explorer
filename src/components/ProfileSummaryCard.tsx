import React, { useEffect, useState } from "react";
import { useProfile } from "../context/ProfileContext";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { useStandardMastery } from "../context/StandardMasteryContext";
import { SubjectStandard } from "../types";

interface ProfileSummaryCardProps {
  profileId?: string;
  compact?: boolean;
  filteredStandards: SubjectStandard[]; // These are subject standards
}

const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  profileId,
  compact = false,
  filteredStandards,
}) => {
  const { selectedProfileId } = useProfile();
  const actualProfileId = profileId || selectedProfileId;

  const { getProfiles, getMastery, profiles } = useStandardMastery();

  const profile = getProfiles().find((p) => p.id === actualProfileId);

  const [stats, setStats] = useState({
    completed: 0,
    needs_improvement: 0,
    total: 0,
  });

  // Update stats whenever the filtered standards change
  useEffect(() => {
    if (actualProfileId && filteredStandards) {
      let completed = 0;
      let needs_improvement = 0;
      let total = 0;

      // For each filtered SubjectStandard
      filteredStandards.forEach((subjectStandard) => {
        subjectStandard.categories.forEach((category) => {
          // Get the subject name
          const subject = subjectStandard.subject;

          // For each standard within this category
          if (category.standards) {
            category.standards.forEach((standard) => {
              // Increment total for each standard
              total++;

              // Check mastery status for this standard
              const status = getMastery(subject, standard.id);
              if (status === "completed") completed++;
              if (status === "needs_improvement") needs_improvement++;
            });
          }
        });
      });

      setStats({ completed, needs_improvement, total });
    }
  }, [actualProfileId, filteredStandards, profiles, getMastery]);

  // Rest of the component remains the same
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden lg:h-[82px] mb-2">
      <div className="flex h-full">
        {/* Left section - Avatar */}
        <div className="bg-gradient-to-b from-white to-gray-100 h-full w-[82px] flex items-center justify-center">
          <UserCircleIcon className="h-14 w-14 text-gray-500" />
        </div>

        {/* Middle section - Name and Progress bar */}
        <div className="flex-grow flex flex-col justify-center px-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">{profile.displayName}</h2>
            <span className="text-xs text-gray-500">
              {stats.total} Standards
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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
        </div>

        {/* Right section - Stats */}
        <div className="bg-gray-50 w-[120px] h-full flex items-center justify-center">
          <div className="grid grid-cols-3 gap-1 text-center px-2 pt">
            <div className="flex flex-col items-center justify-center">
              <div className="font-bold text-green-600 text-sm">
                {stats.completed}
              </div>
              <div className="text-xs text-green-200 leading-tight">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="font-bold text-yellow-600 text-sm">
                {stats.needs_improvement}
              </div>
              <div className="text-xs text-amber-300 leading-tight">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="font-bold text-blue-600 text-sm">
                {notStartedCount}
              </div>
              <div className="text-xs text-blue-300 leading-tight">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSummaryCard;
