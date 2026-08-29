import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import { useStepContent } from "./useWizard";

const HelpBtn = dynamic(() => import("./HelpBtn/index"), { ssr: true });

/**
 * The heading of a step.
 *
 * Title and description come from the panel now, with the constants the wizard
 * shipped with as the fallback — see useStepContent. The description is new:
 * the old wizard had a title and nothing else, so a step like "ظرفیت" could
 * not say what it counted.
 */
function StepTitle({ wrapperClassname }: { wrapperClassname?: string }) {
  const { query } = useRouter();
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const step = Number(query?.step as string) || 0;
  const { title, description, helpText } = useStepContent(step);

  return (
    <div className={wrapperClassname || ""}>
      <div className="flex items-start justify-between md:min-h-40">
        <h2 className="text-16 leading-28 text-black font-m">{title}</h2>
        {!!isDesktop && !!helpText && <HelpBtn />}
      </div>

      {!!description && (
        <p className="mt-6 text-13 leading-22 font-r text-gray-6C6A7D">{description}</p>
      )}
    </div>
  );
}

export default StepTitle;
