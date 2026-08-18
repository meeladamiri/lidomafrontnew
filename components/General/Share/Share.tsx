function Share({
  onShareBtnClick,
  customIcon,
}: {
  onShareBtnClick: (event: any) => void; //TODO: Not sure about this type
  customIcon?: JSX.Element;
}) {
  // const [showShareBottomSheet, setShowShareBottomSheet] = useState(false);
  return (
    <>
      <div
        className="w-36 h-36 bg-white rounded-full flex items-center justify-center cursor-pointer"
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          onShareBtnClick(event);
        }}
      >
        {!!customIcon ? customIcon : <i className="icon-ShareFill text-20 text-black" />}
      </div>
    </>
  );
}
export default Share;
