import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { LinkButton } from "components/General/core/Button";
import Image from "next/image";

function ResidanceSubmissionBottomSheet({
  handleSmoothClose,
  residenceName,
  image,
  isSuccess,
  residenceCode,
  residenceId,
  rejectReason,
}: {
  handleSmoothClose: THandleSmoothClose;
  residenceName: string;
  image: string;
  isSuccess: boolean;
  residenceCode: number;
  residenceId: number;
  rejectReason?: string;
}) {
  return (
    <div>
      <div className="relative w-full h-[214px]">
        <Image
          src={image}
          alt="تصویر اقامتگاه"
          className="rounded-12"
          fill
          sizes="100vw"
          style={{
            objectFit: "cover"
          }} />
        <div
          className={`
            absolute top-12 right-12 py-2 px-12 text-12 leading-21 text-white font-r rounded-50
            ${!!isSuccess ? "bg-success" : "bg-error-light"}
          `}
        >
          {!!isSuccess ? "تأیید شده" : "رد شده"}
        </div>
      </div>

      <div className="mt-12 mb-24 text-14 leading-30 text-black font-r text-justify">
        {!!isSuccess ? (
          <p>
            اقامتگاه {residenceName} با کد {residenceCode} با موفقیت ثبت شد
          </p>
        ) : (
          <p>
            اقامتگاه {residenceName} با کد {residenceCode} به دلیل {rejectReason} توسط تیم
            لیدوماتریپ رد شد
          </p>
        )}
      </div>

      <LinkButton
        href={!!isSuccess ? `/residences/${residenceId}` : `/residences/${residenceId}/edit`}
        isFullWidth
        color="secondary"
      >
        {!!isSuccess ? "مشاهده صفحه اقامتگاه" : "ویرایش اقامتگاه"}
      </LinkButton>
    </div>
  );
}

export default ResidanceSubmissionBottomSheet;
