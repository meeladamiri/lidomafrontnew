interface IInfoTag {
  tagName: string;
  tagValue?: string;
  rounded?: boolean;
  wrapperClassnames?: string;
  tagNameClassnames?: string;
  tagValueClassnames?: string;
  editable?: boolean;
  onClick?: () => void;
}

function InfoTag({
  tagName,
  tagValue,
  rounded = false,
  wrapperClassnames,
  tagNameClassnames,
  tagValueClassnames,
  editable = false,
  onClick,
}: IInfoTag) {
  return (
    <div
      onClick={onClick}
      className={`rounded-6 cursor-pointer px-16 py-8 flex flex-nowrap items-center gap-x-6 bg-gray-F4F5F6 ${
        rounded ? "!rounded-100" : ""
      } ${wrapperClassnames || ""}`}
    >
      <div>
        <span className={`text-13 text-gray-616E7C font-m leading-16 ${tagNameClassnames || ""}`}>
          {tagName}
        </span>
        <span className={`text-13 text-gray-616E7C font-m leading-16 ${tagValueClassnames || ""}`}>
          {tagValue}
        </span>
      </div>
      {editable && <i className="icon-Edit text-20 text-black"></i>}
    </div>
  );
}

export default InfoTag;
