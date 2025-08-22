// App.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { SubjectStandard } from "./types";
import useStandardsData from "./hooks/useStandardsData";
import TwoPaneSubjectStandardDisplay from "./TwoPaneSubjectStandardDisplay";
import VisibilityContext from "./context/VisibilityContext";
import SettingsFlyout from "./components/SettingsFlyout";
import { ProfileProvider, useProfile } from "./context/ProfileContext";
import ProfileSummaryCard from "./components/ProfileSummaryCard";
import { StandardMasteryProvider } from "./context/StandardMasteryContext";
import FirstTimeExperience from "./components/FirstTimeExperience";

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
  const [hideCompleted, setHideCompleted] = useState(
    getVisibilityStatusFromStorage()
  );
  const [showIntro, setShowIntro] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const profileCardRef = useRef<HTMLDivElement>(null);

  const INTRO_COOKIE = "vsol_intro_dismissed";

  const hasSeenIntro = () =>
    document.cookie
      .split("; ")
      .some((row) => row.startsWith(`${INTRO_COOKIE}=true`));

  useEffect(() => {
    if (!hasSeenIntro()) {
      setShowIntro(true);
    }
  }, []);

  const handleIntroClose = () => {
    document.cookie = `${INTRO_COOKIE}=true; max-age=31536000; path=/`;
    setShowIntro(false);
  };

  const subjects = useMemo(
    () =>
      [...new Set(standardsData.map((standard) => standard.subject))].sort(),
    [standardsData]
  );
  const grades = useMemo(
    () => [...new Set(standardsData.map((standard) => standard.grade))].sort(),
    [standardsData]
  );

  const handleSubjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(event.target.value);
  };

  const handleGradeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(event.target.value);
  };

  const filteredSubjectStandards = useMemo<SubjectStandard[]>(() => {
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

    return filtered;
  }, [standardsData, selectedSubject, selectedGrade]);

  useEffect(() => {
    localStorage.setItem("hideCompleted", JSON.stringify(hideCompleted));
  }, [hideCompleted]);

  return (
    <div className="bg-gray-100 min-h-screen max-h-screen px-2 pt-2 lg:px-4 lg:pt-4 flex flex-col">
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
            <ProfileSummaryCard
              ref={profileCardRef}
              filteredStandards={filteredSubjectStandards}
            />
          </div>

          {/* Right: Settings */}
          <div className="flex-shrink-0 absolute lg:block right-0 top-0 mt-1 mr-1 lg:mt-4 lg:mr-4">
            <SettingsFlyout
              hideCompleted={hideCompleted}
              setHideCompleted={setHideCompleted}
              openIntro={() => setShowIntro(true)}
              gearRef={settingsButtonRef}
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

      <div className="bg-white py-1 px-3 border-t border-gray-200 text-[10px] lg:text-xs text-gray-500 flex justify-between items-center flex-shrink-0 rounded-bl rounded-br">
        <div>
          © 2024 Virginia SOL Explorer by Chris Lates. All rights reserved.
        </div>
        <a
          href="https://github.com/clates/v-sol-explorer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 16 16" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            ></path>
          </svg>
          GitHub
        </a>
      </div>

      <FirstTimeExperience
        isOpen={showIntro}
        onClose={handleIntroClose}
        settingsButtonRef={settingsButtonRef}
        profileCardRef={profileCardRef}
      />
    </div>
  );
};

// This component gets the selectedProfileId and passes it to StandardMasteryProvider
const StandardMasteryWithProfile: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { selectedProfileId, isProfileLoading } = useProfile();

  if (isProfileLoading) {
    // Don't render the children until the profile is loaded
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading profile data...</div>
      </div>
    );
  }

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
