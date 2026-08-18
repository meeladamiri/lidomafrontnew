import { useRef } from "react";

interface NewTooltipProps {
  children: React.ReactNode;
  tooltipText: string;
}

function NewTooltip({ children, tooltipText }: NewTooltipProps) {
  const tipRef = useRef<any>(null);

  function handleMouseEnter() {
    tipRef.current.style.opacity = 1;
    tipRef.current.style.marginLeft = "20px";
  }
  function handleMouseLeave() {
    tipRef.current.style.opacity = 0;
    tipRef.current.style.marginLeft = "10px";
  }
  return (
    <div
      className="relative flex items-center w-[210px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute whitespace-no-wrap bg-gradient-to-t from-black to-gray-700 text-white px-12 py-6 rounded flex items-center transition-all"
        style={{ bottom: "100%", opacity: 0 }}
        ref={tipRef}
      >
        <div
          className="bg-black h-10 w-10 absolute rounded-1"
          style={{ bottom: "-1px", transform: "rotate(45deg)" }}
        />
        <p className="text-12 leading-20 text-white font-r">{tooltipText}</p>
      </div>
      {children}
    </div>
  );
}

export default NewTooltip;
