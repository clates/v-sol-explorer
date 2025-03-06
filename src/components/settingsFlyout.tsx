import React, { useState, Fragment, useRef } from "react";
import {
  Dialog,
  Transition,
  Menu,
  Field,
  Checkbox,
  Label,
} from "@headlessui/react";
import { CogIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import ProfileManagementModal from "./ProfileManagementModal";

interface SettingsFlyoutProps {
  hideCompleted: boolean;
  setHideCompleted: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsFlyout: React.FC<SettingsFlyoutProps> = ({
  hideCompleted,
  setHideCompleted,
}) => {
  const [modalContent, setModalContent] = useState<
    "import" | "export" | "profiles" | null
  >(null);
  const buttonRef = useRef(null);
  const exportDataRef = useRef<HTMLTextAreaElement>(null);

  const openModal = (content: "import" | "export" | "profiles") => {
    setModalContent(content);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const copyToClipboard = () => {
    if (exportDataRef.current) {
      exportDataRef.current.select();
      document.execCommand("copy");
    }
  };

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button
            ref={buttonRef}
            className="p-1 lg:p2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none cursor-pointer"
          >
            <CogIcon className="h-6 w-6 text-gray-700" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1 ">
              <Menu.Item>
                {({ active }) => (
                  <Field
                    className={`${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    } group flex w-full items-center rounded-md px-2 py-2 gap-2 text-sm`}
                  >
                    <Checkbox
                      checked={hideCompleted}
                      onChange={() =>
                        setHideCompleted((prevState) => !prevState)
                      }
                      className="group block size-4 rounded border bg-white data-[checked]:bg-blue-300"
                    >
                      <svg
                        className="stroke-white opacity-0 transition group-data-[checked]:opacity-100"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M3 8L6 11L11 3.5"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Checkbox>
                    <Label>Hide Completed Standards</Label>
                  </Field>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm cursor-pointer`}
                    onClick={() => openModal("import")}
                  >
                    Import Data
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm cursor-pointer`}
                    onClick={() => openModal("export")}
                  >
                    Export Data
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm cursor-pointer`}
                    onClick={() => openModal("profiles")}
                  >
                    Profiles
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      <ProfileManagementModal
        isOpen={modalContent === "profiles"}
        closeModal={closeModal}
      />
      <Transition.Root show={modalContent === "export" || modalContent === "import"} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
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
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  {modalContent === "import" && (
                    <div>
                      <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-semibold leading-6 text-gray-900"
                        >
                          Import Data
                        </Dialog.Title>
                        <textarea
                          className="w-full mt-4 p-2 border border-gray-300 rounded"
                          rows={5}
                          placeholder="Not implemented yet :^)"
                        ></textarea>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                          type="button"
                          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto cursor-pointer"
                        >
                          Submit
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto cursor-pointer"
                          onClick={closeModal}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                  {modalContent === "export" && (
                    <div>
                      <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-semibold leading-6 text-gray-900"
                        >
                          Export Data
                        </Dialog.Title>
                        <textarea
                          ref={exportDataRef}
                          className="w-full mt-4 p-2 border border-gray-300 rounded"
                          rows={5}
                          readOnly
                          value={`{
  "sample": "not implemented yet :^) "
}`}
                        ></textarea>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                          type="button"
                          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto cursor-pointer"
                          onClick={copyToClipboard}
                        >
                          <ClipboardDocumentIcon
                            className="h-5 w-5 mr-2"
                            aria-hidden="true"
                          />
                          Copy
                        </button>
                        <button
                          type="button"
                          className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={closeModal}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default SettingsFlyout;
