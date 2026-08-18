import CloseBtn from "../CloseBtn";

export function SidebarCommonHeader({
  onClose,
  headerText,
}: {
  onClose: () => void;
  headerText: string;
}) {
  return (
    <div className="flex items-center justify-between pb-12 mb-16 border-b-1 border-solid border-b-[rgba(28,52,84,0.26)]">
      <p className="text-18 leading-32 text-black font-m">{headerText}</p>

      <CloseBtn onClose={onClose} />
    </div>
  );
}
