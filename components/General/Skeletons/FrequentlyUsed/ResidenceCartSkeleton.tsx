import SquareSkeleton from "../Square";

export function ResidenceCartSkeleton() {
  return (
    <div className="rounded-16">
      <div className="w-full h-[214px] relative rounded-tr-16 rounded-tl-16 border-1 border-solid border-[#1C345442] border-b-none">
        <SquareSkeleton
          widthClass="w-full"
          heightClass="h-full"
          borderRadiusClass="rounded-tr-16 rounded-tl-16"
        />
      </div>

      <div className="p-12 border-1 border-solid border-[#1C345442] border-t-none rounded-br-12 rounded-bl-12">
        <div className="grid grid-cols-12 gap-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="col-span-6" key={i}>
              <SquareSkeleton
                widthClass="w-full"
                heightClass="h-[40px]"
                borderRadiusClass="rounded-8"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
