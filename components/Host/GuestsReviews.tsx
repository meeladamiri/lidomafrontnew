import PageTitle from "@/components/General/PageTitle";
import GuestReviewCart from "./GuestReviewCart";
import { I_MizbanAccountInfo_Data_review } from "@/api/Residences/getMizbanAccountInfo";
import { miladiToJalali } from "@/utilities/dateTools";
import ManuallySwippableSlider from "../General/Sliders/ManuallySwippableSlider";

const GuestsReviews = ({
  containerClassname = "",
  reviews,
  mizbanAvatar,
}: {
  containerClassname?: string;
  reviews: I_MizbanAccountInfo_Data_review[];
  mizbanAvatar?: string;
}) => {
  return (
    <>
      <div className="md:block hidden mt-40">
        <ManuallySwippableSlider
          showArrowsForNextAndPrevSlide={false}
          title="نظرات مهمانان‌: "
          data={reviews.map((review, i) => (
            <div className="w-[310px] shrink-0" key={i}>
              <GuestReviewCart
                customerName={review?.customer}
                travelDate={miladiToJalali(review?.reserve_date)}
                rating={review?.average_rating}
                resName={review?.residence?.name}
                resImage={review?.residence?.image_url}
                reviewText={review?.comment}
                replyText={review?.host_answer}
                mizbanAvatar={mizbanAvatar}
                displayType={review?.residence?.display_type}
                resId={review?.residence?.id}
              />
            </div>
          ))}
        />
      </div>
      <div className={`md:hidden block mt-24 ${containerClassname}`}>
        <PageTitle title={"نظرات مهمانان‌:"} asH1={false} containerClassname="mb-16" />

        {reviews?.map((review, idx) => (
          <div key={idx} className="mb-12 last:mb-0">
            <GuestReviewCart
              customerName={review?.customer}
              travelDate={miladiToJalali(review?.reserve_date)}
              rating={review?.average_rating}
              resName={review?.residence?.name}
              resImage={review?.residence?.image_url}
              reviewText={review?.comment}
              replyText={review?.host_answer}
              mizbanAvatar={mizbanAvatar}
              displayType={review?.residence?.display_type}
              resId={review?.residence?.id}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default GuestsReviews;
