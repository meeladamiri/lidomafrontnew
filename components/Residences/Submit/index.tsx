import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import { STEP_LOADERS } from "./stepLoaders";
import { usePrefetchNextStep } from "./useWizard";

// Built from the same list the prefetcher walks, so a step can never be
// registered in one place and forgotten in the other.
const STEPS = STEP_LOADERS.map((load) => dynamic(load, { ssr: true }));

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
  const step = Number(router?.query?.step as string) || 0;

  // The next step's chunk downloads while the host is still on this one.
  usePrefetchNextStep(step);

  const ComponentToRender = STEPS[step] ?? STEPS[0];

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
