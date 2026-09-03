import Image from "next/image";
import { getBlurHash } from "@/utilities/getBlurHash";
import { useEffect, useMemo, useState } from "react";
import { getCommentStatusIcon, getSatisfaction } from "components/Comments/utils";
import { Textarea } from "components/General/core/Textarea";
import { Button } from "components/General/core/Button";
import CustomRating from "components/General/Rating/CustomRating";
import Link from "next/link";
import CommentScoreItem from "../CommentScoreItem";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getComment, replyToComment } from "api/Comment";
import { miladiToJalali } from "utilities/dateTools";
import exception from "utilities/exception";
import { EXCEPTIONTYPES } from "constants/enums/exception_types";
import { CommentDetailsPageSkeleton } from "./Skeletons/CommentDetailsPageSkeleton";
import { I_Residence_display_type } from "@/interfaces/Residences";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";
import { removeQueryParameters } from "@/utilities/URL/removeQueryParameters";
import { useRouter } from "next/router";

interface ICommentInfo {
  comment: string;
  customer: string;
  host_answer?: string;
  display_type: I_Residence_display_type;
  id: number;
  rates: {
    average: number;
    cleaning: number;
    delivery: number;
    greeting: number;
    integrity: number;
    location: number;
    quality: number;
  };
  reserve_date: string;
  residence_code: string;
  residence_image: string;
  residence_name: string;
}

