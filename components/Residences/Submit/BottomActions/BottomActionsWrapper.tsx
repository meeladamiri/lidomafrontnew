import dynamic from "next/dynamic";
import { ReactNode } from "react";
const BottomActionsDesktop = dynamic(() => import("./BottomActionsDesktop"), {
  ssr: true,
});

function BottomActionsWrapper({
  children,
  onClickOfSubmitStep,
  isSubmitBtnDisabled,
  isSaving,
}: {
  children: ReactNode;
  onClickOfSubmitStep: () => void; // for desktop
  isSubmitBtnDisabled?: boolean; // for desktop
  // A step in flight. Without it the button looks idle for the whole round
  // trip, which reads as "nothing happened" and invites a second press.
  isSaving?: boolean;
}) {
  return (
    <div className="fixed right-0 left-0 bottom-0 bg-white px-20 z-1 py-16 md:px-16 md:sticky md:bottom-40 md:border-1 md:border-gray-CACFD3 md:border-solid md:shadow-[0px_8px_32px_rgba(24,39,58,0.15)] md:rounded-16">
      <div className="md:hidden">{children}</div>
      <div className="hidden md:block">
        <BottomActionsDesktop
          onClickOfSubmitStep={onClickOfSubmitStep}
          isSubmitBtnDisabled={isSubmitBtnDisabled}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}

export default BottomActionsWrapper;
