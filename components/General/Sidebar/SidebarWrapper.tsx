import { useEffect, useState } from "react";

export type THandleSidebarClose = () => void;

function SidebarWrapper({
  isSidebarOpen,
  setIsSidebarOpen,
  content,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (state: boolean) => void;
  content: ({ handleSidebarClose }: { handleSidebarClose: THandleSidebarClose }) => JSX.Element;
}) {
  const [style, setStyle] = useState<{ transform: string }>({ transform: "translateX(100%)" });

  useEffect(() => {
    if (isSidebarOpen) {
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
  }, [isSidebarOpen]);

  useEffect(() => {
    if (isSidebarOpen) {
      setStyle({ transform: "translateX(0)" });
    } else {
      setStyle({ transform: "translateX(100%)" });
    }

    // return () => {
    //   setStyle({ transform: "translateY(100%)" });
    // };
  }, [isSidebarOpen]);

  function handleSideNavbarClose() {
    setStyle({ transform: "translateX(100%)" });
    setTimeout(() => {
      setIsSidebarOpen(false);
    }, 800); // should be the same value as in 'duration-[800ms]' className.
  }

  if (!isSidebarOpen) return null;

  return (
    <div
      className="fixed top-0 right-0 left-0 bottom-0 bg-[rgba(24,39,58,0.7)] z-10"
      onClick={handleSideNavbarClose}
    >
      <div
        className="w-[85%] max-w-[300px] bg-white h-full rounded-tl-20 rounded-bl-20 pt-16 pb-20 px-20 transition-all duration-[800ms] ease-in-out"
        style={{
          ...style,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {content({ handleSidebarClose: handleSideNavbarClose })}
      </div>
    </div>
  );
}

export default SidebarWrapper;
