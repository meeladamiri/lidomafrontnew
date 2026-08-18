function RangeDisplayItem({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-1 border-solid border-gray-EDEDF2 rounded-10 py-12 pr-12 pl-4 flex items-center gap-x-8">
      <span className="text-12 leading-21 font-r text-gray-616E7C">{k}</span>
      <span className="text-14 leading-24 font-m text-black">{v}</span>
    </div>
  );
}
export default RangeDisplayItem;
