import ReviewsSlider from "../../ReviewsSlider";
import { Button } from "../../../General/core/Button";
import { IObserveResidenceData } from "@/interfaces/observe_residence";
import Divider from "../../../General/Divider";
import { getSatisfaction } from "components/Comments/utils";
import dynamic from "next/dynamic";
import { miladiToJalali } from "@/utilities/dateTools";
import { useState } from "react";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import OneStarRating from "@/components/General/Rating/OneStarRating";
const ResidenceAllReviewsModal = dynamic(() => import("./ResidenceAllReviewsModal"), {
  ssr: true,
});

function ResReviews() {
  const [showResidenceAllReviewsModal, setShowResidenceAllReviewsModal] = useState<{
    show: boolean;
    targetReviewId: number;
  }>({
    show: false,
    targetReviewId: 0,
  });
  const { data } = useGetObserveResidence();

  const resp: IObserveResidenceData = data?.params;

  const average_rating = resp?.residence_info?.average_rating;
  const reviews_count = resp?.residence_info?.reviews_count;
  const reviews = resp?.reviews;
  const location_rate = resp?.residence_info?.location_rate;
  const cleaning_rate = resp?.residence_info?.cleaning_rate;
  const quality_rate = resp?.residence_info?.quality_rate;
  const integrity_rate = resp?.residence_info?.integrity_rate;
  const greeting_rate = resp?.residence_info?.greeting_rate;
  const delivery_rate = resp?.residence_info?.delivery_rate;

  return (
    <>
      <section id="resReviews" className="pb-24">
        <header className="mb-16">
          <h2 className="text-16 leading-28 text-zilgara font-m mb-24">
            {`نظرات مسافران قبلی این ${data?.params?.residence_info?.residence_type}`}
          </h2>
          <p className="text-12 leading-14 text-gray-57585C font-r">
            فقط مهمانانی که این اقامتگاه را رزرو کرده اند امکان ثبت نظر دارند.
          </p>
        </header>
        <div className="flex items-center mb-24">
          <OneStarRating rating={average_rating} />
          <p className="text-15 leading-20 text-gray-3D3D40 font-r pr-12">
            {reviews_count} نظر ثبت شده
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-16 gap-y-20 mb-21">
          {[
            { name: "نظافت اقامتگاه", score: cleaning_rate || 0 },
            { name: "موقعیت مکانی", score: location_rate || 0 },
            { name: "نحوه تحویل", score: delivery_rate || 0 },
            { name: "کیفیت نسبت به نرخ", score: quality_rate || 0 },
            { name: "صحت اطلاعات", score: integrity_rate || 0 },
            { name: "برخورد میزبان", score: greeting_rate || 0 },
          ].map((item, _i) => (
            <div key={_i} className="col-span-1 flex items-center justify-between">
              <p className="text-12 leading-16 text-black font-r">{item.name}</p>

              <span className="flex items-center text-12 leading-16 font-r">
                <span className="text-black">5/</span>
                <span className="text-gray-3D3D40">{item?.score?.toFixed(1)}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="Make_swiper_slide_width_auto_height_auto">
          <ReviewsSlider
            reviews={reviews?.slice(0, 5)}
            setShowResidenceAllReviewsModal={setShowResidenceAllReviewsModal}
          />
        </div>

        {reviews?.length > 5 && (
          <footer>
            <Button
              onClick={() => setShowResidenceAllReviewsModal({ show: true, targetReviewId: 0 })}
              variant="outlined"
              color="grey"
              className="mt-24 md:w-[240px]"
            >
              مشاهده همه نظرات
            </Button>
          </footer>
        )}
      </section>

      <Divider className="mb-24" />

      {!!showResidenceAllReviewsModal.show && (
        <ResidenceAllReviewsModal
          isModalOpen={showResidenceAllReviewsModal.show}
          targetedReviewId={showResidenceAllReviewsModal.targetReviewId}
          handleClose={() => setShowResidenceAllReviewsModal({ show: false, targetReviewId: 0 })}
          data={{
            averageRating: average_rating || 0,
            reviewsCount: reviews_count || 0,
            scoreItems: [
              {
                name: "موقعیت مکانی",
                score: location_rate || 0,
              },
              {
                name: "نظافت اقامتگاه",
                score: cleaning_rate || 0,
              },
              {
                name: "کیفیت نسبت به نرخ",
                score: quality_rate || 0,
              },
              {
                name: "صحت مطالب",
                score: integrity_rate || 0,
              },
              {
                name: "برخورد میزبان",
                score: greeting_rate || 0,
              },
              {
                name: "نحوه تحویل",
                score: delivery_rate || 0,
              },
            ],
            comments:
              reviews?.map((review) => ({
                comment: review.comment,
                commentId: review.id,
                commentor: review.customer,
                meanScore: review.average_rating,
                residenceCode: review.residence_code,
                satisfaction: getSatisfaction(review.average_rating),
                travelDate: !!review.reserve_date
                  ? miladiToJalali(review.reserve_date)
                  : review.reserve_date,
              })) || [],
          }}
        />
      )}
    </>
  );
}

export default ResReviews;
