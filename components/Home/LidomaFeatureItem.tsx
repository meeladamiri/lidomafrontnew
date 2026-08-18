function LidomaFeatureItem({
  icon,
  title,
  description,
}: {
  icon: JSX.Element;
  title: string;
  description: string;
}) {
  return (
    <div className="col-span-4">
      <div className="w-full flex items-center gap-x-12 p-12 border-1 border-solid border-gray-CACFD3 rounded-12">
        <div className="shrink-0 w-56 h-56 rounded-full flex items-center justify-center">
          {icon}
        </div>

        <div className="flex flex-col gap-y-8">
          <p className="text-14 leading-20 font-m text-black">{title}</p>
          <p className="text-12 leading-16 font-l text-black">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default LidomaFeatureItem;
