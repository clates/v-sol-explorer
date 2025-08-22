import React, { useState, useEffect } from "react";
import { SubjectStandard } from "./types";
import SubjectStandardDisplay from "./components/SubjectStandardDisplay";

//... (Types remain the same)

const STANDARDS_DISPLAY_ID = "standards-display";

const TwoPaneSubjectStandardDisplay: React.FC<{
  subjectStandards: SubjectStandard[];
}> = ({ subjectStandards }) => {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const container = document.getElementById(STANDARDS_DISPLAY_ID);
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { root: container, threshold: 0.1 }
    );

    const cards = container.querySelectorAll(".subject-standard-card");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [subjectStandards]);

  return (
    <div className="flex overflow-y-scroll bg-gray-100">
      <div className="hidden lg:block flex-shrink-0 w-1/5 max-w-64 p-4 overflow-y-auto shadow-md">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          Table of Contents
        </h3>
        <ul>
          {subjectStandards.map((standard) => (
            <li key={standard.id} className="mb-2">
              <a
                href={`#${standard.id}`}
                className={`text-gray-700 hover:text-blue-500 ${
                  activeSection === standard.id ? "font-bold text-blue-500" : ""
                }`}
              >
                {standard.subject} - Grade {standard.grade}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div
        id={STANDARDS_DISPLAY_ID}
        className="p-4 overflow-y-auto shadow-md bg-gray-200 [scroll-behavior:smooth]"
      >
        {subjectStandards.map((standard) => (
          <SubjectStandardDisplay
            key={`${standard.grade}-${standard.id}`}
            subjectStandard={standard}
          />
        ))}
      </div>
    </div>
  );
};

export default TwoPaneSubjectStandardDisplay;
