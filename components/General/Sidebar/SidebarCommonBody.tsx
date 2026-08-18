import React, { ReactNode } from "react";

// NOTE: In case of a 'typical sidebar' being used, wrap the body of that sidebar with this component.
//       This component handles overflow of the 'body' of the sidebar.
export function SidebarCommonBody({ children }: { children: ReactNode }) {
  return (
    <div
      className={`
          text-14 leading-24 text-black font-r
          max-h-[calc(100%-61px)] overflow-y-auto
        `}
    >
      {children}
    </div>
  );
}
