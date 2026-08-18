import LikeOrNot from "@/components/General/LikeOrNot";
import { IShare } from "@/components/General/Share/ShareBottomSheet";
import { THandleSmoothClose } from "@/components/General/core/BottomSheet";
import { Button } from "@/components/General/core/Button";
import { BASE_URL_SITE } from "@/configs/info";
// import { getResIdFromURL } from "@/utilities/PropertyPage/getResIdFromURL";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
const BottomSheet = dynamic(() => import("@/components/General/core/BottomSheet"), {
  ssr: true,
});
const ShareBottomSheet = dynamic(() => import("@/components/General/Share/ShareBottomSheet"), {
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

function InfographyBtns() {
  const { query, asPath } = useRouter();
  const [showShareBottomSheet, setShowShareBottomSheet] = useState<IShare>(shareInitialValues);

  return (
    <>
      <div className="flex items-center gap-x-12">
        <Button
          variant="outlined"
          color="white"
          onClick={() => {
            const resName = query?.id as string;
            const propertyPageUrl = `${BASE_URL_SITE}${asPath}`;

            setShowShareBottomSheet({
              show: true,
              payload: {
                textToBeSmsed: propertyPageUrl,
                link: propertyPageUrl,
                whatsAppText: propertyPageUrl,
                telegramText: propertyPageUrl,
                twitter: {
                  url_to_go: propertyPageUrl,
                  text_of_tweet: resName,
                  via: "",
                },
              },
            });
          }}
          rightIcon={<i className="icon-ShareFill text-24 md:text-17"></i>}
        >
          اشتراک گذاری
        </Button>

        <LikeOrNot residenceId={Number(query?.id)} showAsBtn />
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

export default InfographyBtns;
