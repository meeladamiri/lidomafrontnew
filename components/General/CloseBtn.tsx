import { MouseEvent } from "react";

function CloseBtn({
  onClose,
  closeIconClassname,
}: {
  onClose: (e: MouseEvent<HTMLElement, globalThis.MouseEvent>) => void;
  closeIconClassname?: string;
}) {
  return (
    <>
      <i
        onClick={(e) => onClose(e)}
        className={`icon-ErrorFill text-gray-400 text-20 cursor-pointer ${
          closeIconClassname || ""
        }`}
      />
    </>
  );
}

export default CloseBtn;
