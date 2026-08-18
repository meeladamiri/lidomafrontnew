import { LinkButton } from "components/General/core/Button";
import PageTitle from "components/General/PageTitle";
import IncompleteResidenceCart, {
  IncompleteResidencesType,
} from "components/dashboard/IncompleteResidenceCart";
import Divider from "components/General/Divider";

function IncompleteResidences({
  incompleteResidencesData,
}: {
  incompleteResidencesData: IncompleteResidencesType[];
}) {
  if (incompleteResidencesData?.length === 0) return null;

  return (
    <>
      <div className="py-16">
        <PageTitle
          title="اقامتگاه های خود را تکمیل کنید"
          icon={<i className="icon-Home text-24" />}
          containerClassname="mb-16"
        />

        <div>
          {incompleteResidencesData?.map((r) => (
            <div key={r.residenceId} className="mb-12 last-of-type:mb-0">
              <IncompleteResidenceCart
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
          href="/residences/submit?step=0"
          className="mt-16"
          isFullWidth
          variant="outlined"
          color="black"
        >
          مشاهده نتایج بیشتر
        </LinkButton>
      </div>

      <Divider />
    </>
  );
}
export default IncompleteResidences;
