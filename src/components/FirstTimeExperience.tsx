import React, {
  Fragment,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import { Dialog, Transition } from "@headlessui/react";

interface FirstTimeExperienceProps {
  isOpen: boolean;
  onClose: () => void;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  profileCardRef: React.RefObject<HTMLDivElement>;
}

const slides = [
  {
    title: "Welcome!",
    body: "Virginia SOL Explorer helps you see which skills your child has mastered. Let's take a quick tour.",
  },
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
    title: "Track progress at a glance",
    body: "This box fills up as your student works through skills and standards.",
  },
  {
    title: "Share profiles",
    body: "Use Export to download a backup file and Import to load it on another computer.",
  },
];

const FirstTimeExperience: React.FC<FirstTimeExperienceProps> = ({
  isOpen,
  onClose,
  settingsButtonRef,
  profileCardRef,
}) => {
  const [step, setStep] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
    }
  }, [isOpen]);
  useLayoutEffect(() => {
    let frame: number;
    let gearEl: HTMLButtonElement | null = null;
    let cardEl: HTMLDivElement | null = null;
    let overlayEl: HTMLDivElement | null = null;
    const updateHighlight = () => {
      gearEl = settingsButtonRef.current;
      cardEl = profileCardRef.current;
      overlayEl = overlayRef.current;
      const panel = panelRef.current;
      if (!overlayEl || !panel) {
        frame = requestAnimationFrame(updateHighlight);
        return;
      }

      // Reset any previous highlighting
      overlayEl.style.background = "";
      gearEl?.classList.remove("ring-4", "ring-white", "animate-pulse", "z-30");
      cardEl?.classList.remove("ring-4", "ring-white", "animate-pulse", "z-30");

      if (step === 3 && gearEl) {
        const fade = 120; // width of the gradient fade
        const rect = gearEl.getBoundingClientRect();
        const r = Math.max(rect.width, rect.height) * 1.5;
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        overlayEl.style.background = `radial-gradient(circle at ${x}px ${y}px,
          rgba(0,0,0,0) ${r}px,
          rgba(0,0,0,0.5) ${r + fade}px)`;
        gearEl.classList.add("ring-4", "ring-white", "animate-pulse", "z-30");
      } else if (step === 4 && cardEl) {
        const fade = 60; // narrower fade for smaller spotlight
        const rect = cardEl.getBoundingClientRect();
        const r = Math.hypot(rect.width, rect.height) / 2;
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        overlayEl.style.background = `radial-gradient(circle at ${x}px ${y}px,
          rgba(0,0,0,0) ${r}px,
          rgba(0,0,0,0.5) ${r + fade}px)`;
        cardEl.classList.add("ring-4", "ring-white", "animate-pulse", "z-30");
      } else {
        const fade = 120;
        const rect = panel.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const r = Math.hypot(rect.width, rect.height) / 2 + 40;
        overlayEl.style.background = `radial-gradient(circle at ${x}px ${y}px,
          rgba(0,0,0,0) ${r}px,
          rgba(0,0,0,0.4) ${r + fade}px)`;
      }
    };

    frame = requestAnimationFrame(updateHighlight);
    return () => {
      cancelAnimationFrame(frame);
      gearEl?.classList.remove("ring-4", "ring-white", "animate-pulse", "z-30");
      cardEl?.classList.remove("ring-4", "ring-white", "animate-pulse", "z-30");
      if (overlayEl) {
        overlayEl.style.background = "";
      }
    };
  }, [step, isOpen, settingsButtonRef, profileCardRef]);

  const next = () => setStep((s) => Math.min(s + 1, slides.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const finish = () => {
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    const gear = settingsButtonRef.current;
    if (panel && overlay && gear) {
      const gearRect = gear.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const deltaX =
        gearRect.left + gearRect.width / 2 - (panelRect.left + panelRect.width / 2);
      const deltaY =
        gearRect.top + gearRect.height / 2 - (panelRect.top + panelRect.height / 2);
      const anim = panel.animate(
        [
          { transform: "translate(0,0) scale(1)", opacity: 1 },
          {
            transform: `translate(${deltaX}px, ${deltaY}px) scale(0.3)`,
            opacity: 0,
          },
        ],
        { duration: 300, easing: "ease-in-out", fill: "forwards" }
      );
      overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 300,
        easing: "ease-in-out",
        fill: "forwards",
      });
      anim.onfinish = () => {
        onClose();
      };
    } else {
      onClose();
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={finish}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
        >
          <div ref={overlayRef} className="pointer-events-none fixed inset-0" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
          >
            <Dialog.Panel
              ref={panelRef}
              className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all"
            >
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
