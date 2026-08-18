const InfoRow = ({
  icon,
  k,
  v,
  containerClassname,
}: {
  icon: JSX.Element;
  k: string;
  v: string;
  containerClassname?: string;
}) => {
  return (
    <div className={`flex items-center gap-x-10 ${containerClassname}`}>
      {icon}
      <div className="flex items-center gap-x-6">
        <span className="text-13 leading-16 text-black font-r">{k}</span>
        <span className="text-13 leading-16 text-black font-m">{v}</span>
      </div>
    </div>
  );
};

export default InfoRow;
