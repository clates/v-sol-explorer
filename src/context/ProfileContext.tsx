import React, { createContext, useState, useContext } from "react";

interface ProfileContextType {
  selectedProfile: string;
  setSelectedProfile: React.Dispatch<React.SetStateAction<string>>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProfile, setSelectedProfile] = useState("default");

  return (
    <ProfileContext.Provider value={{ selectedProfile, setSelectedProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};