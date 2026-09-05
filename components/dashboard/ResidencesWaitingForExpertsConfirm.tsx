import { LinkButton } from "components/General/core/Button";
import PageTitle from "components/General/PageTitle";
import { IncompleteResidencesType } from "components/dashboard/IncompleteResidenceCart";
import Divider from "components/General/Divider";
import { ResidencesList_ActiveTab_KEYWORD } from "@/constants/session_stores/residences_list";
import ResidenceWaitingForExpertsConfirmCart from "./ResidenceWaitingForExpertsConfirmCart";

function ResidencesWaitingForExpertsConfirm({
  residencesWaitingForExpertsConfirmData,
}: {
  residencesWaitingForExpertsConfirmData: IncompleteResidencesType[];
}) {
  if (residencesWaitingForExpertsConfirmData?.length === 0) return null;

  return (
    <>
      <div className="py-16">
        <PageTitle
          title="در انتظار تایید کارشناس"
          icon={<i className="icon-Home text-24" />}
          containerClassname="mb-16"
        />

        <div>
          {residencesWaitingForExpertsConfirmData?.map((r) => (
            <div key={r.residenceId} className="mb-12 last-of-type:mb-0">
              <ResidenceWaitingForExpertsConfirmCart
                title={r.title}
                updateDate={r.updateDate}
                completePercentage={r.completePercentage}
                residenceId={r.residenceId}
                link={r.link}
                residenceImage={r.residenceImage}
              />
            </div>
          ))}
        </div>

        <LinkButton
          href="/residences/list"
          className="mt-16"
          isFullWidth
          variant="outlined"
          color="black"
          onClick={() => {
            sessionStorage.setItem(ResidencesList_ActiveTab_KEYWORD, "all");
          }}
        >
          مشاهده همه
        </LinkButton>
      </div>

      <Divider />
    </>
  );
}
export default ResidencesWaitingForExpertsConfirm;
