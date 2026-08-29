import React, { useRef, useEffect } from "react";

function useOutsideAlerter(
  ref: any,
  handleClick: () => void,
  exceptionElementsRef: React.MutableRefObject<any>[]
) {
  useEffect(() => {
    function handleClickOutside(event: any) {
      const target = event.target as Node | null;

      // An element that removed itself in response to this very click was
      // inside when the click happened, and must not count as outside.
      //
      // This listener is on `document`, so it runs after React's handlers.
      // React flushes state updates for mousedown synchronously, so a list row
      // that closes its own dropdown is already detached by the time we get
      // here — and `contains` quite correctly reports false for a node that is
      // no longer in the tree.
      //
      // That is what broke picking a city from the header search box. The row
      // was clicked, `choose()` closed the dropdown, and this handler then read
      // the detached row as an outside click and closed the entire search box —
      // so the destination never made it to the date step. Confirmed on the
      // deployed page: at mousedown the target was LI[role=option] with
      // document.contains(target) === false.
      if (target && !document.contains(target)) return;

      if (
        exceptionElementsRef.some((exceptionElement) =>
          exceptionElement?.current?.contains(target)
        )
      )
        return;

      if (ref.current && !ref.current.contains(target)) {
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
