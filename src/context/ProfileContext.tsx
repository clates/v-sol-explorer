import React, { createContext, useState, useContext, useEffect } from "react";

interface ProfileContextType {
  selectedProfileId: string;
  setSelectedProfileId: React.Dispatch<React.SetStateAction<string>>;
  isProfileLoading: boolean; // Add this loading state
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [isProfileLoading, setIsProfileLoading] = useState(true); // Add loading state

  // Initialize with first profile ID on mount or create a default profile if none exists
  useEffect(() => {
    const initializeProfile = async () => {
      setIsProfileLoading(true);
      
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
      
      setIsProfileLoading(false);
    };
    
    initializeProfile();
  }, []);

  const createAndSelectDefaultProfile = () => {
    const defaultId = crypto.randomUUID();
    const defaultProfile = {
      [defaultId]: {
        displayName: "Student (⚙️ to update)",
        masteryStatus: {
          "Computer Science": {
            "CS-VA-2017-1.1b": "completed",
            "CS-VA-2017-1.2a": "needs_improvement"
          }},
        metadata: {},
      }
    };
    
    localStorage.setItem("profiles", JSON.stringify(defaultProfile));
    setSelectedProfileId(defaultId);
  };

  return (
    <ProfileContext.Provider value={{ selectedProfileId, setSelectedProfileId, isProfileLoading }}>
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