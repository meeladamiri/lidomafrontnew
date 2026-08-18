export const CommentsList_ActiveTab_KEYWORD = "CommentsList_ActiveTab";
export const CommentsList_PageN_KEYWORD = "CommentsList_PageN";

export const CommentsList_ClickedComment_Id_KEYWORD = "CommentsList_ClickedComment_Id";

export function applySessionStorageValues_comments_list({ commentId }: { commentId: number }) {
  sessionStorage.setItem(CommentsList_ClickedComment_Id_KEYWORD, commentId.toString());
}
