import React, { useRef, useEffect } from "react";

function useOutsideAlerter(
  ref: any,
  handleClick: () => void,
  exceptionElementsRef: React.MutableRefObject<any>[]
) {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        exceptionElementsRef.some((exceptionElement) =>
          exceptionElement.current.contains(event.target)
        )
      )
        return;

      if (ref.current && !ref.current.contains(event.target)) {
        handleClick();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}

function OutsideClickHandler({ children, handleClick, exceptionElementsRef = [] }: any) {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, handleClick, exceptionElementsRef);

  return <div ref={wrapperRef}>{children}</div>;
}

export default OutsideClickHandler;
