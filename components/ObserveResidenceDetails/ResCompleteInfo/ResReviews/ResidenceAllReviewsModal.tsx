import ModalWrapper from "components/General/core/ModalWrapper";
import CommentCart from "components/Comments/CommentCart";
import CommentScoreItem from "components/Comments/CommentScoreItem";
import { Button } from "components/General/core/Button";
import { TextField } from "components/General/core/TextField";
import { IComment } from "components/Comments/utils";
import { renderPagination } from "@/utilities/Pagination";
import { useEffect, useState } from "react";
import OneStarRating from "@/components/General/Rating/OneStarRating";

const pageSize = 5;

function ResidenceAllReviewsModal({
  isModalOpen,
  handleClose,
  data,
  targetedReviewId,
}: {
  isModalOpen: boolean;
  handleClose: () => void;
  targetedReviewId: number;
  data: {
    averageRating: number;
    reviewsCount: number;
    scoreItems: {
      name: string;
      score: number;
    }[];
    comments: IComment[];
  };
}) {
  const [page, setPage] = useState<number>(1);

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (!!targetedReviewId) {
      const targetedReviewEl = document.querySelector(`#review-id-${targetedReviewId}`);
      targetedReviewEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [targetedReviewId]);

  return (
    <ModalWrapper
      headerTitle="مشاهده همه نظرات"
      onClose={() => {
        handleClose();
      }}
      open={isModalOpen}
    >
      <div className="flex items-center justify-center mb-12 px-20">
        <OneStarRating rating={data?.averageRating} />

        <div className="h-24 border-r-1 border-solid border-r-[rgba(28,52,84,0.26)] mr-16"></div>

        <p className="text-20 leading-36 text-black font-m pr-16">{data.reviewsCount} نظر</p>
      </div>

      <div className="">
        <TextField
          name="searchText"
          customValue={searchText}
          customOnChange={(value) => setSearchText(value)}
          fillFrom="rtl"
          placeholder="جستجوی نظرات"
          rightIcon={<i className="icon-Search text-24 text-black" />}
          wrapperClassname="!rounded-50 typical-gray-bg border-none !pr-16 !gap-x-8"
          inputClassname="typical-gray-bg"
        />
      </div>

      <div className="pb-16 border-b-1 border-solid border-b-[rgba(28,52,84,0.26)] mb-16 mt-12">
        {data.scoreItems.map((score, i) => {
          return (
            <div key={i} className="mb-12 last:mb-0">
              <CommentScoreItem name={score.name} score={Number(score.score.toFixed(1))} />
            </div>
          );
        })}
      </div>

      <div>
        {data.comments
          .slice(0, pageSize * page)
          .filter((comment) => comment.comment.includes(searchText))
          .map((comment: IComment, index: number) => {
            return (
              <div id={`review-id-${comment.commentId}`} key={index} className="mb-12 last:mb-0">
                <CommentCart
                  satisfaction={comment.satisfaction}
                  commentItself={comment.comment}
                  commentId={comment.commentId}
                  meanscore={comment.meanScore}
                  commentorName={comment.commentor}
                  hasSeeMoreDetailsBtn={false}
                  residenceCode={comment.residenceCode}
                  travelDate={comment.travelDate}
                />
              </div>
            );
          })}
      </div>

      {!!renderPagination(page, pageSize, data.comments.length) && (
        <Button
          variant="outlined"
          onClick={() => setPage((prev) => prev + 1)}
          className="mt-16"
          color="black"
          isFullWidth
        >
          مشاهده نظرات بیشتر
        </Button>
      )}
    </ModalWrapper>
  );
}

export default ResidenceAllReviewsModal;
