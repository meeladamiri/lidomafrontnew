// import dynamic from "next/dynamic";
import LastSectionDesktop from "./LastSectionDesktop";
// import LastSectionMobile from "./LastSectionMobile";

// const LastSectionDesktop = dynamic(() => import("./LastSectionDesktop"), {
//   ssr: true,
// });
// const LastSectionMobile = dynamic(() => import("./LastSectionMobile"), {
//   ssr: true,
// });

function FooterLastSection() {
  return (
    <>
      {/* <div className=""> */}
        <LastSectionDesktop />
      {/* </div> */}

      {/* <div className="md:hidden">
        <LastSectionMobile />
      </div> */}
    </>
  );
}
export default FooterLastSection;
