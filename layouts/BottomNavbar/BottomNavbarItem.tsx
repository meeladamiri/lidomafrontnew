import BottomSheet from "@/components/General/core/BottomSheet";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import BottomSheetForBottomNavbar from "./BottomSheetForBottomNavbar";
import { THandleSmoothClose } from "@/components/General/core/BottomSheet";

function BottomNavbarItem({
  href,
  iconSrc,
  name,
  customClassname,
  bottomSheetDescription,
  bottomSheetIcon,
}: {
  href: string;
  iconSrc: JSX.Element;
  name: string;
  customClassname?: string;
  bottomSheetDescription?: string;
  bottomSheetIcon?: JSX.Element;
}) {
  const router = useRouter();
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);

  return (
    <>
      <div
        onClick={() => {
          if (name !== "صفحه اصلی") {
            setShowBottomSheet(true);
          } else {
            router.push("/");
          }
        }}
        className={`flex flex-col items-center 
          ${
            router.pathname === href
              ? "text-primary-main after:content-[''] after:w-full after:block after:h-3 after:bg-primary-main after:rounded-tr-3 after:rounded-tl-3"
              : "text-gray-767676"
          }
          ${customClassname || ""}
          `}
      >
        <div className="px-8 flex items-center justify-center">{iconSrc}</div>
        <p className="text-10 sm:text-12 mt-4 leading-18 mb-4 px-6">{name}</p>
      </div>
      {!!showBottomSheet && (
        <BottomSheet
          open={showBottomSheet}
          handleClose={() => setShowBottomSheet(false)}
          headerTitle={name}
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <BottomSheetForBottomNavbar
                href={href}
                icon={bottomSheetIcon}
                content={bottomSheetDescription}
                handleSmoothClose={handleSmoothClose}
              />
            );
          }}
        />
      )}
    </>
  );
}

export default BottomNavbarItem;
