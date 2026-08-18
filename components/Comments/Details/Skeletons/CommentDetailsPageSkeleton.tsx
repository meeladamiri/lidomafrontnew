import CircleSkeleton from "@/components/General/Skeletons/Circle";
import SquareSkeleton from "@/components/General/Skeletons/Square";

export function CommentDetailsPageSkeleton() {
  return (
    <div className="">
      <div className="mb-16">
        <div className="w-full h-[214px] relative rounded-16">
          <SquareSkeleton
            widthClass="wi-full"
            heightClass="h-full"
            borderRadiusClass="rounded-16"
          />
        </div>
      </div>

      <div className="py-16 border-1 border-solid border-[rgba(28,52,84,0.26)] rounded-12 px-20">
        <div className="flex items-center gap-x-12 pb-16 border-b-1 border-solid border-b-gray-300 mb-16">
          <div className="w-48 h-48 rounded-full flex items-center justify-center shrink-0 typical-gray-bg">
            <CircleSkeleton widthClass="w-full" heightClass="h-full" />
          </div>
          <div>
            <div className="text-16 leading-28 text-black mb-4">
              <SquareSkeleton
                widthClass="w-[120px]"
                heightClass="h-28"
                borderRadiusClass="rounded-2"
              />
            </div>
            <div className="flex items-center gap-x-8 flex-wrap">
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

        <div className="mb-16 text-16 leading-25 text-black font-m">
          <SquareSkeleton
            widthClass="w-[120px]"
            heightClass="h-[25px]"
            borderRadiusClass="rounded-2"
          />
        </div>

        <div className="pb-16 text-14 leading-25 text-black font-r border-b-1 border-dashed border-[rgba(28,46,69,0.6)] mb-16">
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
          <SquareSkeleton
            widthClass="w-[80%]"
            heightClass="h-[25px]"
            borderRadiusClass="rounded-2"
          />
        </div>

        <div className="pb-16 border-b-1 border-dashed border-[rgba(28,46,69,0.6)] mb-16">
          <div className="flex items-center justify-between mb-12">
            <div className="text-14 leading-24 text-black font-r">
              <SquareSkeleton
                widthClass="w-[70px]"
                heightClass="h-[24px]"
                borderRadiusClass="rounded-2"
              />
            </div>
            <div className="flex gap-x-4">
              <SquareSkeleton
                widthClass="w-[80px]"
                heightClass="h-[24px]"
                borderRadiusClass="rounded-2"
              />
            </div>
          </div>

          <div>
            {Array.from({ length: 6 })?.map((score, i) => {
              return (
                <div key={i} className="mb-12 last:mb-0">
                  <div className="flex items-center justify-between">
                    <div className="text-14 leading-24 text-black font-r">
                      <SquareSkeleton
                        widthClass="w-[80px]"
                        heightClass="h-[21px]"
                        borderRadiusClass="rounded-2"
                      />
                    </div>
                    <div className="flex gap-x-4">
                      <SquareSkeleton
                        widthClass="w-[100px]"
                        heightClass="h-[21px]"
                        borderRadiusClass="rounded-2"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-8">
            <SquareSkeleton
              widthClass="w-[40px]"
              heightClass="h-[25px]"
              borderRadiusClass="rounded-2"
            />
          </div>

          <SquareSkeleton
            widthClass="w-full"
            heightClass="h-[116px]"
            borderRadiusClass="rounded-8"
          />
        </div>
      </div>
    </div>
  );
}
