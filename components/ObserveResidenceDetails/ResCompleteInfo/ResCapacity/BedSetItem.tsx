interface IBedSetItem {
  name: string;
  icon: string;
  desc: string;
}

export function BedSetItem({ name, icon = "icon-Rooms", desc }: IBedSetItem) {
  return (
    <div className="w-[200px] h-full shrink-0 border-1 border-solid border-gray-F0F0F0 rounded-10 p-12">
      <div className="flex items-center gap-x-6 mb-14">
        <i className={`icon-Rooms text-20 ${icon}`} />
        <p className="text-15 leading-20 text-black font-r">{name}</p>
      </div>

      <p className="text-13 leading-22 text-black font-l">{desc}</p>
    </div>
  );
}
