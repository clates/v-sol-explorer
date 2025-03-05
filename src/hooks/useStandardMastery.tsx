import { useState, useEffect } from "react";

export type MasteryStatus = "completed" | "needs_improvement" | "not_started";

interface Profile {
  id: string;
  name: string;
  metadata: {
    [key: string]: any;
  };
}

const useStandardMastery = (selectedProfileId: string) => {
  const [profiles, setProfiles] = useState<{
    [profileId: string]: {
      masteryStatus: {
        [subject: string]: {
          [standardId: string]: MasteryStatus;
        };
      };
      metadata: {
        [key: string]: any;
      };
    };
  }>({});

  useEffect(() => {
    const storedProfiles = localStorage.getItem("profiles");
    if (storedProfiles) {
      setProfiles(JSON.parse(storedProfiles));
    } else {
      setProfiles({ default: { masteryStatus: {}, metadata: {} } });
    }
  }, []);

  useEffect(() => {
    if (Object.keys(profiles).length > 0) {
      localStorage.setItem("profiles", JSON.stringify(profiles));
    }
  }, [profiles]);

  const updateMastery = (
    subject: string,
    standardId: string,
    status: MasteryStatus
  ) => {
    setProfiles((prevProfiles) => ({
      ...prevProfiles,
      [selectedProfileId]: {
        ...prevProfiles[selectedProfileId],
        masteryStatus: {
          ...prevProfiles[selectedProfileId].masteryStatus,
          [subject]: {
            ...prevProfiles[selectedProfileId].masteryStatus[subject],
            [standardId]: status,
          },
        },
      },
    }));
  };

  const clearMastery = (subject: string, standardId: string) => {
    setProfiles((prevProfiles) => {
      const newProfiles = { ...prevProfiles };
      delete newProfiles[selectedProfileId].masteryStatus[subject][standardId];
      return newProfiles;
    });
  };

  const getMastery = (subject: string, standardId: string) => {
    return (
      profiles[selectedProfileId]?.masteryStatus[subject]?.[standardId] ||
      "not_started"
    );
  };

  const createProfile = (profile: Profile) => {
    setProfiles((prevProfiles) => ({
      ...prevProfiles,
      [profile.id]: {
        masteryStatus: {},
        metadata: profile.metadata,
      },
    }));
  };

  const deleteProfile = (profileId: string) => {
    setProfiles((prevProfiles) => {
      const newProfiles = { ...prevProfiles };
      delete newProfiles[profileId];
      return newProfiles;
    });
  };

  const getProfileMetadata = (profileId: string) => {
    return profiles[profileId]?.metadata || {};
  };

  const getProfiles = () => {
    return profiles;
  };

  return {
    updateMastery,
    clearMastery,
    getMastery,
    createProfile,
    deleteProfile,
    getProfileMetadata,
    getProfiles,
  };
};

export default useStandardMastery;
