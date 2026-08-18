import {
  applySessionStorageValues_comments_list,
  CommentsList_ClickedComment_Id_KEYWORD,
} from "@/constants/session_stores/comments_list";
import { Button } from "components/General/core/Button";
import CustomRating from "components/General/Rating/CustomRating";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { getCommentStatusIcon, TCommentStatus } from "./utils";

function CommentCart({
  satisfaction,
  commentItself,
  commentId,
  meanscore,
  commentorName,
  customWidthClassname,
  hasSeeMoreDetailsBtn = true,
  residenceCode,
  travelDate,
  commentIsPending,
  setShowCommentDetailsModal,
}: {
  satisfaction: TCommentStatus;
  commentItself: string;
  commentId: number;
  meanscore: number;
  commentorName: string;
  customWidthClassname?: string;
  hasSeeMoreDetailsBtn?: boolean;
  residenceCode?: number | string;
  travelDate: string | null;
  commentIsPending?: boolean;
  setShowCommentDetailsModal?: Dispatch<
    SetStateAction<{
      show: boolean;
      id: number;
    }>
  >;
}) {
  const cartRef = useRef<any>();

  useEffect(() => {
    const persistedId = sessionStorage.getItem(CommentsList_ClickedComment_Id_KEYWORD);

    if (!!persistedId) {
      if (Number(persistedId) === commentId) {
        cartRef.current.scrollIntoView({ behavior: "smooth", block: "center" });

        sessionStorage.removeItem(CommentsList_ClickedComment_Id_KEYWORD);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={cartRef}
      className={`
        px-20 py-16 border-1 border-solid border-[rgba(28,52,84,0.26)]
        rounded-12
        ${!!customWidthClassname ? customWidthClassname : "w-full"}
    `}
    >
      {/* header */}
      <div className="flex items-center gap-x-12 pb-16 border-b-1 border-solid border-b-[rgba(28,46,69,0.6)] mb-16">
        <div className="w-48 h-48 rounded-full flex items-center justify-center shrink-0 typical-gray-bg">
          <Image
            src={getCommentStatusIcon(satisfaction)}
            width={30}
            height={30}
            alt="وضعیت رضایت"
            style={{
              maxWidth: "100%",
              height: "auto",
            }}
          />
        </div>
        <div className="grow">
          <p className="text-16 leading-28 text-black mb-4">{commentorName}</p>
          <div className="flex items-center gap-x-8 flex-wrap justify-between">
            <p className="text-12 leading-21 text-black flex items-center gap-x-2">
              <span>کد اقامتگاه :</span>
              <span>{residenceCode}</span>
            </p>
            {!!travelDate && (
              <p className="text-12 leading-17 text-black font-l flex items-center gap-x-2">
                <span>تاریخ سفر:</span>
                <span>{travelDate}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* comment itself */}
      <p className="text-14 leading-25 text-black font-r pb-16 border-b-1 border-dashed border-[rgba(28,46,69,0.6)]">
        {commentItself}
      </p>

      {/* mean score */}
      <div className="flex items-center justify-between pt-16">
        <p className="text-14 leading-24 text-black">میانگین امتیاز</p>

        <div className="flex items-center gap-x-4">
          <p className="text-14 leading-24 text-black">{`(${meanscore})`}</p>
          <CustomRating percentage={meanscore} width={13} height={12} />
        </div>
      </div>

      {!!hasSeeMoreDetailsBtn && (
        <div className="border-t-1 border-dashed border-[rgba(28,46,69,0.6)] mt-16 pt-16">
          <Button
            isFullWidth
            onClick={() => {
              applySessionStorageValues_comments_list({ commentId });
              if (!!setShowCommentDetailsModal) {
                setShowCommentDetailsModal({ show: true, id: commentId });
              }
            }}
          >
            {!!commentIsPending ? "مشاهده و پاسخ" : "مشاهده"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default CommentCart;
