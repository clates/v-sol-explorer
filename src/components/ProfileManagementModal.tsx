import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useProfile } from "../context/ProfileContext";
import useStandardMastery from "../hooks/useStandardMastery";

interface ProfileManagementModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const ProfileManagementModal: React.FC<ProfileManagementModalProps> = ({
  isOpen,
  closeModal,
}) => {
  const { selectedProfile, setSelectedProfile } = useProfile();
  const { createProfile, deleteProfile, getProfiles, updateProfileId } =
    useStandardMastery(selectedProfile);
  const [newProfileName, setNewProfileName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [editedProfileId, setEditedProfileId] = useState("");

  const handleProfileClick = (profile: string) => {
    setSelectedProfile(profile);
  };

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      createProfile({
        id: newProfileName.trim(),
        name: newProfileName.trim(),
        metadata: {},
      });
      setSelectedProfile(newProfileName.trim());
      setNewProfileName("");
    }
  };

  const handleDeleteProfile = (profile: string) => {
    if (confirmDelete !== profile) {
      setConfirmDelete(profile);
    } else {
      deleteProfile(profile);
      setConfirmDelete(null);
    }
  };

  const handleEditProfile = (profile: string) => {
    setEditingProfile(profile);
    setEditedProfileId(profile);
  };

  const handleSaveProfile = (profile: string) => {
    updateProfileId(profile, editedProfileId);
    setEditingProfile(null);
    setEditedProfileId("");
    handleProfileClick(editedProfileId);
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
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="New profile name"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                    />
                    <button
                      className="mt-2 w-full bg-blue-600 text-white p-2 rounded cursor-pointer"
                      onClick={handleCreateProfile}
                    >
                      Create Profile
                    </button>
                  </div>
                  <ul className="mt-4">
                    {Object.keys(profiles).map((profile) => (
                      <li
                        key={profile}
                        className={`flex justify-between items-center p-2 border-b border-gray-200 ${
                          selectedProfile === profile
                            ? "bg-gradient-to-r from-green-200 to-transparent to-20%"
                            : "hover:bg-gray-100 cursor-pointer"
                        } `}
                        onClick={() => handleProfileClick(profile)}
                      >
                        {editingProfile === profile ? (
                          <input
                            type="text"
                            value={editedProfileId}
                            onChange={(e) => setEditedProfileId(e.target.value)}
                            className="w-full p-1 border border-gray-300 rounded"
                          />
                        ) : (
                          profile
                        )}
                        <div className="flex items-center">
                          {editingProfile === profile ? (
                            <button
                              className="ml-2 text-green-600 border border-green-600 hover:bg-green-600 hover:text-white rounded px-2 py-1 transition-all cursor-pointer"
                              onClick={() => handleSaveProfile(profile)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                          ) : (
                            <button
                              className="ml-2 text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white rounded px-2 py-1 transition-all cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProfile(profile);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                />
                              </svg>
                            </button>
                          )}
                          <button
                            className={`ml-2 text-red-600 border border-red-600 rounded px-2 py-1 transition-all ${
                              confirmDelete === profile
                                ? "bg-red-600 text-white"
                                : "hover:bg-red-600 hover:text-white "
                            } ${
                              selectedProfile === profile
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProfile(profile);
                            }}
                            disabled={selectedProfile === profile}
                          >
                            {confirmDelete === profile
                              ? "Are you sure?"
                              : "Delete"}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
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
