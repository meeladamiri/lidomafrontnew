import { LinkButton } from "@/components/General/core/Button";
import SidebarNavItem from "./SidebarNavItem";
import { THandleSidebarClose } from "@/components/General/Sidebar/SidebarWrapper";
import Image from "next/image";

function NonAuthenticatedUserSideNavbarContent({
  handleSideNavbarClose,
}: {
  handleSideNavbarClose: THandleSidebarClose;
}) {
  return (
    <div>
      <p className="text-black text-14 leading-20 font-m mb-8">ورود / ثبت نام</p>

      <p className="text-14 leading-24 text-black font-l mb-12">
        برای دسترسی به امکانات بیشتر برای جستجو و رزرو اقامتگاه در لیدوما{" "}
        <span className="font-r ">وارد شوید</span> یا <span className="font-r">ثبت نام</span> کنید.
      </p>

      <div className="flex justify-center pb-24 border-b-1 border-solid border-b-gray-CACFD3 mb-24">
        <LinkButton
          href="/auth/enter_phone"
          onClick={() => {
            handleSideNavbarClose();
          }}
        >
          ورود / ثبت نام
        </LinkButton>
      </div>

      <div>
        <SidebarNavItem
          link="/residences/submit"
          icon={<i className="icon-AddHome text-24" />}
          name={"ثبت اقامتگاه"}
          badge={null}
          handleSideNavbarClose={handleSideNavbarClose}
        />

        <SidebarNavItem
          link={`/support`}
          icon={<i className="icon-OnlineContact text-24" />}
          name={"پشتیبانی"}
          badge={null}
          handleSideNavbarClose={handleSideNavbarClose}
        />

        <SidebarNavItem
          link={`/public-faqs`}
          icon={<Image src="/assets/non-icomoon-icons/faq.svg" width={24} height={24} alt="" />}
          name={"سوالات متداول"}
          badge={null}
          handleSideNavbarClose={handleSideNavbarClose}
        />

        <SidebarNavItem
          link={`/about`}
          icon={
            <Image src="/assets/non-icomoon-icons/logo-icon.svg" width={24} height={24} alt="" />
          }
          name={"درباره ما"}
          badge={null}
          handleSideNavbarClose={handleSideNavbarClose}
        />
      </div>
    </div>
  );
}

export default NonAuthenticatedUserSideNavbarContent;
