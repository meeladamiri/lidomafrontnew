import dynamic from "next/dynamic";

const HomePageBannerSkeleton = dynamic(() => import("./Skeletons/HomePageBannerSkeleton"), {
  ssr: true,
});
const HomePageBanner = dynamic(() => import("./Banner"), {
  ssr: true,
});

function HomePageBannerComp({
  loaderCondition,
  link,
  mobile_image,
  pc_image,
}: {
  loaderCondition: boolean;
  mobile_image?: string;
  pc_image?: string;
  link?: string;
}) {
  if (loaderCondition) {
    return (
      <section className="mb-24 md:mb-40 CustomContainer">
        <HomePageBannerSkeleton />
      </section>
    );
  } else {
    if (!!link && !!mobile_image && !!pc_image) {
      return (
        <section className="mb-24 md:mb-40">
          <HomePageBanner linkTo={link} mobile_image={mobile_image} pc_image={pc_image} />
        </section>
      );
    } else {
      return null;
    }
  }
}

export default HomePageBannerComp;
