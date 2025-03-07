// App.tsx
import React, { useState, useEffect } from "react";
import { SubjectStandard } from "./types";
import useStandardsData from "./hooks/useStandardsData";
import TwoPaneSubjectStandardDisplay from "./TwoPaneSubjectStandardDisplay";
import VisibilityContext from "./context/VisibilityContext";
import SettingsFlyout from "./components/SettingsFlyout";
import { ProfileProvider, useProfile } from "./context/ProfileContext";
import ProfileSummaryCard from "./components/ProfileSummaryCard";
import { StandardMasteryProvider } from "./context/StandardMasteryContext";

const getVisibilityStatusFromStorage = () => {
  const storedHideCompleted = localStorage.getItem("hideCompleted");
  if (storedHideCompleted) {
    return !!JSON.parse(storedHideCompleted);
  }
  return false;
};

// The main App component without context dependencies
const AppContent: React.FC = () => {
  const { standardsData } = useStandardsData({
    useCache: true,
  });

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [filteredSubjectStandards, setFilteredSubjectStandards] = useState<
    SubjectStandard[]
  >([]);
  const [hideCompleted, setHideCompleted] = useState(
    getVisibilityStatusFromStorage()
  );

  const subjects = [
    ...new Set(standardsData.map((standard) => standard.subject)),
  ].sort();
  const grades = [
    ...new Set(standardsData.map((standard) => standard.grade)),
  ].sort();

  const handleSubjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(event.target.value);
  };

  const handleGradeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(event.target.value);
  };

  const filterStandards = () => {
    let filtered = standardsData;

    if (selectedSubject) {
      filtered = filtered.filter(
        (standard) => standard.subject === selectedSubject
      );
    }

    if (selectedGrade) {
      filtered = filtered.filter(
        (standard) => standard.grade === selectedGrade
      );
    }

    setFilteredSubjectStandards(filtered);
  };

  useEffect(() => {
    filterStandards();
  }, [selectedSubject, selectedGrade, standardsData]);

  useEffect(() => {
    localStorage.setItem("hideCompleted", JSON.stringify(hideCompleted));
  }, [hideCompleted]);

  return (
    <div className="bg-gray-100 min-h-screen max-h-screen p-2 lg:p-4 flex flex-col">
      {/* Compact header section - constrained to ~130px */}
      <div className="flex flex-col h-[130px] mb-2 lg:mb-4">
        {/* Title row - smaller and with less margin */}
        <h1 className="text-lg lg:text-3xl font-bold mb-1 lg:mb-4 text-center text-gray-900">
          Virginia SOL Navigator
        </h1>

        {/* Controls row - more compact */}
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
          {/* Left column: Filters */}
          <div className="flex flex-row lg:flex-col gap-1 flex-shrink-0 w-full lg:w-1/5 lg:max-w-64">
            <select
              id="subject"
              value={selectedSubject}
              onChange={handleSubjectChange}
              className="border border-gray-300 rounded px-2 lg:px-3 py-1 lg:py2 text-sm lg:text-md focus:outline-none focus:ring-1 lg:focus:ring-2 focus:ring-blue-500 grow"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            <select
              id="grade"
              value={selectedGrade}
              onChange={handleGradeChange}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 grow"
            >
              <option value="">All Grades</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          {/* Middle: Profile Card */}
          <div className="grow order-3">
            <ProfileSummaryCard filteredStandards={filteredSubjectStandards} />
          </div>

          {/* Right: Settings */}
          <div className="flex-shrink-0 absolute lg:block right-0 top-0 mt-1 mr-1 lg:mt-4 lg:mr-4">
            <SettingsFlyout
              hideCompleted={hideCompleted}
              setHideCompleted={setHideCompleted}
            />
          </div>
        </div>
      </div>

      {/* Main content - takes remaining space */}
        <VisibilityContext.Provider value={{ hideCompleted, setHideCompleted }}>
          <TwoPaneSubjectStandardDisplay
            subjectStandards={filteredSubjectStandards}
          />
        </VisibilityContext.Provider>
    </div>
  );
};

// This component gets the selectedProfileId and passes it to StandardMasteryProvider
const StandardMasteryWithProfile: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { selectedProfileId } = useProfile();

  return (
    <StandardMasteryProvider selectedProfileId={selectedProfileId}>
      {children}
    </StandardMasteryProvider>
  );
};

// Main app wrapper with all context providers
const App: React.FC = () => {
  return (
    <ProfileProvider>
      <StandardMasteryWithProfile>
        <AppContent />
      </StandardMasteryWithProfile>
    </ProfileProvider>
  );
};

export default App;
