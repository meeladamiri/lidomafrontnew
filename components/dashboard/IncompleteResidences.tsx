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

        {/*
          "/residences/submit" with no productId starts a NEW draft. From a
          list of unfinished ones, "مشاهده همه" has to mean "show me
          the rest", not "make another".
        */}
        <LinkButton
          href="/residences/list"
          className="mt-16"
          isFullWidth
          variant="outlined"
          color="black"
        >
          مشاهده همه
        </LinkButton>
      </div>

      <Divider />
    </>
  );
}
export default IncompleteResidences;
