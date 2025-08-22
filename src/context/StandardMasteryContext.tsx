import React, { createContext, useState, useContext, useEffect } from "react";

export type MasteryStatus = "completed" | "needs_improvement" | "not_started";

export interface Profile {
  displayName: string;
  masteryStatus: {
    [subject: string]: {
      [standardId: string]: MasteryStatus;
    };
  };
  metadata: Record<string, unknown>;
}

export interface ProfileData {
  [profileId: string]: Profile;
}

interface StandardMasteryContextType {
  profiles: ProfileData;
  updateMastery: (
    subject: string,
    standardId: string,
    status: MasteryStatus
  ) => void;
  clearMastery: (subject: string, standardId: string) => void;
  getMastery: (subject: string, standardId: string) => MasteryStatus;
  createProfile: (
    profileData: { name: string; metadata: Record<string, unknown> }
  ) => string;
  deleteProfile: (profileId: string) => void;
  getProfiles: () => Array<{ id: string; displayName: string }>;
  updateProfileDisplayName: (profileId: string, newDisplayName: string) => void;
  getProfileMasteryCount: (profileId: string) => {
    completed: number;
    needs_improvement: number;
    total: number;
  };
}

const StandardMasteryContext = createContext<
  StandardMasteryContextType | undefined
>(undefined);

export const StandardMasteryProvider: React.FC<{
  children: React.ReactNode;
  selectedProfileId: string;
}> = ({ children, selectedProfileId }) => {
  const [profiles, setProfiles] = useState<ProfileData>({});

  // Load profiles from localStorage on mount
  useEffect(() => {
    const storedProfiles = localStorage.getItem("profiles");
    if (storedProfiles) {
      try {
        const loadedProfiles = JSON.parse(storedProfiles);
        const migratedProfiles: ProfileData = {};

        Object.entries(loadedProfiles).forEach(
          ([id, profileData]: [string, unknown]) => {
            const data = profileData as Partial<Profile> & { id?: string };
            migratedProfiles[id] = {
              displayName: data.displayName || data.id || id,
              masteryStatus: data.masteryStatus || {},
              metadata: data.metadata || {},
            };
          }
        );

        setProfiles(migratedProfiles);
      } catch (e) {
        console.error("Error loading profiles:", e);
      }
    }
  }, []);

  // Save profiles to localStorage when they change
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
    setProfiles((prevProfiles) => {
      // Safety check
      if (!prevProfiles[selectedProfileId]) return prevProfiles;

      // Create subject object if it doesn't exist
      const currentMasteryStatus =
        prevProfiles[selectedProfileId].masteryStatus || {};
      const subjectStatus = currentMasteryStatus[subject] || {};

      return {
        ...prevProfiles,
        [selectedProfileId]: {
          ...prevProfiles[selectedProfileId],
          masteryStatus: {
            ...currentMasteryStatus,
            [subject]: {
              ...subjectStatus,
              [standardId]: status,
            },
          },
        },
      };
    });
  };

  const clearMastery = (subject: string, standardId: string) => {
    setProfiles((prevProfiles) => {
      // Safety check
      if (
        !prevProfiles[selectedProfileId] ||
        !prevProfiles[selectedProfileId].masteryStatus ||
        !prevProfiles[selectedProfileId].masteryStatus[subject]
      ) {
        return prevProfiles;
      }

      // Create a new object to avoid direct mutations
      const newProfiles = { ...prevProfiles };
      const newSubjectStatus = {
        ...newProfiles[selectedProfileId].masteryStatus[subject],
      };

      // Delete the standard's status
      delete newSubjectStatus[standardId];

      // Update the profiles with the modified subject status
      newProfiles[selectedProfileId] = {
        ...newProfiles[selectedProfileId],
        masteryStatus: {
          ...newProfiles[selectedProfileId].masteryStatus,
          [subject]: newSubjectStatus,
        },
      };

      return newProfiles;
    });
  };

  const getMastery = (subject: string, standardId: string) => {
    if (
      !profiles[selectedProfileId] ||
      !profiles[selectedProfileId].masteryStatus ||
      !profiles[selectedProfileId].masteryStatus[subject]
    ) {
      return "not_started";
    }

    return (
      profiles[selectedProfileId].masteryStatus[subject][standardId] ||
      "not_started"
    );
  };

  const getProfileMasteryCount = (profileId: string) => {
    if (!profiles[profileId] || !profiles[profileId].masteryStatus) {
      return { completed: 0, needs_improvement: 0, total: 0 };
    }

    let completed = 0;
    let needs_improvement = 0;
    let total = 0;

    const masteryStatus = profiles[profileId].masteryStatus;

    Object.keys(masteryStatus).forEach((subject) => {
      Object.values(masteryStatus[subject]).forEach((status) => {
        total++;
        if (status === "completed") completed++;
        if (status === "needs_improvement") needs_improvement++;
      });
    });

    return { completed, needs_improvement, total };
  };

  // Create a new profile with stable UUID
  const createProfile = (
    profileData: { name: string; metadata: Record<string, unknown> }
  ) => {
    const profileId = crypto.randomUUID();
    setProfiles((prevProfiles) => ({
      ...prevProfiles,
      [profileId]: {
        displayName: profileData.name,
        masteryStatus: {},
        metadata: profileData.metadata || {},
      },
    }));
    return profileId;
  };

  // Delete profile
  const deleteProfile = (profileId: string) => {
    setProfiles((prevProfiles) => {
      const restProfiles = { ...prevProfiles };
      delete restProfiles[profileId];
      return restProfiles;
    });
  };

  // Get all profiles with their IDs for display
  const getProfiles = () => {
    return Object.entries(profiles).map(([id, profile]) => ({
      id,
      displayName: profile.displayName,
    }));
  };

  // Update profile display name
  const updateProfileDisplayName = (
    profileId: string,
    newDisplayName: string
  ) => {
    setProfiles((prevProfiles) => {
      if (!prevProfiles[profileId]) return prevProfiles;

      return {
        ...prevProfiles,
        [profileId]: {
          ...prevProfiles[profileId],
          displayName: newDisplayName,
        },
      };
    });
  };

  return (
    <StandardMasteryContext.Provider
      value={{
        profiles,
        updateMastery,
        clearMastery,
        getMastery,
        createProfile,
        deleteProfile,
        getProfiles,
        updateProfileDisplayName,
        getProfileMasteryCount,
      }}
    >
      {children}
    </StandardMasteryContext.Provider>
  );
};

export const useStandardMastery = () => {
  const context = useContext(StandardMasteryContext);
  if (context === undefined) {
    throw new Error(
      "useStandardMastery must be used within a StandardMasteryProvider"
    );
  }
  return context;
};
