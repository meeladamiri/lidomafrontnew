import { MouseEventHandler } from "react";

function GoToFlash({
  onClick,
  disabled,
}: {
  onClick: MouseEventHandler<HTMLDivElement>;
  disabled?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        w-40 h-40 rounded-6
        flex items-center justify-center
        typical-gray-bg 
        ${
          !!disabled
            ? "cursor-not-allowed opacity-30 pointer-events-none"
            : "cursor-pointer hover:text-primary-main"
        }
      `}
    >
      <i className="icon-FlashLeft text-16" />
    </div>
  );
}
export default GoToFlash;
