# Timestamps + Coverage Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ISO timestamps to every mastery status change and expose a "Progress Report" modal that groups completed standards by month/year for use in Virginia homeschool annual assessments.

**Architecture:** Extend the `MasteryEntry` leaf type in `StandardMasteryContext` from a plain `MasteryStatus` string to `{ status, updatedAt }`. A one-time migration runs at localStorage load time. `getMastery()` keeps its string return type (zero consumer changes). A new `ReportModal` component reads `getMasteryEntry()` across all loaded standards to build a chronological report.

**Tech Stack:** React 19, TypeScript, Headless UI (Dialog/Transition), Heroicons, Tailwind CSS 4, Bun.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/context/StandardMasteryContext.tsx` | Modify | Add `MasteryEntry` type, migration, `getMasteryEntry()`, update `updateMastery()` and `getProfileMasteryCount()` |
| `src/components/ReportModal.tsx` | Create | Report UI grouped by month/year, print button |
| `src/components/SettingsFlyout.tsx` | Modify | Add `"report"` to modal union, add menu item, mount `ReportModal` |

---

## Task 1: Add `MasteryEntry` type and migrate `StandardMasteryContext`

**Files:**
- Modify: `src/context/StandardMasteryContext.tsx`

- [ ] **Step 1: Replace the file with the updated version**

Replace the full file content with the version below. Key changes:
- Add `MasteryEntry` interface
- Update `Profile.masteryStatus` leaf type from `MasteryStatus` to `MasteryEntry`
- Add `getMasteryEntry` to context type interface
- Migrate plain-string values on localStorage load (set `metadata.schemaVersion = 2`)
- `updateMastery()` writes `{ status, updatedAt: new Date().toISOString() }`
- `getMastery()` still returns `MasteryStatus` string (backward compat)
- `getProfileMasteryCount()` reads `.status` from `MasteryEntry`

```tsx
import React, { createContext, useState, useContext, useEffect } from "react";

export type MasteryStatus = "completed" | "needs_improvement" | "not_started";

export interface MasteryEntry {
  status: MasteryStatus;
  updatedAt: string | null;
}

export interface Profile {
  displayName: string;
  masteryStatus: {
    [subject: string]: {
      [standardId: string]: MasteryEntry;
    };
  };
  metadata: Record<string, unknown>;
}

export interface ProfileData {
  [profileId: string]: Profile;
}

interface StandardMasteryContextType {
  profiles: ProfileData;
  updateMastery: (
    subject: string,
    standardId: string,
    status: MasteryStatus
  ) => void;
  clearMastery: (subject: string, standardId: string) => void;
  getMastery: (subject: string, standardId: string) => MasteryStatus;
  getMasteryEntry: (subject: string, standardId: string) => MasteryEntry;
  createProfile: (
    profileData: { name: string; metadata: Record<string, unknown> }
  ) => string;
  deleteProfile: (profileId: string) => void;
  getProfiles: () => Array<{ id: string; displayName: string }>;
  updateProfileDisplayName: (profileId: string, newDisplayName: string) => void;
  getProfileMasteryCount: (profileId: string) => {
    completed: number;
    needs_improvement: number;
    total: number;
  };
}

const StandardMasteryContext = createContext<
  StandardMasteryContextType | undefined
>(undefined);

function migrateProfileData(
  id: string,
  profileData: unknown
): Profile {
  const data = profileData as Partial<Profile> & { id?: string };
  const rawMastery = (data.masteryStatus || {}) as Record<
    string,
    Record<string, unknown>
  >;
  const metadata = data.metadata || {};
  const schemaVersion = (metadata as Record<string, unknown>).schemaVersion;

  if (typeof schemaVersion === "number" && schemaVersion >= 2) {
    return {
      displayName: data.displayName || data.id || id,
      masteryStatus: rawMastery as Profile["masteryStatus"],
      metadata,
    };
  }

  // Coerce plain strings → MasteryEntry
  const migratedMastery: Profile["masteryStatus"] = {};
  Object.entries(rawMastery).forEach(([subject, standards]) => {
    migratedMastery[subject] = {};
    Object.entries(standards).forEach(([standardId, value]) => {
      if (typeof value === "string") {
        migratedMastery[subject][standardId] = {
          status: value as MasteryStatus,
          updatedAt: null,
        };
      } else {
        migratedMastery[subject][standardId] = value as MasteryEntry;
      }
    });
  });

  return {
    displayName: data.displayName || data.id || id,
    masteryStatus: migratedMastery,
    metadata: { ...metadata, schemaVersion: 2 },
  };
}

