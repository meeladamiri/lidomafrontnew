import CircleSkeleton from "@/components/General/Skeletons/Circle";
import SquareSkeleton from "@/components/General/Skeletons/Square";

export function CommentCardSkeleton({
  hasSeeMoreDetailsBtn = true,
}: {
  hasSeeMoreDetailsBtn?: boolean;
}) {
  return (
    <div
      className={`
        px-20 py-16 border-1 border-solid border-[rgba(28,52,84,0.26)]
        rounded-12
        w-full
    `}
    >
      {/* header */}
      <div className="flex items-center gap-x-12 pb-16 border-b-1 border-solid border-b-gray-300 mb-16">
        <div className="w-48 h-48 rounded-full flex items-center justify-center shrink-0 typical-gray-bg">
          <CircleSkeleton widthClass="w-full" heightClass="h-full" />
        </div>
        <div className="grow">
          <div className="text-16 leading-28 text-black mb-4">
            <SquareSkeleton
              widthClass="w-[120px]"
              heightClass="h-28"
              borderRadiusClass="rounded-2"
            />
          </div>
          <div className="flex items-center gap-x-8 flex-wrap justify-between">
            <div className="text-12 leading-21 text-black flex items-center gap-x-2">
              <SquareSkeleton
                widthClass="w-[80px]"
                heightClass="h-[21px]"
                borderRadiusClass="rounded-2"
              />
            </div>
            <div className="text-12 leading-17 text-black font-l flex items-center gap-x-2">
              <SquareSkeleton
                widthClass="w-[80px]"
                heightClass="h-[17px]"
                borderRadiusClass="rounded-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* comment itself */}
      <div className="text-14 leading-25 text-black font-r pb-16 border-b-1 border-dashed border-[rgba(28,46,69,0.6)]">
        <div className="mb-4">
          <SquareSkeleton
            widthClass="w-full"
            heightClass="h-[25px]"
            borderRadiusClass="rounded-2"
          />
        </div>
        <div className="mb-4">
          <SquareSkeleton
            widthClass="w-full"
            heightClass="h-[25px]"
            borderRadiusClass="rounded-2"
          />
        </div>
        <SquareSkeleton widthClass="w-[80%]" heightClass="h-[25px]" borderRadiusClass="rounded-2" />
      </div>

      {/* mean score */}
      <div className="flex items-center justify-between pt-16">
        <div className="text-14 leading-24 text-black">
          <SquareSkeleton
            widthClass="w-[100px]"
            heightClass="h-[24px]"
            borderRadiusClass="rounded-2"
          />
        </div>

        <div className="flex items-center gap-x-4">
          <SquareSkeleton
            widthClass="w-[80px]"
            heightClass="h-[24px]"
            borderRadiusClass="rounded-2"
          />
        </div>
      </div>

      {!!hasSeeMoreDetailsBtn && (
        <div className="border-t-1 border-dashed border-[rgba(28,46,69,0.6)] mt-16 pt-16">
          <SquareSkeleton
            widthClass="w-full"
            heightClass="h-[40px]"
            borderRadiusClass="rounded-6"
          />
        </div>
      )}
    </div>
  );
}
