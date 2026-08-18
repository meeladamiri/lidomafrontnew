import { IObserveResidenceData } from "interfaces/observe_residence";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { getSatisfaction } from "../Comments/utils";
import { miladiToJalali } from "@/utilities/dateTools";
import SwiperCore, { Navigation } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ReviewCart from "./ResCompleteInfo/ResReviews/ReviewCart";
import { Dispatch, SetStateAction } from "react";

// install Swiper modules
SwiperCore.use([Navigation]);

function ReviewsSlider({
  reviews,
  setShowResidenceAllReviewsModal,
  hasSeeMoreDetailsBtn,
}: {
  reviews: IObserveResidenceData["reviews"];
  setShowResidenceAllReviewsModal?: Dispatch<
    SetStateAction<{
      show: boolean;
      targetReviewId: number;
    }>
  >;
  hasSeeMoreDetailsBtn?: boolean;
}) {
  return (
    <Swiper
      slidesPerView={"auto"}
      freeMode={true}
      slideToClickedSlide={false}
      spaceBetween={12}
      mousewheel={true}
      pagination={false}
    >
      {reviews?.map((review, i) => {
        return (
          <SwiperSlide key={i}>
            <ReviewCart
              satisfaction={getSatisfaction(review.average_rating)}
              commentItself={review.comment}
              commentId={review.id || i}
              meanscore={review.average_rating}
              commentorName={review.customer}
              hasSeeMoreDetailsBtn={hasSeeMoreDetailsBtn}
              residenceCode={review?.residence_code}
              travelDate={!!review.reserve_date ? miladiToJalali(review.reserve_date) : null}
              onClickOfSeeMore={
                setShowResidenceAllReviewsModal
                  ? () => {
                      setShowResidenceAllReviewsModal({ show: true, targetReviewId: review.id });
                    }
                  : undefined
              }
              residence={review.residence}
            />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
export default ReviewsSlider;