export const StandardMasteryProvider: React.FC<{
  children: React.ReactNode;
  selectedProfileId: string;
}> = ({ children, selectedProfileId }) => {
  const [profiles, setProfiles] = useState<ProfileData>({});

  // Load profiles from localStorage on mount
  useEffect(() => {
    const storedProfiles = localStorage.getItem("profiles");
    if (storedProfiles) {
      try {
        const loadedProfiles = JSON.parse(storedProfiles);
        const migratedProfiles: ProfileData = {};
        Object.entries(loadedProfiles).forEach(
          ([id, profileData]: [string, unknown]) => {
            migratedProfiles[id] = migrateProfileData(id, profileData);
          }
        );
        setProfiles(migratedProfiles);
      } catch (e) {
        console.error("Error loading profiles:", e);
      }
    }
  }, []);

  // Save profiles to localStorage when they change
  useEffect(() => {
    if (Object.keys(profiles).length > 0) {
      localStorage.setItem("profiles", JSON.stringify(profiles));
    }
  }, [profiles]);

  const updateMastery = (
    subject: string,
    standardId: string,
    status: MasteryStatus
  ) => {
    setProfiles((prevProfiles) => {
      if (!prevProfiles[selectedProfileId]) return prevProfiles;
      const currentMasteryStatus =
        prevProfiles[selectedProfileId].masteryStatus || {};
      const subjectStatus = currentMasteryStatus[subject] || {};
      return {
        ...prevProfiles,
        [selectedProfileId]: {
          ...prevProfiles[selectedProfileId],
          masteryStatus: {
            ...currentMasteryStatus,
            [subject]: {
              ...subjectStatus,
              [standardId]: {
                status,
                updatedAt: new Date().toISOString(),
              },
            },
          },
        },
      };
    });
  };

  const clearMastery = (subject: string, standardId: string) => {
    setProfiles((prevProfiles) => {
      if (
        !prevProfiles[selectedProfileId] ||
        !prevProfiles[selectedProfileId].masteryStatus ||
        !prevProfiles[selectedProfileId].masteryStatus[subject]
      ) {
        return prevProfiles;
      }
      const newProfiles = { ...prevProfiles };
      const newSubjectStatus = {
        ...newProfiles[selectedProfileId].masteryStatus[subject],
      };
      delete newSubjectStatus[standardId];
      newProfiles[selectedProfileId] = {
        ...newProfiles[selectedProfileId],
        masteryStatus: {
          ...newProfiles[selectedProfileId].masteryStatus,
          [subject]: newSubjectStatus,
        },
      };
      return newProfiles;
    });
  };

  const getMastery = (subject: string, standardId: string): MasteryStatus => {
    const entry =
      profiles[selectedProfileId]?.masteryStatus?.[subject]?.[standardId];
    return entry?.status ?? "not_started";
  };

  const getMasteryEntry = (
    subject: string,
    standardId: string
  ): MasteryEntry => {
    const entry =
      profiles[selectedProfileId]?.masteryStatus?.[subject]?.[standardId];
    return entry ?? { status: "not_started", updatedAt: null };
  };

  const getProfileMasteryCount = (profileId: string) => {
    if (!profiles[profileId] || !profiles[profileId].masteryStatus) {
      return { completed: 0, needs_improvement: 0, total: 0 };
    }
    let completed = 0;
    let needs_improvement = 0;
    let total = 0;
    const masteryStatus = profiles[profileId].masteryStatus;
    Object.keys(masteryStatus).forEach((subject) => {
      Object.values(masteryStatus[subject]).forEach((entry) => {
        total++;
        if (entry.status === "completed") completed++;
        if (entry.status === "needs_improvement") needs_improvement++;
      });
    });
    return { completed, needs_improvement, total };
  };

  const createProfile = (profileData: {
    name: string;
    metadata: Record<string, unknown>;
  }) => {
    const profileId = crypto.randomUUID();
    setProfiles((prevProfiles) => ({
      ...prevProfiles,
      [profileId]: {
        displayName: profileData.name,
        masteryStatus: {},
        metadata: profileData.metadata || {},
      },
    }));
    return profileId;
  };

  const deleteProfile = (profileId: string) => {
    setProfiles((prevProfiles) => {
      const restProfiles = { ...prevProfiles };
      delete restProfiles[profileId];
      return restProfiles;
    });
  };

  const getProfiles = () => {
    return Object.entries(profiles).map(([id, profile]) => ({
      id,
      displayName: profile.displayName,
    }));
  };

  const updateProfileDisplayName = (
    profileId: string,
    newDisplayName: string
  ) => {
    setProfiles((prevProfiles) => {
      if (!prevProfiles[profileId]) return prevProfiles;
      return {
        ...prevProfiles,
        [profileId]: {
          ...prevProfiles[profileId],
          displayName: newDisplayName,
        },
      };
    });
  };

  return (
    <StandardMasteryContext.Provider
      value={{
        profiles,
        updateMastery,
        clearMastery,
        getMastery,
        getMasteryEntry,
        createProfile,
        deleteProfile,
        getProfiles,
        updateProfileDisplayName,
        getProfileMasteryCount,
      }}
    >
      {children}
    </StandardMasteryContext.Provider>
  );
};

