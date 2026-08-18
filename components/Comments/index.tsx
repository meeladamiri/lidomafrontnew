import { Button } from "components/General/core/Button";
import Tabs from "components/General/core/Tabs";
import PageTitle from "components/General/PageTitle";
import UnHappyMessage from "components/General/UnHappyMessage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSatisfaction, IComment } from "components/Comments/utils";
import CommentCart from "./CommentCart";
import { useQuery } from "@tanstack/react-query";
import { getComments, IServerComment } from "api/Comment";
import { miladiToJalali } from "utilities/dateTools";
import { renderPagination } from "utilities/Pagination";
import {
  CommentsList_ActiveTab_KEYWORD,
  CommentsList_PageN_KEYWORD,
} from "@/constants/session_stores/comments_list";
import { TabsSkeleton } from "../General/Skeletons/FrequentlyUsed/TabsSkeleton";
import { CommentCardSkeleton } from "./Skeletons/CommentCardSkeleton";
import CommentDetailsModal from "./CommentDetailsModal";
import { useRouter } from "next/router";

const pageSize = 4;

function Comments() {
  const router = useRouter();
  const [page, setPage] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [showCommentDetailsModal, setShowCommentDetailsModal] = useState<{
    show: boolean;
    id: number;
  }>({ show: false, id: 0 });

  const [comments, setComments] = useState<IComment[]>([]);

  const { isLoading, data } = useQuery(["getComments"], () => getComments());

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        // console.log("In success of getComments, data is: ", data);
        setComments(
          data?.params?.reviews.map((item: IServerComment) => ({
            meanScore: item.average_rating,
            comment: item.comment,
            commentor: item.customer,
            isPending: !item.has_answer,
            travelDate: miladiToJalali(item.reserve_date),
            commentId: item.id,
            residenceCode: item.residence_code,
            satisfaction: getSatisfaction(item.average_rating),
          }))
        );
      }
    }
  }, [data]);

  const getTheListToRender = useCallback(() => {
    let data;

    if (activeTab === 0) {
      const list = comments.filter((el) => !!el.isPending);

      if (list.length === 0) {
        // TODO: text will be provided in figma.
        return "شما همه نظرات مسافران رو پاسخ دادین";
      } else {
        data = list;
      }
    } else {
      // activeTab === 1
      const list = comments.filter((el) => !el.isPending);

      if (list.length === 0) {
        // TODO: text will be provided in figma.
        return "نظری وجود ندارد.";
      } else {
        data = list;
      }
    }

    return data.slice(0, pageSize * (page as number));
  }, [activeTab, comments, page]);

  const list = getTheListToRender();

  // Preserving Tab-index
  useEffect(() => {
    if (!!activeTab || activeTab === 0) {
      sessionStorage.setItem(CommentsList_ActiveTab_KEYWORD, activeTab.toString());
    }
  }, [activeTab]);

  useEffect(() => {
    const commentsListActiveTab = sessionStorage.getItem(CommentsList_ActiveTab_KEYWORD);
    setActiveTab(!!commentsListActiveTab ? Number(commentsListActiveTab) : 0);
  }, []);
  // End of Preserving Tab-index

  // Preserving pageN
  useEffect(() => {
    if (!!page) {
      sessionStorage.setItem(CommentsList_PageN_KEYWORD, page.toString());
    }
  }, [page]);

  useEffect(() => {
    const commentsListPageN = sessionStorage.getItem(CommentsList_PageN_KEYWORD);
    setPage(!!commentsListPageN ? Number(commentsListPageN) : 1);
  }, []);
  // End of Preserving pageN

  useEffect(() => {
    if (!!router && !!router?.query && !!router?.query?.fc) {
      setShowCommentDetailsModal({ show: true, id: Number(router?.query?.fc as string) });
    }
  }, [router]);

  const pageIsNotReady: boolean = useMemo(() => {
    return isLoading || activeTab === null || page === null;
  }, [isLoading, activeTab, page]);

  return (
    <div className="pb-40">
      <PageTitle
        title="نظرات کاربران"
        icon={<i className="icon-Comments text-24" />}
        containerClassname="mb-24 "
      />

      {pageIsNotReady ? (
        <div className="">
          <div className="flex items-center justify-center mb-16">
            <div className="w-[65%]">
              <TabsSkeleton />
            </div>
          </div>

          {Array.from({ length: pageSize }).map((_, i) => (
            <div className="mb-12 last:mb-0" key={i}>
              <CommentCardSkeleton hasSeeMoreDetailsBtn />
            </div>
          ))}
        </div>
      ) : (
        <>
          {comments.length === 0 ? (
            <UnHappyMessage
              title="هنوز کسی نظر نداده !"
              // TODO:icon will be provided by figma.
              iconSrc={activeTab === 0 ? "/assets/No-comment.svg" : "/assets/No-comment.svg"}
              containerClassname="py-[92px]"
            />
          ) : (
            <div className="">
              <div className="w-[65%] mx-auto mb-24 md:w-full">
                <Tabs
                  activeIndex={activeTab as number}
                  onChange={(idx: number) => {
                    setActiveTab(idx);
                  }}
                  data={[
                    {
                      tabLabel: `در انتظار پاسخ`,
                      tabIndex: 0,
                    },
                    {
                      tabLabel: `نظرات قبل`,
                      tabIndex: 1,
                    },
                  ]}
                />
              </div>

              <div className="grid grid-cols-12 md:gap-x-16 gap-y-12 md:gap-y-16">
                {!Array.isArray(list) ? (
                  <div className="col-span-full">
                    <UnHappyMessage
                      title={list}
                      iconSrc="/assets/No-comment.svg"
                      containerClassname="py-[92px]"
                    />
                  </div>
                ) : (
                  list.map((comment: IComment, index: number) => {
                    return (
                      <div key={index} className="col-span-12 md:col-span-6">
                        <CommentCart
                          satisfaction={comment.satisfaction}
                          commentItself={comment.comment}
                          commentId={comment.commentId}
                          meanscore={comment.meanScore}
                          commentorName={comment.commentor}
                          hasSeeMoreDetailsBtn={true}
                          commentIsPending={comment.isPending}
                          residenceCode={comment.residenceCode}
                          travelDate={comment.travelDate}
                          setShowCommentDetailsModal={setShowCommentDetailsModal}
                        />
                      </div>
                    );
                  })
                )}
              </div>

              {!!page &&
                !!renderPagination(
                  page,
                  pageSize,
                  (activeTab === 0
                    ? comments.filter((el) => !!el.isPending)
                    : // activeTab === 1
                      comments.filter((el) => !el.isPending)
                  ).length
                ) && (
                  <div className="mt-24 md:w-[280px] md:mx-auto">
                    <Button
                      variant="outlined"
                      color="black"
                      isFullWidth
                      onClick={() => setPage((prev) => (prev as number) + 1)}
                      rightIcon={<i className="icon-Plus hidden md:block text-20 text-black" />}
                    >
                      مشاهده نظرات بیشتر
                    </Button>
                  </div>
                )}
            </div>
          )}
        </>
      )}

      {!!showCommentDetailsModal.show && (
        <CommentDetailsModal
          commentId={showCommentDetailsModal.id}
          showCommentDetailsModal={showCommentDetailsModal.show}
          setShowCommentDetailsModal={setShowCommentDetailsModal}
        />
      )}
    </div>
  );
}

export default Comments;
