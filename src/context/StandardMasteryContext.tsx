import React, { createContext, useState, useContext, useEffect } from "react";

export type MasteryStatus = "completed" | "needs_improvement" | "not_started";

export interface MasteryEntry {
  status: MasteryStatus;
  updatedAt: string | null;
}

export interface Profile {
  displayName: string;
  masteryStatus: {
    [subject: string]: {
      [standardId: string]: MasteryEntry;
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
  getMasteryEntry: (subject: string, standardId: string) => MasteryEntry;
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

function migrateProfileData(id: string, profileData: unknown): Profile {
  const data = profileData as Partial<Profile> & { id?: string };
  const rawMastery = (data.masteryStatus || {}) as Record<
    string,
    Record<string, unknown>
  >;
  const metadata = data.metadata || {};
  const schemaVersion = (metadata as Record<string, unknown>).schemaVersion;

  if (typeof schemaVersion === "number" && schemaVersion >= 2) {
    return {
      displayName: data.displayName || data.id || id,
      masteryStatus: rawMastery as Profile["masteryStatus"],
      metadata,
    };
  }

  // Coerce plain strings → MasteryEntry
  const migratedMastery: Profile["masteryStatus"] = {};
  Object.entries(rawMastery).forEach(([subject, standards]) => {
    migratedMastery[subject] = {};
    Object.entries(standards).forEach(([standardId, value]) => {
      if (typeof value === "string") {
        migratedMastery[subject][standardId] = {
          status: value as MasteryStatus,
          updatedAt: null,
        };
      } else {
        migratedMastery[subject][standardId] = value as MasteryEntry;
      }
    });
  });

  return {
    displayName: data.displayName || data.id || id,
    masteryStatus: migratedMastery,
    metadata: { ...metadata, schemaVersion: 2 },
  };
}

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
            migratedProfiles[id] = migrateProfileData(id, profileData);
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
      if (!prevProfiles[selectedProfileId]) return prevProfiles;
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
              [standardId]: {
                status,
                updatedAt: new Date().toISOString(),
              },
            },
          },
        },
      };
    });
  };

  const clearMastery = (subject: string, standardId: string) => {
    setProfiles((prevProfiles) => {
      if (
        !prevProfiles[selectedProfileId] ||
        !prevProfiles[selectedProfileId].masteryStatus ||
        !prevProfiles[selectedProfileId].masteryStatus[subject]
      ) {
        return prevProfiles;
      }
      const newProfiles = { ...prevProfiles };
      const newSubjectStatus = {
        ...newProfiles[selectedProfileId].masteryStatus[subject],
      };
      delete newSubjectStatus[standardId];
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

  const getMastery = (subject: string, standardId: string): MasteryStatus => {
    const entry =
      profiles[selectedProfileId]?.masteryStatus?.[subject]?.[standardId];
    return entry?.status ?? "not_started";
  };

  const getMasteryEntry = (
    subject: string,
    standardId: string
  ): MasteryEntry => {
    const entry =
      profiles[selectedProfileId]?.masteryStatus?.[subject]?.[standardId];
    return entry ?? { status: "not_started", updatedAt: null };
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
      Object.values(masteryStatus[subject]).forEach((entry) => {
        total++;
        if (entry.status === "completed") completed++;
        if (entry.status === "needs_improvement") needs_improvement++;
      });
    });
    return { completed, needs_improvement, total };
  };

  const createProfile = (profileData: {
    name: string;
    metadata: Record<string, unknown>;
  }) => {
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

  const deleteProfile = (profileId: string) => {
    setProfiles((prevProfiles) => {
      const restProfiles = { ...prevProfiles };
      delete restProfiles[profileId];
      return restProfiles;
    });
  };

  const getProfiles = () => {
    return Object.entries(profiles).map(([id, profile]) => ({
      id,
      displayName: profile.displayName,
    }));
  };

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
        getMasteryEntry,
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
