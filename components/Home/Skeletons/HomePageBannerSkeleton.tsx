import SquareSkeleton from "@/components/General/Skeletons/Square";

function HomePageBannerSkeleton() {
  return (
    <div className=" relative h-[200px] md:h-[280px]">
      <SquareSkeleton
        widthClass="w-full"
        heightClass="h-full"
        borderRadiusClass="rounded-12 md:rounded-16"
      />
    </div>
  );
}
export default HomePageBannerSkeleton;
