import PageTitle from "components/General/PageTitle";
import PendingRequest, { IPendingRequest } from "components/dashboard/PendingRequest";
import { Button } from "components/General/core/Button";
import Divider from "components/General/Divider";

const howManyToShow = 5;

function PendingRequests({ data }: { data: IPendingRequest[] }) {
  if (!data || !data.length) return null;

  return (
    <>
      <div className="pb-16">
        <PageTitle
          title="درخواست های در انتظار پاسخ"
          icon={<i className="icon-Reserve text-24" />}
          containerClassname="mb-16"
        />

        {data.slice(0, howManyToShow).map((pr: IPendingRequest, i: number) => (
          <PendingRequest
            key={i}
            title={pr.title}
            from={pr.from}
            to={pr.to}
            reserveId={pr.reserveId}
            image={pr.image}
            expiry_date={pr.expiry_date}
          />
        ))}

        {data.length > howManyToShow && (
          <Button className="mt-16" isFullWidth variant="outlined" color="black">
            مشاهده نتایج بیشتر
          </Button>
        )}
      </div>

      <Divider />
    </>
  );
}

export default PendingRequests;
