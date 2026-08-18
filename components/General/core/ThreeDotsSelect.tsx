import Image from "next/image";
import { useRef, useState } from "react";
import OutsideClickHandler from "utilities/OutsideClickHandler";

function ThreeDotsSelect({
  data,
}: {
  data: {
    icon?: JSX.Element;
    text: string | JSX.Element;
    onclick: () => void;
  }[];
}) {
  const [isThreeDotsSelectOpen, setIsThreeDotsSelectOpen] = useState<boolean>(false);

  const threeDotsRef = useRef<any>();

  return (
    <div className="relative">
      <div
        ref={threeDotsRef}
        className="w-24 h-24 rounded-full bg-white flex items-center justify-center cursor-pointer"
        onClick={() => setIsThreeDotsSelectOpen((prev) => !prev)}
      >
        <Image
          src={"/assets/dots-vertical.svg"}
          height={16}
          width={16}
          alt=""
          style={{
            maxWidth: "100%",
            height: "auto"
          }} />
      </div>

      {!!isThreeDotsSelectOpen && (
        <OutsideClickHandler
          handleClick={() => setIsThreeDotsSelectOpen(false)}
          exceptionElementsRef={[threeDotsRef]}
        >
          <div className="p-12 rounded-12 bg-white absolute top-28 right-0 z-3 w-max">
            {data.map((item, i) => {
              return (
                <div
                  key={i}
                  className="flex items-center gap-x-4 pl-16 pb-8 last:pb-0 mb-8 last:mb-0 border-b-1 border-solid border-b-[rgba(28,52,84,0.26)] last:border-b-none cursor-pointer"
                  onClick={() => item.onclick()}
                >
                  {!!item.icon && <div className="flex items-center">{item.icon}</div>}

                  <p className="text-14 leading-24 text-black font-r">{item.text}</p>
                </div>
              );
            })}
          </div>
        </OutsideClickHandler>
      )}
    </div>
  );
}

export default ThreeDotsSelect;
