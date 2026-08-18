import Footer from "@/layouts/Footer";
import { LinkButton } from "components/General/core/Button";
import UnHappyMessage from "components/General/UnHappyMessage";

function NotFound404() {
  return (
    <>
      <div className="max-h-screen flex justify-between items-center pt-[100px] md:pt-120">
        <UnHappyMessage
          iconSrc="/assets/404.svg"
          title="متأسفانه صفحه مورد نظر یافت نشد !"
          actions={
            <div className="flex justify-center">
              <LinkButton href="/">بازگشت به صفحه اصلی</LinkButton>
            </div>
          }
        />
      </div>
      <Footer />
    </>
  );
}

export default NotFound404;
