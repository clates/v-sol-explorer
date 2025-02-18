import React, { useState, useEffect } from "react";
import { SubjectStandard } from "./types";
import SubjectStandardDisplay from "./GeminiStandard";

//... (Types remain the same)

const STANDARDS_DISPLAY_ID = "standards-display";

const TwoPaneSubjectStandardDisplay: React.FC<{
  subjectStandards: SubjectStandard[];
}> = ({ subjectStandards }) => {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const cards = document.querySelectorAll(".subject-standard-card");
      for (let i = cards.length - 1; i >= 0; i--) {
        const card = cards[i];
        if (card.getBoundingClientRect().top <= 200) {
          setActiveSection(card.id);
          break;
        }
      }
    };

    document
      .getElementById(STANDARDS_DISPLAY_ID)!
      .addEventListener("scroll", handleScroll);
    return () =>
      document
        .getElementById(STANDARDS_DISPLAY_ID)!
        .removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="two-pane-display flex overflow-y-scroll bg-gray-100">
      <div className="toc hidden lg:block min-w-1/5 p-4 overflow-y-auto shadow-md">
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
        className="standards p-4 overflow-y-auto shadow-md bg-gray-200"
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
