// StandardCard.tsx
import React from "react";
import { SubjectStandard } from "./types";

interface StandardCardProps {
    subjectStandard: SubjectStandard;
}

const StandardCard: React.FC<StandardCardProps> = ({ subjectStandard }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-xl font-semibold mb-2">
        {subjectStandard.grade} - {subjectStandard.subject}
      </h3>
      <p className="text-gray-700 mb-2">{subjectStandard.title}</p>
      {Object.entries(subjectStandard.categories).map(([categoryName, category]) => (
        <div key={categoryName} className="mb-4">
          <h4 className="text-lg font-medium mb-1">{categoryName}</h4>
          <ul className="list-disc pl-5 text-gray-700">
            {category.standards.map((entry) => (
              <li key={entry.id} className="mb-2">
                <strong className="font-semibold">{entry.id}:</strong>{" "}
                {entry.description}
                {entry.substandards && (
                  <ul className="list-disc pl-5 mt-1">
                    {entry.substandards.map((subpoint, index) => (
                      <li key={index}>{subpoint.description}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
export default StandardCard;