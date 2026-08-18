import dynamic from "next/dynamic";
import { useRouter } from "next/router";
const IntroStepHeader = dynamic(() => import("./IntroStepHeader"), { ssr: true });
const MainStepsHeader = dynamic(() => import("./MainStepsHeader"), { ssr: true });

function SubmitResidencePageHeader() {
  const { query } = useRouter();

  return !query?.step || query?.step === "0" ? <IntroStepHeader /> : <MainStepsHeader />;
}

export default SubmitResidencePageHeader;
