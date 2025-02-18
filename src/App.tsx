// App.tsx
import React, { useState, useEffect } from "react";
import { SubjectStandard } from "./types";
import useStandardsData from "./hooks/useStandardsData";
import TwoPaneSubjectStandardDisplay from "./TwoPaneSubjectStandardDisplay";
import VisibilityContext from "./context/VisibilityContext";

const getVisibilityStatusFromStorage = () => {
  const storedHideCompleted = localStorage.getItem("hideCompleted");
  if (storedHideCompleted) {
    return !!JSON.parse(storedHideCompleted);
  }
  return false;
};

const App: React.FC = () => {
  const { standardsData } = useStandardsData({
    useCache: false,
  }); // Set useCache to false for testing

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

  const handleHideCompletedChange = () => {
    setHideCompleted((prevHideCompleted) => !prevHideCompleted);
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

      <div className="flex space-x-4 mb-4 items-center justify-center content-center">
        <div className="w-1/2">
          <label
            htmlFor="subject"
            className="block text-gray-700 font-bold mb-2"
          >
            Subject:
          </label>
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
        </div>

        <div className="w-1/2">
          <label htmlFor="grade" className="block text-gray-700 font-bold mb-2">
            Grade:
          </label>
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
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hideCompleted"
            checked={hideCompleted}
            onChange={handleHideCompletedChange}
            className="form-checkbox rounded text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="hideCompleted" className="text-gray-700">
            Hide Completed Standards
          </label>
        </div>
      </div>

      <VisibilityContext.Provider value={{ hideCompleted, setHideCompleted }}>
        <TwoPaneSubjectStandardDisplay
          subjectStandards={filteredSubjectStandards} // Pass as an array
        />
      </VisibilityContext.Provider>
    </div>
  );
};

export default App;
