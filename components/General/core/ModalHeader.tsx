type TModalHeader = {
  headerTitle: string;
  hasGoBack?: boolean;
  onBackClick?: (...args: any[]) => void;
  leftEl?: JSX.Element;
  containerClassname?: string;
};

function ModalHeader({
  headerTitle,
  hasGoBack = true,
  onBackClick,
  leftEl,
  containerClassname,
}: TModalHeader) {
  return (
    <div
      className={`
        py-16 px-12 flex items-center justify-center relative bg-white
        ${containerClassname || ""}
      `}
    >
      <p className="text-18 font-m text-black leading-32">{headerTitle}</p>
      {/* back button */}
      {hasGoBack && (
        <div
          className="flex items-center right-12 md:right-auto md:left-12 absolute cursor-pointer"
          onClick={() => {
            if (!!onBackClick) {
              onBackClick();
            }
          }}
        >
          <i className="icon-Back text-26 md:hidden" />
          <i className="icon-Close text-26 hidden md:block" />
        </div>
      )}
      {!!leftEl && (
        <div className="flex items-center left-12 absolute cursor-pointer">{leftEl}</div>
      )}
    </div>
  );
}

export default ModalHeader;
