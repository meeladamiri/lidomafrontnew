import SquareSkeleton from "../Square";

export function ReserveCartSkeleton() {
  return (
    <div className="rounded-12">
      <div className="w-full h-[214px] relative rounded-tr-12 rounded-tl-12 border-1 border-solid border-[#1C345442] border-b-none">
        <SquareSkeleton
          widthClass="w-full"
          heightClass="h-full"
          borderRadiusClass="rounded-tr-12 rounded-tl-12"
        />
      </div>

      <div className="p-12 border-1 border-solid border-[#1C345442] border-t-none rounded-br-12 rounded-bl-12">
        <div className="mb-12">
          <SquareSkeleton
            widthClass="w-full"
            heightClass="h-[28px]"
            borderRadiusClass="rounded-2"
          />
        </div>

        <div className="mb-16">
          <SquareSkeleton
            widthClass="w-full"
            heightClass="h-[24px]"
            borderRadiusClass="rounded-2"
          />
        </div>

        <SquareSkeleton widthClass="w-full" heightClass="h-[40px]" borderRadiusClass="rounded-6" />
      </div>
    </div>
  );
}
