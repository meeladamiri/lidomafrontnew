import { LinkButton } from "components/General/core/Button";

function IncompleteProfileItem({ name }: { name: string }) {
  return (
    <div className="rounded-10 bg-black p-12 flex items-center justify-between gap-x-6 mb-16 last-of-type:mb-0">
      <p className="text-14 leading-24 text-white">{name}</p>
      <LinkButton
        variant="contained"
        color="secondary"
        href="/profile"
        className="!text-14 !leading-24 !text-black !font-m !w-72 sm:!w-72"
      >
        ویرایش
      </LinkButton>
    </div>
  );
}
export default IncompleteProfileItem;
