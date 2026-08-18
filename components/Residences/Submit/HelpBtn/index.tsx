import { useMediaQuery } from "@/utilities/useMediaQuery";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import dynamic from "next/dynamic";
import { THandleSidebarClose } from "@/components/General/Sidebar/SidebarWrapper";
import { getAllowedValues } from "@/api/Residences/getAllowedValues";
const HelpBtnInMobile = dynamic(() => import("./HelpBtnInMobile"), { ssr: true });
const HelpBtnInDesktop = dynamic(() => import("./HelpBtnInDesktop"), { ssr: true });
const SidebarWrapper = dynamic(() => import("@/components/General/Sidebar/SidebarWrapper"), {
  ssr: true,
});
const HelpSidebarContent = dynamic(
  () => import("@/components/Residences/Submit/HelpBtn/HelpSidebarContent"),
  {
    ssr: true,
  }
);

function HelpBtn() {
  const { query } = useRouter();
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const [showHelpSidebar, setShowHelpSidebar] = useState<boolean>(false);

  const { isLoading, data } = useQuery(["getAllowedValues", query?.step], () =>
    getAllowedValues({ step: Number(query?.step as string) })
  );

  if (isLoading) return null;

  if (!data?.params?.help_text) return null;

  if (!isDesktop && (query?.step === "8" || query?.step === "14")) return null;

  return (
    <>
      {!!isDesktop ? (
        <div className="hidden md:block">
          <HelpBtnInDesktop setShowHelpSidebar={setShowHelpSidebar} />
        </div>
      ) : (
        <div className="md:hidden">
          <HelpBtnInMobile setShowHelpSidebar={setShowHelpSidebar} />
        </div>
      )}

      {!!showHelpSidebar && (
        <SidebarWrapper
          isSidebarOpen={showHelpSidebar}
          setIsSidebarOpen={setShowHelpSidebar}
          content={({ handleSidebarClose }: { handleSidebarClose: THandleSidebarClose }) => (
            <HelpSidebarContent handleSidebarClose={handleSidebarClose} />
          )}
        />
      )}
    </>
  );
}

export default HelpBtn;