export const useStandardMastery = () => {
  const context = useContext(StandardMasteryContext);
  if (context === undefined) {
    throw new Error(
      "useStandardMastery must be used within a StandardMasteryProvider"
    );
  }
  return context;
};
```

- [ ] **Step 2: Verify lint passes with no new errors**

```bash
bun run lint 2>&1
```

Expected: same 2 pre-existing warnings, 0 errors.

- [ ] **Step 3: Smoke-test migration in browser**

```bash
curl -s http://localhost:5173/ | grep -c "Virginia"
```

Expected: `1` (page loads). Open the app manually, mark a standard, check localStorage in DevTools:

```js
JSON.parse(localStorage.getItem("profiles"))
// Each mastery value should be { status: "...", updatedAt: "2026-..." }
// schemaVersion: 2 should appear in metadata
```

- [ ] **Step 4: Commit**

```bash
git add src/context/StandardMasteryContext.tsx
git commit -m "feat: add MasteryEntry type with updatedAt timestamp and localStorage migration"
```

---

## Task 2: Create `ReportModal` component

**Files:**
- Create: `src/components/ReportModal.tsx`

The modal:
- Loads standards data via `useStandardsData({ useCache: true })` (cache hit — no extra network call)
- Iterates `standardsData` hierarchy to resolve descriptions for each tracked standard
- Reads `getMasteryEntry()` for each standard in the active profile
- Filters to `status !== "not_started"` (completed + needs_improvement)
- Groups by `updatedAt` month/year; null → "Date Unknown" section (sorted last)
- Renders a print button that calls `window.print()`

- [ ] **Step 1: Create the file**

```tsx
// src/components/ReportModal.tsx
import React, { useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PrinterIcon } from "@heroicons/react/24/outline";
import { useStandardMastery } from "../context/StandardMasteryContext";
import { useProfile } from "../context/ProfileContext";
import useStandardsData from "../hooks/useStandardsData";

interface ReportModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

interface ReportRow {
  subject: string;
  grade: string;
  categoryTitle: string;
  standardId: string;
  description: string;
  status: "completed" | "needs_improvement";
  updatedAt: string | null;
}

