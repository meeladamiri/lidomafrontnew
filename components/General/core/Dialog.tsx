import { forwardRef } from "react";
import { Button } from "./Button";
import Image from "next/image";
import notificatins from "../../../public/assets/non-icomoon-icons/notifications.svg";

interface dialogProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}

const Dialog = forwardRef<HTMLDialogElement, dialogProps>(function Dialog(
  { children, onClose, title },
  ref
) {
  return (
    <dialog className="rounded-16 md:h-[300px] md:w-[600px] p-16" ref={ref}>
      <div className="flex justify-between">
        <div className="flex items-center gap-x-6 mb-12">
          <Image src={notificatins} alt="اطلاعیه" />
          <div className="bg-blue-light py-8 px-20 rounded-50">{title}</div>
        </div>
        <Button
          onClick={() => {
            onClose();
          }}
          color="grey"
          className="!w-32 !h-32 !p-6"
          rounded
        >
          <i className="icon-Close text-20 text-black" />
        </Button>
      </div>
      {children}
    </dialog>
  );
});

export default Dialog;
