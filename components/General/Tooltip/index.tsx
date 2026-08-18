import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

function Tooltip({
  x,
  y,
  wrapperClassname,
  textClassname,
  icon,
  text,
}: {
  x: number;
  y: number;
  wrapperClassname?: string;
  textClassname?: string;
  icon?: string;
  text: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, y]);

  const tooltipStyle = {
    position: "fixed",
    top: `${y}px`,
    left: `${x}px`,
    display: visible ? "flex" : "none",
  } as React.CSSProperties;
  return createPortal(
    <div
      style={tooltipStyle}
      className={`bg-white border z-20 border-gray-CACFD3 pt-6 pb-6 pr-8 pl-14 flex items-center gap-x-4 rounded-50 shadow-[0_8px_32px_0px_rgba(24,39,58,0.15)] ${
        wrapperClassname || ""
      }`}
    >
      {icon && <i className={`${icon} text-20 text-success`} />}
      <span className={`${textClassname} text-black text-13 leading-16 font-r`}>{text}</span>
    </div>,
    document.body
  );
}
export default Tooltip;
