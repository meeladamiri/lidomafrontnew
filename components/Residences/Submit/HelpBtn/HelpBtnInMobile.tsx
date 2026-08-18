import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";

// NOTE: IT IS BETTER NOT TO USE THIS COMPONENT ALONE.
//       TO HAVE A 'HelpBtn' WHERE EVER NEEDED, USE <HelpBtn /> COMPONENT INSTEAD. (WHICH USES THIS COMPONENT INTERNALLY)

function HelpBtnInMobile({
  setShowHelpSidebar,
}: {
  setShowHelpSidebar: Dispatch<SetStateAction<boolean>>;
}) {
  const { query } = useRouter();

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #4E5D71 0%, #18273A 100%)",
      }}
      className={`
          w-40 h-40 flex items-center justify-center rounded-full cursor-pointer
          fixed left-20 z-1 ${
            query?.step === "1" || query?.step === "2" ? "bottom-10" : "bottom-72"
          }
        `}
      onClick={() => setShowHelpSidebar(true)}
    >
      <i className="icon-Information text-24 text-white" />
    </div>
  );
}

export default HelpBtnInMobile;
