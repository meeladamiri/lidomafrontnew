export function InfoItem({ name, icon }: { name: string; icon: string }): JSX.Element {
  return (
    <div className="col-span-2 flex gap-x-10 items-center py-11 pl-24">
      <i className={`text-24 text-gray-2D2D2F ${icon}`} />
      <p className="text-14 leading-18 text-gray-2D2D2F font-r">{name}</p>
    </div>
  );
}