function CommentDetails({ commentId }: { commentId: number }) {
  const router = useRouter();
  const [commentInfo, setCommentInfo] = useState<ICommentInfo>();
  const [scoreItems, setScoreItems] = useState<{ name: string; score: number }[]>();
  const [meanScore, setMeanScore] = useState<number>(0);
  const [hostAnswer, setHostAnswer] = useState<string>("");

  const { data, isLoading, refetch } = useQuery(
    ["getComment", commentId],
    () => getComment(commentId),
    {
      enabled: !!commentId,
    }
  );

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        const review = data?.params?.review as ICommentInfo;

        setCommentInfo(review);
        setScoreItems([
          {
            name: "موقعیت مکانی",
            score: review?.rates?.location,
          },
          {
            name: "نظافت اقامتگاه",
            score: review?.rates?.cleaning,
          },
          {
            name: "کیفیت نسبت به نرخ",
            score: review?.rates?.quality,
          },
          {
            name: "صحت مطالب",
            score: review?.rates?.integrity,
          },
          {
            name: "برخورد میزبان",
            score: review?.rates?.greeting,
          },
          {
            name: "نحوه تحویل",
            score: review?.rates?.delivery,
          },
        ]);

        // calculating the mean score
        const allScores = Object.values(review?.rates);
        const sum = allScores.reduce((a, v) => a + v, 0);
        setMeanScore(Number((sum / allScores?.length)?.toFixed(1)));
      }
    }
  }, [data]);

  const replyToCommentMutation = useMutation(
    () => {
      // console.log("While calling replyToCommentMutation, hostAnswer is: ", hostAnswer);
      return replyToComment({ commentId: commentId.toString(), replyText: hostAnswer });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          removeQueryParameters(router, [{ paramKey: "fc" }]);

          setHostAnswer("");
          refetch();

          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "پاسخ شما با موفقیت ثبت شد." },
          ]);
        } else {
          exception.message([
            {
              type: EXCEPTIONTYPES.ERROR,
              title: "مشکلی در ثبت پاسخ رخ داد. لطفا مجددا تلاش کنید.",
            },
          ]);
        }
      },
    }
  );

  const pageIsNotReady: boolean = useMemo(() => {
    return isLoading || !commentInfo;
  }, [isLoading, commentInfo]);

  return (
    <div className="relative">
      {pageIsNotReady ? (
        <CommentDetailsPageSkeleton />
      ) : (
        <div className="">
          <div className="mb-16">
            <div className="w-full h-[214px] p-12 relative rounded-16">
              <Image
                src={commentInfo?.residence_image as string}
                fill
                style={{
                  objectFit: "cover",
                }}
                alt="" // TODO
                className="rounded-16"
                placeholder="blur"
                blurDataURL={getBlurHash(commentInfo?.residence_image)}
              />

              <div className="flex flex-col justify-between h-full">
                <div className="z-1">
                  <div className="flex items-center justify-end">
                    <Link
                      passHref
                      prefetch={false}
                      href={getPropertyPageUrl({
                        residenceId: Number(commentInfo?.residence_code.split("-")[1]),
                      })}
                      className="p-5 pl-12 text-white flex items-center gap-x-5 bg-black rounded-50 bg-opacity-80 cursor-pointer"
                    >
                      <i className="icon-See text-18" />
                      <span className="text-12 leading-21">مشاهده</span>
                    </Link>
                  </div>
                </div>

                <div className="z-2">
                  <div className="flex items-center justify-between gap-x-8">
                    <div className="text-14 leading-24 text-white OnlyOneLineAndEndWithElipsis">
                      {commentInfo?.residence_name}
                    </div>
                    <div className="shrink-0 flex justify-end">
                      <p className="rounded-50 bg-white text-12 leading-21 text-black whitespace-nowrap px-12 py-2 flex items-center justify-center w-fit-content">
                        کد اقامتگاه : {commentInfo?.residence_code}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* that faded black layer on image  */}
              <div
                className="h-[107px] absolute w-full bottom-0 right-0 rounded-br-16 rounded-bl-16"
                style={{
                  background:
                    "linear-gradient(0deg, #000000 7%, rgba(0, 0, 0, 0.52) 49.82%, rgba(0, 0, 0, 0.0001) 80.84%)",
                }}
              />
            </div>
          </div>

          <div className="py-16 border-1 border-solid border-[rgba(28,52,84,0.26)] rounded-12 px-20">
            <div className="flex items-center gap-x-12 pb-16 border-b-1 border-solid border-b-[rgba(28,46,69,0.6)] mb-16">
              <div className="w-48 h-48 rounded-full flex items-center justify-center shrink-0 typical-gray-bg">
                <Image
                  src={getCommentStatusIcon(getSatisfaction(meanScore))}
                  width={30}
                  height={30}
                  alt="وضعیت رضایت"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
              </div>
              <div>
                <p className="text-16 leading-28 text-black mb-4">{commentInfo?.customer}</p>
                <div className="flex items-center gap-x-8 flex-wrap">
                  <p className="text-12 leading-17 text-black font-l flex items-center gap-x-2">
                    <span>تاریخ سفر:</span>
                    <span>{miladiToJalali(commentInfo?.reserve_date as string)}</span>
                  </p>
                </div>
              </div>
            </div>

            <p className="mb-16 text-16 leading-25 text-black font-m">نظر و امتیاز مهمان :</p>

            <p className="pb-16 text-14 leading-25 text-black font-r border-b-1 border-dashed border-[rgba(28,46,69,0.6)] mb-16">
              {commentInfo?.comment}
            </p>

            <div className="pb-16 border-b-1 border-dashed border-[rgba(28,46,69,0.6)] mb-16">
              <div className="flex items-center justify-between mb-12">
                <p className="text-14 leading-24 text-black font-r">میانگین امتیاز</p>
                <div className="flex gap-x-4">
                  <span className="text-14 leading-24 text-black font-r">{`(${meanScore})`}</span>

                  <CustomRating percentage={meanScore} width={13} height={12} />
                </div>
              </div>

              <div>
                {scoreItems?.map((score, i) => {
                  return (
                    <div key={i} className="mb-12 last:mb-0">
                      <CommentScoreItem name={score.name} score={score.score} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <Textarea
                name="answer"
                label="پاسخ شما"
                // formik={formik}
                placeholder="لطفا توجه فرمایید که پاسخ شما توسط بازدیدکنندگان بعدی مشاهده می‌شود و عصبانیت یا متانت و صبوری شما در متن پاسخ، بر رزروهای بعدی شما تاثیرگذار خواهد بود."
                readonly={!!commentInfo?.host_answer}
                customValue={commentInfo?.host_answer || hostAnswer}
                //   maxCharsN={11}
                //   fillFrom="ltr"
                labelClassname="mb-8 !text-16 !leading-25 !text-black !font-m"
                rows={4}
                textareaClassnames="border-none typical-gray-bg"
                customOnChange={(value) => setHostAnswer(value)}
              />

              {!commentInfo?.host_answer && (
                <>
                  <p className="mb-16 mt-8 text-8 leading-14 text-black font-l">
                    به منظور حفظ حریم خصوصی کاربران، لطفا از ذکر نام فامیل ایشان اجتناب کنید.
                  </p>
                  <Button
                    disabled={!hostAnswer}
                    isFullWidth
                    onClick={() => replyToCommentMutation.mutate()}
                  >
                    ثبت پاسخ
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentDetails;
