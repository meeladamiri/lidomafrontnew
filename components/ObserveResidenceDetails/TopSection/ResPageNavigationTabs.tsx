import {
  IResPageNavigationTab,
  resPage_navigation_tabs,
} from "@/constants/resPage_navigation_tabs";
import { useState } from "react";
import ResPageNavigationTab from "./ResPageNavigationTab";

function ResPageNavigationTabs({
  customClassname,
  tabCustomClassname,
}: {
  customClassname?: string;
  tabCustomClassname?: string;
}) {
  const [selected, setSelected] = useState<string>("");

  return (
    <div
      className={`
      border-b border-C4CAD3
      md:justify-start justify-between md:gap-x-16 sticky top-[50px] md:top-[70px] z-[5]
      bg-white flex items-center
        ${customClassname || ""}
    `}
    >
      {resPage_navigation_tabs.map((tab: IResPageNavigationTab, i: number) => (
        <ResPageNavigationTab
          scrollTo={tab.scrollTo}
          key={i}
          name={tab.name}
          selected={selected}
          setSelected={setSelected}
          tabCustomClassname={tabCustomClassname}
        />
      ))}
    </div>
  );
}

export default ResPageNavigationTabs;
