import { useState, useEffect } from "react";

export type MasteryStatus = "completed" | "needs_improvement" | "not_started";

const useStandardMastery = () => {
  const [masteryStatus, setMasteryStatus] = useState<{
    [subject: string]: {
      [standardId: string]: MasteryStatus;
    };
  }>({});

  useEffect(() => {
    const storedMastery = localStorage.getItem("mastery");
    if (storedMastery) {
      setMasteryStatus(JSON.parse(storedMastery));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(masteryStatus).length > 0) {
      localStorage.setItem("mastery", JSON.stringify(masteryStatus));
    }
  }, [masteryStatus]);

  const updateMastery = (
    subject: string,
    standardId: string,
    status: MasteryStatus
  ) => {
    console.log("Setting mastery status...")
    setMasteryStatus((prevStatus) => ({
      ...prevStatus,
      [subject]: {
        ...prevStatus[subject],
        [standardId]: status,
      },
    }));
  };

  const clearMastery = (subject: string, standardId: string) => {
    setMasteryStatus((prevStatus) => {
        console.log("Clearing mastery status...")
      const newStatus = { ...prevStatus };
      delete newStatus[subject][standardId];
      return newStatus;
    });
  };

  const getMastery = (subject: string, standardId: string) => {
    return masteryStatus[subject]?.[standardId] || "not_started";
  };

  return { updateMastery, clearMastery, getMastery };
};

export default useStandardMastery;
