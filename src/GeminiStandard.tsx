import React, { useContext, useState } from "react";
import { SubjectStandard } from "./types";
import useStandardMastery, { MasteryStatus } from "./hooks/useStandardMastery";
import VisibilityContext from "./context/VisibilityContext";

const SubjectStandardDisplay: React.FC<{
  subjectStandard: SubjectStandard;
}> = ({ subjectStandard }) => {
  const { updateMastery, getMastery } = useStandardMastery();
  const { hideCompleted } = useContext(VisibilityContext);

  const metadataLabels: { key: keyof SubjectStandard; color: string }[] = [
    {
      key: "subject",
      color: "bg-blue-100",
    },
    {
      key: "grade",
      color: "bg-green-100",
    },
    {
      key: "last_updated",
      color: "bg-yellow-100",
    },
    {
      key: "source_url",
      color: "bg-red-100",
    },
  ];

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
      className="subject-standard-card p-4 bg-white rounded-lg shadow-md mb-4"
    >
      <div className="metadata flex space-x-4 mb-4">
        {metadataLabels.map(({ key, color }) => (
          <div
            key={key}
            className={`flex items-center px-2 py-1 rounded ${color}`}
          >
            <span className="text-xs font-semibold text-gray-700">{key}:</span>
            <span className="ml-1 text-xs text-gray-900">
              {subjectStandard[key] as string}
            </span>
          </div>
        ))}
      </div>

      <div>
        {subjectStandard.categories.map((category) => (
          <div key={category.id} className="category mb-4">
            <h3 className="text-xl font-semibold text-gray-700">
              {category.title}
            </h3>
            <ul className="list-disc ml-4">
              {category.standards?.map((standard) => {
                const mastery = getMastery(
                  subjectStandard.subject,
                  standard.id
                );
                if (mastery === "completed" && hideCompleted) {
                  return null;
                }
                return (
                  <li
                    key={standard.id}
                    className={`standard my-2 ${
                      mastery === "completed"
                        ? "text-green-500"
                        : mastery === "needs_improvement"
                        ? "text-yellow-500"
                        : ""
                    }`}
                  >
                    <button
                      className="flex items-center w-full text-left"
                      onClick={() =>
                        handleStandardClick(
                          subjectStandard.subject,
                          standard.id,
                          mastery
                        )
                      }
                    >
                      <h4 className="text-gray-800">{standard.description}</h4>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                          mastery === "completed" ? "bg-green-200" : ""
                        } ${
                          mastery === "needs_improvement" ? "bg-yellow-200" : ""
                        } ${
                          mastery === "not_started" ? "bg-blue-200" : ""
                        }  text-white`}
                      >
                        {standard.id}
                      </span>
                    </button>
                    {standard.substandards && (
                      <ul className="list-disc ml-4">
                        {standard.substandards.map((substandard) => (
                          <li
                            key={substandard.id}
                            className="substandard text-gray-600"
                          >
                            {substandard.description}
                          </li>
                        ))}
                      </ul>
                    )}
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
