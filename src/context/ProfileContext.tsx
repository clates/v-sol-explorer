import React, { createContext, useState, useContext, useEffect } from "react";

interface ProfileContextType {
  selectedProfileId: string;
  setSelectedProfileId: React.Dispatch<React.SetStateAction<string>>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");

  // Initialize with first profile ID on mount or create a default profile if none exists
  useEffect(() => {
    const storedProfiles = localStorage.getItem("profiles");
    if (storedProfiles) {
      try {
        const profiles = JSON.parse(storedProfiles);
        const firstProfileId = Object.keys(profiles)[0];
        if (firstProfileId) {
          setSelectedProfileId(firstProfileId);
        } else {
          createAndSelectDefaultProfile();
        }
      } catch (e) {
        console.error("Error loading profile ID:", e);
        createAndSelectDefaultProfile();
      }
    } else {
      createAndSelectDefaultProfile();
    }
  }, []);

  // Create a minimal default profile just to get an ID
  const createAndSelectDefaultProfile = () => {
    const defaultId = crypto.randomUUID();
    const defaultProfile = {
      [defaultId]: {
        displayName: "Student (⚙️ to update)",
        masteryStatus: {},
        metadata: {},
      }
    };
    
    localStorage.setItem("profiles", JSON.stringify(defaultProfile));
    setSelectedProfileId(defaultId);
  };

  return (
    <ProfileContext.Provider value={{ selectedProfileId, setSelectedProfileId }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};