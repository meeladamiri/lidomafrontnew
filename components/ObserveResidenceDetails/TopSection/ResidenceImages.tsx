import { useMediaQuery } from "@/utilities/useMediaQuery";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import dynamic from "next/dynamic";
const ResidenceImagesInMobile = dynamic(
  () => import("@/components/ObserveResidenceDetails/TopSection/ResidenceImagesInMobile"),
  {
    ssr: true,
  }
);
const ResidenceImagesInDesktop = dynamic(
  () => import("@/components/ObserveResidenceDetails/TopSection/ResidenceImagesInDesktop"),
  {
    ssr: true,
  }
);

function ResidenceImages() {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const { data } = useGetObserveResidence();

  return (
    <>
      <div className="h-[280px] md:hidden">
        {!isDesktop && (
          <ResidenceImagesInMobile
            images={[
              {
                id: 1,
                name: data?.params?.residence_info?.name,
                url: data?.params?.residence_info?.main_image?.[0],
              },
              ...data?.params?.images,
            ]}
            name={data?.params?.residence_info?.name}
          />
        )}
      </div>

      <div className="hidden md:block h-[420px] CustomContainer">
        {!!isDesktop && (
          <ResidenceImagesInDesktop
            images={[
              {
                id: 1,
                name: data?.params?.residence_info?.name,
                url: data?.params?.residence_info?.main_image?.[0],
              },
              ...data?.params?.images,
            ]}
            name={data?.params?.residence_info?.name}
          />
        )}
      </div>
    </>
  );
}

export default ResidenceImages;
