import { getCommentStatusIcon, TCommentStatus } from "@/components/Comments/utils";
import ResRate from "@/components/General/ResRate";
import { CommentsList_ClickedComment_Id_KEYWORD } from "@/constants/session_stores/comments_list";
import { IResidenceForReviews } from "@/interfaces/observe_residence";
import { Button } from "components/General/core/Button";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import classes from "styles/line-clamps.module.css";
import Link from "next/link";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";

function ReviewCart({
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
  onClickOfSeeMore,
  residence,
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
  onClickOfSeeMore?: () => void;
  residence?: IResidenceForReviews;
}) {
  const cartRef = useRef<any>();
  const textBoxRef = useRef<any>();
  const [showSeeMoreBtn, setShowSeeMoreBtn] = useState(false);

  useEffect(() => {
    const refToTextBoxEl = textBoxRef.current;

    const observer = new ResizeObserver((entries) => {
      //   console.log("entries are: ", entries);
      for (const entry of entries) {
        // Note: it works with tolerance of 5;
        if (entry.target.scrollHeight - entry.contentRect.height > 5) {
          // console.log("its more");
          setShowSeeMoreBtn(true);
        } else {
          setShowSeeMoreBtn(false);
        }
      }
    });

    observer.observe(refToTextBoxEl);

    return () => {
      observer.unobserve(refToTextBoxEl);
    };
  }, []);

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

  const res_property_page_link = getPropertyPageUrl({
    residenceId: residence?.id!,
  });

  return (
    <article
      ref={cartRef}
      className={`
          shrink-0
          p-14 border-1 border-solid border-gray-EDEDF2
          shadow-[0_2px_18px_0px_rgba(24,119,75,0.06)]
          rounded-12 h-full flex flex-col justify-between
          ${!!customWidthClassname ? customWidthClassname : "w-[300px]"}
      `}
    >
      <header>
        {/* header */}
        <div className="flex items-center gap-x-12 mb-16">
          <div className="rounded-full flex items-center justify-center shrink-0">
            <Image
              src={getCommentStatusIcon(satisfaction)}
              width={30}
              height={30}
              alt="وضعیت رضایت"
            />
          </div>
          <div className="grow">
            <div className="flex items-center justify-between gap-x-4 mb-10">
              <h3
                className={`text-13 leading-16 text-black w-[calc(100%-26px)] ${classes["line-clamp-1"]}`}
              >
                {commentorName}
              </h3>
              <ResRate average_rating={meanscore} reviews_count={0} />
            </div>
            {!!travelDate && (
              <time className="text-10 leading-14 text-gray-3D3D40 flex items-center gap-x-2">
                <span>تاریخ اقامت:</span>
                <span>{travelDate}</span>
              </time>
            )}
          </div>
        </div>

        <p
          ref={textBoxRef}
          className={`text-12 leading-20 text-black font-m ${classes["line-clamp-4"]}`}
        >
          {commentItself}
        </p>
      </header>
      {residence && (
        <div className="pt-12 mt-16 border-t border-gray-E9E9EC">
          <Link
            href={res_property_page_link}
            className="border border-gray-E9E9EC p-6 flex items-center gap-x-8 rounded-16 bg-white"
          >
            <div className="w-40 h-40 relative">
              <Image
                src={residence?.main_image!}
                fill
                style={{ objectFit: "cover", borderRadius: "8px" }}
                alt=""
              />
            </div>
            <div>
              <p className={`text-12 leading-16 font-r text-info ${classes["line-clamp-1"]}`}>
                {residence?.name}
              </p>
              <span className="text-11 leading-14 font-r text-gray-6C6A7D flex items-center mt-12">
                هر شب از :{" "}
                <p className="text-13 leading-16 font-m text-black">{residence?.min_price} تومان</p>
              </span>
            </div>
          </Link>
        </div>
      )}
      {!!showSeeMoreBtn && hasSeeMoreDetailsBtn && (
        <div className="mt-8 h-24">
          <Button
            variant="text"
            color="light-blue"
            className="!p-0"
            leftIcon={<i className="icon-FlashLeft text-info text-20" />}
            onClick={onClickOfSeeMore}
          >
            مشاهده بیشتر
          </Button>
        </div>
      )}
    </article>
  );
}

export default ReviewCart;
