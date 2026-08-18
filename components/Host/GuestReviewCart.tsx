import { getCommentStatusIcon, getSatisfaction } from "@/components/Comments/utils";
import OneStarRating from "@/components/General/Rating/OneStarRating";
import { I_Residence_display_type } from "@/interfaces/Residences";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";
import Image from "next/image";
import Link from "next/link";

interface I_GuestReviewCart {
  customerName: string;
  travelDate: string;
  rating: number;
  resName: string;
  resImage: string;
  reviewText: string;
  replyText?: string;
  mizbanAvatar?: string;
  displayType: I_Residence_display_type;
  resId: number;
}

const GuestReviewCart = ({
  customerName,
  travelDate,
  rating,
  resName,
  resImage,
  reviewText,
  replyText,
  mizbanAvatar,
  displayType,
  resId,
}: I_GuestReviewCart) => {
  const res_property_page_link = getPropertyPageUrl({
    residenceId: resId,
  });

  return (
    <div className="p-12 border-1 border-solid border-gray-CACFD3 rounded-16 w-full h-[372px]">
      <div className="mb-16">
        <div className="flex items-center gap-x-12 mb-10">
          <div className={`p-8 rounded-full typical-gray-bg`}>
            <Image
              src={getCommentStatusIcon(getSatisfaction(rating))}
              width={24}
              height={24}
              alt="وضعیت رضایت"
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between mb-6">
              <p className="text-12 leading-16 font-m text-[#031526]">{customerName}</p>
              <OneStarRating
                rating={rating}
                ratingNumberClassname="!text-14 !leading-20 !font-r"
                containerClassname="!items-center"
              />
            </div>

            <p className="text-10 leading-14 font-l text-[#031526]">تاریخ سفر: {travelDate}</p>
          </div>
        </div>

        <div className="flex-row-reverse flex items-center gap-x-8 justify-end">
          <div>
            <p className="text-10 leading-14 font-r text-gray-959FA7 mb-6">اقامت در :</p>
            <Link
              href={res_property_page_link}
              className="text-12 leading-16 font-r text-blue-main"
            >
              {resName}
            </Link>
          </div>

          <Link href={res_property_page_link} className="w-40 h-40 relative">
            <Image src={resImage} fill style={{ objectFit: "cover", borderRadius: "8px" }} alt="" />
          </Link>
        </div>
      </div>

      <p className="text-14 leading-24 font-r text-[#031526]">{reviewText}</p>

      {!!replyText && (
        <div className="px-12 py-8 bg-blue-light mt-16 rounded-8">
          <div className="flex items-center gap-x-4 mb-12">
            <div className="w-24 h-24 relative">
              <Image
                src={mizbanAvatar || "/assets/default-profile.svg"}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-full"
                alt=""
              />
            </div>

            <p className="text-12 leading-16 font-r text-[#031526]">پاسخ میزبان</p>
          </div>

          <p className="text-14 leading-24 font-r text-[#031526]">{replyText}</p>
        </div>
      )}
    </div>
  );
};

export default GuestReviewCart;
