import SquareSkeleton from "@/components/General/Skeletons/Square";

function ResImagesSkeleton() {
  return (
    <>
      <div className="h-[280px] md:hidden">
        <SquareSkeleton heightClass="h-[280px]" widthClass="w-full" borderRadiusClass="rounded-0" />
      </div>
      <div className="hidden md:block h-[420px] CustomContainer">
        <div className="w-full h-full grid grid-cols-2 gap-x-12">
          <SquareSkeleton
            heightClass="h-full"
            widthClass="col-span-1"
            borderRadiusClass="rounded-12"
          />

          <div className="col-span-1 grid grid-cols-2 gap-12 h-full">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SquareSkeleton
                key={idx}
                heightClass="h-full"
                widthClass="col-span-1"
                borderRadiusClass="rounded-12"
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default ResImagesSkeleton;
