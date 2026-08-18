import { Button } from "@/components/General/core/Button";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction } from "react";

const Image = dynamic(() => import("next/image"), {
  ssr: true,
});

function SearchMapFooter({
  setShowSearchMapModal,
}: {
  setShowSearchMapModal: Dispatch<SetStateAction<boolean>>;
}) {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="fixed bottom-24 right-1/2 translate-x-1/2 z-[3]">
      {!!isDesktop && (
        <Button
          className={`mx-auto !bg-black bg-gradient-0 opacity-100 md:mx-auto !bg-none hidden md:flex`}
          rounded
          rightIcon={
            <Image src={"/assets/non-icomoon-icons/home-white.svg"} width={24} height={24} alt="" />
          }
          color={"black"}
          onClick={() => {
            setShowSearchMapModal(false);
          }}
        >
          نمایش لیست اقامتگاه ها
        </Button>
      )}

      {!isDesktop && (
        <Button
          className={`mx-auto md:hidden`}
          rounded
          color={"tertiary"}
          onClick={() => {
            setShowSearchMapModal(false);
          }}
          leftIcon={<i className="icon-FlashUp text-24 text-white" />}
        >
          مشاهده لیست اقامتگاه ها
        </Button>
      )}
    </div>
  );
}

export default SearchMapFooter;
