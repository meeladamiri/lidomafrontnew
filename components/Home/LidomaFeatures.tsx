import { useMediaQuery } from "@/utilities/useMediaQuery";
import dynamic from "next/dynamic";

const LidomaFeaturesDesktop = dynamic(() => import("./LidomaFeaturesDesktop"), {
  ssr: true,
});
const LidomaFeaturesMobile = dynamic(() => import("./LidomaFeaturesMobile"), {
  ssr: true,
});

function LidomaFeatures() {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  return (
    <>
      {!!isDesktop && <LidomaFeaturesDesktop />}

      {!isDesktop && <LidomaFeaturesMobile />}
    </>
  );
}

export default LidomaFeatures;
