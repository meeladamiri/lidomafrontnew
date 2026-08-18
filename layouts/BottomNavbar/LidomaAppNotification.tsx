import CloseBtn from "@/components/General/CloseBtn";
import { LinkButton } from "@/components/General/core/Button";
import { Dispatch, SetStateAction } from "react";

interface ILidomaAppNotification {
  showLidomaAppNotification: boolean;
  setShowLidomaAppNotification: Dispatch<SetStateAction<boolean>>;
}

function LidomaAppNotification({
  showLidomaAppNotification,
  setShowLidomaAppNotification,
}: ILidomaAppNotification) {
  return (
    <>
      {showLidomaAppNotification && (
        <div className="py-8 px-16 bg-black flex items-center justify-between">
          <div className="flex items-center gap-x-12">
            <p className="text-13 text-white leading-16 font-r">
              تخفیف های ویژه در اپلیکیشن لیدوما
            </p>
            <LinkButton
              href="/lidoma-app"
              onClick={() => setShowLidomaAppNotification(false)}
              variant="contained"
              color="white"
              rounded
            >
              دانلود
            </LinkButton>
          </div>
          <CloseBtn onClose={() => setShowLidomaAppNotification(false)} />
        </div>
      )}
    </>
  );
}

export default LidomaAppNotification;
