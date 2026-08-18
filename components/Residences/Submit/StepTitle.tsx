import { getAllowedValues } from "@/api/Residences/getAllowedValues";
import { Steps_Title } from "@/constants/Residences/Submit/Steps_Title";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
const HelpBtn = dynamic(() => import("./HelpBtn/index"), { ssr: true });

function StepTitle({ wrapperClassname }: { wrapperClassname?: string }) {
  const { query } = useRouter();
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  const { data } = useQuery(
    ["getAllowedValues", query?.step],
    () => getAllowedValues({ step: Number(query?.step as string) }),
    {
      enabled: !!query?.step,
    }
  );

  return (
    <div className={`flex items-start justify-between md:h-40 ${wrapperClassname || ""}`}>
      <span className="text-16 leading-28 text-black font-m">
        {Steps_Title[query?.step as string]}
      </span>

      {!!isDesktop && !!data?.params?.help_text && <HelpBtn />}
    </div>
  );
}

export default StepTitle;