function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const STATUS_LABEL: Record<string, string> = {
  completed: "✓ Completed",
  needs_improvement: "~ Needs Work",
};

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, closeModal }) => {
  const { getMasteryEntry, getProfiles } = useStandardMastery();
  const { selectedProfileId } = useProfile();
  const { standardsData } = useStandardsData({ useCache: true });

  const profile = getProfiles().find((p) => p.id === selectedProfileId);

  // Build flat list of all tracked (non-not_started) standards with metadata
  const rows = useMemo<ReportRow[]>(() => {
    if (!standardsData.length) return [];
    const result: ReportRow[] = [];
    for (const subjectStandard of standardsData) {
      for (const category of subjectStandard.categories) {
        for (const standard of category.standards) {
          const entry = getMasteryEntry(subjectStandard.subject, standard.id);
          if (entry.status === "not_started") continue;
          result.push({
            subject: subjectStandard.subject,
            grade: subjectStandard.grade,
            categoryTitle: category.title,
            standardId: standard.id,
            description: standard.description,
            status: entry.status as "completed" | "needs_improvement",
            updatedAt: entry.updatedAt,
          });
        }
      }
    }
    return result;
  }, [standardsData, getMasteryEntry]);

  // Group rows by month/year bucket
  const groups = useMemo(() => {
    const buckets = new Map<string, ReportRow[]>();
    for (const row of rows) {
      const key = row.updatedAt ? formatMonthYear(row.updatedAt) : "__unknown__";
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(row);
    }

    // Sort: chronological ascending, "Date Unknown" last
    const sorted = Array.from(buckets.entries()).sort(([a], [b]) => {
      if (a === "__unknown__") return 1;
      if (b === "__unknown__") return -1;
      return new Date(a).getTime() - new Date(b).getTime();
    });

    return sorted.map(([key, items]) => ({
      label: key === "__unknown__" ? "Date Unknown" : key,
      items,
    }));
  }, [rows]);

  const generatedDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    []
  );

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold leading-6 text-gray-900"
                      >
                        Progress Report — {profile?.displayName ?? "Student"}
                      </Dialog.Title>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Generated {generatedDate}
                      </p>
                    </div>
                  </div>

                  {rows.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 text-sm">
                      No standards have been marked yet. Start tracking progress
                      to generate a report.
                    </div>
                  ) : (
                    <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-1">
                      {groups.map((group) => (
                        <div key={group.label}>
                          <h4 className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded mb-2">
                            {group.label}
                          </h4>
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                                <th className="pb-1 pr-2 w-24">ID</th>
                                <th className="pb-1 pr-2">Description</th>
                                <th className="pb-1 w-28 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.items.map((row) => (
                                <tr
                                  key={`${row.subject}-${row.standardId}`}
                                  className="border-b border-gray-100 last:border-0"
                                >
                                  <td className="py-1.5 pr-2 font-mono text-xs text-gray-500 align-top">
                                    {row.standardId}
                                  </td>
                                  <td className="py-1.5 pr-2 text-gray-800 align-top">
                                    <span className="text-xs text-indigo-600 mr-1">
                                      {row.subject} · Gr.{row.grade}
                                    </span>
                                    {row.description}
                                  </td>
                                  <td className="py-1.5 text-right align-top whitespace-nowrap">
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                                        row.status === "completed"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-amber-100 text-amber-800"
                                      }`}
                                    >
                                      {STATUS_LABEL[row.status]}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto cursor-pointer"
                    onClick={() => window.print()}
                  >
                    <PrinterIcon className="h-4 w-4 mr-1.5" />
                    Print
                  </button>
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

export default ReportModal;
```

- [ ] **Step 2: Verify lint**

```bash
bun run lint 2>&1
```

Expected: same 2 pre-existing warnings, 0 new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ReportModal.tsx
git commit -m "feat: add ReportModal grouped by completion month/year"
```

---

## Task 3: Wire `ReportModal` into `SettingsFlyout`

**Files:**
- Modify: `src/components/SettingsFlyout.tsx`

- [ ] **Step 1: Update `SettingsFlyout.tsx`**

Make these targeted changes:

1. Add `ReportModal` import after line 12.
2. Extend the `modalContent` union from `"import" | "export" | "profiles" | null` to include `"report"`.
3. Update the `openModal` parameter type to match.
4. Add a "Progress Report" `Menu.Item` button between "Export Data" and "Profiles".
5. Mount `<ReportModal>` below the existing modals.

The full updated file:

```tsx
import React, { useState, Fragment } from "react";
import {
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
import ReportModal from "./ReportModal";

interface SettingsFlyoutProps {
  hideCompleted: boolean;
  setHideCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  openIntro: () => void;
  gearRef?: React.RefObject<HTMLButtonElement | null>;
}

const SettingsFlyout: React.FC<SettingsFlyoutProps> = ({
  hideCompleted,
  setHideCompleted,
  openIntro,
  gearRef,
}) => {
  const [modalContent, setModalContent] = useState<
    "import" | "export" | "profiles" | "report" | null
  >(null);

  const openModal = (content: "import" | "export" | "profiles" | "report") => {
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
            ref={gearRef}
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
                    onClick={() => openModal("report")}
                  >
                    Progress Report
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
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm cursor-pointer`}
                    onClick={openIntro}
                  >
                    Show Tutorial
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
      <ReportModal
        isOpen={modalContent === "report"}
        closeModal={closeModal}
      />
    </div>
  );
};

export default SettingsFlyout;
```

- [ ] **Step 2: Verify lint**

```bash
bun run lint 2>&1
```

Expected: same 2 pre-existing warnings, 0 new errors.

- [ ] **Step 3: Verify the app loads and the menu item appears**

```bash
curl -s http://localhost:5173/ | grep -c "Virginia"
```

Expected: `1`. Then open the browser, click the gear icon, confirm "Progress Report" appears in the dropdown.

- [ ] **Step 4: Commit**

```bash
git add src/components/SettingsFlyout.tsx
git commit -m "feat: add Progress Report entry to settings flyout"
```

---

## Task 4: Final verification and PR

- [ ] **Step 1: Full lint check**

```bash
bun run lint 2>&1
```

Expected: 2 warnings (pre-existing), 0 errors.

- [ ] **Step 2: Build check**

```bash
bun run build 2>&1 | tail -20
```

Expected: successful build with no TypeScript errors.

- [ ] **Step 3: End-to-end smoke test via curl**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
```

Expected: `200`.

- [ ] **Step 4: Create PR**

```bash
git push -u origin worktree-feature+timestamps-and-coverage-report
gh pr create \
  --repo clates/v-sol-explorer \
  --title "feat: completion timestamps + monthly coverage report (closes #7)" \
  --body "$(cat <<'EOF'
## Summary

- Extends `MasteryStatus` leaf type to `MasteryEntry { status, updatedAt }` in `StandardMasteryContext`
- One-time localStorage migration coerces plain strings → `MasteryEntry`; sets `metadata.schemaVersion = 2`
- `updateMastery()` now writes `updatedAt: new Date().toISOString()` on every status change
- `getMastery()` continues to return `MasteryStatus` string — zero regressions in existing consumers
- New `getMasteryEntry()` context method returns the full `{ status, updatedAt }` object
- New `ReportModal` groups completed/needs-work standards by completion month, with a Print button
- "Progress Report" entry added to the settings flyout

## Test plan

- [ ] Mark a standard; inspect localStorage — value should be `{ status, updatedAt: "<ISO>" }`
- [ ] Reload page — existing data loads correctly; `schemaVersion: 2` appears in metadata
- [ ] Open gear → Progress Report — modal opens, standards grouped by month
- [ ] Standards marked before this feature (pre-migration) show under "Date Unknown"
- [ ] Print button opens browser print dialog
- [ ] Old exported JSON can be re-imported and migrates correctly
- [ ] `bun run build` passes with no TypeScript errors

Closes #7

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
