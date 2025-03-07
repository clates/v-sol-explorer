import React, { useContext } from "react";
import { SubjectStandard } from "../types";
import VisibilityContext from "../context/VisibilityContext";
import {
  MasteryStatus,
  useStandardMastery,
} from "../context/StandardMasteryContext";
import {
  LinkIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

const SubjectStandardDisplay: React.FC<{
  subjectStandard: SubjectStandard;
}> = ({ subjectStandard }) => {
  const { updateMastery, getMastery } = useStandardMastery();
  const { hideCompleted } = useContext(VisibilityContext);

  // Helper function to get human-readable mastery status text
  const getMasteryLabel = (status: MasteryStatus) => {
    switch (status) {
      case "completed":
        return "Mastered";
      case "needs_improvement":
        return "Needs Work";
      case "not_started":
        return "Not Started";
      default:
        return "Unknown";
    }
  };

  const handleStandardClick = (
    subject: string,
    standardId: string,
    mastery: MasteryStatus
  ) => {
    // Cycle through mastery statuses
    if (mastery === "completed") {
      updateMastery(subject, standardId, "not_started");
    } else if (mastery === "needs_improvement") {
      updateMastery(subject, standardId, "completed");
    } else if (mastery === "not_started") {
      updateMastery(subject, standardId, "needs_improvement");
    }
  };

  return (
    <div
      id={subjectStandard.id}
      className="subject-standard-card p-3 sm:p-4 bg-white rounded-lg shadow-md mb-4"
    >
      {/* Header Section */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
        {subjectStandard.subject} - Grade {subjectStandard.grade}
      </h2>

      {/* Metadata Section - Responsive & Redesigned */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Subject */}
        <div className="flex items-center px-2 py-1 rounded bg-indigo-100 text-indigo-800">
          <BookOpenIcon className="h-3 w-3 mr-1" />
          <span className="text-xs">{subjectStandard.subject}</span>
        </div>

        {/* Grade */}
        <div className="flex items-center px-2 py-1 rounded bg-emerald-100 text-emerald-800">
          <AcademicCapIcon className="h-3 w-3 mr-1" />
          <span className="text-xs">{subjectStandard.grade}</span>
        </div>
        
        {/* Last Updated */}
        <div
          className="flex items-center px-2 py-1 rounded bg-amber-100 text-amber-800"
          title="Date when the Standards of Learning (SOL) source document was last updated"
        >
          <CalendarIcon className="h-3 w-3 mr-1" />
          <span className="text-xs">
            {subjectStandard.last_updated || "Unknown"}
          </span>
        </div>

        {/* Source URL - Now Clickable */}
        {subjectStandard.source_url && (
          <a
            href={subjectStandard.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          >
            <LinkIcon className="h-3 w-3 mr-1" />
            <span className="text-xs">Source</span>
          </a>
        )}
      </div>

      {/* Standards Section */}
      <div className="space-y-4">
        {subjectStandard.categories.map((category) => (
          <div
            key={category.id}
            className="pb-2 border-b border-gray-100 last:border-0"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {category.title}
            </h3>

            <ul className="space-y-2">
              {category.standards.map((standard) => {
                const mastery = getMastery(
                  subjectStandard.subject,
                  standard.id
                );

                if (hideCompleted && mastery === "completed") {
                  return null;
                }

                // Determine colors based on mastery status
                const getBgColor = () => {
                  switch (mastery) {
                    case "completed":
                      return "bg-emerald-50 hover:bg-emerald-100";
                    case "needs_improvement":
                      return "bg-amber-50 hover:bg-amber-100";
                    default:
                      return "bg-neutral-50 hover:bg-neutral-100";
                  }
                };

                const getBadgeColor = () => {
                  switch (mastery) {
                    case "completed":
                      return "bg-emerald-200 text-emerald-800";
                    case "needs_improvement":
                      return "bg-amber-200 text-amber-800";
                    default:
                      return "bg-indigo-100 text-indigo-800";
                  }
                };

                return (
                  <li
                    key={standard.id}
                    className={`rounded-lg ${getBgColor()} transition-colors duration-200 shadow-sm hover:shadow`}
                  >
                    <button
                      onClick={() =>
                        handleStandardClick(
                          subjectStandard.subject,
                          standard.id,
                          mastery
                        )
                      }
                      className="w-full text-left p-3 flex flex-col sm:flex-row sm:items-start gap-2"
                    >
                      <div className="flex-grow">
                        {/* Standard description */}
                        <p className="text-gray-800 font-medium">
                          {standard.description}
                        </p>

                        {/* Substandards - if any */}
                        {standard.substandards &&
                          standard.substandards.length > 0 && (
                            <ul className="mt-2 ml-4 space-y-1">
                              {standard.substandards.map((substandard) => (
                                <li
                                  key={substandard.id}
                                  className="text-sm text-gray-600 list-disc"
                                >
                                  {substandard.description}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>

                      {/* Standard ID and mastery badges - Fixed width on desktop */}
                      <div className="flex flex-row sm:flex-col items-start space-x-2 sm:space-x-0 sm:space-y-1 mt-1 sm:mt-0 sm:w-24 sm:flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor()} w-full text-center`}
                        >
                          {standard.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor()} w-full text-center`}
                        >
                          {getMasteryLabel(mastery)}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectStandardDisplay;
