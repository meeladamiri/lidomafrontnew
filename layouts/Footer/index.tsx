import FooterDownloadSection from "./DownloadSection";
import FooterLastSection from "./LastSection";
import FooterTopSection from "./TopSection";

function Footer({ className }: { className?: string }) {
  return (
    <footer className={`w-full bg-gray-F5F5F7 mt-36 ${className || ""}`}>
      <div className="CustomContainer">
        <div className="py-24 md:py-40">
          {/* top section */}
          <FooterTopSection />

          {/* Download section */}
          <FooterDownloadSection />

          {/* last section */}
          <FooterLastSection />
        </div>
      </div>
    </footer>
  );
}
export default Footer;
