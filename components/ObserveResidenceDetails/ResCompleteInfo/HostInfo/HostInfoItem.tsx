interface I_HostInfoItem {
  className?: string;
  k: string;
  v: string;
  icon: JSX.Element;
}

function HostInfoItem({ className, k, v, icon }: I_HostInfoItem) {
  if (!v) return null;
  return (
    <li className={`flex items-center gap-x-4 ${className || ""}`}>
      <i className="icon-Dot text-13 text-black"></i>

      <p className="flex items-center gap-x-4">
        <span className="text-13 leading-16 text-black font-r">{k}</span>
        <span className="text-13 leading-16 text-black font-m">{v}</span>
      </p>
    </li>
  );
}

export default HostInfoItem;
