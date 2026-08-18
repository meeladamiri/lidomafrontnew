import { IShare } from "@/components/General/Share/ShareBottomSheet";
import { THandleSmoothClose } from "@/components/General/core/BottomSheet";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const TheSearchMap = dynamic(() => import("./TheSearchMap"), { ssr: false });
const ShareBottomSheet = dynamic(() => import("@/components/General/Share/ShareBottomSheet"), {
  ssr: true,
});
const BottomSheet = dynamic(() => import("@/components/General/core/BottomSheet"), {
  ssr: true,
});

const shareInitialValues: IShare = {
  show: false,
  payload: {
    textToBeSmsed: "",
    link: "",
    whatsAppText: "",
    telegramText: "",
    twitter: {
      url_to_go: "",
      text_of_tweet: "",
      via: "",
    },
  },
};

function SearchMapModal({
  showSearchMapModal,
  setShowSearchMapModal,
  setShowGeneralFiltersModal,
}: {
  showSearchMapModal: boolean;
  setShowSearchMapModal: Dispatch<SetStateAction<boolean>>;
  setShowGeneralFiltersModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [showShareBottomSheet, setShowShareBottomSheet] = useState<IShare>(shareInitialValues);

  useEffect(() => {
    if (showSearchMapModal) {
      document.body.classList.add("overflow-hidden");
      document.body.style.height = "100vh";
    } else {
      document.body.classList.remove("overflow-hidden");
      document.body.style.height = "";
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
      document.body.style.height = "";
    };
  }, [showSearchMapModal]);

  return (
    <>
      <div className="min-h-screen fixed top-0 right-0 left-0 bottom-0 bg-white z-10 overflow-y-auto">
        <TheSearchMap
          setShowShareBottomSheet={setShowShareBottomSheet}
          setShowSearchMapModal={setShowSearchMapModal}
          setShowGeneralFiltersModal={setShowGeneralFiltersModal}
        />
      </div>

      {!!showShareBottomSheet.show && (
        <BottomSheet
          open={!!showShareBottomSheet.show}
          handleClose={() => setShowShareBottomSheet(shareInitialValues)}
          headerTitle="اشتراک گذاری"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <ShareBottomSheet
                handleSmoothClose={handleSmoothClose}
                whatIsBeingShared="اقامتگاه"
                payload={showShareBottomSheet.payload}
              />
            );
          }}
        />
      )}
    </>
  );
}

export default SearchMapModal;
