import { TextField } from "@/components/General/core/TextField";
import { useGetPersianCityname } from "Hooks/SearchPages/useGetPersianCityname";
// import { determineResidenceTypeFromUrl } from "@/utilities/SearchPage/determineResidenceTypeFromUrl";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect } from "react";

function HeaderSearchBox({
  showMainSearchBox,
  setShowMainSearchBox,
}: {
  showMainSearchBox: boolean;
  setShowMainSearchBox: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function closeMainSearchBox() {
    setShowMainSearchBox(false);
  }

  useEffect(() => {
    router.events.on("routeChangeStart", closeMainSearchBox);

    return () => {
      router.events.off("routeChangeStart", closeMainSearchBox);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    const handleClickOrScroll = () => {
      closeMainSearchBox();
    };

    const dimBackground = document.querySelector(".dim-background");
    if (dimBackground) {
      dimBackground.addEventListener("click", handleClickOrScroll);
      window.addEventListener("scroll", handleClickOrScroll);
    }

    return () => {
      if (dimBackground) {
        dimBackground.removeEventListener("click", handleClickOrScroll);
        window.removeEventListener("scroll", handleClickOrScroll);
      }
    };
  }, [closeMainSearchBox]);

  return (
    <>
      <div
        className="absolute left-1/2 -translate-x-1/2 w-320 hidden md:block"
        onClick={() => setShowMainSearchBox(true)}
      >
        <TextField
          name="whereYouWannaGo"
          readonly
          customValue={useGetPersianCityname()}
          wrapperClassname="cursor-pointer rounded-[100px]"
          inputClassname="cursor-pointer"
          placeholder="جستجوی شهر یا اقامتگاه"
          rightIcon={<i className="icon-Search text-gray-616E7C text-18" />}
          hasPrimaryColorBorderBottom
        />
      </div>
      {!!showMainSearchBox && (
        <div className="fixed top-[175px] bottom-0 left-0 w-full !h-screen z-[999] bg-black bg-opacity-50 dim-background"></div>
      )}
    </>
  );
}
export default HeaderSearchBox;
