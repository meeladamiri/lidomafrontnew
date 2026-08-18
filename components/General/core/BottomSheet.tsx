import { useEffect, useState } from "react";

export type THandleSmoothClose = () => void;

interface IBottomSheet {
  headerTitle: string;
  body: // | ((cb: THandleSmoothClose) => JSX.Element)
  ({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => JSX.Element;
  open: boolean;
  handleClose: (...args: any[]) => void;
}

function BottomSheet({ headerTitle, body, open, handleClose }: IBottomSheet) {
  const [style, setStyle] = useState<{ transform: string }>({ transform: "translateY(100%)" });

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
      document.body.style.height = "100vh";
    } else {
      document.body.classList.remove("overflow-hidden");
      document.body.style.height = "";
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
      document.body.style.height = "";
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setStyle({ transform: "translateY(0)" });
    } else {
      setStyle({ transform: "translateY(100%)" });
    }

    // return () => {
    //   setStyle({ transform: "translateY(100%)" });
    // };
  }, [open]);

  function handleBottomSheetClose() {
    setStyle({ transform: "translateY(100%)" });
    setTimeout(() => {
      handleClose();
    }, 200); // should be the same value as in 'duration-200' className.
  }

  // function onTransitionEnd() {
  // if (!open) {
  //   handleClose();
  // }
  // }

  if (!open) return null;
  return (
    <>
      {open && (
        <div
          className="left-0 bottom-0 z-[19] fixed h-screen right-0 bg-[rgba(24,39,58,0.7)]"
          onClick={() => handleBottomSheetClose()}
        />
      )}
      <div
        style={{
          ...style,
        }}
        className={`
            fixed bottom-0 right-0 left-0
            md:max-w-[468px] md:mx-auto md:rounded-br-20 md:rounded-bl-20 md:bottom-1/2 md:!translate-y-1/2
            bg-white z-20 rounded-tr-20 rounded-tl-20
            transition-all duration-200 ease-in-out
        `}
        // onTransitionEnd={onTransitionEnd}
      >
        {/* header */}
        <div className="relative border-b-1 border-solid border-b-gray-F2F2F7 p-[17px] rounded-tr-20 rounded-tl-20">
          <div className="text-black text-16 leading-22 font-m pr-[7px]">
            {headerTitle}
          </div>
          <span
            className="absolute left-10 top-13 flex items-end cursor-pointer"
            onClick={handleBottomSheetClose}
          >
            <i className="icon-Close text-24" />
          </span>
        </div>
        {/* body */}
        <div className="py-16 px-20">{body({ handleSmoothClose: handleBottomSheetClose })}</div>
      </div>
    </>
  );
}

export default BottomSheet;
