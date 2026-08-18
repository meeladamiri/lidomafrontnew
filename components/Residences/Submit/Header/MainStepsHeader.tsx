import { THandleSmoothClose } from "@/components/General/core/BottomSheet";
import { Steps_header_Title } from "@/constants/Residences/Submit/Steps_header_Title";
import { getProgressCompletePercentage } from "@/utilities/SubmitResidence/getProgressCompletePercentage";
import { useRouter } from "next/router";
import { useState } from "react";
import dynamic from "next/dynamic";
const BottomSheet = dynamic(() => import("@/components/General/core/BottomSheet"), { ssr: true });
const HaltSubmitResidenceProcess = dynamic(
  () => import("../BottomSheets/HaltSubmitResidenceProcess"),
  { ssr: true }
);

function MainStepsHeader() {
  const router = useRouter();
  const [showExitPageBottomSheet, setShowExitPageBottomSheet] = useState<boolean>(false);

  function handleStepBackward() {
    if (!router?.query?.step || router?.query?.step === "0") router.back();
    else {
      router.replace(
        `?step=${Number(router?.query?.step as string) - 1}&productId=${router?.query?.productId}`
      );
    }
  }

  return (
    <>
      <div
        className={`
          fixed top-0 right-0 left-0 bg-white z-5
          py-16 px-20 flex items-center justify-between
          border-b-2 border-solid
        `}
        style={{
          borderImage: `linear-gradient(90deg,
          #FFF ${100 - getProgressCompletePercentage(Number(router?.query?.step as string))}%, 
          ${"#03D6BB"} 0%, 
          ${"#03D6BB"} 100%) 
          1`,
        }}
      >
        <i className="icon-Back text-24 cursor-pointer" onClick={handleStepBackward} />

        <span className="text-18 leading-32 text-black font-m">
          {Steps_header_Title[router?.query?.step as string]}
        </span>

        <i
          className="icon-Close text-24 cursor-pointer"
          onClick={() => setShowExitPageBottomSheet(true)}
        />
      </div>

      {!!showExitPageBottomSheet && (
        <BottomSheet
          open={showExitPageBottomSheet}
          handleClose={() => setShowExitPageBottomSheet(false)}
          headerTitle="توقف فرایند ثبت اقامتگاه"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return <HaltSubmitResidenceProcess handleSmoothClose={handleSmoothClose} />;
          }}
        />
      )}
    </>
  );
}

export default MainStepsHeader;
