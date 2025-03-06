// App.tsx
import React, { useState, useEffect } from "react";
import { SubjectStandard } from "./types";
import useStandardsData from "./hooks/useStandardsData";
import TwoPaneSubjectStandardDisplay from "./TwoPaneSubjectStandardDisplay";
import VisibilityContext from "./context/VisibilityContext";
import SettingsFlyout from "./components/settingsFlyout";
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
    <div className="bg-gray-100 min-h-screen max-h-screen p-4 flex flex-col">
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-900">
        Virginia SOL Navigator
      </h1>
      <div className="flex justify-between space-x-4 mb-4 items-center">
        <div className="flex min-w-1/5 flex-col gap-1">
          <select
            id="subject"
            value={selectedSubject}
            onChange={handleSubjectChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Grades</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>
        <div className="grow">
          <ProfileSummaryCard filteredStandards={filteredSubjectStandards} />
        </div>
        <SettingsFlyout
          hideCompleted={hideCompleted}
          setHideCompleted={setHideCompleted}
        />
      </div>

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
