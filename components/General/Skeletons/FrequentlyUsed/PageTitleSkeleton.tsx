import SquareSkeleton from "@/components/General/Skeletons/Square";

export function PageTitleSkeleton({
  withoutIcon = false,
  marginClassname,
}: {
  withoutIcon?: boolean;
  marginClassname?: string;
}) {
  return (
    <div className={`flex items-center gap-x-8 ${marginClassname || ""}`}>
      {!!withoutIcon && (
        <SquareSkeleton widthClass="w-24" heightClass="h-[28px]" borderRadiusClass="rounded-2" />
      )}
      <SquareSkeleton widthClass="w-[140px]" heightClass="h-[28px]" borderRadiusClass="rounded-2" />
    </div>
  );
}
