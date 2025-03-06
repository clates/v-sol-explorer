import { useState, useEffect } from "react";

export type MasteryStatus = "completed" | "needs_improvement" | "not_started";

interface Profile {
  displayName: string; // What users see/edit
  masteryStatus: {
    [subject: string]: {
      // Subject like "Math" or "Computer Science"
      [standardId: string]: MasteryStatus; // Standard IDs like "k.1", "CS-VA-2017-1.1a"
    };
  };
  metadata: {
    [key: string]: any;
  };
}

interface ProfileData {
  [profileId: string]: Profile;
}

export const useStandardMastery = (selectedProfileId: string) => {
  const [profiles, setProfiles] = useState<ProfileData>({});

  // Load profiles from localStorage on mount
  useEffect(() => {
    const storedProfiles = localStorage.getItem("profiles");
    if (storedProfiles) {
      try {
        const loadedProfiles = JSON.parse(storedProfiles);
        // Migration for existing profiles
        const migratedProfiles: ProfileData = {};

        Object.entries(loadedProfiles).forEach(
          ([id, profileData]: [string, any]) => {
            migratedProfiles[id] = {
              displayName: profileData.displayName || profileData.id || id, // small bit of migration for old profiles
              masteryStatus: profileData.masteryStatus || {},
              metadata: profileData.metadata || {},
            };
          }
        );

        setProfiles(migratedProfiles);
      } catch (e) {
        console.error("Error loading profiles:", e);
        createDefaultProfile();
      }
    } else {
      createDefaultProfile();
    }
  }, []);

  const createDefaultProfile = () => {
    const defaultId = crypto.randomUUID();
    setProfiles({
      [defaultId]: {
        displayName: "Default",
        masteryStatus: {},
        metadata: {},
      },
    });
  };

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
    // Add better null checking
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

  // Update getProfileMasteryCount to match new structure
  const getProfileMasteryCount = (profileId: string) => {
    if (!profiles[profileId] || !profiles[profileId].masteryStatus) {
      return { mastered: 0, learning: 0, total: 0 };
    }

    let mastered = 0;
    let learning = 0;
    let total = 0;

    const masteryStatus = profiles[profileId].masteryStatus;

    Object.keys(masteryStatus).forEach((subject) => {
      Object.values(masteryStatus[subject]).forEach((status) => {
        total++;
        if (status === "completed") mastered++;
        if (status === "needs_improvement") learning++;
      });
    });

    return { mastered, learning, total };
  };

  // Create a new profile with stable UUID
  const createProfile = (profileData: { name: string; metadata: any }) => {
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

  // Delete profile (remains largely unchanged)
  const deleteProfile = (profileId: string) => {
    setProfiles((prevProfiles) => {
      const { [profileId]: _, ...restProfiles } = prevProfiles;
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

  // Update profile display name (replaces updateProfileId)
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

  const updateProfileId = (oldProfileId: string, newProfileId: string) => {
    setProfiles((prevProfiles) => {
      const { [oldProfileId]: profile, ...restProfiles } = prevProfiles;
      if (!profile) return prevProfiles; // Safety check

      // Don't add an id field to the profile object, just create a new entry with the new ID
      const newProfiles = {
        ...restProfiles,
        [newProfileId]: profile, // Keep the same profile structure
      };
      return newProfiles;
    });
  };

  return {
    updateMastery,
    clearMastery,
    getMastery,
    createProfile,
    deleteProfile,
    getProfiles,
    updateProfileId,
    updateProfileDisplayName,
  };
};

export default useStandardMastery;
