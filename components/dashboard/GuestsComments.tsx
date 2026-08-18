import { LinkButton } from "components/General/core/Button";
import Divider from "components/General/Divider";
import PageTitle from "components/General/PageTitle";
import Image from "next/image";

function GuestsComments({ pendingReviewsN }: { pendingReviewsN: number }) {
  if (!pendingReviewsN) return null;

  return (
    <>
      <div className="py-16">
        <PageTitle
          title="نظرات مهمانان"
          icon={
            <Image
              width={24}
              height={24}
              alt=""
              src={"/assets/non-icomoon-icons/comment2.svg"}
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />
          }
          containerClassname="mb-16"
        />

        <div className="flex items-center justify-between p-12 gap-x-6 rounded-10 border-1 border-solid border-gray-C4CAD3">
          <p className="text-14 leading-24 text-black">
            {pendingReviewsN} نظر در انتظار پاسخ شماست
          </p>
          <LinkButton href="/comments" color="secondary" className="!w-72 sm:!w-72">
            مشاهده
          </LinkButton>
        </div>
      </div>

      <Divider />
    </>
  );
}
export default GuestsComments;
