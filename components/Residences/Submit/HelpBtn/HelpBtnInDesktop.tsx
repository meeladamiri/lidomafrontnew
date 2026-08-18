import { Button } from "@/components/General/core/Button";
import { Dispatch, SetStateAction } from "react";

// NOTE: IT IS BETTER NOT TO USE THIS COMPONENT ALONE.
//       TO HAVE A 'HelpBtn' WHERE EVER NEEDED, USE <HelpBtn /> COMPONENT INSTEAD. (WHICH USES THIS COMPONENT INTERNALLY)

function HelpBtnInDesktop({
  setShowHelpSidebar,
}: {
  setShowHelpSidebar: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Button
      color="light-blue"
      variant="contained"
      onClick={() => {
        setShowHelpSidebar(true);
      }}
    >
      راهنما
    </Button>
  );
}

export default HelpBtnInDesktop;
