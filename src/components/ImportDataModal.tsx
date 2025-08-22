import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Profile,
  ProfileData,
  useStandardMastery,
} from "../context/StandardMasteryContext";

interface ImportDataModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

type ImportStep = "input" | "confirm" | "complete";
type ProfileImportStatus = "new" | "overwrite" | "unchanged";

interface ProfileComparisonItem {
  id: string;
  displayName: string;
  status: ProfileImportStatus;
  existingData?: {
    displayName: string;
    completed: number;
    needs_improvement: number;
    total: number;
  };
  importedData: {
    displayName: string;
    completed: number;
    needs_improvement: number;
    total: number;
  };
}

const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  closeModal,
}) => {
  const { profiles, getProfileMasteryCount } = useStandardMastery();

  const [importStep, setImportStep] = useState<ImportStep>("input");
  const [importText, setImportText] = useState("");
  const [parsedData, setParsedData] = useState<ProfileData>({});
  const [error, setError] = useState<string | null>(null);
  const [profileComparison, setProfileComparison] = useState<
    ProfileComparisonItem[]
  >([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setImportStep("input");
      setImportText("");
      setParsedData({});
      setError(null);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setImportText(e.target.value);
    setError(null);
  };

  const validateAndParse = () => {
    try {
      if (!importText.trim()) {
        setError("Please enter some data to import");
        return;
      }

      // Attempt to parse the JSON
      const parsed = JSON.parse(importText);

      // Basic validation that it's a profiles object
      if (typeof parsed !== "object" || parsed === null) {
        setError("Invalid data format: Not a valid profiles object");
        return;
      }

      // Check if it contains any profiles
      if (Object.keys(parsed).length === 0) {
        setError("No profiles found in the imported data");
        return;
      }

      // Check if profiles have required structure
      for (const [id, profile] of Object.entries(
        parsed as Record<string, unknown>
      )) {
        const p = profile as {
          displayName?: unknown;
          masteryStatus?: unknown;
        };
        if (
          typeof p.displayName !== "string" ||
          typeof p.masteryStatus !== "object" ||
          p.masteryStatus === null
        ) {
          setError(`Invalid profile format for ID: ${id}`);
          return;
        }
      }

      // If we get here, the data is valid
      setParsedData(parsed as ProfileData);
      analyzeImportData(parsed as ProfileData);
      setImportStep("confirm");
    } catch (e) {
      setError(
        `Error parsing data: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  };

  const analyzeImportData = (importedProfiles: ProfileData) => {
    const comparison: ProfileComparisonItem[] = [];

    // Create a comparison of existing vs imported profiles
    for (const [id, importedProfile] of Object.entries(importedProfiles)) {
      const importedName = importedProfile.displayName;
      const importedStats = calculateProfileStats(importedProfile);

      if (id in profiles) {
        // Profile exists - will be overwritten
        const existingProfile = profiles[id];
        const existingStats = getProfileMasteryCount(id);

        comparison.push({
          id,
          displayName: importedName,
          status: "overwrite",
          existingData: {
            displayName: existingProfile.displayName,
            completed: existingStats.completed,
            needs_improvement: existingStats.needs_improvement,
            total: existingStats.total,
          },
          importedData: { ...importedStats, displayName: importedName },
        });
      } else {
        // New profile to be added
        comparison.push({
          id,
          displayName: importedName,
          status: "new",
          importedData: { ...importedStats, displayName: importedName },
        });
      }
    }

    // Add profiles that will remain unchanged
    for (const [id, profile] of Object.entries(profiles)) {
      if (!(id in importedProfiles)) {
        const stats = getProfileMasteryCount(id);
        comparison.push({
          id,
          displayName: profile.displayName,
          status: "unchanged",
          existingData: {
            displayName: profile.displayName,
            completed: stats.completed,
            needs_improvement: stats.needs_improvement,
            total: stats.total,
          },
          importedData: {
            displayName: profile.displayName,
            completed: stats.completed,
            needs_improvement: stats.needs_improvement,
            total: stats.total,
          },
        });
      }
    }

    // Sort by status: new, overwrite, unchanged
    comparison.sort((a, b) => {
      const order = { new: 0, overwrite: 1, unchanged: 2 };
      return order[a.status] - order[b.status];
    });

    setProfileComparison(comparison);
  };

  const calculateProfileStats = (profile: Profile) => {
    let completed = 0;
    let needs_improvement = 0;
    let total = 0;

    const masteryStatus = profile.masteryStatus;

    Object.values(masteryStatus).forEach((subject) => {
      Object.values(subject).forEach((status) => {
        total++;
        if (status === "completed") completed++;
        if (status === "needs_improvement") needs_improvement++;
      });
    });

    return { completed, needs_improvement, total };
  };

  const handleImport = async () => {
    // Import the data via localStorage
    if (parsedData) {
      try {
        // Merge the imported profiles with existing profiles
        const mergedProfiles = { ...profiles, ...parsedData };

        // Update localStorage
        localStorage.setItem("profiles", JSON.stringify(mergedProfiles));

        // Move to completion step
        setImportStep("complete");
      } catch (e) {
        setError(
          `Error importing data: ${e instanceof Error ? e.message : String(e)}`
        );
        setImportStep("input");
      }
    }
  };

  const forceReload = () => {
    window.location.reload();
  }

  const renderStatusIcon = (status: ProfileImportStatus) => {
    switch (status) {
      case "new":
        return <PlusCircleIcon className="h-5 w-5 text-green-500" />;
      case "overwrite":
        return <ArrowPathIcon className="h-5 w-5 text-yellow-500" />;
      case "unchanged":
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const renderStatusBadge = (status: ProfileImportStatus) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            New
          </span>
        );
      case "overwrite":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
            Will Update
          </span>
        );
      case "unchanged":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
            Unchanged
          </span>
        );
    }
  };

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
                    Import Data
                  </Dialog.Title>

                  {/* Step 1: Input */}
                  {importStep === "input" && (
                    <>
                      <p className="text-sm text-gray-500 mt-2">
                        Paste the profile data you wish to import. This will
                        merge with your existing profiles.
                      </p>

                      <textarea
                        className="w-full mt-4 p-2 border border-gray-300 rounded font-mono text-sm"
                        rows={10}
                        value={importText}
                        onChange={handleInputChange}
                        placeholder='Paste exported data here. Example: {"profile-id-1":{"displayName":"Profile 1","masteryStatus":{...}}}'
                      />

                      {error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                          <div className="flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                            {error}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Step 2: Confirmation */}
                  {importStep === "confirm" && (
                    <>
                      <div className="rounded-md bg-yellow-50 p-4 mt-2">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <ExclamationTriangleIcon
                              className="h-5 w-5 text-yellow-400"
                              aria-hidden="true"
                            />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              Please review the changes before importing
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>
                                Importing will merge these profiles with your
                                existing data. Any profiles with the same ID
                                will be overwritten.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3 max-h-72 overflow-y-auto">
                        {profileComparison.map((profile) => (
                          <div
                            key={profile.id}
                            className="bg-white border border-gray-200 rounded-lg shadow-sm"
                          >
                            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                              <div className="font-medium flex items-center">
                                {renderStatusIcon(profile.status)}
                                <span className="ml-2">
                                  {profile.displayName}
                                </span>
                              </div>
                              {renderStatusBadge(profile.status)}
                            </div>

                            <div className="p-3">
                              {profile.status === "overwrite" && (
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <h4 className="text-xs font-medium text-gray-500">
                                      Current Data
                                    </h4>
                                    <div className="bg-white rounded-md p-2 flex items-center mt-1">
                                      <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
                                      <div>
                                        <div className="font-medium text-sm">
                                          {profile.existingData?.displayName}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                          <span className="text-emerald-700 font-medium mr-1">
                                            {profile.existingData?.completed}
                                          </span>{" "}
                                          /
                                          <span className="text-amber-500 font-medium mx-1">
                                            {
                                              profile.existingData
                                                ?.needs_improvement
                                            }
                                          </span>{" "}
                                          /
                                          <span className="text-indigo-500 font-medium mx-1">
                                            {(profile.existingData?.total ||
                                              0) -
                                              (profile.existingData
                                                ?.completed || 0) -
                                              (profile.existingData
                                                ?.needs_improvement || 0)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="text-xs font-medium text-gray-500">
                                      Imported Data
                                    </h4>
                                    <div className="bg-white rounded-md p-2 flex items-center mt-1 border-green-200 border">
                                      <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
                                      <div>
                                        <div className="font-medium text-sm">
                                          {profile.importedData.displayName}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                          <span className="text-emerald-700 font-medium mr-1">
                                            {profile.importedData.completed}
                                          </span>{" "}
                                          /
                                          <span className="text-amber-500 font-medium mx-1">
                                            {
                                              profile.importedData
                                                .needs_improvement
                                            }
                                          </span>{" "}
                                          /
                                          <span className="text-indigo-500 font-medium mx-1">
                                            {profile.importedData.total -
                                              profile.importedData.completed -
                                              profile.importedData
                                                .needs_improvement}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {profile.status === "new" && (
                                <div className="bg-white rounded-md p-2 flex items-center border-green-200 border">
                                  <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
                                  <div>
                                    <div className="font-medium text-sm">
                                      {profile.importedData.displayName}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                      <span className="text-emerald-700 font-medium mr-1">
                                        {profile.importedData.completed}
                                      </span>{" "}
                                      /
                                      <span className="text-amber-500 font-medium mx-1">
                                        {profile.importedData.needs_improvement}
                                      </span>{" "}
                                      /
                                      <span className="text-indigo-500 font-medium mx-1">
                                        {profile.importedData.total -
                                          profile.importedData.completed -
                                          profile.importedData
                                            .needs_improvement}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {profile.status === "unchanged" && (
                                <div className="bg-white rounded-md p-2 flex items-center">
                                  <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
                                  <div>
                                    <div className="font-medium text-sm">
                                      {profile.displayName}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                      <span className="text-emerald-700 font-medium mr-1">
                                        {profile.existingData?.completed}
                                      </span>{" "}
                                      /
                                      <span className="text-amber-500 font-medium mx-1">
                                        {
                                          profile.existingData
                                            ?.needs_improvement
                                        }
                                      </span>{" "}
                                      /
                                      <span className="text-indigo-500 font-medium mx-1">
                                        {(profile.existingData?.total || 0) -
                                          (profile.existingData?.completed ||
                                            0) -
                                          (profile.existingData
                                            ?.needs_improvement || 0)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Step 3: Complete */}
                  {importStep === "complete" && (
                    <div className="text-center py-10">
                      <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                      <h3 className="mt-4 text-lg font-semibold">
                        Import Successful
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Your profiles have been updated with the imported data.
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  {importStep === "input" && (
                    <>
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                        onClick={validateAndParse}
                      >
                        Continue
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {importStep === "confirm" && (
                    <>
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                        onClick={handleImport}
                      >
                        Import
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => setImportStep("input")}
                      >
                        Back
                      </button>
                    </>
                  )}

                  {importStep === "complete" && (
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                      onClick={forceReload}
                    >
                      Close
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ImportDataModal;
