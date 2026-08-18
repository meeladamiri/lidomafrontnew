import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useMediaQuery } from "@/utilities/useMediaQuery";
const Step0 = dynamic(() => import("components/Residences/Submit/Steps/Step_0"), { ssr: true });
const Step1 = dynamic(() => import("components/Residences/Submit/Steps/Step_1"), { ssr: true });
const Step2 = dynamic(() => import("components/Residences/Submit/Steps/Step_2"), { ssr: true });
const Step3 = dynamic(() => import("components/Residences/Submit/Steps/Step_3"), { ssr: true });
const Step4 = dynamic(() => import("components/Residences/Submit/Steps/Step_4"), { ssr: true });
const Step5 = dynamic(() => import("components/Residences/Submit/Steps/Step_5"), { ssr: true });
const Step6 = dynamic(() => import("components/Residences/Submit/Steps/Step_6"), { ssr: true });
const Step7 = dynamic(() => import("components/Residences/Submit/Steps/Step_7"), { ssr: true });
const Step8 = dynamic(() => import("components/Residences/Submit/Steps/Step_8"), { ssr: true });
const Step9 = dynamic(() => import("components/Residences/Submit/Steps/Step_9"), { ssr: true });
const Step10 = dynamic(() => import("components/Residences/Submit/Steps/Step_10"), { ssr: true });
const Step11 = dynamic(() => import("components/Residences/Submit/Steps/Step_11"), { ssr: true });
const Step12 = dynamic(() => import("components/Residences/Submit/Steps/Step_12"), { ssr: true });
const Step13 = dynamic(() => import("components/Residences/Submit/Steps/Step_13"), { ssr: true });
const Step14 = dynamic(() => import("components/Residences/Submit/Steps/Step_14"), { ssr: true });
const Header = dynamic(() => import("./Header/index"), {
  ssr: true,
});
const VerticalStepper = dynamic(() => import("./VerticalStepper"), {
  ssr: true,
});
const HelpBtn = dynamic(() => import("./HelpBtn/index"), {
  ssr: true,
});
const PageTitle = dynamic(() => import("@/components/General/PageTitle"), {
  ssr: true,
});

// NOTE: source of truth for both step and productId is router.query. Treat it like Redux-store.

function SubmitResidence() {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();

  const Step_Component = [
    Step0,
    Step1,
    Step2,
    Step3,
    Step4,
    Step5,
    Step6,
    Step7,
    Step8,
    Step9,
    Step10,
    Step11,
    Step12,
    Step13,
    Step14,
  ];

  const ComponentToRender = Step_Component[Number(router?.query?.step as string) || 0];

  return (
    <>
      <div className="md:hidden">{!isDesktop && <Header />}</div>

      <div className="hidden md:block md:mb-40">
        {!!isDesktop && (
          <PageTitle title="ثبت اقامتگاه" icon={<i className="icon-AddHome text-24" />} />
        )}
      </div>

      {!isDesktop && <HelpBtn />}

      <div className="relative pt-[66px] md:pt-0 flex items-start md:gap-x-24">
        <div
          className={`hidden sticky top-[82px] ${
            !router?.query?.step || router?.query?.step === "0"
              ? "md:hidden"
              : "md:block md:w-[148px] shrink-0"
          }`}
        >
          {!!isDesktop && !!router?.query?.step && router?.query?.step !== "0" && (
            <VerticalStepper />
          )}
        </div>
        <div className="w-full md:grow">
          <ComponentToRender />
        </div>
      </div>
    </>
  );
}

export default SubmitResidence;
