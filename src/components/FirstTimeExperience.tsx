import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface FirstTimeExperienceProps {
  isOpen: boolean;
  onClose: () => void;
}

const slides = [
  {
    title: "Your Info Stays Here",
    body: "This app never connects to the internet. Everything you see or type stays on this computer.",
  },
  {
    title: "What \"on-device\" means",
    body: "On-device means your student's progress is saved only inside your browser. It isn't sent anywhere else.",
  },
  {
    title: "Manage students",
    body: "Click the gear in the top corner to add a student or edit a name.",
  },
  {
    title: "Share profiles",
    body: "Use Export to download a backup file and Import to load it on another computer.",
  },
];

const FirstTimeExperience: React.FC<FirstTimeExperienceProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState(0);

  const next = () => setStep((s) => Math.min(s + 1, slides.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const finish = () => {
    onClose();
    setStep(0);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={finish}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all">
              <div className="relative min-h-[150px]">
                {slides.map((slide, idx) => (
                  <Transition
                    key={idx}
                    show={idx === step}
                    as={Fragment}
                    enter="transition-opacity transform duration-300"
                    enterFrom="opacity-0 translate-x-4"
                    enterTo="opacity-100 translate-x-0"
                    leave="transition-opacity transform duration-300 absolute inset-0"
                    leaveFrom="opacity-100 translate-x-0"
                    leaveTo="opacity-0 -translate-x-4"
                  >
                    <div className="absolute inset-0">
                      <Dialog.Title className="text-lg font-semibold mb-2">
                        {slide.title}
                      </Dialog.Title>
                      <p className="text-sm text-gray-700">{slide.body}</p>
                    </div>
                  </Transition>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 disabled:opacity-40 cursor-pointer"
                  onClick={prev}
                  disabled={step === 0}
                >
                  Back
                </button>
                {step === slides.length - 1 ? (
                  <button
                    className="px-3 py-1 text-sm rounded bg-blue-600 text-white cursor-pointer"
                    onClick={finish}
                  >
                    Let's Start
                  </button>
                ) : (
                  <button
                    className="px-3 py-1 text-sm rounded bg-blue-600 text-white cursor-pointer"
                    onClick={next}
                  >
                    Next
                  </button>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default FirstTimeExperience;
