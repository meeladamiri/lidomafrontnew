import MainHeader from "@/layouts/Header";
import dynamic from "next/dynamic";
import { useState } from "react";
const SideNavbar = dynamic(() => import("@/layouts/SideNavbar/index"), {
  ssr: true,
});

function IntroStepHeader() {
  const [isSideNavbarOpen, setIsSideNavbarOpen] = useState<boolean>(false);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 bg-white z-5">
        <MainHeader setIsSideNavbarOpen={setIsSideNavbarOpen} />
      </header>
      {!!isSideNavbarOpen && (
        <SideNavbar isSideNavbarOpen={isSideNavbarOpen} setIsSideNavbarOpen={setIsSideNavbarOpen} />
      )}
    </>
  );
}

export default IntroStepHeader;
