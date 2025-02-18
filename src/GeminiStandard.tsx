import React from "react";
import { SubjectStandard } from "./types";
import useStandardMastery from "./hooks/useStandardMastery";

const SubjectStandardDisplay: React.FC<{
  subjectStandard: SubjectStandard;
}> = ({ subjectStandard }) => {
  const { updateMastery, clearMastery, getMastery } = useStandardMastery();

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
              {category.standards?.map((standard) => (
                <li key={standard.id} className="standard my-2">
                  <div className="flex items-center">
                    <h4 className="text-gray-800">{standard.description}</h4>
                    <span className="ml-2 px-2 py-1 rounded text-xs font-semibold bg-blue-500 text-white">
                      {standard.id}
                    </span>
                  </div>
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
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectStandardDisplay;
