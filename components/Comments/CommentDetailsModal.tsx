import ModalWrapper from "components/General/core/ModalWrapper";
import CommentDetails from "./Details";
import { Dispatch, SetStateAction } from "react";
import { removeQueryParameters } from "@/utilities/URL/removeQueryParameters";
import { useRouter } from "next/router";

type TCommentDetailsModal = {
  setShowCommentDetailsModal: Dispatch<
    SetStateAction<{
      show: boolean;
      id: number;
    }>
  >;
  showCommentDetailsModal: boolean;
  commentId: number;
};

function CommentDetailsModal({
  setShowCommentDetailsModal,
  showCommentDetailsModal,
  commentId,
}: TCommentDetailsModal) {
  const router = useRouter();

  return (
    <ModalWrapper
      headerTitle={"مشاهده نظر"}
      onClose={() => {
        setShowCommentDetailsModal({ show: false, id: 0 });
        removeQueryParameters(router, [{ paramKey: "fc" }]);
      }}
      open={showCommentDetailsModal}
      modalClassname="md:!w-[568px] md:!max-h-[80%]"
    >
      <CommentDetails commentId={commentId} />
    </ModalWrapper>
  );
}
export default CommentDetailsModal;
