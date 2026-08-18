import Divider from "@/components/General/Divider";
import SquareSkeleton from "@/components/General/Skeletons/Square";

export function WalletPageSkeleton() {
  return (
    <>
      <div className="mb-16 ">
        <SquareSkeleton
          widthClass="w-full"
          heightClass="h-[209px]"
          borderRadiusClass="rounded-12"
        />
      </div>

      <div className="mb-24 ">
        <div className="mb-12">
          <SquareSkeleton widthClass="w-full" borderRadiusClass="rounded-2" heightClass="h-28" />
        </div>

        <div className="mb-12">
          <SquareSkeleton widthClass="w-full" borderRadiusClass="rounded-2" heightClass="h-24" />
        </div>

        <div className="mb-12">
          <SquareSkeleton widthClass="w-full" borderRadiusClass="rounded-2" heightClass="h-24" />
        </div>
      </div>

      <div className=" mb-24">
        <div className="mb-12">
          <SquareSkeleton widthClass="w-full" heightClass="h-40" borderRadiusClass="rounded-6" />
        </div>
        <SquareSkeleton widthClass="w-full" heightClass="h-40" borderRadiusClass="rounded-6" />
      </div>

      <Divider />

      <div className="py-24 ">
        <SquareSkeleton
          widthClass="w-full"
          heightClass="h-28"
          borderRadiusClass="rounded-6"
          marginsClassnames="mb-16"
        />

        <SquareSkeleton
          widthClass="w-full"
          heightClass="h-50"
          borderRadiusClass="rounded-6"
          marginsClassnames="mb-12"
        />
        <SquareSkeleton
          widthClass="w-full"
          heightClass="h-50"
          borderRadiusClass="rounded-6"
          marginsClassnames="mb-12"
        />
        <SquareSkeleton
          widthClass="w-full"
          heightClass="h-50"
          borderRadiusClass="rounded-6"
          marginsClassnames="mb-12"
        />
        <SquareSkeleton widthClass="w-full" heightClass="h-50" borderRadiusClass="rounded-6" />
      </div>

      <Divider />

      <div className="py-24 ">
        <SquareSkeleton
          widthClass="w-full"
          heightClass="h-28"
          borderRadiusClass="rounded-6"
          marginsClassnames="mb-16"
        />

        <SquareSkeleton
          widthClass="w-full"
          heightClass="h-[118px]"
          borderRadiusClass="rounded-10"
          marginsClassnames="mb-12"
        />

        <SquareSkeleton
          widthClass="w-full"
          heightClass="h-[118px]"
          borderRadiusClass="rounded-10"
          marginsClassnames="mb-12"
        />

        <SquareSkeleton
          widthClass="w-full"
          heightClass="h-[118px]"
          borderRadiusClass="rounded-10"
          marginsClassnames="mb-12"
        />
      </div>
    </>
  );
}
