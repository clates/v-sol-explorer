import React, { useState, Fragment, useRef } from "react";
import {
  Dialog,
  Transition,
  Menu,
  Field,
  Checkbox,
  Label,
} from "@headlessui/react";
import { CogIcon } from "@heroicons/react/24/outline";
import ProfileManagementModal from "./ProfileManagementModal";
import ExportDataModal from "./ExportDataModal";
import ImportDataModal from "./ImportDataModal";

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
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
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

      {/* Launched modals */}
      <ProfileManagementModal
        isOpen={modalContent === "profiles"}
        closeModal={closeModal}
      />
      <ExportDataModal 
        isOpen={modalContent === "export"} 
        closeModal={closeModal} 
      />
      <ImportDataModal 
        isOpen={modalContent === "import"} 
        closeModal={closeModal} 
      />
    </div>
  );
};

export default SettingsFlyout;