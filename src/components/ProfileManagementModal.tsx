import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useProfile } from "../context/ProfileContext";
import { useStandardMastery } from "../context/StandardMasteryContext";
import { UserCircleIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ProfileManagementModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const ProfileManagementModal: React.FC<ProfileManagementModalProps> = ({
  isOpen,
  closeModal,
}) => {
  const { selectedProfileId, setSelectedProfileId } = useProfile();
  const {
    createProfile,
    deleteProfile,
    getProfiles,
    updateProfileDisplayName,
    getProfileMasteryCount,
  } = useStandardMastery();

  const [newProfileName, setNewProfileName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editedProfileName, setEditedProfileName] = useState("");

  const handleProfileClick = (profileId: string) => {
    setSelectedProfileId(profileId);
  };

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      const newProfileId = createProfile({
        name: newProfileName.trim(),
        metadata: {},
      });
      setSelectedProfileId(newProfileId);
      setNewProfileName("");
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    if (confirmDelete !== profileId) {
      setConfirmDelete(profileId);
    } else {
      deleteProfile(profileId);
      setConfirmDelete(null);
    }
  };

  const handleEditProfile = (profileId: string, currentDisplayName: string) => {
    setEditingProfileId(profileId);
    setEditedProfileName(currentDisplayName);
  };

  const handleSaveProfile = (profileId: string) => {
    updateProfileDisplayName(profileId, editedProfileName);
    setEditingProfileId(null);
    setEditedProfileName("");
  };

  const profiles = getProfiles();

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    Profiles
                  </Dialog.Title>
                  
                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="flex-grow p-2 border border-gray-300 rounded"
                        placeholder="New profile name"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                      />
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition-colors cursor-pointer flex-shrink-0"
                        onClick={handleCreateProfile}
                      >
                        Create
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 max-h-72 overflow-y-auto">
                    {profiles.map(({ id, displayName }) => {
                      const stats = getProfileMasteryCount(id);
                      const isActive = selectedProfileId === id;
                      
                      return (
                        <div
                          key={id}
                          className={`bg-white border rounded-lg shadow-sm transition-all ${
                            isActive ? "border-emerald-300 ring-2 ring-emerald-200" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div 
                            className={`px-3 py-3 flex items-center cursor-pointer ${
                              editingProfileId === id ? "" : "hover:bg-gray-50"
                            }`}
                            onClick={() => handleProfileClick(id)}
                          >
                            <div className="relative">
                              <UserCircleIcon className={`h-10 w-10 ${isActive ? "text-emerald-500" : "text-gray-400"}`} />
                              {isActive && (
                                <CheckCircleIcon 
                                  className="absolute -bottom-1 -right-1 h-5 w-5 text-emerald-500 bg-white rounded-full" 
                                />
                              )}
                            </div>
                            
                            <div className="ml-3 mr-1 flex-grow">
                              {editingProfileId === id ? (
                                <input
                                  type="text"
                                  value={editedProfileName}
                                  onChange={(e) => setEditedProfileName(e.target.value)}
                                  className="w-full p-1 border border-gray-300 rounded"
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <>
                                  <div className="font-medium">
                                    {displayName}
                                    {isActive && (
                                      <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <span className="text-emerald-700 font-medium mr-1">
                                      {stats.completed}
                                    </span> completed,
                                    <span className="text-amber-500 font-medium mx-1">
                                      {stats.needs_improvement}
                                    </span> needs work,
                                    <span className="text-indigo-500 font-medium mx-1">
                                      {stats.total - stats.completed - stats.needs_improvement}
                                    </span> not started
                                  </div>
                                </>
                              )}
                            </div>
                            
                            <div className="flex space-x-1">
                              {editingProfileId === id ? (
                                <button
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveProfile(id);
                                  }}
                                >
                                  <CheckCircleIcon className="h-6 w-6" />
                                </button>
                              ) : (
                                <button
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditProfile(id, displayName);
                                  }}
                                >
                                  <PencilSquareIcon className="h-5 w-5" />
                                </button>
                              )}
                              
                              {!isActive && (
                                <button
                                  className={`p-1 rounded cursor-pointer ${
                                    confirmDelete === id 
                                      ? "text-white bg-red-500 hover:bg-red-600" 
                                      : "text-red-500 hover:bg-red-50"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProfile(id);
                                  }}
                                  disabled={isActive}
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto cursor-pointer"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ProfileManagementModal;