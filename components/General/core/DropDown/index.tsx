import React, { useRef, useState } from "react";
import OutsideClickHandler from "utilities/OutsideClickHandler";

export function DropDownItem({ children }: any) {
  return children;
}

// function DropDown({ children }: any) {
//   return (
//     <div>
//       {children.map((child: any) => {
//         return child;
//       })}
//     </div>
//   );
// }

function DropDown({
  children, // Any child being passed to DropDown must a 'value' prop.
  currntValue,
  onChange,
  dropDownItemsWrapperClassName,
  wrapperClassname,
}: {
  children: JSX.Element[];
  currntValue: number | string;
  onChange: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    value: string | number, // The 'value' parameter is the same as 'value prop' which is passed to each of Child components while invoking 'DropDown';
    allChildProps: any
  ) => void;
  dropDownItemsWrapperClassName?: string;
  wrapperClassname?: string;
}) {
  //   console.log("children", children);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const toggleArrowRef = useRef<any>();

  return (
    <div
      className={`
          border-1 border-solid border-[rgba(28,52,84,0.26)] rounded-tr-12 rounded-tl-12 relative
          ${
            isDropdownOpen
              ? "z-[60] border-b-none shadow-[0px_4px_15px_rgba(0,0,0,0.1)]"
              : "rounded-br-12 rounded-bl-12"
          }
          ${wrapperClassname}

        `}
    >
      {/* top */}
      <div
        className="relative pt-8 pl-8 pr-16"
        onClick={() => setIsDropdownOpen((pre) => !pre)}
        ref={toggleArrowRef}
      >
        {/* cart */}
        {children?.find((el) => el?.props?.value === currntValue)}

        {/* arrow */}
        <div className="absolute top-1/2 left-16 -translate-y-1/2 flex items-center">
          {!!isDropdownOpen ? (
            <i className="icon-FlashUp text-24 text-black" />
          ) : (
            <i className="icon-FlashDown text-24 text-black" />
          )}
        </div>
      </div>
      {/* list */}
      {!!isDropdownOpen && (
        <OutsideClickHandler
          handleClick={() => setIsDropdownOpen(false)}
          exceptionElementsRef={[toggleArrowRef]}
        >
          <div
            className={`
            absolute bg-white z-1
            rounded-br-12 rounded-bl-12 bottom-0 -right-1 -left-1 translate-y-full px-8
            ${
              isDropdownOpen
                ? "border-1 border-solid border-[rgba(28,52,84,0.26)] border-t-none shadow-[0px_4px_15px_rgba(0,0,0,0.1)]"
                : ""
            }
            ${dropDownItemsWrapperClassName || ""}
          `}
          >
            <div className="pt-16 pb-8 border-t-1 border-solid border-t-[rgba(28,52,84,0.26)] ">
              <div className="max-h-[300px] overflow-y-auto">
                {children?.map((child, index: number) => {
                  return (
                    <div key={index} className="mb-12 last:mb-0">
                      <div
                        onClick={(e) => {
                          const allChildProps = child?.props;
                          onChange(e, child?.props?.value, allChildProps);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {child}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </OutsideClickHandler>
      )}
    </div>
  );
}

export default DropDown;
