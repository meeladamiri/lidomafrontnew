function FastReserveBox({
  withoutText = false,
  smallText,
}: {
  withoutText?: boolean;
  smallText?: boolean;
}) {
  if (!!withoutText) {
    return (
      // you can make bg to be white
      <div className="w-24 h-24 rounded-full border-warning border-1 border-solid flex items-center justify-center">
        <i className="icon-Flash text-16 text-warning" />
      </div>
    );
  } else {
    return (
      <div className="pr-4 pl-12 py-4 flex items-center border-1 border-solid border-warning rounded-full bg-white gap-x-4">
        <i className="icon-Flash text-14 text-warning" />
        <span className="text-12 leading-16 text-black font-l">
          {!!smallText ? "آنی" : "رزرو آنی"}
        </span>
      </div>
    );
  }
}

export default FastReserveBox;
