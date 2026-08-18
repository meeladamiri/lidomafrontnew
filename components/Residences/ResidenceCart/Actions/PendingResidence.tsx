import { LinkButton } from "components/General/core/Button";

function PendingResidence() {
  return (
    <LinkButton href={`tel:02191070021`} isFullWidth rightIcon={<i className="icon-Phone text-white text-24" />}>
      تماس با پشتیبانی
    </LinkButton>
  );
}
export default PendingResidence;
