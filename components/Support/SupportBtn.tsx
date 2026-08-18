import { Dispatch, SetStateAction } from "react";

function SupportBtn({
  setShowCallSupportBottomSheet,
}: {
  setShowCallSupportBottomSheet: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div
      onClick={() => setShowCallSupportBottomSheet(true)}
      className="py-8 pl-8 pr-16 rounded-full bg-warning flex items-center justify-center gap-x-8 md:hidden text-12 leading-16 text-white font-m"
    >
      رزرو تلفنی
      <i className="icon-OnlineContact text-24 text-white" />
    </div>
  );
}

export default SupportBtn;
