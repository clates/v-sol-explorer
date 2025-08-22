import React, { useState, useEffect, useRef } from "react";
import { VariableSizeList } from "react-window";
import { SubjectStandard } from "./types";
import SubjectStandardDisplay from "./components/SubjectStandardDisplay";

//... (Types remain the same)

const STANDARDS_DISPLAY_ID = "standards-display";

const TwoPaneSubjectStandardDisplay: React.FC<{
  subjectStandards: SubjectStandard[];
}> = ({ subjectStandards }) => {
  const [activeSection, setActiveSection] = useState("");
  const [listHeight, setListHeight] = useState(0);
  const listRef = useRef<VariableSizeList>(null);

  useEffect(() => {
    const updateHeight = () => setListHeight(window.innerHeight);
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const handleItemsRendered = ({ visibleStartIndex }: { visibleStartIndex: number }) => {
    setActiveSection(subjectStandards[visibleStartIndex]?.id || "");
  };

  const handleAnchorClick = (
    id: string,
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    const index = subjectStandards.findIndex((s) => s.id === id);
    if (index !== -1) {
      listRef.current?.scrollToItem(index, "start");
    }
  };

  const getItemSize = (index: number) => {
    const standard = subjectStandards[index];
    const headerHeight = 120;
    const categoriesHeight = standard.categories.length * 400;
    return headerHeight + categoriesHeight;
  };

  const OuterElement = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    (props, ref) => (
      <div
        {...props}
        ref={ref}
        id={STANDARDS_DISPLAY_ID}
        className="p-4 overflow-y-auto shadow-md bg-gray-200 [scroll-behavior:smooth]"
      />
    )
  );

  return (
    <div className="flex overflow-y-scroll bg-gray-100 h-screen">
      <div className="hidden lg:block flex-shrink-0 w-1/5 max-w-64 p-4 overflow-y-auto shadow-md">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          Table of Contents
        </h3>
        <ul>
          {subjectStandards.map((standard) => (
            <li key={standard.id} className="mb-2">
              <a
                href={`#${standard.id}`}
                onClick={(e) => handleAnchorClick(standard.id, e)}
                className={`text-gray-700 hover:text-blue-500 ${
                  activeSection === standard.id ? "font-bold text-blue-500" : ""
                }`}
              >
                {standard.subject} - Grade {standard.grade}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <VariableSizeList
        ref={listRef}
        height={listHeight}
        width="100%"
        itemCount={subjectStandards.length}
        itemSize={getItemSize}
        onItemsRendered={handleItemsRendered}
        outerElementType={OuterElement}
      >
        {({ index, style }) => (
          <div style={style}>
            <SubjectStandardDisplay
              key={`${subjectStandards[index].grade}-${subjectStandards[index].id}`}
              subjectStandard={subjectStandards[index]}
            />
          </div>
        )}
      </VariableSizeList>
    </div>
  );
};

export default TwoPaneSubjectStandardDisplay;
