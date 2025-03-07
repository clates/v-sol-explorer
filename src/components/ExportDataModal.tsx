import React, { useRef, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { useStandardMastery } from "../context/StandardMasteryContext";

interface ExportDataModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const ExportDataModal: React.FC<ExportDataModalProps> = ({ 
  isOpen, 
  closeModal 
}) => {
  const { getProfiles, getProfileMasteryCount, profiles } = useStandardMastery();
  const exportDataRef = useRef<HTMLTextAreaElement>(null);
  const [exportData, setExportData] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Update export data when modal opens or profiles change
  useEffect(() => {
    if (isOpen) {
      const profilesData = JSON.stringify(profiles, null, 2);
      setExportData(profilesData);
    }
  }, [isOpen, profiles]);

  const copyToClipboard = () => {
    if (exportDataRef.current) {
      exportDataRef.current.select();
      document.execCommand("copy");
      // Show success indicator
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
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
                    Export Data
                  </Dialog.Title>

                  {/* Profile Summary Section */}
                  <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      You're exporting the following profile data:
                    </p>

                    <div className="space-y-2 max-h-40 overflow-auto">
                      {getProfiles().map((profile) => {
                        const stats = getProfileMasteryCount(profile.id);
                        return (
                          <div
                            key={profile.id}
                            className="bg-white rounded-md shadow-sm p-2 flex items-center"
                          >
                            <UserCircleIcon className="h-8 w-8 text-gray-500 mr-3" />

                            <div className="flex-grow">
                              <div className="font-medium">
                                {profile.displayName}
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
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <textarea
                    ref={exportDataRef}
                    className="w-full mt-4 p-2 border border-gray-300 rounded font-mono text-sm"
                    rows={10}
                    readOnly
                    value={exportData}
                  />

                  <div className="mt-2 text-xs text-gray-500">
                    This data can be imported later using the Import function.
                    Save this text in a secure location.
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className={`inline-flex w-full justify-center rounded-md ${
                      copySuccess
                        ? "bg-green-600 hover:bg-green-700 lg:w-48"
                        : "bg-blue-600 hover:bg-blue-500 lg:w-48"
                    } px-3 py-2 text-sm font-semibold text-white w-auto shadow-sm sm:ml-3 cursor-pointer transition-all duration-700`}
                    onClick={copyToClipboard}
                  >
                    <ClipboardDocumentIcon
                      className="h-5 w-5 mr-2"
                      aria-hidden="true"
                    />
                    {copySuccess ? "Copied!" : "Copy to Clipboard"}
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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

export default ExportDataModal;