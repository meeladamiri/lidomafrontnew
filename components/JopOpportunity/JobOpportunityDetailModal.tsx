import ModalWrapper from "components/General/core/ModalWrapper";
import JobContactInfo from "./JobContactInfo";

function JobOpportunityDetailModal({
  isModalOpen,
  handleClose,
  data,
}: {
  isModalOpen: boolean;
  handleClose: () => void;
  data: { title: string; longDescription: JSX.Element | string };
}) {
  return (
    <ModalWrapper
      headerTitle={data?.title}
      onClose={() => {
        handleClose();
      }}
      open={isModalOpen}
    >
      <p className="text-16 leading-20">{data?.longDescription}</p>
      <div className="mt-24">
        <JobContactInfo />
      </div>
    </ModalWrapper>
  );
}

export default JobOpportunityDetailModal;
